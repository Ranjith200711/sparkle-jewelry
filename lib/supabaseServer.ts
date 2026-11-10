import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Product, Order, OrderStatus } from '../types';
import { FALLBACK_PRODUCTS, SAMPLE_ADMIN_ORDERS } from './api';

const SUPABASE_URL = process.env.SUPABASE_URL || '';
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  '';

let supabaseClient: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (!supabaseClient && SUPABASE_URL && SUPABASE_KEY) {
    try {
      supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: { persistSession: false }
      });
    } catch (e) {
      console.error('Supabase initialization failed:', e);
    }
  }
  return supabaseClient;
}

// In-memory fallback if database query times out or fails
let memoryProducts: Product[] = [...FALLBACK_PRODUCTS];
let memoryOrders: Order[] = [...SAMPLE_ADMIN_ORDERS];

// ================= ROW MAPPERS =================
function toProductRow(p: Product) {
  return {
    id: p.id,
    name: p.name,
    category: p.category,
    subcategory: p.subcategory,
    description: p.description || '',
    price: p.price,
    original_price: p.originalPrice ?? p.price,
    images: p.images ?? [],
    in_stock: p.inStock ?? true,
    stock_count: p.stockCount ?? 10,
    featured: p.featured ?? false,
    material: p.material || '',
    polish_warranty: p.polishWarranty || '22KT Micro Gold Plated Finish',
    is_waterproof: p.isWaterproof ?? false,
    is_sweatproof: p.isSweatproof ?? true,
    care_instructions: p.careInstructions || '',
    weight_grams: p.weightGrams ?? null,
    size_options: p.sizeOptions ?? [],
  };
}

function fromProductRow(r: any): Product {
  return {
    id: r.id,
    name: r.name,
    category: r.category,
    subcategory: r.subcategory,
    description: r.description || '',
    price: Number(r.price),
    originalPrice: Number(r.original_price ?? r.price),
    images: Array.isArray(r.images) ? r.images : [],
    inStock: Boolean(r.in_stock),
    stockCount: Number(r.stock_count ?? 10),
    featured: Boolean(r.featured),
    material: r.material || '',
    polishWarranty: r.polish_warranty || '22KT Micro Gold Plated Finish',
    isWaterproof: Boolean(r.is_waterproof),
    isSweatproof: Boolean(r.is_sweatproof),
    careInstructions: r.care_instructions || '',
    weightGrams: r.weight_grams ? Number(r.weight_grams) : undefined,
    sizeOptions: Array.isArray(r.size_options) ? r.size_options : [],
  };
}

function toOrderRow(o: Order) {
  return {
    id: o.id,
    order_number: o.orderNumber,
    customer: o.customer,
    items: o.items,
    subtotal: o.subtotal,
    shipping_fee: o.shippingFee ?? 0,
    total_amount: o.totalAmount,
    payment_method: o.paymentMethod,
    payment_status: o.paymentStatus,
    status: o.status,
    delivery_zone: o.deliveryZone,
    shipment_method: o.shipmentMethod,
    courier_name: o.courierName || null,
    awb_code: o.awbCode || null,
    tracking_url: o.trackingUrl || null,
    otp_code: o.otpCode || null,
    notes: o.notes || null,
    created_at: o.createdAt || new Date().toISOString(),
    updated_at: o.updatedAt || new Date().toISOString(),
  };
}

function fromOrderRow(r: any): Order {
  return {
    id: r.id,
    orderNumber: r.order_number,
    customer: r.customer,
    items: r.items,
    subtotal: Number(r.subtotal),
    shippingFee: Number(r.shipping_fee ?? 0),
    totalAmount: Number(r.total_amount),
    paymentMethod: r.payment_method,
    paymentStatus: r.payment_status,
    status: r.status,
    deliveryZone: r.delivery_zone,
    shipmentMethod: r.shipment_method,
    courierName: r.courier_name || undefined,
    awbCode: r.awb_code || undefined,
    trackingUrl: r.tracking_url || undefined,
    otpCode: r.otp_code || undefined,
    notes: r.notes || undefined,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

// ================= PRODUCT REPOSITORY =================
export async function getDbProducts(category?: string): Promise<Product[]> {
  const sb = getSupabase();
  if (sb) {
    try {
      let query = sb.from('products').select('*').order('created_at', { ascending: false });
      if (category) {
        query = query.eq('category', category);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        return data.map(fromProductRow);
      }
    } catch (e) {
      console.error('Error fetching products from Supabase:', e);
    }
  }

  if (category) {
    return memoryProducts.filter((p) => p.category === category);
  }
  return memoryProducts;
}

export async function getDbProductById(id: string): Promise<Product | null> {
  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb.from('products').select('*').eq('id', id).maybeSingle();
      if (!error && data) {
        return fromProductRow(data);
      }
    } catch (e) {
      console.error('Error fetching product by ID from Supabase:', e);
    }
  }

  return memoryProducts.find((p) => p.id === id) || null;
}

export async function createDbProduct(product: Product): Promise<Product> {
  memoryProducts.unshift(product);
  const sb = getSupabase();
  if (sb) {
    try {
      const row = toProductRow(product);
      const { data, error } = await sb.from('products').insert([row]).select().maybeSingle();
      if (!error && data) {
        return fromProductRow(data);
      }
    } catch (e) {
      console.error('Error inserting product into Supabase:', e);
    }
  }
  return product;
}

export async function deleteDbProduct(id: string): Promise<boolean> {
  memoryProducts = memoryProducts.filter((p) => p.id !== id);
  const sb = getSupabase();
  if (sb) {
    try {
      const { error } = await sb.from('products').delete().eq('id', id);
      return !error;
    } catch (e) {
      console.error('Error deleting product from Supabase:', e);
    }
  }
  return true;
}

export async function updateDbProductStock(id: string, inStock: boolean): Promise<boolean> {
  const found = memoryProducts.find((p) => p.id === id);
  if (found) found.inStock = inStock;

  const sb = getSupabase();
  if (sb) {
    try {
      const { error } = await sb.from('products').update({ in_stock: inStock }).eq('id', id);
      return !error;
    } catch (e) {
      console.error('Error updating product stock in Supabase:', e);
    }
  }
  return true;
}

// ================= ORDER REPOSITORY =================
export async function getDbOrders(): Promise<Order[]> {
  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        return data.map(fromOrderRow);
      }
    } catch (e) {
      console.error('Error fetching orders from Supabase:', e);
    }
  }

  return memoryOrders;
}

export async function getDbOrderById(id: string): Promise<Order | null> {
  const sb = getSupabase();
  if (sb) {
    try {
      const { data, error } = await sb
        .from('orders')
        .select('*')
        .or(`id.eq.${id},order_number.eq.${id}`)
        .maybeSingle();
      if (!error && data) {
        return fromOrderRow(data);
      }
    } catch (e) {
      console.error('Error fetching order by ID from Supabase:', e);
    }
  }

  return memoryOrders.find((o) => o.id === id || o.orderNumber === id) || null;
}

export async function createDbOrder(order: Order): Promise<Order> {
  memoryOrders.unshift(order);
  const sb = getSupabase();
  if (sb) {
    try {
      const row = toOrderRow(order);
      const { data, error } = await sb.from('orders').insert([row]).select().maybeSingle();
      if (!error && data) {
        return fromOrderRow(data);
      }
    } catch (e) {
      console.error('Error inserting order into Supabase:', e);
    }
  }
  return order;
}

export async function updateDbOrderStatus(id: string, status: OrderStatus): Promise<boolean> {
  const found = memoryOrders.find((o) => o.id === id);
  if (found) {
    found.status = status;
    found.updatedAt = new Date().toISOString();
  }

  const sb = getSupabase();
  if (sb) {
    try {
      const { error } = await sb
        .from('orders')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);
      return !error;
    } catch (e) {
      console.error('Error updating order status in Supabase:', e);
    }
  }
  return true;
}

export async function updateDbOrderPickup(
  id: string,
  updates: {
    status: OrderStatus;
    courierName?: string;
    awbCode?: string;
    trackingUrl?: string;
    notes?: string;
  }
): Promise<boolean> {
  const found = memoryOrders.find((o) => o.id === id);
  if (found) {
    Object.assign(found, updates, { updatedAt: new Date().toISOString() });
  }

  const sb = getSupabase();
  if (sb) {
    try {
      const { error } = await sb
        .from('orders')
        .update({
          status: updates.status,
          courier_name: updates.courierName || null,
          awb_code: updates.awbCode || null,
          tracking_url: updates.trackingUrl || null,
          notes: updates.notes || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
      return !error;
    } catch (e) {
      console.error('Error updating order pickup in Supabase:', e);
    }
  }
  return true;
}
