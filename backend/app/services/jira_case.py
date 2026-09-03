from __future__ import annotations

import re
from typing import Any

from sqlalchemy.ext.asyncio import AsyncSession

from app.config import get_settings
from app.services.atlassian import atlassian_json
from app.services.confluence_sync import list_confluence_spaces
from app.services.gallery_media import gallery_public_url, persist_jira_attachment
from app.services.gemini import gemini_generate
from app.services.jira_import import collect_jira_scope, organize_with_gemini, search_jql

MEDIA = re.compile(r"^(image|video)/", re.I)


async def list_project_issues(query: str, limit: int = 25) -> list[dict[str, str]]:
    q = query.strip()
    key = q.upper() if re.fullmatch(r"[A-Z][A-Z0-9_]+", q.upper()) and " " not in q else ""
    if not key:
        found = await atlassian_json(
            f"/rest/api/3/project/search?query={quote(q)}&maxResults=5"
        )
        values = found.get("values") or []
        key = str(values[0]["key"]) if values else ""
        if not key:
            raise ValueError(f'No Jira project found for "{q}".')
    issues = await search_jql(f"project = {key} ORDER BY updated DESC", max_results=limit)
    return [
        {
            "key": issue.get("key", ""),
            "summary": (issue.get("fields") or {}).get("summary") or "",
            "type": ((issue.get("fields") or {}).get("issuetype") or {}).get("name", "Issue"),
            "status": ((issue.get("fields") or {}).get("status") or {}).get("name", ""),
        }
        for issue in issues
    ]


async def build_case_from_jira(
    session: AsyncSession,
    project_url: str,
    available_integrations: list[str],
) -> dict[str, Any]:
    scope = await collect_jira_scope(project_url)
    draft = await organize_with_gemini(scope, available_integrations)

    galeria: list[dict[str, Any]] = []
    gallery_origins: list[dict[str, str]] = []

    for issue in scope.get("issues") or []:
        for att in issue.get("attachments") or []:
            mime = str(att.get("mimeType", ""))
            if not MEDIA.match(mime):
                continue
            origem = {
                "issueKey": str(issue.get("key", "")),
                "issueType": str(issue.get("type", "")),
                "issueSummary": str(issue.get("summary", "")),
            }
            attachment_id = str(att.get("id", ""))
            stored_url = await persist_jira_attachment(
                session,
                attachment_id=attachment_id,
                mime_type=mime,
                filename=str(att.get("filename", "")),
            )
            galeria.append(
                {
                    "titulo": str(att.get("filename", "")),
                    "descricao": "",
                    "url": stored_url or gallery_public_url(attachment_id),
                    "mimeType": mime,
                    "origem": origem,
                }
            )
            gallery_origins.append(origem)

    if galeria:
        await session.commit()

    raw_resultados = draft.get("resultados") if isinstance(draft.get("resultados"), list) else []
    resultados = [
        r
        for r in raw_resultados
        if isinstance(r, dict) and re.search(r"\d", str(r.get("valor", "")))
    ]

    counts: dict[str, dict[str, Any]] = {}
    for issue in scope.get("issues") or []:
        person = issue.get("responsavel")
        if not person:
            continue
        chave = str(person.get("email") or person.get("nome", "")).lower()
        if chave in counts:
            counts[chave]["n"] += 1
        else:
            counts[chave] = {"pessoa": person, "n": 1}
    mais_recorrente = max(counts.values(), key=lambda x: x["n"])["pessoa"] if counts else None
    root = scope.get("root") or {}
    responsavel = root.get("responsavel") or mais_recorrente

    draft_out = {
        **draft,
        "resultados": resultados,
        "semMetricas": len(resultados) == 0,
        "galeria": galeria,
        "integracoesSelecionadas": [],
        "semIntegracoes": False,
    }
    if responsavel:
        draft_out["responsavel"] = responsavel
    if root.get("status"):
        draft_out["jiraStatus"] = root["status"]

    return {
        "draft": draft_out,
        "meta": {
            "projectKey": scope.get("projectKey"),
            "issuesCount": len(scope.get("issues") or []),
            "attachmentsCount": len(galeria),
            "baseUrl": scope.get("baseUrl"),
            "epicKey": root.get("key"),
            "epicSummary": root.get("summary"),
            "galleryOrigins": gallery_origins,
        },
    }


async def integrations_status() -> dict[str, dict[str, str | bool]]:
    out: dict[str, dict[str, str | bool]] = {}

    try:
        me = await atlassian_json("/rest/api/3/myself")
        name = me.get("displayName") or me.get("emailAddress") or "?"
        out["jira"] = {"ok": True, "detail": f"Conectado como {name}"}
    except Exception as exc:  # noqa: BLE001
        out["jira"] = {"ok": False, "detail": str(exc)}

    try:
        spaces = await list_confluence_spaces(10)
        keys = ", ".join(space["key"] for space in spaces) or "—"
        out["confluence"] = {"ok": True, "detail": f"{len(spaces)} spaces: {keys}"}
    except Exception as exc:  # noqa: BLE001
        out["confluence"] = {"ok": False, "detail": str(exc)}

    try:
        settings = get_settings()
        answer = await gemini_generate("Responda apenas: ok")
        out["gemini"] = {
            "ok": True,
            "detail": f"{settings.gemini_model_name} respondeu: {answer[:40]}",
        }
    except Exception as exc:  # noqa: BLE001
        out["gemini"] = {"ok": False, "detail": str(exc)}

    return out
