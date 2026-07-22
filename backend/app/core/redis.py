from redis.asyncio import ConnectionPool, Redis

from app.core.config import settings

_pool = ConnectionPool.from_url(settings.redis_url, decode_responses=True)


def get_redis_client() -> Redis:
    return Redis(connection_pool=_pool)


async def close_redis_pool() -> None:
    await _pool.disconnect()
