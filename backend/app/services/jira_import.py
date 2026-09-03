"""Jira scope collection and Gemini organization."""

from __future__ import annotations

import json
import re
from typing import Any
from urllib.parse import quote

from app.services.atlassian import atlassian_json
from app.services.gemini import gemini_generate

FIELDS = (
    "summary,description,issuetype,status,parent,labels,comment,attachment,"
    "project,updated,created,assignee,reporter"
)


def adf_to_text(node: Any) -> str:
    if not node:
        return ""
    if isinstance(node, str):
        return node
    if isinstance(node, list):
        return "\n".join(adf_to_text(item) for item in node)
    if isinstance(node, dict):
        own = node.get("text", "") if isinstance(node.get("text"), str) else ""
        children = adf_to_text(node.get("content"))
        if children and own:
            return f"{own}\n{children}"
        return own or children
    return ""


def parse_jira_url(url: str) -> dict[str, str]:
    issue = re.search(r"/browse/([A-Z][A-Z0-9_]+-\d+)", url, re.I) or re.search(
        r"selectedIssue=([A-Z][A-Z0-9_]+-\d+)", url, re.I
    )
    if issue:
        return {"issue_key": issue.group(1).upper()}
    project = re.search(r"/projects/([A-Z][A-Z0-9_]+)", url, re.I) or re.search(
        r"projectKey=([A-Z][A-Z0-9_]+)", url, re.I
    )
    if project:
        return {"project_key": project.group(1).upper()}
    bare = re.match(r"^([A-Z][A-Z0-9_]+-\d+)$", url.strip(), re.I)
    if bare:
        return {"issue_key": bare.group(1).upper()}
    return {}


async def search_jql(jql: str, max_results: int = 60) -> list[dict[str, Any]]:
    data = await atlassian_json(
        "/rest/api/3/search/jql",
        method="POST",
        headers={"Content-Type": "application/json"},
        json_body={"jql": jql, "maxResults": max_results, "fields": FIELDS.split(",")},
    )
    return data.get("issues") or []


async def get_issue(key: str) -> dict[str, Any]:
    return await atlassian_json(
        f"/rest/api/3/issue/{quote(key)}?fields={FIELDS}"
    )


def _issue_field(issue: dict[str, Any], path: str) -> Any:
    return (issue.get("fields") or {}).get(path)


def _person(raw: Any) -> dict[str, str] | None:
    if not isinstance(raw, dict):
        return None
    display_name = raw.get("displayName")
    if not display_name:
        return None
    avatar_urls = raw.get("avatarUrls") or {}
    avatar = avatar_urls.get("48x48") or avatar_urls.get("32x32")
    out: dict[str, str] = {"nome": str(display_name)}
    if avatar:
        out["avatarUrl"] = f"/api/jira-avatar?u={quote(str(avatar))}"
    email = raw.get("emailAddress")
    if email:
        out["email"] = str(email)
    return out


def _normalize_issue(issue: dict[str, Any]) -> dict[str, Any]:
    attachments_raw = _issue_field(issue, "attachment") or []
    attachments = [
        {
            "id": str(item.get("id", "")),
            "filename": str(item.get("filename", "")),
            "mimeType": str(item.get("mimeType", "")),
            "url": str(item.get("content", "")),
        }
        for item in attachments_raw
        if isinstance(item, dict)
    ]
    comments_raw = (_issue_field(issue, "comment") or {}).get("comments") or []
    comments = [adf_to_text(item.get("body")) for item in comments_raw if isinstance(item, dict)]
    assignee = _person(_issue_field(issue, "assignee")) or _person(
        _issue_field(issue, "reporter")
    )
    result: dict[str, Any] = {
        "key": issue.get("key", ""),
        "type": (_issue_field(issue, "issuetype") or {}).get("name", "Issue"),
        "summary": _issue_field(issue, "summary") or "",
        "status": (_issue_field(issue, "status") or {}).get("name", ""),
        "description": adf_to_text(_issue_field(issue, "description")),
        "comments": [c for c in comments if c],
        "attachments": attachments,
    }
    if assignee:
        result["responsavel"] = assignee
    return result


async def collect_jira_scope(project_url: str) -> dict[str, Any]:
    parsed = parse_jira_url(project_url)
    issue_key = parsed.get("issue_key")
    project_key = parsed.get("project_key")
    if not issue_key and not project_key:
        raise ValueError(
            "Unrecognized Jira link. Paste an epic, issue, or project URL."
        )

    root: dict[str, Any] | None = None
    if issue_key:
        root = await get_issue(issue_key)
        for _ in range(5):
            parent_key = (_issue_field(root, "parent") or {}).get("key")
            if not parent_key:
                break
            root = await get_issue(str(parent_key))

    issues: list[dict[str, Any]] = []
    if root:
        issues.append(root)
        children = await search_jql(f"parent = {root['key']} ORDER BY created ASC")
        issues.extend(children)
        for child in children[:20]:
            subs = await search_jql(
                f"parent = {child['key']} ORDER BY created ASC", max_results=30
            )
            issues.extend(subs)
    elif project_key:
        issues.extend(
            await search_jql(
                f"project = {project_key} ORDER BY updated DESC", max_results=60
            )
        )

    seen: set[str] = set()
    collected: list[dict[str, Any]] = []
    for issue in issues:
        key = str(issue.get("key", ""))
        if key in seen:
            continue
        seen.add(key)
        collected.append(_normalize_issue(issue))

    from app.config import get_settings

    settings = get_settings()
    root_norm = _normalize_issue(root) if root else None
    return {
        "root": root_norm,
        "issues": collected,
        "projectKey": project_key or (root_norm["key"].split("-")[0] if root_norm else None),
        "baseUrl": settings.atlassian_base_url,
    }


def _first_json(text: str) -> Any:
    cleaned = re.sub(r"^```(?:json)?", "", text.strip(), flags=re.I)
    cleaned = re.sub(r"```$", "", cleaned).strip()
    start = cleaned.find("{")
    end = cleaned.rfind("}")
    if start == -1 or end == -1:
        raise ValueError("AI did not return valid JSON.")
    return json.loads(cleaned[start : end + 1])


async def organize_with_gemini(
    scope: dict[str, Any],
    available_integrations: list[str],
) -> dict[str, Any]:
    context_parts: list[str] = []
    for issue in scope.get("issues") or []:
        block = [
            f"### {issue.get('key')} ({issue.get('type')}) — "
            f"{issue.get('summary')} [{issue.get('status')}]"
        ]
        if issue.get("description"):
            block.append(f"Descrição:\n{issue['description']}")
        if issue.get("comments"):
            block.append("Comentários:\n- " + "\n- ".join(issue["comments"]))
        if issue.get("attachments"):
            names = ", ".join(
                f"{a.get('filename')} ({a.get('mimeType')})"
                for a in issue["attachments"]
            )
            block.append(f"Anexos: {names}")
        context_parts.append("\n".join(block))
    context = "\n\n".join(context_parts)[:120_000]

    integrations_label = ", ".join(available_integrations) or "(nenhuma)"
    prompt = f"""Você organiza conteúdo de Jira em um case de IA usado como status report quinzenal para a liderança. Não invente dados: use somente o que está no material.
Integrações disponíveis no portal: {integrations_label}.

Regras de conteúdo:
- "problema": 2 a 4 parágrafos curtos, com contexto real do que motivou o projeto, quem é impactado, o custo do cenário atual e as evidências citadas nas issues.
- "solucao": 2 a 4 parágrafos curtos explicando a abordagem, como a IA/automação atua, sistemas envolvidos, o fluxo ponta a ponta e o que já está implementado.
- "resultados": SOMENTE se o material trouxer métricas, números, percentuais, valores, tempos ou volumes explícitos. Se não houver nenhum número, devolva [] e "semMetricas": true. Nunca estime.
- "etapaAtual": o que o time está executando agora (fase, frente de trabalho e entregas em andamento), 1 a 2 parágrafos.
- "statusAtual": leitura objetiva do andamento — o que já foi concluído, o que está em progresso, bloqueios e riscos, com as issues citadas (ex.: AIOPS-155).
- "etapaSeguinte": próximos passos planejados, com dependências e ordem, conforme issues abertas/backlog.
- "resumoAtualizacao": 1 parágrafo resumindo o avanço mais recente observado no material (para o histórico de status report).

Responda APENAS com JSON no formato:
{{"nome":string,"descricao":string,"area":string,"status":"Em produção"|"Piloto"|"Em desenvolvimento"|"Experimento","impacto":"Alto"|"Médio"|"Baixo","cor":"#115644","problema":string,"dores":string[],"solucao":string,"etapaAtual":string,"statusAtual":string,"etapaSeguinte":string,"resumoAtualizacao":string,"antes":string[],"depois":string[],"resultados":[{{"label":string,"valor":string,"detalhe":string}}],"integracoesDetectadas":[{{"nome":string,"motivo":string,"citations":[{{"issueKey":string,"issueType":string,"issueSummary":string,"field":string,"quote":string}}]}}],"semMetricas":boolean}}

Material:
{context}"""

    raw = await gemini_generate(prompt, json_output=True)
    result = _first_json(raw)
    if not isinstance(result, dict):
        raise ValueError("AI did not return a JSON object.")
    return result
