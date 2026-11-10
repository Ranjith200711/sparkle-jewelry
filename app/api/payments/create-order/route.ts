import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { amount, receipt } = await req.json();
    const numAmount = Number(amount);

    if (!numAmount || numAmount <= 0) {
      return NextResponse.json(
        { success: false, message: 'Invalid payment amount.' },
        { status: 400 }
      );
    }

    const keyId = process.env.RAZORPAY_KEY_ID?.trim();
    const keySecret = process.env.RAZORPAY_KEY_SECRET?.trim();
    const isLive = Boolean(keyId && keySecret && keyId.startsWith('rzp_live_'));

    // If live credentials are provided, call Razorpay REST API
    if (isLive && keyId && keySecret) {
      try {
        const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
        const res = await fetch('https://api.razorpay.com/v1/orders', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Basic ${auth}`,
          },
          body: JSON.stringify({
            amount: Math.round(numAmount * 100),
            currency: 'INR',
            receipt: (receipt || `rcpt_${Date.now()}`).slice(0, 40),
            notes: { store: 'Sparkle Jewelry Sullia' },
          }),
        });

        if (res.ok) {
          const order = await res.json();
          return NextResponse.json({
            success: true,
            isLive: true,
            orderId: order.id,
            amount: numAmount,
            currency: 'INR',
            keyId,
          });
        }
      } catch (e) {
        console.warn('Razorpay live order failed, falling back to test:', e);
      }
    }

    // Test / Simulation Mode
    return NextResponse.json({
      success: true,
      isLive: false,
      isSimulation: true,
      orderId: `order_test_${Date.now()}`,
      amount: numAmount,
      currency: 'INR',
      keyId: keyId || 'rzp_test_sparkle_demo',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
