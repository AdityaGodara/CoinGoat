import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class NormalizedArticle(BaseModel):
    """Output of worker.normalize.normalize_entry — one RSS entry mapped onto
    our schema. Still source-specific (carries external_guid/original_url/
    raw_payload for the ArticleSource row DeduplicationService will create
    or attach) — separate from the final, possibly multi-source Article."""

    external_guid: str
    original_url: str
    canonical_url: str
    title: str
    summary: str | None = None
    content: str | None = None
    author: str | None = None
    category: str
    image_url: str | None = None
    published_at: datetime
    raw_payload: dict


class ArticleOut(BaseModel):
    """Full article detail — GET /api/article/{slug}. Never includes any
    source/guid/link attribution — the frontend must never know which RSS
    source an article came from."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    slug: str
    title: str
    summary: str | None = None
    content: str | None = None
    author: str | None = None
    category: str
    image_url: str | None = None
    canonical_url: str
    published_at: datetime
    updated_at: datetime


class ArticleSummaryOut(BaseModel):
    """Lighter shape for list/homepage surfaces — omits `content`."""

    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    slug: str
    title: str
    summary: str | None = None
    author: str | None = None
    category: str
    image_url: str | None = None
    published_at: datetime


class ArticleListOut(BaseModel):
    items: list[ArticleOut]
    total: int
    limit: int
    offset: int


class HomepageOut(BaseModel):
    featured: ArticleSummaryOut | None
    latest: list[ArticleSummaryOut]
    trending: list[ArticleSummaryOut]
