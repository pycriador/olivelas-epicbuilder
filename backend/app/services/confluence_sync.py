"""Confluence status page sync and delete."""

from __future__ import annotations

import base64
import re
from datetime import datetime
from typing import Any
from urllib.parse import quote, unquote

import httpx

from app.config import get_settings
from app.http.ssl import http_ssl_verify
from app.services.atlassian import atlassian_fetch, atlassian_json


def status_folder_id() -> str:
    return get_settings().confluence_status_folder_id or "6105464844"


async def list_confluence_spaces(limit: int = 50) -> list[dict[str, str]]:
    data = await atlassian_json(f"/wiki/api/v2/spaces?limit={limit}")
    return [
        {
            "id": str(item.get("id", "")),
            "key": str(item.get("key", "")),
            "name": str(item.get("name", "")),
            "type": str(item.get("type") or "global"),
        }
        for item in data.get("results") or []
        if isinstance(item, dict)
    ]


async def _folder_info(folder_id: str) -> dict[str, str]:
    data = await atlassian_json(f"/wiki/api/v2/folders/{quote(folder_id)}")
    return {
        "id": str(data.get("id", "")),
        "title": str(data.get("title") or ""),
        "spaceId": str(data.get("spaceId") or ""),
    }


async def _direct_children(folder_id: str) -> list[dict[str, Any]]:
    data = await atlassian_json(
        f"/wiki/api/v2/folders/{quote(folder_id)}/direct-children?limit=250"
    )
    return data.get("results") or []


async def _find_or_create_email_folder(email: str) -> dict[str, Any]:
    root = await _folder_info(status_folder_id())
    wanted = email.strip().lower()
    children = await _direct_children(root["id"])
    for child in children:
        if (child.get("type") or "").lower() == "folder" and (
            child.get("title") or ""
        ).strip().lower() == wanted:
            return {"id": str(child["id"]), "spaceId": root["spaceId"], "created": False}

    created = await atlassian_json(
        "/wiki/api/v2/folders",
        method="POST",
        headers={"Content-Type": "application/json"},
        json_body={
            "spaceId": root["spaceId"],
            "title": email.strip(),
            "parentId": root["id"],
        },
    )
    return {"id": str(created["id"]), "spaceId": root["spaceId"], "created": True}


async def _find_child_page(parent_id: str, title: str) -> str | None:
    children = await _direct_children(parent_id)
    for child in children:
        if (child.get("type") or "page").lower() == "page" and (
            child.get("title") or ""
        ).strip().lower() == title.strip().lower():
            return str(child["id"])
    return None


async def _page_version(page_id: str) -> int:
    data = await atlassian_json(f"/wiki/api/v2/pages/{quote(page_id)}")
    return int((data.get("version") or {}).get("number") or 1)


async def _create_page(space_id: str, parent_id: str, title: str, body: str) -> str:
    data = await atlassian_json(
        "/wiki/api/v2/pages",
        method="POST",
        headers={"Content-Type": "application/json"},
        json_body={
            "spaceId": space_id,
            "parentId": parent_id,
            "status": "current",
            "title": title,
            "body": {"representation": "storage", "value": body},
        },
    )
    return str(data["id"])


async def _update_page(page_id: str, title: str, body: str) -> None:
    version = await _page_version(page_id)
    await atlassian_json(
        f"/wiki/api/v2/pages/{quote(page_id)}",
        method="PUT",
        headers={"Content-Type": "application/json"},
        json_body={
            "id": page_id,
            "status": "current",
            "title": title,
            "body": {"representation": "storage", "value": body},
            "version": {"number": version + 1, "message": "Atualizado pelo AIOps App Model"},
        },
    )


def _safe_name(name: str, fallback: str) -> str:
    clean = re.sub(r'[\\/:*?"<>|]', "-", name).strip()
    return clean or fallback


async def _fetch_media(url: str) -> tuple[bytes, str] | None:
    try:
        if url.startswith("data:"):
            match = re.match(r"^data:([^;,]+)?(;base64)?,(.*)$", url, re.S)
            if not match:
                return None
            content_type = match.group(1) or "application/octet-stream"
            raw = match.group(3) or ""
            if match.group(2):
                return base64.b64decode(raw), content_type
            return unquote(raw).encode("utf-8"), content_type

        jira_id = re.search(r"[?&]id=(\d+)", url)
        if jira_id:
            response = await atlassian_fetch(
                f"/rest/api/3/attachment/content/{jira_id.group(1)}",
                headers={"Accept": "*/*"},
            )
            if not response.is_success:
                return None
            return response.content, response.headers.get(
                "content-type", "application/octet-stream"
            )

        gallery_id = re.search(r"/api/v1/gallery/(\d+)", url)
        if gallery_id:
            from app.db.session import _session_factory
            from app.services.gallery_media import get_gallery_media

            if _session_factory is None:
                return None
            async with _session_factory() as session:
                row = await get_gallery_media(session, gallery_id.group(1))
            if row is None:
                return None
            return row.content, row.mime_type

        if re.match(r"^https?://", url, re.I):
            async with httpx.AsyncClient(timeout=60.0, verify=http_ssl_verify()) as client:
                response = await client.get(url)
            if not response.is_success:
                return None
            return response.content, response.headers.get(
                "content-type", "application/octet-stream"
            )
    except Exception:  # noqa: BLE001
        return None
    return None


async def _upload_attachment(page_id: str, filename: str, content: bytes, content_type: str) -> bool:
    response = await atlassian_fetch(
        f"/wiki/rest/api/content/{quote(page_id)}/child/attachment",
        method="PUT",
        headers={"X-Atlassian-Token": "no-check"},
        files={"file": (filename, content, content_type)},
        data={"minorEdit": "true"},
    )
    return response.is_success


def _esc(text: str) -> str:
    return (
        text.replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


def _paragraphs(text: str | None) -> str:
    if not text or not text.strip():
        return ""
    parts = [p.strip() for p in re.split(r"\n{2,}|\n", text) if p.strip()]
    return "".join(f"<p>{_esc(p)}</p>" for p in parts)


def _bullets(items: list[str] | None) -> str:
    values = [item for item in (items or []) if item]
    if not values:
        return ""
    return "<ul>" + "".join(f"<li>{_esc(item)}</li>" for item in values) + "</ul>"


def _build_body(item: dict[str, Any], midias: list[dict[str, str]]) -> str:
    def section(title: str, html: str) -> str:
        return f"<h2>{_esc(title)}</h2>{html}" if html else ""

    meta_rows = [
        ("Área", item.get("area", "")),
        ("Status", item.get("status", "")),
        ("Status no Jira", item.get("jiraStatus") or "—"),
        ("Impacto", item.get("impacto", "")),
        ("Responsável", item.get("responsavelNome") or "—"),
        ("E-mail", item.get("responsavelEmail") or "—"),
        ("Épico", item.get("jiraEpicKey") or "—"),
        ("Atualizado em", datetime.now().strftime("%d/%m/%Y %H:%M:%S")),
    ]
    meta = "".join(
        f"<tr><th>{_esc(str(k))}</th><td>{_esc(str(v or '—'))}</td></tr>"
        for k, v in meta_rows
    )

    resultados = item.get("resultados") or []
    resultados_html = ""
    if resultados:
        rows = "".join(
            f"<tr><td>{_esc(str(r.get('label', '')))}</td>"
            f"<td>{_esc(str(r.get('valor', '')))}</td>"
            f"<td>{_esc(str(r.get('detalhe') or ''))}</td></tr>"
            for r in resultados
            if isinstance(r, dict)
        )
        resultados_html = (
            "<table><tbody><tr><th>Métrica</th><th>Valor</th><th>Detalhe</th></tr>"
            f"{rows}</tbody></table>"
        )

    historico = item.get("atualizacoes") or []
    historico_html = ""
    if historico:
        items_html = ""
        for entry in historico:
            if not isinstance(entry, dict):
                continue
            data_str = entry.get("data", "")
            try:
                label = datetime.fromisoformat(data_str.replace("Z", "+00:00")).strftime(
                    "%d/%m/%Y %H:%M:%S"
                )
            except ValueError:
                label = str(data_str)
            items_html += (
                f"<li><strong>{_esc(label)}</strong> — "
                f"{_esc(str(entry.get('resumo', '')))}</li>"
            )
        historico_html = f"<ul>{items_html}</ul>"

    galeria_html = ""
    if midias:
        galeria_html = "".join(
            f'<p><strong>{_esc(m["titulo"])}</strong></p>'
            f'<ac:image ac:align="center" ac:alt="{_esc(m["titulo"])}">'
            f'<ri:attachment ri:filename="{_esc(m["filename"])}" /></ac:image>'
            for m in midias
        )

    parts = [
        "<p><em>Página gerada automaticamente pelo AIOps App Model — status report do projeto.</em></p>",
        "<h2>Visão geral</h2>",
        f"<p>{_esc(str(item.get('descricao', '')))}</p>",
        f"<table><tbody>{meta}</tbody></table>",
        section("Problema", _paragraphs(item.get("problema"))),
        section("Dores", _bullets(item.get("dores"))),
        section("Solução", _paragraphs(item.get("solucao"))),
        section("Etapa atual", _paragraphs(item.get("etapaAtual"))),
        section("Status atual", _paragraphs(item.get("statusAtual"))),
        section("Etapa seguinte", _paragraphs(item.get("etapaSeguinte"))),
        section("Antes", _bullets(item.get("antes"))),
        section("Depois", _bullets(item.get("depois"))),
        section("Integrações", _bullets(item.get("integracoes"))),
        section("Resultados", resultados_html),
        section("Histórico de atualizações", historico_html),
        section("Galeria", galeria_html),
    ]
    return "".join(part for part in parts if part)


async def sync_case_to_confluence(item: dict[str, Any]) -> dict[str, Any]:
    email = str(item.get("responsavelEmail") or "").strip()
    if not email:
        return {
            "ok": False,
            "created": False,
            "folderCreated": False,
            "message": "Sem e-mail do responsável do épico — página do Confluence não foi criada.",
        }

    folder = await _find_or_create_email_folder(email)
    title = str(item.get("nome") or "").strip()
    existing_id = await _find_child_page(folder["id"], title)
    page_id = existing_id or await _create_page(
        folder["spaceId"], folder["id"], title, "<p>Gerando…</p>"
    )

    midias: list[dict[str, str]] = []
    used: set[str] = set()
    index = 0
    for gallery_item in item.get("galeria") or []:
        if not isinstance(gallery_item, dict):
            continue
        index += 1
        url = str(gallery_item.get("url") or "")
        if not url:
            continue
        if str(gallery_item.get("mimeType") or "").startswith("video/"):
            continue
        media = await _fetch_media(url)
        if not media:
            continue
        content, content_type = media
        filename = _safe_name(str(gallery_item.get("titulo") or f"midia-{index}"), f"midia-{index}")
        if not re.search(r"\.[a-z0-9]{2,5}$", filename, re.I):
            ext = (content_type.split("/")[1] or "png").split("+")[0]
            filename = f"{filename}.{ext}"
        while filename.lower() in used:
            filename = f"{index}-{filename}"
        used.add(filename.lower())
        if await _upload_attachment(page_id, filename, content, content_type):
            midias.append(
                {"filename": filename, "titulo": str(gallery_item.get("titulo") or filename)}
            )

    await _update_page(page_id, title, _build_body(item, midias))
    base = get_settings().atlassian_base_url
    return {
        "ok": True,
        "created": existing_id is None,
        "folderCreated": folder["created"],
        "pageId": page_id,
        "url": f"{base}/wiki/spaces/AIOps/pages/{page_id}",
        "message": "Página do Confluence atualizada."
        if existing_id
        else "Página criada no Confluence.",
    }


async def delete_case_from_confluence(nome: str, responsavel_email: str | None = None) -> dict[str, Any]:
    titulo = nome.strip()
    if not titulo:
        return {"ok": False, "deleted": False, "message": "Projeto sem nome."}
    email = (responsavel_email or "").strip().lower()
    if not email:
        return {
            "ok": False,
            "deleted": False,
            "message": "Sem e-mail do responsável: não foi possível localizar a página no Confluence.",
        }

    root = await _folder_info(status_folder_id())
    pasta = None
    for child in await _direct_children(root["id"]):
        if (child.get("type") or "").lower() == "folder" and (
            child.get("title") or ""
        ).strip().lower() == email:
            pasta = child
            break
    if not pasta:
        return {"ok": True, "deleted": False, "message": "Nenhuma página no Confluence para excluir."}

    page_id = await _find_child_page(str(pasta["id"]), titulo)
    if not page_id:
        return {"ok": True, "deleted": False, "message": "Nenhuma página no Confluence para excluir."}

    response = await atlassian_fetch(
        f"/wiki/api/v2/pages/{quote(page_id)}?purge=false",
        method="DELETE",
    )
    if not response.is_success and response.status_code != 404:
        raise RuntimeError(
            f"Confluence {response.status_code} deleting page: {response.text[:200]}"
        )
    return {"ok": True, "deleted": True, "message": f'Página "{titulo}" excluída no Confluence.'}
