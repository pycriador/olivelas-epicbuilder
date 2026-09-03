---
title: "Documentação do backend"
status: "DRAFT"
owner: "aiops-app-model"
updated: "2026-08-19"
---

# Documentação do backend

> Language: [English (EN)](../../en/backend/README.md) | Português (pt-BR)
>
> Status: DRAFT
>
> Documentation Standard v1.0 (adopter)

Documentação rascunho do backend AIOps App Model. Destinada a ser promovida depois para [loft-br/aiops-documentation](https://github.com/loft-br/aiops-documentation) no pack AIOps apps.

**Candidato a promoção:** [../aiops-apps/backend-creation-guide.md](../aiops-apps/backend-creation-guide.md) — guia genérico AIOps com arquivos de exemplo.

## Stack

| Item | Escolha | Classificação |
| --- | --- | --- |
| Linguagem | Python 3.12+ | Confirmed |
| Framework | FastAPI + uvicorn | Confirmed — Família B AIOps |
| Gerenciador de pacotes | uv | Confirmed |
| Banco | PostgreSQL (AWS RDS) via SQLAlchemy async + asyncpg | Confirmed |
| Localização | pasta `backend/` no monorepo | Confirmed |

Referência: [backend-stack AIOps](https://github.com/loft-br/aiops-documentation/blob/main/docs/pt-BR/aiops-apps/backend-stack.md).

## Documentos

| Tópico | EN | pt-BR |
| --- | --- | --- |
| Setup local (venv, requirements) | [local-setup.md](../../en/backend/local-setup.md) | [local-setup.md](local-setup.md) |
| Primeiros passos RDS | [rds-first-steps.md](../../en/backend/rds-first-steps.md) | [rds-first-steps.md](rds-first-steps.md) |
| Provisionamento RDS | [rds-provisioning.md](../../en/backend/rds-provisioning.md) | [rds-provisioning.md](rds-provisioning.md) |
| Schema e API | [schema-and-api.md](../../en/backend/schema-and-api.md) | [schema-and-api.md](schema-and-api.md) |

## Health endpoints

Alinhados às convenções de probe k8s AIOps:

| Path | Propósito |
| --- | --- |
| `/health` | Liveness |
| `/api/health` | Liveness (prefixo API) |
| `/health/db` | Conectividade PostgreSQL |
| `/api/health/db` | Mesmo sob prefixo API |

## Relacionados

- [../operations/local-development.md](../operations/local-development.md)
- [../project-overview.md](../project-overview.md)
- README do backend: `backend/README.md`
