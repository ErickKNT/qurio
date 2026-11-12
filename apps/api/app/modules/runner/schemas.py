from enum import Enum
from typing import Any, List, Optional
from pydantic import BaseModel, Field


class EvaluationStatus(str, Enum):
    PASSED = "PASSED"
    FAILED = "FAILED"
    ERROR = "ERROR"


class ColumnInfo(BaseModel):
    name: str
    type: str


class QueryExecuteRequest(BaseModel):
    query: str = Field(..., min_length=1, description="Consulta SQL a ejecutar")
    database: str = Field(default="ecommerce_sandbox", description="Base de datos destino")


class ExecutionResult(BaseModel):
    status: str
    execution_time_ms: float
    row_count: int = 0
    columns: List[ColumnInfo] = []
    rows: List[List[Any]] = []
    error: Optional[str] = None


class ExerciseSubmitRequest(BaseModel):
    query: str = Field(..., min_length=1, description="Consulta SQL propuesta por el estudiante")
    hints_revealed: int = Field(default=0, ge=0, le=3, description="Número de pistas utilizadas")
    solution_viewed: bool = Field(default=False, description="Indica si el usuario desbloqueó y visualizó la solución oficial")


class RevealSolutionRequest(BaseModel):
    failed_attempts: int = Field(..., ge=0, description="Número de intentos fallidos registrados por el usuario")


class RevealSolutionResponse(BaseModel):
    exercise_id: str
    solution_query: str
    title: str
    explanation: Optional[str] = None
    telemetry_recorded: bool = True


class DiffResult(BaseModel):
    reason: str
    expected_columns: List[str]
    actual_columns: List[str]
    expected_row_count: int
    actual_row_count: int
    sample_expected_rows: List[List[Any]] = []
    sample_actual_rows: List[List[Any]] = []


class EvaluationResponse(BaseModel):
    status: EvaluationStatus
    execution_time_ms: float
    xp_awarded: int = 0
    columns: List[str] = []
    rows: List[List[Any]] = []
    diff: Optional[DiffResult] = None
    error: Optional[str] = None
    message: str
