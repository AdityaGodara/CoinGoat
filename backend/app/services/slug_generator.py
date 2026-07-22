from sqlalchemy import select
from sqlalchemy.orm import Session
from slugify import slugify

from app.models.article import Article


def slugify_title(title: str) -> str:
    return slugify(title)[:200] or "article"


def next_slug_candidate(base: str, attempt: int) -> str:
    return base if attempt == 1 else f"{base}-{attempt}"


class SlugGenerator:
    """DB-aware slug collision handling. The pure functions above are what's
    unit-tested; this class is the thin, DB-touching wrapper around them."""

    def __init__(self, session: Session):
        self._session = session

    def slug_exists(self, slug: str) -> bool:
        return self._session.execute(select(Article.id).where(Article.slug == slug)).first() is not None

    def generate(self, title: str) -> str:
        base = slugify_title(title)
        attempt = 1
        slug = base
        while self.slug_exists(slug):
            attempt += 1
            slug = next_slug_candidate(base, attempt)
        return slug
