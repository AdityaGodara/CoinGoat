from urllib.parse import quote

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    postgres_host: str = "postgres"
    postgres_port: int = 5432
    postgres_db: str = "coingoat"
    postgres_user: str = "coingoat"
    postgres_password: str = "change-me"

    redis_url: str = "redis://redis:6379/0"

    coindesk_rss_url: str = "https://www.coindesk.com/arc/outboundfeeds/rss/"
    poll_interval_seconds: int = 30
    article_cache_ttl_seconds: int = 600
    latest_list_cache_ttl_seconds: int = 60
    latest_list_default_limit: int = 20
    fetch_lock_ttl_seconds: int = 25
    feed_fetch_timeout_seconds: int = 10

    log_level: str = "INFO"

    @property
    def async_database_url(self) -> str:
        user = quote(self.postgres_user, safe="")
        password = quote(self.postgres_password, safe="")
        return (
            f"postgresql+asyncpg://{user}:{password}"
            f"@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"
        )

    @property
    def sync_database_url(self) -> str:
        user = quote(self.postgres_user, safe="")
        password = quote(self.postgres_password, safe="")
        return (
            f"postgresql+psycopg://{user}:{password}"
            f"@{self.postgres_host}:{self.postgres_port}/{self.postgres_db}"
        )


settings = Settings()
