import httpx


class FeedFetchError(Exception):
    """Raised when the RSS feed can't be fetched — network error or non-2xx status."""


def fetch_feed_bytes(url: str, timeout: float) -> bytes:
    try:
        response = httpx.get(
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
