"""Encrypt/decrypt runtime settings at rest (Fernet)."""

from __future__ import annotations

import base64
import hashlib

from cryptography.fernet import Fernet, InvalidToken

from app.config import get_env_settings


def _fernet() -> Fernet:
    settings = get_env_settings()
    raw = (settings.settings_encryption_key or settings.jwt_secret or "").encode("utf-8")
    if not raw:
        raise RuntimeError("SETTINGS_ENCRYPTION_KEY or JWT_SECRET is required to store settings")
    # Derive a stable 32-byte url-safe key from the configured secret.
    digest = hashlib.sha256(raw).digest()
    key = base64.urlsafe_b64encode(digest)
    return Fernet(key)


def encrypt_value(plaintext: str) -> str:
    return _fernet().encrypt(plaintext.encode("utf-8")).decode("ascii")


def decrypt_value(ciphertext: str) -> str:
    try:
        return _fernet().decrypt(ciphertext.encode("ascii")).decode("utf-8")
    except InvalidToken as exc:
        raise ValueError("Unable to decrypt setting — check SETTINGS_ENCRYPTION_KEY") from exc


def mask_secret(value: str) -> str:
    if not value:
        return ""
    if len(value) <= 4:
        return "••••"
    return f"••••••••{value[-4:]}"
