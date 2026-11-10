import { NextRequest, NextResponse } from 'next/server';
import { updateDbOrderStatus } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status } = await req.json();
    const updated = await updateDbOrderStatus(id, status);
    return NextResponse.json({ success: updated, status });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
