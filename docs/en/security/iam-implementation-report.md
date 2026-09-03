# IAM — Relatório final de implementação

**Data:** 2026-08-20  
**Branch alvo:** `v0.1`  
**Status:** Implementado (local JWT/RBAC). SSO Loft = Unknown / futuro.

## Critérios de aceitação

| Critério | Status |
| --- | --- |
| Análise do projeto antes do desenvolvimento | Feito (plano + este relatório) |
| Funcionalidades existentes preservadas (cases/áreas/Jira) | Sim — protegidas por permissões |
| Autenticação Front ↔ Backend segura (JWT + refresh cookie + Argon2id) | Sim |
| CRUD Users / Groups / Roles / Permissions | Sim (`/api/v1/iam/*` + UI `/admin/iam/*`) |
| Grupos Administrador e Editores criados no seed | Sim (`scripts/seed_iam.py`) |
| Sharing + Invitations | Sim (API + telas) |
| Sessões + auditoria | Sim |
| APIs protegidas por AuthN/Z | Sim (`REQUIRE_AUTH=true`) |
| Testes | `pytest` — suite existente + `tests/test_iam_auth.py` (17 passed) |
| Documentação | `docs/en|pt-BR/security/overview.md`, README, backend README |

## Como ativar localmente

1. Migrar: `cd backend && uv run alembic upgrade head`
2. Grants: `uv run python scripts/grant_app_privileges.py` (após migration `iam`)
3. Seed: `uv run python scripts/seed_iam.py`
4. Configurar `JWT_SECRET` (≥32 chars) e `IAM_ADMIN_PASSWORD` em `backend/.env`
5. Front: login em `/login` → portal em `/portal` → IAM em `/admin/iam`

Credenciais padrão de bootstrap (apenas dev): `admin` / `ChangeMe123!` (`admin@loft.local`) — **trocar no primeiro acesso**.

## Principais artefatos

- Migration: `backend/alembic/versions/003_iam_schema.py`
- Backend: `backend/app/iam/*`
- Front: `src/auth/*`, `src/lib/auth-api.ts`, rotas `login`/`portal`/`admin.iam.*`
- Guards: `backend/app/iam/guards.py` aplicados em routers portal/cases/áreas/etc.

## Fora deste ciclo / próximo passo

- Integração SSO/OIDC Loft (substituir AuthN local mantendo RBAC)
- Rate limiting no ingress (não no app)
- E-mail real para forgot-password / convites (hoje token exposto com `EXPOSE_DEV_TOKENS`)
