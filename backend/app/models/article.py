import uuid
from datetime import datetime

from sqlalchemy import ARRAY, DateTime, Index, String, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Article(Base):
    __tablename__ = "articles"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    guid: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    link: Mapped[str] = mapped_column(String, nullable=False)
    source: Mapped[str] = mapped_column(String, nullable=False, default="coindesk")

    title: Mapped[str] = mapped_column(String, nullable=False)
    summary: Mapped[str | None] = mapped_column(String, nullable=True)
    content_html: Mapped[str | None] = mapped_column(String, nullable=True)
    author: Mapped[str | None] = mapped_column(String, nullable=True)
    categories: Mapped[list[str] | None] = mapped_column(ARRAY(String), nullable=True)
    image_url: Mapped[str | None] = mapped_column(String, nullable=True)

    published_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    fetched_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    # Full normalized payload, kept for forward-compatibility: if CoinDesk adds
    # a field later it's captured here without needing a schema migration.
    raw_payload: Mapped[dict | None] = mapped_column(JSONB, nullable=True)

    # Ascending index still serves `ORDER BY published_at DESC` efficiently
    # (Postgres can scan a B-tree backwards), so no need for an explicit
    # DESC index definition here.
    __table_args__ = (
        Index("ix_articles_source_published_at", "source", "published_at"),
    )
