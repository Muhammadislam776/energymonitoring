import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://qwvajvktwxvbzsheikxj.supabase.co';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF3dmFqdmt0d3h2YnpzaGVpa3hqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEzNzY1NjMsImV4cCI6MjEwNjk1MjU2M30.wNfHgP9Y4duFIGvI7KbvrhaRhCT5tA3QNWSi4vPf5-4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function checkSupabaseStatus(): Promise<{ connected: boolean; info: string }> {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      return { connected: false, info: error.message };
    }
    return { connected: true, info: 'Supabase cloud client initialized successfully' };
  } catch (err: any) {
    return { connected: false, info: err?.message || 'Error connecting to Supabase' };
  }
}
