"""Load/save encrypted runtime settings and overlay onto Settings."""

from __future__ import annotations

from datetime import UTC, datetime
from threading import Lock

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import Settings, get_env_settings
from app.iam.models import RuntimeSetting
from app.settings_catalog import FIELD_BY_KEY, MANAGED_BY_KEY, MANAGED_SETTINGS
from app.settings_crypto import decrypt_value, encrypt_value, mask_secret

_lock = Lock()
_overrides: dict[str, str] = {}


def get_overrides() -> dict[str, str]:
    with _lock:
        return dict(_overrides)


def set_overrides(values: dict[str, str]) -> None:
    with _lock:
        global _overrides
        _overrides = dict(values)


def clear_overrides() -> None:
    set_overrides({})


def apply_overrides_to(base: Settings) -> Settings:
    overrides = get_overrides()
    if not overrides:
        return base
    update: dict[str, str] = {}
    for key, value in overrides.items():
        field = FIELD_BY_KEY.get(key)
        if field is not None:
            update[field] = value
    if not update:
        return base
    return base.model_copy(update=update)


def get_effective_settings() -> Settings:
    return apply_overrides_to(get_env_settings())


async def reload_overrides(session: AsyncSession) -> dict[str, str]:
    rows = (await session.scalars(select(RuntimeSetting))).all()
    values: dict[str, str] = {}
    for row in rows:
        if row.key not in MANAGED_BY_KEY:
            continue
        try:
            values[row.key] = decrypt_value(row.value_encrypted)
        except ValueError:
            continue
    set_overrides(values)
    return values


async def list_settings_for_api(
    session: AsyncSession,
    *,
    reveal_secrets: bool = False,
) -> list[dict]:
    await reload_overrides(session)
    overrides = get_overrides()
    base = get_env_settings()
    items: list[dict] = []
    for definition in MANAGED_SETTINGS:
        stored = overrides.get(definition.key)
        env_fallback = getattr(base, definition.settings_field, "") or ""
        raw = stored if stored is not None else str(env_fallback)
        source = "database" if stored is not None else ("environment" if env_fallback else "empty")
        display = raw
        if definition.is_secret and raw and not reveal_secrets:
            display = mask_secret(raw)
        items.append(
            {
                "key": definition.key,
                "label": definition.label,
                "category": definition.category,
                "description": definition.description,
                "is_secret": definition.is_secret,
                "placeholder": definition.placeholder,
                "value": display,
                "has_value": bool(raw),
                "source": source,
                "configured_in_db": stored is not None,
            }
        )
    return items


async def upsert_settings(
    session: AsyncSession,
    updates: dict[str, str | None],
    *,
    user_id: str | None,
) -> list[str]:
    """Upsert keys. Empty string or None deletes DB override (falls back to env)."""
    changed: list[str] = []
    for key, value in updates.items():
        definition = MANAGED_BY_KEY.get(key)
        if not definition:
            continue
        row = await session.get(RuntimeSetting, key)
        if value is None or value == "":
            if row:
                await session.delete(row)
                changed.append(key)
            continue
        ciphertext = encrypt_value(value)
        if row is None:
            session.add(
                RuntimeSetting(
                    key=key,
                    value_encrypted=ciphertext,
                    is_secret=definition.is_secret,
                    updated_by=user_id,
                    updated_at=datetime.now(UTC),
                )
            )
        else:
            row.value_encrypted = ciphertext
            row.is_secret = definition.is_secret
            row.updated_by = user_id
            row.updated_at = datetime.now(UTC)
        changed.append(key)
    await session.flush()
    return changed
