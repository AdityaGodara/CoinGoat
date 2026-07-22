import logging
from datetime import datetime, timezone

from app.schemas.article import NormalizedArticle

logger = logging.getLogger(__name__)


def _extract_image_url(entry) -> str | None:
    media_content = getattr(entry, "media_content", None) or []
    for media in media_content:
        url = media.get("url") if hasattr(media, "get") else None
        if url:
            return url

    for link in getattr(entry, "links", None) or []:
        rel = link.get("rel") if hasattr(link, "get") else None
        link_type = link.get("type") if hasattr(link, "get") else None
        if rel == "enclosure" and link_type and link_type.startswith("image/"):
            return link.get("href")

    return None


def _extract_content_html(entry) -> str | None:
    content = getattr(entry, "content", None)
    if not content:
        return None
    try:
        return content[0].value
    except (AttributeError, IndexError, TypeError):
        return None


def _extract_categories(entry) -> list[str]:
    tags = getattr(entry, "tags", None) or []
    categories = []
    for tag in tags:
        term = getattr(tag, "term", None)
        if term:
            categories.append(term)
    return categories


def _extract_published_at(entry, guid: str) -> datetime:
    parsed = getattr(entry, "published_parsed", None)
    if parsed:
        try:
            return datetime(*parsed[:6], tzinfo=timezone.utc)
        except (TypeError, ValueError):
            logger.warning("normalize_entry: unparseable published_parsed for guid=%s", guid)
    else:
        logger.warning("normalize_entry: missing published date for guid=%s, using fetch time", guid)
    return datetime.now(timezone.utc)


def normalize_entry(entry, *, source: str = "coindesk") -> NormalizedArticle | None:
    """Map one feedparser entry onto our schema. Never raises — a single
    malformed item is logged and skipped (returns None) rather than
    crashing the whole ingestion tick."""

    guid = getattr(entry, "id", None) or getattr(entry, "link", None)
    if not guid:
        logger.warning("normalize_entry: dropping entry with neither guid nor link: %r", entry)
        return None

    link = getattr(entry, "link", None) or guid
    title = (getattr(entry, "title", "") or "").strip() or "(untitled)"
    summary = getattr(entry, "summary", None)
    author = getattr(entry, "author", None)
    categories = _extract_categories(entry)
    content_html = _extract_content_html(entry)
    image_url = _extract_image_url(entry)
    published_at = _extract_published_at(entry, guid)

    return NormalizedArticle(
        guid=guid,
        link=link,
        source=source,
        title=title,
        summary=summary,
        content_html=content_html,
        author=author,
        categories=categories,
        image_url=image_url,
        published_at=published_at,
        raw_payload={
            "guid": guid,
            "link": link,
            "source": source,
            "title": title,
            "summary": summary,
            "author": author,
            "categories": categories,
            "image_url": image_url,
            "published_at": published_at.isoformat(),
        },
    )
