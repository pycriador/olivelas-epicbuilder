---
title: "Publicação na infra Loft"
status: "DRAFT"
owner: "aiops-app-model"
created: "2026-08-20"
updated: "2026-08-21"
version: "0.10"
---

# Publicação na infra Loft — AIOPS App Model

> Language: pt-BR | [English (EN)](../../en/operations/loft-infra-publish.md)
>
> Status: DRAFT
>
> Documentation Standard v1.0 (adopter)
>
> Runbook vivo da publicação deste app na infra Loft. Atualizar após cada passo concluído no chat de publish.

**Autoridade:** Informacional neste repositório adopter. Checklist canônico: [aiops-documentation — checklist-novo-servico](https://github.com/loft-br/aiops-documentation/blob/main/docs/pt-BR/loft-infra/checklist-novo-servico.md).

**App de referência:** [loft-br/aiops-dataforge](https://github.com/loft-br/aiops-dataforge) (workflows, Docker, naming k8s).

**Exemplos de arquivo (copiar/adaptar):** [operations/examples/](examples/README.md)

## Quem precisa de quê

Nem todo repo AIOps tem front **e** API:

| Layout | Workflows | Dockerfiles |
| --- | --- | --- |
| Front + API (este repo) | front + api | `Dockerfile` na raiz + `backend/Dockerfile` |
| Só front | só front | `Dockerfile` na raiz |
| Só API | só api | `Dockerfile` na raiz **ou** `backend/Dockerfile` (ajuste `context` / `dockerfile` no workflow) |

## Nomes (Proposed — alinhado a DataForge / checklist AIOps)

| Campo | Valor | Evidência |
| --- | --- | --- |
| Namespace | `aiops-app-model` | Proposed (espelha `aiops-dataforge`) |
| Componente front | `aiops-app-model-front` | Proposed |
| Componente API | `aiops-app-model-api` | Proposed |
| `aws-account` | `cross` | Confirmed (checklist AIOps) |
| `product` | `ai-ops` | Confirmed (checklist AIOps; obrigatório em `cross`) |
| Environment | `production` | Confirmed (padrão DataForge) |
| Diretório EKS | `clusters/cross-prod/` | Confirmed (k8s-apps + checklist) |
| URL bake do front | `CORP_API_URL` em [`deploy/published-hosts.env`](../../../deploy/published-hosts.env) | Confirmed (corp; fonte única) |
| Porta front | `8080` | Confirmed (Dockerfile) |
| Porta API | `8000` | Confirmed (Dockerfile + uvicorn local) |
| Front publicado | `CORP_FRONT_URL` em `deploy/published-hosts.env` | Confirmed (corp) |
| API publicada | `CORP_API_URL` em `deploy/published-hosts.env` | Confirmed (corp) |
| Front Cross Prod (legado) | `CROSS_FRONT_URL` em `deploy/published-hosts.env` | Confirmed (mantido no CORS no cutover) |
| API Cross Prod (legado) | `CROSS_API_URL` em `deploy/published-hosts.env` | Confirmed |

## Checklist de progresso

### 1. Repositório da aplicação

| Passo | Status | Notas |
| --- | --- | --- |
| Layout: front na raiz + API em `backend/` | Confirmed | Presente |
| Workflows `prod-k8s-deployment-*.yml` | **Feito** | Passo 1 — ver log abaixo |
| `Dockerfile` (front) + `docker/entrypoint.sh` | **Feito** | Passo 2 — Nitro `node-server` |
| `backend/Dockerfile` | **Feito** | Passo 2 — FastAPI + uv |
| Endpoints de health estáveis | Confirmed | Front `GET /health`; API `GET /health` (+ `/api/health`) |
| Paths Vault populados (Cross Prod) | **Feito** | Passo 3 — reenviado após JWT + limpeza do front; URLs corp ainda pendentes |
| PR k8s-apps (aprovação de par) | **Aberto** — checks OK, `REVIEW_REQUIRED` | https://github.com/loft-br/k8s-apps/pull/10519 |
| PR kong-configs | **Merged** (#1107 / #1114); plugin CORS **aberto** | https://github.com/loft-br/kong-configs/pull/1115 |
| PR infra-live (DNS) | **Aberto** — `REVIEW_REQUIRED` | https://github.com/loft-br/infra-live/pull/2145 |
| GitHub Environment `production` + OIDC | Unknown | Validar config do repo/org |
| Secret org `GIT_HUB_TOKEN` no repo | Unknown | Usado por `loft-br/actions/deploy` |

### 2. k8s-apps (`loft-br/k8s-apps`)

| Passo | Status | Notas |
| --- | --- | --- |
| `clusters/cross-prod/deployments/aiops-app-model/.../values.yaml` | **Preparado** | Passo 4 — PR no `k8s-apps` (precisa aprovação de par) |
| Application Argo CD `clusters/cross-prod/applications/aiops-app-model.yaml` | **Preparado** | Mesmo PR |
| Path Vault secrets | **Alinhado** | `vaultSecrets` → `ai-ops/aiops-app-model-api` / `…-front` |
| Ingress Kong nos values | **Preparado** | `ingress.className: kong` (host público = passos Kong/DNS depois) |

### 3. Kong / DNS / Vault / Datadog / validação

| Área | Status |
| --- | --- |
| KV Vault criado + `.env` local enviado | **Feito** | Paths abaixo |
| Rotas Kong (corp front / API external) | **PR CORS aberto** | Rotas na `main`; [kong-configs#1115](https://github.com/loft-br/kong-configs/pull/1115) adiciona plugin `cors` na rota da API |
| Route53 API → `kong-external` | **Espelho atualizado; apply via GHA** | `deploy/dns/…api…terragrunt.hcl` = `external`; sem PR manual no infra-live neste chat |
| Datadog APM + logs estruturados | Pendente |
| Validação pós-deploy | Em andamento | Hosts internos no ar; ver Passo 7 (CORS) |

---

## Passo 1 — Workflows GitHub Actions

**Status:** Feito

### Criado neste repositório

| Arquivo | Função |
| --- | --- |
| [`.github/workflows/prod-k8s-deployment-front.yml`](../../../.github/workflows/prod-k8s-deployment-front.yml) | Build + deploy da imagem front |
| [`.github/workflows/prod-k8s-deployment-api.yml`](../../../.github/workflows/prod-k8s-deployment-api.yml) | Build + deploy da imagem API |
| [`deploy/published-hosts.env`](../../../deploy/published-hosts.env) | URLs corp/Cross canônicas (`CORP_*` / `CROSS_*`) |

### Exemplos portáteis

| Template | Caminho |
| --- | --- |
| Workflow front | [examples/prod-k8s-deployment-front.yml.example](../../en/operations/examples/prod-k8s-deployment-front.yml.example) |
| Workflow API | [examples/prod-k8s-deployment-api.yml.example](../../en/operations/examples/prod-k8s-deployment-api.yml.example) |

### Forma mínima (Confirmed — AIOps + DataForge)

```yaml
runs-on: ubuntu-arm
environment: production
permissions:
  id-token: write
  contents: read

# steps:
#   - uses: actions/checkout@v6   # runtime Node.js 24 (não Node 20)
# loft-br/actions/deploy@deploy/v1.8.0
# with:
#   aws-account: cross
#   product: ai-ops
#   github-token: ${{ secrets.GIT_HUB_TOKEN }}
#   platforms: linux/arm64
```

Front usa `dockerfile: Dockerfile` e `build-args` a partir de `deploy/published-hosts.env` (`CORP_API_URL` → `VITE_API_URL`).  
API usa `context: backend` + `dockerfile: backend/Dockerfile`.

O ARG default do Dockerfile permanece local (`http://localhost:8000`); o bake de produção vem sempre do workflow.

Referência: [workflows do DataForge](https://github.com/loft-br/aiops-dataforge/tree/main/.github/workflows).

**Depreciação Node.js 20 (Confirmed):** runners do GitHub Actions forçam actions JS para Node 24. Este repo fixa `actions/checkout@v6` (Node 24). Não há `actions/setup-node` nos YAMLs deste repo; se o aviso continuar, vem de composite aninhado (ex.: `loft-br/actions/deploy`) e depende de bump upstream.

---

## Passo 2 — Dockerfiles (requisitos básicos)

**Status:** Feito

### Objetivos

Imagens **pequenas e reutilizáveis** que qualquer app AIOps possa copiar e especializar:

1. Build multi-stage
2. Usuário non-root (`app`)
3. `EXPOSE` + `PORT` explícitos
4. `HEALTHCHECK` alinhado às rotas do app
5. Sem secrets nas layers (só build-args públicos como `VITE_API_URL`)
6. Preferir `*-bookworm-slim` / glibc em `linux/arm64`

### Criado neste repositório

| Arquivo | Função |
| --- | --- |
| [`Dockerfile`](../../../Dockerfile) | Front — Node 24 + Nitro `node-server` → `.output/` |
| [`docker/entrypoint.sh`](../../../docker/entrypoint.sh) | Define `PORT`/`HOST`, executa `.output/server/index.mjs` |
| [`backend/Dockerfile`](../../../backend/Dockerfile) | API — Python 3.12 + uv + uvicorn |
| [`.dockerignore`](../../../.dockerignore) / [`backend/.dockerignore`](../../../backend/.dockerignore) | Context de build enxuto |
| [`src/routes/health.ts`](../../../src/routes/health.ts) | Liveness do front `GET /health` (path público) |

### Exemplos portáteis

| Template | Caminho |
| --- | --- |
| Dockerfile front | [examples/Dockerfile.front.example](../../en/operations/examples/Dockerfile.front.example) |
| Entrypoint front | [examples/docker-entrypoint.sh.example](../../en/operations/examples/docker-entrypoint.sh.example) |
| Dockerfile API | [examples/Dockerfile.api.example](../../en/operations/examples/Dockerfile.api.example) |

### Notas do front (esta stack)

- O preset Nitro padrão do Lovable é Cloudflare; **o build Docker define `NITRO_PRESET=node-server`** para a imagem escutar em Node (EKS), sem mudar o target Lovable.
- Manter `/health` público (`src/lib/auth-guard.ts`).

### Notas da API (esta stack)

- Entry: `uvicorn app.main:app --host 0.0.0.0 --port 8000`
- Liveness: `GET /health` (também `/api/health`)
- Secrets de runtime via env/Vault depois — não fazer `COPY` de `.env`

### Smoke test local

```sh
# Front
docker build -t aiops-app-model-front:local \
  --build-arg VITE_API_URL=http://localhost:8000 .

docker run --rm -p 8080:8080 aiops-app-model-front:local
curl -sf http://127.0.0.1:8080/health

# API (a partir da raiz do repo)
docker build -t aiops-app-model-api:local -f backend/Dockerfile backend
docker run --rm -p 8000:8000 --env-file backend/.env aiops-app-model-api:local
curl -sf http://127.0.0.1:8000/health
```

**Próximo passo recomendado:** scaffold dos values em `k8s-apps` (probes devem bater com `/health` e portas `8080` / `8000`).

---

## Passo 3 — Vault (Cross Prod)

**Status:** Feito — KV gravado; follow-ups abaixo.

### Login humano (uma vez por máquina / TTL do token)

```sh
export VAULT_ADDR=https://vault.loft-corp.com.br
# UI do Vault → foto de perfil → Copy token
vault login
# colar o token
```

### Paths KV (este app)

| Componente | Mount | Path | UI |
| --- | --- | --- | --- |
| API | `cross` | `ai-ops/aiops-app-model-api` | [Vault UI](https://vault.loft-corp.com.br/ui/vault/secrets/cross/kv/ai-ops%2Faiops-app-model-api) |
| Front | `cross` | `ai-ops/aiops-app-model-front` | [Vault UI](https://vault.loft-corp.com.br/ui/vault/secrets/cross/kv/ai-ops%2Faiops-app-model-front) |

Forma CLI: `vault kv put cross/ai-ops/aiops-app-model-api …` (no `k8s-apps`, `application.vaultSecrets` usa `mount: cross` + `path: ai-ops/aiops-app-model-api` — **sem** o prefixo `cross/` no path).

### Script

| Item | Local |
| --- | --- |
| Script de push | [`scripts/vault/push_secrets.py`](../../../scripts/vault/push_secrets.py) |
| Stub na docs | [examples/push_secrets.py.example](../../en/operations/examples/push_secrets.py.example) |
| npm | `npm run vault:push:dry-run` / `npm run vault:push` |

Mapeamento:

- `.env` na raiz → `cross/ai-ops/aiops-app-model-front`
- `backend/.env` → `cross/ai-ops/aiops-app-model-api`

```sh
export VAULT_ADDR=https://vault.loft-corp.com.br
python3 scripts/vault/push_secrets.py --dry-run   # só nomes das keys
python3 scripts/vault/push_secrets.py             # grava os dois paths
```

### Aplicado
- KV front gravado (depois limpo para keys orientadas ao front)
- KV API gravado (inclui `JWT_SECRET` após ajuste no `.env` local)
- Reenvio após ajustes do usuário (mesmo dia)

### Pendências antes dos pods em produção

1. **`VITE_API_URL` / `CORS_ORIGINS` ainda localhost** — trocar pelos hosts corp quando o DNS existir e reenviar
2. Opcional: remover do KV front keys que sobraram e não são do runtime (ex.: `DB_SSL_INSECURE`)
3. Plugar os mesmos paths em `application.vaultSecrets` no `k8s-apps` (próximo passo)

Doc canônica: [aiops-documentation vault-secrets](https://github.com/loft-br/aiops-documentation/blob/main/docs/pt-BR/loft-infra/vault-secrets.md).

---

## Passo 4 — k8s-apps (values Helm + Application Argo CD)

**Status:** Preparado neste repo + PR aberto em `loft-br/k8s-apps` (merge exige **aprovação de par**).

### Por que PR (e um par)

`loft-br/k8s-apps` é a fonte GitOps do EKS. Mudanças em `main` são reconciliadas pelo Argo CD. **Não faça push direto em `main`.** Abra uma branch, abra um Pull Request e obtenha **pelo menos uma review/aprovação de um par** antes do merge.

Árvore de referência: [deployments do aiops-dataforge](https://github.com/loft-br/k8s-apps/tree/main/clusters/cross-prod/deployments/aiops-dataforge).

### Arquivos a adicionar no `k8s-apps`

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

### Cópias de trabalho + exemplos portáteis (este repo)

| Papel | Caminho |
| --- | --- |
| Values API (espelho) | [`deploy/k8s/aiops-app-model-api/values.yaml`](../../../deploy/k8s/aiops-app-model-api/values.yaml) |
| Values front (espelho) | [`deploy/k8s/aiops-app-model-front/values.yaml`](../../../deploy/k8s/aiops-app-model-front/values.yaml) |
| Application (espelho) | [`deploy/k8s/aiops-app-model.application.yaml`](../../../deploy/k8s/aiops-app-model.application.yaml) |
| README | [`deploy/k8s/README.md`](../../../deploy/k8s/README.md) |
| Exemplos | [k8s-apps-*.example](../../en/operations/examples/) |

### Resumo sólido da configuração (AIOPS App Model)

| Campo | API | Front |
| --- | --- | --- |
| `application.name` | `aiops-app-model-api` | `aiops-app-model-front` |
| Namespace / destino Argo | `aiops-app-model` | mesmo |
| Porta | `8000` | `8080` |
| Probes | `/health` | `/health` (+ `startupProbe`) |
| `vaultSecrets` | `mount: cross` / `path: ai-ops/aiops-app-model-api` | `…/aiops-app-model-front` |
| Ingress | `className: kong` | mesmo |
| Chart | `web-server` `2.15.3` (pin como DataForge) | mesmo |
| ECR (esperado) | `…/aiops-app-model-aiops-app-model-api` | `…/aiops-app-model-aiops-app-model-front` |
| `podAnnotations` source repo | `aiops-app-model` | mesmo |
| `team` | `squad-ai-ops` | mesmo |

A tag `bootstrap` é placeholder até o primeiro `loft-br/actions/deploy` bem-sucedido atualizar `repository` + `tag`.

### Como abrir o PR no `k8s-apps` (aprovação de par obrigatória)

```sh
# 1) Clone (ou atualize) o k8s-apps
git clone git@github.com:loft-br/k8s-apps.git
cd k8s-apps
git checkout main && git pull origin main

# 2) Branch de feature — nunca commitar na main
git checkout -b feat/aiops-app-model-cross-prod

# 3) Copiar manifests a partir das cópias em aiops-app-model
mkdir -p clusters/cross-prod/deployments/aiops-app-model/aiops-app-model-api \
         clusters/cross-prod/deployments/aiops-app-model/aiops-app-model-front

# A partir do checkout do aiops-app-model:
cp /caminho/aiops-app-model/deploy/k8s/aiops-app-model-api/values.yaml \
   clusters/cross-prod/deployments/aiops-app-model/aiops-app-model-api/values.yaml
cp /caminho/aiops-app-model/deploy/k8s/aiops-app-model-front/values.yaml \
   clusters/cross-prod/deployments/aiops-app-model/aiops-app-model-front/values.yaml
cp /caminho/aiops-app-model/deploy/k8s/aiops-app-model.application.yaml \
   clusters/cross-prod/applications/aiops-app-model.yaml

# 4) Commit + push da branch
git add clusters/cross-prod/deployments/aiops-app-model \
        clusters/cross-prod/applications/aiops-app-model.yaml
git commit -m "Add AIOPS App Model (api + front) to cross-prod"
git push -u origin HEAD

# 5) Abrir PR contra main (exige review de par)
gh pr create --base main --title "Add AIOPS App Model to cross-prod" --body "$(cat <<'EOF'
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

### Checklist de review / merge (par)

- [ ] Paths só sob `clusters/cross-prod/…` (sem apps não relacionados)
- [ ] `vaultSecrets.path` idêntico ao Vault UI (sem `/secrets` extra se o KV não usa)
- [ ] Portas/probes iguais aos Dockerfiles (`8000` / `8080`, `/health`)
- [ ] `ingress.className: kong`
- [ ] Application multi-source com base values + ambos componentes + `ref: values`
- [ ] **Pelo menos uma aprovação de par** antes do merge em `main`
- [ ] Após merge: conferir sync no Argo (pods podem ficar em `ImagePullBackOff` até o 1º deploy GHA)

### Depois do merge

1. Argo CD cria o namespace `aiops-app-model` e sincroniza os charts.
2. Rodar workflows de deploy front/API no `aiops-app-model` para a tag ECR substituir `bootstrap`.
3. Seguir com Kong + Route53 (Passo 5).

---

## Passo 5 — Kong + DNS (front corp + API external)

**Status:** Padrão Confirmed (DataForge). API esteve em kong-corp (PR #1113) — **volta para external**: Cognito no ALB responde `302` no `OPTIONS` do CORS e quebra o SPA.

### Log — API corp → external

| Afirmação | Classificação |
| --- | --- |
| Browser autentica JumpCloud no host da API e recebe JSON do FastAPI | Confirmed |
| `fetch` do SPA no front corp falha: preflight `OPTIONS` → ALB `302` Cognito (“Redirect is not allowed for a preflight request”) | Confirmed |
| Browsers não enviam cookies no preflight CORS | Confirmed (Fetch / CORS) |
| API DataForge em `kong-external` responde `OPTIONS`/`GET` sem Cognito | Confirmed |
| Correção: mover route/service para `gateways/infra-prod/external/cross/` + `ip-restriction` Netskope; DNS `kong_accessibility = external` | Proposed → em implementação |
| Apply de DNS deste app via GitHub Actions / `#AUTOAPPLYME`, sem PR manual no infra-live neste chat | Confirmed (processo do time) |

Cópias: `deploy/kong/external/*`, `deploy/dns/aiops-app-model-api…terragrunt.hcl`. PRs: [kong-configs#1114](https://github.com/loft-br/kong-configs/pull/1114) · [aiops-app-model#11](https://github.com/loft-br/aiops-app-model/pull/11).

### Caminho do tráfego

```text
Browser → Route53 (*.loft-corp.com.br)
       → kong-{corp|external}.infrastructure.loft-prod.io
       → Kong route/service (kong-configs)
       → <service>.cross.loft-prod.io (ingress k8s do k8s-apps)
```

### Hosts (este app)

| Papel | FQDN público | Upstream | Gateway |
| --- | --- | --- | --- |
| Front | `aiops-app-model.loft-corp.com.br` | `aiops-app-model-front.cross.loft-prod.io:443` | **corp** |
| API | `aiops-app-model-api.loft-corp.com.br` | `aiops-app-model-api.cross.loft-prod.io:443` | **external** (+ `ip-restriction` Netskope) |

Referência (front):  
https://github.com/loft-br/kong-configs/blob/main/gateways/infra-prod/corp/cross/routes/aiops-dataforge-front-route.yaml  
https://github.com/loft-br/kong-configs/blob/main/gateways/infra-prod/corp/cross/services/aiops-dataforge-front-service.yaml

### Arquivos adicionados

**kong-configs**

```text
gateways/infra-prod/corp/cross/
  routes/aiops-app-model-front-route.yaml
  services/aiops-app-model-front-service.yaml
gateways/infra-prod/external/cross/
  routes/aiops-app-model-api-route.yaml      # inclui ip-restriction
  services/aiops-app-model-api-service.yaml
```

**infra-live**

```text
live/aws/infrastructure/production/_global/route53/records/loft-corp.com.br/
  aiops-app-model.loft-corp.com.br/terragrunt.hcl      # corp
  aiops-app-model-api.loft-corp.com.br/terragrunt.hcl  # external
```

Cópias de trabalho: [`deploy/kong/`](../../../deploy/kong/) · [`deploy/dns/`](../../../deploy/dns/)  
Exemplos: [kong-*.example](../../en/operations/examples/) · [dns-*.example](../../en/operations/examples/)

### PRs abertos (aprovação de par obrigatória)

| Repo | PR |
| --- | --- |
| `loft-br/kong-configs` | https://github.com/loft-br/kong-configs/pull/1107 |
| `loft-br/infra-live` | https://github.com/loft-br/infra-live/pull/2145 |

### Como abrir esses PRs (template)

```sh
### Kong
git clone git@github.com:loft-br/kong-configs.git && cd kong-configs
git checkout -b feat/aiops-app-model-kong
# copiar deploy/kong/corp/* e deploy/kong/external/* para gateways/infra-prod/...
git add gateways/infra-prod/corp/cross/routes/aiops-app-model-front-route.yaml \
        gateways/infra-prod/corp/cross/services/aiops-app-model-front-service.yaml \
        gateways/infra-prod/external/cross/routes/aiops-app-model-api-route.yaml \
        gateways/infra-prod/external/cross/services/aiops-app-model-api-service.yaml
git commit -m "Add AIOPS App Model Kong routes (corp front + external API)"
git push -u origin HEAD
gh pr create --base main --title "Add AIOPS App Model Kong routes (corp + external)"

### DNS (nunca terragrunt apply local)
git clone git@github.com:loft-br/infra-live.git && cd infra-live
git checkout -b feat/aiops-app-model-dns
# copiar os terragrunt.hcl para a árvore loft-corp.com.br
git add live/aws/infrastructure/production/_global/route53/records/loft-corp.com.br/aiops-app-model.loft-corp.com.br \
        live/aws/infrastructure/production/_global/route53/records/loft-corp.com.br/aiops-app-model-api.loft-corp.com.br
git commit -m "Add Route53 Kong records for AIOPS App Model"
git push -u origin HEAD
gh pr create --base main --title "Add Route53 records for AIOPS App Model (corp + external)"
```

### Checklist de review (par)

**Kong**

- [ ] Front em `corp/cross`, API em `external/cross`
- [ ] Upstreams batem com os nomes k8s (`*-front` / `*-api` + `.cross.loft-prod.io`)
- [ ] Route da API tem allowlist Netskope (`ip-restriction`)
- [ ] Tags `impact_level:5` + `squad:squad-ai`
- [ ] **Aprovação de par** antes do merge

**DNS**

- [ ] `#AUTOAPPLYME` presente
- [ ] `kong_accessibility` alinhado ao gateway (`corp` front / `external` API)
- [ ] `record_name` alinhado ao hostname público
- [ ] Blueprint `route53/kong-record` `4.2.1`
- [ ] **Sem apply local** — só Atlantis/Terrateam
- [ ] **Aprovação de par** antes do merge

### Depois dos dois merges

1. Confirmar DNS (`dig aiops-app-model.loft-corp.com.br`, `dig aiops-app-model-api.loft-corp.com.br`).
2. Atualizar Vault / `.env`: `VITE_API_URL` + `CORS_ORIGINS` para hosts corp → `npm run vault:push`.
3. Redeploy do front (bake `VITE_API_URL`) e da API quando estiver pronto.

---

## Passo 6 — Validação do fluxo completo + erros comuns

**Status:** Documentado. Executar após merges + primeiro deploy GHA.

### Quadro de PRs (estado na abertura deste passo)

| Repo | PR | Checks | Review | Ação |
| --- | --- | --- | --- | --- |
| `k8s-apps` | [#10519](https://github.com/loft-br/k8s-apps/pull/10519) | ✅ verdes | `REVIEW_REQUIRED` | Pedir aprovação de par → merge |
| `kong-configs` | [#1107](https://github.com/loft-br/kong-configs/pull/1107) | ✅ verdes | **`APPROVED`** | Pode mergear (respeitar regras do repo) |
| `infra-live` | [#2145](https://github.com/loft-br/infra-live/pull/2145) | (Atlantis) | `REVIEW_REQUIRED` | Pedir aprovação + apply Atlantis/Terrateam |

Não é necessário abrir PRs novos de k8s-apps/kong — **já existem**.

### Ordem segura de validação end-to-end

1. Merge **k8s-apps** → Argo cria namespace `aiops-app-model` (pods podem falhar imagem até o deploy).
2. Merge **kong-configs** → rotas/services no gateway.
3. Merge + apply **infra-live** → DNS resolve.
4. Rodar workflows `prod-k8s-deployment-*.yml` no `aiops-app-model` (imagem real substitui `bootstrap`).
5. Atualizar Vault (`VITE_API_URL`, `CORS_ORIGINS`) e redeploy front se o bake ainda estiver localhost.
6. Smoke HTTPS:

```sh
curl -sfI https://aiops-app-model.loft-corp.com.br/health
curl -sfI https://aiops-app-model-api.loft-corp.com.br/health
```

### Erros comuns e o que checar

| Sintoma | Causa provável | O que fazer |
| --- | --- | --- |
| `ImagePullBackOff` / tag `bootstrap` | Ainda não rodou o deploy GHA | Disparar workflow front/API; conferir ECR `…/aiops-app-model-aiops-app-model-*` |
| Pod `CrashLoop` API: falta `JWT_SECRET` / DB | Vault path errado ou key ausente | Path KV = `vaultSecrets.path`; `vault kv get` (só nomes); re-push; restart pods |
| `VaultStaticSecret` não sincroniza | Path/mount divergente do values | `mount: cross` + path **exato** (`ai-ops/aiops-app-model-api` sem `/secrets` extra) |
| Probe falhando | Porta/path errados | API `8000` `/health`; front `8080` `/health` (+ startupProbe) |
| DNS não resolve | PR `infra-live` não merged/applied | Ver Atlantis; `dig` nos FQDNs |
| DNS ok, HTTPS 404/502 no Kong | Route/service ausentes ou upstream errado | Conferir merge kong-configs; upstream `*.cross.loft-prod.io` |
| API `404 Not Found` fora da Loft | Plugin `ip-restriction` (esperado) | Acessar via Netskope / rede corp |
| Front chama API localhost / CORS | `VITE_API_URL` bakeado ou CORS antigo | Ajustar `.env`, `vault:push`, rebuild/redeploy front; CORS no Vault da API |
| Workflow deploy falha auth AWS/OIDC | Environment `production` / permissões | `id-token: write`; secret `GIT_HUB_TOKEN`; environment GitHub |
| Workflow falha patch `k8s-apps` | Application/values ainda não na `main` | Merge PR #10519 antes do primeiro deploy |
| Argo `Unknown` / sync fail chart | `targetRevision` chart divergente | AIOps pin atual: `web-server` `2.15.3` (igual DataForge) |
| SIGTERM nos logs no deploy | Rolling update normal | Só é problema se `CrashLoopBackOff` / RESTARTS sobem sem parar |

### Comandos úteis pós-merge

```sh
# Cluster (com contexto cross-prod)
kubectl -n aiops-app-model get pods,ing,secrets
kubectl -n aiops-app-model describe pod <pod>
kubectl -n aiops-app-model logs <pod> --previous

# DNS
dig +short aiops-app-model.loft-corp.com.br
dig +short aiops-app-model-api.loft-corp.com.br

# Vault (só lista keys — não imprime valores)
export VAULT_ADDR=https://vault.loft-corp.com.br
vault kv metadata get cross/ai-ops/aiops-app-model-api
vault kv metadata get cross/ai-ops/aiops-app-model-front
```

### Critérios de “fluxo completo OK”

- [ ] PRs k8s-apps + kong + DNS merged (DNS applied)
- [ ] Argo Application `aiops-app-model` Synced/Healthy
- [ ] Pods Ready com imagem ECR real (não `bootstrap`)
- [ ] `GET /health` 200 no front e na API (via host corp / external)
- [ ] Front em produção aponta API corp (`VITE_API_URL`)
- [ ] Sem secrets em Git / logs

### Pendências conhecidas deste adopter (não bloqueiam o merge dos PRs)

1. `VITE_API_URL` / `CORS_ORIGINS` locais ainda podem estar em localhost → atualizar após DNS.
2. Confirmar GitHub Environment `production` + herança de `GIT_HUB_TOKEN` no repo `aiops-app-model`.
3. Datadog APM / logs estruturados (passo opcional de observabilidade).
4. Promover este runbook de `DRAFT` → `ACCEPTED` só com dono do doc (pedir antes).

---

## Passo 7 — CORS (hosts corp)

**Status:** Cutover para corp — bake + Vault devem usar loft-corp.com.br.

### URLs canônicas (Confirmed)

| Papel | URL |
| --- | --- |
| Front | https://aiops-app-model.loft-corp.com.br/ |
| API | https://aiops-app-model-api.loft-corp.com.br/ |

Notas:

- Preferir **https**.
- Manter a origin Cross Prod no `CORS_ORIGINS` durante o cutover para os dois fronts funcionarem até o tráfego migrar.

### O que é CORS neste app

O browser no **front** chama a **API** em outro host. O FastAPI monta `CORSMiddleware` com `allow_origins=settings.cors_origin_list` e `allow_credentials=True` (`backend/app/main.py`).

A lista vem de **`CORS_ORIGINS`** (env / Vault), origins **exatas** (scheme + host, **sem** barra no final), separadas por vírgula.

**Importante**

| Config | Onde vale | Como mudar em prod |
| --- | --- | --- |
| `CORS_ORIGINS` | Runtime da API (Vault → pod) | `vault kv patch` + restart/rollout da API |
| Mapa origin → API | Bake `VITE_CORP_*` / `VITE_CROSS_*` + `src/lib/api-base-url.ts` | Atualizar `deploy/published-hosts.env` + **novo deploy** do front |
| `VITE_API_URL` | **Fallback** SSR / host desconhecido (bake = `FRONT_BAKE_API_URL`) | Mesmo redeploy |

Mapa no browser (Confirmed — intenção):

| Front | Base da API (sem `/login` — auth em `/api/v1/auth/*`) |
| --- | --- |
| `https://aiops-app-model.loft-corp.com.br` | `https://aiops-app-model-api.loft-corp.com.br` |
| `https://aiops-app-model-front.cross.loft-prod.io` | `https://aiops-app-model-api.cross.loft-prod.io` |

Patch só no Vault do front **não** altera um bundle já publicado.

### Passos (cutover corp)

1. Confirmar que os hosts corp resolvem e respondem.
2. Patch do Vault da API:

```sh
export VAULT_ADDR=https://vault.loft-corp.com.br
vault login   # se precisar

vault kv patch cross/ai-ops/aiops-app-model-api \
  CORS_ORIGINS='https://aiops-app-model.loft-corp.com.br,https://aiops-app-model-front.cross.loft-prod.io' \
  COOKIE_SECURE=true \
  EXPOSE_DEV_TOKENS=false
```

3. Alinhamento opcional do Vault do front (lembrar do bake):

```sh
vault kv patch cross/ai-ops/aiops-app-model-front \
  VITE_API_URL='https://aiops-app-model-api.loft-corp.com.br'
```

4. Se o header CORS estiver antigo: esperar refresh do `VaultStaticSecret` (~30s) ou:

```sh
kubectl -n aiops-app-model rollout restart deploy/aiops-app-model-api
```

5. Validar:

```sh
curl -sI \
  -H 'Origin: https://aiops-app-model.loft-corp.com.br' \
  -X OPTIONS \
  -H 'Access-Control-Request-Method: GET' \
  https://aiops-app-model-api.loft-corp.com.br/health
# Esperado: access-control-allow-origin: https://aiops-app-model.loft-corp.com.br
```

6. Alinhar artefatos do repo para o próximo bake:
   - Atualizar `CORP_API_URL` / `CORP_FRONT_URL` em [`deploy/published-hosts.env`](../../../deploy/published-hosts.env) (fonte única)
   - Workflow front carrega esse arquivo em `build-args` → `VITE_API_URL`
   - ARG default do Dockerfile permanece local; prod não depende dele
   - `backend/.env.example` documenta origins de prod
   - Exemplo: [cors-origins.env.example](../../en/operations/examples/cors-origins.env.example)

7. **Redeploy do front** (GHA) para o browser usar a API corp.

### Local vs Vault

| Ambiente | `CORS_ORIGINS` típico |
| --- | --- |
| Local (`backend/.env`) | localhost **+** fronts publicados (para `vault:push` não apagar prod) |
| Vault prod (API) | front corp (+ Cross Prod no cutover) |

Prefira `vault kv patch` de chaves isoladas em vez de `vault:push` completo a partir de um `.env` só com localhost.

### Erros comuns (CORS)

| Sintoma | Causa | Correção |
| --- | --- | --- |
| Browser `Failed to fetch` / banner offline, `curl` OK | Origin não está em `CORS_ORIGINS` | Incluir origin **exata**; restart API |
| `/` no final da origin | String ≠ `Origin` do browser | Sem barra final |
| `http://` na lista, site em `https://` | Scheme diferente | Usar https |
| Front ainda chama API Cross antiga | Bake antigo de `VITE_API_URL` | Redeploy front com build-arg corp |
| Cookies / login falham em https | `COOKIE_SECURE=false` | `COOKIE_SECURE=true` no Vault |
| CORS na UI Admin não surte efeito | Middleware montado no startup | Restart da API após mudar settings |

### Checklist do Passo 7

- [ ] Vault API: `CORS_ORIGINS` com front corp (+ Cross opcional)
- [ ] Vault / bake: `VITE_API_URL` = `CORP_API_URL` de `deploy/published-hosts.env`
- [ ] Preflight OPTIONS OK para o front corp (`CORP_FRONT_URL`)
- [ ] Workflow carrega `deploy/published-hosts.env` no bake
- [ ] Redeploy front após mudança de bake
- [ ] Smoke de login/navegação no host corp


---

## Log de passos

### Criar workflows GitHub Actions

Ver **Passo 1**. Action: `loft-br/actions/deploy@deploy/v1.8.0`.

### Atualizar `actions/checkout` para Node 24

**Status:** Confirmed. `actions/checkout@v4` → `@v6` nos workflows front/API e exemplos.

### Criar Dockerfiles + exemplos

Ver **Passo 2**.

### Vault Cross Prod + script de push

Ver **Passo 3**.

### Manifests k8s-apps + fluxo de PR

Ver **Passo 4**. PR: https://github.com/loft-br/k8s-apps/pull/10519

### Kong + DNS

Ver **Passo 5**. PRs: https://github.com/loft-br/kong-configs/pull/1107 · https://github.com/loft-br/infra-live/pull/2145

### Validação + erros comuns

Ver **Passo 6**.

### CORS hosts publicados

Ver **Passo 7** (baseline Cross Prod).

### Cutover CORS corp

Bake + exemplos do repo passam a usar hosts corp de [`deploy/published-hosts.env`](../../../deploy/published-hosts.env):
- Front `CORP_FRONT_URL`
- API `CORP_API_URL`

Ainda é preciso `vault kv patch` + restart da API + redeploy do front no cluster.

### Centralizar hosts publicados

- Criado `deploy/published-hosts.env` como fonte única das URLs corp/Cross
- GHA do front carrega `CORP_API_URL` no build-arg `VITE_API_URL`
- ARG default do Dockerfile é só local (bake de prod via workflow)
- `scripts/vault/push_secrets.py` deriva avisos desse arquivo (`--hosts-file` / overrides `CORP_*_URL`)

### Plugin CORS na rota Kong (GitOps)

- [kong-configs#1115](https://github.com/loft-br/kong-configs/pull/1115): `cors` em `aiops-app-model-api-route` (external)
  - Origin: `https://aiops-app-model.loft-corp.com.br` (exata)
  - Métodos: iguais à rota; headers: `authorization`, `content-type`
  - `credentials: true` (cookies / Cognito no SPA)
- Sem mudança em `k8s-apps` — runbook Kong Corp: só PR/merge em `kong-configs`
- Espelho local: `deploy/kong/external/routes/aiops-app-model-api-route.yaml`

## Referências

- [Checklist — novo serviço](https://github.com/loft-br/aiops-documentation/blob/main/docs/pt-BR/loft-infra/checklist-novo-servico.md)
- [GitHub Actions deploy](https://github.com/loft-br/aiops-documentation/blob/main/docs/pt-BR/loft-infra/github-actions-deploy.md)
- [Dockerfiles (AIOps)](https://github.com/loft-br/aiops-documentation/blob/main/docs/pt-BR/loft-infra/dockerfiles.md)
- [Vault secrets](https://github.com/loft-br/aiops-documentation/blob/main/docs/pt-BR/loft-infra/vault-secrets.md)
- [k8s-apps](https://github.com/loft-br/aiops-documentation/blob/main/docs/pt-BR/loft-infra/k8s-apps.md)
- [Kong gateway](https://github.com/loft-br/aiops-documentation/blob/main/docs/pt-BR/loft-infra/kong-gateway.md)
- [infra-live Route53](https://github.com/loft-br/aiops-documentation/blob/main/docs/pt-BR/loft-infra/infra-live-route53.md)
- Local: [local-development.md](local-development.md)
