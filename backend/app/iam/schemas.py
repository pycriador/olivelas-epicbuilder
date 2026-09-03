from __future__ import annotations

from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field, field_validator


def _require_email(value: str) -> str:
    text = value.strip().lower()
    if "@" not in text or "." not in text.split("@", 1)[-1]:
        raise ValueError("Invalid email address")
    return text


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    must_change_password: bool = False


class LoginRequest(BaseModel):
    login: str = Field(min_length=1)
    password: str = Field(min_length=1)
    remember_me: bool = False


class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str = Field(min_length=8)


class ForgotPasswordRequest(BaseModel):
    email: str

    @field_validator("email")
    @classmethod
    def _email(cls, value: str) -> str:
        return _require_email(value)


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(min_length=8)


class FirstAccessRequest(BaseModel):
    new_password: str = Field(min_length=8)


class UserPublic(BaseModel):
    id: str
    first_name: str
    last_name: str
    username: str
    email: str
    photo_url: str | None = None
    status: str
    primary_group_id: str | None = None
    locale: str
    timezone: str
    must_change_password: bool
    email_verified: bool
    groups: list[str] = []
    permissions: list[str] = []
    is_admin: bool = False
    last_login_at: datetime | None = None
    created_at: datetime | None = None


class UserCreate(BaseModel):
    first_name: str
    last_name: str
    username: str
    email: str
    password: str = Field(min_length=8)
    photo_url: str | None = None
    status: str = "active"
    primary_group_id: str | None = None
    group_ids: list[str] = []
    locale: str = "pt-BR"
    timezone: str = "America/Sao_Paulo"
    must_change_password: bool = True

    @field_validator("email")
    @classmethod
    def _email(cls, value: str) -> str:
        return _require_email(value)


class UserUpdate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    username: str | None = None
    email: str | None = None
    photo_url: str | None = None
    status: str | None = None
    primary_group_id: str | None = None
    group_ids: list[str] | None = None
    locale: str | None = None
    timezone: str | None = None
    must_change_password: bool | None = None
    password: str | None = Field(default=None, min_length=8)

    @field_validator("email")
    @classmethod
    def _email(cls, value: str | None) -> str | None:
        return None if value is None else _require_email(value)


class GroupCreate(BaseModel):
    name: str
    description: str = ""
    color: str = "#FF774A"
    icon: str = "team"
    status: str = "active"
    role_ids: list[str] = []


class GroupUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    color: str | None = None
    icon: str | None = None
    status: str | None = None
    role_ids: list[str] | None = None


class GroupPublic(BaseModel):
    id: str
    name: str
    description: str
    color: str
    icon: str
    status: str
    is_system: bool
    role_ids: list[str] = []
    created_at: datetime | None = None


class RoleCreate(BaseModel):
    name: str
    description: str = ""
    priority: int = 100
    status: str = "active"
    permission_ids: list[str] = []


class RoleUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    priority: int | None = None
    status: str | None = None
    permission_ids: list[str] | None = None


class RolePublic(BaseModel):
    id: str
    name: str
    description: str
    priority: int
    status: str
    is_system: bool
    permission_ids: list[str] = []
    created_at: datetime | None = None


class PermissionCreate(BaseModel):
    name: str
    code: str
    category: str
    description: str = ""


class PermissionUpdate(BaseModel):
    name: str | None = None
    code: str | None = None
    category: str | None = None
    description: str | None = None


class PermissionPublic(BaseModel):
    id: str
    name: str
    code: str
    category: str
    description: str


class MatrixUpdate(BaseModel):
    permission_ids: list[str]


class SessionPublic(BaseModel):
    id: str
    user_id: str
    ip_address: str
    browser: str
    os: str
    user_agent: str
    remember_me: bool
    created_at: datetime
    last_seen_at: datetime
    expires_at: datetime
    current: bool = False


class AuditLogPublic(BaseModel):
    id: str
    user_id: str | None
    action: str
    resource_type: str
    resource_id: str
    ip_address: str
    user_agent: str
    before: dict[str, Any] | None = None
    after: dict[str, Any] | None = None
    created_at: datetime


class InvitationCreate(BaseModel):
    email: str
    group_id: str | None = None
    expires_in_hours: int = 72

    @field_validator("email")
    @classmethod
    def _email(cls, value: str) -> str:
        return _require_email(value)


class InvitationPublic(BaseModel):
    id: str
    email: str
    group_id: str | None
    status: str
    expires_at: datetime
    accepted_at: datetime | None = None
    created_at: datetime
    invite_token: str | None = None


class AcceptInvitationRequest(BaseModel):
    token: str
    first_name: str
    last_name: str
    username: str
    password: str = Field(min_length=8)


class ShareCreate(BaseModel):
    resource_type: str
    resource_id: str
    permission: Literal["read", "comment", "edit", "admin"]
    grantee_type: Literal["user", "group"]
    grantee_id: str


class SharePublic(BaseModel):
    id: str
    resource_type: str
    resource_id: str
    permission: str
    grantee_type: str
    grantee_id: str
    granted_by: str | None
    created_at: datetime


class DashboardStats(BaseModel):
    users: int
    groups: int
    permissions: int
    sessions: int
    pending_invitations: int
    recent_logs: list[AuditLogPublic] = []


class Page(BaseModel):
    items: list[Any]
    total: int
    page: int
    page_size: int
