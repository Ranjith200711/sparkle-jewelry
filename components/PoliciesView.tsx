'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import Navbar from './Navbar';
import CartDrawer from './CartDrawer';
import WishlistDrawer from './WishlistDrawer';
import AccountModal from './AccountModal';
import { useCart } from '../lib/cart';
import { useWishlist } from '../lib/wishlist';
import {
  Phone,
  Truck,
  RotateCcw,
  FileText,
  Lock,
  MapPin,
  Clock,
  CheckCircle2,
  ShieldCheck,
  ChevronRight,
  ArrowLeft
} from 'lucide-react';

export type PolicyTab = 'contact' | 'shipping' | 'refund' | 'terms' | 'privacy';

interface PoliciesViewProps {
  initialTab?: PolicyTab;
}

function PoliciesViewInternal({ initialTab = 'contact' }: PoliciesViewProps) {
  const searchParams = useSearchParams();
  const tabFromQuery = searchParams.get('tab') as PolicyTab;
  const [activeTab, setActiveTab] = useState<PolicyTab>(tabFromQuery || initialTab);

  const { cart, updateQuantity, removeItem, clearCart, totalCount: cartItemCount } = useCart();
  const { totalCount: wishlistCount } = useWishlist();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);

  useEffect(() => {
    if (tabFromQuery && ['contact', 'shipping', 'refund', 'terms', 'privacy'].includes(tabFromQuery)) {
      setActiveTab(tabFromQuery);
    } else if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [tabFromQuery, initialTab]);

  const navItems = [
    { id: 'contact', label: 'Contact Us', subtitle: 'Store address & phone', icon: Phone },
    { id: 'shipping', label: 'Shipping & Delivery', subtitle: '2-4hr Sullia & courier timelines', icon: Truck },
    { id: 'refund', label: 'Refund & Returns', subtitle: '7-day transit replacement', icon: RotateCcw },
    { id: 'terms', label: 'Terms & Conditions', subtitle: 'Governing laws & DK jurisdiction', icon: FileText },
    { id: 'privacy', label: 'Privacy Policy', subtitle: 'Zero data selling & RBI security', icon: Lock }
  ] as const;

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col">
      {/* Navigation */}
      <Navbar
        cartCount={cartItemCount}
        onOpenCart={() => setIsCartOpen(true)}
        wishlistCount={wishlistCount}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenAccount={() => setIsAccountModalOpen(true)}
        onOpenPincodeModal={() => {}}
      />

      {/* Breadcrumb Header */}
      <div className="bg-[#FAF4EB] border-b border-[#EDE3D2] py-4 px-4 sm:px-8">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <Link href="/" className="hover:text-amber-800 transition-colors flex items-center gap-1 font-medium">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Storefront</span>
            </Link>
            <ChevronRight className="w-3 h-3 text-stone-400" />
            <span className="text-stone-900 font-bold">Store Policies & Customer Compliance</span>
          </div>

          <div className="text-[11px] font-mono text-emerald-800 bg-emerald-50 border border-emerald-300 px-2.5 py-1 rounded-full hidden sm:flex items-center gap-1 font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Razorpay & RBI Compliant</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 py-8 flex-1 w-full">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          
          {/* Left Navigation Sidebar */}
          <aside className="md:col-span-4 space-y-2">
            <div className="bg-white rounded-2xl border border-stone-200 p-2 shadow-xs space-y-1">
              <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-stone-400 border-b border-stone-100">
                Mandatory Store Policies
              </div>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full p-3 rounded-xl flex items-center gap-3 transition-all text-left ${
                      isActive
                        ? 'bg-[#FAF4EB] border border-[#C68A4C] text-[#5A3F29] shadow-xs'
                        : 'border border-transparent text-stone-600 hover:bg-stone-50'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isActive ? 'bg-[#C68A4C] text-white' : 'bg-stone-100 text-stone-500'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className={`text-xs ${isActive ? 'font-bold text-[#1E130C]' : 'font-semibold'}`}>
                        {item.label}
                      </div>
                      <div className="text-[10px] text-stone-400 truncate">{item.subtitle}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quick Sullia Counter Assistance Box */}
            <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 text-xs text-amber-950 space-y-2 shadow-2xs">
              <div className="font-bold text-amber-900 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-amber-700" />
                <span>Need Direct Assistance?</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-relaxed">
                Visit our showroom counter in Sullia or connect with our manager via WhatsApp for bespoke orders or product enquiries.
              </p>
              <a
                href="https://wa.me/918921844922"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <span>WhatsApp: +91 89218 44922</span>
              </a>
            </div>
          </aside>

          {/* Right Policy Detail Container */}
          <section className="md:col-span-8 bg-white rounded-2xl border border-stone-200 p-6 sm:p-8 shadow-xs space-y-6">
            
            {/* TAB 1: CONTACT US */}
            {activeTab === 'contact' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-stone-100 pb-4">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#C68A4C] mb-1">Official Merchant Details</div>
                  <h1 className="font-serif font-bold text-2xl text-stone-900">Contact Us</h1>
                  <p className="text-xs text-stone-500 mt-1">
                    Direct access to the Sparkle Jewelry showroom and customer grievance desk.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EDE3D2] space-y-2">
                    <div className="font-bold text-sm text-stone-900 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#C68A4C]" />
                      <span>Physical Store & Registered Office</span>
                    </div>
                    <div className="text-xs text-stone-600 leading-relaxed">
                      <strong>Sparkle Jewelry</strong><br />
                      Sullia Centre Complex, 3rd Floor,<br />
                      Opposite KSRTC Bus Stand, Main Road,<br />
                      Sullia, Dakshina Kannada District,<br />
                      Karnataka, India — <strong>574239</strong>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#EDE3D2] space-y-2">
                    <div className="font-bold text-sm text-stone-900 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-emerald-600" />
                      <span>Phone, WhatsApp & Email</span>
                    </div>
                    <div className="text-xs text-stone-600 space-y-1.5 leading-relaxed">
                      <div>
                        <strong>Telephone / Call:</strong>{' '}
                        <a href="tel:+918921844922" className="text-emerald-700 font-mono font-bold hover:underline">
                          +91 89218 44922
                        </a>
                      </div>
                      <div>
                        <strong>WhatsApp Support:</strong>{' '}
                        <a href="https://wa.me/918921844922" className="text-emerald-700 font-bold hover:underline">
                          +91 89218 44922
                        </a>
                      </div>
                      <div>
                        <strong>Customer Support Email:</strong>{' '}
                        <a href="mailto:contact@sulliajewellery.com" className="text-amber-800 font-medium hover:underline">
                          contact@sulliajewellery.com
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2">
                  <div className="font-bold text-stone-900 flex items-center gap-2 text-xs">
                    <Clock className="w-4 h-4 text-[#C68A4C]" />
                    <span>Store Operating & Order Processing Hours</span>
                  </div>
                  <div className="text-xs text-stone-600 space-y-1 leading-relaxed">
                    <div>• <strong>Monday to Saturday:</strong> 9:30 AM to 8:00 PM IST</div>
                    <div>• <strong>Sunday:</strong> 10:00 AM to 6:00 PM IST</div>
                    <div>• <strong>Courier Dispatch Cutoff:</strong> 5:00 PM IST (Orders placed before 5 PM dispatch on the same day).</div>
                    <div>• <strong>Sullia Town Local Deliveries:</strong> Dispatched within 2 to 4 hours daily until 7:00 PM.</div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: SHIPPING & DELIVERY */}
            {activeTab === 'shipping' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-stone-100 pb-4">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#C68A4C] mb-1">Logistics & Courier Norms</div>
                  <h1 className="font-serif font-bold text-2xl text-stone-900">Shipping & Delivery Policy</h1>
                  <p className="text-xs text-stone-500 mt-1">
                    Transparent, secure, and tamper-proof delivery timelines for local and pan-India shipments.
                  </p>
                </div>

                <div className="space-y-4 text-xs text-stone-700 leading-relaxed">
                  <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-2">
                    <h3 className="font-bold text-emerald-950 text-sm flex items-center gap-2">
                      <span>🛵 1. Sullia Local Town Delivery (PIN: 574239)</span>
                      <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded font-bold">SAME-DAY</span>
                    </h3>
                    <ul className="list-disc pl-5 space-y-1 text-emerald-900 text-xs">
                      <li><strong>Turnaround Time:</strong> 2 to 4 hours from order placement during showroom working hours.</li>
                      <li><strong>Doorstep Verification OTP:</strong> Deliveries are executed by dedicated shop bike delivery riders. The customer must verify the 4-digit OTP shown on their order screen upon receiving the package.</li>
                      <li><strong>Delivery Fee:</strong> <strong>FREE</strong> for all orders above ₹499 (nominal ₹30 fee applies for orders below ₹499).</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-xl space-y-2">
                    <h3 className="font-bold text-blue-950 text-sm flex items-center gap-2">
                      <span>🚚 2. Karnataka State & Pan-India Courier Shipping</span>
                      <span className="text-[10px] bg-blue-200 text-blue-900 px-2 py-0.5 rounded font-bold">SHIPROCKET</span>
                    </h3>
                    <ul className="list-disc pl-5 space-y-1.5 text-blue-950 text-xs">
                      <li><strong>Carrier Partners:</strong> Dispatched via Shiprocket through Delhivery Express, Blue Dart, Shadowfax, DTDC, and India Post Speed Post.</li>
                      <li><strong>Transit Durations:</strong>
                        <div className="mt-1 pl-2 space-y-0.5 text-stone-600">
                          <div>• <em>Dakshina Kannada / Udupi / Kodagu (Coorg):</em> 1 to 2 business days.</div>
                          <div>• <em>Bengaluru, Mysuru, Hubballi & Karnataka State:</em> 2 to 3 business days.</div>
                          <div>• <em>Rest of India (Metros & Tier 1/2 Cities):</em> 3 to 5 business days.</div>
                        </div>
                      </li>
                      <li><strong>Courier Shipping Charges:</strong> Flat ₹60 per order across Karnataka. <strong>FREE shipping on all orders above ₹1,499.</strong></li>
                      <li><strong>Tracking:</strong> Real-time AWB tracking number with scannable barcode sent via automated SMS and WhatsApp as soon as parcel is handed to courier van.</li>
                    </ul>
                  </div>

                  <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-1.5">
                    <h3 className="font-bold text-stone-900 text-sm">📦 3. Packaging & Transit Safety</h3>
                    <p className="text-xs text-stone-600">
                      All jewellery pieces are secured in custom velvet boxes with tamper-evident waterproof outer packaging. To prevent unauthorized inspection, the outer carton has no external markings of high-value jewellery.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: REFUND & RETURNS */}
            {activeTab === 'refund' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-stone-100 pb-4">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#C68A4C] mb-1">Customer Protection & Returns</div>
                  <h1 className="font-serif font-bold text-2xl text-stone-900">Refund, Return & Cancellation Policy</h1>
                  <p className="text-xs text-stone-500 mt-1">
                    Clear policies for 7-day doorstep replacement for transit damages, jewellery care standards, and order cancellation.
                  </p>
                </div>

                <div className="space-y-4 text-xs text-stone-700 leading-relaxed">
                  <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-1.5">
                    <h3 className="font-bold text-stone-900 text-sm">🛑 1. Order Cancellation</h3>
                    <p className="text-xs text-stone-600">
                      Customers can cancel their order free of charge at any time prior to package dispatch by calling or messaging our helpline (+91 89218 44922). 100% of prepaid funds will be immediately refunded. Once an order is assigned to a courier and dispatched with an AWB, cancellation can only be accepted upon return to origin.
                    </p>
                  </div>

                  <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-1.5">
                    <h3 className="font-bold text-emerald-950 text-sm flex items-center gap-2">
                      <span>🔄 2. 7-Day Doorstep Replacement Guarantee</span>
                      <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded font-bold">100% REPLACEMENT</span>
                    </h3>
                    <p className="text-xs text-emerald-950">
                      If an item arrives damaged in transit, defective, or incorrect in design, we offer a <strong>100% free doorstep replacement</strong> within 7 days of delivery.
                    </p>
                    <p className="text-[11px] text-stone-600 mt-1">
                      <strong>Unboxing Video Requirement:</strong> To facilitate courier claims, customers are requested to record a continuous unboxing video of the sealed parcel from package opening without cuts or edits.
                    </p>
                  </div>

                  <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-1.5">
                    <h3 className="font-bold text-stone-900 text-sm">💎 3. Jewellery Care & Polish Durability</h3>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      Our 1-Gram Micro Gold and 18K Anti-Tarnish jewellery is crafted using high-grade micro-plating and PVD technology for long-lasting luster. Since imitation and micro-gold jewellery longevity depends strictly on personal care, wear frequency, sweat pH, and storage conditions, <strong>we do not offer free re-polishing services, polish renewal, or post-wear warranties once jewellery has been worn</strong>.
                    </p>
                    <p className="text-[11px] text-stone-500 mt-1">
                      <strong>Recommended Care:</strong> Avoid direct contact with perfumes, hairsprays, sanitizers, swimming pool chlorine, and harsh detergents. Store each piece dry in the provided luxury velvet pouch.
                    </p>
                  </div>

                  <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-1.5">
                    <h3 className="font-bold text-stone-900 text-sm">💰 4. Refund Settlement Timelines</h3>
                    <p className="text-xs text-stone-600">
                      Approved refunds are initiated via the official Razorpay payment gateway to the customer's original mode of payment (UPI ID, Debit/Credit Card, or NetBanking). Funds typically reflect within <strong>5 to 7 business days</strong> as per standard Reserve Bank of India (RBI) interbank clearing cycles.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: TERMS & CONDITIONS */}
            {activeTab === 'terms' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-stone-100 pb-4">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#C68A4C] mb-1">Commercial Usage Agreement</div>
                  <h1 className="font-serif font-bold text-2xl text-stone-900">Terms & Conditions</h1>
                  <p className="text-xs text-stone-500 mt-1">
                    Legal terms governing the purchase and browsing of goods on Sparkle Jewelry.
                  </p>
                </div>

                <div className="space-y-3 text-xs text-stone-700 leading-relaxed">
                  <div>
                    <h4 className="font-bold text-stone-900">1. Nature of Jewellery Products</h4>
                    <p className="text-stone-600 mt-0.5">
                      All products listed on this website are categorized as 1-Gram Micro Gold Plated Jewellery, 18K PVD Anti-Tarnish Stainless Steel Jewellery, or Designer Imitation Ornaments. They are fashion imitation jewelry designed to replicate 22K gold designs, and are NOT solid 22K/24K bullion. Weights and stone carats indicated are approximate.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-stone-900">2. Pricing, Taxes & Orders</h4>
                    <p className="text-stone-600 mt-0.5">
                      All product prices are quoted in Indian Rupees (INR ₹) inclusive of all applicable GST taxes. We reserve the right to refuse or cancel orders arising from inadvertent typographical errors or inventory unavailability.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-stone-900">3. Payment Processing</h4>
                    <p className="text-stone-600 mt-0.5">
                      Online transactions are processed via Razorpay Software Private Limited, an authorized payment aggregator compliant with RBI guidelines and PCI-DSS Level 1 security standards.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-stone-900">4. Doorstep OTP Handover</h4>
                    <p className="text-stone-600 mt-0.5">
                      For Sullia town deliveries, the customer must present the 4-digit Doorstep Delivery OTP generated on their order screen to the rider upon receipt. Deliveries without OTP verification cannot be released.
                    </p>
                  </div>

                  <div className="p-4 bg-stone-100 rounded-xl border border-stone-300 text-stone-900">
                    <h4 className="font-bold text-sm">5. Governing Law & Legal Jurisdiction</h4>
                    <p className="text-xs text-stone-700 mt-1">
                      These Terms of Service and any purchase contracts shall be construed in accordance with the laws of India. Any legal claims, disputes, or proceedings arising out of transactions on this site shall be subject to the exclusive jurisdiction of the competent courts in <strong>Sullia / Mangaluru, Dakshina Kannada District, Karnataka</strong>.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 5: PRIVACY POLICY */}
            {activeTab === 'privacy' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="border-b border-stone-100 pb-4">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[#C68A4C] mb-1">Customer Privacy & Trust</div>
                  <h1 className="font-serif font-bold text-2xl text-stone-900">Privacy Policy</h1>
                  <p className="text-xs text-stone-500 mt-1">
                    How Sparkle Jewelry collects, secures, and handles your personal information.
                  </p>
                </div>

                <div className="space-y-4 text-xs text-stone-700 leading-relaxed">
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-300 text-emerald-950">
                    <h4 className="font-bold text-sm flex items-center gap-2 text-emerald-900">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Strict Zero-Spam & Zero Data Selling Guarantee</span>
                    </h4>
                    <p className="text-xs text-emerald-900 mt-1 leading-relaxed">
                      We <strong>NEVER</strong> sell, rent, lease, or share your mobile number, address, or name with third-party telemarketers, credit card tele-callers, or spam advertisers. Your phone number is used solely for order verification, delivery rider coordination, and AWB tracking notifications.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-stone-900">1. Information We Collect</h4>
                    <p className="text-stone-600 mt-0.5">
                      To deliver your jewellery orders, we collect your full name, mobile number, doorstep shipping address, and pincode. This information is utilized strictly to print retail GST tax invoices and generate courier waybills.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-stone-900">2. Financial Data Protection (Zero Storage)</h4>
                    <p className="text-stone-600 mt-0.5">
                      Sparkle Jewelry <strong>DOES NOT</strong> store or handle customer credit card numbers, debit card details, CVV numbers, net banking passwords, or UPI PINs. All payment transactions take place within Razorpay's RBI-regulated, 256-bit SSL encrypted PCI-DSS Level 1 compliant gateway.
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-stone-900">3. Cookies & Session Storage</h4>
                    <p className="text-stone-600 mt-0.5">
                      We use lightweight browser storage only to keep track of your active shopping cart, wishlist, and pincode checks. We do not use third-party behavioral advertising trackers.
                    </p>
                  </div>

                  <div className="p-4 bg-stone-50 rounded-xl border border-stone-200">
                    <h4 className="font-bold text-stone-900">4. Grievance Redressal Officer</h4>
                    <p className="text-stone-600 mt-1 text-xs">
                      Under Indian Information Technology (IT) Rules, for any queries or concerns regarding personal data, please contact our appointed officer:<br />
                      <strong>Name:</strong> Store Manager, Sparkle Jewelry<br />
                      <strong>Address:</strong> Sullia Centre Complex, 3rd Floor, Opposite KSRTC Bus Stand, Sullia, DK, Karnataka - 574239<br />
                      <strong>Email:</strong> privacy@sulliajewellery.com | <strong>Helpline:</strong> +91 89218 44922
                    </p>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-stone-900 text-stone-400 text-xs py-8 px-4 sm:px-8 border-t border-stone-800 mt-12 text-center">
        <div className="max-w-6xl mx-auto space-y-2">
          <p>© {new Date().getFullYear()} Sparkle Jewelry, Sullia, Karnataka. All rights reserved.</p>
          <p className="text-[11px] text-stone-500">
            Jurisdiction: Dakshina Kannada District, Karnataka. Regulated under Indian E-Commerce Consumer Protection Guidelines.
          </p>
        </div>
      </footer>

      {/* Drawers */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
        onClearCart={clearCart}
      />

      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        onOpenCart={() => setIsCartOpen(true)}
      />

      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
        wishlistCount={wishlistCount}
        onOpenWishlist={() => setIsWishlistOpen(true)}
      />
    </div>
  );
}

export default function PoliciesView({ initialTab = 'contact' }: PoliciesViewProps) {
  return (
    <Suspense fallback={<div className="p-12 text-center text-stone-500 text-xs">Loading Store Policy...</div>}>
      <PoliciesViewInternal initialTab={initialTab} />
    </Suspense>
  );
}
