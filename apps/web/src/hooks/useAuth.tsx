import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { UserProfile } from '@/types';
import { persistence } from '@/lib/persistence';
import { api } from '@/lib/api';

export interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isCloudAuth: boolean;
  isDemoMode: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (
    email: string,
    password: string,
    username: string
  ) => Promise<{ success: boolean; error?: string; message?: string; isDemo?: boolean; emailConfirmed?: boolean }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string; message?: string; isDemo?: boolean }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  refreshProfile: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Obtiene o crea el perfil en la tabla user_profiles de Supabase
  const fetchProfile = useCallback(async (userId: string, userMetadata?: Record<string, any>) => {
    try {
      const { data, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (data) {
        const loadedProfile: UserProfile = {
          id: data.id,
          username: data.username || userMetadata?.username || `user_${userId.substring(0, 6)}`,
          full_name: data.display_name || userMetadata?.display_name || data.username,
          avatar_url: data.avatar_url || userMetadata?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${data.username || userId}`,
          total_xp: data.xp ?? 0,
          current_level: data.level ?? 1,
          current_streak_days: data.current_streak_days ?? 0,
          max_streak_days: data.max_streak_days ?? 0,
          preferred_theme: 'dark',
          created_at: data.created_at || new Date().toISOString(),
        };
        setProfile(loadedProfile);
        persistence.updateProfile(userId, loadedProfile);
        return;
      }

      // Si no existe aún en user_profiles (ej. primer login sin trigger)
      if (profileError || !data) {
        const username = userMetadata?.username || userMetadata?.display_name || `dev_${userId.substring(0, 6)}`;
        const displayName = userMetadata?.display_name || username;
        const avatarUrl = userMetadata?.avatar_url || `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`;

        const newProfileData = {
          id: userId,
          username,
          display_name: displayName,
          avatar_url: avatarUrl,
          xp: 0,
          level: 1,
          current_streak_days: 1,
          max_streak_days: 1,
        };

        const { data: created } = await supabase
          .from('user_profiles')
          .insert(newProfileData)
          .select()
          .maybeSingle();

        const finalProfile: UserProfile = {
          id: userId,
          username: created?.username || username,
          full_name: created?.display_name || displayName,
          avatar_url: created?.avatar_url || avatarUrl,
          total_xp: created?.xp ?? 0,
          current_level: created?.level ?? 1,
          current_streak_days: created?.current_streak_days ?? 1,
          max_streak_days: created?.max_streak_days ?? 1,
          preferred_theme: 'dark',
          created_at: created?.created_at || new Date().toISOString(),
        };

        setProfile(finalProfile);
        persistence.updateProfile(userId, finalProfile);
      }
    } catch (err: any) {
      console.warn('Error al sincronizar perfil de Supabase:', err);
    }
  }, []);

  // 1. Inicialización de sesión y escucha de eventos de Supabase Auth
  useEffect(() => {
    if (!isSupabaseConfigured) {
      // Modo local offline
      const local = persistence.getLocalProfile();
      if (local && local.username) {
        setProfile(local as UserProfile);
      }
      setLoading(false);
      return;
    }

    // A. Obtener sesión actual de Supabase
    supabase.auth.getSession().then(({ data: { session: currentSession }, error: sessionError }) => {
      if (sessionError) {
        setError(sessionError.message);
      }
      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        fetchProfile(currentSession.user.id, currentSession.user.user_metadata);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    // B. Listener reactivo de cambios de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        if (newSession?.user) {
          await fetchProfile(newSession.user.id, newSession.user.user_metadata);
          if (event === 'SIGNED_IN') {
            persistence.syncGuestProgress(newSession.user.id, (exId, sql, hints) =>
              api.submitSolution(exId, sql, hints)
            ).then((res) => {
              if (res.syncedCount > 0) {
                fetchProfile(newSession.user.id, newSession.user.user_metadata);
              }
            });
          }
        }
      } else if (event === 'SIGNED_OUT') {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  // Iniciar Sesión con Correo y Contraseña
  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setError(null);
    if (!isSupabaseConfigured) {
      // Modo Local Demo
      const demoUser: UserProfile = {
        id: 'local-user',
        username: email.split('@')[0],
        full_name: email.split('@')[0],
        avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${email.split('@')[0]}`,
        total_xp: 50,
        current_level: 1,
        current_streak_days: 1,
        max_streak_days: 1,
        preferred_theme: 'dark',
        created_at: new Date().toISOString(),
      };
      setProfile(demoUser);
      persistence.updateProfile(demoUser.id, demoUser);
      return { success: true };
    }

    const { data, error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      let friendlyMsg = signInError.message;
      const lower = signInError.message.toLowerCase();
      if (lower.includes('invalid login credentials')) {
        friendlyMsg = 'Correo o contraseña incorrectos. Verifica tus credenciales.';
      } else if (lower.includes('email not confirmed')) {
        friendlyMsg = 'Tu cuenta aún no ha sido confirmada. Revisa tu bandeja de entrada o spam para activarla antes de iniciar sesión.';
      }

      setError(friendlyMsg);
      return { success: false, error: friendlyMsg };
    }

    if (data.session && data.user) {
      setSession(data.session);
      setUser(data.user);
      await fetchProfile(data.user.id, data.user.user_metadata);
    }

    return { success: true };
  };

  // Crear Cuenta / Registro
  const signUp = async (
    email: string,
    password: string,
    username: string
  ): Promise<{ success: boolean; error?: string; message?: string; isDemo?: boolean; emailConfirmed?: boolean }> => {
    setError(null);
    if (!isSupabaseConfigured) {
      const demoUser: UserProfile = {
        id: 'local-user',
        username: username.trim() || email.split('@')[0],
        full_name: username.trim(),
        avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${username.trim()}`,
        total_xp: 0,
        current_level: 1,
        current_streak_days: 1,
        max_streak_days: 1,
        preferred_theme: 'dark',
        created_at: new Date().toISOString(),
      };
      setProfile(demoUser);
      persistence.updateProfile(demoUser.id, demoUser);
      return {
        success: true,
        isDemo: true,
        emailConfirmed: true,
        message: 'Cuenta creada en Modo Local.',
      };
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        data: {
          username: username.trim(),
          display_name: username.trim(),
        },
        emailRedirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/#auth-confirm`,
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      return { success: false, error: signUpError.message };
    }

    if (data.session && data.user) {
      setSession(data.session);
      setUser(data.user);
      await fetchProfile(data.user.id, { username, display_name: username });
    }

    const requiresEmailConfirmation = !data.session;

    return {
      success: true,
      isDemo: false,
      emailConfirmed: !requiresEmailConfirmation,
      message: requiresEmailConfirmation
        ? 'Hemos enviado un enlace de confirmación a tu correo.'
        : 'Cuenta creada y activada con éxito.',
    };
  };

  // Cerrar Sesión Real en Supabase y Limpieza Local
  const signOut = async () => {
    setError(null);
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      }
    } catch (err: any) {
      console.warn('Error al cerrar sesión en Supabase:', err);
    }
    setSession(null);
    setUser(null);
    setProfile(null);
    persistence.clearLocalProfile();
  };

  // Recuperar Contraseña
  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string; message?: string; isDemo?: boolean }> => {
    setError(null);
    if (!isSupabaseConfigured) {
      return {
        success: true,
        isDemo: true,
        message: 'Modo demo activo: no se pudo enviar el correo real de Supabase.',
      };
    }

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/#reset-password`,
      });

      if (resetError) {
        setError(resetError.message);
        return { success: false, error: resetError.message };
      }

      return {
        success: true,
        message: 'Hemos enviado un enlace seguro a tu correo para restablecer tu contraseña.',
      };
    } catch (err: any) {
      setError(err.message || 'Error al solicitar restablecimiento de contraseña.');
      return { success: false, error: err.message };
    }
  };

  // Actualizar Contraseña (después de recovery)
  const updatePassword = async (newPassword: string): Promise<{ success: boolean; error?: string }> => {
    setError(null);
    if (!isSupabaseConfigured) {
      return { success: true };
    }

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        setError(updateError.message);
        return { success: false, error: updateError.message };
      }

      return { success: true };
    } catch (err: any) {
      setError(err.message || 'Error al actualizar la contraseña.');
      return { success: false, error: err.message };
    }
  };

  const updateProfileState = useCallback(async (updates: Partial<UserProfile>) => {
    if (!profile) return;
    const updated = { ...profile, ...updates };
    setProfile(updated);
    await persistence.updateProfile(profile.id, updates);
  }, [profile]);

  const value: AuthContextType = useMemo(
    () => ({
      session,
      user,
      profile,
      loading,
      error,
      isAuthenticated: Boolean(user || (!isSupabaseConfigured && profile)),
      isCloudAuth: Boolean(user && isSupabaseConfigured),
      isDemoMode: !isSupabaseConfigured,
      signIn,
      signUp,
      signOut,
      resetPassword,
      updatePassword,
      updateProfile: updateProfileState,
      refreshProfile: () => {
        if (user) fetchProfile(user.id, user.user_metadata);
      },
    }),
    [session, user, profile, loading, error, fetchProfile, updateProfileState]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      session: null,
      user: null,
      profile: null,
      loading: false,
      error: null,
      isAuthenticated: false,
      isCloudAuth: false,
      isDemoMode: true,
      signIn: async () => ({ success: false, error: 'AuthProvider no inicializado' }),
      signUp: async () => ({ success: false, error: 'AuthProvider no inicializado' }),
      signOut: async () => {},
      resetPassword: async () => ({ success: false }),
      updatePassword: async () => ({ success: false }),
      updateProfile: async () => {},
      refreshProfile: () => {},
    };
  }
  return context;
}
