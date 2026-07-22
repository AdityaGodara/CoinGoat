"""drop legacy single-source article columns

The "contract" half of the expand/contract pair started by migration 0002.
Ships as a SEPARATE, LATER deploy — only run this once the application has
been running against 0002's expanded schema for a while and nothing reads
guid/link/source/fetched_at/content_html/raw_payload/categories off
`articles` anymore (guid/link/source/fetched_at facts now live on
`article_sources`, one row per attributing source; categories is replaced
by the single normalized `category` string column added in 0002).

IMPORTANT — this downgrade is schema-shape-only, not data-safe: by the time
this migration has run, an article's original guid/link/source values may
be spread across several `article_sources` rows (multi-source attribution),
so there is no single value left to mechanically restore into these columns.
`alembic downgrade` after this migration recreates the columns as empty
shells, not with their original per-row data.

Revision ID: 0003
Revises: 0002
Create Date: 2026-07-22

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "0003"
down_revision: Union[str, None] = "0002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.drop_index("ix_articles_source_published_at", table_name="articles")
    op.drop_index("ix_articles_guid", table_name="articles")
    op.drop_column("articles", "guid")
    op.drop_column("articles", "link")
    op.drop_column("articles", "source")
    op.drop_column("articles", "fetched_at")
    op.drop_column("articles", "content_html")
    op.drop_column("articles", "raw_payload")
    op.drop_column("articles", "categories")


def downgrade() -> None:
    op.add_column("articles", sa.Column("guid", sa.String(), nullable=True))
    op.add_column("articles", sa.Column("link", sa.String(), nullable=True))
    op.add_column("articles", sa.Column("source", sa.String(), nullable=True, server_default="coindesk"))
    op.add_column("articles", sa.Column("fetched_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=True))
    op.add_column("articles", sa.Column("content_html", sa.String(), nullable=True))
    op.add_column("articles", sa.Column("raw_payload", postgresql.JSONB(), nullable=True))
    op.add_column("articles", sa.Column("categories", postgresql.ARRAY(sa.String()), nullable=True))
    op.create_index("ix_articles_guid", "articles", ["guid"], unique=True)
    op.create_index("ix_articles_source_published_at", "articles", ["source", "published_at"])
