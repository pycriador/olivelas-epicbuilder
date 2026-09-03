---
title: "Security overview"
status: "DRAFT"
owner: "aiops-app-model"
updated: "2026-08-20"
---

# Security overview

> Language: EN | [Português (pt-BR)](../../pt-BR/security/overview.md)
>
> Status: DRAFT

## Authentication (Confirmed)

AIOPS App Model implements application IAM on schema `iam` (PostgreSQL) with:

- Local credentials (Argon2id password hashing)
- Short-lived JWT access tokens (Bearer header and/or `access_token` cookie)
- Refresh tokens in HttpOnly cookies with rotation on `/api/v1/auth/refresh`
- Session records (IP, user-agent, browser, OS) with revoke / logout-all
- Login lockout after repeated failures
- First-access and password reset flows

Bootstrap admin is created by `backend/scripts/seed_iam.py` using `IAM_ADMIN_*` env vars.

## Authorization (Confirmed)

- Permission codes (e.g. `cases.edit`, `iam.admin`) assigned via Roles → Groups → Users
- System groups: **Administrador** (allow-all) and **Editores** (portal content, no critical IAM)
- FastAPI dependencies: `require_login` / `require_perm` (skipped when `REQUIRE_AUTH=false` for tests)

## Frontend gates (Confirmed)

- Public routes: `/`, `/login`, `/esqueci-senha`, `/redefinir-senha`
- Authenticated portal at `/portal`
- IAM admin UI under `/admin/iam/*`
- Content admin (`/admin/adicionar-*`) remains; menu gated by permissions

## Secrets

Never commit real `JWT_SECRET` or admin passwords. Use environment / Vault in production (`COOKIE_SECURE=true`).

## Runtime settings (Confirmed)

Integration and app settings (Jira, Confluence, Gemini, CORS, `APP_NAME`) can be managed in **Admin → Configurações** (`/admin/iam/settings`) with permission `settings.manage`.

- Stored in `iam.runtime_settings`, encrypted at rest with Fernet (`SETTINGS_ENCRYPTION_KEY` or fallback `JWT_SECRET`)
- Environment / `.env` remains the fallback when no DB override exists
- Bootstrap secrets stay in env only: `DATABASE_*`, `JWT_SECRET`, `SETTINGS_ENCRYPTION_KEY`
- CORS middleware is built at API startup — changing CORS in the UI requires an API restart
- APIs: `GET/PUT /api/v1/settings` (audit: `settings.update`, `settings.reveal`)

## Related

- Migrations: `003_iam_schema`, `004_runtime_settings`
- APIs: `/api/v1/auth/*`, `/api/v1/iam/*`, `/api/v1/settings`
