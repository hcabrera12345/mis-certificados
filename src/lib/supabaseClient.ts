import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(
  supabaseUrl || 'https://pfnlqldjyhprbstxrdqi.supabase.co',
  supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmbmxxbGRqeWhwcmJzdHhyZHFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyNDY0MjUsImV4cCI6MjA5NjgyMjQyNX0.NbJf2C6Xt05GMohGYVHVF9J7xSijdt32XFPPhnDPBUM',
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'implicit'
    }
  }
);
