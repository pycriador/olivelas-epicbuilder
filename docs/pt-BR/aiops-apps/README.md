---
title: "Olivelas apps — guia de backend (rascunho para aiops-documentation)"
status: "DRAFT"
owner: "olivelas"
updated: "2026-11-07"
---

# Olivelas apps — guia de criação de backend (rascunho)

> Language: [English (EN)](../../en/aiops-apps/README.md) | Português (pt-BR)
>
> Status: DRAFT — candidato a promoção para [loft-br/aiops-documentation](https://github.com/loft-br/aiops-documentation)

Esta pasta espelha o caminho alvo em `aiops-documentation`: `docs/*/aiops-apps/`.

## Documentos

| Tópico | EN | pt-BR |
| --- | --- | --- |
| **Guia de criação de backend** | [backend-creation-guide.md](../../en/aiops-apps/backend-creation-guide.md) | [backend-creation-guide.md](backend-creation-guide.md) |
| Arquivos de exemplo | [examples/README.md](../../en/aiops-apps/examples/README.md) | [examples/README.md](examples/README.md) |

## Docs específicos do adotador

Runbooks detalhados do Olivelas App Model (scripts RDS, schema) ficam em [../backend/README.md](../backend/README.md) até promoção como subpack `aiops-apps/aiops-app-model/`.

## Checklist do PR de promoção

1. Copiar `backend-creation-guide.md` + `examples/` para aiops-documentation (EN + pt-BR).
2. Atualizar `aiops-apps/README.md` e `manifest.yaml` (`REF-AIOPS-APPS-008`).
3. Linkar a partir de `backend-stack.md`.
4. Rodar `make docs-validate`.
