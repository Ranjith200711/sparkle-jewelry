import { NextResponse } from 'next/server';
import { getSupabase, getResolvedSupabaseConfig } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

export async function GET() {
  const config = getResolvedSupabaseConfig();
  const hasSupabaseUrl = Boolean(config.url);
  const activeKeyPreview = config.key
    ? `${config.key.slice(0, 6)}...${config.key.slice(-4)}`
    : 'none';
  const activeKeyLength = config.key.length;

  let queryStatus = 'untested';
  let queryError: string | null = null;
  let productCount = 0;
  let sampleProducts: any[] = [];

  try {
    const sb = getSupabase();
    if (sb) {
      const { data, error } = await sb
        .from('products')
        .select('id, name, price')
        .limit(5);

      if (error) {
        queryStatus = 'error';
        queryError = error.message;
      } else {
        queryStatus = 'success';
        productCount = data?.length || 0;
        sampleProducts = data || [];
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
    supabase: {
      hasUrl: hasSupabaseUrl,
      activeKeyPreview,
      activeKeyLength,
      queryStatus,
      queryError,
      productCount,
      sampleProducts,
    },
    env: {
      hasServiceKey: Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY),
      hasAnonKey: Boolean(process.env.SUPABASE_ANON_KEY),
      hasNextPublicAnonKey: Boolean(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
    },
    timestamp: new Date().toISOString(),
  });
}
