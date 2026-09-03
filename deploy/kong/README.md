# Kong + DNS — AIOPS App Model

Working copies of manifests that must land in:

| Concern | Upstream repo | This folder |
| --- | --- | --- |
| Kong corp (front) | `loft-br/kong-configs` → `gateways/infra-prod/corp/cross/` | `deploy/kong/corp/` |
| Kong external (API) | `loft-br/kong-configs` → `gateways/infra-prod/external/cross/` | `deploy/kong/external/` |
| Route53 | `loft-br/infra-live` → `…/route53/records/loft-corp.com.br/` | `deploy/dns/` |

## Public hosts (DataForge pattern)

| Component | Public FQDN | Upstream (k8s ingress) | Gateway |
| --- | --- | --- | --- |
| Front | `https://aiops-app-model.loft-corp.com.br` | `aiops-app-model-front.cross.loft-prod.io:443` | **corp** (JumpCloud ALB) |
| API | `https://aiops-app-model-api.loft-corp.com.br` | `aiops-app-model-api.cross.loft-prod.io:443` | **external** + Netskope `ip-restriction` |

**Why API is external (not corp):** Kong-corp ALB Cognito redirects unauthenticated `OPTIONS` with `302`. Browsers do not send cookies on CORS preflight, so SPA `fetch` from the corp front fails with “Redirect is not allowed for a preflight request”. External gateway has no Cognito on the request path; app auth + Netskope remain.

DNS: front `kong_accessibility = corp`, API `kong_accessibility = external` (synced via project GHA / `#AUTOAPPLYME` — do not open a manual `infra-live` PR unless that pipeline is missing).

## Status

| Piece | Status |
| --- | --- |
| Kong front (corp) | ✅ On `kong-configs` `main` |
| Kong API (external) | ✅ On `kong-configs` `main` ([#1114](https://github.com/loft-br/kong-configs/pull/1114)); CORS plugin ⏳ [#1115](https://github.com/loft-br/kong-configs/pull/1115) |
| DNS front (`corp`) | ✅ On `infra-live` `main` |
| DNS API (`external`) | ⏳ Mirror updated; apply via automatic DNS pipeline |

Reference: [aiops-documentation Kong gateway](https://github.com/loft-br/aiops-documentation/blob/main/docs/pt-BR/loft-infra/kong-gateway.md).

**CORS:** configure the Kong `cors` plugin on the API route in `kong-configs` (not in `k8s-apps`). Exact front origin + `credentials: true` when the SPA sends cookies / Cognito credentials.

Full instructions: [docs/pt-BR/operations/loft-infra-publish.md](../../docs/pt-BR/operations/loft-infra-publish.md) (Passo 5).
