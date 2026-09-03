"""IAM schema: users, groups, roles, permissions, sessions, audit, invites, shares.

Revision ID: 003_iam_schema
Revises: 002_gallery_media
Create Date: 2026-08-20
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "003_iam_schema"
down_revision: Union[str, None] = "002_gallery_media"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

SCHEMA = "iam"


def upgrade() -> None:
    op.execute(f'CREATE SCHEMA IF NOT EXISTS "{SCHEMA}"')

    op.create_table(
        "users",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("first_name", sa.String(length=120), nullable=False),
        sa.Column("last_name", sa.String(length=120), nullable=False),
        sa.Column("username", sa.String(length=80), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("photo_url", sa.String(length=512), nullable=True),
        sa.Column("status", sa.String(length=32), server_default="active", nullable=False),
        sa.Column("primary_group_id", sa.String(length=36), nullable=True),
        sa.Column("locale", sa.String(length=16), server_default="pt-BR", nullable=False),
        sa.Column("timezone", sa.String(length=64), server_default="America/Sao_Paulo", nullable=False),
        sa.Column("must_change_password", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("email_verified", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("failed_login_attempts", sa.Integer(), server_default="0", nullable=False),
        sa.Column("locked_until", sa.DateTime(timezone=True), nullable=True),
        sa.Column("last_login_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.UniqueConstraint("username", name="uq_iam_users_username"),
        sa.UniqueConstraint("email", name="uq_iam_users_email"),
        schema=SCHEMA,
    )
    op.create_index("ix_iam_users_status", "users", ["status"], schema=SCHEMA)
    op.create_index("ix_iam_users_email", "users", ["email"], schema=SCHEMA)

    op.create_table(
        "groups",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("description", sa.Text(), server_default="", nullable=False),
        sa.Column("color", sa.String(length=32), server_default="#FF774A", nullable=False),
        sa.Column("icon", sa.String(length=64), server_default="team", nullable=False),
        sa.Column("status", sa.String(length=32), server_default="active", nullable=False),
        sa.Column("is_system", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.UniqueConstraint("name", name="uq_iam_groups_name"),
        schema=SCHEMA,
    )

    op.create_table(
        "roles",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("description", sa.Text(), server_default="", nullable=False),
        sa.Column("priority", sa.Integer(), server_default="100", nullable=False),
        sa.Column("status", sa.String(length=32), server_default="active", nullable=False),
        sa.Column("is_system", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.UniqueConstraint("name", name="uq_iam_roles_name"),
        schema=SCHEMA,
    )

    op.create_table(
        "permissions",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("code", sa.String(length=120), nullable=False),
        sa.Column("category", sa.String(length=80), nullable=False),
        sa.Column("description", sa.Text(), server_default="", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.UniqueConstraint("code", name="uq_iam_permissions_code"),
        schema=SCHEMA,
    )
    op.create_index("ix_iam_permissions_category", "permissions", ["category"], schema=SCHEMA)

    op.create_table(
        "user_groups",
        sa.Column("user_id", sa.String(length=36), sa.ForeignKey(f"{SCHEMA}.users.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("group_id", sa.String(length=36), sa.ForeignKey(f"{SCHEMA}.groups.id", ondelete="CASCADE"), primary_key=True),
        schema=SCHEMA,
    )

    op.create_table(
        "group_roles",
        sa.Column("group_id", sa.String(length=36), sa.ForeignKey(f"{SCHEMA}.groups.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("role_id", sa.String(length=36), sa.ForeignKey(f"{SCHEMA}.roles.id", ondelete="CASCADE"), primary_key=True),
        schema=SCHEMA,
    )

    op.create_table(
        "role_permissions",
        sa.Column("role_id", sa.String(length=36), sa.ForeignKey(f"{SCHEMA}.roles.id", ondelete="CASCADE"), primary_key=True),
        sa.Column("permission_id", sa.String(length=36), sa.ForeignKey(f"{SCHEMA}.permissions.id", ondelete="CASCADE"), primary_key=True),
        schema=SCHEMA,
    )

    op.create_table(
        "sessions",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("user_id", sa.String(length=36), sa.ForeignKey(f"{SCHEMA}.users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("refresh_token_hash", sa.String(length=128), nullable=False),
        sa.Column("ip_address", sa.String(length=64), server_default="", nullable=False),
        sa.Column("user_agent", sa.String(length=512), server_default="", nullable=False),
        sa.Column("browser", sa.String(length=120), server_default="", nullable=False),
        sa.Column("os", sa.String(length=120), server_default="", nullable=False),
        sa.Column("remember_me", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("revoked", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("last_seen_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        schema=SCHEMA,
    )
    op.create_index("ix_iam_sessions_user_id", "sessions", ["user_id"], schema=SCHEMA)
    op.create_index("ix_iam_sessions_refresh_hash", "sessions", ["refresh_token_hash"], schema=SCHEMA)

    op.create_table(
        "password_reset_tokens",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("user_id", sa.String(length=36), sa.ForeignKey(f"{SCHEMA}.users.id", ondelete="CASCADE"), nullable=False),
        sa.Column("token_hash", sa.String(length=128), nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("used_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        schema=SCHEMA,
    )
    op.create_index("ix_iam_password_reset_hash", "password_reset_tokens", ["token_hash"], schema=SCHEMA)

    op.create_table(
        "invitations",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("group_id", sa.String(length=36), sa.ForeignKey(f"{SCHEMA}.groups.id", ondelete="SET NULL"), nullable=True),
        sa.Column("invited_by", sa.String(length=36), sa.ForeignKey(f"{SCHEMA}.users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("token_hash", sa.String(length=128), nullable=False),
        sa.Column("status", sa.String(length=32), server_default="pending", nullable=False),
        sa.Column("expires_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("accepted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        schema=SCHEMA,
    )
    op.create_index("ix_iam_invitations_email", "invitations", ["email"], schema=SCHEMA)

    op.create_table(
        "shares",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("resource_type", sa.String(length=64), nullable=False),
        sa.Column("resource_id", sa.String(length=128), nullable=False),
        sa.Column("permission", sa.String(length=32), nullable=False),
        sa.Column("grantee_type", sa.String(length=16), nullable=False),
        sa.Column("grantee_id", sa.String(length=36), nullable=False),
        sa.Column("granted_by", sa.String(length=36), sa.ForeignKey(f"{SCHEMA}.users.id", ondelete="SET NULL"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        schema=SCHEMA,
    )
    op.create_index(
        "ix_iam_shares_resource",
        "shares",
        ["resource_type", "resource_id"],
        schema=SCHEMA,
    )

    op.create_table(
        "audit_logs",
        sa.Column("id", sa.String(length=36), primary_key=True),
        sa.Column("user_id", sa.String(length=36), nullable=True),
        sa.Column("action", sa.String(length=80), nullable=False),
        sa.Column("resource_type", sa.String(length=64), server_default="", nullable=False),
        sa.Column("resource_id", sa.String(length=128), server_default="", nullable=False),
        sa.Column("ip_address", sa.String(length=64), server_default="", nullable=False),
        sa.Column("user_agent", sa.String(length=512), server_default="", nullable=False),
        sa.Column("before", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("after", postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        schema=SCHEMA,
    )
    op.create_index("ix_iam_audit_logs_created", "audit_logs", ["created_at"], schema=SCHEMA)
    op.create_index("ix_iam_audit_logs_user", "audit_logs", ["user_id"], schema=SCHEMA)

    op.create_foreign_key(
        "fk_iam_users_primary_group",
        "users",
        "groups",
        ["primary_group_id"],
        ["id"],
        source_schema=SCHEMA,
        referent_schema=SCHEMA,
        ondelete="SET NULL",
    )


def downgrade() -> None:
    op.drop_constraint("fk_iam_users_primary_group", "users", schema=SCHEMA, type_="foreignkey")
    for table in (
        "audit_logs",
        "shares",
        "invitations",
        "password_reset_tokens",
        "sessions",
        "role_permissions",
        "group_roles",
        "user_groups",
        "permissions",
        "roles",
        "groups",
        "users",
    ):
        op.drop_table(table, schema=SCHEMA)
    op.execute(f'DROP SCHEMA IF EXISTS "{SCHEMA}" CASCADE')
