"""create articles table

Revision ID: 0001
Revises:
Create Date: 2026-07-22

"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "articles",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("guid", sa.String(), nullable=False),
        sa.Column("link", sa.String(), nullable=False),
        sa.Column("source", sa.String(), nullable=False, server_default="coindesk"),
        sa.Column("title", sa.String(), nullable=False),
        sa.Column("summary", sa.String(), nullable=True),
        sa.Column("content_html", sa.String(), nullable=True),
        sa.Column("author", sa.String(), nullable=True),
        sa.Column("categories", postgresql.ARRAY(sa.String()), nullable=True),
        sa.Column("image_url", sa.String(), nullable=True),
        sa.Column("published_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("fetched_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("raw_payload", postgresql.JSONB(), nullable=True),
    )
    op.create_index("ix_articles_guid", "articles", ["guid"], unique=True)
    op.create_index("ix_articles_source_published_at", "articles", ["source", "published_at"])


def downgrade() -> None:
    op.drop_index("ix_articles_source_published_at", table_name="articles")
    op.drop_index("ix_articles_guid", table_name="articles")
    op.drop_table("articles")
