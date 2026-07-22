"""Sync `news_sources` rows from the `RSS_FEED_SOURCES` env var.

Feed URLs are configured in .env, not hardcoded — this script is the sync
step between them and the database. Run it (via `python -m
scripts.seed_news_sources`, or the `seed-sources` compose service that runs
it automatically on every `docker compose up`) any time RSS_FEED_SOURCES
changes. Sources are matched by `name`: existing rows are updated in place,
names not yet in the table are inserted. A source removed from the env is
left in the table rather than deleted — past articles' `article_sources.
news_source_id` still needs to resolve, and dropping it silently would also
resume fetching it the moment it's re-added with a stale last_fetched_at.
Deactivate it in the DB (`is_active = false`) if you want it to stop being
fetched without losing that history.
"""

import logging

from app.core.config import settings
from app.db.session import SyncSessionLocal
from app.models.news_source import NewsSource

logging.basicConfig(level=settings.log_level)
logger = logging.getLogger(__name__)


def seed_news_sources() -> None:
    if not settings.rss_feed_sources:
        logger.warning("seed_news_sources: RSS_FEED_SOURCES is empty, nothing to seed")
        return

    with SyncSessionLocal() as session:
        existing_by_name = {source.name: source for source in session.query(NewsSource).all()}
        created = updated = 0

        for entry in settings.rss_feed_sources:
            fetch_interval_seconds = entry.fetch_interval_seconds or settings.default_fetch_interval_seconds
            source = existing_by_name.get(entry.name)
            if source is None:
                session.add(
                    NewsSource(
                        name=entry.name,
                        rss_url=entry.rss_url,
                        website_url=entry.website_url,
                        priority=entry.priority,
                        fetch_interval_seconds=fetch_interval_seconds,
                        is_active=entry.is_active,
                    )
                )
                created += 1
            else:
                source.rss_url = entry.rss_url
                source.website_url = entry.website_url
                source.priority = entry.priority
                source.fetch_interval_seconds = fetch_interval_seconds
                source.is_active = entry.is_active
                updated += 1

        session.commit()
        logger.info(
            "seed_news_sources: created=%d updated=%d total_in_env=%d",
            created,
            updated,
            len(settings.rss_feed_sources),
        )


if __name__ == "__main__":
    seed_news_sources()
