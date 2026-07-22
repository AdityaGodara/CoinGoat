import uuid

from sqlalchemy.orm import Session

from app.models.news_source import NewsSource
from app.repositories.news_source_repository import NewsSourceRepository


def get_due_sources(session: Session) -> list[NewsSource]:
    return NewsSourceRepository(session).get_due()


def mark_fetched(session: Session, source_id: uuid.UUID) -> None:
    NewsSourceRepository(session).mark_fetched(source_id)
