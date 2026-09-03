# Kong + DNS — AIOps App Model

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

DNS: front `kong_accessibility = corp`, API `kong_accessibility = external` (drafts include `#AUTOAPPLYME`).

## Status (2026-09-03)

| Piece | Status |
| --- | --- |
| Kong front (corp) | **Open** — [kong-configs#1134](https://github.com/loft-br/kong-configs/pull/1134) |
| Kong API (external + CORS + ip-restriction) | **Open** — same PR |
| DNS front (`corp`) | **Open** — [infra-live#2350](https://github.com/loft-br/infra-live/pull/2350) |
| DNS API (`external`) | **Open** — same PR |

Reference: [aiops-documentation Kong gateway](https://github.com/loft-br/aiops-documentation/blob/main/docs/pt-BR/loft-infra/kong-gateway.md).

**CORS:** Kong `cors` plugin on the API route (not in `k8s-apps`). Exact front origin + `credentials: true` when the SPA sends cookies.

Full instructions: [docs/pt-BR/operations/loft-infra-publish.md](../../docs/pt-BR/operations/loft-infra-publish.md).
