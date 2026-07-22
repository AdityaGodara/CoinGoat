import enum
from datetime import timedelta
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.article import Article
from app.models.article_source import ArticleSource
from app.models.news_source import NewsSource
from app.schemas.article import NormalizedArticle
from app.services.slug_generator import SlugGenerator, next_slug_candidate, slugify_title

_TRACKING_PARAM_PREFIXES = ("utm_", "ref", "fbclid", "gclid", "mc_")

FUZZY_MATCH_WINDOW = timedelta(hours=48)

_STOPWORDS = {"the", "a", "an", "of", "to", "in", "on", "for", "and", "is", "at"}

_MAX_SLUG_ATTEMPTS = 10


class IngestOutcome(enum.Enum):
    CREATED = "created"
    UPDATED = "updated"
    ATTACHED_AS_SOURCE = "attached_as_source"


def normalize_url(url: str) -> str:
    """Strip tracking params, force https, drop a leading www., strip the
    trailing slash — used as the dedup-canonical form of an article link."""
    parts = urlsplit(url.strip())
    netloc = parts.netloc.lower().removeprefix("www.")
    path = parts.path.rstrip("/") or "/"
    query_pairs = sorted(
        (key, value)
        for key, value in parse_qsl(parts.query, keep_blank_values=True)
        if not any(key.lower().startswith(prefix) for prefix in _TRACKING_PARAM_PREFIXES)
    )
    return urlunsplit(("https", netloc, path, urlencode(query_pairs), ""))


def _title_tokens(title: str) -> set[str]:
    return {word for word in title.lower().split() if word.isalnum() and word not in _STOPWORDS}


def titles_match(a: str, b: str, *, threshold: float = 0.8) -> bool:
    tokens_a, tokens_b = _title_tokens(a), _title_tokens(b)
    if not tokens_a or not tokens_b:
        return a.strip().lower() == b.strip().lower()
    overlap = len(tokens_a & tokens_b) / len(tokens_a | tokens_b)
    return overlap >= threshold


def is_richer(candidate: str | None, existing: str | None) -> bool:
    if not existing:
        return bool(candidate)
    if not candidate:
        return False
    return len(candidate) > len(existing)


class DeduplicationService:
    """Implements the dedup priority chain: exact (news_source, guid) match,
    then canonical/normalized URL, then a conservative fuzzy-title match
    within a tight time window, else create a new Article. Never overwrites
    richer content with poorer content."""

    def __init__(self, session: Session):
        self._session = session
        self._slugs = SlugGenerator(session)

    def ingest(self, normalized: NormalizedArticle, source: NewsSource) -> tuple[Article, IngestOutcome]:
        existing_source_row = self._session.execute(
            select(ArticleSource).where(
                ArticleSource.news_source_id == source.id,
                ArticleSource.external_guid == normalized.external_guid,
            )
        ).scalar_one_or_none()
        if existing_source_row is not None:
            return self._update_existing(existing_source_row, normalized), IngestOutcome.UPDATED

        article = self._session.execute(
            select(Article).where(Article.canonical_url == normalized.canonical_url)
        ).scalar_one_or_none()

        if article is None:
            window_start = normalized.published_at - FUZZY_MATCH_WINDOW
            window_end = normalized.published_at + FUZZY_MATCH_WINDOW
            candidates = (
                self._session.execute(
                    select(Article).where(Article.published_at.between(window_start, window_end))
                )
                .scalars()
                .all()
            )
            article = next((c for c in candidates if titles_match(c.title, normalized.title)), None)

        if article is not None:
            self._attach_source(article, normalized, source)
            return article, IngestOutcome.ATTACHED_AS_SOURCE

        return self._create_new(normalized, source), IngestOutcome.CREATED

    def _update_existing(self, source_row: ArticleSource, normalized: NormalizedArticle) -> Article:
        source_row.original_url = normalized.original_url
        source_row.raw_payload = normalized.raw_payload
        article = self._session.get(Article, source_row.article_id)
        if is_richer(normalized.content, article.content):
            article.content = normalized.content
            article.summary = normalized.summary or article.summary
            article.image_url = normalized.image_url or article.image_url
        return article

    def _attach_source(self, article: Article, normalized: NormalizedArticle, source: NewsSource) -> None:
        self._session.add(
            ArticleSource(
                article_id=article.id,
                news_source_id=source.id,
                external_guid=normalized.external_guid,
                original_url=normalized.original_url,
                raw_payload=normalized.raw_payload,
            )
        )
        if is_richer(normalized.content, article.content):
            article.content = normalized.content

    def _create_new(self, normalized: NormalizedArticle, source: NewsSource) -> Article:
        slug = self._slugs.generate(normalized.title)
        attempt = 1
        article: Article | None = None
        while True:
            savepoint = self._session.begin_nested()
            try:
                article = Article(
                    slug=slug,
                    title=normalized.title,
                    summary=normalized.summary,
                    content=normalized.content,
                    author=normalized.author,
                    category=normalized.category,
                    image_url=normalized.image_url,
                    canonical_url=normalized.canonical_url,
                    published_at=normalized.published_at,
                )
                self._session.add(article)
                self._session.flush()
                savepoint.commit()
                break
            except IntegrityError:
                savepoint.rollback()
                attempt += 1
                if attempt > _MAX_SLUG_ATTEMPTS:
                    raise
                slug = next_slug_candidate(slugify_title(normalized.title), attempt)

        self._session.add(
            ArticleSource(
                article_id=article.id,
                news_source_id=source.id,
                external_guid=normalized.external_guid,
                original_url=normalized.original_url,
                raw_payload=normalized.raw_payload,
            )
        )
        return article
