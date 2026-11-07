# Exemplos — publicação na infra Olivelas (workflows + Docker)

> Language: pt-BR | [English (EN)](../../../en/operations/examples/README.md)
>
> Templates com o **mínimo** para publicar um app Olivelas no EKS.
> Nem todo repositório tem front e API — copie só o que se aplica.

Os arquivos de exemplo ficam em [docs/en/operations/examples/](../../../en/operations/examples/) (fonte única; evite divergência).

| Exemplo | Copiar para (típico) | Quando |
| --- | --- | --- |
| `prod-k8s-deployment-front.yml.example` | `.github/workflows/prod-k8s-deployment-front.yml` | Repo com front Node/Vite |
| `prod-k8s-deployment-api.yml.example` | `.github/workflows/prod-k8s-deployment-api.yml` | Repo com API Python |
| `Dockerfile.front.example` | `Dockerfile` (raiz) | Imagem do front |
| `docker-entrypoint.sh.example` | `docker/entrypoint.sh` | Entrypoint do front |
| `Dockerfile.api.example` | `backend/Dockerfile` ou `Dockerfile` na raiz | Só API ou layout `backend/` |
| `push_secrets.py.example` | aponta para `scripts/vault/push_secrets.py` | Push do `.env` local → Vault Cross |
| `k8s-apps-api.values.yaml.example` | `clusters/cross-prod/deployments/.../values.yaml` | Values Helm da API |
| `k8s-apps-front.values.yaml.example` | mesma árvore, componente front | Values Helm do front |
| `k8s-apps-application.yaml.example` | `clusters/cross-prod/applications/<ns>.yaml` | Application Argo CD |
| `kong-front-*.example` | `kong-configs` gateway corp | Exposição do front |
| `kong-api-*.example` | `kong-configs` gateway external | API + IP restriction |
| `dns-corp` / `dns-api` `.terragrunt.hcl.example` | `infra-live` Route53 | CNAMEs corp / external |
| `cors-origins.env.example` | Vault `CORS_ORIGINS` / `backend/.env` | Origins dos fronts publicados |

**Cópias ativas neste repo:** `.github/workflows/`, `Dockerfile`, `docker/entrypoint.sh`, `backend/Dockerfile`.

**Hosts publicados canônicos:** [`deploy/published-hosts.env`](../../../deploy/published-hosts.env) — fonte única para bake do front (`CORP_API_URL`), avisos do Vault e exemplos de CORS. Em cutovers, altere os hosts nesse arquivo.

**Checklist canônico:** [loft-infra/checklist-novo-servico](https://github.com/loft-br/aiops-documentation/blob/main/docs/pt-BR/loft-infra/checklist-novo-servico.md).

Placeholders:

| Placeholder | Exemplo (este app) |
| --- | --- |
| `<namespace>` | `aiops-app-model` |
| `<front-name>` | `aiops-app-model-front` |
| `<api-name>` | `aiops-app-model-api` |
| `<api-corp-url>` | `CORP_API_URL` em `deploy/published-hosts.env` |
