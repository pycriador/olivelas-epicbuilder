"""Gallery media table

Revision ID: 002_gallery_media
Revises: 001_initial_portal
Create Date: 2026-08-19
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "002_gallery_media"
down_revision: Union[str, None] = "001_initial_portal"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

SCHEMA = "portal"


def upgrade() -> None:
    op.create_table(
        "gallery_media",
        sa.Column("id", sa.String(length=64), primary_key=True),
        sa.Column("case_id", sa.String(length=64), nullable=True),
        sa.Column("filename", sa.String(length=255), server_default="", nullable=False),
        sa.Column(
            "mime_type",
            sa.String(length=128),
            server_default="application/octet-stream",
            nullable=False,
        ),
        sa.Column("content", sa.LargeBinary(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        schema=SCHEMA,
    )
    op.create_index("ix_gallery_media_case_id", "gallery_media", ["case_id"], schema=SCHEMA)


def downgrade() -> None:
    op.drop_index("ix_gallery_media_case_id", table_name="gallery_media", schema=SCHEMA)
    op.drop_table("gallery_media", schema=SCHEMA)
