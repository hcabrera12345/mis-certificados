import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pfnlqldjyhprbstxrdqi.supabase.co';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmbmxxbGRqeWhwcmJzdHhyZHFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyNDY0MjUsImV4cCI6MjA5NjgyMjQyNX0.NbJf2C6Xt05GMohGYVHVF9J7xSijdt32XFPPhnDPBUM';
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && data.session) {
      const response = NextResponse.redirect(`${origin}${next}`);
      
      response.cookies.set('sb-pfnlqldjyhprbstxrdqi-auth-token', JSON.stringify(data.session), {
        path: '/',
        maxAge: 60 * 60 * 24 * 7,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production'
      });
      
      return response;
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
