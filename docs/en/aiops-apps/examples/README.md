# Example files — Olivelas backend creation guide

These templates illustrate **one working approach** (Family B — FastAPI). They are not mandatory filenames or layouts.

| File | Suggested location in adopter repo |
| --- | --- |
| `pyproject.toml.example` | `backend/pyproject.toml` |
| `main.py.example` | `backend/app/main.py` |
| `backend.env.example` | `backend/.env.example` |
| `root.env.example` | `.env.example` (monorepo root) |
| `portal-api.ts.example` | `src/lib/portal-api.ts` (frontend) |

**Reference implementation:** [pycriador/olivelas-epicbuilder](https://github.com/pycriador/olivelas-epicbuilder) — `backend/` folder.

Copy examples, rename (remove `.example`), and adapt names (`my_app_db`, routes, schemas) to your product.
