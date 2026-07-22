import uuid

from redis.asyncio import Redis
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.cache_keys import article_key, latest_list_key
from app.core.config import settings
from app.models.article import Article
from app.schemas.article import ArticleListOut, ArticleOut


class ArticleRepository:
    """Sole owner of the cache-aside logic: routers call these two methods
    and never touch Redis or the ORM directly."""

    def __init__(self, db: AsyncSession, redis: Redis):
        self._db = db
        self._redis = redis

    async def get_by_id(self, article_id: uuid.UUID) -> ArticleOut | None:
        key = article_key(article_id)
        cached = await self._redis.get(key)
        if cached:
            return ArticleOut.model_validate_json(cached)

        article = await self._db.get(Article, article_id)
        if article is None:
            return None

        out = ArticleOut.model_validate(article)
        await self._redis.set(key, out.model_dump_json(), ex=settings.article_cache_ttl_seconds)
        return out

    async def list_latest(self, limit: int, offset: int, source: str = "coindesk") -> ArticleListOut:
        cacheable = offset == 0 and limit == settings.latest_list_default_limit
        key = latest_list_key(source, limit)

        if cacheable:
            cached = await self._redis.get(key)
            if cached:
                return ArticleListOut.model_validate_json(cached)

        rows = (
            (
                await self._db.execute(
                    select(Article)
                    .where(Article.source == source)
                    .order_by(Article.published_at.desc())
                    .limit(limit)
                    .offset(offset)
                )
            )
            .scalars()
            .all()
        )
        total = (
            await self._db.execute(select(func.count()).select_from(Article).where(Article.source == source))
        ).scalar_one()

        listing = ArticleListOut(
            items=[ArticleOut.model_validate(row) for row in rows],
            total=total,
            limit=limit,
            offset=offset,
        )

        if cacheable:
            await self._redis.set(key, listing.model_dump_json(), ex=settings.latest_list_cache_ttl_seconds)

        return listing
