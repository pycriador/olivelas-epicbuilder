---
title: "Olivelas apps — backend guide (draft for aiops-documentation)"
status: "DRAFT"
owner: "olivelas"
updated: "2026-11-07"
---

# Olivelas apps — backend creation guide (draft)

> Language: EN | [Português (pt-BR)](../../pt-BR/aiops-apps/README.md)
>
> Status: DRAFT — candidate for promotion to [loft-br/aiops-documentation](https://github.com/loft-br/aiops-documentation)

This folder mirrors the target path in `aiops-documentation`: `docs/*/aiops-apps/`.

## Documents

| Topic | EN | pt-BR |
| --- | --- | --- |
| **Backend creation guide** | [backend-creation-guide.md](backend-creation-guide.md) | [backend-creation-guide.md](../../pt-BR/aiops-apps/backend-creation-guide.md) |
| Example files | [examples/README.md](examples/README.md) | [examples/README.md](../../pt-BR/aiops-apps/examples/README.md) |

## Adopter-specific backend docs

Detailed runbooks for Olivelas App Model (RDS scripts, schema) remain under [../backend/README.md](../backend/README.md) until promoted as `aiops-apps/aiops-app-model/` subpack.

## Promotion PR checklist

1. Copy `backend-creation-guide.md` + `examples/` to aiops-documentation (EN + pt-BR).
2. Update `aiops-apps/README.md` and `manifest.yaml` (`REF-AIOPS-APPS-008`).
3. Link from `backend-stack.md`.
4. Run `make docs-validate`.
