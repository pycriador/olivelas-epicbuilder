from typing import Any

from pydantic import BaseModel, ConfigDict, Field


class DeletedLists(BaseModel):
    cases: list[str] = Field(default_factory=list)
    aulas: list[str] = Field(default_factory=list)
    hub: list[str] = Field(default_factory=list)
    trilhas: list[str] = Field(default_factory=list)
    integracoes: list[str] = Field(default_factory=list)


class PortalSnapshot(BaseModel):
    model_config = ConfigDict(extra="allow")

    cases: list[dict[str, Any]] = Field(default_factory=list)
    caseMeta: dict[str, dict[str, Any]] = Field(default_factory=dict)
    aulas: list[dict[str, Any]] = Field(default_factory=list)
    hub: list[dict[str, Any]] = Field(default_factory=list)
    trilhas: list[dict[str, Any]] = Field(default_factory=list)
    integracoes: list[dict[str, Any]] = Field(default_factory=list)
    integracaoLogos: dict[str, str] = Field(default_factory=dict)
    areas: list[str] = Field(default_factory=list)
    aulaStatus: dict[str, str] = Field(default_factory=dict)
    deleted: DeletedLists = Field(default_factory=DeletedLists)


class CaseWrite(BaseModel):
    model_config = ConfigDict(extra="allow")

    id: str
    payload: dict[str, Any] | None = None

    def resolved_payload(self) -> dict[str, Any]:
        if self.payload is not None:
            data = dict(self.payload)
        else:
            data = self.model_dump(exclude={"payload"}, exclude_none=True)
        data["id"] = self.id
        return data


class CaseMetaWrite(BaseModel):
    case_id: str
    payload: dict[str, Any] = Field(default_factory=dict)


class AreaWrite(BaseModel):
    name: str
