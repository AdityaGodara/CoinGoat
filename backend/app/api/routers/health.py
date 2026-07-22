from typing import Annotated

from fastapi import APIRouter, Depends, Response
from redis.asyncio import Redis
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.redis import get_redis_client
from app.db.session import get_db

router = APIRouter()


@router.get("/healthz")
async def healthz(
    response: Response,
    db: Annotated[AsyncSession, Depends(get_db)],
    redis: Annotated[Redis, Depends(get_redis_client)],
):
    db_ok = False
    redis_ok = False

    try:
        await db.execute(text("SELECT 1"))
        db_ok = True
    except Exception:
        db_ok = False

    try:
        redis_ok = await redis.ping()
    except Exception:
        redis_ok = False

    if not (db_ok and redis_ok):
        response.status_code = 503

    return {"status": "ok" if db_ok and redis_ok else "degraded", "db": db_ok, "redis": redis_ok}
