import { supabase } from '@/lib/supabase';
import {
  AdminAttemptsPageResponse,
  AdminCancelQueryResponse,
  AdminCurriculumMetricsResponse,
  AdminKillswitchesRequest,
  AdminKillswitchesResponse,
  AdminLiveOpsResponse,
  AdminPoolRecycleResponse,
  AdminReplayAttemptResponse,
  AdminSecurityAuditResponse,
} from '@/types/admin';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

export class AdminApiError extends Error {
  constructor(message: string, public readonly status?: number) {
    super(message);
    this.name = 'AdminApiError';
  }
}

async function getAdminAuthHeaders(): Promise<Record<string, string>> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const { data } = await supabase.auth.getSession();
  if (data?.session?.access_token) {
    headers['Authorization'] = `Bearer ${data.session.access_token}`;
  }
  return headers;
}

async function requestAdminJson<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = await getAdminAuthHeaders();
  const response = await fetch(`${API_BASE_URL}/admin${path}`, {
    ...init,
    headers: {
      ...headers,
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const errorPayload = (await response.json().catch(() => ({}))) as { detail?: string };
    throw new AdminApiError(
      errorPayload.detail || `Error administrativo HTTP ${response.status}`,
      response.status
    );
  }

  return (await response.json()) as T;
}

export interface AttemptFilters {
  exercise_id?: string;
  user_id?: string;
  status?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
  page_size?: number;
}

export const adminApi = {
  getLiveOps(): Promise<AdminLiveOpsResponse> {
    return requestAdminJson<AdminLiveOpsResponse>('/live-ops');
  },

  cancelSandboxQuery(pid: number): Promise<AdminCancelQueryResponse> {
    return requestAdminJson<AdminCancelQueryResponse>(`/sandbox/cancel-query/${pid}`, {
      method: 'POST',
    });
  },

  getCurriculumMetrics(): Promise<AdminCurriculumMetricsResponse> {
    return requestAdminJson<AdminCurriculumMetricsResponse>('/curriculum/metrics');
  },

  listAttempts(filters: AttemptFilters = {}): Promise<AdminAttemptsPageResponse> {
    const params = new URLSearchParams();
    if (filters.exercise_id) params.set('exercise_id', filters.exercise_id);
    if (filters.user_id) params.set('user_id', filters.user_id);
    if (filters.status) params.set('status', filters.status);
    if (filters.date_from) params.set('date_from', filters.date_from);
    if (filters.date_to) params.set('date_to', filters.date_to);
    params.set('page', String(filters.page ?? 1));
    params.set('page_size', String(filters.page_size ?? 25));
    return requestAdminJson<AdminAttemptsPageResponse>(`/attempts?${params.toString()}`);
  },

  replayAttempt(attemptId: string): Promise<AdminReplayAttemptResponse> {
    return requestAdminJson<AdminReplayAttemptResponse>('/attempts/replay', {
      method: 'POST',
      body: JSON.stringify({ attempt_id: attemptId }),
    });
  },

  getSecurityAuditLog(limit = 100): Promise<AdminSecurityAuditResponse> {
    return requestAdminJson<AdminSecurityAuditResponse>(`/security/audit-log?limit=${limit}`);
  },

  updateKillswitches(payload: AdminKillswitchesRequest): Promise<AdminKillswitchesResponse> {
    return requestAdminJson<AdminKillswitchesResponse>('/system/killswitches', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  recyclePool(): Promise<AdminPoolRecycleResponse> {
    return requestAdminJson<AdminPoolRecycleResponse>('/system/pool/recycle', {
      method: 'POST',
    });
  },
};
