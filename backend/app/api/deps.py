from typing import Annotated

from fastapi import Depends
from redis.asyncio import Redis
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.redis import get_redis_client
from app.db.session import get_db
from app.repositories.article_repository import ArticleRepository


def get_article_repository(
    db: Annotated[AsyncSession, Depends(get_db)],
    redis: Annotated[Redis, Depends(get_redis_client)],
) -> ArticleRepository:
    return ArticleRepository(db=db, redis=redis)
