---
id: REF-AIOPS-APPS-008
title: Guia de criação de backend AIOps
type: Reference
status: DRAFT
owner: aiops
created: 2026-08-19
updated: 2026-08-19
authority: Verified
classification: Confirmed
tags:
  - aiops-apps
  - backend
  - guide
  - fastapi
  - rds
related:
  - aiops-apps/overview.md
  - aiops-apps/backend-stack.md
  - aiops-apps/security.md
  - loft-infra/checklist-novo-servico.md
---

# Guia de criação de backend AIOps

> Language: [English (EN)](../../en/aiops-apps/backend-creation-guide.md) | Português (pt-BR)
>
> Status: DRAFT
>
> Documentation Standard v1.0
>
> Authority: Verified

**Propósito:** guia prático para times que estão subindo um backend AIOps — **não** é um padrão fixo. Use como checklist e ponto de partida; adapte nomes, rotas e schema ao seu produto.

**Implementação de referência:** [loft-br/aiops-app-model](https://github.com/loft-br/aiops-app-model) (pasta `backend/`, agosto/2026).

**Docs Loft relacionados (autoridade para escolha de stack):**

- [Visão geral AIOps apps](https://github.com/loft-br/aiops-documentation/blob/main/docs/pt-BR/aiops-apps/overview.md)
- [Famílias de backend](https://github.com/loft-br/aiops-documentation/blob/main/docs/pt-BR/aiops-apps/backend-stack.md)
- [Checklist novo serviço](https://github.com/loft-br/aiops-documentation/blob/main/docs/pt-BR/loft-infra/checklist-novo-servico.md) — deploy, não scaffold

---

## O que este guia cobre

| Tópico | No escopo | Fora do escopo |
| --- | --- | --- |
| Layout `backend/` em monorepo | Sim | Serviços Kotlin/Spring |
| FastAPI + PostgreSQL (Família B) | Sim | Bots Flask (Família A) |
| `.venv`, `requirements.txt`, `uv` | Sim | Manifests Kubernetes de produção |
| Bootstrap RDS (admin vs app role) | Sim | Terraform do RDS |
| Health probes, formato REST | Sim | Desenho de AuthN/Z |
| Conexão frontend → API | Sim | Padrões completos Copan |
| Testes e erros comuns | Sim | Detalhes Datadog |

---

## Stack de exemplo (AIOps App Model)

**Um exemplo validado**, não a única stack permitida.

| Camada | Escolha de exemplo | Notas |
| --- | --- | --- |
| Linguagem | Python 3.12+ | Família B AIOps Loft |
| Framework | FastAPI + uvicorn | Async-first |
| Gerenciador de pacotes | [uv](https://docs.astral.sh/uv/) | Exportar também `requirements.txt` para pip |
| ORM | SQLAlchemy 2 async + asyncpg | Driver de runtime |
| Migrations | Alembic | Conexão admin via `psycopg` nos scripts |
| Banco | AWS RDS PostgreSQL | DB + schema dedicados por app |
| Layout | `backend/` no monorepo | Ao lado do frontend TanStack Start |
| API no frontend | `fetch` → `/api/v1/...` | Variável `VITE_API_URL` |

---

## Layout sugerido de pastas

```text
backend/
├── app/
│   ├── main.py              # Factory FastAPI + CORS + routers
│   ├── config.py            # pydantic-settings (DATABASE_URL, CORS, …)
│   ├── db/
│   │   ├── base.py
│   │   └── session.py       # engine async + get_db_session
│   ├── models/              # Models SQLAlchemy
│   ├── schemas/             # Pydantic request/response
│   ├── routers/             # health, portal, cases, …
│   └── services/            # regras de negócio (load/save snapshot)
├── alembic/
│   └── versions/
├── scripts/
│   ├── provision_rds.py     # CREATE DB, role, schema (admin)
│   ├── run_migrations.py    # alembic upgrade (admin)
│   └── grant_app_privileges.py
├── tests/
├── pyproject.toml           # fonte de verdade (uv)
├── uv.lock
├── requirements.txt         # export pip (produção)
├── requirements-dev.txt     # export pip (+ pytest, ruff)
├── .env.example
└── README.md
```

Templates: [examples/](examples/README.md).

---

## Fase 1 — Ambiente Python local

### Opção A — uv (recomendado)

```sh
cd backend
uv sync --group dev
```

Cria `backend/.venv/` (gitignored) e instala deps travadas de `uv.lock`.

### Opção B — venv + pip

```sh
cd backend
python3.12 -m venv .venv
source .venv/bin/activate
pip install -r requirements-dev.txt
```

### Regenerar `requirements.txt`

Quando `pyproject.toml` mudar:

```sh
cd backend
uv export --format requirements-txt --no-hashes --no-dev -o requirements.txt
uv export --format requirements-txt --no-hashes --group dev -o requirements-dev.txt
```

**Dica:** commitar `pyproject.toml`, `uv.lock` e os dois requirements juntos.

---

## Fase 2 — Configuração e secrets

### Dois arquivos `.env` (padrão recomendado)

| Arquivo | Papel | Commitar? |
| --- | --- | --- |
| `.env` na raiz | RDS **admin** + frontend (`VITE_API_URL`, Jira, …) | Nunca |
| `backend/.env` | Role da **aplicação** (`DATABASE_URL`, `CORS_ORIGINS`) | Nunca |
| `.env.example`, `backend/.env.example` | Só nomes de variáveis | Sim |

Exemplos: [root.env.example](examples/root.env.example), [backend.env.example](examples/backend.env.example).

### CORS (armadilha comum)

Inclua **todas** as portas de dev do frontend. Vite/Lovable pode usar **8080**, não 5173:

```env
CORS_ORIGINS=http://localhost:5173,http://localhost:8080,http://localhost:3000,http://127.0.0.1:8080
```

CORS errado → browser mostra `Failed to fetch` → banner de offline mesmo com `curl` OK.

---

## Fase 3 — Bootstrap RDS

**Princípio:** credenciais admin provisionam infra; a API roda com role de app least-privilege.

| Artefato | Exemplo AIOps App Model | Seu app |
| --- | --- | --- |
| Database | `aiops_app_model` | `my_app_db` |
| Role app | `aiops_app_model_app` | `my_app_user` |
| Schema | `portal` | `app` |

### Passos

```sh
# 1. Admin na raiz .env
cd backend
set -a && source ../.env && set +a

# 2. Provisionar DB, user, schema → grava backend/.env
uv run python scripts/provision_rds.py

# 3. Migrations (admin)
uv run python scripts/run_migrations.py

# 4. Grants para role da app
uv run python scripts/grant_app_privileges.py
```

### Verificar conectividade

```sh
uv run uvicorn app.main:app --reload --port 8000
curl -s http://localhost:8000/api/health/db
# {"status":"ok","database":"connected"}
```

Doc RDS (adotador): [aiops-app-model — rds-provisioning](https://github.com/loft-br/aiops-app-model/blob/main/docs/pt-BR/backend/rds-provisioning.md).

---

## Fase 4 — Desenho da API (exemplo)

### Health endpoints (k8s-friendly)

| Path | Propósito |
| --- | --- |
| `GET /health` | Liveness |
| `GET /api/health` | Liveness (prefixo API) |
| `GET /health/db` | Conectividade PostgreSQL |
| `GET /api/health/db` | Mesmo sob `/api` |

### REST versionado

Prefixo: `/api/v1/`

AIOps App Model expõe:

- `GET/PUT /api/v1/portal/snapshot` — sync em bulk com store do frontend
- CRUD em `/api/v1/cases`, `/areas`, `/integrations`, `/hub`

**Nota de desenho:** snapshot PUT é prático no MVP; endpoints granulares conforme tráfego e conflitos crescerem.

### Documentos JSONB

Tipos aninhados do frontend mapeiam bem para colunas **JSONB** (`payload`), mantendo shapes TypeScript estáveis.

---

## Fase 5 — Conectar o frontend

1. No `.env` da raiz:

   ```env
   VITE_API_URL=http://localhost:8000
   ```

2. Cliente fino — exemplo: [portal-api.ts.example](examples/portal-api.ts.example).

3. Trocar persistência só no browser (`localStorage`/mocks) por load na API + PUT debounced.

4. Banner offline quando `fetch` falhar; cache de sessão só para first paint.

5. Reiniciar `npm run dev` após mudar variáveis `VITE_*`.

```sh
# Terminal 1
cd backend && uv run uvicorn app.main:app --reload --port 8000

# Terminal 2
npm run dev
```

---

## Fase 6 — Testes

```sh
cd backend
uv run pytest
```

Padrões (AIOps App Model):

- **Health:** rota real; mock opcional do DB
- **Portal snapshot:** mock do service; `httpx.AsyncClient` + `ASGITransport`
- **Integração DB:** opcional depois (Testcontainers)

Gate mínimo antes do PR: testes passando + `GET /api/health/db` 200 no RDS de dev.

---

## Erros comuns e correções

| Sintoma | Causa provável | Correção |
| --- | --- | --- |
| `[Errno 48] Address already in use` | uvicorn antigo na :8000 | `lsof -iTCP:8000 -sTCP:LISTEN` → `kill <pid>` |
| Banner "não conectou" mas `curl` OK | CORS (ex.: origem :8080) | Adicionar origem em `CORS_ORIGINS`; reiniciar API |
| `Failed to fetch` no browser | API parada ou `VITE_API_URL` errado | Subir uvicorn; reiniciar Vite após `.env` |
| `uv run` remove `.venv` | uv recria ambiente | Esperado; usar `uv sync` ou venv ativado |
| `CREATE ROLE ... PASSWORD $1` falha | placeholder asyncpg em DDL | Senha inline escapada no script |
| `must be able to SET ROLE` | schema owned pela app | Criar schema como admin; GRANT à app |
| Alembic + asyncpg | migrations sync preferem psycopg | `run_migrations.py` com URL admin `postgresql+psycopg` |
| Portal vazio após setup | DB novo, sem seed | Esperado — conteúdo via admin/import |
| `command not found: python` | padrão macOS | Usar `python3` ou Python do uv |

---

## O que customizar por app

| Copiar como está | Customizar |
| --- | --- |
| Padrão de rotas health | Nome do app, database, schema |
| Split admin vs app | Tabelas, rotas de domínio |
| Estrutura Alembic + grants | Schemas Pydantic, regras de negócio |
| Layout uv + ruff + pytest | Middleware de auth quando necessário |
| Padrão CORS multi-porta | Snapshot vs API granular |

---

## Checklist de promoção (aiops-documentation)

Ao abrir PR em [loft-br/aiops-documentation](https://github.com/loft-br/aiops-documentation):

1. Copiar este guia para `docs/en/aiops-apps/backend-creation-guide.md` (+ espelho pt-BR).
2. Copiar `docs/en/aiops-apps/examples/`.
3. Adicionar linha na tabela de docs em `aiops-apps/README.md` (EN + pt-BR).
4. Registrar `REF-AIOPS-APPS-008` nos dois `manifest.yaml`.
5. Linkar de `backend-stack.md` como companion **how-to**.
6. Rodar `make docs-validate`.
7. Status `REVIEW` → `ACCEPTED` após aprovação do squad.

Até lá, o rascunho vivo fica em [aiops-app-model `docs/pt-BR/aiops-apps/`](../../pt-BR/aiops-apps/backend-creation-guide.md).

---

## Documentos relacionados

| Documento | Local |
| --- | --- |
| Arquivos de exemplo | [examples/README.md](examples/README.md) |
| README backend AIOps App Model | [github.com/loft-br/aiops-app-model/backend/README.md](https://github.com/loft-br/aiops-app-model/blob/main/backend/README.md) |
| Setup local (adotador) | [aiops-app-model — local-setup](https://github.com/loft-br/aiops-app-model/blob/main/docs/pt-BR/backend/local-setup.md) |
| Provisionamento RDS (adotador) | [aiops-app-model — rds-provisioning](https://github.com/loft-br/aiops-app-model/blob/main/docs/pt-BR/backend/rds-provisioning.md) |
| Schema e API (adotador) | [aiops-app-model — schema-and-api](https://github.com/loft-br/aiops-app-model/blob/main/docs/pt-BR/backend/schema-and-api.md) |
