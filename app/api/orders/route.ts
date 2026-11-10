import { NextRequest, NextResponse } from 'next/server';
import { getDbOrders, createDbOrder } from '@/lib/supabaseServer';
import { Order, DeliveryZone } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const orders = await getDbOrders();
    return NextResponse.json({ success: true, data: orders });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { customer, items, paymentMethod, notes } = body;

    if (!customer || !customer.fullName || !customer.phoneNumber || !customer.pincode) {
      return NextResponse.json(
        { success: false, message: 'Customer name, phone, and pincode are required' },
        { status: 400 }
      );
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Order must contain at least one item' },
        { status: 400 }
      );
    }

    const cleanPin = String(customer.pincode).trim();
    const subtotal = items.reduce(
      (sum: number, item: any) => sum + Number(item.price) * Number(item.quantity),
      0
    );

    // Delivery Zone & Logistics Calculation
    const isSulliaLocal = cleanPin === '574239';
    let zone: DeliveryZone = 'national';
    let shippingFee = 60;
    let freeShippingAbove = 999;
    let shipmentMethod: 'local_rider' | 'shiprocket_courier' = 'shiprocket_courier';
    let estimatedTime = '2–3 Business Days';

    if (isSulliaLocal) {
      zone = 'local_sullia';
      shippingFee = 30;
      freeShippingAbove = 499;
      shipmentMethod = 'local_rider';
      estimatedTime = 'TODAY (Within 2–4 Hours)';
    } else if (cleanPin.startsWith('57') || cleanPin.startsWith('56') || cleanPin.startsWith('58')) {
      zone = 'regional_karnataka';
      shippingFee = 60;
      freeShippingAbove = 999;
      shipmentMethod = 'shiprocket_courier';
      estimatedTime = '2–3 Business Days (Express Air/Surface)';
    }

    const finalShippingFee = subtotal >= freeShippingAbove ? 0 : shippingFee;
    const totalAmount = subtotal + finalShippingFee;

    const orderNumber = `SLJ-${Date.now().toString().slice(-6)}`;
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();

    const newOrder: Order = {
      id: body.id || `order-${Date.now()}`,
      orderNumber,
      customer: {
        fullName: customer.fullName.trim(),
        phoneNumber: customer.phoneNumber.trim(),
        addressLine: customer.addressLine || '',
        landmark: customer.landmark || '',
        city: customer.city || (isSulliaLocal ? 'Sullia' : 'Karnataka'),
        state: customer.state || 'Karnataka',
        pincode: cleanPin,
      },
      items,
      subtotal,
      shippingFee: finalShippingFee,
      totalAmount,
      paymentMethod: paymentMethod || 'cod',
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'completed',
      status: 'confirmed',
      deliveryZone: zone,
      shipmentMethod,
      courierName: isSulliaLocal ? 'Local Sullia Shop Rider' : undefined,
      otpCode,
      notes: notes || (isSulliaLocal ? 'Same-day 2–4 Hr doorstep delivery with rider' : estimatedTime),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const saved = await createDbOrder(newOrder);
    return NextResponse.json({ success: true, data: saved }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to create order' },
      { status: 500 }
    );
  }
}
