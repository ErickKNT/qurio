import { ColumnInfo, DiffResult, EvaluationStatus } from '@/types';

export type AdminStatusVariant = 'healthy' | 'warning' | 'critical' | 'killswitch_active';

export type ExerciseOperationalStatus = 'active' | 'hidden' | 'under_review';

export interface AdminPoolMetrics {
  initialized: boolean;
  total_connections: number;
  idle_connections: number;
  active_connections: number;
  queued_requests: number;
  min_size: number;
  max_size: number;
}

export interface AdminActiveQueryInfo {
  pid: number;
  usename: string;
  client_addr: string;
  duration_ms: number;
  state: string;
  query: string;
}

export interface AdminLiveOpsResponse {
  sandbox_healthy: boolean;
  rtt_ms: number | null;
  process_rss_mb: number;
  pool: AdminPoolMetrics;
  active_queries: AdminActiveQueryInfo[];
  maintenance_mode: boolean;
  sampled_at: string;
  error?: string | null;
}

export interface AdminCancelQueryResponse {
  pid: number;
  cancelled: boolean;
  message: string;
}

export interface AdminHintsDistribution {
  hints_0: number;
  hints_1: number;
  hints_2: number;
  hints_3: number;
}

export interface AdminCurriculumExerciseMetric {
  exercise_id: string;
  module_id: string;
  sort_order: number;
  title: string;
  difficulty: string;
  operational_status: ExerciseOperationalStatus;
  total_attempts: number;
  unique_users: number;
  first_pass_rate: number;
  dropoff_rate: number;
  consecutive_failures_count: number;
  hints_distribution: AdminHintsDistribution;
  avg_execution_time_ms: number;
  median_execution_time_ms: number;
}

export interface AdminGuestConversionSummary {
  m01_trial_completers: number;
  registered_profiles: number;
  conversion_rate_percent: number;
}

export interface AdminCurriculumMetricsResponse {
  data_source: string;
  total_exercises: number;
  total_attempts: number;
  overall_first_pass_rate: number;
  guest_conversion: AdminGuestConversionSummary;
  exercises: AdminCurriculumExerciseMetric[];
}

export interface AdminAttemptRecord {
  id: string;
  user_id: string;
  exercise_id: string;
  exercise_title?: string | null;
  submitted_sql: string;
  status: 'PASSED' | 'FAILED' | 'ERROR' | string;
  execution_time_ms: number;
  error_message?: string | null;
  hints_used: number;
  xp_awarded: number;
  created_at: string;
}

export interface AdminAttemptsPageResponse {
  items: AdminAttemptRecord[];
  total: number;
  page: number;
  page_size: number;
  data_source: string;
}

export type SqlCellValue = string | number | boolean | null;

export interface AdminReplayTablePayload {
  status: string;
  execution_time_ms: number;
  row_count: number;
  columns: ColumnInfo[];
  inferred_types: Record<string, string>;
  rows: SqlCellValue[][];
  error?: string | null;
}

export interface AdminForensicDiffDetail {
  summary_diff?: DiffResult | null;
  missing_rows: SqlCellValue[][];
  extra_rows: SqlCellValue[][];
  type_mismatches: Array<{
    column: string;
    expected_type: string;
    actual_type: string;
  }>;
  cardinality_delta: number;
}

export interface AdminReplayAttemptResponse {
  attempt_id: string;
  exercise_id: string;
  exercise_title: string;
  submitted_sql: string;
  solution_query: string;
  evaluation_status: EvaluationStatus;
  evaluation_message: string;
  student_result: AdminReplayTablePayload;
  expected_result: AdminReplayTablePayload;
  forensic_diff: AdminForensicDiffDetail;
}

export interface AdminSecurityAuditEntry {
  timestamp: string;
  client_ip: string;
  user_id: string;
  rule_violated: string;
  submitted_sql_snippet: string;
  blocked_node: string;
}

export interface AdminRateLimitBucketEntry {
  identifier: string;
  subject_type: string;
  requests_used: number;
  limit: number;
  remaining_tokens: number;
  reset_in_seconds: number;
}

export interface AdminSecurityAuditResponse {
  audit_logs: AdminSecurityAuditEntry[];
  rate_limit_buckets: AdminRateLimitBucketEntry[];
}

export interface AdminKillswitchesRequest {
  is_maintenance_mode?: boolean;
  maintenance_message?: string;
  exercise_id?: string;
  exercise_status?: ExerciseOperationalStatus;
}

export interface AdminKillswitchesResponse {
  is_maintenance_mode: boolean;
  maintenance_message: string;
  exercise_status_overrides: Record<string, ExerciseOperationalStatus>;
  updated_at: string;
  updated_by?: string | null;
}

export interface AdminPoolRecycleResponse {
  recycled: boolean;
  pool: AdminPoolMetrics;
  message: string;
}

export type AdminUserRole = 'admin' | 'student';

export interface AdminUserRecord {
  id: string;
  email: string | null;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  role: AdminUserRole;
  email_confirmed_at: string | null;
  last_sign_in_at: string | null;
  created_at: string | null;
  banned_until: string | null;
  is_banned: boolean;
  level: number;
  xp: number;
  current_streak_days: number;
  max_streak_days: number;
  completed_exercises: number;
  total_exercises: number;
  total_attempts: number;
  passed_attempts: number;
  last_activity_at: string | null;
}

export interface AdminUsersSummary {
  total_users: number;
  admins_count: number;
  active_7d_count: number;
  banned_count: number;
  confirmed_count: number;
}

export interface AdminUsersPageResponse {
  items: AdminUserRecord[];
  total: number;
  limit: number;
  offset: number;
  data_source: string;
  summary: AdminUsersSummary;
}

export interface AdminUserModerationResponse {
  user_id: string;
  role: AdminUserRole;
  is_banned: boolean;
  banned_until: string | null;
  updated_at: string;
  updated_by: string;
  message: string;
}

export interface AdminUserDeleteResponse {
  user_id: string;
  deleted: boolean;
  deleted_at: string;
  deleted_by: string;
  message: string;
}
