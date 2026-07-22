import uuid


def article_key(article_id: uuid.UUID | str) -> str:
    return f"article:{article_id}"


def latest_list_key(source: str, limit: int) -> str:
    return f"articles:latest:{source}:{limit}"
