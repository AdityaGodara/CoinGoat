import uuid
from datetime import datetime

from sqlalchemy import Computed, DateTime, Index, String, func
from sqlalchemy.dialects.postgresql import JSONB, TSVECTOR, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base

_SEARCH_VECTOR_EXPR = "to_tsvector('english', coalesce(title, '') || ' ' || coalesce(summary, ''))"


class Article(Base):
    __tablename__ = "articles"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    slug: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    title: Mapped[str] = mapped_column(String, nullable=False)
    summary: Mapped[str | None] = mapped_column(String, nullable=True)
    content: Mapped[str | None] = mapped_column(String, nullable=True)
    author: Mapped[str | None] = mapped_column(String, nullable=True)
    category: Mapped[str] = mapped_column(String, nullable=False, default="Markets", server_default="Markets")
    image_url: Mapped[str | None] = mapped_column(String, nullable=True)
    canonical_url: Mapped[str] = mapped_column(String, unique=True, nullable=False)

    published_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Generated column backing full-text search (see ArticleRepository.search) —
    # Postgres keeps this in sync automatically, no application code writes it.
    search_vector: Mapped[str | None] = mapped_column(
        TSVECTOR, Computed(_SEARCH_VECTOR_EXPR, persisted=True), nullable=True
    )

    # `guid`, `link`, `source`, `fetched_at`, `content_html`, and `raw_payload`
    # from the single-source design now live on ArticleSource instead — an
    # Article can be attributed to several sources (see app.models.article_source).

    __table_args__ = (
        Index("ix_articles_published_at", "published_at"),
        Index("ix_articles_category_published_at", "category", "published_at"),
        Index("ix_articles_search_vector", "search_vector", postgresql_using="gin"),
    )
