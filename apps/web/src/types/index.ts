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

export interface Exercise {
  id: string;
  module_id: string;
  title: string;
  prompt: string;
  initial_code: string;
  solution_query?: string;
  xp_reward: number;
  difficulty: Difficulty;
  check_order: boolean;
  sort_order: number;
  hints?: string[];
  is_completed?: boolean;
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
  completed_exercises?: number;
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
