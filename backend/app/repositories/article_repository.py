import json

from redis.asyncio import Redis
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.cache_keys import article_key, category_list_key, featured_key, homepage_key, latest_list_key, trending_key
from app.core.config import settings
from app.models.article import Article
from app.schemas.article import ArticleListOut, ArticleOut, ArticleSummaryOut, HomepageOut
from app.services.category_normalizer import category_for_slug

TRENDING_POOL_SIZE = 10


class ArticleRepository:
    """Sole owner of cache-aside logic: routers call these methods and never
    touch Redis or the ORM directly."""

    def __init__(self, db: AsyncSession, redis: Redis):
        self._db = db
        self._redis = redis

    async def get_by_slug(self, slug: str) -> ArticleOut | None:
        key = article_key(slug)
        cached = await self._redis.get(key)
        if cached:
            return ArticleOut.model_validate_json(cached)

        article = (await self._db.execute(select(Article).where(Article.slug == slug))).scalar_one_or_none()
        if article is None:
            return None

        out = ArticleOut.model_validate(article)
        await self._redis.set(key, out.model_dump_json(), ex=settings.article_cache_ttl_seconds)
        return out

    async def list_latest(self, limit: int, offset: int) -> ArticleListOut:
        cacheable = offset == 0 and limit == settings.latest_list_default_limit
        key = latest_list_key(limit)

        if cacheable:
            cached = await self._redis.get(key)
            if cached:
                return ArticleListOut.model_validate_json(cached)

        rows = (
            (
                await self._db.execute(
                    select(Article).order_by(Article.published_at.desc()).limit(limit).offset(offset)
                )
            )
            .scalars()
            .all()
        )
        total = (await self._db.execute(select(func.count()).select_from(Article))).scalar_one()
        listing = ArticleListOut(
            items=[ArticleOut.model_validate(row) for row in rows], total=total, limit=limit, offset=offset
        )

        if cacheable:
            await self._redis.set(key, listing.model_dump_json(), ex=settings.latest_list_cache_ttl_seconds)

        return listing

    async def list_by_category(self, category_slug: str, limit: int, offset: int) -> ArticleListOut | None:
        category = category_for_slug(category_slug)
        if category is None:
            return None

        cacheable = offset == 0 and limit == settings.latest_list_default_limit
        key = category_list_key(category_slug)

        if cacheable:
            cached = await self._redis.get(key)
            if cached:
                return ArticleListOut.model_validate_json(cached)

        rows = (
            (
                await self._db.execute(
                    select(Article)
                    .where(Article.category == category)
                    .order_by(Article.published_at.desc())
                    .limit(limit)
                    .offset(offset)
                )
            )
            .scalars()
            .all()
        )
        total = (
            await self._db.execute(select(func.count()).select_from(Article).where(Article.category == category))
        ).scalar_one()
        listing = ArticleListOut(
            items=[ArticleOut.model_validate(row) for row in rows], total=total, limit=limit, offset=offset
        )

        if cacheable:
            await self._redis.set(key, listing.model_dump_json(), ex=settings.category_list_cache_ttl_seconds)

        return listing

    async def get_featured(self) -> ArticleSummaryOut | None:
        cached = await self._redis.get(featured_key())
        if cached:
            return ArticleSummaryOut.model_validate_json(cached) if cached != "null" else None

        article = (
            await self._db.execute(select(Article).order_by(Article.published_at.desc()).limit(1))
        ).scalar_one_or_none()
        out = ArticleSummaryOut.model_validate(article) if article else None
        await self._redis.set(
            featured_key(), out.model_dump_json() if out else "null", ex=settings.featured_cache_ttl_seconds
        )
        return out

    async def get_trending(self, limit: int = TRENDING_POOL_SIZE) -> list[ArticleSummaryOut]:
        cached = await self._redis.get(trending_key())
        if cached:
            return [ArticleSummaryOut.model_validate(item) for item in json.loads(cached)]

        rows = (
            (await self._db.execute(select(Article).order_by(Article.published_at.desc()).limit(limit)))
            .scalars()
            .all()
        )
        summaries = [ArticleSummaryOut.model_validate(row) for row in rows]
        await self._redis.set(
            trending_key(),
            json.dumps([summary.model_dump(mode="json") for summary in summaries]),
            ex=settings.trending_cache_ttl_seconds,
        )
        return summaries

    async def get_homepage(self) -> HomepageOut:
        cached = await self._redis.get(homepage_key())
        if cached:
            return HomepageOut.model_validate_json(cached)

        rows = (
            (
                await self._db.execute(
                    select(Article).order_by(Article.published_at.desc()).limit(settings.latest_list_default_limit)
                )
            )
            .scalars()
            .all()
        )
        summaries = [ArticleSummaryOut.model_validate(row) for row in rows]
        homepage = HomepageOut(
            featured=summaries[0] if summaries else None,
            latest=summaries,
            trending=summaries[:TRENDING_POOL_SIZE],
        )
        await self._redis.set(homepage_key(), homepage.model_dump_json(), ex=settings.homepage_cache_ttl_seconds)
        return homepage

    async def search(self, query: str, limit: int, offset: int) -> ArticleListOut:
        tsquery = func.plainto_tsquery("english", query)
        rank = func.ts_rank(Article.search_vector, tsquery)
        stmt = (
            select(Article)
            .where(Article.search_vector.op("@@")(tsquery))
            .order_by(rank.desc())
            .limit(limit)
            .offset(offset)
        )
        rows = (await self._db.execute(stmt)).scalars().all()
        total = (
            await self._db.execute(
                select(func.count()).select_from(Article).where(Article.search_vector.op("@@")(tsquery))
            )
        ).scalar_one()
        return ArticleListOut(
            items=[ArticleOut.model_validate(row) for row in rows], total=total, limit=limit, offset=offset
        )
