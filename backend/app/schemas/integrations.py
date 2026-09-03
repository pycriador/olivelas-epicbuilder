"""Pydantic models for external integration endpoints."""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class JiraIssuesSearchRequest(BaseModel):
    query: str
    limit: int | None = 25


class JiraImportRequest(BaseModel):
    projectUrl: str
    availableIntegrations: list[str] = Field(default_factory=list)


class ConfluenceDeleteRequest(BaseModel):
    nome: str
    responsavelEmail: str | None = None


class ConfluenceSyncRequest(BaseModel):
    model_config = {"extra": "allow"}

    nome: str
    descricao: str = ""
    area: str = ""
    status: str = ""
    impacto: str = ""
    jiraStatus: str | None = None
    responsavelNome: str | None = None
    responsavelEmail: str | None = None
    jiraEpicKey: str | None = None
    problema: str = ""
    solucao: str = ""
    etapaAtual: str | None = None
    statusAtual: str | None = None
    etapaSeguinte: str | None = None
    dores: list[str] = Field(default_factory=list)
    antes: list[str] = Field(default_factory=list)
    depois: list[str] = Field(default_factory=list)
    integracoes: list[str] = Field(default_factory=list)
    resultados: list[dict[str, str]] = Field(default_factory=list)
    atualizacoes: list[dict[str, str]] = Field(default_factory=list)
    galeria: list[dict[str, Any]] = Field(default_factory=list)

    def as_payload(self) -> dict[str, Any]:
        return self.model_dump(exclude_none=False)
