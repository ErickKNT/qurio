import { useState, useEffect, useCallback, useRef } from 'react';
import { AppPath, Exercise, Track } from '@/types';
import { pathToUrl, parseLocation, RouteParams } from '@/lib/routing';

export interface UseAppRouterOptions {
  isPasswordRecovery: boolean;
  clearPasswordRecovery: () => void;
  onLocationExerciseId: (exerciseId: string) => void;
}

export function useAppRouter({
  isPasswordRecovery,
  clearPasswordRecovery,
  onLocationExerciseId,
}: UseAppRouterOptions) {
  const [currentPath, setCurrentPath] = useState<AppPath>('dashboard');
  const [verifyCode, setVerifyCode] = useState<string>('');

  const onLocationExerciseIdRef = useRef(onLocationExerciseId);
  onLocationExerciseIdRef.current = onLocationExerciseId;

  const navigate = useCallback(
    (newPath: AppPath, params?: RouteParams, replace = false) => {
      if (newPath !== 'reset-password') {
        clearPasswordRecovery();
      }
      if (params?.verifyCode) {
        setVerifyCode(params.verifyCode);
      }
      setCurrentPath(newPath);
      const targetUrl = pathToUrl(newPath, params);
      if (window.location.pathname !== targetUrl) {
        if (replace) {
          window.history.replaceState({ path: newPath, ...params }, '', targetUrl);
        } else {
          window.history.pushState({ path: newPath, ...params }, '', targetUrl);
        }
      }
    },
    [clearPasswordRecovery]
  );

  // Redirección automática al detectar el evento PASSWORD_RECOVERY de Supabase Auth
  useEffect(() => {
    if (isPasswordRecovery && currentPath !== 'reset-password') {
      navigate('reset-password', undefined, true);
    }
  }, [isPasswordRecovery, currentPath, navigate]);

  // Sincronización de enrutamiento web y detección estructurada de tokens de Supabase Auth (H04, H09)
  useEffect(() => {
    const handleLocationChange = () => {
      const searchParams = new URLSearchParams(window.location.search);
      const rawHash = window.location.hash.replace(/^#\/?/, '');
      const hashQueryIndex = rawHash.indexOf('?');
      const hashParams = new URLSearchParams(
        hashQueryIndex >= 0 ? rawHash.slice(hashQueryIndex + 1) : rawHash
      );

      const authType = searchParams.get('type') || hashParams.get('type');
      const parsed = parseLocation(window.location.pathname);

      // 1. Detección estructurada de parámetros Supabase Auth (PKCE, token_hash, recuperación)
      if (
        isPasswordRecovery ||
        parsed.path === 'reset-password' ||
        authType === 'recovery' ||
        rawHash === 'reset-password' ||
        rawHash.startsWith('reset-password?')
      ) {
        setCurrentPath('reset-password');
        return;
      }

      if (
        parsed.path === 'auth-confirm' ||
        authType === 'signup' ||
        authType === 'email_change' ||
        rawHash === 'auth-confirm' ||
        rawHash.startsWith('auth-confirm?')
      ) {
        setCurrentPath('auth-confirm');
        return;
      }

      // 2. Enrutamiento estándar con History API
      setCurrentPath(parsed.path);

      if (parsed.path === 'verify' && parsed.verifyCode) {
        setVerifyCode(parsed.verifyCode);
      }

      if (parsed.path === 'exercise' && parsed.exerciseId) {
        onLocationExerciseIdRef.current(parsed.exerciseId);
      }
    };

    handleLocationChange();
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, [isPasswordRecovery]);

  const getHeaderTitle = useCallback(() => {
    switch (currentPath) {
      case 'dashboard':
        return 'Inicio';
      case 'tracks':
        return 'Rutas de Aprendizaje';
      case 'playground':
        return 'Laboratorio SQL';
      case 'reference':
        return 'Referencia SQL';
      case 'verify':
        return 'Verificación de Constancia';
      case 'achievements':
        return 'Logros & Rangos';
      case 'profile':
        return 'Mi Perfil';
      case 'not-found':
      case 'admin':
        return '404 Relation Not Found';
      case 'auth-confirm':
        return 'Verificación de Cuenta';
      case 'reset-password':
        return 'Restablecer Contraseña';
      default:
        return 'Inicio';
    }
  }, [currentPath]);

  return {
    currentPath,
    setCurrentPath,
    verifyCode,
    navigate,
    getHeaderTitle,
  };
}

export function useDocumentTitle(options: {
  currentPath: AppPath;
  activeExercise: Exercise;
  tracks: Track[];
  isAdmin: boolean;
}) {
  const { currentPath, activeExercise, tracks, isAdmin } = options;

  useEffect(() => {
    if (currentPath === 'exercise') {
      const exerciseTrack = tracks.find((t) =>
        t.modules?.some((m) => m.id === activeExercise.module_id)
      );
      const trackLabel = exerciseTrack?.title || 'Fundamentos de SQL';
      document.title = `${activeExercise.title} — ${trackLabel} | Qurio`;
    } else if (currentPath === 'admin') {
      document.title = isAdmin
        ? 'Administración y Operaciones | Qurio'
        : 'ERROR 404: Relation Not Found | Qurio';
    } else {
      const titles: Record<string, string> = {
        dashboard: 'Inicio | Qurio',
        tracks: 'Rutas de Aprendizaje | Qurio',
        playground: 'Laboratorio SQL | Qurio',
        reference: 'Referencia SQL | Qurio',
        verify: 'Verificar Constancia | Qurio',
        achievements: 'Logros & Rangos | Qurio',
        profile: 'Mi Perfil | Qurio',
        'not-found': 'ERROR 404: Relation Not Found | Qurio',
        'auth-confirm': 'Verificación de Cuenta | Qurio',
        'reset-password': 'Restablecer Contraseña | Qurio',
      };
      document.title = titles[currentPath] || 'Qurio | Aprende SQL escribiendo consultas reales.';
    }
  }, [currentPath, activeExercise, tracks, isAdmin]);
}
