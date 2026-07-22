from celery import Celery
from celery.signals import after_setup_logger, after_setup_task_logger

from app.core.config import settings
from app.core.logging import configure_logging

celery_app = Celery(
    "coingoat",
    broker=settings.redis_url,
    backend=settings.redis_url,
    include=["worker.tasks"],
)

celery_app.conf.timezone = "UTC"
celery_app.conf.beat_schedule = {
    "ingest-due-sources": {
        "task": "worker.tasks.ingest_due_sources",
        "schedule": settings.beat_tick_seconds,
    },
}


@after_setup_logger.connect
@after_setup_task_logger.connect
def _setup_celery_logging(**kwargs) -> None:
    configure_logging(settings.log_level)
