"""Seed portal snapshot with sample cases for local validation."""

from __future__ import annotations

import asyncio
import json
import sys
from pathlib import Path

BACKEND_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(BACKEND_ROOT))

from app.db.session import create_engine, create_session_factory, dispose_engine  # noqa: E402
from app.config import get_settings  # noqa: E402
from app.schemas.portal import PortalSnapshot  # noqa: E402
from app.services.portal import load_portal_snapshot, replace_portal_snapshot  # noqa: E402

SAMPLE = PortalSnapshot.model_validate(
    {
        "cases": [
            {
                "id": "analise-feedback",
                "nome": "Análise Inteligente de Feedback",
                "descricao": "Classificação automática de comentários de clientes.",
                "area": "Produto",
                "impacto": "Alto",
                "status": "Em produção",
                "cor": "#115644",
                "problema": "Leitura manual de milhares de comentários por mês.",
                "solucao": "Fluxo automatizado com IA para classificar tema e sentimento.",
                "antes": ["Leitura manual"],
                "depois": ["Classificação automática"],
                "resultados": [{"label": "Horas economizadas / ano", "valor": "570h"}],
                "responsavel": {
                    "nome": "Marina Alves",
                    "email": "marina.alves@example.com",
                },
                "jiraStatus": "Em andamento",
            }
        ],
        "caseMeta": {
            "analise-feedback": {
                "dores": ["Volume alto de feedback"],
                "galeria": [],
                "integracoes": ["Jira"],
            }
        },
        "areas": ["Produto", "Engenharia", "Operações"],
        "integracoes": [],
        "integracaoLogos": {},
        "aulas": [],
        "hub": [],
        "trilhas": [],
        "aulaStatus": {},
        "deleted": {
            "cases": [],
            "aulas": [],
            "hub": [],
            "trilhas": [],
            "integracoes": [],
        },
    }
)


async def main() -> None:
    settings = get_settings()
    engine = create_engine(settings.resolved_database_url, schema=settings.db_schema)
    session_factory = create_session_factory(engine)
    async with session_factory() as session:
        current = await load_portal_snapshot(session)
        if current.cases:
            print(f"portal already has {len(current.cases)} case(s); skipping seed")
            await dispose_engine()
            return
        await replace_portal_snapshot(session, SAMPLE)
        await session.commit()
        saved = await load_portal_snapshot(session)
        print(json.dumps({"seededCases": len(saved.cases), "areas": saved.areas}, indent=2))
    await dispose_engine()


if __name__ == "__main__":
    asyncio.run(main())
