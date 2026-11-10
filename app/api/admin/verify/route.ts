import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (auth && auth.startsWith('Bearer sparkle_owner_jwt_')) {
    return NextResponse.json({ success: true, verified: true });
  }
  return NextResponse.json({ success: false, verified: false }, { status: 401 });
}
