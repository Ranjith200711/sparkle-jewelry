import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const ADMIN_PIN = process.env.ADMIN_SECRET_KEY || '8921';

export async function POST(req: NextRequest) {
  try {
    const { pin } = await req.json();

    if (!pin || pin.trim() !== ADMIN_PIN.trim()) {
      return NextResponse.json(
        { success: false, message: 'Incorrect Owner Security PIN.' },
        { status: 401 }
      );
    }

    const token = `sparkle_owner_jwt_${Date.now()}_auth_sullia_vault`;
    return NextResponse.json({
      success: true,
      token,
      message: 'Owner authenticated successfully',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
