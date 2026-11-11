import logging
from typing import Optional, List, Dict
import httpx

from app.core.config import settings
from app.modules.curriculum.seed_data import SEED_EXERCISES, ExerciseDetail, ExercisePublicDTO

logger = logging.getLogger(__name__)


class ExerciseRepository:
    def __init__(self):
        self._cache: Dict[str, ExerciseDetail] = SEED_EXERCISES.copy()

    async def get_internal_for_evaluation(self, exercise_id: str) -> Optional[ExerciseDetail]:
        """
        Obtiene el detalle completo de un ejercicio, INCLUYENDO solution_query.
        USO EXCLUSIVO del evaluador interno del backend. NUNCA exponer vía API pública.
        """
        key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_ANON_KEY
        if settings.SUPABASE_URL and key:
            try:
                headers = {
                    "apikey": key,
                    "Authorization": f"Bearer {key}",
                }
                async with httpx.AsyncClient(timeout=3.0) as client:
                    resp = await client.get(
                        f"{settings.SUPABASE_URL}/rest/v1/exercises?id=eq.{exercise_id}&select=id,module_id,title,prompt,initial_code,solution_query,xp_reward,difficulty,check_order,sort_order",
                        headers=headers,
                    )
                    if resp.status_code == 200:
                        data = resp.json()
                        if data and len(data) > 0:
                            item = data[0]
                            cached = self._cache.get(item.get("id"))
                            if cached:
                                if not item.get("concept"):
                                    item["concept"] = cached.concept
                                if not item.get("objectives"):
                                    item["objectives"] = cached.objectives
                                if not item.get("sample_tables"):
                                    item["sample_tables"] = cached.sample_tables
                                if not item.get("hints"):
                                    item["hints"] = cached.hints
                            return ExerciseDetail(**item)
            except Exception as e:
                logger.warning(f"No se pudo consultar Supabase para el ejercicio {exercise_id}: {e}. Usando catálogo local.")

        return self._cache.get(exercise_id)

    async def get_by_id(self, exercise_id: str) -> Optional[ExerciseDetail]:
        """Alias para evaluación interna."""
        return await self.get_internal_for_evaluation(exercise_id)

    async def get_public_by_id(self, exercise_id: str) -> Optional[ExercisePublicDTO]:
        """
        Obtiene el DTO público de un ejercicio (SIN solution_query).
        Apto para ser servido a clientes web y estudiantes.
        """
        internal = await self.get_internal_for_evaluation(exercise_id)
        if internal:
            return internal.to_public_dto()
        return None

    async def list_public(self) -> List[ExercisePublicDTO]:
        """
        Devuelve todos los ejercicios activos en su formato DTO público (SIN solution_query).
        """
        internal_list = await self.list_all()
        return [ex.to_public_dto() for ex in internal_list]

    async def list_all(self) -> List[ExerciseDetail]:
        """Devuelve todos los ejercicios completos (para evaluación interna)."""
        key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_ANON_KEY
        if settings.SUPABASE_URL and key:
            try:
                headers = {
                    "apikey": key,
                    "Authorization": f"Bearer {key}",
                }
                async with httpx.AsyncClient(timeout=3.0) as client:
                    resp = await client.get(
                        f"{settings.SUPABASE_URL}/rest/v1/exercises?select=id,module_id,title,prompt,initial_code,solution_query,xp_reward,difficulty,check_order,sort_order&order=sort_order.asc",
                        headers=headers,
                    )
                    if resp.status_code == 200:
                        data = resp.json()
                        if data:
                            results = []
                            for item in data:
                                cached = self._cache.get(item.get("id"))
                                if cached:
                                    if not item.get("concept"):
                                        item["concept"] = cached.concept
                                    if not item.get("objectives"):
                                        item["objectives"] = cached.objectives
                                    if not item.get("sample_tables"):
                                        item["sample_tables"] = cached.sample_tables
                                    if not item.get("hints"):
                                        item["hints"] = cached.hints
                                results.append(ExerciseDetail(**item))
                            return results
            except Exception as e:
                logger.warning(f"No se pudo listar ejercicios desde Supabase: {e}. Usando catálogo local.")

        return list(self._cache.values())


exercise_repository = ExerciseRepository()
