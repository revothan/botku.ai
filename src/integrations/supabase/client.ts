import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://wssgzuhdbtcrxrxojsfq.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indzc2d6dWhkYnRjcnhyeG9qc2ZxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM2MDI3NjMsImV4cCI6MjA0OTE3ODc2M30.LboN0ORnD6kNhI7KcBXy9jtv7jmHONyJv18HtUj1A7c";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    flowType: 'pkce'
  },
  global: {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  }
});