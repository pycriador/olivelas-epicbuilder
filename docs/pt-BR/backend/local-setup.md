---
title: "Setup local do backend"
status: "DRAFT"
owner: "olivelas"
created: "2026-08-19"
updated: "2026-11-07"
version: "1.0"
---

# Setup local do backend

> Language: [English (EN)](../../en/backend/local-setup.md) | Português (pt-BR)
>
> Status: DRAFT
>
> Documentation Standard v1.0 (adopter)

Como criar o ambiente virtual Python, instalar dependências e subir a API FastAPI localmente antes de conectar ao RDS.

## Objetivo

| Item | Meta |
| --- | --- |
| Ambiente virtual | `backend/.venv/` (gitignored) |
| Dependências | Travadas em `uv.lock`; exportadas para `requirements.txt` |
| Rodar API | `uvicorn` em `http://localhost:8000` |
| Frontend | Definir `VITE_API_URL=http://localhost:8000` no `.env` da raiz |

## Pré-requisitos

| Requisito | Versão / notas |
| --- | --- |
| Python | 3.12+ (**Confirmed** — `backend/pyproject.toml`) |
| Gerenciador de pacotes | [uv](https://docs.astral.sh/uv/) recomendado; `pip` + `venv` também documentado |
| Git | Clone `https://github.com/pycriador/olivelas-epicbuilder` |

Instalar uv (macOS / Linux):

```sh
curl -LsSf https://astral.sh/uv/install.sh | sh
```

## Layout do projeto (backend)

| Caminho | Propósito |
| --- | --- |
| `backend/pyproject.toml` | Fonte de verdade das dependências |
| `backend/uv.lock` | Versões travadas (uv) |
| `backend/requirements.txt` | Export de produção (compatível com pip) |
| `backend/requirements-dev.txt` | Produção + dev (testes, ruff, psycopg) |
| `backend/.venv/` | Ambiente virtual local (**nunca commitar**) |
| `backend/.env` | Credenciais de runtime da aplicação (**nunca commitar**) |
| `backend/.env.example` | Apenas nomes de variáveis |

## Opção A — uv (recomendado)

O uv cria e gerencia `backend/.venv` automaticamente.

```sh
cd backend
uv sync --group dev
```

O que acontece:

1. Baixa Python 3.12 se necessário
2. Cria `backend/.venv/`
3. Instala dependências de runtime + dev a partir de `uv.lock`

Verificar:

```sh
uv run python --version   # Python 3.12.x
uv run pytest             # 4 testes após setup do RDS
```

Subir a API:

```sh
cp .env.example .env
# Preencher DATABASE_URL / DB_* após provisionamento (ver rds-provisioning.md)

uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Abrir:

- Swagger: `http://localhost:8000/docs`
- Health: `http://localhost:8000/api/health/db`

## Opção B — venv + pip

Use quando o uv não estiver disponível. Requer Python 3.12 instalado no sistema.

```sh
cd backend
python3.12 -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
python -m pip install --upgrade pip
pip install -r requirements-dev.txt
```

Verificar:

```sh
python --version
pytest
```

Subir a API (com venv ativo):

```sh
cp .env.example .env
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Arquivos de ambiente

| Arquivo | Escopo | Usado por |
| --- | --- | --- |
| `.env` na raiz | Credenciais admin RDS + frontend (`VITE_API_URL`, Jira, Gemini) | `scripts/provision_rds.py`, Vite |
| `backend/.env` | Role da aplicação (`aiops_app_model_app`) | Runtime FastAPI |

Copiar templates:

```sh
# Raiz do monorepo
cp .env.example .env

# Runtime do backend
cd backend && cp .env.example .env
```

Nunca commitar arquivos `.env`. Ver `.gitignore`.

## Regenerar requirements.txt

Quando `pyproject.toml` ou `uv.lock` mudarem, atualize os exports pip:

```sh
cd backend
uv export --format requirements-txt --no-hashes --no-dev -o requirements.txt
uv export --format requirements-txt --no-hashes --group dev -o requirements-dev.txt
```

Commitar `requirements.txt`, `requirements-dev.txt` e `uv.lock` juntos.

## Conectar o frontend à API local

No `.env` da raiz:

```env
VITE_API_URL=http://localhost:8000
```

Subir os dois processos:

```sh
# Terminal 1
cd backend && uv run uvicorn app.main:app --reload --port 8000

# Terminal 2 (raiz do monorepo)
npm run dev
```

Se o backend estiver offline, o portal exibe um banner de aviso e pode mostrar dados em cache da sessão.

## Próximos passos

| Passo | Documento |
| --- | --- |
| Provisionar RDS (primeira vez) | [rds-provisioning.md](rds-provisioning.md) |
| Schema e API REST | [schema-and-api.md](schema-and-api.md) |
| Dev local completo (frontend + backend) | [../operations/local-development.md](../operations/local-development.md) |

## Troubleshooting

| Sintoma | Causa provável | Ação |
| --- | --- | --- |
| `command not found: uv` | uv não instalado | Rodar script de instalação ou usar Opção B |
| `No module named 'app'` | Diretório errado | Rodar comandos a partir de `backend/` |
| `database connection failed` | `backend/.env` ausente ou incorreto | Provisionar RDS e copiar credenciais geradas |
| Banner "Servidor indisponível" | API parada ou `VITE_API_URL` errado | Subir uvicorn; conferir `.env` da raiz |
| Conflitos no `pip` | requirements desatualizado | Regenerar a partir de `uv.lock` (ver acima) |

## Relacionados

- [README.md](README.md) — índice da documentação do backend
- `backend/README.md` — referência rápida no repositório
