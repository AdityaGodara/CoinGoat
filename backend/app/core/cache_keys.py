def article_key(slug: str) -> str:
    return f"article:{slug}"


def latest_list_key(limit: int) -> str:
    return f"articles:latest:{limit}"


def homepage_key() -> str:
    return "homepage"


def featured_key() -> str:
    return "featured"


def trending_key() -> str:
    return "trending"


def category_list_key(category_slug: str) -> str:
    return f"category:{category_slug}"


def search_key(query: str, limit: int, offset: int) -> str:
    return f"search:{query}:{limit}:{offset}"
