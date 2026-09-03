"""Runtime settings encryption and overlay."""

from __future__ import annotations

from app.config import Settings, clear_settings_cache, get_env_settings
from app.settings_crypto import decrypt_value, encrypt_value, mask_secret
from app.settings_store import apply_overrides_to, clear_overrides, set_overrides


def test_fernet_roundtrip(monkeypatch):
    clear_settings_cache()
    monkeypatch.setenv("JWT_SECRET", "unit-test-secret-with-enough-length-32")
    clear_settings_cache()
    ciphertext = encrypt_value("super-secret-token")
    assert ciphertext != "super-secret-token"
    assert decrypt_value(ciphertext) == "super-secret-token"
    clear_settings_cache()


def test_mask_secret():
    assert mask_secret("") == ""
    assert mask_secret("ab") == "••••"
    assert mask_secret("token-abcdef") == "••••••••cdef"


def test_apply_overrides_to_settings(monkeypatch):
    clear_settings_cache()
    clear_overrides()
    monkeypatch.setenv("JWT_SECRET", "unit-test-secret-with-enough-length-32")
    monkeypatch.setenv("JIRA_API_TOKEN", "from-env")
    clear_settings_cache()

    base = get_env_settings()
    assert base.jira_api_token == "from-env"

    set_overrides({"JIRA_API_TOKEN": "from-db", "APP_NAME": "AIOPS DB"})
    effective = apply_overrides_to(base)
    assert isinstance(effective, Settings)
    assert effective.jira_api_token == "from-db"
    assert effective.app_name == "AIOPS DB"
    assert effective.jira_api_token != base.jira_api_token

    clear_overrides()
    clear_settings_cache()
