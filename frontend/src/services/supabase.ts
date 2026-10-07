import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL || 'https://qwvajvktwxvbzsheikxj.supabase.co';
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3dmFqdmt0d3h2YnpzaGVpa3hqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEzNzY1NjMsImV4cCI6MjEwNjk1MjU2M30.wNfHgP9Y4duFIGvI7KbvrhaRhCT5tA3QNWSi4vPf5-4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Check connectivity to Supabase project
 */
export async function testSupabaseConnection(): Promise<{ connected: boolean; message: string }> {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      return { connected: false, message: error.message };
    }
    return { connected: true, message: 'Connected to Supabase project (qwvajvktwxvbzsheikxj)' };
  } catch (err: any) {
    return { connected: false, message: err?.message || 'Connection failed' };
  }
}
