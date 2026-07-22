import httpx
from tenacity import retry, retry_if_exception_type, stop_after_attempt, wait_exponential

from app.core.config import settings


class FeedFetchError(Exception):
    """Raised when an RSS feed can't be fetched — network error or non-2xx status."""


@retry(
    stop=stop_after_attempt(settings.feed_fetch_max_attempts),
    wait=wait_exponential(multiplier=settings.feed_fetch_retry_backoff_seconds, min=1, max=5),
    retry=retry_if_exception_type(FeedFetchError),
    reraise=True,
)
def _fetch_once(client: httpx.Client, url: str, timeout: float) -> bytes:
    try:
        response = client.get(
            url,
            timeout=timeout,
            headers={"User-Agent": "CoinGoatBot/1.0"},
            follow_redirects=True,
        )
        response.raise_for_status()
    except httpx.HTTPStatusError as exc:
        raise FeedFetchError(f"feed returned status {exc.response.status_code}") from exc
    except httpx.RequestError as exc:
        raise FeedFetchError(f"feed request failed: {exc}") from exc

    return response.content


def fetch_feed_bytes(client: httpx.Client, url: str, timeout: float) -> bytes:
    """Fetch one feed using a shared, connection-pooled client. Retries a
    small, fixed number of times with short backoff — now justified because
    a source's own fetch_interval_seconds can be long, unlike the old
    single-feed design where the next Beat tick (30s away) was the retry."""
    return _fetch_once(client, url, timeout)
