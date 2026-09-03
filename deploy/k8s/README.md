# Kubernetes deploy manifests (Helm values) — AIOps App Model

These files mirror what must land in **`loft-br/k8s-apps`** for Cross Prod. They are **not** applied from this repository directly — Argo CD reads `k8s-apps`.

| Local file | Path in `loft-br/k8s-apps` |
| --- | --- |
| `aiops-app-model-api/values.yaml` | `clusters/cross-prod/deployments/aiops-app-model/aiops-app-model-api/values.yaml` |
| `aiops-app-model-front/values.yaml` | `clusters/cross-prod/deployments/aiops-app-model/aiops-app-model-front/values.yaml` |
| `aiops-app-model.application.yaml` | `clusters/cross-prod/applications/aiops-app-model.yaml` |

Reference layout: [aiops-dataforge in k8s-apps](https://github.com/loft-br/k8s-apps/tree/main/clusters/cross-prod/deployments/aiops-dataforge).

Full publish runbook (including **how to open the PR and get peer approval**):  
[docs/en/operations/loft-infra-publish.md](../../docs/en/operations/loft-infra-publish.md) · [pt-BR](../../docs/pt-BR/operations/loft-infra-publish.md)

Portable YAML examples: [docs/en/operations/examples/](../../docs/en/operations/examples/).

## Vault paths (must match `application.vaultSecrets`)

| Component | `mount` | `path` |
| --- | --- | --- |
| API | `cross` | `ai-ops/aiops-app-model-api` |
| Front | `cross` | `ai-ops/aiops-app-model-front` |

## Ports / probes

| Component | Port | Health |
| --- | --- | --- |
| API | `8000` | `GET /health` |
| Front | `8080` | `GET /health` (+ `startupProbe`) |

After the first successful GitHub Actions deploy, `application.image.repository` / `tag` are overwritten by `loft-br/actions/deploy`. Do not rely on hand-edited image tags.
