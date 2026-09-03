"""Google Gemini API client."""

from __future__ import annotations

import httpx

from app.config import Settings, get_settings
from app.http.ssl import http_ssl_verify


class GeminiConfigError(Exception):
    pass


def assert_gemini_config(settings: Settings | None = None) -> Settings:
    cfg = settings or get_settings()
    if not cfg.gemini_api_key.strip():
        raise GeminiConfigError("GEMINI_API_KEY is missing.")
    return cfg


async def gemini_generate(
    prompt: str,
    *,
    json_output: bool = False,
    settings: Settings | None = None,
) -> str:
    cfg = assert_gemini_config(settings)
    model = cfg.gemini_model_name
    url = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        f"{model}:generateContent"
    )
    generation_config: dict[str, object] = {"temperature": 0.2}
    if json_output:
        generation_config["responseMimeType"] = "application/json"

    async with httpx.AsyncClient(timeout=120.0, verify=http_ssl_verify()) as client:
        response = await client.post(
            url,
            headers={
                "Content-Type": "application/json",
                "x-goog-api-key": cfg.gemini_api_key,
            },
            json={
                "contents": [{"role": "user", "parts": [{"text": prompt}]}],
                "generationConfig": generation_config,
            },
        )
    if not response.is_success:
        raise RuntimeError(
            f"Gemini {response.status_code} ({model}): {response.text[:300]}"
        )
    data = response.json()
    candidates = data.get("candidates") or []
    if not candidates:
        return ""
    parts = candidates[0].get("content", {}).get("parts") or []
    return "".join(part.get("text", "") for part in parts).strip()
