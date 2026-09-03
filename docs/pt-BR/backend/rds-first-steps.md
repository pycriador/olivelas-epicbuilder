---
title: "Primeiros passos RDS"
status: "DRAFT"
owner: "aiops-app-model"
created: "2026-08-19"
updated: "2026-08-19"
version: "1.0"
---

# Primeiros passos RDS — AIOPS App Model API

> Language: [English (EN)](../../en/backend/rds-first-steps.md) | Português (pt-BR)
>
> Status: DRAFT
>
> Documentation Standard v1.0 (adopter)

Primeiro marco do backend AIOPS App Model: conectar FastAPI ao PostgreSQL no AWS RDS e expor health probes.

Este documento está estruturado para publicação futura em `loft-br/aiops-documentation`.

## Objetivo

| Item | Meta |
| --- | --- |
| Marco | Validar conectividade RDS a partir da API |
| Código | `backend/app/db/session.py`, `backend/app/routers/health.py` |
| Sinal de sucesso | `GET /api/health/db` retorna `200` com `"database": "connected"` |

## Pré-requisitos

| Requisito | Notas |
| --- | --- |
| Ambiente Python local | [local-setup.md](local-setup.md) — `.venv`, `requirements.txt`, `uv sync` |
| Python 3.12+ | Padrão backend AIOps |
| uv | `curl -LsSf https://astral.sh/uv/install.sh \| sh` |
| Instância RDS PostgreSQL | Host, porta, database, usuário e senha do time de infra |
| Acesso de rede | Security group / VPN permitindo IP local ou cluster → RDS |

## Configuração

Nunca commite credenciais. Use apenas variáveis de ambiente.

### Opção A — URL única (recomendado)

```env
DATABASE_URL=postgresql+asyncpg://USER:PASSWORD@HOST.rds.amazonaws.com:5432/DATABASE
```

Copie de `backend/.env.example` para `backend/.env`, ou defina a mesma variável no `.env` na raiz do repositório.

### Opção B — campos separados

```env
DB_HOST=HOST.rds.amazonaws.com
DB_PORT=5432
DB_NAME=aiops_app_model
DB_USER=app_user
DB_PASSWORD=***
```

O loader de settings monta `postgresql+asyncpg://…` em runtime (`backend/app/config.py`).

## Setup local

```sh
cd backend
uv sync
cp .env.example .env
# preencha DATABASE_URL
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Base URL padrão do frontend: `VITE_API_URL=http://localhost:8000` (`.env.example` na raiz).

## Verificar conectividade

```sh
curl -s http://localhost:8000/api/health/db | jq .
# Esperado: {"status":"ok","database":"connected"}
```

Falha retorna `503` com payload JSON — verifique security groups, credenciais e requisitos SSL do RDS.

## Arquitetura (atual)

```mermaid
flowchart LR
  API[FastAPI app.main] --> Engine[SQLAlchemy async engine]
  Engine --> RDS[(PostgreSQL RDS)]
  Probe[GET /api/health/db] --> API
```

| Componente | Responsabilidade |
| --- | --- |
| `app/config.py` | Carrega `DATABASE_URL` ou DB_* do env |
| `app/db/session.py` | Engine, pool, probe `SELECT 1` |
| `app/routers/health.py` | Rotas de liveness e saúde do DB |
| `app/main.py` | Lifespan: criar/dispor engine |

## Fora de escopo (este marco)

| Item | Status |
| --- | --- |
| Migrations (Alembic) | Não implementado |
| Models / tabelas de domínio | Não implementado |
| Autenticação | Não implementado |
| Vault / secrets k8s | Documentar na fase de infra |

## Próximos passos (planejados)

1. Definir schema inicial (conteúdo do portal hoje em `localStorage`).
2. Adicionar migrations Alembic.
3. Conectar leitura/escrita do frontend à API.
4. Publicar este doc em `aiops-documentation` em `docs/*/aiops-apps/` ou seção dedicada ao AIOPS App Model.

## Relacionados

- [README.md](README.md)
- [../architecture/overview.md](../architecture/overview.md)
- [Backend stack AIOps (padrão)](https://github.com/loft-br/aiops-documentation/blob/main/docs/pt-BR/aiops-apps/backend-stack.md)
