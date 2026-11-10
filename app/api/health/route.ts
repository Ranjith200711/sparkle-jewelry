import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const hasSupabaseUrl = Boolean(process.env.SUPABASE_URL);
  const hasServiceKey = Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const hasAnonKey = Boolean(process.env.SUPABASE_ANON_KEY);

  let queryStatus = 'untested';
  let queryError: string | null = null;
  let productCount = 0;

  try {
    const { getSupabase } = await import('@/lib/supabaseServer');
    const sb = getSupabase();
    if (sb) {
      const { data, error } = await sb.from('products').select('id').limit(5);
      if (error) {
        queryStatus = 'error';
        queryError = error.message;
      } else {
        queryStatus = 'success';
        productCount = data?.length || 0;
      }
    } else {
      queryStatus = 'no_client';
    }
  } catch (e: any) {
    queryStatus = 'exception';
    queryError = e.message;
  }

  return NextResponse.json({
    status: 'online',
    service: 'Sparkle Jewelry Sullia Full-Stack API',
    env: {
      hasSupabaseUrl,
      hasServiceKey,
      hasAnonKey,
    },
    database: {
      queryStatus,
      queryError,
      productCount,
    },
    timestamp: new Date().toISOString(),
  });
}
