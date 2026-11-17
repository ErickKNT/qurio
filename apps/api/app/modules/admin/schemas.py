from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, Field

from app.modules.runner.schemas import ColumnInfo, DiffResult, EvaluationStatus


class PoolMetrics(BaseModel):
    initialized: bool
    total_connections: int
    idle_connections: int
    active_connections: int
    queued_requests: int
    min_size: int
    max_size: int


class ActiveQueryInfo(BaseModel):
    pid: int
    usename: str
    client_addr: str
    duration_ms: float
    state: str
    query: str


class LiveOpsResponse(BaseModel):
    sandbox_healthy: bool
    rtt_ms: Optional[float] = None
    process_rss_mb: float
    pool: PoolMetrics
    active_queries: List[ActiveQueryInfo] = Field(default_factory=list)
    maintenance_mode: bool
    sampled_at: str
    error: Optional[str] = None


class CancelQueryResponse(BaseModel):
    pid: int
    cancelled: bool
    message: str


class HintsDistribution(BaseModel):
    hints_0: int = 0
    hints_1: int = 0
    hints_2: int = 0
    hints_3: int = 0


class CurriculumExerciseMetric(BaseModel):
    exercise_id: str
    module_id: str
    sort_order: int
    title: str
    difficulty: str
    operational_status: str = "active"
    total_attempts: int = 0
    unique_users: int = 0
    first_pass_rate: float = 0.0
    dropoff_rate: float = 0.0
    consecutive_failures_count: int = 0
    hints_distribution: HintsDistribution = Field(default_factory=HintsDistribution)
    avg_execution_time_ms: float = 0.0
    median_execution_time_ms: float = 0.0


class GuestConversionSummary(BaseModel):
    m01_trial_completers: int = 0
    registered_profiles: int = 0
    conversion_rate_percent: float = 0.0


class CurriculumMetricsResponse(BaseModel):
    data_source: str
    total_exercises: int
    total_attempts: int
    overall_first_pass_rate: float
    guest_conversion: GuestConversionSummary
    exercises: List[CurriculumExerciseMetric] = Field(default_factory=list)


class AttemptRecord(BaseModel):
    id: str
    user_id: str
    exercise_id: str
    exercise_title: Optional[str] = None
    submitted_sql: str
    status: str
    execution_time_ms: int = 0
    error_message: Optional[str] = None
    hints_used: int = 0
    xp_awarded: int = 0
    created_at: str


class AttemptsPageResponse(BaseModel):
    items: List[AttemptRecord] = Field(default_factory=list)
    total: int = 0
    page: int = 1
    page_size: int = 25
    data_source: str = "supabase"


class ReplayAttemptRequest(BaseModel):
    attempt_id: str = Field(..., min_length=1, description="ID del intento registrado en exercise_attempts")


class ReplayTablePayload(BaseModel):
    status: str
    execution_time_ms: float
    row_count: int = 0
    columns: List[ColumnInfo] = Field(default_factory=list)
    inferred_types: Dict[str, str] = Field(default_factory=dict)
    rows: List[List[Any]] = Field(default_factory=list)
    error: Optional[str] = None


class ForensicDiffDetail(BaseModel):
    summary_diff: Optional[DiffResult] = None
    missing_rows: List[List[Any]] = Field(default_factory=list)
    extra_rows: List[List[Any]] = Field(default_factory=list)
    type_mismatches: List[Dict[str, str]] = Field(default_factory=list)
    cardinality_delta: int = 0


class ReplayAttemptResponse(BaseModel):
    attempt_id: str
    exercise_id: str
    exercise_title: str
    submitted_sql: str
    solution_query: str
    evaluation_status: EvaluationStatus
    evaluation_message: str
    student_result: ReplayTablePayload
    expected_result: ReplayTablePayload
    forensic_diff: ForensicDiffDetail


class SecurityAuditEntry(BaseModel):
    timestamp: str
    client_ip: str
    user_id: str
    rule_violated: str
    submitted_sql_snippet: str
    blocked_node: str


class RateLimitBucketEntry(BaseModel):
    identifier: str
    subject_type: str
    requests_used: int
    limit: int
    remaining_tokens: int
    reset_in_seconds: int


class SecurityAuditResponse(BaseModel):
    audit_logs: List[SecurityAuditEntry] = Field(default_factory=list)
    rate_limit_buckets: List[RateLimitBucketEntry] = Field(default_factory=list)


class KillswitchesRequest(BaseModel):
    is_maintenance_mode: Optional[bool] = None
    maintenance_message: Optional[str] = None
    exercise_id: Optional[str] = None
    exercise_status: Optional[Literal["active", "hidden", "under_review"]] = None


class KillswitchesResponse(BaseModel):
    is_maintenance_mode: bool
    maintenance_message: str
    exercise_status_overrides: Dict[str, str] = Field(default_factory=dict)
    updated_at: str
    updated_by: Optional[str] = None


class PoolRecycleResponse(BaseModel):
    recycled: bool
    pool: PoolMetrics
    message: str
