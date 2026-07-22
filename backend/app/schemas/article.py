import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class NormalizedArticle(BaseModel):
    """Output of worker.normalize.normalize_entry — one RSS entry mapped onto our schema."""

    guid: str
    link: str
    source: str
    title: str
    summary: str | None = None
    content_html: str | None = None
    author: str | None = None
    categories: list[str] = []
    image_url: str | None = None
    published_at: datetime
    raw_payload: dict


class ArticleOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    source: str
    title: str
    summary: str | None = None
    content_html: str | None = None
    author: str | None = None
    categories: list[str] = []
    image_url: str | None = None
    link: str
    published_at: datetime
    updated_at: datetime


class ArticleListOut(BaseModel):
    items: list[ArticleOut]
    total: int
    limit: int
    offset: int
