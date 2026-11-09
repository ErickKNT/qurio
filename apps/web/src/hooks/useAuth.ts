import { useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { UserProfile } from '@/types';
import { persistence } from '@/lib/persistence';

const DEMO_PROFILE: UserProfile = {
  id: 'demo-student-001',
  username: 'erick_dev',
  full_name: 'Erick Developer',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
  total_xp: 480,
  current_level: 2,
  current_streak_days: 2,
  max_streak_days: 5,
  preferred_theme: 'dark',
  created_at: new Date().toISOString(),
};

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(() => {
    // Si no está configurado Supabase, inicializar con demo profile fusionado con local
    const local = persistence.getLocalProfile();
    return { ...DEMO_PROFILE, ...local };
  });
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async (userId: string, userMetadata?: Record<string, any>) => {
    try {
      const { data, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (data) {
        setProfile({
          id: data.id,
          username: data.username || data.display_name || 'Estudiante',
          full_name: data.display_name || data.username,
          avatar_url: data.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop',
          total_xp: data.xp ?? 0,
          current_level: data.level ?? 1,
          current_streak_days: data.current_streak_days ?? 0,
          max_streak_days: data.max_streak_days ?? 0,
          preferred_theme: 'dark',
          created_at: data.created_at,
        });
        return;
      }

      // Si el perfil no existe aún en user_profiles, insertarlo con metadatos de auth
      if (profileError || !data) {
        const username = userMetadata?.username || `user_${userId.substring(0, 8)}`;
        const displayName = userMetadata?.display_name || username;
        const avatarUrl = userMetadata?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop';

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

        const { data: created, error: createError } = await supabase
          .from('user_profiles')
          .insert(newProfileData)
          .select()
          .maybeSingle();

        if (!createError && created) {
          setProfile({
            id: created.id,
            username: created.username,
            full_name: created.display_name,
            avatar_url: created.avatar_url,
            total_xp: created.xp,
            current_level: created.level,
            current_streak_days: created.current_streak_days,
            max_streak_days: created.max_streak_days,
            preferred_theme: 'dark',
            created_at: created.created_at,
          });
        }
      }
    } catch (err: any) {
      console.warn('Error al obtener perfil de user_profiles:', err);
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    // 1. Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session: currentSession }, error: sessionError }) => {
      if (sessionError) {
        setError(sessionError.message);
      }
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      if (currentSession?.user) {
        fetchProfile(currentSession.user.id, currentSession.user.user_metadata);
      }
      setLoading(false);
    });

    // 2. Suscribirse a cambios de estado de autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(newSession?.user ?? null);
      if (newSession?.user) {
        fetchProfile(newSession.user.id, newSession.user.user_metadata);
      } else {
        // Al cerrar sesión, volver al demo profile local
        const local = persistence.getLocalProfile();
        setProfile({ ...DEMO_PROFILE, ...local });
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setError(null);
    if (!isSupabaseConfigured) {
      // Modo demo local: simular inicio de sesión
      const demoUser = {
        ...DEMO_PROFILE,
        username: email.split('@')[0],
      };
      setProfile(demoUser);
      persistence.updateProfile(demoUser.id, demoUser);
      return { success: true };
    }

    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError(signInError.message);
      return { success: false, error: signInError.message };
    }

    if (data.user) {
      await fetchProfile(data.user.id, data.user.user_metadata);
    }
    return { success: true };
  };

  const signUp = async (
    email: string,
    password: string,
    username: string
  ): Promise<{ success: boolean; error?: string; message?: string }> => {
    setError(null);
    if (!isSupabaseConfigured) {
      const demoUser = {
        ...DEMO_PROFILE,
        username: username.trim() || email.split('@')[0],
      };
      setProfile(demoUser);
      persistence.updateProfile(demoUser.id, demoUser);
      return { success: true };
    }

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
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

    if (data.user) {
      await fetchProfile(data.user.id, { username, display_name: username });
    }

    return {
      success: true,
      message: data.session ? undefined : 'Revisa tu correo para confirmar tu cuenta.',
    };
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string; message?: string }> => {
    setError(null);
    if (!isSupabaseConfigured) {
      return {
        success: true,
        message: 'Enlace simulado enviado (modo demo local). Revisa tu bandeja de entrada.',
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

  const signOut = async () => {
    setError(null);
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('Error al hacer sign out:', e);
      }
    }
    setSession(null);
    setUser(null);
    setProfile(DEMO_PROFILE);
  };

  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    if (!profile) return;
    const updated = { ...profile, ...updates };
    setProfile(updated);
    await persistence.updateProfile(profile.id, updates);
  }, [profile]);

  return {
    session,
    user,
    profile,
    loading,
    error,
    isAuthenticated: !!user || !isSupabaseConfigured,
    isCloudAuth: !!user && isSupabaseConfigured,
    isDemoMode: !isSupabaseConfigured,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    refreshProfile: () => {
      if (user) fetchProfile(user.id, user.user_metadata);
    },
  };
}
