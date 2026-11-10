import { NextRequest, NextResponse } from 'next/server';
import { getDbOrderById, updateDbOrderPickup } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { dispatchType, courierPreference } = body;

    const order = await getDbOrderById(id);
    if (!order) {
      return NextResponse.json({ success: false, message: 'Order not found' }, { status: 404 });
    }

    const isLocal = dispatchType === 'local_rider' || order.deliveryZone === 'local_sullia' || order.customer.pincode === '574239';

    if (isLocal) {
      await updateDbOrderPickup(id, {
        status: 'packed',
        courierName: 'Local Sullia Shop Rider',
        notes: `Rider Assigned. Doorstep OTP: ${order.otpCode || '4821'}`,
      });

      const whatsappText = encodeURIComponent(
        `Hi ${order.customer.fullName}! ✨ Your Sparkle Jewelry order #${order.orderNumber} (₹${order.totalAmount}) is on the way with our Sullia shop delivery rider! Delivery Address: ${order.customer.addressLine}. Amount: ₹${order.totalAmount} (${order.paymentMethod.toUpperCase()}). Your Doorstep Verification OTP: ${order.otpCode || '4821'}.`
      );

      return NextResponse.json({
        success: true,
        courierName: 'Local Sullia Shop Rider',
        isLocalDelivery: true,
        whatsappDispatchUrl: `https://wa.me/91${order.customer.phoneNumber.replace(/\D/g, '')}?text=${whatsappText}`,
      });
    }

    // Outstation Courier Dispatch
    const carrierName = courierPreference || 'Blue Dart Express Air';
    const fakeAwb = `SFX${Math.floor(100000000 + Math.random() * 900000000)}`;
    const trackingUrl = `https://shiprocket.co/tracking/${fakeAwb}`;

    await updateDbOrderPickup(id, {
      status: 'packed',
      courierName: carrierName,
      awbCode: fakeAwb,
      trackingUrl,
      notes: `Dispatched via ${carrierName}. AWB: ${fakeAwb}`,
    });

    const courierWhatsappText = encodeURIComponent(
      `Hi ${order.customer.fullName}! ✨ Your Sparkle Jewelry order #${order.orderNumber} is packed and ready for pickup via ${carrierName}! Tracking AWB: ${fakeAwb}. Track parcel: ${trackingUrl}. Thank you for shopping with Sparkle Jewelry Sullia!`
    );

    return NextResponse.json({
      success: true,
      courierName: carrierName,
      awbCode: fakeAwb,
      trackingUrl,
      freightCharge: 48,
      whatsappDispatchUrl: `https://wa.me/91${order.customer.phoneNumber.replace(/\D/g, '')}?text=${courierWhatsappText}`,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
