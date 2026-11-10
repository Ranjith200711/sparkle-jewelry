import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const hasSupabaseUrl = Boolean(process.env.SUPABASE_URL);
  const hasSupabaseKey = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY);

  return NextResponse.json({
    status: 'online',
    service: 'Sparkle Jewelry Sullia Full-Stack API (Next.js + Vercel + Supabase)',
    location: 'Sullia, Dakshina Kannada, Karnataka',
    supabaseConnected: hasSupabaseUrl && hasSupabaseKey,
    timestamp: new Date().toISOString(),
  });
}
