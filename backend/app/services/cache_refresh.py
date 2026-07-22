import json

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.core.cache_keys import category_list_key, featured_key, homepage_key, latest_list_key, trending_key
from app.core.config import settings
from app.models.article import Article
from app.schemas.article import ArticleListOut, ArticleOut, ArticleSummaryOut, HomepageOut
from app.services.category_normalizer import slug_for

TRENDING_POOL_SIZE = 10


class CacheRefreshService:
    """Refreshes only the composed views the ingestion pipeline is asked to
    keep warm: homepage, latest, featured, trending, and whichever category
    caches were actually touched this tick. Deliberately does NOT proactively
    cache individual articles — GET /api/article/{slug} caches lazily, on
    read, in ArticleRepository.get_by_slug() instead, so we don't cache
    every article forever."""

    def __init__(self, session: Session, redis_client):
        self._session = session
        self._redis = redis_client

    def refresh(self, *, touched_categories: set[str]) -> None:
        pipe = self._redis.pipeline()

        latest_rows = self._refresh_latest(pipe)
        self._refresh_featured(pipe, latest_rows)
        self._refresh_trending(pipe, latest_rows)
        self._refresh_homepage(pipe, latest_rows)

        for category in touched_categories:
            self._refresh_category(pipe, category)

        pipe.execute()

    def _refresh_latest(self, pipe, limit: int | None = None) -> list[Article]:
        limit = limit or settings.latest_list_default_limit
        rows = (
            self._session.execute(select(Article).order_by(Article.published_at.desc()).limit(limit))
            .scalars()
            .all()
        )
        total = self._session.execute(select(func.count()).select_from(Article)).scalar_one()
        listing = ArticleListOut(
            items=[ArticleOut.model_validate(row) for row in rows], total=total, limit=limit, offset=0
        )
        pipe.set(latest_list_key(limit), listing.model_dump_json(), ex=settings.latest_list_cache_ttl_seconds)
        return rows

    def _refresh_featured(self, pipe, latest_rows: list[Article]) -> None:
        featured = latest_rows[0] if latest_rows else None
        payload = ArticleSummaryOut.model_validate(featured).model_dump_json() if featured else "null"
        pipe.set(featured_key(), payload, ex=settings.featured_cache_ttl_seconds)

    def _refresh_trending(self, pipe, latest_rows: list[Article]) -> None:
        # No real engagement analytics exist for RSS-sourced content — trending
        # is, honestly, the same recency proxy as latest/featured, just a
        # different slice and TTL. Documented limitation, not an oversight.
        trending = latest_rows[:TRENDING_POOL_SIZE]
        payload = [ArticleSummaryOut.model_validate(row).model_dump(mode="json") for row in trending]
        pipe.set(trending_key(), json.dumps(payload), ex=settings.trending_cache_ttl_seconds)

    def _refresh_homepage(self, pipe, latest_rows: list[Article]) -> None:
        featured = latest_rows[0] if latest_rows else None
        homepage = HomepageOut(
            featured=ArticleSummaryOut.model_validate(featured) if featured else None,
            latest=[ArticleSummaryOut.model_validate(row) for row in latest_rows[: settings.latest_list_default_limit]],
            trending=[ArticleSummaryOut.model_validate(row) for row in latest_rows[:TRENDING_POOL_SIZE]],
        )
        pipe.set(homepage_key(), homepage.model_dump_json(), ex=settings.homepage_cache_ttl_seconds)

    def _refresh_category(self, pipe, category: str) -> None:
        limit = settings.latest_list_default_limit
        rows = (
            self._session.execute(
                select(Article)
                .where(Article.category == category)
                .order_by(Article.published_at.desc())
                .limit(limit)
            )
            .scalars()
            .all()
        )
        total = self._session.execute(
            select(func.count()).select_from(Article).where(Article.category == category)
        ).scalar_one()
        listing = ArticleListOut(
            items=[ArticleOut.model_validate(row) for row in rows], total=total, limit=limit, offset=0
        )
        pipe.set(
            category_list_key(slug_for(category)), listing.model_dump_json(), ex=settings.category_list_cache_ttl_seconds
        )
