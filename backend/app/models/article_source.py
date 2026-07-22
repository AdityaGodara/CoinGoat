import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class ArticleSource(Base):
    """Attribution of one Article to one NewsSource it was ingested from.

    An Article may have several ArticleSource rows when the same story is
    syndicated across multiple publishers (see app.services.deduplication) —
    this table, not `articles`, is where per-source facts (guid, original
    URL, raw payload) live, precisely so `articles` can represent one
    canonical, possibly multi-source story.
    """

    __tablename__ = "article_sources"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    article_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("articles.id", ondelete="CASCADE"), nullable=False, index=True
    )
    news_source_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("news_sources.id"), nullable=False, index=True
    )

    external_guid: Mapped[str] = mapped_column(String, nullable=False)
    original_url: Mapped[str] = mapped_column(String, nullable=False)
    raw_payload: Mapped[dict] = mapped_column(JSONB, nullable=False)

    fetched_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )

    __table_args__ = (
        UniqueConstraint("news_source_id", "external_guid", name="uq_article_sources_source_guid"),
    )
