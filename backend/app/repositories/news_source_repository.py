import uuid

from sqlalchemy import func, select, text
from sqlalchemy.orm import Session

from app.models.news_source import NewsSource

_DUE_PREDICATE = text(
    "(news_sources.last_fetched_at IS NULL OR now() - news_sources.last_fetched_at "
    ">= (news_sources.fetch_interval_seconds || ' seconds')::interval)"
)


class NewsSourceRepository:
    def __init__(self, session: Session):
        self._session = session

    def get_due(self) -> list[NewsSource]:
        stmt = (
            select(NewsSource)
            .where(NewsSource.is_active.is_(True))
            .where(_DUE_PREDICATE)
            .order_by(NewsSource.priority.desc())
        )
        return self._session.execute(stmt).scalars().all()

    def mark_fetched(self, source_id: uuid.UUID) -> None:
        self._session.execute(
            NewsSource.__table__.update().where(NewsSource.id == source_id).values(last_fetched_at=func.now())
        )
