import { useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { UserProfile } from '@/types';

const DEMO_PROFILE: UserProfile = {
  id: 'demo-student-001',
  username: 'erick_dev',
  full_name: 'Erick Developer',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
  total_xp: 1450,
  current_level: 4,
  current_streak_days: 7,
  max_streak_days: 14,
  preferred_theme: 'dark',
  created_at: new Date().toISOString(),
};

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(isSupabaseConfigured ? null : DEMO_PROFILE);
  const [loading, setLoading] = useState(isSupabaseConfigured);
  const [error, setError] = useState<string | null>(null);

  const fetchProfile = useCallback(async (userId: string) => {
    try {
      const { data, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.warn('No se pudo cargar el perfil de Supabase, usando valores iniciales:', profileError.message);
        return;
      }
      if (data) {
        setProfile(data as UserProfile);
      }
    } catch (err: any) {
      console.error('Error al obtener perfil:', err);
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
        fetchProfile(currentSession.user.id);
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
        fetchProfile(newSession.user.id);
      } else {
        setProfile(null);
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
      // Modo demo local
      setProfile(DEMO_PROFILE);
      return { success: true };
    }
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    if (signInError) {
      setError(signInError.message);
      return { success: false, error: signInError.message };
    }
    return { success: true };
  };

  const signUp = async (email: string, password: string, username: string): Promise<{ success: boolean; error?: string }> => {
    setError(null);
    if (!isSupabaseConfigured) {
      setProfile({ ...DEMO_PROFILE, username });
      return { success: true };
    }
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username },
      },
    });
    if (signUpError) {
      setError(signUpError.message);
      return { success: false, error: signUpError.message };
    }
    return { success: true };
  };

  const signOut = async () => {
    setError(null);
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    }
    setSession(null);
    setUser(null);
    setProfile(null);
  };

  return {
    session,
    user,
    profile,
    loading,
    error,
    isDemoMode: !isSupabaseConfigured,
    signIn,
    signUp,
    signOut,
  };
}
