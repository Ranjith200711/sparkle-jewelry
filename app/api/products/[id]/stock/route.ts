import { NextRequest, NextResponse } from 'next/server';
import { updateDbProductStock } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { inStock } = await req.json();
    const updated = await updateDbProductStock(id, Boolean(inStock));
    return NextResponse.json({ success: updated, inStock });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
