from datetime import datetime, timezone
import threading
from typing import Dict, Literal, Optional

ExerciseOperationalStatus = Literal["active", "hidden", "under_review"]


class SystemOperationalState:
    """
    Estado operativo atómico en memoria para interruptores de emergencia (Killswitches)
    y visibilidad operativa del catálogo de ejercicios.
    """

    def __init__(self) -> None:
        self._lock = threading.Lock()
        self._is_maintenance_mode: bool = False
        self._maintenance_message: str = (
            "La plataforma se encuentra en mantenimiento programado. "
            "La ejecución de consultas SQL está temporalmente deshabilitada."
        )
        self._exercise_statuses: Dict[str, ExerciseOperationalStatus] = {}
        self._updated_at: str = datetime.now(timezone.utc).isoformat()
        self._updated_by: Optional[str] = None

    @property
    def is_maintenance_mode(self) -> bool:
        with self._lock:
            return self._is_maintenance_mode

    @property
    def maintenance_message(self) -> str:
        with self._lock:
            return self._maintenance_message

    def set_maintenance_mode(
        self,
        enabled: bool,
        message: Optional[str] = None,
        updated_by: Optional[str] = None,
    ) -> None:
        with self._lock:
            self._is_maintenance_mode = bool(enabled)
            if message and message.strip():
                self._maintenance_message = message.strip()
            self._updated_at = datetime.now(timezone.utc).isoformat()
            self._updated_by = updated_by

    def get_exercise_status(self, exercise_id: str) -> ExerciseOperationalStatus:
        with self._lock:
            return self._exercise_statuses.get(exercise_id, "active")

    def set_exercise_status(
        self,
        exercise_id: str,
        status: ExerciseOperationalStatus,
        updated_by: Optional[str] = None,
    ) -> None:
        with self._lock:
            if status == "active":
                self._exercise_statuses.pop(exercise_id, None)
            else:
                self._exercise_statuses[exercise_id] = status
            self._updated_at = datetime.now(timezone.utc).isoformat()
            self._updated_by = updated_by

    def list_exercise_status_overrides(self) -> Dict[str, ExerciseOperationalStatus]:
        with self._lock:
            return dict(self._exercise_statuses)

    def snapshot(self) -> Dict[str, object]:
        with self._lock:
            return {
                "is_maintenance_mode": self._is_maintenance_mode,
                "maintenance_message": self._maintenance_message,
                "exercise_status_overrides": dict(self._exercise_statuses),
                "updated_at": self._updated_at,
                "updated_by": self._updated_by,
            }

    def reset(self) -> None:
        """Restablece el estado por defecto (útil para aislamiento en suites de prueba)."""
        with self._lock:
            self._is_maintenance_mode = False
            self._maintenance_message = (
                "La plataforma se encuentra en mantenimiento programado. "
                "La ejecución de consultas SQL está temporalmente deshabilitada."
            )
            self._exercise_statuses.clear()
            self._updated_at = datetime.now(timezone.utc).isoformat()
            self._updated_by = None


system_state = SystemOperationalState()
