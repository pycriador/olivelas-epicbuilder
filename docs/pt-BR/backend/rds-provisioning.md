---
title: "Provisionamento RDS"
status: "DRAFT"
owner: "aiops-app-model"
created: "2026-08-19"
updated: "2026-08-19"
version: "1.0"
---

# Provisionamento RDS — AIOps App Model

> Language: [English (EN)](../../en/backend/rds-provisioning.md) | Português (pt-BR)
>
> Status: DRAFT
>
> Documentation Standard v1.0 (adopter)

Guia para provisionar banco PostgreSQL dedicado, usuário de aplicação e schema na instância RDS AIOps compartilhada. Estruturado para inclusão futura em `loft-br/aiops-documentation`.

## Visão geral

| Artefato | Valor | Classificação |
| --- | --- | --- |
| Host RDS | Da infra (`DB_HOST`) | Confirmed |
| Role admin | `postgres` (bootstrap apenas) | Confirmed |
| Database da aplicação | `aiops_app_model` | Confirmed |
| Role da aplicação | `aiops_app_model_app` | Confirmed |
| Schema da aplicação | `portal` | Confirmed |

**Princípio:** credenciais admin fazem bootstrap; o runtime da API usa role de app com least privilege em `backend/.env` (nunca commitado).

## Modelo de credenciais

| Arquivo | Propósito | Commitado? |
| --- | --- | --- |
| `.env` na raiz | Credenciais **admin** RDS | Não |
| `backend/.env` | Credenciais da **aplicação** | Não |
| `backend/.env.example` | Apenas nomes de variáveis | Sim |

## Passo 1 — Credenciais admin

Coloque credenciais admin no `.env` da raiz (provisionamento e migrations):

```env
DB_HOST=seu-host-rds
DB_PORT=5432
DB_NAME=aiops
DB_USER=postgres
DB_PASSWORD=***
```

## Passo 2 — Provisionar banco, usuário e schema

```sh
cd backend
set -a && source ../.env && set +a
uv run python scripts/provision_rds.py
```

Script: `backend/scripts/provision_rds.py`

Ações:

1. `CREATE DATABASE aiops_app_model` (se não existir)
2. `CREATE ROLE aiops_app_model_app` com senha gerada
3. `CREATE SCHEMA portal`
4. Grants de conexão, schema e default privileges
5. Escreve `backend/.env` (`chmod 600`)

## Passo 3 — Migrations (admin)

```sh
uv run python scripts/run_migrations.py
```

Usa credenciais admin do `.env` raiz apontando para `aiops_app_model`.

## Passo 4 — Grants nas tabelas migradas

```sh
uv run python scripts/grant_app_privileges.py
```

## Passo 5 — Verificar

```sh
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
curl -s http://localhost:8000/api/health/db
curl -s http://localhost:8000/api/v1/portal/snapshot
```

## Troubleshooting

| Erro | Causa | Ação |
| --- | --- | --- |
| `must be able to SET ROLE` | Admin RDS sem superuser | Usar grants (script atual) |
| `permission denied for database` / `CREATE SCHEMA "iam"` | Migration com role da app | Usar `uv run python scripts/run_migrations.py` (admin no `.env` da raiz), depois `grant_app_privileges.py` |
| `permission denied for schema portal` | Role app sem grants | Re-executar `grant_app_privileges.py` |
| `503` em `/api/health/db` | `backend/.env` ou rede incorretos | Verificar credenciais e security groups |

## Segurança

- Rotacionar senha do app re-executando `provision_rds.py`.
- Nunca commitar `.env` raiz ou `backend/.env`.
- Em Kubernetes, usar Vault / secrets de runtime.

## Relacionados

- [rds-first-steps.md](rds-first-steps.md)
- [schema-and-api.md](schema-and-api.md)
