import { NextResponse } from 'next/server';
import { getSupabase, getResolvedSupabaseConfig } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

export async function GET() {
  const config = getResolvedSupabaseConfig();
  const hasSupabaseUrl = Boolean(config.url);
  const hasSupabaseKey = Boolean(config.key);

  let databaseStatus = 'disconnected';
  let productCount = 0;

  try {
    const sb = getSupabase();
    if (sb) {
      const { data, error } = await sb
        .from('products')
        .select('id')
        .limit(5);

      if (!error && data) {
        databaseStatus = 'connected';
        productCount = data.length;
      }
    }
  } catch (e: any) {
    databaseStatus = 'error';
  }

  return NextResponse.json({
    status: 'online',
    service: 'Sparkle Jewelry Sullia API',
    database: databaseStatus,
    healthy: hasSupabaseUrl && hasSupabaseKey && databaseStatus === 'connected',
    timestamp: new Date().toISOString(),
  });
}
