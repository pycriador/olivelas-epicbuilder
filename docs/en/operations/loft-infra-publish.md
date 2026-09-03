---
title: "Loft infra publish"
status: "DRAFT"
owner: "aiops-app-model"
created: "2026-08-20"
updated: "2026-09-03"
version: "0.11"
---

# Loft infra publish — AIOps App Model

> Language: EN | [Português (pt-BR)](../../pt-BR/operations/loft-infra-publish.md)
>
> Status: DRAFT
>
> Documentation Standard v1.0 (adopter)
>
> Living runbook for publishing this app on Loft infrastructure. Update after every completed step in the publish chat.

**Authority:** Informational for this adopter repo. Canonical checklist: [aiops-documentation — checklist-novo-servico](https://github.com/loft-br/aiops-documentation/blob/main/docs/en/loft-infra/checklist-novo-servico.md).

**Reference app:** [loft-br/aiops-dataforge](https://github.com/loft-br/aiops-dataforge) (workflows, Docker, k8s naming). Seed lineage: `loft-br/aiops-central` (code only — **do not reuse** Central Vault/Kong/DNS/PRs).

**File examples (copy/adapt):** [operations/examples/](examples/README.md)

## Publish order (this service)

| # | Step | Where | In-repo draft | Upstream status (2026-09-03) |
| --- | --- | --- | --- | --- |
| 0 | Confirm hosts in `deploy/published-hosts.env` | this repo | Present (Proposed FQDNs) | Confirm before DNS/Kong merge |
| 1 | GitHub Actions workflows + Dockerfiles | this repo | **Ready** | Manual `workflow_dispatch` only until opt-in |
| 2 | GitHub Environment `production` + OIDC + `GIT_HUB_TOKEN` | GitHub repo settings | — | **Unknown** — create before first deploy |
| 3 | Vault KV paths + push secrets | Vault UI + `scripts/vault/push_secrets.py` | Script ready | **Done** — v1 written 2026-09-03 (cloned from Central KV, hosts rewritten) |
| 4 | k8s-apps values + Argo Application | `loft-br/k8s-apps` | `deploy/k8s/` | **Merged** — [PR #10622](https://github.com/loft-br/k8s-apps/pull/10622) |
| 5 | Kong corp front + external API (+ CORS) | `loft-br/kong-configs` | `deploy/kong/` | **Merged** — [PR #1134](https://github.com/loft-br/kong-configs/pull/1134) |
| 6 | Route53 corp front + external API | `loft-br/infra-live` | `deploy/dns/` (`#AUTOAPPLYME`) | **Open / approved?** — [PR #2350](https://github.com/loft-br/infra-live/pull/2350) (still OPEN 2026-09-03) |
| 7 | First deploy (API then front) | GHA `workflow_dispatch` | Workflows present | After 2–4 at minimum |
| 8 | Datadog verify + post-deploy checks | Datadog + curl | `datadog.enabled: true` in values | Pending |

**Evidence (Confirmed 2026-09-03):** no `aiops-app-model` tree in `k8s-apps`, `kong-configs`, or `infra-live` yet. Prior Central PR links in older drafts of this file are **out of scope**.

## Who needs what

Not every AIOps repo ships front **and** API:

| Layout | Workflows | Dockerfiles |
| --- | --- | --- |
| Front + API (this repo) | front + api | root `Dockerfile` + `backend/Dockerfile` |
| Front only | front only | root `Dockerfile` |
| API only | api only | root `Dockerfile` **or** `backend/Dockerfile` (adjust `context` / `dockerfile` in the workflow) |

## Naming (align with DataForge / AIOps checklist)

| Field | Value | Evidence |
| --- | --- | --- |
| Namespace | `aiops-app-model` | Proposed (chosen for this template repo) |
| Front component | `aiops-app-model-front` | Proposed |
| API component | `aiops-app-model-api` | Proposed |
| `aws-account` | `cross` | Confirmed (AIOps checklist) |
| `product` | `ai-ops` | Confirmed (AIOps checklist; required for `cross`) |
| Environment | `production` | Confirmed (DataForge pattern) |
| EKS cluster dir | `clusters/cross-prod/` | Confirmed (k8s-apps + checklist) |
| Front API bake URL | `CORP_API_URL` in [`deploy/published-hosts.env`](../../../deploy/published-hosts.env) | Confirmed (corp; single source) |
| Front port | `8080` | Confirmed (Dockerfile) |
| API port | `8000` | Confirmed (Dockerfile + local uvicorn) |
| Published front | `CORP_FRONT_URL` in `deploy/published-hosts.env` | Confirmed (corp) |
| Published API | `CORP_API_URL` in `deploy/published-hosts.env` | Confirmed (corp) |
| Cross Prod front (legacy) | `CROSS_FRONT_URL` in `deploy/published-hosts.env` | Confirmed (kept in CORS during cutover) |
| Cross Prod API (legacy) | `CROSS_API_URL` in `deploy/published-hosts.env` | Confirmed |

## Progress checklist

### 1. Application repository

| Step | Status | Notes |
| --- | --- | --- |
| Layout: front at repo root + `backend/` API | Confirmed | Present |
| Workflows `prod-k8s-deployment-*.yml` | **Ready** | Manual only (`workflow_dispatch`); uncomment `push:` when auto-deploy is desired |
| `Dockerfile` (front) + `docker/entrypoint.sh` | **Ready** | Nitro `node-server` |
| `backend/Dockerfile` | **Ready** | FastAPI + uv |
| Stable health endpoints | Confirmed | Front `GET /health`; API `GET /health` (+ `/api/health`) |
| Vault KV paths populated (Cross Prod) | **Done** | v1 @ 2026-09-03 — `ai-ops/aiops-app-model-{api,front}`; seeded from Central KV with host rewrite |
| k8s-apps PR (peer approval) | **Merged** | https://github.com/loft-br/k8s-apps/pull/10622 |
| kong-configs PR | **Merged** | https://github.com/loft-br/kong-configs/pull/1134 |
| infra-live DNS PR | **Open** | https://github.com/loft-br/infra-live/pull/2350 |
| Repo GitHub Environment `production` + OIDC | **Created (env)** | Environment `production` created 2026-09-03; OIDC/trust still Unknown |
| Org secret `GIT_HUB_TOKEN` available to repo | Unknown | Required by `loft-br/actions/deploy` |

### 2. k8s-apps (`loft-br/k8s-apps`)

| Step | Status | Notes |
| --- | --- | --- |
| `clusters/cross-prod/deployments/aiops-app-model/.../values.yaml` | **PR open** | [k8s-apps#10622](https://github.com/loft-br/k8s-apps/pull/10622) |
| Argo CD Application `clusters/cross-prod/applications/aiops-app-model.yaml` | **PR open** | Same PR |
| Vault secrets mount path | **Aligned (Proposed)** | `vaultSecrets` → `ai-ops/aiops-app-model-api` / `…-front` |
| Kong ingress in values | **PR open** | `ingress.className: kong` (public hosts = Kong/DNS steps) |

### 3. Kong / DNS / Vault / Datadog / validation

| Area | Status |
| --- | --- |
| Vault KV created + local `.env` pushed | **Done** | Front 2 keys; API 19 keys; `VITE_API_URL` → corp API; CORS includes corp/Cross fronts (localhost kept for local) |
| Kong routes (corp front / external API + CORS) | **Merged** — [kong-configs#1134](https://github.com/loft-br/kong-configs/pull/1134) |
| Route53 front `corp` + API `external` | **Open** — [infra-live#2350](https://github.com/loft-br/infra-live/pull/2350) |
| Datadog APM + structured logs | Pending (chart `datadog.enabled: true`) |
| Post-deploy validation | Not started |

---

## Step 1 — GitHub Actions workflows

**Status:** Done

### What was created in this repo

| File | Role |
| --- | --- |
| [`.github/workflows/prod-k8s-deployment-front.yml`](../../../.github/workflows/prod-k8s-deployment-front.yml) | Build + deploy front image |
| [`.github/workflows/prod-k8s-deployment-api.yml`](../../../.github/workflows/prod-k8s-deployment-api.yml) | Build + deploy API image |
| [`deploy/published-hosts.env`](../../../deploy/published-hosts.env) | Canonical corp/Cross URLs (`CORP_*` / `CROSS_*`) |

### Portable examples

| Template | Path |
| --- | --- |
| Front workflow | [examples/prod-k8s-deployment-front.yml.example](examples/prod-k8s-deployment-front.yml.example) |
| API workflow | [examples/prod-k8s-deployment-api.yml.example](examples/prod-k8s-deployment-api.yml.example) |

### Minimal shape (Confirmed — AIOps + DataForge)

```yaml
runs-on: ubuntu-arm
environment: production
permissions:
  id-token: write
  contents: read

# steps:
#   - uses: actions/checkout@v6   # Node.js 24 runtime (not Node 20)
# loft-br/actions/deploy@deploy/v1.8.0
# with:
#   aws-account: cross
#   product: ai-ops
#   github-token: ${{ secrets.GIT_HUB_TOKEN }}
#   platforms: linux/arm64
```

Front wires `dockerfile: Dockerfile` and `build-args` from `deploy/published-hosts.env` (`CORP_API_URL` → `VITE_API_URL`).  
API wires `context: backend` + `dockerfile: backend/Dockerfile`.

Dockerfile ARG default stays local (`http://localhost:8000`); production bake always comes from the workflow.

Upstream reference: [aiops-dataforge workflows](https://github.com/loft-br/aiops-dataforge/tree/main/.github/workflows).

**Node.js 20 deprecation (Confirmed):** GitHub Actions runners force JS actions onto Node 24. This repo pins `actions/checkout@v6` (Node 24). This workflow tree does **not** use `actions/setup-node` directly; if that warning persists, it comes from a nested composite (e.g. `loft-br/actions/deploy`) and needs an upstream bump.

---

## Step 2 — Dockerfiles (basic requirements)

**Status:** Done

### Goals

Ship **small, reusable** images that any AIOps app can copy, then specialize:

1. Multi-stage build
2. Non-root user (`app`)
3. Explicit `EXPOSE` + `PORT`
4. `HEALTHCHECK` aligned with app routes
5. No secrets in layers (only public build-args like `VITE_API_URL`)
6. Prefer `*-bookworm-slim` / glibc on `linux/arm64`

### What was created in this repo

| File | Role |
| --- | --- |
| [`Dockerfile`](../../../Dockerfile) | Front — Node 24 + Nitro `node-server` → `.output/` |
| [`docker/entrypoint.sh`](../../../docker/entrypoint.sh) | Sets `PORT`/`HOST`, runs `.output/server/index.mjs` |
| [`backend/Dockerfile`](../../../backend/Dockerfile) | API — Python 3.12 + uv + uvicorn |
| [`.dockerignore`](../../../.dockerignore) / [`backend/.dockerignore`](../../../backend/.dockerignore) | Keep build context small |
| [`src/routes/health.ts`](../../../src/routes/health.ts) | Front liveness `GET /health` (public path) |

### Portable examples

| Template | Path |
| --- | --- |
| Front Dockerfile | [examples/Dockerfile.front.example](examples/Dockerfile.front.example) |
| Front entrypoint | [examples/docker-entrypoint.sh.example](examples/docker-entrypoint.sh.example) |
| API Dockerfile | [examples/Dockerfile.api.example](examples/Dockerfile.api.example) |

### Front notes (this stack)

- Lovable default Nitro preset is Cloudflare; **Docker build sets `NITRO_PRESET=node-server`** so the image listens on Node (EKS), without changing the default Lovable target.
- Keep `/health` public (`src/lib/auth-guard.ts`).

### API notes (this stack)

- Entry: `uvicorn app.main:app --host 0.0.0.0 --port 8000`
- Liveness: `GET /health` (also `/api/health`)
- Runtime secrets via env/Vault later — do not `COPY` `.env`

### Local build smoke test

```sh
# Front
docker build -t aiops-app-model-front:local \
  --build-arg VITE_API_URL=http://localhost:8000 .

docker run --rm -p 8080:8080 aiops-app-model-front:local
curl -sf http://127.0.0.1:8080/health

# API (from repo root)
docker build -t aiops-app-model-api:local -f backend/Dockerfile backend
docker run --rm -p 8000:8000 --env-file backend/.env aiops-app-model-api:local
curl -sf http://127.0.0.1:8000/health
```

**Next recommended step:** scaffold `k8s-apps` values (probes must match `/health` and ports `8080` / `8000`).

---

## Step 3 — Vault (Cross Prod)

**Status:** Done (v1 written 2026-09-03).

### Human login (once per machine / token TTL)

```sh
export VAULT_ADDR=https://vault.loft-corp.com.br
# Vault UI → profile photo → Copy token
vault login
# paste token
```

### KV paths (this app)

| Component | Mount | Path | UI |
| --- | --- | --- | --- |
| API | `cross` | `ai-ops/aiops-app-model-api` | [Vault UI](https://vault.loft-corp.com.br/ui/vault/secrets/cross/kv/ai-ops%2Faiops-app-model-api) |
| Front | `cross` | `ai-ops/aiops-app-model-front` | [Vault UI](https://vault.loft-corp.com.br/ui/vault/secrets/cross/kv/ai-ops%2Faiops-app-model-front) |

CLI form: `vault kv put cross/ai-ops/aiops-app-model-api …` (same strings later in `application.vaultSecrets` **without** the `cross/` prefix — only `path: ai-ops/aiops-app-model-api` + `mount: cross`).

### Script

| Item | Location |
| --- | --- |
| Push script | [`scripts/vault/push_secrets.py`](../../../scripts/vault/push_secrets.py) |
| Docs stub | [examples/push_secrets.py.example](examples/push_secrets.py.example) |
| npm | `npm run vault:push:dry-run` / `npm run vault:push` |

Mapping:

- repo root `.env` → `cross/ai-ops/aiops-app-model-front`
- `backend/.env` → `cross/ai-ops/aiops-app-model-api`

```sh
export VAULT_ADDR=https://vault.loft-corp.com.br
python3 scripts/vault/push_secrets.py --dry-run   # prints key names only
python3 scripts/vault/push_secrets.py             # writes both paths
```

### Applied (this app)

- **Confirmed 2026-09-03:** KV v1 created at `cross/ai-ops/aiops-app-model-api` and `cross/ai-ops/aiops-app-model-front`.
- Source: cloned from Central KV paths, then rewritten hostnames to App Model corp/Cross URLs (`APP_NAME`, `CORS_ORIGINS`, `VITE_API_URL`).
- **Inferred:** `DATABASE_URL` / `DB_*` still point at the same RDS database role as Central until a dedicated App Model DB is provisioned.
- Local `.env` / `backend/.env` regenerated for push (gitignored — never commit).

### Open issues before / after first deploy

1. Merge / apply DNS [infra-live#2350](https://github.com/loft-br/infra-live/pull/2350) if still open
2. Optional: provision dedicated `aiops_app_model` DB + rotate DB credentials away from Central
3. Confirm `GIT_HUB_TOKEN` reaches this repo, then `workflow_dispatch` API → front
4. Re-push Vault if CORS / JWT / DB change

Canonical Vault doc: [aiops-documentation vault-secrets](https://github.com/loft-br/aiops-documentation/blob/main/docs/en/loft-infra/vault-secrets.md).

---

## Step 4 — k8s-apps (Helm values + Argo CD Application)

**Status:** Merged — [k8s-apps#10622](https://github.com/loft-br/k8s-apps/pull/10622).

### Why a PR (and a peer)

`loft-br/k8s-apps` is the GitOps source of truth for EKS. Changes to `main` are reconciled by Argo CD. **You must not push straight to `main`.** Open a feature branch, open a Pull Request, and get **at least one peer review/approval** before merge.

Reference tree: [aiops-dataforge deployments](https://github.com/loft-br/k8s-apps/tree/main/clusters/cross-prod/deployments/aiops-dataforge).

### Files to add in `k8s-apps`

```text
clusters/cross-prod/
├── applications/
│   └── aiops-app-model.yaml
└── deployments/
    └── aiops-app-model/
        ├── aiops-app-model-api/
        │   └── values.yaml
        └── aiops-app-model-front/
            └── values.yaml
```

### Working copies + portable examples (this repo)

| Role | Path |
| --- | --- |
| API values (mirror) | [`deploy/k8s/aiops-app-model-api/values.yaml`](../../../deploy/k8s/aiops-app-model-api/values.yaml) |
| Front values (mirror) | [`deploy/k8s/aiops-app-model-front/values.yaml`](../../../deploy/k8s/aiops-app-model-front/values.yaml) |
| Application (mirror) | [`deploy/k8s/aiops-app-model.application.yaml`](../../../deploy/k8s/aiops-app-model.application.yaml) |
| README | [`deploy/k8s/README.md`](../../../deploy/k8s/README.md) |
| Examples | [k8s-apps-*.example](examples/) |

### Solid configuration summary (AIOps App Model)

| Field | API | Front |
| --- | --- | --- |
| `application.name` | `aiops-app-model-api` | `aiops-app-model-front` |
| Namespace / Argo destination | `aiops-app-model` | same |
| Port | `8000` | `8080` |
| Probes | `/health` | `/health` (+ `startupProbe`) |
| `vaultSecrets` | `mount: cross` / `path: ai-ops/aiops-app-model-api` | `…/aiops-app-model-front` |
| Ingress | `className: kong` | same |
| Chart | `web-server` `2.15.3` (pinned like DataForge) | same |
| ECR repo (expected) | `…/aiops-app-model-aiops-app-model-api` | `…/aiops-app-model-aiops-app-model-front` |
| `podAnnotations` source repo | `aiops-app-model` | same |
| `team` | `squad-ai-ops` | same |

Image `tag: bootstrap` is a placeholder until the first successful `loft-br/actions/deploy` run patches `repository` + `tag`.

### How to open the PR on `k8s-apps` (peer approval required)

```sh
# 1) Clone (or update) k8s-apps
git clone git@github.com:loft-br/k8s-apps.git
cd k8s-apps
git checkout main && git pull origin main

# 2) Feature branch — never commit on main
git checkout -b feat/aiops-app-model-cross-prod

# 3) Copy manifests from aiops-app-model working copies
mkdir -p clusters/cross-prod/deployments/aiops-app-model/aiops-app-model-api \
         clusters/cross-prod/deployments/aiops-app-model/aiops-app-model-front

# From the aiops-app-model checkout:
cp /path/to/aiops-app-model/deploy/k8s/aiops-app-model-api/values.yaml \
   clusters/cross-prod/deployments/aiops-app-model/aiops-app-model-api/values.yaml
cp /path/to/aiops-app-model/deploy/k8s/aiops-app-model-front/values.yaml \
   clusters/cross-prod/deployments/aiops-app-model/aiops-app-model-front/values.yaml
cp /path/to/aiops-app-model/deploy/k8s/aiops-app-model.application.yaml \
   clusters/cross-prod/applications/aiops-app-model.yaml

# 4) Commit + push branch
git add clusters/cross-prod/deployments/aiops-app-model \
        clusters/cross-prod/applications/aiops-app-model.yaml
git commit -m "Add AIOps App Model (api + front) to cross-prod"
git push -u origin HEAD

# 5) Open PR against main (requires peer review)
gh pr create --base main --title "Add AIOps App Model to cross-prod" --body "$(cat <<'EOF'
## Summary
- Add Argo CD Application `aiops-app-model` on `cross-prod`
- Add Helm values for `aiops-app-model-api` (port 8000) and `aiops-app-model-front` (port 8080)
- Wire Vault paths `ai-ops/aiops-app-model-api` and `ai-ops/aiops-app-model-front` (mount `cross`)

## Reference
Mirrors https://github.com/loft-br/k8s-apps/tree/main/clusters/cross-prod/deployments/aiops-dataforge

## Test plan
- [ ] Peer review / approval before merge
- [ ] After merge: Argo CD shows Application `aiops-app-model` (namespace created)
- [ ] VaultStaticSecret objects appear for both components
- [ ] First image tags arrive via GitHub Actions deploy from `loft-br/aiops-app-model`
- [ ] Kong / DNS follow-up still required for public hosts

EOF
)"
```

### Review / merge checklist (peer)

- [ ] Paths under `clusters/cross-prod/…` only (no unrelated apps)
- [ ] `vaultSecrets.path` matches Vault UI exactly (no extra `/secrets` unless the KV uses it)
- [ ] Ports/probes match Dockerfiles (`8000` / `8080`, `/health`)
- [ ] `ingress.className: kong`
- [ ] Application multi-source includes base values + both components + `ref: values`
- [ ] **At least one approving review** from a peer before merge to `main`
- [ ] After merge: confirm Argo sync (pods may stay `ImagePullBackOff` until first GHA deploy)

### After merge

1. Argo CD creates namespace `aiops-app-model` and syncs charts.
2. Run front/API deploy workflows in `aiops-app-model` so ECR tags replace `bootstrap`.
3. Continue with Kong routes + Route53 (Step 5).

---

## Step 5 — Kong + DNS (corp front + external API)

**Status:** Pattern Confirmed (DataForge). API briefly on kong-corp (PR #1113) — **reverted to external** because ALB Cognito `302` on CORS `OPTIONS` breaks the SPA.

### Log — API corp → external

| Claim | Classification |
| --- | --- |
| Browser can JumpCloud-auth the API host and get FastAPI JSON | Confirmed |
| SPA `fetch` from corp front still fails: preflight `OPTIONS` → ALB `302` Cognito (“Redirect is not allowed for a preflight request”) | Confirmed |
| Browsers do not send cookies on CORS preflight | Confirmed (Fetch / CORS) |
| DataForge API on `kong-external` returns `OPTIONS`/`GET` without Cognito | Confirmed |
| Fix: move `aiops-app-model-api` route/service to `gateways/infra-prod/external/cross/` + Netskope `ip-restriction`; DNS `kong_accessibility = external` | Proposed → implementing |
| DNS apply for this app is via GitHub Actions / `#AUTOAPPLYME`, not a manual infra-live PR in this chat | Confirmed (owner process) |

Working copies: `deploy/kong/external/*`, `deploy/dns/aiops-app-model-api…terragrunt.hcl`. Companion PRs: [kong-configs#1114](https://github.com/loft-br/kong-configs/pull/1114) · [aiops-app-model#11](https://github.com/loft-br/aiops-app-model/pull/11).

### Traffic path

```text
Browser → Route53 (*.loft-corp.com.br)
       → kong-{corp|external}.infrastructure.loft-prod.io
       → Kong route/service (kong-configs)
       → <service>.cross.loft-prod.io (k8s ingress from k8s-apps)
```

### Hosts (this app)

| Role | Public FQDN | Upstream | Gateway |
| --- | --- | --- | --- |
| Front | `aiops-app-model.loft-corp.com.br` | `aiops-app-model-front.cross.loft-prod.io:443` | **corp** |
| API | `aiops-app-model-api.loft-corp.com.br` | `aiops-app-model-api.cross.loft-prod.io:443` | **external** (+ Netskope `ip-restriction`) |

Reference (front):  
https://github.com/loft-br/kong-configs/blob/main/gateways/infra-prod/corp/cross/routes/aiops-dataforge-front-route.yaml  
https://github.com/loft-br/kong-configs/blob/main/gateways/infra-prod/corp/cross/services/aiops-dataforge-front-service.yaml

### Files added

**kong-configs**

```text
gateways/infra-prod/corp/cross/
  routes/aiops-app-model-front-route.yaml
  services/aiops-app-model-front-service.yaml
gateways/infra-prod/external/cross/
  routes/aiops-app-model-api-route.yaml      # includes ip-restriction
  services/aiops-app-model-api-service.yaml
```

**infra-live**

```text
live/aws/infrastructure/production/_global/route53/records/loft-corp.com.br/
  aiops-app-model.loft-corp.com.br/terragrunt.hcl      # corp
  aiops-app-model-api.loft-corp.com.br/terragrunt.hcl  # external
```

Working copies: [`deploy/kong/`](../../../deploy/kong/) · [`deploy/dns/`](../../../deploy/dns/)  
Examples: [kong-*.example](examples/) · [dns-*.example](examples/)

### Open PRs (peer approval required)

| Repo | PR |
| --- | --- |
| `loft-br/kong-configs` | https://github.com/loft-br/kong-configs/pull/1107 |
| `loft-br/infra-live` | https://github.com/loft-br/infra-live/pull/2145 |

### How to open these PRs yourself (template)

```sh
### Kong
git clone git@github.com:loft-br/kong-configs.git && cd kong-configs
git checkout -b feat/aiops-app-model-kong
# copy deploy/kong/corp/* and deploy/kong/external/* into gateways/infra-prod/...
git add gateways/infra-prod/corp/cross/routes/aiops-app-model-front-route.yaml \
        gateways/infra-prod/corp/cross/services/aiops-app-model-front-service.yaml \
        gateways/infra-prod/external/cross/routes/aiops-app-model-api-route.yaml \
        gateways/infra-prod/external/cross/services/aiops-app-model-api-service.yaml
git commit -m "Add AIOps App Model Kong routes (corp front + external API)"
git push -u origin HEAD
gh pr create --base main --title "Add AIOps App Model Kong routes (corp + external)"

### DNS (never terragrunt apply locally)
git clone git@github.com:loft-br/infra-live.git && cd infra-live
git checkout -b feat/aiops-app-model-dns
# copy terragrunt.hcl files under the loft-corp.com.br records tree
git add live/aws/infrastructure/production/_global/route53/records/loft-corp.com.br/aiops-app-model.loft-corp.com.br \
        live/aws/infrastructure/production/_global/route53/records/loft-corp.com.br/aiops-app-model-api.loft-corp.com.br
git commit -m "Add Route53 Kong records for AIOps App Model"
git push -u origin HEAD
gh pr create --base main --title "Add Route53 records for AIOps App Model (corp + external)"
```

### Peer review checklist

**Kong**

- [ ] Front under `corp/cross`, API under `external/cross`
- [ ] Upstream hosts match k8s service names (`*-front` / `*-api` + `.cross.loft-prod.io`)
- [ ] API route has Netskope `ip-restriction` allowlist
- [ ] Tags `impact_level:5` + `squad:squad-ai`
- [ ] **Peer approval** before merge

**DNS**

- [ ] `#AUTOAPPLYME` present
- [ ] `kong_accessibility` matches gateway (`corp` front / `external` API)
- [ ] `record_name` matches public hostname label
- [ ] Blueprint `route53/kong-record` `4.2.1`
- [ ] **No local apply** — Atlantis/Terrateam only
- [ ] **Peer approval** before merge

### After both merges

1. Confirm DNS resolves (`dig aiops-app-model.loft-corp.com.br`, `dig aiops-app-model-api.loft-corp.com.br`).
2. Update Vault / local `.env`: `VITE_API_URL` + `CORS_ORIGINS` to corp hosts → `npm run vault:push`.
3. Redeploy front (bake `VITE_API_URL`) and API when ready.

---

## Step 6 — End-to-end validation + common failures

**Status:** Documented. Run after merges + first GHA deploy.

### PR board (as of this step)

| Repo | PR | Checks | Review | Action |
| --- | --- | --- | --- | --- |
| `k8s-apps` | [#10519](https://github.com/loft-br/k8s-apps/pull/10519) | ✅ green | `REVIEW_REQUIRED` | Get peer approval → merge |
| `kong-configs` | [#1107](https://github.com/loft-br/kong-configs/pull/1107) | ✅ green | **`APPROVED`** | Merge when repo rules allow |
| `infra-live` | [#2145](https://github.com/loft-br/infra-live/pull/2145) | (Atlantis) | `REVIEW_REQUIRED` | Peer approval + Atlantis/Terrateam apply |

No need to open new k8s-apps/kong PRs — **they already exist**.

### Safe validation order

1. Merge **k8s-apps** → Argo creates `aiops-app-model` (pods may fail image until deploy).
2. Merge **kong-configs** → gateway routes/services.
3. Merge + apply **infra-live** → DNS resolves.
4. Run `prod-k8s-deployment-*.yml` on `aiops-app-model` (real ECR tags replace `bootstrap`).
5. Update Vault (`VITE_API_URL`, `CORS_ORIGINS`) and redeploy front if bake is still localhost.
6. Smoke HTTPS:

```sh
curl -sfI https://aiops-app-model.loft-corp.com.br/health
curl -sfI https://aiops-app-model-api.loft-corp.com.br/health
```

### Common failures

| Symptom | Likely cause | What to do |
| --- | --- | --- |
| `ImagePullBackOff` / tag `bootstrap` | GHA deploy not run yet | Trigger front/API workflows; check ECR `…/aiops-app-model-aiops-app-model-*` |
| API `CrashLoop`: missing `JWT_SECRET` / DB | Wrong Vault path or missing key | KV path = `vaultSecrets.path`; re-push; restart pods |
| `VaultStaticSecret` not syncing | Path/mount mismatch | `mount: cross` + exact path (`ai-ops/aiops-app-model-api`, no extra `/secrets`) |
| Probe failing | Wrong port/path | API `8000` `/health`; front `8080` `/health` (+ startupProbe) |
| DNS NXDOMAIN | `infra-live` not merged/applied | Check Atlantis; `dig` FQDNs |
| DNS OK, Kong 404/502 | Missing route/service or bad upstream | Confirm kong-configs merge; upstream `*.cross.loft-prod.io` |
| API `404 Not Found` off-corp | `ip-restriction` (expected) | Use Netskope / corp network |
| Front calls localhost / CORS errors | Stale `VITE_API_URL` bake or CORS | Fix `.env`, `vault:push`, rebuild/redeploy front |
| Deploy workflow AWS/OIDC fail | Missing `production` env / perms | `id-token: write`; `GIT_HUB_TOKEN`; GitHub Environment |
| Deploy cannot patch `k8s-apps` | Application/values not on `main` | Merge PR #10519 before first deploy |
| Argo chart sync fail | Chart pin drift | AIOps pin: `web-server` `2.15.3` |
| SIGTERM during deploy | Normal rolling update | Problem only if CrashLoop / rising RESTARTS |

### Useful commands

```sh
kubectl -n aiops-app-model get pods,ing,secrets
kubectl -n aiops-app-model describe pod <pod>
kubectl -n aiops-app-model logs <pod> --previous

dig +short aiops-app-model.loft-corp.com.br
dig +short aiops-app-model-api.loft-corp.com.br

export VAULT_ADDR=https://vault.loft-corp.com.br
vault kv metadata get cross/ai-ops/aiops-app-model-api
vault kv metadata get cross/ai-ops/aiops-app-model-front
```

### “Full flow OK” criteria

- [ ] k8s-apps + kong + DNS PRs merged (DNS applied)
- [ ] Argo Application `aiops-app-model` Synced/Healthy
- [ ] Pods Ready with real ECR image (not `bootstrap`)
- [ ] `GET /health` 200 on front and API via corp/external hosts
- [ ] Production front points at corp API (`VITE_API_URL`)
- [ ] No secrets in Git / logs

### Known adopter follow-ups (do not block PR merges)

1. Local `VITE_API_URL` / `CORS_ORIGINS` may still be localhost → update after DNS.
2. Confirm GitHub Environment `production` + `GIT_HUB_TOKEN` inheritance on `aiops-app-model`.
3. Datadog APM / structured logs (optional observability step).
4. Promote this runbook `DRAFT` → `ACCEPTED` only with doc owner approval.

---

## Step 7 — CORS (corp hosts)

**Status:** Cutover to corp — bake + Vault must use loft-corp.com.br.

### Canonical URLs (Confirmed)

| Role | URL |
| --- | --- |
| Front | https://aiops-app-model.loft-corp.com.br/ |
| API | https://aiops-app-model-api.loft-corp.com.br/ |

Notes:

- Prefer **https**.
- Keep Cross Prod front origin in `CORS_ORIGINS` during cutover so both fronts work until traffic fully moves.

### How CORS works here

The browser on the **front** calls the **API** on another host. FastAPI mounts `CORSMiddleware` with `allow_origins=settings.cors_origin_list` and `allow_credentials=True` (`backend/app/main.py`).

The list comes from **`CORS_ORIGINS`** (env / Vault): exact origins (scheme + host, **no** trailing slash), comma-separated.

**Important**

| Config | Where it applies | How to change in prod |
| --- | --- | --- |
| `CORS_ORIGINS` | API runtime (Vault → pod) | `vault kv patch` + API restart/rollout |
| Origin → API map | Baked `VITE_CORP_*` / `VITE_CROSS_*` + `src/lib/api-base-url.ts` | Update `deploy/published-hosts.env` + **new front deploy** |
| `VITE_API_URL` | SSR / unknown-host **fallback** (bake = `FRONT_BAKE_API_URL`) | Same redeploy |

Browser mapping (Confirmed intent):

| Front | API base (no `/login` — auth is `/api/v1/auth/*`) |
| --- | --- |
| `https://aiops-app-model.loft-corp.com.br` | `https://aiops-app-model-api.loft-corp.com.br` |
| `https://aiops-app-model-front.cross.loft-prod.io` | `https://aiops-app-model-api.cross.loft-prod.io` |

Patching only the front Vault path does **not** change an already published bundle.

### Steps (corp cutover)

1. Confirm corp hosts resolve and respond.
2. Patch API Vault:

```sh
export VAULT_ADDR=https://vault.loft-corp.com.br
vault login   # if needed

vault kv patch cross/ai-ops/aiops-app-model-api \
  CORS_ORIGINS='https://aiops-app-model.loft-corp.com.br,https://aiops-app-model-front.cross.loft-prod.io' \
  COOKIE_SECURE=true \
  EXPOSE_DEV_TOKENS=false
```

3. Optional front Vault alignment (remember bake):

```sh
vault kv patch cross/ai-ops/aiops-app-model-front \
  VITE_API_URL='https://aiops-app-model-api.loft-corp.com.br'
```

4. If CORS headers are stale: wait for `VaultStaticSecret` refresh (~30s) or:

```sh
kubectl -n aiops-app-model rollout restart deploy/aiops-app-model-api
```

5. Validate:

```sh
curl -sI \
  -H 'Origin: https://aiops-app-model.loft-corp.com.br' \
  -X OPTIONS \
  -H 'Access-Control-Request-Method: GET' \
  https://aiops-app-model-api.loft-corp.com.br/health
# Expected: access-control-allow-origin: https://aiops-app-model.loft-corp.com.br
```

6. Align repo artifacts for the next bake:
   - Update `CORP_API_URL` / `CORP_FRONT_URL` in [`deploy/published-hosts.env`](../../../deploy/published-hosts.env) (single source)
   - Front workflow loads that file into `build-args` → `VITE_API_URL`
   - Dockerfile ARG default remains local; prod never relies on it
   - `backend/.env.example` documents prod origins
   - Example: [cors-origins.env.example](examples/cors-origins.env.example)

7. **Redeploy the front** (GHA) so the browser uses the corp API.

### Local vs Vault

| Environment | Typical `CORS_ORIGINS` |
| --- | --- |
| Local (`backend/.env`) | localhost **+** published fronts (so full `vault:push` does not wipe prod) |
| Vault prod (API) | corp front (+ Cross Prod during cutover) |

Prefer `vault kv patch` for single keys instead of a full `vault:push` from a localhost-only `.env`.

### Common CORS failures

| Symptom | Cause | Fix |
| --- | --- | --- |
| Browser `Failed to fetch` / offline banner, `curl` OK | Origin missing from `CORS_ORIGINS` | Add exact origin; restart API |
| Trailing `/` on origin | String ≠ browser `Origin` | No trailing slash |
| `http://` in list, site on `https://` | Scheme mismatch | Use https |
| Front still calls old Cross API | Old `VITE_API_URL` bake | Redeploy front with corp build-arg |
| Cookies / login fail on https | `COOKIE_SECURE=false` | `COOKIE_SECURE=true` in Vault |
| Admin UI CORS change has no effect | Middleware built at startup | Restart API after settings change |

### Step 7 checklist

- [ ] Vault API: `CORS_ORIGINS` with corp front (+ Cross optional)
- [ ] Vault / bake: `VITE_API_URL` = `CORP_API_URL` from `deploy/published-hosts.env`
- [ ] OPTIONS preflight OK for corp front (`CORP_FRONT_URL`)
- [ ] Workflow loads `deploy/published-hosts.env` for bake
- [ ] Front GHA redeploy after bake change
- [ ] Browser smoke login/navigation on corp host


---

## Step log

### Create GitHub Actions workflows

See **Step 1**. Action pin: `loft-br/actions/deploy@deploy/v1.8.0`.

### Bump `actions/checkout` to Node 24

**Status:** Confirmed. Replaced `actions/checkout@v4` → `@v6` in front/API workflows and examples.

### Create Dockerfiles + examples

See **Step 2**.

### Vault Cross Prod + push script

See **Step 3**.

### k8s-apps manifests + PR flow

See **Step 4**. PR: https://github.com/loft-br/k8s-apps/pull/10519

### Kong + DNS

See **Step 5**. PRs: https://github.com/loft-br/kong-configs/pull/1107 · https://github.com/loft-br/infra-live/pull/2145

### Validation + common failures

See **Step 6**.

### CORS on published hosts

See **Step 7** (Cross Prod baseline).

### CORS corp cutover

Repo bake + examples now use corp hosts from [`deploy/published-hosts.env`](../../../deploy/published-hosts.env):
- Front `CORP_FRONT_URL`
- API `CORP_API_URL`

Still apply Vault `kv patch` + API restart + front redeploy in cluster.

### Centralize published hosts

- Added `deploy/published-hosts.env` as the single source for corp/Cross URLs
- Front GHA loads `CORP_API_URL` into `VITE_API_URL` build-arg
- Dockerfile ARG default is local-only (prod bake via workflow)
- `scripts/vault/push_secrets.py` derives warn hints from that file (`--hosts-file` / `CORP_*_URL` overrides)

### Kong route CORS plugin (GitOps)

- [kong-configs#1115](https://github.com/loft-br/kong-configs/pull/1115): `cors` on `aiops-app-model-api-route` (external)
  - Origin: `https://aiops-app-model.loft-corp.com.br` (exact)
  - Methods: same as route; headers: `authorization`, `content-type`
  - `credentials: true` (cookie / Cognito credentialed SPA calls)
- No `k8s-apps` change — Kong Corp runbook: PR/merge on `kong-configs` only
- Local mirror: `deploy/kong/external/routes/aiops-app-model-api-route.yaml`

## References

- [Checklist — new service](https://github.com/loft-br/aiops-documentation/blob/main/docs/en/loft-infra/checklist-novo-servico.md)
- [GitHub Actions deploy](https://github.com/loft-br/aiops-documentation/blob/main/docs/en/loft-infra/github-actions-deploy.md)
- [Dockerfiles (AIOps)](https://github.com/loft-br/aiops-documentation/blob/main/docs/en/loft-infra/dockerfiles.md)
- [Vault secrets](https://github.com/loft-br/aiops-documentation/blob/main/docs/en/loft-infra/vault-secrets.md)
- [k8s-apps](https://github.com/loft-br/aiops-documentation/blob/main/docs/en/loft-infra/k8s-apps.md)
- [Kong gateway](https://github.com/loft-br/aiops-documentation/blob/main/docs/en/loft-infra/kong-gateway.md)
- [infra-live Route53](https://github.com/loft-br/aiops-documentation/blob/main/docs/en/loft-infra/infra-live-route53.md)
- Local: [local-development.md](local-development.md)
