'use client';

import React, { useState, useEffect } from 'react';
import { Product, OrderItem, PaymentMethod, Order } from '../types';
import { createOrder, createRazorpayOrder, verifyRazorpayPayment } from '../lib/api';
import { saveCustomerOrder } from '../lib/customerOrders';
import {
  validateField,
  validateAllAddressFields,
  AddressValidationErrors
} from '../lib/addressValidation';
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  MapPin,
  Truck,
  CreditCard,
  Smartphone,
  ExternalLink,
  Lock
} from 'lucide-react';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: { product: Product; quantity: number }[];
  onUpdateQuantity: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  defaultPincode?: string;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  defaultPincode = '574239'
}: CartDrawerProps) {
  const [step, setStep] = useState<'cart' | 'checkout' | 'success'>('cart');
  const [loading, setLoading] = useState(false);
  const [placedOrder, setPlacedOrder] = useState<any | null>(null);

  // Checkout Form State
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [landmark, setLandmark] = useState('');
  const [pincode, setPincode] = useState(defaultPincode);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('upi');

  // Address Validation State
  const [errors, setErrors] = useState<AddressValidationErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [serverError, setServerError] = useState<string | null>(null);

  // Razorpay Gateway State
  const [razorpayModalData, setRazorpayModalData] = useState<{
    orderId: string;
    amount: number;
    keyId: string;
    localOrder: any;
    isSimulation: boolean;
  } | null>(null);
  const [simulatingPayment, setSimulatingPayment] = useState(false);
  const [simulatedMethod, setSimulatedMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window === 'undefined') return resolve(false);
      if ((window as any).Razorpay) return resolve(true);

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // Load saved address from device storage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('sullia_saved_address');
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed.fullName) setFullName(parsed.fullName);
          if (parsed.phoneNumber) setPhoneNumber(parsed.phoneNumber);
          if (parsed.addressLine) setAddressLine(parsed.addressLine);
          if (parsed.landmark) setLandmark(parsed.landmark);
          if (parsed.pincode) setPincode(parsed.pincode);
        }
      } catch {}
    }
  }, []);

  if (!isOpen) return null;

  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const cleanPin = pincode.trim();
  const isSullia = cleanPin === '574239';
  const freeThreshold = isSullia ? 499 : 999;
  const shippingFee = subtotal >= freeThreshold || subtotal === 0 ? 0 : (isSullia ? 30 : 60);
  const totalAmount = subtotal + shippingFee;

  // Resolve Location Preview from PIN
  const getLocationPreview = (pin: string) => {
    if (pin === '574239') return { title: 'Sullia Town, Karnataka', subtitle: '⚡ Direct Shop Rider Doorstep Delivery (2–4 Hours)' };
    if (pin.startsWith('574') || pin.startsWith('575')) return { title: 'Dakshina Kannada, Karnataka', subtitle: '📦 Regional Surface Courier (1–2 Days)' };
    if (pin.startsWith('576')) return { title: 'Udupi District, Karnataka', subtitle: '📦 Regional Express Courier (1–2 Days)' };
    if (pin.startsWith('571')) return { title: 'Kodagu (Coorg), Karnataka', subtitle: '📦 Regional Express Courier (1–2 Days)' };
    if (pin.startsWith('671') || pin.startsWith('670')) return { title: 'Kasaragod / Kannur, Kerala', subtitle: '📦 Border Express Courier (2–3 Days)' };
    if (pin.startsWith('560') || pin.startsWith('56') || pin.startsWith('57') || pin.startsWith('58') || pin.startsWith('59')) {
      return { title: 'Karnataka State', subtitle: '📦 Express Courier Service (2–3 Days)' };
    }
    if (/^[1-8]\d{5}$/.test(pin)) return { title: 'All-India Delivery', subtitle: '📦 Pan-India Express Courier (3–5 Days)' };
    return null;
  };

  const locationInfo = getLocationPreview(cleanPin);

  // Real-time Field Blur Handler
  const handleBlur = (field: 'fullName' | 'phoneNumber' | 'addressLine' | 'pincode' | 'landmark') => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const val = field === 'fullName' ? fullName :
                field === 'phoneNumber' ? phoneNumber :
                field === 'addressLine' ? addressLine :
                field === 'pincode' ? pincode : landmark;
    const err = validateField(field, val);
    setErrors((prev) => ({ ...prev, [field]: err }));
  };

  // Real-time Field Change Handler
  const handleChange = (
    field: 'fullName' | 'phoneNumber' | 'addressLine' | 'pincode' | 'landmark',
    val: string
  ) => {
    if (field === 'fullName') setFullName(val);
    if (field === 'phoneNumber') setPhoneNumber(val.replace(/\D/g, '').slice(0, 10));
    if (field === 'addressLine') setAddressLine(val);
    if (field === 'landmark') setLandmark(val);
    if (field === 'pincode') setPincode(val.replace(/\D/g, '').slice(0, 6));

    if (serverError) setServerError(null);

    // If field was already touched, validate dynamically
    if (touched[field]) {
      const err = validateField(field, val);
      setErrors((prev) => ({ ...prev, [field]: err }));
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Mark all fields touched
    setTouched({
      fullName: true,
      phoneNumber: true,
      addressLine: true,
      pincode: true,
      landmark: true
    });

    // 2. Validate all address fields
    const validation = validateAllAddressFields({
      fullName,
      phoneNumber,
      addressLine,
      landmark,
      pincode
    });

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setLoading(true);
    setServerError(null);

    try {
      const orderItems: OrderItem[] = cart.map((c) => ({
        productId: c.product.id,
        productName: c.product.name,
        category: c.product.category,
        price: c.product.price,
        quantity: c.quantity,
        image: c.product.images[0]
      }));

      const payload = {
        customer: {
          fullName: fullName.trim(),
          phoneNumber: phoneNumber.replace(/\D/g, ''),
          addressLine: addressLine.trim(),
          landmark: landmark.trim() || undefined,
          pincode: pincode.trim()
        },
        items: orderItems,
        paymentMethod
      };

      const result = await createOrder(payload);

      // Save valid address to device for future 1-click orders
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem(
            'sullia_saved_address',
            JSON.stringify({
              fullName: fullName.trim(),
              phoneNumber: phoneNumber.replace(/\D/g, ''),
              addressLine: addressLine.trim(),
              landmark: landmark.trim(),
              pincode: pincode.trim()
            })
          );
        } catch {}
      }

      // If online payment (UPI / Cards / Razorpay) selected:
      if (paymentMethod === 'upi') {
        const rzpRes = await createRazorpayOrder(totalAmount, result.orderNumber);
        const scriptLoaded = await loadRazorpayScript();

        if (scriptLoaded && rzpRes.success && rzpRes.isLive && (window as any).Razorpay) {
          const options = {
            key: rzpRes.keyId,
            amount: Math.round(totalAmount * 100),
            currency: 'INR',
            name: 'Sparkle Jewelry Sullia',
            description: `Order #${result.orderNumber} (1-Gram / Anti-Tarnish)`,
            image: '/sparkle-logo-256.webp',
            order_id: rzpRes.orderId,
            prefill: {
              name: fullName.trim(),
              contact: phoneNumber.trim()
            },
            theme: {
              color: '#C68A4C'
            },
            handler: async function (response: any) {
              setLoading(true);
              await verifyRazorpayPayment({
                razorpay_order_id: response.razorpay_order_id || rzpRes.orderId,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                localOrderId: result.id
              });
              const paidOrder: Order = { ...result, paymentStatus: 'completed', paymentMethod: 'upi' };
              saveCustomerOrder(paidOrder);
              setPlacedOrder(paidOrder);
              setStep('success');
              onClearCart();
              setLoading(false);
            },
            modal: {
              ondismiss: function () {
                setLoading(false);
                saveCustomerOrder(result);
                setPlacedOrder(result);
                setStep('success');
                onClearCart();
              }
            }
          };
          const rzp = new (window as any).Razorpay(options);
          rzp.open();
          return;
        } else {
          // Open Simulation Mode Modal (₹0 free testing)
          setRazorpayModalData({
            orderId: rzpRes.orderId || `order_test_${Date.now()}`,
            amount: totalAmount,
            keyId: rzpRes.keyId || 'rzp_test_sparkle',
            localOrder: result,
            isSimulation: true
          });
          return;
        }
      }

      // Cash on Delivery
      saveCustomerOrder(result);
      setPlacedOrder(result);
      setStep('success');
      onClearCart();
    } catch (err: any) {
      setServerError(err.message || 'Failed to place order. Please review your address details.');
    } finally {
      setLoading(false);
    }
  };

  const handleSimulatedPaymentSuccess = async () => {
    if (!razorpayModalData) return;
    setSimulatingPayment(true);
    const mockPaymentId = `pay_test_${Date.now().toString().slice(-8)}`;

    try {
      await verifyRazorpayPayment({
        razorpay_order_id: razorpayModalData.orderId,
        razorpay_payment_id: mockPaymentId,
        localOrderId: razorpayModalData.localOrder.id
      });

      const completedOrder: Order = {
        ...razorpayModalData.localOrder,
        paymentStatus: 'completed',
        paymentMethod: 'upi',
        notes: `Paid online via Razorpay (${mockPaymentId})`
      };

      saveCustomerOrder(completedOrder);
      setPlacedOrder(completedOrder);
      setStep('success');
      onClearCart();
      setRazorpayModalData(null);
    } catch (err: any) {
      alert('Simulation error: ' + err.message);
    } finally {
      setSimulatingPayment(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-stone-900/60 backdrop-blur-xs flex justify-end animate-fadeIn">
      <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl animate-slideLeft">
        {/* Header */}
        <div className="p-4 border-b border-stone-200 flex justify-between items-center bg-[#FAF4EB]">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-800" />
            <h2 className="font-serif font-bold text-stone-900 text-base">
              {step === 'cart' && `Shopping Bag (${cart.length})`}
              {step === 'checkout' && 'Doorstep Delivery Address'}
              {step === 'success' && 'Order Confirmed!'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1.5 rounded-full hover:bg-stone-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ================= STEP 1: CART ITEMS ================= */}
        {step === 'cart' && (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center text-stone-500 py-12">
                  <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center mb-3">
                    <ShoppingBag className="w-8 h-8 text-stone-300" />
                  </div>
                  <p className="font-serif text-stone-700 font-semibold text-sm">Your shopping bag is empty</p>
                  <p className="text-xs text-stone-400 mt-1 max-w-xs">
                    Explore our 1-Gram Gold, Anti-Tarnish, and Kundan collections to add pieces.
                  </p>
                </div>
              ) : (
                cart.map(({ product, quantity }) => (
                  <div
                    key={product.id}
                    className="flex gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200/80 items-center"
                  >
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-16 h-16 rounded-lg object-cover shrink-0 border border-stone-200"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-semibold text-stone-900 line-clamp-1">{product.name}</h4>
                      <p className="text-[10px] text-amber-800 font-medium capitalize mt-0.5">
                        {product.category.replace('-', ' ')}
                      </p>
                      <div className="text-xs font-bold font-mono text-stone-900 mt-1">
                        ₹{product.price.toLocaleString('en-IN')}
                      </div>
                    </div>

                    {/* Quantity controls */}
                    <div className="flex flex-col items-end gap-1.5">
                      <button
                        onClick={() => onRemoveItem(product.id)}
                        className="text-stone-400 hover:text-rose-600 p-1 transition-colors"
                        title="Remove"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <div className="flex items-center gap-1.5 bg-white border border-stone-300 rounded-lg px-1.5 py-0.5">
                        <button
                          onClick={() => onUpdateQuantity(product.id, -1)}
                          className="text-stone-500 hover:text-stone-900 text-xs font-bold px-1"
                        >
                          -
                        </button>
                        <span className="text-xs font-bold font-mono min-w-[14px] text-center">
                          {quantity}
                        </span>
                        <button
                          onClick={() => onUpdateQuantity(product.id, 1)}
                          className="text-stone-500 hover:text-stone-900 text-xs font-bold px-1"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-4 border-t border-stone-200 bg-stone-50 space-y-3">
                <div className="space-y-1.5 text-xs text-stone-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-mono font-semibold">₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Delivery Charges</span>
                    <span className="font-semibold text-emerald-700">
                      {shippingFee === 0 ? 'FREE' : `₹${shippingFee}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-stone-900 pt-1.5 border-t border-stone-200">
                    <span>Total Amount</span>
                    <span className="font-mono">₹{totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <button
                  onClick={() => setStep('checkout')}
                  className="w-full bg-[#1E130C] hover:bg-[#3D2617] text-[#FAF4EB] font-semibold py-3 rounded-xl flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <span>Enter Delivery Address</span>
                  <ArrowRight className="w-4 h-4 text-[#C68A4C]" />
                </button>
              </div>
            )}
          </>
        )}

        {/* ================= STEP 2: VALIDATED CHECKOUT FORM ================= */}
        {step === 'checkout' && (
          <form onSubmit={handlePlaceOrder} className="flex-1 flex flex-col justify-between overflow-y-auto">
            <div className="p-4 space-y-3.5 overflow-y-auto">
              {/* Back to Bag Header */}
              <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                <button
                  type="button"
                  onClick={() => setStep('cart')}
                  className="text-xs text-amber-800 hover:text-amber-900 font-semibold flex items-center gap-1"
                >
                  ← Back to Bag ({cart.length} items)
                </button>
                <span className="text-[11px] font-mono font-bold text-stone-800">
                  ₹{totalAmount.toLocaleString('en-IN')}
                </span>
              </div>

              {serverError && (
                <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{serverError}</span>
                </div>
              )}

              {/* 1. Full Name Field */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-700">
                    Full Name <span className="text-rose-600">*</span>
                  </label>
                  {touched.fullName && !errors.fullName && fullName.length >= 3 && (
                    <span className="text-[10px] text-emerald-600 flex items-center gap-0.5 font-medium">
                      <CheckCircle2 className="w-3 h-3" /> Valid
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => handleChange('fullName', e.target.value)}
                    onBlur={() => handleBlur('fullName')}
                    placeholder="e.g. Deeksha Rai"
                    className={`w-full rounded-lg px-3 py-2 text-xs transition-all focus:outline-none ${
                      touched.fullName && errors.fullName
                        ? 'border-2 border-rose-400 bg-rose-50/30 focus:border-rose-500'
                        : 'border border-stone-300 focus:ring-2 focus:ring-amber-500'
                    }`}
                  />
                </div>
                {touched.fullName && errors.fullName && (
                  <p className="text-[10px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.fullName}</span>
                  </p>
                )}
              </div>

              {/* 2. Mobile Number Field */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-700">
                    Mobile Number (For Delivery OTP) <span className="text-rose-600">*</span>
                  </label>
                  {touched.phoneNumber && !errors.phoneNumber && phoneNumber.length === 10 && (
                    <span className="text-[10px] text-emerald-600 flex items-center gap-0.5 font-medium">
                      <CheckCircle2 className="w-3 h-3" /> Valid
                    </span>
                  )}
                </div>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-xs font-mono font-bold text-stone-400 pointer-events-none">
                    +91
                  </span>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={phoneNumber}
                    onChange={(e) => handleChange('phoneNumber', e.target.value)}
                    onBlur={() => handleBlur('phoneNumber')}
                    placeholder="9845123456"
                    className={`w-full rounded-lg pl-10 pr-3 py-2 text-xs font-mono transition-all focus:outline-none ${
                      touched.phoneNumber && errors.phoneNumber
                        ? 'border-2 border-rose-400 bg-rose-50/30 focus:border-rose-500'
                        : 'border border-stone-300 focus:ring-2 focus:ring-amber-500'
                    }`}
                  />
                </div>
                {touched.phoneNumber && errors.phoneNumber ? (
                  <p className="text-[10px] text-rose-600 mt-1 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.phoneNumber}</span>
                  </p>
                ) : (
                  <p className="text-[10px] text-stone-400 mt-1">
                    Your 4-digit doorstep delivery OTP will be sent to this number.
                  </p>
                )}
              </div>

              {/* 3. Doorstep Address Field */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-700">
                    Doorstep Address <span className="text-rose-600">*</span>
                  </label>
                  {touched.addressLine && !errors.addressLine && addressLine.trim().length >= 10 && (
                    <span className="text-[10px] text-emerald-600 flex items-center gap-0.5 font-medium">
                      <CheckCircle2 className="w-3 h-3" /> Complete
                    </span>
                  )}
                </div>
                <textarea
                  rows={2}
                  value={addressLine}
                  onChange={(e) => handleChange('addressLine', e.target.value)}
                  onBlur={() => handleBlur('addressLine')}
                  placeholder="House/Flat No, Apartment/Building, Street, Area..."
                  className={`w-full rounded-lg px-3 py-2 text-xs transition-all focus:outline-none ${
                    touched.addressLine && errors.addressLine
                      ? 'border-2 border-rose-400 bg-rose-50/30 focus:border-rose-500'
                      : 'border border-stone-300 focus:ring-2 focus:ring-amber-500'
                  }`}
                />
                {touched.addressLine && errors.addressLine ? (
                  <p className="text-[10px] text-rose-600 mt-0.5 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3 shrink-0" />
                    <span>{errors.addressLine}</span>
                  </p>
                ) : (
                  <p className="text-[10px] text-stone-400 mt-0.5">
                    Include house number, street, or building name for the delivery rider.
                  </p>
                )}
              </div>

              {/* 4. Landmark & PIN Code Grid */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-stone-700 block mb-1">
                    Landmark <span className="text-stone-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    type="text"
                    value={landmark}
                    onChange={(e) => handleChange('landmark', e.target.value)}
                    onBlur={() => handleBlur('landmark')}
                    placeholder="Near Temple / Bank"
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                  {touched.landmark && errors.landmark && (
                    <p className="text-[9px] text-rose-600 mt-0.5">{errors.landmark}</p>
                  )}
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-stone-700">
                      PIN Code <span className="text-rose-600">*</span>
                    </label>
                    {touched.pincode && !errors.pincode && pincode.length === 6 && (
                      <span className="text-[10px] text-emerald-600 flex items-center gap-0.5 font-medium">
                        <CheckCircle2 className="w-3 h-3" /> Valid
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={pincode}
                    onChange={(e) => handleChange('pincode', e.target.value)}
                    onBlur={() => handleBlur('pincode')}
                    placeholder="574239"
                    className={`w-full rounded-lg px-3 py-2 text-xs font-mono transition-all focus:outline-none ${
                      touched.pincode && errors.pincode
                        ? 'border-2 border-rose-400 bg-rose-50/30 focus:border-rose-500'
                        : 'border border-stone-300 focus:ring-2 focus:ring-amber-500'
                    }`}
                  />
                  {touched.pincode && errors.pincode && (
                    <p className="text-[9px] text-rose-600 mt-0.5 flex items-center gap-0.5 font-medium">
                      <AlertCircle className="w-2.5 h-2.5 shrink-0" />
                      <span>{errors.pincode}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Location Badge Detected from PIN */}
              {locationInfo && (
                <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/90 text-xs text-amber-900 space-y-0.5">
                  <div className="flex items-center gap-1.5 font-semibold text-[11px] text-amber-950">
                    <MapPin className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                    <span>{locationInfo.title}</span>
                  </div>
                  <div className="text-[10px] text-amber-800 pl-5">
                    {locationInfo.subtitle}
                  </div>
                </div>
              )}

              {/* Payment Method Selector */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-stone-700 block mb-1.5">
                  Payment Method:
                </label>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`p-2.5 rounded-xl border text-left font-medium transition-all ${
                      paymentMethod === 'upi'
                        ? 'border-amber-600 bg-amber-50 text-amber-900 ring-1 ring-amber-600'
                        : 'border-stone-200 hover:border-stone-300 text-stone-700'
                    }`}
                  >
                    <div className="font-bold flex items-center gap-1">
                      <span>UPI & Cards</span>
                      <span className="text-[9px] bg-blue-100 text-blue-800 px-1 py-0.2 rounded font-bold font-mono">RAZORPAY</span>
                    </div>
                    <div className="text-[10px] text-stone-500 mt-0.5">GPay, PhonePe, Cards, NetBanking</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cod')}
                    className={`p-2.5 rounded-xl border text-left font-medium transition-all ${
                      paymentMethod === 'cod'
                        ? 'border-amber-600 bg-amber-50 text-amber-900 ring-1 ring-amber-600'
                        : 'border-stone-200 hover:border-stone-300 text-stone-700'
                    }`}
                  >
                    <div className="font-bold">Cash on Delivery</div>
                    <div className="text-[10px] text-stone-500 mt-0.5">Pay at Doorstep</div>
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Submit Action */}
            <div className="p-4 border-t border-stone-200 bg-stone-50 space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-stone-500">Total Payable:</span>
                <span className="font-bold font-mono text-base text-stone-900">
                  ₹{totalAmount.toLocaleString('en-IN')}
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#1E130C] hover:bg-[#3D2617] active:scale-98 disabled:opacity-50 text-[#FAF4EB] font-bold py-3 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all text-xs uppercase tracking-wider"
              >
                {loading ? (
                  <span>Securing Order...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-[#C68A4C]" />
                    <span>Confirm Doorstep Order</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* ================= STEP 3: ORDER SUCCESS ================= */}
        {step === 'success' && placedOrder && (
          <div className="flex-1 p-6 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <h3 className="font-serif font-bold text-lg text-stone-900">Order Placed Successfully!</h3>
              <p className="text-xs text-stone-500 mt-1">
                Order Number: <strong className="font-mono text-stone-800">{placedOrder.orderNumber}</strong>
              </p>
            </div>

            {/* OTP Badge for Handover */}
            <div className="w-full bg-amber-50 border border-amber-300 rounded-xl p-3.5 text-xs text-amber-900 space-y-1">
              <div className="font-semibold text-amber-800">Your Doorstep Delivery Verification OTP:</div>
              <div className="text-2xl font-bold tracking-widest font-mono text-amber-950">
                {placedOrder.otpCode || '4821'}
              </div>
              <div className="text-[10px] text-amber-700">
                Provide this OTP to the delivery rider when receiving your package.
              </div>
            </div>

            <div className="text-xs text-stone-600 space-y-1 text-left w-full bg-stone-50 p-3 rounded-lg border border-stone-200">
              <div>📍 <strong>Delivering To:</strong> {placedOrder.customer.fullName} ({placedOrder.customer.pincode})</div>
              <div>🏠 <strong>Address:</strong> {placedOrder.customer.addressLine}</div>
              <div>
                🚚 <strong>Shipping:</strong>{' '}
                {placedOrder.deliveryZone === 'local_sullia' || placedOrder.customer.pincode === '574239'
                  ? '🛵 Local Sullia Shop Rider'
                  : placedOrder.courierName
                  ? `📦 ${placedOrder.courierName}`
                  : '📦 Express Courier (Assigned on Dispatch)'}
              </div>
              {placedOrder.awbCode && (
                <div>🏷️ <strong>AWB Waybill:</strong> <span className="font-mono font-bold text-stone-800">{placedOrder.awbCode}</span></div>
              )}
              <div>💰 <strong>Total Amount:</strong> ₹{placedOrder.totalAmount} ({placedOrder.paymentMethod.toUpperCase()})</div>
              <div className="pt-1 border-t border-stone-200 flex items-center justify-between">
                <span>Payment Status:</span>
                <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                  placedOrder.paymentStatus === 'completed'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                }`}>
                  {placedOrder.paymentStatus === 'completed' ? '🟢 Paid Online (Razorpay Verified)' : '🟡 Pay at Doorstep (COD)'}
                </span>
              </div>
            </div>

            {/* WhatsApp Contact Shop */}
            <a
              href={`https://wa.me/918921844922?text=${encodeURIComponent(
                `Hi! I just placed order ${placedOrder.orderNumber} on your website for ₹${placedOrder.totalAmount}. Please confirm when it is packed!`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Get Updates on WhatsApp</span>
            </a>

            <button
              onClick={() => {
                setStep('cart');
                onClose();
              }}
              className="text-xs text-stone-500 underline hover:text-stone-800"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>

      {/* ================= SIMULATED RAZORPAY CHECKOUT MODAL ================= */}
      {razorpayModalData && (
        <div className="fixed inset-0 z-60 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-sm w-full overflow-hidden shadow-2xl border border-stone-200 animate-scaleUp">
            {/* Razorpay Top Header */}
            <div className="bg-[#0C2340] text-white p-4 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded bg-blue-500 flex items-center justify-center text-white font-bold text-xs">
                    R
                  </div>
                  <span className="font-bold text-xs tracking-wider">RAZORPAY</span>
                  <span className="text-[9px] bg-blue-900 text-blue-200 px-1.5 py-0.2 rounded font-mono">TEST MODE</span>
                </div>
                <div className="text-sm font-serif font-bold text-amber-200 mt-1">
                  Sparkle Jewelry Sullia
                </div>
                <div className="text-[11px] text-blue-200">
                  Order #{razorpayModalData.localOrder.orderNumber}
                </div>
              </div>

              <div className="text-right">
                <div className="text-xs text-blue-300 font-medium">Amount to Pay</div>
                <div className="text-lg font-bold font-mono text-white">
                  ₹{razorpayModalData.amount.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            {/* Payment Method Tabs */}
            <div className="p-4 space-y-3 bg-stone-50 text-xs">
              <div className="text-[11px] font-bold uppercase text-stone-500">
                Choose Instant Payment Method:
              </div>

              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setSimulatedMethod('upi')}
                  className={`w-full p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                    simulatedMethod === 'upi'
                      ? 'border-blue-600 bg-blue-50/50 text-blue-950 ring-1 ring-blue-600'
                      : 'border-stone-200 bg-white hover:bg-stone-100 text-stone-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Smartphone className="w-4 h-4 text-emerald-600" />
                    <div className="text-left">
                      <div className="font-bold">UPI (Google Pay / PhonePe / Paytm)</div>
                      <div className="text-[10px] text-stone-400">Zero charges • 1-click verify</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700">FAST</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSimulatedMethod('card')}
                  className={`w-full p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                    simulatedMethod === 'card'
                      ? 'border-blue-600 bg-blue-50/50 text-blue-950 ring-1 ring-blue-600'
                      : 'border-stone-200 bg-white hover:bg-stone-100 text-stone-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    <div className="text-left">
                      <div className="font-bold">Credit / Debit Card</div>
                      <div className="text-[10px] text-stone-400">Visa, Mastercard, RuPay, Amex</div>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-blue-700">3D SECURE</span>
                </button>
              </div>

              {/* Card Simulator Details */}
              {simulatedMethod === 'card' && (
                <div className="p-3 bg-white rounded-xl border border-stone-200 space-y-2 text-xs animate-fadeIn">
                  <div className="flex justify-between items-center text-[10px] text-stone-500 font-bold uppercase">
                    <span>Card Information</span>
                    <span className="text-blue-700">💳 All Indian & Global Cards</span>
                  </div>
                  <input
                    type="text"
                    readOnly
                    value="4111 2222 3333 1111 (Test Card)"
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 font-mono text-stone-800 text-[11px]"
                  />
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <input
                      type="text"
                      readOnly
                      value="EXP: 12 / 28"
                      className="bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1 font-mono text-stone-700 text-center"
                    />
                    <input
                      type="text"
                      readOnly
                      value="CVV: 892"
                      className="bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1 font-mono text-stone-700 text-center"
                    />
                  </div>
                  <div className="text-[10px] text-emerald-700 flex items-center gap-1 font-medium">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Supports Visa, Mastercard, RuPay & EMI options</span>
                  </div>
                </div>
              )}

              <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-[10px] text-amber-900 leading-relaxed">
                💡 <strong>Razorpay Test Mode Active:</strong> No real money will be deducted. Click the button below to simulate an instantaneous successful bank payment!
              </div>
            </div>

            {/* Modal Buttons */}
            <div className="p-4 border-t border-stone-200 bg-white flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setRazorpayModalData(null);
                  setLoading(false);
                }}
                disabled={simulatingPayment}
                className="w-1/3 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-semibold text-xs hover:bg-stone-100 transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleSimulatedPaymentSuccess}
                disabled={simulatingPayment}
                className="w-2/3 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all"
              >
                {simulatingPayment ? (
                  <span>Verifying Payment...</span>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Pay ₹{razorpayModalData.amount} (Test)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
