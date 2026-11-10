import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

let razorpayConfig = {
  keyId: process.env.RAZORPAY_KEY_ID || '',
  mode: process.env.RAZORPAY_KEY_ID?.startsWith('rzp_live') ? 'live' : 'test',
  isLive: Boolean(process.env.RAZORPAY_KEY_ID?.startsWith('rzp_live')),
};

export async function GET() {
  return NextResponse.json({ success: true, data: razorpayConfig });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    razorpayConfig = {
      ...razorpayConfig,
      keyId: body.keyId || razorpayConfig.keyId,
      mode: body.mode || (body.keyId?.startsWith('rzp_live') ? 'live' : 'test'),
      isLive: Boolean(body.keyId?.startsWith('rzp_live')),
    };
    return NextResponse.json({ success: true, message: 'Razorpay configuration saved', data: razorpayConfig });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
