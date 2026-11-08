import logging
from typing import Optional, List, Dict
import httpx

from app.core.config import settings
from app.modules.curriculum.seed_data import SEED_EXERCISES, ExerciseDetail

logger = logging.getLogger(__name__)


class ExerciseRepository:
    def __init__(self):
        self._cache: Dict[str, ExerciseDetail] = SEED_EXERCISES.copy()

    async def get_by_id(self, exercise_id: str) -> Optional[ExerciseDetail]:
        """
        Obtiene un ejercicio por su ID.
        Intenta consultar Supabase si están configuradas las credenciales,
        con fallback resiliente al catálogo semilla local.
        """
        if settings.SUPABASE_URL and settings.SUPABASE_ANON_KEY:
            try:
                headers = {
                    "apikey": settings.SUPABASE_ANON_KEY,
                    "Authorization": f"Bearer {settings.SUPABASE_ANON_KEY}",
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
                            return ExerciseDetail(**item)
            except Exception as e:
                logger.warning(f"No se pudo consultar Supabase para el ejercicio {exercise_id}: {e}. Usando catálogo local.")

        return self._cache.get(exercise_id)

    async def list_all(self) -> List[ExerciseDetail]:
        """Devuelve todos los ejercicios disponibles."""
        if settings.SUPABASE_URL and settings.SUPABASE_ANON_KEY:
            try:
                headers = {
                    "apikey": settings.SUPABASE_ANON_KEY,
                    "Authorization": f"Bearer {settings.SUPABASE_ANON_KEY}",
                }
                async with httpx.AsyncClient(timeout=3.0) as client:
                    resp = await client.get(
                        f"{settings.SUPABASE_URL}/rest/v1/exercises?select=id,module_id,title,prompt,initial_code,solution_query,xp_reward,difficulty,check_order,sort_order&order=sort_order.asc",
                        headers=headers,
                    )
                    if resp.status_code == 200:
                        data = resp.json()
                        if data:
                            return [ExerciseDetail(**item) for item in data]
            except Exception as e:
                logger.warning(f"No se pudo listar ejercicios desde Supabase: {e}. Usando catálogo local.")

        return list(self._cache.values())


exercise_repository = ExerciseRepository()
