import asyncio
from collections import Counter, defaultdict
import ctypes
from datetime import datetime, timezone
import logging
import os
import statistics
import sys
from typing import Any, Dict, List, Optional, Tuple
from fastapi import HTTPException, status
import httpx

from app.core.config import settings
from app.core.rate_limit import rate_limiter
from app.core.system_state import ExerciseOperationalStatus, system_state
from app.modules.admin.schemas import (
    ActiveQueryInfo,
    AttemptRecord,
    AttemptsPageResponse,
    CancelQueryResponse,
    CurriculumExerciseMetric,
    CurriculumMetricsResponse,
    ForensicDiffDetail,
    GuestConversionSummary,
    HintsDistribution,
    KillswitchesRequest,
    KillswitchesResponse,
    LiveOpsResponse,
    PoolMetrics,
    PoolRecycleResponse,
    RateLimitBucketEntry,
    ReplayAttemptResponse,
    ReplayTablePayload,
    SecurityAuditEntry,
    SecurityAuditResponse,
)
from app.modules.curriculum.repository import exercise_repository
from app.modules.runner.evaluator import evaluate_solution, row_to_comparable_tuple
from app.modules.runner.router import GUEST_TRIAL_EXERCISE_IDS
from app.modules.runner.schemas import ExecutionResult
from app.modules.runner.security import get_security_audit_logs
from app.modules.runner.service import sandbox_runner

logger = logging.getLogger(__name__)


def get_process_rss_mb() -> float:
    """Obtiene el uso de memoria RSS del proceso FastAPI actual en MiB."""
    try:
        if sys.platform == "win32":
            class PROCESS_MEMORY_COUNTERS(ctypes.Structure):
                _fields_ = [
                    ("cb", ctypes.c_ulong),
                    ("PageFaultCount", ctypes.c_ulong),
                    ("PeakWorkingSetSize", ctypes.c_size_t),
                    ("WorkingSetSize", ctypes.c_size_t),
                    ("QuotaPeakPagedPoolUsage", ctypes.c_size_t),
                    ("QuotaPagedPoolUsage", ctypes.c_size_t),
                    ("QuotaPeakNonPagedPoolUsage", ctypes.c_size_t),
                    ("QuotaNonPagedPoolUsage", ctypes.c_size_t),
                    ("PagefileUsage", ctypes.c_size_t),
                    ("PeakPagefileUsage", ctypes.c_size_t),
                ]

            counters = PROCESS_MEMORY_COUNTERS()
            counters.cb = ctypes.sizeof(PROCESS_MEMORY_COUNTERS)
            handle = ctypes.windll.kernel32.GetCurrentProcess()
            if ctypes.windll.psapi.GetProcessMemoryInfo(handle, ctypes.byref(counters), counters.cb):
                return round(counters.WorkingSetSize / (1024 * 1024), 2)
        elif os.path.exists("/proc/self/statm"):
            with open("/proc/self/statm", "r", encoding="utf-8") as fh:
                parts = fh.read().split()
                if len(parts) >= 2:
                    rss_pages = int(parts[1])
                    page_size = os.sysconf("SC_PAGE_SIZE")
                    return round((rss_pages * page_size) / (1024 * 1024), 2)
        else:
            import resource
            ru = resource.getrusage(resource.RUSAGE_SELF).ru_maxrss
            divisor = (1024 * 1024) if sys.platform == "darwin" else 1024
            return round(ru / divisor, 2)
    except Exception as exc:
        logger.debug(f"No se pudo obtener RSS del proceso: {exc}")
    return 0.0


class AdminService:
    """Servicio de observabilidad, auditoría forense y operaciones en vivo para Qurio Admin."""

    def _supabase_admin_headers(self, prefer_count: bool = False) -> Optional[Dict[str, str]]:
        if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
            return None
        headers = {
            "apikey": settings.SUPABASE_SERVICE_ROLE_KEY,
            "Authorization": f"Bearer {settings.SUPABASE_SERVICE_ROLE_KEY}",
        }
        if prefer_count:
            headers["Prefer"] = "count=exact"
        return headers

    async def _fetch_supabase_table(
        self,
        table: str,
        params: Optional[Dict[str, str]] = None,
        prefer_count: bool = False,
    ) -> Optional[Tuple[List[Dict[str, Any]], Optional[int]]]:
        headers = self._supabase_admin_headers(prefer_count=prefer_count)
        if not headers:
            return None

        url = f"{settings.SUPABASE_URL.rstrip('/')}/rest/v1/{table}"
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.get(url, headers=headers, params=params or {})
                if resp.status_code not in (200, 206):
                    logger.warning(f"Consulta administrativa a Supabase ({table}) devolvió {resp.status_code}")
                    return None
                total_count: Optional[int] = None
                content_range = resp.headers.get("content-range")
                if content_range and "/" in content_range:
                    raw_total = content_range.split("/")[-1]
                    if raw_total.isdigit():
                        total_count = int(raw_total)
                data = resp.json()
                return (data if isinstance(data, list) else []), total_count
        except Exception as exc:
            logger.warning(f"Error consultando tabla '{table}' en Supabase: {exc}")
            return None

    async def get_live_ops(self) -> LiveOpsResponse:
        pool_metrics = PoolMetrics(**sandbox_runner.get_pool_metrics())
        rtt_ms: Optional[float] = None
        active_queries: List[ActiveQueryInfo] = []
        sandbox_healthy = False
        error_msg: Optional[str] = None

        try:
            rtt_ms = await sandbox_runner.measure_rtt_ms()
            sandbox_healthy = True
            raw_queries = await sandbox_runner.get_active_queries()
            active_queries = [ActiveQueryInfo(**q) for q in raw_queries]
            # Releer métricas del pool después de medir/consultar
            pool_metrics = PoolMetrics(**sandbox_runner.get_pool_metrics())
        except Exception as exc:
            error_msg = str(exc)
            logger.warning(f"Fallo parcial en Live Ops al consultar Sandbox: {exc}")

        return LiveOpsResponse(
            sandbox_healthy=sandbox_healthy,
            rtt_ms=rtt_ms,
            process_rss_mb=get_process_rss_mb(),
            pool=pool_metrics,
            active_queries=active_queries,
            maintenance_mode=system_state.is_maintenance_mode,
            sampled_at=datetime.now(timezone.utc).isoformat(),
            error=error_msg,
        )

    async def cancel_sandbox_query(self, pid: int) -> CancelQueryResponse:
        if pid <= 0:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El PID de PostgreSQL debe ser un entero positivo.",
            )
        try:
            cancelled = await sandbox_runner.cancel_backend_pid(pid)
            return CancelQueryResponse(
                pid=pid,
                cancelled=cancelled,
                message=(
                    f"Señal de cancelación enviada correctamente al PID {pid}."
                    if cancelled
                    else f"No se pudo cancelar el PID {pid} (puede haber finalizado o pertenecer a otro contexto)."
                ),
            )
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Error ejecutando pg_cancel_backend({pid}): {exc}",
            )

    async def get_curriculum_metrics(self) -> CurriculumMetricsResponse:
        all_exercises = sorted(await exercise_repository.list_all(), key=lambda ex: ex.sort_order)

        attempts_res = await self._fetch_supabase_table(
            "exercise_attempts",
            params={
                "select": "id,user_id,exercise_id,status,execution_time_ms,hints_used,created_at",
                "order": "created_at.asc",
                "limit": "5000",
            },
        )
        profiles_res = await self._fetch_supabase_table(
            "user_profiles",
            params={"select": "id", "limit": "5000"},
        )

        data_source = "supabase" if attempts_res is not None else "local_catalog_only"
        attempts_rows = attempts_res[0] if attempts_res is not None else []
        profiles_count = len(profiles_res[0]) if profiles_res is not None else 0

        by_exercise: Dict[str, List[Dict[str, Any]]] = defaultdict(list)
        for row in attempts_rows:
            ex_id = str(row.get("exercise_id") or "")
            if ex_id:
                by_exercise[ex_id].append(row)

        m01_canonical_ids = {
            "e0000000-0000-0000-0000-000000000001",
            "e0000000-0000-0000-0000-000000000008",
            "e0000000-0000-0000-0000-000000000019",
        }
        passed_m01_by_user: Dict[str, set] = defaultdict(set)

        exercise_metrics: List[CurriculumExerciseMetric] = []
        total_attempts = len(attempts_rows)
        total_unique_pairs = 0
        total_first_pass_pairs = 0

        for ex in all_exercises:
            ex_attempts = by_exercise.get(ex.id, [])
            by_user: Dict[str, List[Dict[str, Any]]] = defaultdict(list)
            hints_counts = {0: 0, 1: 0, 2: 0, 3: 0}
            exec_times: List[float] = []

            for att in ex_attempts:
                uid = str(att.get("user_id") or "")
                by_user[uid].append(att)
                h = min(3, max(0, int(att.get("hints_used") or 0)))
                hints_counts[h] += 1
                exec_times.append(float(att.get("execution_time_ms") or 0))
                if ex.id in m01_canonical_ids and att.get("status") == "PASSED" and uid:
                    passed_m01_by_user[uid].add(ex.id)

            unique_users = len(by_user)
            first_pass_users = 0
            dropoff_users = 0
            consecutive_failures_count = 0

            for uid, user_atts in by_user.items():
                user_atts_sorted = sorted(user_atts, key=lambda a: str(a.get("created_at") or ""))
                if user_atts_sorted and user_atts_sorted[0].get("status") == "PASSED":
                    first_pass_users += 1
                ever_passed = any(a.get("status") == "PASSED" for a in user_atts_sorted)
                if not ever_passed and user_atts_sorted:
                    dropoff_users += 1
                    consecutive_failures_count += len(user_atts_sorted)

            total_unique_pairs += unique_users
            total_first_pass_pairs += first_pass_users

            first_pass_rate = round((first_pass_users / unique_users) * 100.0, 2) if unique_users > 0 else 0.0
            dropoff_rate = round((dropoff_users / unique_users) * 100.0, 2) if unique_users > 0 else 0.0
            avg_ms = round(sum(exec_times) / len(exec_times), 2) if exec_times else 0.0
            median_ms = round(float(statistics.median(exec_times)), 2) if exec_times else 0.0

            exercise_metrics.append(
                CurriculumExerciseMetric(
                    exercise_id=ex.id,
                    module_id=ex.module_id,
                    sort_order=ex.sort_order,
                    title=ex.title,
                    difficulty=ex.difficulty,
                    operational_status=system_state.get_exercise_status(ex.id),
                    total_attempts=len(ex_attempts),
                    unique_users=unique_users,
                    first_pass_rate=first_pass_rate,
                    dropoff_rate=dropoff_rate,
                    consecutive_failures_count=consecutive_failures_count,
                    hints_distribution=HintsDistribution(
                        hints_0=hints_counts[0],
                        hints_1=hints_counts[1],
                        hints_2=hints_counts[2],
                        hints_3=hints_counts[3],
                    ),
                    avg_execution_time_ms=avg_ms,
                    median_execution_time_ms=median_ms,
                )
            )

        m01_trial_completers = sum(
            1 for solved_set in passed_m01_by_user.values() if m01_canonical_ids.issubset(solved_set)
        )
        conversion_rate = (
            round((m01_trial_completers / profiles_count) * 100.0, 2)
            if profiles_count > 0
            else 0.0
        )
        overall_first_pass = (
            round((total_first_pass_pairs / total_unique_pairs) * 100.0, 2)
            if total_unique_pairs > 0
            else 0.0
        )

        return CurriculumMetricsResponse(
            data_source=data_source,
            total_exercises=len(all_exercises),
            total_attempts=total_attempts,
            overall_first_pass_rate=overall_first_pass,
            guest_conversion=GuestConversionSummary(
                m01_trial_completers=m01_trial_completers,
                registered_profiles=profiles_count,
                conversion_rate_percent=conversion_rate,
            ),
            exercises=exercise_metrics,
        )

    async def list_attempts(
        self,
        exercise_id: Optional[str] = None,
        user_id: Optional[str] = None,
        attempt_status: Optional[str] = None,
        date_from: Optional[str] = None,
        date_to: Optional[str] = None,
        page: int = 1,
        page_size: int = 25,
    ) -> AttemptsPageResponse:
        safe_page = max(1, page)
        safe_page_size = max(1, min(page_size, 100))
        offset = (safe_page - 1) * safe_page_size

        params: Dict[str, str] = {
            "select": "id,user_id,exercise_id,submitted_sql,status,execution_time_ms,error_message,hints_used,xp_awarded,created_at",
            "order": "created_at.desc",
            "limit": str(safe_page_size),
            "offset": str(offset),
        }
        if exercise_id:
            params["exercise_id"] = f"eq.{exercise_id}"
        if user_id:
            params["user_id"] = f"eq.{user_id}"
        if attempt_status:
            params["status"] = f"eq.{attempt_status}"

        # PostgREST usa lista de tuplas si hay múltiples filtros sobre created_at
        headers = self._supabase_admin_headers(prefer_count=True)
        if not headers:
            return AttemptsPageResponse(
                items=[],
                total=0,
                page=safe_page,
                page_size=safe_page_size,
                data_source="unavailable",
            )

        query_params: List[Tuple[str, str]] = list(params.items())
        if date_from:
            query_params.append(("created_at", f"gte.{date_from}"))
        if date_to:
            query_params.append(("created_at", f"lte.{date_to}"))

        all_exercises = {ex.id: ex.title for ex in await exercise_repository.list_all()}
        url = f"{settings.SUPABASE_URL.rstrip('/')}/rest/v1/exercise_attempts"
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.get(url, headers=headers, params=query_params)
                if resp.status_code not in (200, 206):
                    logger.warning(f"Error listando exercise_attempts: {resp.status_code} {resp.text}")
                    return AttemptsPageResponse(
                        items=[],
                        total=0,
                        page=safe_page,
                        page_size=safe_page_size,
                        data_source="supabase_error",
                    )
                rows = resp.json() if isinstance(resp.json(), list) else []
                total_count = len(rows)
                content_range = resp.headers.get("content-range")
                if content_range and "/" in content_range:
                    raw_total = content_range.split("/")[-1]
                    if raw_total.isdigit():
                        total_count = int(raw_total)

                items = [
                    AttemptRecord(
                        id=str(r["id"]),
                        user_id=str(r["user_id"]),
                        exercise_id=str(r["exercise_id"]),
                        exercise_title=all_exercises.get(str(r["exercise_id"])),
                        submitted_sql=str(r.get("submitted_sql") or ""),
                        status=str(r.get("status") or ""),
                        execution_time_ms=int(r.get("execution_time_ms") or 0),
                        error_message=r.get("error_message"),
                        hints_used=int(r.get("hints_used") or 0),
                        xp_awarded=int(r.get("xp_awarded") or 0),
                        created_at=str(r.get("created_at") or ""),
                    )
                    for r in rows
                ]
                return AttemptsPageResponse(
                    items=items,
                    total=total_count,
                    page=safe_page,
                    page_size=safe_page_size,
                    data_source="supabase",
                )
        except Exception as exc:
            logger.warning(f"Fallo de red listando intentos forenses: {exc}")
            return AttemptsPageResponse(
                items=[],
                total=0,
                page=safe_page,
                page_size=safe_page_size,
                data_source="supabase_error",
            )

    async def fetch_attempt_by_id(self, attempt_id: str) -> Optional[Dict[str, Any]]:
        """Recupera un intento específico desde Supabase exercise_attempts."""
        res = await self._fetch_supabase_table(
            "exercise_attempts",
            params={
                "id": f"eq.{attempt_id}",
                "select": "id,user_id,exercise_id,submitted_sql,status,execution_time_ms,error_message,hints_used,xp_awarded,created_at",
                "limit": "1",
            },
        )
        if res and res[0]:
            return res[0][0]
        return None

    async def replay_attempt(self, attempt_id: str) -> ReplayAttemptResponse:
        attempt = await self.fetch_attempt_by_id(attempt_id)
        if not attempt:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Intento '{attempt_id}' no encontrado.",
            )

        exercise_id = str(attempt.get("exercise_id") or "")
        submitted_sql = str(attempt.get("submitted_sql") or "")
        exercise = await exercise_repository.get_internal_for_evaluation(exercise_id)
        if not exercise:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Ejercicio '{exercise_id}' no encontrado para replay.",
            )

        student_res, expected_res = await asyncio.gather(
            sandbox_runner.execute_query(submitted_sql, client_ip="admin-replay", user_id="admin"),
            sandbox_runner.execute_query(exercise.solution_query, client_ip="internal", user_id="evaluator"),
        )

        evaluation = evaluate_solution(
            student_result=student_res,
            expected_result=expected_res,
            check_order=exercise.check_order,
            base_xp=exercise.xp_reward,
            hints_used=int(attempt.get("hints_used") or 0),
            student_sql=submitted_sql,
            expected_sql=exercise.solution_query,
        )

        forensic_diff = self._build_forensic_diff(
            student_res=student_res,
            expected_res=expected_res,
            summary_diff=evaluation.diff,
        )

        return ReplayAttemptResponse(
            attempt_id=str(attempt.get("id") or attempt_id),
            exercise_id=exercise.id,
            exercise_title=exercise.title,
            submitted_sql=submitted_sql,
            solution_query=exercise.solution_query,
            evaluation_status=evaluation.status,
            evaluation_message=evaluation.message,
            student_result=ReplayTablePayload(
                status=student_res.status,
                execution_time_ms=student_res.execution_time_ms,
                row_count=student_res.row_count,
                columns=student_res.columns,
                inferred_types={c.name: c.type for c in student_res.columns},
                rows=student_res.rows,
                error=student_res.error,
            ),
            expected_result=ReplayTablePayload(
                status=expected_res.status,
                execution_time_ms=expected_res.execution_time_ms,
                row_count=expected_res.row_count,
                columns=expected_res.columns,
                inferred_types={c.name: c.type for c in expected_res.columns},
                rows=expected_res.rows,
                error=expected_res.error,
            ),
            forensic_diff=forensic_diff,
        )

    def _build_forensic_diff(
        self,
        student_res: ExecutionResult,
        expected_res: ExecutionResult,
        summary_diff: Any,
    ) -> ForensicDiffDetail:
        type_mismatches: List[Dict[str, str]] = []
        for idx, exp_col in enumerate(expected_res.columns):
            if idx < len(student_res.columns):
                stu_col = student_res.columns[idx]
                if stu_col.type != exp_col.type:
                    type_mismatches.append(
                        {
                            "column": exp_col.name,
                            "expected_type": exp_col.type,
                            "actual_type": stu_col.type,
                        }
                    )

        missing_rows: List[List[Any]] = []
        extra_rows: List[List[Any]] = []

        if student_res.status == "SUCCESS" and expected_res.status == "SUCCESS":
            if len(student_res.columns) == len(expected_res.columns):
                exp_map: Dict[Tuple[Any, ...], List[Any]] = {}
                exp_keys: List[Tuple[Any, ...]] = []
                for row in expected_res.rows:
                    key = row_to_comparable_tuple(row)
                    exp_map.setdefault(key, row)
                    exp_keys.append(key)

                stu_map: Dict[Tuple[Any, ...], List[Any]] = {}
                stu_keys: List[Tuple[Any, ...]] = []
                for row in student_res.rows:
                    key = row_to_comparable_tuple(row)
                    stu_map.setdefault(key, row)
                    stu_keys.append(key)

                exp_counter = Counter(exp_keys)
                stu_counter = Counter(stu_keys)

                for key, count in (exp_counter - stu_counter).items():
                    for _ in range(count):
                        if len(missing_rows) < 50:
                            missing_rows.append(exp_map[key])

                for key, count in (stu_counter - exp_counter).items():
                    for _ in range(count):
                        if len(extra_rows) < 50:
                            extra_rows.append(stu_map[key])
            else:
                missing_rows = expected_res.rows[:25]
                extra_rows = student_res.rows[:25]

        return ForensicDiffDetail(
            summary_diff=summary_diff,
            missing_rows=missing_rows,
            extra_rows=extra_rows,
            type_mismatches=type_mismatches,
            cardinality_delta=student_res.row_count - expected_res.row_count,
        )

    async def get_security_audit_log(self, limit: int = 100) -> SecurityAuditResponse:
        raw_logs = get_security_audit_logs(limit=limit)
        buckets = await rate_limiter.get_bucket_snapshots()
        return SecurityAuditResponse(
            audit_logs=[SecurityAuditEntry(**entry) for entry in raw_logs],
            rate_limit_buckets=[RateLimitBucketEntry(**b) for b in buckets],
        )

    async def update_killswitches(
        self,
        payload: KillswitchesRequest,
        admin_id: str,
    ) -> KillswitchesResponse:
        if payload.is_maintenance_mode is not None or payload.maintenance_message is not None:
            current = system_state.is_maintenance_mode
            target_mode = payload.is_maintenance_mode if payload.is_maintenance_mode is not None else current
            system_state.set_maintenance_mode(
                enabled=target_mode,
                message=payload.maintenance_message,
                updated_by=admin_id,
            )

        if payload.exercise_id and payload.exercise_status:
            exercise = await exercise_repository.get_internal_for_evaluation(payload.exercise_id)
            if not exercise:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Ejercicio '{payload.exercise_id}' no encontrado.",
                )
            status_val: ExerciseOperationalStatus = payload.exercise_status
            system_state.set_exercise_status(
                exercise_id=payload.exercise_id,
                status=status_val,
                updated_by=admin_id,
            )

        snap = system_state.snapshot()
        return KillswitchesResponse(**snap)

    async def recycle_pool(self) -> PoolRecycleResponse:
        metrics = await sandbox_runner.recycle_pool()
        return PoolRecycleResponse(
            recycled=True,
            pool=PoolMetrics(**metrics),
            message="Pool asyncpg hacia PostgreSQL Sandbox reciclado limpiamente.",
        )


admin_service = AdminService()
