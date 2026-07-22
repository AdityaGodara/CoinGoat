"""expand schema for multi-source ingestion

Adds news_sources and article_sources, seeds the 8 verified RSS sources,
and expands `articles` with slug/content/category/canonical_url/created_at/
search_vector — backfilling the existing (single-source, CoinDesk-only) rows
into the new shape. This is the "expand" half of an expand/contract pair:
the legacy `guid`/`link`/`source`/`fetched_at`/`content_html`/`raw_payload`
columns on `articles` are left physically in place here and are only
dropped by migration 0003, in a later deploy, once the application has run
against this expanded schema for a while.

Revision ID: 0002
Revises: 0001
Create Date: 2026-07-22

"""
import json
import uuid
from typing import Sequence, Union
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

import nh3
import sqlalchemy as sa
from alembic import op
from slugify import slugify
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "0002"
down_revision: Union[str, None] = "0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

_TRACKING_PARAM_PREFIXES = ("utm_", "ref", "fbclid", "gclid", "mc_")

# Duplicated (not imported from app.services.deduplication) deliberately —
# migrations are frozen history and shouldn't depend on application code
# that may itself change shape after this migration has run in production.
def _normalize_url(url: str) -> str:
    parts = urlsplit(url.strip())
    netloc = parts.netloc.lower().removeprefix("www.")
    path = parts.path.rstrip("/") or "/"
    query_pairs = sorted(
        (key, value)
        for key, value in parse_qsl(parts.query, keep_blank_values=True)
        if not any(key.lower().startswith(prefix) for prefix in _TRACKING_PARAM_PREFIXES)
    )
    return urlunsplit(("https", netloc, path, urlencode(query_pairs), ""))


SEED_SOURCES = [
    {
        "name": "CoinDesk",
        "rss_url": "https://www.coindesk.com/arc/outboundfeeds/rss/",
        "website_url": "https://www.coindesk.com",
        "priority": 100,
    },
    {
        "name": "Cointelegraph",
        "rss_url": "https://cointelegraph.com/rss",
        "website_url": "https://cointelegraph.com",
        "priority": 90,
    },
    {
        "name": "Decrypt",
        "rss_url": "https://decrypt.co/feed",
        "website_url": "https://decrypt.co",
        "priority": 80,
    },
    {
        "name": "Bitcoin Magazine",
        "rss_url": "https://bitcoinmagazine.com/feed",
        "website_url": "https://bitcoinmagazine.com",
        "priority": 70,
    },
    {
        "name": "Ethereum Foundation",
        "rss_url": "https://blog.ethereum.org/feed.xml",
        "website_url": "https://blog.ethereum.org",
        "priority": 60,
    },
    {
        "name": "Solana",
        "rss_url": "https://solana.com/news/rss.xml",
        "website_url": "https://solana.com/news",
        "priority": 50,
    },
    {
        "name": "Arbitrum (Offchain Labs)",
        "rss_url": "https://blog.arbitrum.io/feed",
        "website_url": "https://blog.arbitrum.io",
        "priority": 50,
    },
    {
        "name": "Kraken Blog",
        "rss_url": "https://blog.kraken.com/feed",
        "website_url": "https://blog.kraken.com",
        "priority": 40,
    },
]
COINDESK_RSS_URL = "https://www.coindesk.com/arc/outboundfeeds/rss/"


def upgrade() -> None:
    bind = op.get_bind()

    # --- 1. news_sources ---------------------------------------------------
    news_sources_table = op.create_table(
        "news_sources",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(), nullable=False),
        sa.Column("rss_url", sa.String(), nullable=False),
        sa.Column("website_url", sa.String(), nullable=False),
        sa.Column("category", sa.String(), nullable=True),
        sa.Column("priority", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("fetch_interval_seconds", sa.Integer(), nullable=False, server_default="300"),
        sa.Column("is_active", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column("last_fetched_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("name", name="uq_news_sources_name"),
        sa.UniqueConstraint("rss_url", name="uq_news_sources_rss_url"),
    )

    # --- 2. article_sources --------------------------------------------------
    op.create_table(
        "article_sources",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("article_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("articles.id", ondelete="CASCADE"), nullable=False),
        sa.Column("news_source_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("news_sources.id"), nullable=False),
        sa.Column("external_guid", sa.String(), nullable=False),
        sa.Column("original_url", sa.String(), nullable=False),
        sa.Column("raw_payload", postgresql.JSONB(), nullable=False),
        sa.Column("fetched_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("news_source_id", "external_guid", name="uq_article_sources_source_guid"),
    )
    op.create_index("ix_article_sources_article_id", "article_sources", ["article_id"])
    op.create_index("ix_article_sources_news_source_id", "article_sources", ["news_source_id"])

    # --- 3. new articles columns (nullable for now) ---------------------------
    op.add_column("articles", sa.Column("slug", sa.String(), nullable=True))
    op.add_column("articles", sa.Column("content", sa.String(), nullable=True))
    op.add_column("articles", sa.Column("category", sa.String(), nullable=True))
    op.add_column("articles", sa.Column("canonical_url", sa.String(), nullable=True))
    op.add_column("articles", sa.Column("created_at", sa.DateTime(timezone=True), nullable=True))
    op.add_column(
        "articles",
        sa.Column(
            "search_vector",
            postgresql.TSVECTOR(),
            sa.Computed("to_tsvector('english', coalesce(title, '') || ' ' || coalesce(summary, ''))", persisted=True),
            nullable=True,
        ),
    )

    # --- 4. seed the 8 verified sources (deterministic ids) -------------------
    seed_rows = []
    for row in SEED_SOURCES:
        seed_rows.append(
            {
                **row,
                "id": uuid.uuid5(uuid.NAMESPACE_URL, row["rss_url"]),
                "fetch_interval_seconds": 300,
                "is_active": True,
            }
        )
    op.bulk_insert(news_sources_table, seed_rows)
    coindesk_id = uuid.uuid5(uuid.NAMESPACE_URL, COINDESK_RSS_URL)

    # --- 5. backfill existing (CoinDesk-only) article rows --------------------
    existing_rows = bind.execute(
        sa.text(
            "SELECT id, guid, link, title, summary, content_html, author, categories, "
            "image_url, published_at, fetched_at, raw_payload FROM articles"
        )
    ).mappings().all()

    used_slugs: set[str] = set()
    for row in existing_rows:
        base_slug = slugify(row["title"])[:200] or "article"
        slug = base_slug
        attempt = 1
        while slug in used_slugs:
            attempt += 1
            slug = f"{base_slug}-{attempt}"
        used_slugs.add(slug)

        content = nh3.clean(row["content_html"]) if row["content_html"] else None
        canonical_url = _normalize_url(row["link"])
        raw_payload = row["raw_payload"] or {
            "guid": row["guid"],
            "link": row["link"],
            "title": row["title"],
            "summary": row["summary"],
            "author": row["author"],
            "categories": row["categories"],
            "image_url": row["image_url"],
            "published_at": row["published_at"].isoformat() if row["published_at"] else None,
        }

        bind.execute(
            sa.text(
                "UPDATE articles SET slug = :slug, content = :content, category = :category, "
                "canonical_url = :canonical_url, created_at = :created_at WHERE id = :id"
            ),
            {
                "slug": slug,
                "content": content,
                "category": "Markets",
                "canonical_url": canonical_url,
                "created_at": row["fetched_at"],
                "id": row["id"],
            },
        )
        bind.execute(
            sa.text(
                "INSERT INTO article_sources (id, article_id, news_source_id, external_guid, "
                "original_url, raw_payload, fetched_at) VALUES "
                "(:id, :article_id, :news_source_id, :external_guid, :original_url, CAST(:raw_payload AS JSONB), :fetched_at)"
            ),
            {
                "id": uuid.uuid4(),
                "article_id": row["id"],
                "news_source_id": coindesk_id,
                "external_guid": row["guid"],
                "original_url": row["link"],
                "raw_payload": json.dumps(raw_payload),
                "fetched_at": row["fetched_at"],
            },
        )

    # --- 6. tighten constraints now that every row has values -----------------
    op.alter_column("articles", "slug", nullable=False)
    op.create_index("ix_articles_slug", "articles", ["slug"], unique=True)
    op.alter_column("articles", "canonical_url", nullable=False)
    op.create_unique_constraint("uq_articles_canonical_url", "articles", ["canonical_url"])
    op.alter_column("articles", "category", nullable=False, server_default="Markets")
    op.alter_column("articles", "created_at", nullable=False, server_default=sa.func.now())
    op.create_index("ix_articles_published_at", "articles", ["published_at"])
    op.create_index("ix_articles_category_published_at", "articles", ["category", "published_at"])
    op.create_index("ix_articles_search_vector", "articles", ["search_vector"], postgresql_using="gin")


def downgrade() -> None:
    op.drop_index("ix_articles_search_vector", table_name="articles")
    op.drop_index("ix_articles_category_published_at", table_name="articles")
    op.drop_index("ix_articles_published_at", table_name="articles")
    op.drop_constraint("uq_articles_canonical_url", "articles", type_="unique")
    op.drop_index("ix_articles_slug", table_name="articles")

    op.drop_column("articles", "search_vector")
    op.drop_column("articles", "created_at")
    op.drop_column("articles", "canonical_url")
    op.drop_column("articles", "category")
    op.drop_column("articles", "content")
    op.drop_column("articles", "slug")

    op.drop_index("ix_article_sources_news_source_id", table_name="article_sources")
    op.drop_index("ix_article_sources_article_id", table_name="article_sources")
    op.drop_table("article_sources")
    op.drop_table("news_sources")
