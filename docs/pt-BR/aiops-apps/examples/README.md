# Arquivos de exemplo — guia de criação de backend Olivelas

Estes templates ilustram **uma abordagem que funciona** (Família B — FastAPI). Não são nomes ou layouts obrigatórios.

| Arquivo | Local sugerido no repo adotador |
| --- | --- |
| `pyproject.toml.example` | `backend/pyproject.toml` |
| `main.py.example` | `backend/app/main.py` |
| `backend.env.example` | `backend/.env.example` |
| `root.env.example` | `.env.example` (raiz do monorepo) |
| `portal-api.ts.example` | `src/lib/portal-api.ts` (frontend) |

**Implementação de referência:** [pycriador/olivelas-epicbuilder](https://github.com/pycriador/olivelas-epicbuilder) — pasta `backend/`.

Copie os exemplos, renomeie (remova `.example`) e adapte nomes (`my_app_db`, rotas, schemas) ao seu produto.
