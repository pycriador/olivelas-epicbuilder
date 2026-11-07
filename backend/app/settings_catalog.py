"""Catalog of settings manageable via admin UI (stored encrypted in DB).

Bootstrap secrets (DATABASE_*, JWT_SECRET, SETTINGS_ENCRYPTION_KEY) stay in .env only.
"""

from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class SettingDefinition:
    key: str
    label: str
    category: str
    description: str
    is_secret: bool
    settings_field: str
    placeholder: str = ""


# Env-style keys mapped to Settings field names.
MANAGED_SETTINGS: tuple[SettingDefinition, ...] = (
    SettingDefinition(
        key="JIRA_BASE_URL",
        label="URL base do Jira",
        category="Integrações",
        description="Ex.: https://sua-empresa.atlassian.net",
        is_secret=False,
        settings_field="jira_base_url",
        placeholder="https://olivelas.atlassian.net",
    ),
    SettingDefinition(
        key="JIRA_EMAIL",
        label="E-mail da conta Jira",
        category="Integrações",
        description="Conta de serviço usada na API Atlassian",
        is_secret=False,
        settings_field="jira_email",
    ),
    SettingDefinition(
        key="JIRA_API_TOKEN",
        label="Token da API Jira",
        category="Integrações",
        description="API token Atlassian (nunca exibido em claro após salvar)",
        is_secret=True,
        settings_field="jira_api_token",
    ),
    SettingDefinition(
        key="CONFLUENCE_STATUS_FOLDER_ID",
        label="ID da pasta Confluence",
        category="Integrações",
        description="Pasta Status Projetos Olivelas no Confluence",
        is_secret=False,
        settings_field="confluence_status_folder_id",
    ),
    SettingDefinition(
        key="GEMINI_API_KEY",
        label="Chave API Gemini",
        category="Integrações",
        description="Google Gemini API key",
        is_secret=True,
        settings_field="gemini_api_key",
    ),
    SettingDefinition(
        key="GEMINI_MODEL",
        label="Modelo Gemini",
        category="Integrações",
        description="Nome do modelo usado nos drafts",
        is_secret=False,
        settings_field="gemini_model",
        placeholder="gemini-3.1-flash-lite",
    ),
    SettingDefinition(
        key="CORS_ORIGINS",
        label="Origens CORS",
        category="Aplicação",
        description="Lista separada por vírgula de origins permitidas",
        is_secret=False,
        settings_field="cors_origins",
    ),
    SettingDefinition(
        key="APP_NAME",
        label="Nome da API",
        category="Aplicação",
        description="Título exposto no OpenAPI",
        is_secret=False,
        settings_field="app_name",
    ),
)

MANAGED_BY_KEY = {item.key: item for item in MANAGED_SETTINGS}
FIELD_BY_KEY = {item.key: item.settings_field for item in MANAGED_SETTINGS}
