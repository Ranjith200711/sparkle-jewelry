import { NextRequest } from 'next/server';
import { getDbOrderById } from '@/lib/supabaseServer';

export const dynamic = 'force-dynamic';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const order = await getDbOrderById(id);

  if (!order) {
    return new Response('<h3>Order not found. Unable to generate invoice.</h3>', {
      status: 404,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  const itemsHtml = order.items
    .map(
      (item, idx) => `
    <tr>
      <td style="padding: 10px; border-bottom: 1px solid #EAE0D5; text-align: center;">${idx + 1}</td>
      <td style="padding: 10px; border-bottom: 1px solid #EAE0D5;">
        <div style="font-weight: bold; font-size: 13px;">${item.productName || 'Jewellery Item'}</div>
        <div style="font-size: 11px; color: #7A5B40;">${(item.category || 'Jewellery').replace('-', ' ').toUpperCase()} ${item.selectedSize ? `• Size: ${item.selectedSize}` : ''}</div>
      </td>
      <td style="padding: 10px; border-bottom: 1px solid #EAE0D5; text-align: center; font-family: monospace;">${item.quantity || 1}</td>
      <td style="padding: 10px; border-bottom: 1px solid #EAE0D5; text-align: right; font-family: monospace;">₹${Number(item.price || 0).toLocaleString('en-IN')}</td>
      <td style="padding: 10px; border-bottom: 1px solid #EAE0D5; text-align: right; font-weight: bold; font-family: monospace;">₹${(Number(item.price || 0) * Number(item.quantity || 1)).toLocaleString('en-IN')}</td>
    </tr>
  `
    )
    .join('');

  const invoiceNumber = `INV-${new Date(order.createdAt).getFullYear()}-${order.orderNumber.replace(/\D/g, '') || '1001'}`;
  const invoiceDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const invoiceHtml = `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Tax Invoice - ${invoiceNumber}</title>
    <style>
      @page { size: A4; margin: 15mm; }
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        color: #1E130C; background: #fff; padding: 30px; max-width: 720px; margin: auto;
      }
      .no-print { margin-bottom: 15px; text-align: right; }
      .print-btn {
        background: #1E130C; color: #fff; padding: 8px 16px; font-size: 12px; font-weight: bold;
        border: none; border-radius: 6px; cursor: pointer;
      }
      @media print { body { padding: 0; } .no-print { display: none; } }
      .header-table { width: 100%; border-bottom: 2px solid #C68A4C; padding-bottom: 16px; margin-bottom: 20px; }
      .brand-title { font-family: Georgia, serif; font-size: 26px; font-weight: bold; color: #1E130C; margin: 0; }
      .brand-subtitle { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #C68A4C; font-weight: bold; margin-top: 4px; }
      .badge-tax { display: inline-block; background: #FAF4EB; border: 1px solid #EAE0D5; padding: 4px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; color: #7A5B40; }
      .details-grid { width: 100%; margin-bottom: 24px; font-size: 12px; line-height: 1.6; }
      .box { background: #FAF8F5; border: 1px solid #EAE0D5; border-radius: 8px; padding: 12px 14px; }
      .items-table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px; }
      .items-table th { background: #FAF4EB; color: #7A5B40; text-transform: uppercase; font-size: 10px; letter-spacing: 1px; padding: 10px; border-bottom: 2px solid #EAE0D5; text-align: left; }
      .totals-box { width: 280px; margin-left: auto; margin-bottom: 24px; font-size: 12px; line-height: 1.8; }
      .warranty-box { background: #FFF9F2; border: 1px dashed #C68A4C; border-radius: 8px; padding: 12px; text-align: center; margin-bottom: 20px; font-size: 11px; }
      .footer { text-align: center; font-size: 11px; color: #888; border-top: 1px solid #eee; padding-top: 15px; }
    </style>
  </head>
  <body>
    <div class="no-print">
      <button class="print-btn" onclick="window.print()">🖨️ Print Tax Invoice</button>
    </div>

    <table class="header-table">
      <tr>
        <td style="vertical-align: top;">
          <div class="brand-title">Sparkle Jewelry</div>
          <div class="brand-subtitle">1-Gram Micro Gold & 18K Anti-Tarnish</div>
          <div style="font-size: 11px; color: #666; margin-top: 6px;">
            Sullia Centre Complex, Opp. KSRTC Bus Stand, Main Road<br/>
            Sullia, Dakshina Kannada, Karnataka — 574239<br/>
            Phone: +91 89218 44922 | GSTIN: 29AABCS1429B1Z8
          </div>
        </td>
        <td style="vertical-align: top; text-align: right;">
          <div class="badge-tax">RETAIL TAX INVOICE</div>
          <div style="font-size: 12px; margin-top: 8px;"><strong>Invoice No:</strong> ${invoiceNumber}</div>
          <div style="font-size: 12px;"><strong>Order ID:</strong> ${order.orderNumber}</div>
          <div style="font-size: 12px;"><strong>Date:</strong> ${invoiceDate}</div>
        </td>
      </tr>
    </table>

    <table class="details-grid">
      <tr>
        <td style="width: 50%; vertical-align: top; padding-right: 10px;">
          <div class="box">
            <strong style="color: #7A5B40; text-transform: uppercase; font-size: 10px; letter-spacing: 1px;">Billed To / Delivery Address:</strong><br/>
            <strong>${order.customer.fullName}</strong><br/>
            ${order.customer.addressLine}<br/>
            ${order.customer.landmark ? `Landmark: ${order.customer.landmark}<br/>` : ''}
            ${order.customer.city}, ${order.customer.state} — <strong>${order.customer.pincode}</strong><br/>
            📞 ${order.customer.phoneNumber}
          </div>
        </td>
        <td style="width: 50%; vertical-align: top; padding-left: 10px;">
          <div class="box">
            <strong style="color: #7A5B40; text-transform: uppercase; font-size: 10px; letter-spacing: 1px;">Dispatch & Payment Details:</strong><br/>
            <strong>Payment Mode:</strong> ${order.paymentMethod.toUpperCase()} (${order.paymentStatus === 'completed' ? 'PAID ONLINE' : 'CASH ON DELIVERY'})<br/>
            <strong>Delivery Zone:</strong> ${order.deliveryZone === 'local_sullia' ? 'Sullia Town (Doorstep Same-Day)' : 'Karnataka Regional / National'}<br/>
            <strong>Carrier:</strong> ${order.courierName || 'Local Rider'}<br/>
            ${order.awbCode ? `<strong>AWB Tracking:</strong> ${order.awbCode}<br/>` : ''}
            ${order.otpCode ? `<strong>Doorstep OTP:</strong> ${order.otpCode}` : ''}
          </div>
        </td>
      </tr>
    </table>

    <table class="items-table">
      <thead>
        <tr>
          <th style="width: 40px; text-align: center;">#</th>
          <th>Description of Jewellery</th>
          <th style="width: 60px; text-align: center;">Qty</th>
          <th style="width: 90px; text-align: right;">Unit Price</th>
          <th style="width: 100px; text-align: right;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <div class="totals-box">
      <div style="display: flex; justify-content: space-between;">
        <span>Subtotal:</span>
        <span style="font-family: monospace;">₹${Number(order.subtotal).toLocaleString('en-IN')}</span>
      </div>
      <div style="display: flex; justify-content: space-between;">
        <span>Delivery Fee:</span>
        <span>${order.shippingFee === 0 ? 'FREE' : `₹${order.shippingFee}`}</span>
      </div>
      <div style="display: flex; justify-content: space-between; font-size: 10px; color: #777;">
        <span>GST Included (3%):</span>
        <span style="font-family: monospace;">₹${Math.round(order.subtotal * 0.03).toLocaleString('en-IN')}</span>
      </div>
      <div style="display: flex; justify-content: space-between; font-weight: bold; font-size: 15px; border-top: 2px solid #1E130C; padding-top: 6px; margin-top: 6px;">
        <span>Total Payable:</span>
        <span style="font-family: monospace;">₹${Number(order.totalAmount).toLocaleString('en-IN')}</span>
      </div>
    </div>

    <div class="warranty-box">
      <strong style="color: #7A5B40; font-size: 13px;">💎 Authentic Quality Inspection Certificate 💎</strong><br/>
      <span style="color: #444; margin-top: 4px; display: inline-block;">
        Every jewellery piece is crafted with hallmark-finish micro gold plating or 18K PVD anti-tarnish coating.
        Please keep away from direct perfumes & harsh moisture to preserve authentic shine.
      </span>
    </div>

    <div class="footer">
      <strong>Sparkle Jewelry • Sullia, Dakshina Kannada, Karnataka</strong><br/>
      For customer support or WhatsApp orders: +91 89218 44922 • Thank you for shopping with us!
    </div>
  </body>
  </html>
  `;

  return new Response(invoiceHtml, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
