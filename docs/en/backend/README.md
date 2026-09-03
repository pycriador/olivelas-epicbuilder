---
title: "Backend documentation"
status: "DRAFT"
owner: "aiops-app-model"
updated: "2026-08-19"
---

# Backend documentation

> Language: EN | [Português (pt-BR)](../../pt-BR/backend/README.md)
>
> Status: DRAFT
>
> Documentation Standard v1.0 (adopter)

Draft documentation for the AIOps App Model backend. Intended to be promoted later into [loft-br/aiops-documentation](https://github.com/loft-br/aiops-documentation) under the AIOps apps pack.

**Promotion candidate:** [../aiops-apps/backend-creation-guide.md](../aiops-apps/backend-creation-guide.md) — generic AIOps backend guide with example files.

## Stack

| Item | Choice | Classification |
| --- | --- | --- |
| Language | Python 3.12+ | Confirmed |
| Framework | FastAPI + uvicorn | Confirmed — AIOps Family B |
| Package manager | uv | Confirmed |
| Database | PostgreSQL (AWS RDS) via SQLAlchemy async + asyncpg | Confirmed |
| Location | `backend/` monorepo folder | Confirmed |

Reference: [aiops-apps backend-stack](https://github.com/loft-br/aiops-documentation/blob/main/docs/en/aiops-apps/backend-stack.md).

## Documents

| Topic | EN | pt-BR |
| --- | --- | --- |
| Local setup (venv, requirements) | [local-setup.md](local-setup.md) | [local-setup.md](../../pt-BR/backend/local-setup.md) |
| RDS first steps | [rds-first-steps.md](rds-first-steps.md) | [rds-first-steps.md](../../pt-BR/backend/rds-first-steps.md) |
| RDS provisioning | [rds-provisioning.md](rds-provisioning.md) | [rds-provisioning.md](../../pt-BR/backend/rds-provisioning.md) |
| Schema and API | [schema-and-api.md](schema-and-api.md) | [schema-and-api.md](../../pt-BR/backend/schema-and-api.md) |

## Health endpoints

Aligned with AIOps k8s probe conventions:

| Path | Purpose |
| --- | --- |
| `/health` | Liveness |
| `/api/health` | Liveness (API prefix) |
| `/health/db` | PostgreSQL connectivity |
| `/api/health/db` | Same under API prefix |

## Related

- [../operations/local-development.md](../operations/local-development.md)
- [../project-overview.md](../project-overview.md)
- Backend README: `backend/README.md`
