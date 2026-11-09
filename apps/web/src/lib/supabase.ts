import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

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

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);
