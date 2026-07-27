import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://pfnlqldjyhprbstxrdqi.supabase.co';
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBmbmxxbGRqeWhwcmJzdHhyZHFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODEyNDY0MjUsImV4cCI6MjA5NjgyMjQyNX0.NbJf2C6Xt05GMohGYVHVF9J7xSijdt32XFPPhnDPBUM';
    
    try {
      const supabase = createClient(supabaseUrl, supabaseAnonKey);
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (!error && data.session) {
        const accessToken = data.session.access_token;
        const refreshToken = data.session.refresh_token;
        
        // Forward tokens directly in hash fragment so client page receives and logs in instantly
        const redirectUrl = `${origin}${next}#access_token=${accessToken}&refresh_token=${refreshToken}`;
        return NextResponse.redirect(redirectUrl);
      }
    } catch (err) {
      console.error('Callback error:', err);
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
