import { createClient, SupabaseClient } from '@supabase/supabase-js';

const rawUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
// Normalizar URL eliminando posibles sufijos como /rest/v1 o barras finales
const supabaseUrl = rawUrl.replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

export interface AuthCallbackErrorInfo {
  error?: string;
  errorCode?: string;
  errorDescription?: string;
}

/**
 * Normaliza callbacks legacy de Supabase Auth cuando `redirectTo` incluía un fragmento
 * (`/#reset-password` o `/#auth-confirm`) y GoTrue concatenó un segundo `#access_token=...`
 * o `#error=...`, lo cual impide que `URLSearchParams` detecte `access_token`.
 */
export function extractNormalizedCallbackPathAndHash(
  pathname: string,
  hash: string
): { pathname: string; hash: string } | null {
  if (!hash || hash.length <= 1) return null;

  const prefixes: Array<{ prefix: string; targetPath: string }> = [
    { prefix: '#reset-password', targetPath: '/reset-password' },
    { prefix: '#auth-confirm', targetPath: '/auth/confirm' },
  ];

  for (const { prefix, targetPath } of prefixes) {
    if (!hash.startsWith(prefix)) continue;
    const remainder = hash.slice(prefix.length);
    if (!remainder) continue;

    // Ej: "#reset-password#access_token=..." o "#reset-password&access_token=..."
    if (remainder.startsWith('#') || remainder.startsWith('&')) {
      const cleanParams = remainder.slice(1);
      if (cleanParams) {
        return {
          pathname: pathname === '/' ? targetPath : pathname,
          hash: `#${cleanParams}`,
        };
      }
    }
  }

  return null;
}

function captureAndNormalizeInitialAuthUrl(): AuthCallbackErrorInfo | null {
  if (typeof window === 'undefined') return null;

  const normalized = extractNormalizedCallbackPathAndHash(
    window.location.pathname,
    window.location.hash
  );
  if (normalized) {
    window.history.replaceState(
      window.history.state,
      '',
      `${normalized.pathname}${window.location.search}${normalized.hash}`
    );
  }

  const hashParams = window.location.hash.startsWith('#')
    ? new URLSearchParams(window.location.hash.slice(1))
    : new URLSearchParams();
  const searchParams = new URLSearchParams(window.location.search);

  const error = searchParams.get('error') || hashParams.get('error') || undefined;
  const errorCode = searchParams.get('error_code') || hashParams.get('error_code') || undefined;
  const errorDescription =
    searchParams.get('error_description') || hashParams.get('error_description') || undefined;

  if (error || errorCode || errorDescription) {
    return { error, errorCode, errorDescription };
  }

  return null;
}

const initialAuthCallbackError = captureAndNormalizeInitialAuthUrl();

export function getInitialAuthCallbackError(): AuthCallbackErrorInfo | null {
  return initialAuthCallbackError;
}

/**
 * Cliente oficial de Supabase.
 * Si las credenciales no están presentes en .env.local,
 * se crea un cliente dummy seguro para no romper el montaje de la interfaz.
 */
export const supabase: SupabaseClient = createClient(
  supabaseUrl || 'https://placeholder-qurio.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('placeholder') &&
  !supabaseUrl.includes('your-project')
);
