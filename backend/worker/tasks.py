import logging
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass

import feedparser
import httpx
import redis

from app.core.config import settings
from app.db.session import SyncSessionLocal
from app.models.news_source import NewsSource
from app.repositories.news_source_repository import NewsSourceRepository
from app.services.cache_refresh import CacheRefreshService
from app.services.deduplication import DeduplicationService, IngestOutcome
from worker.celery_app import celery_app
from worker.feed_client import FeedFetchError, fetch_feed_bytes
from worker.locking import try_lock
from worker.normalize import normalize_entry

logger = logging.getLogger(__name__)


@dataclass
class FetchResult:
    acquired: bool
    raw: bytes | None


def _lock_name(source: NewsSource) -> str:
    return f"lock:fetch:{source.id}"


def _fetch_source(client: httpx.Client, redis_client: "redis.Redis", source: NewsSource) -> FetchResult:
    with try_lock(redis_client, _lock_name(source), settings.fetch_lock_ttl_seconds) as acquired:
        if not acquired:
            return FetchResult(acquired=False, raw=None)
        try:
            raw = fetch_feed_bytes(client, source.rss_url, settings.feed_fetch_timeout_seconds)
            return FetchResult(acquired=True, raw=raw)
        except FeedFetchError as exc:
            logger.warning("ingest_due_sources: fetch failed for %s: %s", source.name, exc)
            return FetchResult(acquired=True, raw=None)


@celery_app.task(name="worker.tasks.ingest_due_sources")
def ingest_due_sources() -> None:
    redis_client = redis.Redis.from_url(settings.redis_url, decode_responses=True)

    with SyncSessionLocal() as session:
        source_repo = NewsSourceRepository(session)
        due_sources = source_repo.get_due()
        if not due_sources:
            logger.info("ingest_due_sources: no sources due this tick")
            return

        # --- Concurrent I/O phase: httpx.Client + redis locks only. The
        # SQLAlchemy Session is never touched by worker threads — all DB
        # work happens single-threaded below, after every future resolves.
        results: dict = {}
        with httpx.Client() as client, ThreadPoolExecutor(max_workers=settings.ingestion_thread_pool_size) as pool:
            futures = {pool.submit(_fetch_source, client, redis_client, source): source for source in due_sources}
            for future in as_completed(futures):
                source = futures[future]
                try:
                    results[source.id] = future.result()
                except Exception:
                    logger.exception("ingest_due_sources: unexpected error fetching %s", source.name)
                    results[source.id] = FetchResult(acquired=False, raw=None)

        # --- Sequential processing phase: one shared session/transaction
        # for the whole tick.
        dedup = DeduplicationService(session)
        touched_categories: set[str] = set()
        any_touched = False

        for source in due_sources:
            result = results.get(source.id)
            if result is None or not result.acquired:
                logger.info("ingest_due_sources: %s skipped, previous run still in progress", source.name)
                continue

            started_at = time.monotonic()
            inserted = updated = attached_as_source = parse_failures = entries_seen = 0
            fetch_failed = result.raw is None

            try:
                if not fetch_failed:
                    parsed = feedparser.parse(result.raw)
                    if parsed.bozo:
                        logger.warning("ingest_due_sources: %s feed reported malformed (bozo)", source.name)
                    entries_seen = len(parsed.entries)
                    for entry in parsed.entries:
                        normalized = normalize_entry(entry, source=source.name)
                        if normalized is None:
                            parse_failures += 1
                            continue
                        article, outcome = dedup.ingest(normalized, source)
                        touched_categories.add(article.category)
                        any_touched = True
                        if outcome is IngestOutcome.CREATED:
                            inserted += 1
                        elif outcome is IngestOutcome.UPDATED:
                            updated += 1
                        else:
                            attached_as_source += 1
            except Exception:
                logger.exception(
                    "ingest_due_sources: unhandled error processing %s, continuing with other sources", source.name
                )
            finally:
                source_repo.mark_fetched(source.id)

            duration_ms = round((time.monotonic() - started_at) * 1000, 1)
            logger.info(
                "ingest_due_sources: source=%s duration_ms=%s fetch_failed=%s entries_seen=%d "
                "inserted=%d updated=%d attached_as_source=%d parse_failures=%d",
                source.name,
                duration_ms,
                fetch_failed,
                entries_seen,
                inserted,
                updated,
                attached_as_source,
                parse_failures,
            )

        session.commit()

        if any_touched:
            CacheRefreshService(session, redis_client).refresh(touched_categories=touched_categories)
