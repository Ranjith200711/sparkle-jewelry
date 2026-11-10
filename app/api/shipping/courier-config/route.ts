import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

let courierConfig = {
  email: 'demo@sulliajewellery.com',
  pickupLocation: 'Primary',
  mode: 'test',
  isConfigured: true,
};

export async function GET() {
  return NextResponse.json({ success: true, data: courierConfig });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    courierConfig = {
      ...courierConfig,
      ...body,
      isConfigured: Boolean(body.email),
    };
    return NextResponse.json({ success: true, message: 'Courier configuration saved', data: courierConfig });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
