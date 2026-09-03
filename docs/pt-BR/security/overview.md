---
title: "Visão geral de segurança"
status: "DRAFT"
owner: "aiops-app-model"
updated: "2026-08-20"
---

# Visão geral de segurança

> Language: [English (EN)](../../en/security/overview.md) | Português (pt-BR)
>
> Status: DRAFT

## Autenticação (Confirmed)

O AIOps App Model implementa IAM de aplicação no schema `iam` (PostgreSQL) com:

- Credenciais locais (hash Argon2id)
- Access tokens JWT de curta duração (header Bearer e/ou cookie `access_token`)
- Refresh tokens em cookies HttpOnly com rotação em `/api/v1/auth/refresh`
- Sessões (IP, user-agent, navegador, SO) com revogação / logout global
- Bloqueio temporário após falhas de login
- Fluxos de primeiro acesso e recuperação de senha

O admin inicial é criado por `backend/scripts/seed_iam.py` com variáveis `IAM_ADMIN_*`.

## Autorização (Confirmed)

- Códigos de permissão (ex.: `cases.edit`, `iam.admin`) via Roles → Grupos → Usuários
- Grupos de sistema: **Administrador** (acesso total) e **Editores** (conteúdo do portal, sem IAM crítico)
- Dependências FastAPI: `require_login` / `require_perm` (desligáveis com `REQUIRE_AUTH=false` em testes)

## Front-end (Confirmed)

- Rotas públicas: `/`, `/login`, `/esqueci-senha`, `/redefinir-senha`
- Portal autenticado em `/portal`
- Admin IAM em `/admin/iam/*`

## Segredos

Nunca versionar `JWT_SECRET` ou senhas reais. Em produção use Vault/env (`COOKIE_SECURE=true`).

## Configurações em runtime (Confirmed)

Integrações e opções da aplicação (Jira, Confluence, Gemini, CORS, `APP_NAME`) podem ser gerenciadas em **Admin → Configurações** (`/admin/iam/settings`) com a permissão `settings.manage`.

- Persistidas em `iam.runtime_settings`, cifradas com Fernet (`SETTINGS_ENCRYPTION_KEY` ou fallback `JWT_SECRET`)
- O `.env` continua como fallback quando não há sobrescrita no banco
- Segredos de bootstrap ficam só no env: `DATABASE_*`, `JWT_SECRET`, `SETTINGS_ENCRYPTION_KEY`
- O middleware CORS é montado no startup da API — alterar CORS na UI exige reinício
- APIs: `GET/PUT /api/v1/settings` (auditoria: `settings.update`, `settings.reveal`)
