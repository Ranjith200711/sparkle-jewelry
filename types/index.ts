export type JewelleryCategory = '1-gram-gold' | 'anti-tarnish' | 'fashion-imitation';

export interface Product {
  id: string;
  name: string;
  category: JewelleryCategory;
  subcategory: 'chains' | 'bangles' | 'necklaces' | 'earrings' | 'rings' | 'temple-sets' | 'bracelets';
  description: string;
  price: number;
  originalPrice: number;
  images: string[];
  inStock: boolean;
  stockCount: number;
  featured: boolean;
  material: string;
  polishWarranty: string;
  isWaterproof: boolean;
  isSweatproof: boolean;
  careInstructions: string;
  sizeOptions?: string[];
  weightGrams?: number;
}

export type OrderStatus = 
  | 'pending'
  | 'confirmed'
  | 'packed'
  | 'shipped'
  | 'out_for_delivery'
  | 'delivered'
  | 'cancelled';

export type PaymentMethod = 'upi' | 'cod' | 'card' | 'netbanking';
export type PaymentStatus = 'pending' | 'completed' | 'failed';
export type DeliveryZone = 'local_sullia' | 'regional_karnataka' | 'national';

export interface CustomerAddress {
  fullName: string;
  phoneNumber: string;
  addressLine: string;
  landmark?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  category: JewelleryCategory;
  price: number;
  quantity: number;
  image: string;
  selectedSize?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  customer: CustomerAddress;
  items: OrderItem[];
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  status: OrderStatus;
  deliveryZone: DeliveryZone;
  shipmentMethod: 'local_rider' | 'shiprocket_courier';
  courierName?: string;
  awbCode?: string;
  shiprocketOrderId?: string | number;
  trackingUrl?: string;
  otpCode?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PincodeInfo {
  pincode: string;
  isServiceable: boolean;
  zone: DeliveryZone;
  estimatedDeliveryTime: string;
  deliveryDateStr?: string;
  dispatchNotice?: string;
  cutoffUrgency?: string;
  safetyBufferDays?: number;
  shippingFee: number;
  freeShippingAbove: number;
  deliveryMethod: 'local_rider' | 'shiprocket_courier';
  couriersAvailable: string[];
}
