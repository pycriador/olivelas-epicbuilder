---
title: "Schema e API"
status: "DRAFT"
owner: "aiops-app-model"
created: "2026-08-19"
updated: "2026-08-19"
version: "1.0"
---

# Schema e API do portal

> Language: [English (EN)](../../en/backend/schema-and-api.md) | Português (pt-BR)
>
> Status: DRAFT
>
> Documentation Standard v1.0 (adopter)

Schema de banco e endpoints REST para persistir conteúdo do portal AIOps App Model (substituindo `localStorage` do browser ao longo do tempo).

## Schema `portal`

| Tabela | Propósito | Chave primária |
| --- | --- | --- |
| `areas` | Áreas do mapa | `name` |
| `cases` | Cases de projetos de IA (JSON completo) | `id` |
| `case_meta` | Metadados do case (épico Jira, galeria, …) | `case_id` |
| `integrations` | Catálogo de integrações | `id` |
| `hub_content` | Conteúdo do AI Hub | `id` |
| `trilhas` | Trilhas de aprendizado | `id` |
| `aulas` | Aulas | `id` |
| `portal_settings` | Logos, status de aulas, listas deleted | `id=1` |

Models: `backend/app/models/portal.py`

Campos aninhados ficam em colunas **JSONB** (`payload`), alinhados aos tipos TypeScript em `src/data/types.ts`.

## Prefixo da API

Base URL: `VITE_API_URL` (padrão `http://localhost:8000`)

### Health

| Método | Path | Descrição |
| --- | --- | --- |
| GET | `/api/health/db` | Conectividade PostgreSQL |

### Snapshot do portal (bulk)

Espelha `PortalContentSnapshot` de `src/lib/content-store.ts`.

| Método | Path | Descrição |
| --- | --- | --- |
| GET | `/api/v1/portal/snapshot` | Carregar snapshot completo |
| PUT | `/api/v1/portal/snapshot` | Substituir snapshot completo |

### Cases, áreas, integrações, hub

Ver tabela completa em [schema-and-api EN](../../en/backend/schema-and-api.md) — mesmos paths.

### Integrações externas (Jira, Confluence, Gemini)

Credenciais: `JIRA_*`, `GEMINI_*`, `CONFLUENCE_STATUS_FOLDER_ID` na raiz `.env` ou `backend/.env`.

| Método | Path | Descrição |
| --- | --- | --- |
| GET | `/api/v1/diagnostics/integrations` | Diagnóstico Jira, Confluence, Gemini |
| GET | `/api/v1/confluence/spaces` | Listar spaces do Confluence |
| POST | `/api/v1/jira/issues/search` | Buscar issues de projeto |
| POST | `/api/v1/jira/import` | Importar rascunho de case do Jira |
| POST | `/api/v1/confluence/sync-case` | Sincronizar página de status |
| POST | `/api/v1/confluence/delete-case` | Excluir página de status |
| GET | `/api/jira-avatar?u=...` | Proxy de avatar Jira |
| GET | `/api/jira-attachment?id=...` | Proxy de anexo Jira |

Cliente frontend: `src/lib/integrations-api.ts`.

## Migrations

```sh
cd backend
uv run python scripts/run_migrations.py
uv run python scripts/grant_app_privileges.py
```

## Seed de dados de exemplo (opcional)

```sh
cd backend
uv run python scripts/seed_portal.py
```

Não sobrescreve dados se já existirem cases no banco.

## Relacionados

- [rds-provisioning.md](rds-provisioning.md)
- [README.md](README.md)
