from collections.abc import AsyncIterator

from sqlalchemy import create_engine
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import settings

# Async engine/session — used by FastAPI request handlers.
engine = create_async_engine(settings.async_database_url, pool_pre_ping=True)
AsyncSessionLocal = sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)

# Sync engine/session — used by the Celery worker and Alembic, since Celery
# tasks are synchronous by default and a 30s-cadence scrape has no latency
# pressure that would justify running an event loop inside the worker.
sync_engine = create_engine(settings.sync_database_url, pool_pre_ping=True)
SyncSessionLocal = sessionmaker(bind=sync_engine, class_=Session, expire_on_commit=False)


async def get_db() -> AsyncIterator[AsyncSession]:
    async with AsyncSessionLocal() as session:
        yield session
