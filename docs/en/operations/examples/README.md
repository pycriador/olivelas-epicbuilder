# Example files — Loft infra publish (workflows + Docker)

> Language: EN | [Português (pt-BR)](../../../pt-BR/operations/examples/README.md)
>
> These templates show the **minimum** needed to publish an AIOps app on Loft EKS.
> Not every repo has both front and API — copy only what applies.

| Example | Copy to (typical) | When |
| --- | --- | --- |
| [prod-k8s-deployment-front.yml.example](prod-k8s-deployment-front.yml.example) | `.github/workflows/prod-k8s-deployment-front.yml` | Repo has a Node/Vite front |
| [prod-k8s-deployment-api.yml.example](prod-k8s-deployment-api.yml.example) | `.github/workflows/prod-k8s-deployment-api.yml` | Repo has a Python API |
| [Dockerfile.front.example](Dockerfile.front.example) | `Dockerfile` (repo root) | Front image |
| [docker-entrypoint.sh.example](docker-entrypoint.sh.example) | `docker/entrypoint.sh` | Front entrypoint |
| [Dockerfile.api.example](Dockerfile.api.example) | `backend/Dockerfile` or root `Dockerfile` | API-only or `backend/` layout |
| [push_secrets.py.example](push_secrets.py.example) | points to `scripts/vault/push_secrets.py` | Push local `.env` → Vault Cross |
| [k8s-apps-api.values.yaml.example](k8s-apps-api.values.yaml.example) | `clusters/cross-prod/deployments/.../values.yaml` | API Helm values |
| [k8s-apps-front.values.yaml.example](k8s-apps-front.values.yaml.example) | same tree, front component | Front Helm values |
| [k8s-apps-application.yaml.example](k8s-apps-application.yaml.example) | `clusters/cross-prod/applications/<ns>.yaml` | Argo CD Application |
| [kong-front-route.yaml.example](kong-front-route.yaml.example) / [kong-front-service.yaml.example](kong-front-service.yaml.example) | `kong-configs` corp gateway | Front exposure |
| [kong-api-route.yaml.example](kong-api-route.yaml.example) / [kong-api-service.yaml.example](kong-api-service.yaml.example) | `kong-configs` external gateway | API + IP restriction |
| [dns-corp.terragrunt.hcl.example](dns-corp.terragrunt.hcl.example) / [dns-api.terragrunt.hcl.example](dns-api.terragrunt.hcl.example) | `infra-live` Route53 | Corp / external CNAMEs |
| [cors-origins.env.example](cors-origins.env.example) | Vault `CORS_ORIGINS` / `backend/.env` | Published front origins |

**Working copies in this repo:** `.github/workflows/`, `Dockerfile`, `docker/entrypoint.sh`, `backend/Dockerfile`.

**Canonical published hosts:** [`deploy/published-hosts.env`](../../../deploy/published-hosts.env) — single source for front bake (`CORP_API_URL`), Vault push warnings, and CORS examples. Change hosts there for cutovers.

**Canonical checklist:** [loft-infra/checklist-novo-servico](https://github.com/loft-br/aiops-documentation/blob/main/docs/en/loft-infra/checklist-novo-servico.md).

Replace placeholders:

| Placeholder | Example (this app) |
| --- | --- |
| `<namespace>` | `aiops-app-model` |
| `<front-name>` | `aiops-app-model-front` |
| `<api-name>` | `aiops-app-model-api` |
| `<api-corp-url>` | `CORP_API_URL` in `deploy/published-hosts.env` |
