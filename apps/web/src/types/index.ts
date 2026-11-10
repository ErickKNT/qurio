export type Difficulty = 'Principiante' | 'Intermedio' | 'Avanzado';

export type EvaluationStatus = 'PASSED' | 'FAILED' | 'ERROR';

export interface ColumnInfo {
  name: string;
  type: string;
}

export interface DiffResult {
  reason: string;
  expected_columns: string[];
  actual_columns: string[];
  expected_row_count: number;
  actual_row_count: number;
  sample_expected_rows: any[][];
  sample_actual_rows: any[][];
}

export interface ExecutionResult {
  status: 'SUCCESS' | 'ERROR';
  execution_time_ms: number;
  row_count: number;
  columns: ColumnInfo[];
  rows: any[][];
  error?: string;
}

export interface EvaluationResponse {
  status: EvaluationStatus;
  execution_time_ms: number;
  xp_awarded: number;
  columns: string[];
  rows: any[][];
  diff?: DiffResult;
  error?: string;
  message: string;
}

export interface ExerciseHint {
  id: string;
  exercise_id: string;
  hint_order: number;
  content: string;
  xp_penalty_percent: number;
}

export interface ExerciseConcept {
  summary: string;
  syntax?: string;
  key_points?: string[];
  execution_order_note?: string;
}

export interface SampleTableData {
  tableName: string;
  columns: string[];
  rows: (string | number | boolean | null)[][];
}

export interface Exercise {
  id: string;
  module_id: string;
  title: string;
  prompt: string;
  initial_code: string;
  xp_reward: number;
  difficulty: Difficulty;
  check_order: boolean;
  sort_order: number;
  hints?: string[];
  is_completed?: boolean;
  concept?: ExerciseConcept;
  objectives?: string[];
  sample_tables?: SampleTableData[];
}

export interface Module {
  id: string;
  track_id: string;
  title: string;
  slug: string;
  description: string;
  sort_order: number;
  exercises_count?: number;
  completed_count?: number;
}

export interface Track {
  id: string;
  title: string;
  slug: string;
  description: string;
  badge_name: string;
  color_accent: string;
  sort_order: number;
  modules?: Module[];
  total_exercises?: number;
  completed_exercises?: number | null;
  progress_percent?: number | null;
  is_progress_loading?: boolean;
}

export interface UserProfile {
  id: string;
  username: string;
  full_name?: string;
  avatar_url?: string;
  total_xp: number;
  current_level: number;
  current_streak_days: number;
  max_streak_days: number;
  preferred_theme: string;
  created_at: string;
}

export interface NavItem {
  id: string;
  label: string;
  iconName: string;
  href: string;
  badge?: string | number;
}

export type AchievementCategory = 'todos' | 'progreso' | 'habilidad' | 'constancia';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'progreso' | 'habilidad' | 'constancia';
  xp_reward: number;
  unlocked_at?: string | null;
  progress: number;
  required_threshold: number;
  current_value: number;
  unit: string;
}

export interface TableColumn {
  name: string;
  type: string;
  isPrimary?: boolean;
  isForeign?: boolean;
}

export interface TableSchemaInfo {
  tableName: string;
  schema: string;
  rowCount: number;
  columns: TableColumn[];
}

export interface QueryHistoryItem {
  id: string;
  query: string;
  executed_at: string;
  status: 'SUCCESS' | 'ERROR';
  execution_time_ms: number;
  row_count: number;
}

export type AppPath =
  | 'dashboard'
  | 'playground'
  | 'tracks'
  | 'achievements'
  | 'profile'
  | 'exercise'
  | 'auth-confirm'
  | 'reset-password'
  | 'not-found';
