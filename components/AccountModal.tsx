'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  X,
  User,
  Package,
  MessageCircle,
  ShieldCheck,
  ArrowRight,
  Search,
  Heart,
  RefreshCw,
  CheckCircle2,
  Clock,
  Truck,
  MapPin,
  Phone,
  Copy,
  Check,
  ExternalLink,
  ShoppingBag,
  Sparkles,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Printer,
  Receipt,
  FileText
} from 'lucide-react';
import { Order, OrderStatus } from '../types';
import { searchCustomerOrders, fetchOrderById } from '../lib/api';
import { useCustomerOrders, saveCustomerOrder } from '../lib/customerOrders';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenWishlist?: () => void;
  wishlistCount?: number;
}

export default function AccountModal({
  isOpen,
  onClose,
  onOpenWishlist,
  wishlistCount = 0,
}: AccountModalProps) {
  const { orders, loading: ordersLoading, refreshOrders } = useCustomerOrders();
  const [activeTab, setActiveTab] = useState<'orders' | 'track' | 'address'>('orders');

  // Tracking tab state
  const [trackQuery, setTrackQuery] = useState('');
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackResults, setTrackResults] = useState<Order[] | null>(null);
  const [trackSearched, setTrackSearched] = useState(false);

  // Address tab state
  const [savedAddress, setSavedAddress] = useState({
    fullName: '',
    phoneNumber: '',
    addressLine: '',
    landmark: '',
    pincode: '574239',
  });
  const [addressSavedNotice, setAddressSavedNotice] = useState(false);

  // Copied feedback
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Expanded order details state
  const [expandedOrders, setExpandedOrders] = useState<Record<string, boolean>>({});

  const toggleExpandOrder = (orderId: string) => {
    setExpandedOrders((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  };

  // Load saved address on open
  useEffect(() => {
    if (typeof window !== 'undefined' && isOpen) {
      try {
        const raw = localStorage.getItem('sullia_saved_address');
        if (raw) {
          const parsed = JSON.parse(raw);
          setSavedAddress((prev) => ({ ...prev, ...parsed }));
        }
      } catch {}
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    if (typeof navigator !== 'undefined') {
      navigator.clipboard.writeText(text);
      setCopiedText(text);
      setTimeout(() => setCopiedText(null), 2000);
    }
  };

  const handlePrintReceipt = (order: Order) => {
    if (typeof window === 'undefined') return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const isLocal = order.deliveryZone === 'local_sullia' || order.customer.pincode === '574239';

    const itemsHtml = order.items
      .map(
        (i) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #EFE5D8;">
          <div style="font-weight: bold; font-size: 13px;">${i.productName}</div>
          <div style="font-size: 11px; color: #7A5B40;">${i.category || '1-Gram Gold'} ${i.selectedSize ? `• Size: ${i.selectedSize}` : ''}</div>
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #EFE5D8; text-align: center;">${i.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #EFE5D8; text-align: right;">₹${i.price.toLocaleString('en-IN')}</td>
        <td style="padding: 10px; border-bottom: 1px solid #EFE5D8; text-align: right; font-weight: bold;">₹${(i.price * i.quantity).toLocaleString('en-IN')}</td>
      </tr>
    `
      )
      .join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Sparkle Jewelry - Invoice ${order.orderNumber}</title>
          <meta charset="utf-8" />
          <style>
            body { font-family: 'Helvetica Neue', Arial, sans-serif; padding: 30px; color: #1E130C; max-width: 650px; margin: auto; background: #fff; }
            .header { text-align: center; border-bottom: 2px solid #C68A4C; padding-bottom: 16px; margin-bottom: 20px; }
            .title { font-family: Georgia, serif; font-size: 26px; font-weight: bold; color: #1E130C; margin: 0; }
            .subtitle { font-size: 10px; letter-spacing: 3px; text-transform: uppercase; color: #C68A4C; font-weight: bold; margin-top: 4px; }
            .store-address { font-size: 11px; color: #666; margin-top: 6px; line-height: 1.4; }
            .badge { display: inline-block; background: #FAF4EB; border: 1px solid #C68A4C; color: #1E130C; padding: 4px 10px; border-radius: 4px; font-weight: bold; font-size: 12px; margin-top: 8px; }
            .grid { display: flex; justify-content: space-between; margin-bottom: 20px; font-size: 12px; }
            .grid > div { width: 48%; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px; }
            th { background: #FAF4EB; padding: 10px; text-align: left; border-bottom: 2px solid #C68A4C; font-size: 11px; text-transform: uppercase; color: #7A5B40; }
            .totals { margin-left: auto; width: 50%; font-size: 13px; margin-bottom: 24px; }
            .totals-row { display: flex; justify-content: space-between; padding: 4px 0; }
            .grand-total { font-size: 16px; font-weight: bold; border-top: 2px solid #C68A4C; border-bottom: 2px solid #C68A4C; padding: 8px 0; margin-top: 6px; color: #1E130C; }
            .footer { border-top: 1px dashed #C68A4C; padding-top: 14px; text-align: center; font-size: 11px; color: #666; line-height: 1.5; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1 class="title">Sparkle Jewelry</h1>
            <div class="subtitle">1-Gram Micro Gold & Anti-Tarnish Luxury</div>
            <div class="store-address">
              Sullia Centre Complex, 3rd Floor, Opposite KSRTC Bus Stand, Sullia, Karnataka - 574239<br/>
              Phone: +91 89218 44922 | Official Order Receipt
            </div>
            <div class="badge">ORDER RECEIPT: ${order.orderNumber}</div>
          </div>

          <div class="grid">
            <div>
              <div style="font-weight: bold; color: #7A5B40; margin-bottom: 4px; text-transform: uppercase; font-size: 10px;">Order Information</div>
              <div><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
              <div><strong>Status:</strong> ${order.status.toUpperCase()}</div>
              <div><strong>Payment Mode:</strong> ${order.paymentMethod.toUpperCase()} (${order.paymentStatus === 'completed' ? 'Paid' : 'Cash On Delivery'})</div>
              <div><strong>Courier:</strong> ${order.courierName || (isLocal ? 'Local Sullia Rider' : 'Assigned on Dispatch')}</div>
              ${order.awbCode ? `<div><strong>AWB / Tracking #:</strong> ${order.awbCode}</div>` : ''}
              ${order.otpCode ? `<div><strong>Delivery OTP:</strong> ${order.otpCode}</div>` : ''}
            </div>

            <div>
              <div style="font-weight: bold; color: #7A5B40; margin-bottom: 4px; text-transform: uppercase; font-size: 10px;">Delivered To</div>
              <div><strong>${order.customer.fullName}</strong></div>
              <div>${order.customer.addressLine}</div>
              ${order.customer.landmark ? `<div>Near ${order.customer.landmark}</div>` : ''}
              <div>${order.customer.city || 'Sullia'}, Karnataka - ${order.customer.pincode}</div>
              <div>📞 ${order.customer.phoneNumber}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Jewellery Item</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Price</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="totals">
            <div class="totals-row">
              <span>Items Subtotal:</span>
              <span>₹${order.subtotal.toLocaleString('en-IN')}</span>
            </div>
            <div class="totals-row">
              <span>Shipping & Handling:</span>
              <span>${order.shippingFee === 0 ? 'FREE' : `₹${order.shippingFee}`}</span>
            </div>
            <div class="totals-row grand-total">
              <span>Grand Total:</span>
              <span>₹${order.totalAmount.toLocaleString('en-IN')}</span>
            </div>
          </div>

          <div class="footer">
            <strong>✨ Premium Micro-Gold Finish & Quality Assured ✨</strong><br/>
            Thank you for trusting Sparkle Jewelry Sullia with your auspicious jewellery moments.<br/>
            For service & WhatsApp enquiries: +91 89218 44922
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const q = trackQuery.trim();
    if (!q) return;

    setTrackLoading(true);
    setTrackSearched(true);
    try {
      const results = await searchCustomerOrders(q);
      setTrackResults(results);
    } catch {
      setTrackResults([]);
    } finally {
      setTrackLoading(false);
    }
  };

  const handleSaveAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('sullia_saved_address', JSON.stringify(savedAddress));
        setAddressSavedNotice(true);
        setTimeout(() => setAddressSavedNotice(false), 2500);
      } catch {}
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
            <Clock className="w-3 h-3 text-amber-700" />
            Confirmed & Packing
          </span>
        );
      case 'packed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-900 border border-blue-300 shadow-2xs">
            <Package className="w-3 h-3 text-blue-700" />
            Packed & Rider Assigned
          </span>
        );
      case 'shipped':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-900 border border-purple-300 shadow-2xs">
            <Truck className="w-3 h-3 text-purple-700" />
            Out for Delivery
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs">
            <CheckCircle2 className="w-3 h-3 text-emerald-700" />
            Delivered
          </span>
        );
      case 'cancelled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-900 border border-rose-300 shadow-2xs">
            <X className="w-3 h-3 text-rose-700" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-stone-100 text-stone-700">
            {status}
          </span>
        );
    }
  };

  // Render Order Card Component with Full Tracking & Order Info
  const renderOrderCard = (order: Order) => {
    const isLocal = order.deliveryZone === 'local_sullia';
    const isDelivered = order.status === 'delivered';
    const isCancelled = order.status === 'cancelled';
    const isExpanded = !!expandedOrders[order.id];

    // Timeline stage active calculation
    const stageIndex =
      order.status === 'confirmed'
        ? 1
        : order.status === 'packed'
        ? 2
        : order.status === 'shipped'
        ? 3
        : order.status === 'delivered'
        ? 4
        : 0;

    const whatsappUrl = `https://wa.me/918921844922?text=${encodeURIComponent(
      `Hi Sparkle Jewelry! I need an update regarding Order #${order.orderNumber} (Customer: ${order.customer.fullName}, Amount: ₹${order.totalAmount}). Could you please share the latest courier status?`
    )}`;

    const expectedDeliveryText =
      order.notes ||
      (isLocal
        ? '⚡ Same Day (Within 2–4 Hours in Sullia)'
        : '📦 Within 2 to 3 Business Days via Express Courier');

    const courierLink =
      order.trackingUrl ||
      (order.awbCode
        ? `https://shiprocket.co/tracking/${order.awbCode}`
        : 'https://shiprocket.co/tracking');

    return (
      <div
        key={order.id}
        className="bg-white rounded-xl border border-[#EDE3D2] shadow-xs overflow-hidden transition-all hover:border-[#C68A4C]/60"
      >
        {/* Card Header: Order #, Date, Status */}
        <div className="bg-[#FAF6F0] px-4 py-3 border-b border-[#EDE3D2] flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="font-mono font-bold text-xs sm:text-sm text-[#1E130C] flex items-center gap-1.5">
              <span>{order.orderNumber}</span>
              <button
                onClick={() => handleCopy(order.orderNumber)}
                className="text-stone-400 hover:text-stone-700 transition-colors p-0.5"
                title="Copy Order Number"
              >
                {copiedText === order.orderNumber ? (
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
            <span className="text-[10px] text-stone-500 hidden sm:inline">•</span>
            <span className="text-[11px] text-stone-500">
              {new Date(order.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
          </div>
          <div>{getStatusBadge(order.status)}</div>
        </div>

        <div className="p-4 space-y-4">
          {/* Prominent Flipkart-Style Expected Delivery Banner */}
          <div className="bg-gradient-to-r from-[#FAF4EB] to-white p-3.5 rounded-xl border border-[#C68A4C]/30 flex flex-wrap items-center justify-between gap-2">
            <div className="space-y-0.5">
              <div className="text-[10px] uppercase font-bold tracking-wider text-[#A37B55] flex items-center gap-1">
                <Truck className="w-3 h-3 text-[#C68A4C]" />
                <span>Live Delivery Target</span>
              </div>
              <div className="font-serif font-bold text-sm sm:text-base text-[#1E130C]">
                {expectedDeliveryText}
              </div>
              <div className="text-[11px] text-stone-600">
                {order.status === 'confirmed' &&
                  '✨ Your jewellery is being prepared & packed with authentic velvet jewellery box.'}
                {order.status === 'packed' &&
                  '📦 Package inspected & sealed. Courier van assigned for dispatch.'}
                {order.status === 'shipped' &&
                  `🚚 In Transit with ${order.courierName || 'Express Courier'}. Handover confirmed.`}
                {order.status === 'delivered' &&
                  '🏡 Parcel successfully delivered to your doorstep. Thank you!'}
                {order.status === 'cancelled' && '❌ This order has been cancelled.'}
              </div>
            </div>

            {/* Quick Courier AWB Pill if Assigned */}
            {order.awbCode && (
              <div className="bg-white border border-[#EDE3D2] px-3 py-1.5 rounded-lg text-right shrink-0">
                <div className="text-[9px] uppercase font-bold text-stone-400">AWB Tracking #</div>
                <div className="font-mono text-xs font-bold text-[#1E130C] flex items-center gap-1">
                  <span>{order.awbCode}</span>
                  <button
                    onClick={() => handleCopy(order.awbCode!)}
                    className="text-stone-400 hover:text-stone-700"
                    title="Copy AWB Number"
                  >
                    {copiedText === order.awbCode ? (
                      <Check className="w-3 h-3 text-emerald-600" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Stepped Progress Tracker */}
          {!isCancelled && (
            <div className="bg-stone-50 p-3 rounded-xl border border-stone-200">
              <div className="flex items-center justify-between text-[10px] sm:text-xs font-semibold text-stone-600 mb-2">
                <span className={stageIndex >= 1 ? 'text-[#C68A4C] font-bold' : ''}>1. Placed</span>
                <span className={stageIndex >= 2 ? 'text-[#C68A4C] font-bold' : ''}>2. Packed</span>
                <span className={stageIndex >= 3 ? 'text-[#C68A4C] font-bold' : ''}>
                  3. {isLocal ? 'Rider Assigned' : 'In Transit'}
                </span>
                <span className={stageIndex >= 4 ? 'text-emerald-700 font-bold' : ''}>4. Delivered</span>
              </div>
              <div className="w-full bg-stone-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#C68A4C] to-[#996229] h-full transition-all duration-700 rounded-full"
                  style={{
                    width:
                      stageIndex === 1
                        ? '25%'
                        : stageIndex === 2
                        ? '50%'
                        : stageIndex === 3
                        ? '75%'
                        : stageIndex === 4
                        ? '100%'
                        : '8%',
                  }}
                />
              </div>
            </div>
          )}

          {/* Sullia Town Doorstep Verification OTP */}
          {isLocal && order.otpCode && !isDelivered && !isCancelled && (
            <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 flex items-center justify-between gap-3 shadow-2xs">
              <div>
                <div className="text-[10px] uppercase font-bold text-amber-900 tracking-wider flex items-center gap-1">
                  <span>🔐 Sullia Town Delivery OTP</span>
                </div>
                <div className="text-xs text-amber-800 mt-0.5">
                  Give this 4-digit code to the delivery rider at your doorstep to verify receipt:
                </div>
              </div>
              <div className="font-mono text-xl sm:text-2xl font-extrabold tracking-widest bg-white border-2 border-amber-400 text-amber-950 px-3.5 py-1 rounded-lg shadow-xs shrink-0">
                {order.otpCode}
              </div>
            </div>
          )}

          {/* Courier Live Tracking Bar (Outstation) */}
          {!isLocal && (
            <div className="bg-[#FAF8F5] border border-[#EDE3D2] rounded-xl p-3 flex flex-wrap items-center justify-between gap-2.5 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-white border border-[#EDE3D2] flex items-center justify-center shrink-0">
                  <Truck className="w-4 h-4 text-[#C68A4C]" />
                </div>
                <div>
                  <div className="text-stone-800 font-bold">
                    Courier: {order.courierName || (order.status === 'confirmed' ? 'Assigned on Dispatch' : 'Express Courier')}
                  </div>
                  <div className="text-stone-500 text-[11px]">
                    {order.awbCode ? `Waybill # ${order.awbCode}` : 'Waybill will generate on courier pickup'}
                  </div>
                </div>
              </div>

              {order.awbCode && (
                <a
                  href={courierLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white border border-[#C68A4C] hover:bg-[#FAF4EB] text-[#1E130C] text-[11px] font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors shadow-2xs"
                >
                  <span>Track on Courier Site</span>
                  <ExternalLink className="w-3 h-3 text-[#C68A4C]" />
                </a>
              )}
            </div>
          )}

          {/* Purchased Items Quick List */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold uppercase tracking-wider text-stone-500 flex justify-between items-center">
              <span>Items in Order ({order.items.length})</span>
              <span className="font-mono text-[#1E130C] font-bold text-xs">
                Total: ₹{order.totalAmount.toLocaleString('en-IN')}
              </span>
            </div>
            <div className="space-y-1.5">
              {order.items.map((item, idx) => (
                <div
                  key={`${item.productId}-${idx}`}
                  className="flex items-center justify-between gap-3 p-2 rounded-lg bg-stone-50/80 border border-stone-100"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <img
                      src={item.image || '/sparkle-logo-256.webp'}
                      alt={item.productName}
                      className="w-10 h-10 object-cover rounded-md bg-stone-200 shrink-0 border border-stone-200"
                    />
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-stone-900 truncate">
                        {item.productName}
                      </div>
                      <div className="text-[11px] text-stone-500">
                        Qty: {item.quantity} {item.selectedSize ? `• Size: ${item.selectedSize}` : ''}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs font-mono font-bold text-stone-900 shrink-0">
                    ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Expandable Full Order Details & Invoice */}
          <div className="pt-1">
            <button
              onClick={() => toggleExpandOrder(order.id)}
              className="w-full py-2 px-3 rounded-lg bg-[#FAF8F5] hover:bg-[#F3EBE0] border border-[#EDE3D2] text-xs font-semibold text-[#5A3F29] flex items-center justify-between transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-[#C68A4C]" />
                <span>{isExpanded ? 'Hide Full Order Details & Bill' : 'View Full Delivery Address & Invoice Bill'}</span>
              </div>
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>

            {isExpanded && (
              <div className="mt-2.5 p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-3.5 text-xs animate-fadeIn">
                {/* Delivery Address & Logistics Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-3 border-b border-stone-200">
                  <div>
                    <div className="font-semibold text-stone-700 mb-1 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#C68A4C]" />
                      <span>Shipping Address</span>
                    </div>
                    <p className="font-bold text-stone-900">{order.customer.fullName}</p>
                    <p className="text-stone-600">
                      {order.customer.addressLine}
                      {order.customer.landmark ? `, Near ${order.customer.landmark}` : ''}
                    </p>
                    <p className="text-stone-600 font-mono text-[11px]">
                      {order.customer.city || 'Sullia'}, Karnataka - {order.customer.pincode}
                    </p>
                    <p className="text-stone-600 font-mono text-[11px] mt-0.5">
                      📞 {order.customer.phoneNumber}
                    </p>
                  </div>

                  <div>
                    <div className="font-semibold text-stone-700 mb-1 flex items-center gap-1">
                      <Receipt className="w-3.5 h-3.5 text-[#C68A4C]" />
                      <span>Billing & Payment</span>
                    </div>
                    <p className="text-stone-800">
                      Payment Mode: <strong className="uppercase">{order.paymentMethod}</strong>
                    </p>
                    <p className="text-stone-800">
                      Payment Status:{' '}
                      <span className={order.paymentStatus === 'completed' ? 'text-emerald-700 font-bold' : 'text-amber-800 font-bold'}>
                        {order.paymentStatus === 'completed' ? 'Paid Online' : 'Cash on Delivery (Pending)'}
                      </span>
                    </p>
                    <p className="text-[11px] text-stone-500 mt-1">
                      Quality: Premium Micro-Gold Plated & Inspected with Tax Invoice.
                    </p>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-1.5 text-stone-600 text-[11px]">
                  <div className="flex justify-between">
                    <span>Items Subtotal:</span>
                    <span className="font-mono">₹{order.subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Luxury Jewellery Box & Pouch:</span>
                    <span className="text-emerald-700 font-semibold">Included FREE</span>
                  </div>
                  <div className="flex justify-between">
                    <span>GST (3% jewellery tax):</span>
                    <span className="font-mono">Included in price</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Fee:</span>
                    <span className="font-mono">
                      {order.shippingFee === 0 ? <strong className="text-emerald-700">FREE</strong> : `₹${order.shippingFee}`}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-stone-200 flex justify-between items-center text-sm font-bold text-stone-900">
                    <span>Grand Total:</span>
                    <span className="font-mono">₹{order.totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Print Bill Action */}
                <div className="pt-2 border-t border-stone-200 flex justify-end">
                  <button
                    onClick={() => handlePrintReceipt(order)}
                    className="bg-white border border-stone-300 hover:bg-stone-100 text-stone-800 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition-colors"
                  >
                    <Printer className="w-3.5 h-3.5 text-stone-600" />
                    <span>Print Official Receipt</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Action Row: WhatsApp & Store Support */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-stone-100">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 font-semibold px-3 py-1.5 rounded-lg transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>Inquire about this order on WhatsApp</span>
              <ExternalLink className="w-3 h-3 text-emerald-600" />
            </a>

            <button
              onClick={() => handlePrintReceipt(order)}
              className="text-stone-500 hover:text-stone-900 text-xs font-medium flex items-center gap-1"
              title="Print Receipt"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Receipt</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#140D07]/60 backdrop-blur-xs p-2 sm:p-4 animate-fadeIn overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-[#EDE3D2] flex flex-col max-h-[92vh] overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="bg-[#FAF4EB] px-5 py-4 border-b border-[#EDE3D2] flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#1E130C] text-[#FAF4EB] flex items-center justify-center font-serif font-bold shadow-xs">
              <User className="w-5 h-5 text-[#C68A4C]" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base sm:text-lg text-[#1E130C] flex items-center gap-1.5">
                <span>My Account & Orders</span>
                <span className="text-[9px] bg-[#C68A4C] text-[#1E130C] uppercase tracking-wider px-1.5 py-0.5 rounded font-sans font-bold">
                  Sparkle
                </span>
              </h3>
              <p className="text-[11px] text-stone-500">
                Track shipments, view order history & manage delivery address
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1.5 rounded-full hover:bg-[#EFE6D7] transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#EDE3D2] bg-[#FAF8F5] px-4 pt-2 shrink-0 gap-2 sm:gap-4 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-2.5 px-2 text-xs font-semibold flex items-center gap-1.5 transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'orders'
                ? 'border-[#C68A4C] text-[#1E130C]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>My Orders</span>
            {orders.length > 0 && (
              <span className="bg-[#C68A4C] text-[#1E130C] text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                {orders.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('track')}
            className={`pb-2.5 px-2 text-xs font-semibold flex items-center gap-1.5 transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'track'
                ? 'border-[#C68A4C] text-[#1E130C]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Track Any Order</span>
          </button>

          <button
            onClick={() => setActiveTab('address')}
            className={`pb-2.5 px-2 text-xs font-semibold flex items-center gap-1.5 transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'address'
                ? 'border-[#C68A4C] text-[#1E130C]'
                : 'border-transparent text-stone-500 hover:text-stone-800'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Saved Address</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {/* ================= TAB 1: MY ORDERS ================= */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-500 font-medium">
                  Orders placed on this device ({orders.length})
                </span>
                <button
                  onClick={refreshOrders}
                  disabled={ordersLoading}
                  className="flex items-center gap-1 text-[#7A5B40] hover:text-[#1E130C] text-xs font-semibold"
                  title="Check for status updates"
                >
                  <RefreshCw className={`w-3 h-3 ${ordersLoading ? 'animate-spin' : ''}`} />
                  <span>Refresh Status</span>
                </button>
              </div>

              {orders.length === 0 ? (
                <div className="text-center py-12 px-4 rounded-xl border border-dashed border-stone-300 bg-stone-50 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                    <ShoppingBag className="w-6 h-6 stroke-[1.5]" />
                  </div>
                  <div>
                    <h4 className="font-serif font-bold text-stone-800 text-sm">
                      No Past Orders Found On This Device
                    </h4>
                    <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1">
                      You haven’t placed an order from this browser yet, or your cache was cleared.
                    </p>
                  </div>
                  <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2">
                    <button
                      onClick={() => setActiveTab('track')}
                      className="bg-[#C68A4C] hover:bg-[#B3793E] text-[#1E130C] font-semibold text-xs px-4 py-2 rounded-lg transition-colors"
                    >
                      Track with Phone / Order #
                    </button>
                    {onOpenWishlist && (
                      <button
                        onClick={() => {
                          onClose();
                          onOpenWishlist();
                        }}
                        className="bg-white border border-stone-300 hover:bg-stone-100 text-stone-700 font-semibold text-xs px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5"
                      >
                        <Heart className="w-3.5 h-3.5 text-rose-600" />
                        <span>View Wishlist ({wishlistCount})</span>
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => renderOrderCard(order))}
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 2: TRACK ANY ORDER ================= */}
          {activeTab === 'track' && (
            <div className="space-y-4">
              <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#EDE3D2] space-y-3">
                <div>
                  <h4 className="font-serif font-bold text-sm text-[#1E130C]">
                    Instant Order & Shipment Tracking
                  </h4>
                  <p className="text-xs text-stone-500">
                    Lookup your order using your 10-digit mobile number or order number (e.g. SLJ-1002).
                  </p>
                </div>
                <form onSubmit={handleTrackSubmit} className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={trackQuery}
                      onChange={(e) => setTrackQuery(e.target.value)}
                      placeholder="Enter Order # or 10-digit Phone..."
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#C68A4C]/30 focus:border-[#C68A4C] font-mono"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={trackLoading}
                    className="bg-[#1E130C] hover:bg-[#322013] text-white px-4 py-2 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 shrink-0"
                  >
                    {trackLoading ? 'Searching...' : 'Track'}
                  </button>
                </form>
              </div>

              {/* Track Search Results */}
              {trackSearched && (
                <div className="space-y-4">
                  {trackResults && trackResults.length > 0 ? (
                    <div className="space-y-4">
                      <div className="text-xs text-emerald-800 font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Found {trackResults.length} matching order(s):</span>
                      </div>
                      {trackResults.map((order) => (
                        <div key={order.id} className="space-y-2">
                          {renderOrderCard(order)}
                          {/* Save to local history button if not already saved */}
                          {!orders.some((o) => o.id === order.id) && (
                            <button
                              onClick={() => {
                                saveCustomerOrder(order);
                                alert('Order added to your device history!');
                              }}
                              className="text-[11px] text-[#7A5B40] hover:underline font-semibold block ml-1"
                            >
                              + Save this order to My Orders on this browser
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 px-4 rounded-xl border border-stone-200 bg-stone-50 space-y-2">
                      <AlertCircle className="w-6 h-6 text-stone-400 mx-auto" />
                      <p className="text-xs font-semibold text-stone-800">
                        No orders found for &ldquo;{trackQuery}&rdquo;
                      </p>
                      <p className="text-[11px] text-stone-500 max-w-sm mx-auto">
                        Please check if the order number or mobile number was typed correctly, or contact our Sullia counter directly.
                      </p>
                      <a
                        href={`https://wa.me/918921844922?text=${encodeURIComponent(
                          `Hi Sparkle Jewelry, I cannot find my order with details: ${trackQuery}. Could you please check?`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-emerald-700 font-semibold hover:underline mt-2"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Ask Sullia Store Support on WhatsApp</span>
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ================= TAB 3: SAVED ADDRESS ================= */}
          {activeTab === 'address' && (
            <form onSubmit={handleSaveAddress} className="space-y-3.5 text-xs">
              <div className="bg-[#FAF8F5] p-3 rounded-lg border border-[#EDE3D2] text-stone-600 text-[11px]">
                Your saved delivery information will automatically pre-fill during checkout for fast 1-click orders.
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-stone-700 block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={savedAddress.fullName}
                  onChange={(e) => setSavedAddress({ ...savedAddress, fullName: e.target.value })}
                  placeholder="e.g. Deeksha Rai"
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-[#C68A4C]/30 focus:border-[#C68A4C] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-stone-700 block mb-1">
                  Mobile Number (For WhatsApp Updates & OTP)
                </label>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  value={savedAddress.phoneNumber}
                  onChange={(e) =>
                    setSavedAddress({
                      ...savedAddress,
                      phoneNumber: e.target.value.replace(/\D/g, ''),
                    })
                  }
                  placeholder="e.g. 9845123456"
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-[#C68A4C]/30 focus:border-[#C68A4C] focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase text-stone-700 block mb-1">
                  Street Address / House / Flat
                </label>
                <textarea
                  required
                  rows={2}
                  value={savedAddress.addressLine}
                  onChange={(e) =>
                    setSavedAddress({ ...savedAddress, addressLine: e.target.value })
                  }
                  placeholder="House No., Street Name, Near Landmark..."
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-[#C68A4C]/30 focus:border-[#C68A4C] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-bold uppercase text-stone-700 block mb-1">
                    Landmark
                  </label>
                  <input
                    type="text"
                    value={savedAddress.landmark}
                    onChange={(e) =>
                      setSavedAddress({ ...savedAddress, landmark: e.target.value })
                    }
                    placeholder="Near Temple / Bus Stand"
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-[#C68A4C]/30 focus:border-[#C68A4C] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold uppercase text-stone-700 block mb-1">
                    Pincode
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    value={savedAddress.pincode}
                    onChange={(e) =>
                      setSavedAddress({
                        ...savedAddress,
                        pincode: e.target.value.replace(/\D/g, ''),
                      })
                    }
                    placeholder="574239"
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-[#C68A4C]/30 focus:border-[#C68A4C] focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="submit"
                  className="bg-[#C68A4C] hover:bg-[#B3793E] text-[#1E130C] font-semibold text-xs px-5 py-2 rounded-lg transition-colors"
                >
                  Save Address
                </button>
                {addressSavedNotice && (
                  <span className="text-emerald-700 font-semibold text-xs flex items-center gap-1 animate-fadeIn">
                    <Check className="w-3.5 h-3.5" /> Address saved successfully!
                  </span>
                )}
              </div>
            </form>
          )}

          {/* Quick Support & Shortcuts */}
          <div className="pt-3 border-t border-stone-100 space-y-2">
            {/* Wishlist Shortcut */}
            {onOpenWishlist && (
              <button
                onClick={() => {
                  onClose();
                  onOpenWishlist();
                }}
                className="w-full p-2.5 rounded-xl border border-rose-200 bg-rose-50/50 text-stone-900 font-semibold flex items-center justify-between hover:bg-rose-100/60 transition-colors text-xs"
              >
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-rose-600 fill-rose-500" />
                  <span>View My Saved Wishlist</span>
                  {wishlistCount > 0 && (
                    <span className="bg-rose-600 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                      {wishlistCount}
                    </span>
                  )}
                </div>
                <ArrowRight className="w-4 h-4 text-rose-600" />
              </button>
            )}

            {/* Direct WhatsApp Call/Chat */}
            <a
              href="https://wa.me/918921844922?text=Hi%20Sparkle%20Jewelry,%20I%20have%20an%20inquiry%20regarding%20an%20order."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full p-2.5 rounded-xl border border-emerald-300 bg-emerald-50/60 text-emerald-900 font-semibold flex items-center justify-between hover:bg-emerald-100 transition-colors text-xs"
            >
              <div className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>Store Support WhatsApp: +91 89218 44922</span>
              </div>
              <ArrowRight className="w-4 h-4 text-emerald-700" />
            </a>

            {/* Physical Store Counter Address */}
            <div className="p-2.5 rounded-xl bg-stone-50 border border-stone-200 text-stone-600 text-[11px] flex items-start gap-2">
              <MapPin className="w-4 h-4 text-[#C68A4C] shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-stone-900">Physical Store: </span>
                Sullia Centre Complex, 3rd Floor, Opposite KSRTC Bus Stand, Sullia, Karnataka - 574239
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
