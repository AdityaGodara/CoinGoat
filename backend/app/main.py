from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.routers import articles, health
from app.core.config import settings
from app.core.logging import configure_logging
from app.core.redis import close_redis_pool
from app.db.session import engine

configure_logging(settings.log_level)


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    await engine.dispose()
    await close_redis_pool()


app = FastAPI(title="CoinGoat RSS API", lifespan=lifespan)

app.include_router(health.router)
app.include_router(articles.router)
