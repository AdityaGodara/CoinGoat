from contextlib import contextmanager

from redis.exceptions import LockError


@contextmanager
def try_lock(redis_client, name: str, timeout: int):
    """Non-blocking Redis lock. Yields True if acquired, False if another
    run is still in-flight (caller should skip its work). The lock's TTL
    is the safety net if the holder crashes without releasing it."""

    lock = redis_client.lock(name, timeout=timeout, blocking_timeout=0)
    acquired = lock.acquire(blocking=False)
    try:
        yield acquired
    finally:
        if acquired:
            try:
                lock.release()
            except LockError:
                pass  # already expired — fine, TTL already covered it
