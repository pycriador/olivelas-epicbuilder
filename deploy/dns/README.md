# Route53 (`infra-live`) — AIOPS App Model

**Source of truth for DNS:** [`loft-br/infra-live`](https://github.com/loft-br/infra-live).

Local files are working copies. Production apply is via the project’s GitHub Actions / `#AUTOAPPLYME` path — not a manual `infra-live` PR from this chat unless that automation is unavailable.

| Local file | Path in `infra-live` | `kong_accessibility` |
| --- | --- | --- |
| `aiops-app-model.loft-corp.com.br.terragrunt.hcl` | `…/aiops-app-model.loft-corp.com.br/terragrunt.hcl` | **corp** |
| `aiops-app-model-api.loft-corp.com.br.terragrunt.hcl` | `…/aiops-app-model-api.loft-corp.com.br/terragrunt.hcl` | **external** |

Expected CNAMEs after apply:

| FQDN | Target |
| --- | --- |
| `aiops-app-model.loft-corp.com.br` | `kong-corp.infrastructure.loft-prod.io` |
| `aiops-app-model-api.loft-corp.com.br` | `kong-external.infrastructure.loft-prod.io` |

Never `terragrunt apply` locally — Terrateam/Atlantis (or the repo GHA that opens/applies records) only.

Verify: `dig +short aiops-app-model-api.loft-corp.com.br` → `kong-external…`
