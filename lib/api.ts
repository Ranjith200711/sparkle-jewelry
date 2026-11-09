import { Product, Order, PincodeInfo } from '../types';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
export const API_HOST = API_BASE_URL.replace(/\/api\/?$/, '');

// ================= PRODUCTION ADMIN AUTHENTICATION =================
export function getAdminToken(): string | null {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem('sparkle_admin_token');
  }
  return null;
}

export function setAdminToken(token: string | null) {
  if (typeof window !== 'undefined') {
    if (token) {
      sessionStorage.setItem('sparkle_admin_token', token);
      sessionStorage.setItem('sparkle_owner_auth', 'true');
    } else {
      sessionStorage.removeItem('sparkle_admin_token');
      sessionStorage.removeItem('sparkle_owner_auth');
    }
  }
}

export function getAuthHeaders(extraHeaders: Record<string, string> = {}): Record<string, string> {
  const token = getAdminToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extraHeaders
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function adminLogin(pin: string): Promise<{
  success: boolean;
  token?: string;
  message?: string;
  remainingAttempts?: number;
  minutesLeft?: number;
}> {
  try {
    const res = await fetch(`${API_BASE_URL}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: pin.trim() })
    });
    const data = await res.json();
    if (data.success && data.token) {
      setAdminToken(data.token);
    }
    return data;
  } catch (err: any) {
    return { success: false, message: 'Server unreachable. Please check backend connection.' };
  }
}

export async function verifyAdminSession(): Promise<boolean> {
  const token = getAdminToken();
  if (!token) return false;
  try {
    const res = await fetch(`${API_BASE_URL}/admin/verify`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.ok;
  } catch {
    return false;
  }
}
// ===================================================================

// Fallback seed products if backend API is not yet running
export const FALLBACK_PRODUCTS: Product[] = [
  {
    id: 'prod-floral-curve',
    name: 'Floral Curve 22KT Gold Earrings',
    category: '1-gram-gold',
    subcategory: 'earrings',
    description: 'Masterfully crafted 22KT gold look floral curve earrings with authentic micro-grain finish, center ruby gemstone accent, and traditional South Indian screw back.',
    price: 38420,
    originalPrice: 41270,
    images: [
      '/floral-curve-earrings-front.webp',
      '/floral-curve-earrings-angle.webp',
      '/floral-curve-earrings-macro.webp'
    ],
    inStock: true,
    stockCount: 6,
    featured: true,
    material: 'High-Purity 22KT Hallmark Micro-Plated Copper Base with Ruby CZ Gemstone',
    polishWarranty: '1-Year Polish & Shine Guarantee',
    isWaterproof: true,
    isSweatproof: true,
    careInstructions: 'Avoid harsh perfumes and direct chemical sprays. Store safely in the provided luxury velvet jewellery box.',
    weightGrams: 8.4,
    sizeOptions: ['Standard Pierced', 'South Screw Back', 'Push Back']
  },
  {
    id: 'prod-1g-01',
    name: '1-Gram Micro Gold Plated Temple Lakshmi Haar',
    category: '1-gram-gold',
    subcategory: 'temple-sets',
    description: 'Traditional South Indian Lakshmi long haram with rich antique micro-gold polish. Exact replica of pure 22k gold finish, crafted with high-grade copper base.',
    price: 2499,
    originalPrice: 3800,
    images: [
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1611591475878-592f6c04f98f?w=600&auto=format&fit=crop&q=80'
    ],
    inStock: true,
    stockCount: 8,
    featured: true,
    material: 'Pure Copper Base with 1-Gram Micro Gold Plating',
    polishWarranty: '1-Year Polish & Shine Guarantee',
    isWaterproof: false,
    isSweatproof: true,
    careInstructions: 'Keep away from direct perfumes, sprays, and chemical water. Store in cotton or airtight pouch.',
    weightGrams: 48,
    sizeOptions: ['24 inch', '28 inch']
  },
  {
    id: 'prod-1g-02',
    name: '1-Gram Gold Daily Wear Rope Chain (Vadasaram)',
    category: '1-gram-gold',
    subcategory: 'chains',
    description: 'Sturdy 1-gram gold rope design chain for daily wear. Traditional South Kanara design with smooth round links and durable S-hook clasp.',
    price: 899,
    originalPrice: 1400,
    images: [
      'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&auto=format&fit=crop&q=80'
    ],
    inStock: true,
    stockCount: 15,
    featured: true,
    material: 'High-Density Brass with 24K Micro Gold Dip',
    polishWarranty: '6-Month Daily Wear Guarantee',
    isWaterproof: false,
    isSweatproof: true,
    careInstructions: 'Wipe dry with soft microfiber cloth after long wear. Store away from dampness.',
    weightGrams: 16,
    sizeOptions: ['20 inch', '22 inch', '24 inch']
  },
  {
    id: 'prod-at-01',
    name: 'Waterproof 18K PVD Gold Clover Charm Bracelet',
    category: 'anti-tarnish',
    subcategory: 'bracelets',
    description: 'Trending aesthetic four-leaf clover charm bracelet. Powered by advanced PVD (Physical Vapor Deposition) technology — 100% waterproof, gym-proof, and shower-proof.',
    price: 599,
    originalPrice: 999,
    images: [
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1611591475878-592f6c04f98f?w=600&auto=format&fit=crop&q=80'
    ],
    inStock: true,
    stockCount: 25,
    featured: true,
    material: '316L Surgical Grade Stainless Steel + 18K Real Gold PVD Coating',
    polishWarranty: 'Lifetime Anti-Tarnish Guarantee',
    isWaterproof: true,
    isSweatproof: true,
    careInstructions: 'Zero maintenance! Safe to wear while showering, swimming, or working out.',
    weightGrams: 8,
    sizeOptions: ['Adjustable (6.5 to 8 inch)']
  },
  {
    id: 'prod-at-02',
    name: 'Anti-Tarnish Roman Numeral Band Ring',
    category: 'anti-tarnish',
    subcategory: 'rings',
    description: 'Minimalist luxury band ring etched with Roman numerals and centered CZ crystal. Hypoallergenic, nickel-free, and guaranteed never to turn green or fade.',
    price: 449,
    originalPrice: 799,
    images: [
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=600&auto=format&fit=crop&q=80'
    ],
    inStock: true,
    stockCount: 30,
    featured: true,
    material: 'Titanium Steel + 18K Gold Vacuum Plated',
    polishWarranty: 'Lifetime Color Retention',
    isWaterproof: true,
    isSweatproof: true,
    careInstructions: 'Wear 24/7 without worry. Safe with soap, water, and body lotions.',
    weightGrams: 4,
    sizeOptions: ['Size 6', 'Size 7', 'Size 8']
  },
  {
    id: 'prod-im-01',
    name: 'Royal Kundan & Pearl Choker Necklace Set',
    category: 'fashion-imitation',
    subcategory: 'necklaces',
    description: 'Exquisite bridal party choker studded with hand-set Kundan stones and dangling freshwater-look pearls. Comes with matching jhumkas and maangtikka.',
    price: 999,
    originalPrice: 1800,
    images: [
      'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600&auto=format&fit=crop&q=80'
    ],
    inStock: true,
    stockCount: 10,
    featured: true,
    material: 'Zinc Alloy with High Grade Kundan, Meenakari & Shell Pearls',
    polishWarranty: 'Party Wear Long-Life Coating',
    isWaterproof: false,
    isSweatproof: false,
    careInstructions: 'Apply perfumes and cosmetics before wearing. Store in a padded zip-lock box.',
    weightGrams: 65
  },
  {
    id: 'prod-im-02',
    name: 'American Diamond (CZ) Solitaire Drop Earrings',
    category: 'fashion-imitation',
    subcategory: 'earrings',
    description: 'Brilliant 5A Cubic Zirconia stones cut to diamond perfection with silver rhodium plating. Dazzling light reflection for cocktails, weddings, and parties.',
    price: 499,
    originalPrice: 899,
    images: [
      'https://images.unsplash.com/photo-1630019852942-f89202989a59?w=600&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=600&auto=format&fit=crop&q=80'
    ],
    inStock: true,
    stockCount: 20,
    featured: true,
    material: 'Brass with 5A Zirconia & Platinum-Finish Rhodium',
    polishWarranty: '6-Month Sparkle Guarantee',
    isWaterproof: false,
    isSweatproof: true,
    careInstructions: 'Clean gently with a soft dry cloth. Keep in separate air-tight pouches.',
    weightGrams: 6
  }
];

export async function fetchProducts(category?: string): Promise<Product[]> {
  try {
    const url = category ? `${API_BASE_URL}/products?category=${category}` : `${API_BASE_URL}/products`;
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('API request failed');
    const json = await res.json();
    return json.data;
  } catch {
    if (category) {
      return FALLBACK_PRODUCTS.filter(p => p.category === category);
    }
    return FALLBACK_PRODUCTS;
  }
}

export async function fetchProductById(id: string): Promise<Product | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/products/${id}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('API request failed');
    const json = await res.json();
    return json.data;
  } catch {
    const found = FALLBACK_PRODUCTS.find(p => p.id === id);
    return found || null;
  }
}

export async function deleteProduct(productId: string): Promise<boolean> {
  const index = FALLBACK_PRODUCTS.findIndex(p => p.id === productId);
  if (index !== -1) {
    FALLBACK_PRODUCTS.splice(index, 1);
  }
  try {
    const res = await fetch(`${API_BASE_URL}/products/${productId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return res.ok;
  } catch {
    return true;
  }
}

export async function checkPincode(pincode: string): Promise<PincodeInfo> {
  try {
    const res = await fetch(`${API_BASE_URL}/shipping/check-pincode`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pincode })
    });
    if (!res.ok) throw new Error('Pincode check failed');
    const json = await res.json();
    return json.data;
  } catch {
    // Intelligent client-side Flipkart algorithm fallback
    const cleanPin = pincode.trim();
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinutes = now.getMinutes();

    if (cleanPin === '574239') {
      const isBefore7PM = currentHour < 19;
      const remainingHours = 18 - currentHour;
      const deliveryDateStr = isBefore7PM
        ? 'TODAY (Within 2–4 Hours)'
        : 'Tomorrow Morning (by 11:00 AM)';

      return {
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
        couriersAvailable: ['Local Sullia Shop Rider', 'Express Auto Delivery']
      };
    }

    // Outstation
    const isBefore5PM = currentHour < 17;
    let dispatchDate = new Date(now);
    if (!isBefore5PM) {
      dispatchDate.setDate(dispatchDate.getDate() + 1);
    }
    if (dispatchDate.getDay() === 0) {
      dispatchDate.setDate(dispatchDate.getDate() + 1); // Skip Sunday
    }

    const isNearby = cleanPin.startsWith('574') || cleanPin.startsWith('575') || cleanPin.startsWith('571');
    const isKarnataka = isNearby || cleanPin.startsWith('56') || cleanPin.startsWith('57') || cleanPin.startsWith('58');

    const transitDays = isNearby ? 1 : isKarnataka ? 2 : 3;
    const safetyBufferDays = 1;

    let arrivalDate = new Date(dispatchDate);
    let daysToAdd = transitDays + safetyBufferDays;
    while (daysToAdd > 0) {
      arrivalDate.setDate(arrivalDate.getDate() + 1);
      daysToAdd--;
    }
    if (arrivalDate.getDay() === 0) {
      arrivalDate.setDate(arrivalDate.getDate() + 1); // No Sunday delivery
    }

    const formattedDate = arrivalDate.toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'short'
    });

    const deliveryDateStr = `Delivery by ${formattedDate}`;

    return {
      pincode: cleanPin,
      isServiceable: true,
      zone: isKarnataka ? 'regional_karnataka' : 'national',
      estimatedDeliveryTime: deliveryDateStr,
      deliveryDateStr,
      dispatchNotice: isBefore5PM
        ? 'Dispatches Today from Sullia Store'
        : 'Dispatches Next Business Day via Courier',
      cutoffUrgency: isBefore5PM
        ? `Order within ${16 - currentHour}h ${60 - currentMinutes}m for today’s evening dispatch`
        : 'Dispatches tomorrow morning 10:00 AM',
      safetyBufferDays,
      shippingFee: isKarnataka ? 60 : 75,
      freeShippingAbove: isKarnataka ? 999 : 1499,
      deliveryMethod: 'shiprocket_courier',
      couriersAvailable: ['Blue Dart Surface Express', 'DTDC Express', 'Speed Post']
    };
  }
}

export async function createOrder(orderPayload: any): Promise<Order> {
  try {
    const res = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(orderPayload)
    });
    if (!res.ok) throw new Error('Order creation failed');
    const json = await res.json();
    return json.data;
  } catch (err: any) {
    // Return a mock created order if offline
    return {
      id: `order-${Date.now()}`,
      orderNumber: `SLJ-${Date.now().toString().slice(-6)}`,
      customer: orderPayload.customer,
      items: orderPayload.items,
      subtotal: orderPayload.items.reduce((s: number, i: any) => s + i.price * i.quantity, 0),
      shippingFee: orderPayload.customer.pincode === '574239' ? 0 : 60,
      totalAmount: orderPayload.items.reduce((s: number, i: any) => s + i.price * i.quantity, 0),
      paymentMethod: orderPayload.paymentMethod || 'cod',
      paymentStatus: 'pending',
      status: 'confirmed',
      deliveryZone: orderPayload.customer.pincode === '574239' ? 'local_sullia' : 'regional_karnataka',
      shipmentMethod: orderPayload.customer.pincode === '574239' ? 'local_rider' : 'shiprocket_courier',
      courierName: orderPayload.customer.pincode === '574239' ? 'Local Sullia Shop Rider' : undefined,
      awbCode: undefined,
      trackingUrl: undefined,
      otpCode: '4821',
      notes: orderPayload.customer.pincode === '574239' ? '⚡ Sullia Town: Same-Day Delivery' : '📦 Delivery by Tuesday, 10 Nov',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }
}

export async function fetchOrders(): Promise<Order[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/orders`, {
      headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Failed to fetch orders');
    const json = await res.json();
    return json.data;
  } catch {
    return [];
  }
}

export async function fetchOrderById(id: string): Promise<Order | null> {
  const cleanId = id.trim();
  if (!cleanId) return null;

  try {
    const res = await fetch(`${API_BASE_URL}/orders/${encodeURIComponent(cleanId)}`);
    if (res.ok) {
      const json = await res.json();
      if (json.data) return json.data;
    }
  } catch {}

  // Check localStorage if running in browser
  if (typeof window !== 'undefined') {
    try {
      const localRaw = localStorage.getItem('sparkle_customer_orders');
      if (localRaw) {
        const localOrders: Order[] = JSON.parse(localRaw);
        const match = localOrders.find(
          (o) => o.id === cleanId || o.orderNumber.toLowerCase() === cleanId.toLowerCase()
        );
        if (match) return match;
      }
    } catch {}
  }

  return null;
}

export async function searchCustomerOrders(query: string): Promise<Order[]> {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const resultsMap = new Map<string, Order>();

  // 1. Check local device storage
  if (typeof window !== 'undefined') {
    try {
      const localRaw = localStorage.getItem('sparkle_customer_orders');
      if (localRaw) {
        const localOrders: Order[] = JSON.parse(localRaw);
        localOrders.forEach((o) => {
          if (
            o.id.toLowerCase().includes(q) ||
            o.orderNumber.toLowerCase().includes(q) ||
            o.customer.phoneNumber.includes(q) ||
            o.customer.fullName.toLowerCase().includes(q)
          ) {
            resultsMap.set(o.orderNumber || o.id, o);
          }
        });
      }
    } catch {}
  }

  // 2. Safe single-order lookup via server (without leaking entire DB)
  try {
    const res = await fetch(`${API_BASE_URL}/orders/lookup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: q })
    });
    if (res.ok) {
      const json = await res.json();
      if (json.data) {
        resultsMap.set(json.data.orderNumber || json.data.id, json.data);
      }
    }
  } catch {}

  return Array.from(resultsMap.values());
}

export async function requestPickup(orderId: string, dispatchType?: 'courier' | 'local_rider', courierPreference?: string, weightKg?: number): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/orders/${orderId}/request-pickup`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify({ dispatchType, courierPreference, weightKg })
  });
  return res.json();
}

export async function fetchCourierConfig(): Promise<any> {
  try {
    const res = await fetch(`${API_BASE_URL}/shipping/courier-config`, {
      headers: getAuthHeaders()
    });
    return res.json();
  } catch {
    return { success: false };
  }
}

export async function saveCourierConfig(payload: { email?: string; password?: string; pickupLocation?: string; mode?: string }): Promise<any> {
  try {
    const res = await fetch(`${API_BASE_URL}/shipping/courier-config`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return res.json();
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

export async function testCourierConnection(payload: { email?: string; password?: string }): Promise<any> {
  try {
    const res = await fetch(`${API_BASE_URL}/shipping/test-connection`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return res.json();
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

export async function fetchCourierComparison(pincode: string, isCod: boolean = true, amount: number = 1000, weightKg: number = 0.25): Promise<any> {
  try {
    const res = await fetch(`${API_BASE_URL}/shipping/courier-comparison/${pincode}?cod=${isCod}&amount=${amount}&weight=${weightKg}`, {
      headers: getAuthHeaders()
    });
    return res.json();
  } catch (err: any) {
    return { success: false, data: [] };
  }
}

export async function createRazorpayOrder(amount: number, receipt?: string): Promise<any> {
  try {
    const res = await fetch(`${API_BASE_URL}/payments/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ amount, receipt })
    });
    return res.json();
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

export async function verifyRazorpayPayment(payload: {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature?: string;
  localOrderId?: string;
}): Promise<any> {
  try {
    const res = await fetch(`${API_BASE_URL}/payments/verify-payment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return res.json();
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}

export async function fetchRazorpayConfig(): Promise<any> {
  try {
    const res = await fetch(`${API_BASE_URL}/payments/config`, {
      headers: getAuthHeaders()
    });
    return res.json();
  } catch {
    return { success: false };
  }
}

export async function saveRazorpayConfig(payload: { keyId?: string; keySecret?: string; mode?: string }): Promise<any> {
  try {
    const res = await fetch(`${API_BASE_URL}/payments/config`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(payload)
    });
    return res.json();
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}
