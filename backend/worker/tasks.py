import json
import logging

import feedparser
import redis
from sqlalchemy import func, select
from sqlalchemy.dialects.postgresql import insert

from app.core.cache_keys import article_key, latest_list_key
from app.core.config import settings
from app.db.session import SyncSessionLocal
from app.models.article import Article
from app.schemas.article import ArticleListOut, ArticleOut
from worker.celery_app import celery_app
from worker.feed_client import FeedFetchError, fetch_feed_bytes
from worker.locking import try_lock
from worker.normalize import normalize_entry

logger = logging.getLogger(__name__)

FETCH_LOCK_NAME = "lock:fetch:coindesk"
SOURCE = "coindesk"

_UPSERT_COLUMNS = [
    "link",
    "title",
    "summary",
    "content_html",
    "author",
    "categories",
    "image_url",
    "published_at",
    "raw_payload",
]


def _upsert_articles(session, normalized: list) -> list[int]:
    rows = [n.model_dump() for n in normalized]
    stmt = insert(Article.__table__).values(rows)
    update_cols = {col: getattr(stmt.excluded, col) for col in _UPSERT_COLUMNS}
    update_cols["updated_at"] = func.now()
    stmt = stmt.on_conflict_do_update(index_elements=["guid"], set_=update_cols).returning(Article.id)
    result = session.execute(stmt)
    return [row[0] for row in result.fetchall()]


def _warm_cache(redis_client: "redis.Redis", session, upserted_ids: list) -> None:
    if not upserted_ids:
        return

    articles = session.execute(select(Article).where(Article.id.in_(upserted_ids))).scalars().all()
    pipe = redis_client.pipeline()
    for article in articles:
        payload = ArticleOut.model_validate(article).model_dump(mode="json")
        pipe.set(article_key(article.id), json.dumps(payload), ex=settings.article_cache_ttl_seconds)

    limit = settings.latest_list_default_limit
    latest = (
        session.execute(
            select(Article)
            .where(Article.source == SOURCE)
            .order_by(Article.published_at.desc())
            .limit(limit)
        )
        .scalars()
        .all()
    )
    total = session.execute(
        select(func.count()).select_from(Article).where(Article.source == SOURCE)
    ).scalar_one()

    listing = ArticleListOut(
        items=[ArticleOut.model_validate(a) for a in latest],
        total=total,
        limit=limit,
        offset=0,
    )
    pipe.set(
        latest_list_key(SOURCE, limit),
        listing.model_dump_json(),
        ex=settings.latest_list_cache_ttl_seconds,
    )
    pipe.execute()


@celery_app.task(name="worker.tasks.fetch_coindesk_feed")
def fetch_coindesk_feed() -> None:
    redis_client = redis.Redis.from_url(settings.redis_url, decode_responses=True)

    with try_lock(redis_client, FETCH_LOCK_NAME, settings.fetch_lock_ttl_seconds) as acquired:
        if not acquired:
            logger.info("fetch_coindesk_feed: skipped, previous run still in progress")
            return

        try:
            raw = fetch_feed_bytes(settings.coindesk_rss_url, settings.feed_fetch_timeout_seconds)
        except FeedFetchError as exc:
            logger.warning("fetch_coindesk_feed: fetch failed, will retry on next tick: %s", exc)
            return

        parsed = feedparser.parse(raw)
        if parsed.bozo:
            logger.warning("fetch_coindesk_feed: feed reported malformed (bozo), attempting best-effort parse")

        normalized = [n for n in (normalize_entry(e, source=SOURCE) for e in parsed.entries) if n is not None]
        if not normalized:
            logger.warning("fetch_coindesk_feed: zero usable entries this tick")
            return

        with SyncSessionLocal() as session:
            upserted_ids = _upsert_articles(session, normalized)
            session.commit()
            _warm_cache(redis_client, session, upserted_ids)

        logger.info(
            "fetch_coindesk_feed: processed %d/%d entries",
            len(normalized),
            len(parsed.entries),
        )
