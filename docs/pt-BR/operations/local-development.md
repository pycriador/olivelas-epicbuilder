---
title: "Desenvolvimento local"
status: "DRAFT"
owner: "olivelas"
created: "2026-08-19"
updated: "2026-11-07"
version: "1.0"
---

# Desenvolvimento local

> Language: [English (EN)](../en/operations/local-development.md) | Português (pt-BR)
>
> Status: DRAFT
>
> Documentation Standard v1.0 (adopter)

## Branch de desenvolvimento ativo

Persistência no backend e integrações externas (Jira, Confluence, Gemini) são desenvolvidas no branch **`v0.1`**. Não fazer merge na `main` até validar o milestone:

```sh
git checkout v0.1
```

## Pré-requisitos

| Requisito | Versão / notas |
| --- | --- |
| Node.js | Compatível com Vite 8 / React 19 (LTS recomendado) |
| npm | Incluso com Node |
| Python | 3.12+ (só backend) — ver [setup local do backend](../backend/local-setup.md) |
| Git | Clone `https://github.com/pycriador/olivelas-epicbuilder` |

## Início rápido (frontend)

```sh
git clone https://github.com/pycriador/olivelas-epicbuilder.git
cd olivelas-epicbuilder
npm i
cp .env.example .env
# Edite .env: VITE_API_URL, Jira/Gemini se necessário
npm run dev
```

Abra a URL impressa pelo Vite (tipicamente `http://localhost:5173` — **Inferred**, a porta pode variar).

## Início rápido (frontend + backend)

```sh
# Terminal 1 — backend (ver ../backend/local-setup.md)
cd backend
uv sync --group dev
cp .env.example .env
uv run uvicorn app.main:app --reload --port 8000

# Terminal 2 — frontend (raiz do monorepo)
cp .env.example .env   # VITE_API_URL=http://localhost:8000
npm run dev
```

## Scripts

| Comando | Propósito |
| --- | --- |
| `npm run dev` | Servidor de dev Vite com TanStack Start |
| `npm run build` | Build de produção (Nitro via config Lovable) |
| `npm run build:dev` | Build em modo development |
| `npm run preview` | Preview local do build de produção |
| `npm run lint` | ESLint |
| `npm run format` | Prettier write |

Fonte: `package.json`.

## Variáveis de ambiente

Copie `.env.example` para `.env`. **Nunca commite `.env`.**

| Variável | Necessária para | Descrição |
| --- | --- | --- |
| `VITE_API_URL` | Conteúdo do portal | URL base do FastAPI (padrão: `http://localhost:8000`) |
| `JIRA_BASE_URL` | Jira + Confluence | URL do site Atlassian (ex.: `https://sua-org.atlassian.net`) |
| `JIRA_EMAIL` | Jira + Confluence | E-mail da conta Atlassian |
| `JIRA_API_TOKEN` | Jira + Confluence | Token de API nas configurações da conta Atlassian |
| `GEMINI_API_KEY` | Pipeline de import Jira | API key do Google AI Studio |
| `GEMINI_MODEL` | Pipeline de import Jira | Id do modelo (padrão: `gemini-3.1-flash-lite`) |
| `CONFLUENCE_STATUS_FOLDER_ID` | Sync Confluence | Id da pasta raiz de status (padrão no example: `6105464844`) |
| `DB_*` (`.env` raiz) | Bootstrap RDS | Credenciais admin para `backend/scripts/provision_rds.py` |

Runtime do backend usa `backend/.env` (role da aplicação). Ver [setup local do backend](../backend/local-setup.md).

Credenciais de integração (`JIRA_*`, `GEMINI_*`, `CONFLUENCE_STATUS_FOLDER_ID`) são lidas pelo **backend FastAPI** (`backend/app/config.py`). O frontend precisa apenas de `VITE_API_URL`.

## Disponibilidade sem credenciais

| Funcionalidade | Funciona offline / sem `.env`? |
| --- | --- |
| Navegar páginas do portal | Parcial — precisa da API ou cache de sessão; banner se API offline |
| Editar conteúdo do portal | Não — persiste na API snapshot |
| Import Jira, sync Confluence, status de integrações | Não — exige credenciais Atlassian + Gemini |
| Proxy de anexo/avatar Jira | Não |

## Workflow Lovable

Este repositório sincroniza com [Lovable](https://lovable.dev). Commits pushados aparecem no editor Lovable. Evite force-push ou reescrita de histórico Git publicado — veja `AGENTS.md`.

No preview/produção hospedados, configure as mesmas variáveis como **secrets de runtime** no Lovable (não no Git).

## Troubleshooting

| Sintoma | Causa provável | Ação |
| --- | --- | --- |
| Banner offline no portal | Backend parado | Subir uvicorn; conferir `VITE_API_URL` |
| Import falha por credenciais ausentes | `.env` vazio | Preencher variáveis Atlassian + Gemini |
| Escrita Confluence falha | Id de pasta ou permissões incorretos | Verificar `CONFLUENCE_STATUS_FOLDER_ID` e escopos do token |
| Portal vazio após install | RDS não provisionado / sem dados | Rodar provisionamento RDS; cadastrar conteúdo no admin |
| SSR 500 com página HTML de erro | Throw em server function | Ver logs do terminal; `src/lib/error-capture.ts` |

## Documentação relacionada

| Documento | Caminho |
| --- | --- |
| Setup local do backend | [../backend/local-setup.md](../backend/local-setup.md) |
| Contexto para IA | [../ai-context.md](../ai-context.md) |
| Rotas | [../application/routes.md](../application/routes.md) |
| Visão geral do projeto | [../project-overview.md](../project-overview.md) |
