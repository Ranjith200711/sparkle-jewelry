import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    status: 'online',
    service: 'Sparkle Jewelry Sullia Full-Stack API (Next.js + Vercel + Supabase)',
    location: 'Sullia, Dakshina Kannada, Karnataka',
    timestamp: new Date().toISOString(),
  });
}
