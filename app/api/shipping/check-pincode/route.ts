import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { pincode } = await req.json();
    const cleanPin = String(pincode || '').trim();

    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();

    if (cleanPin === '574239') {
      const isBefore7PM = currentHour < 19;
      const remainingHours = 18 - currentHour;
      const deliveryDateStr = isBefore7PM
        ? 'TODAY (Within 2–4 Hours)'
        : 'Tomorrow Morning (by 11:00 AM)';

      return NextResponse.json({
        success: true,
        data: {
          pincode: cleanPin,
          isServiceable: true,
          zone: 'local_sullia',
          estimatedDeliveryTime: deliveryDateStr,
          deliveryDateStr,
          dispatchNotice: '⚡ Direct Doorstep Delivery from Sullia Counter',
          cutoffUrgency: isBefore7PM
            ? `Order within ${remainingHours}h ${60 - currentMinutes}m for delivery today`
            : 'Dispatches tomorrow morning at 9:30 AM',
          safetyBufferDays: 0,
          shippingFee: 30,
          freeShippingAbove: 499,
          deliveryMethod: 'local_rider',
          couriersAvailable: ['Local Sullia Shop Rider', 'Express Auto Delivery'],
        },
      });
    }

    // Regional Karnataka vs National
    const isNearby = cleanPin.startsWith('574') || cleanPin.startsWith('575') || cleanPin.startsWith('571');
    const isKarnataka = isNearby || cleanPin.startsWith('56') || cleanPin.startsWith('57') || cleanPin.startsWith('58');

    const transitDays = isNearby ? 1 : isKarnataka ? 2 : 3;
    const arrivalDate = new Date(now);
    arrivalDate.setDate(arrivalDate.getDate() + transitDays);

    const dayName = arrivalDate.toLocaleDateString('en-IN', { weekday: 'short' });
    const monthName = arrivalDate.toLocaleDateString('en-IN', { month: 'short' });
    const dateNum = arrivalDate.getDate();
    const deliveryDateStr = `${dayName}, ${dateNum} ${monthName}`;

    return NextResponse.json({
      success: true,
      data: {
        pincode: cleanPin,
        isServiceable: true,
        zone: isKarnataka ? 'regional_karnataka' : 'national',
        estimatedDeliveryTime: `Delivery by ${deliveryDateStr}`,
        deliveryDateStr,
        dispatchNotice: isKarnataka ? '📦 Dispatched from Sullia via Express Courier' : '✈️ Dispatched via National Air Cargo',
        cutoffUrgency: 'Order before 5:00 PM for same-day handover',
        safetyBufferDays: 1,
        shippingFee: isKarnataka ? 60 : 80,
        freeShippingAbove: 999,
        deliveryMethod: 'shiprocket_courier',
        couriersAvailable: ['Blue Dart Air', 'Delhivery Surface', 'DTDC Express', 'Ekart Logistics'],
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
