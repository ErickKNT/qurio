import { AppPath } from '@/types';

export interface RouteParams {
  exerciseId?: string;
  trackSlug?: string;
}

/**
 * Traduce un AppPath y parámetros a una URL amigable para History API (C-05).
 */
export function pathToUrl(path: AppPath, params?: RouteParams): string {
  switch (path) {
    case 'dashboard':
      return '/';
    case 'tracks':
      return params?.trackSlug ? `/tracks/${params.trackSlug}` : '/tracks';
    case 'playground':
      return '/playground';
    case 'achievements':
      return '/achievements';
    case 'profile':
      return '/profile';
    case 'exercise':
      return params?.exerciseId ? `/exercises/${params.exerciseId}` : '/exercises';
    case 'auth-confirm':
      return '/auth/confirm';
    case 'reset-password':
      return '/reset-password';
    case 'not-found':
      return '/404';
    default:
      return '/';
  }
}

/**
 * Parsea window.location.pathname en un AppPath y parámetros estructurados (C-05).
 */
export function parseLocation(pathname: string): { path: AppPath; exerciseId?: string; trackSlug?: string } {
  const clean = pathname.replace(/\/+$/, '') || '/';
  if (clean === '/' || clean === '') return { path: 'dashboard' };
  if (clean === '/tracks') return { path: 'tracks' };
  if (clean.startsWith('/tracks/')) {
    const slug = clean.replace('/tracks/', '');
    return { path: 'tracks', trackSlug: slug };
  }
  if (clean === '/playground') return { path: 'playground' };
  if (clean === '/achievements') return { path: 'achievements' };
  if (clean === '/profile') return { path: 'profile' };
  if (clean === '/exercises' || clean === '/exercise') return { path: 'exercise' };
  if (clean.startsWith('/exercises/')) {
    const id = clean.replace('/exercises/', '');
    return { path: 'exercise', exerciseId: id };
  }
  if (clean === '/auth/confirm' || clean === '/auth-confirm') return { path: 'auth-confirm' };
  if (clean === '/reset-password') return { path: 'reset-password' };
  return { path: 'not-found' };
}
