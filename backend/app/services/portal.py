from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.portal import (
    Area,
    Aula,
    Case,
    CaseMeta,
    HubContent,
    Integration,
    PortalSettings,
    Trilha,
)
from app.schemas.portal import DeletedLists, PortalSnapshot

DEFAULT_DELETED = {
    "cases": [],
    "aulas": [],
    "hub": [],
    "trilhas": [],
    "integracoes": [],
}


async def ensure_portal_settings(session: AsyncSession) -> PortalSettings:
    settings = await session.get(PortalSettings, 1)
    if settings is None:
        settings = PortalSettings(id=1)
        session.add(settings)
        await session.flush()
    return settings


async def load_portal_snapshot(session: AsyncSession) -> PortalSnapshot:
    cases = [
        row.payload
        for row in (await session.scalars(select(Case).order_by(Case.id))).all()
    ]
    case_meta_rows = (await session.scalars(select(CaseMeta))).all()
    case_meta = {row.case_id: row.payload for row in case_meta_rows}
    aulas = [row.payload for row in (await session.scalars(select(Aula).order_by(Aula.id))).all()]
    hub = [row.payload for row in (await session.scalars(select(HubContent).order_by(HubContent.id))).all()]
    trilhas = [row.payload for row in (await session.scalars(select(Trilha).order_by(Trilha.id))).all()]
    integracoes = [
        row.payload for row in (await session.scalars(select(Integration).order_by(Integration.id))).all()
    ]
    areas = [row.name for row in (await session.scalars(select(Area).order_by(Area.name))).all()]
    settings = await ensure_portal_settings(session)
    deleted_raw = settings.deleted or DEFAULT_DELETED
    return PortalSnapshot(
        cases=cases,
        caseMeta=case_meta,
        aulas=aulas,
        hub=hub,
        trilhas=trilhas,
        integracoes=integracoes,
        integracaoLogos=settings.integracao_logos or {},
        areas=areas,
        aulaStatus=settings.aula_status or {},
        deleted=DeletedLists.model_validate(deleted_raw),
    )


async def replace_portal_snapshot(session: AsyncSession, snapshot: PortalSnapshot) -> PortalSnapshot:
    await session.execute(CaseMeta.__table__.delete())
    await session.execute(Case.__table__.delete())
    await session.execute(Aula.__table__.delete())
    await session.execute(HubContent.__table__.delete())
    await session.execute(Trilha.__table__.delete())
    await session.execute(Integration.__table__.delete())
    await session.execute(Area.__table__.delete())

    for case in snapshot.cases:
        case_id = str(case.get("id") or "")
        if not case_id:
            continue
        session.add(Case(id=case_id, payload=case))
    for case_id, meta in snapshot.caseMeta.items():
        session.add(CaseMeta(case_id=case_id, payload=meta))
    for aula in snapshot.aulas:
        aula_id = str(aula.get("id") or "")
        if aula_id:
            session.add(Aula(id=aula_id, payload=aula))
    for item in snapshot.hub:
        item_id = str(item.get("id") or "")
        if item_id:
            session.add(HubContent(id=item_id, payload=item))
    for trilha in snapshot.trilhas:
        trilha_id = str(trilha.get("id") or "")
        if trilha_id:
            session.add(Trilha(id=trilha_id, payload=trilha))
    for integration in snapshot.integracoes:
        integration_id = str(integration.get("id") or "")
        if integration_id:
            session.add(Integration(id=integration_id, payload=integration))
    for area in snapshot.areas:
        if area.strip():
            session.add(Area(name=area.strip()))

    settings = await ensure_portal_settings(session)
    settings.integracao_logos = snapshot.integracaoLogos
    settings.aula_status = snapshot.aulaStatus
    settings.deleted = snapshot.deleted.model_dump()
    await session.flush()
    return snapshot
