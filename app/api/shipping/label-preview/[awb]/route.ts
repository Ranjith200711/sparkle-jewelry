import { NextRequest } from 'next/server';
import { getDbOrders } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ awb: string }> }
) {
  const { awb } = await params;
  const { searchParams } = new URL(req.url);

  const orders = await getDbOrders();
  const matchedOrder = orders.find(
    (o) => o.awbCode === awb || o.orderNumber === awb || o.id === awb
  );

  const isCod = matchedOrder ? matchedOrder.paymentMethod === 'cod' : searchParams.get('cod') === 'true';
  const amount = matchedOrder ? matchedOrder.totalAmount : (searchParams.get('amount') || '0');
  const customerName = matchedOrder ? matchedOrder.customer.fullName : (searchParams.get('name') || 'Valued Customer');
  const customerPhone = matchedOrder ? matchedOrder.customer.phoneNumber : (searchParams.get('phone') || '+91 98451 23456');
  const city = matchedOrder ? matchedOrder.customer.city : (searchParams.get('city') || 'Karnataka');
  const pincode = matchedOrder ? matchedOrder.customer.pincode : (searchParams.get('pincode') || '574239');
  const address = matchedOrder
    ? `${matchedOrder.customer.addressLine}${matchedOrder.customer.landmark ? `, Near ${matchedOrder.customer.landmark}` : ''}`
    : (searchParams.get('address') || 'Doorstep Address');
  const orderNumber = matchedOrder ? matchedOrder.orderNumber : `SLJ-${awb.slice(-6)}`;
  const courierName = matchedOrder?.courierName || 'Blue Dart Express Air';

  const labelHtml = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Courier Shipping Label - ${awb}</title>
    <style>
      @page { size: 100mm 150mm; margin: 0; }
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        background: #f5f5f5; padding: 20px; margin: 0; color: #000;
      }
      .no-print { max-width: 400px; margin: 0 auto 12px auto; text-align: right; }
      .print-btn {
        background: #111; color: #fff; border: none; padding: 8px 16px;
        font-weight: bold; border-radius: 6px; cursor: pointer; font-size: 12px;
      }
      .label-card {
        background: #fff; width: 380px; margin: auto; border: 2px solid #000;
        padding: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      }
      @media print { body { padding: 0; background: #fff; } .no-print { display: none; } .label-card { border: 2px solid #000; box-shadow: none; width: 100%; } }
      .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #000; padding-bottom: 6px; margin-bottom: 8px; }
      .carrier-name { font-size: 16px; font-weight: 900; letter-spacing: 0.5px; }
      .payment-badge {
        padding: 3px 8px; font-weight: 900; font-size: 13px; border: 2px solid #000;
        background: ${isCod ? '#000; color: #fff;' : '#fff; color: #000;'};
      }
      .barcode-box { text-align: center; margin: 8px 0; padding: 6px; border: 1px dashed #888; background: #fafafa; }
      .barcode-mock { font-family: 'Courier New', monospace; font-size: 26px; font-weight: bold; letter-spacing: 4px; display: block; }
      .section { border-top: 1px solid #000; padding-top: 6px; margin-top: 6px; font-size: 11px; line-height: 1.4; }
      .pincode-highlight { font-size: 18px; font-weight: 900; font-family: monospace; display: inline-block; background: #000; color: #fff; padding: 1px 6px; }
    </style>
  </head>
  <body>
    <div class="no-print">
      <button class="print-btn" onclick="window.print()">🖨️ Print Label</button>
    </div>

    <div class="label-card">
      <div class="header">
        <div class="carrier-name">${courierName}</div>
        <div class="payment-badge">${isCod ? 'CASH ON DELIVERY (COD)' : 'PREPAID'}</div>
      </div>

      <div class="barcode-box">
        <div style="font-size: 9px; color: #666; margin-bottom: 2px;">AIR WAYBILL (AWB) BARCODE</div>
        <span class="barcode-mock">||| |||| || ||||| |||| |||</span>
        <div style="font-family: monospace; font-size: 14px; font-weight: bold; margin-top: 2px;">${awb}</div>
      </div>

      <div class="section">
        <div style="font-size: 9px; text-transform: uppercase; font-weight: bold; color: #555;">DELIVER TO:</div>
        <div style="font-size: 13px; font-weight: bold;">${customerName}</div>
        <div>${address}</div>
        <div>${city} — <span class="pincode-highlight">${pincode}</span></div>
        <div style="margin-top: 2px;"><strong>Contact:</strong> ${customerPhone}</div>
      </div>

      <div class="section" style="display: flex; justify-content: space-between;">
        <div>
          <div style="font-size: 9px; font-weight: bold; color: #555;">ORDER NUMBER:</div>
          <div style="font-weight: bold;">${orderNumber}</div>
        </div>
        <div style="text-align: right;">
          <div style="font-size: 9px; font-weight: bold; color: #555;">COLLECT AMOUNT:</div>
          <div style="font-size: 14px; font-weight: 900; font-family: monospace;">₹${Number(amount).toLocaleString('en-IN')}</div>
        </div>
      </div>

      <div class="section" style="font-size: 10px; color: #444;">
        <div style="font-size: 9px; font-weight: bold; color: #555;">RETURN ADDRESS (IF UNDELIVERED):</div>
        <strong>Sparkle Jewelry</strong> • Opp. KSRTC Bus Stand, Main Road, Sullia, DK, Karnataka - 574239 (Ph: 8921844922)
      </div>
    </div>
  </body>
  </html>
  `;

  return new Response(labelHtml, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
