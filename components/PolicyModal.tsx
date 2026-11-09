'use client';

import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  Truck,
  RotateCcw,
  FileText,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle2,
  Lock,
  ExternalLink
} from 'lucide-react';

export type PolicyTab = 'contact' | 'shipping' | 'refund' | 'terms' | 'privacy';

interface PolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: PolicyTab;
}

export default function PolicyModal({
  isOpen,
  onClose,
  initialTab = 'contact'
}: PolicyModalProps) {
  const [activeTab, setActiveTab] = useState<PolicyTab>(initialTab);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border border-stone-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-200 bg-[#FAF4EB] flex justify-between items-center">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#1E130C] text-[#FAF4EB] flex items-center justify-center font-serif font-bold text-xs">
              SJ
            </div>
            <div>
              <h2 className="font-serif font-bold text-base sm:text-lg text-stone-900">
                Sparkle Jewelry • Store Policies
              </h2>
              <p className="text-[11px] text-stone-500">
                Sullia, Dakshina Kannada, Karnataka — Legal & Customer Compliance
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-stone-200 hover:bg-stone-300 text-stone-700 flex items-center justify-center transition-colors"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-200 bg-stone-50 overflow-x-auto no-scrollbar px-2 sm:px-4 text-xs font-semibold">
          {[
            { id: 'contact', label: 'Contact Us', icon: Phone },
            { id: 'shipping', label: 'Shipping & Delivery', icon: Truck },
            { id: 'refund', label: 'Refund & Returns', icon: RotateCcw },
            { id: 'terms', label: 'Terms & Conditions', icon: FileText },
            { id: 'privacy', label: 'Privacy Policy', icon: Lock }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as PolicyTab)}
                className={`py-3 px-3 sm:px-4 flex items-center gap-1.5 transition-all whitespace-nowrap shrink-0 border-b-2 ${
                  isActive
                    ? 'border-[#C68A4C] text-[#7A5328] font-bold bg-white'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#C68A4C]' : 'text-stone-400'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs text-stone-700 flex-1 leading-relaxed">
          {/* TAB 1: CONTACT US */}
          {activeTab === 'contact' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 text-amber-950">
                <h3 className="font-serif font-bold text-sm text-[#5A3F29] mb-1">
                  Official Merchant Identity & Customer Support
                </h3>
                <p className="text-[11px] text-[#7A5B40]">
                  Sparkle Jewelry is a registered retail jewelry enterprise operating out of Sullia Taluk, Dakshina Kannada District, Karnataka.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 space-y-1.5">
                  <div className="font-bold text-stone-900 flex items-center gap-1.5 text-xs">
                    <MapPin className="w-4 h-4 text-[#C68A4C]" />
                    <span>Physical Store & Registered Office</span>
                  </div>
                  <div className="text-[11px] text-stone-600 pl-5 leading-normal">
                    <strong>Sparkle Jewelry</strong><br />
                    Sullia Centre Complex, 3rd Floor,<br />
                    Opposite KSRTC Bus Stand, Main Road,<br />
                    Sullia, Dakshina Kannada, Karnataka — 574239
                  </div>
                </div>

                <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 space-y-1.5">
                  <div className="font-bold text-stone-900 flex items-center gap-1.5 text-xs">
                    <Phone className="w-4 h-4 text-emerald-600" />
                    <span>Customer Care & WhatsApp Desk</span>
                  </div>
                  <div className="text-[11px] text-stone-600 pl-5 space-y-1">
                    <div>
                      <strong>Telephone / Mobile:</strong>{' '}
                      <a href="tel:+918921844922" className="text-emerald-700 font-mono font-bold hover:underline">
                        +91 89218 44922
                      </a>
                    </div>
                    <div>
                      <strong>WhatsApp Support:</strong>{' '}
                      <a
                        href="https://wa.me/918921844922"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-700 font-bold hover:underline"
                      >
                        +91 89218 44922 (Instant Reply)
                      </a>
                    </div>
                    <div>
                      <strong>Official Email:</strong>{' '}
                      <a href="mailto:contact@sulliajewellery.com" className="text-amber-800 hover:underline">
                        contact@sulliajewellery.com
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-stone-50 p-3.5 rounded-xl border border-stone-200 space-y-1">
                <div className="font-bold text-stone-900 flex items-center gap-1.5 text-xs">
                  <Clock className="w-4 h-4 text-[#C68A4C]" />
                  <span>Store Working Hours & Dispatch Cutoff</span>
                </div>
                <div className="text-[11px] text-stone-600 pl-5 leading-relaxed">
                  • <strong>Monday to Saturday:</strong> 9:30 AM to 8:00 PM IST<br />
                  • <strong>Sunday:</strong> 10:00 AM to 6:00 PM IST<br />
                  • <strong>Daily Courier Pickup Cutoff:</strong> 5:00 PM IST (Orders placed before 5 PM dispatch same day).<br />
                  • <strong>Sullia Town Local Deliveries:</strong> Dispatched until 7:00 PM daily.
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SHIPPING & DELIVERY POLICY */}
          {activeTab === 'shipping' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 text-amber-950">
                <h3 className="font-serif font-bold text-sm text-[#5A3F29] mb-1">
                  Shipping & Delivery Timelines (Flipkart / Amazon Logistics Standard)
                </h3>
                <p className="text-[11px] text-[#7A5B40]">
                  Every parcel is hand-inspected, packed in luxury velvet jewelry cases with tamper-proof outer seals, and dispatched from our Sullia counter.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <h4 className="font-bold text-stone-900 text-xs mb-1 flex items-center gap-1.5">
                    <span>🛵 1. Sullia Town Local Delivery (PIN: 574239)</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded font-bold">SAME-DAY</span>
                  </h4>
                  <ul className="list-disc pl-5 text-[11px] text-stone-600 space-y-1">
                    <li><strong>Delivery Window:</strong> 2 to 4 hours from order placement (for orders placed before 7:00 PM).</li>
                    <li><strong>Handover Verification:</strong> Deliveries are executed by dedicated shop bike delivery riders. A secure 4-digit Doorstep Verification OTP generated upon checkout must be confirmed upon delivery.</li>
                    <li><strong>Delivery Charges:</strong> FREE for all orders above ₹499. A nominal fee of ₹30 applies to orders below ₹499.</li>
                  </ul>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <h4 className="font-bold text-stone-900 text-xs mb-1 flex items-center gap-1.5">
                    <span>🚚 2. Karnataka State & Pan-India Express Courier Shipping</span>
                    <span className="bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded font-bold">SHIPROCKET EXPRESS</span>
                  </h4>
                  <ul className="list-disc pl-5 text-[11px] text-stone-600 space-y-1">
                    <li><strong>Logistics Partners:</strong> Delhivery Express, Blue Dart, Shadowfax Surface, DTDC Air, and India Post Speed Post.</li>
                    <li><strong>Transit Estimates:</strong>
                      <div className="mt-1 pl-2 space-y-0.5">
                        <div>• <em>Dakshina Kannada / Udupi / Kodagu (Coorg):</em> 1 to 2 business days.</div>
                        <div>• <em>Bengaluru, Mysuru, Hubballi & Karnataka State:</em> 2 to 3 business days.</div>
                        <div>• <em>Rest of India (Tier 1 & Tier 2 Cities):</em> 3 to 5 business days.</div>
                      </div>
                    </li>
                    <li><strong>Shipping Fee:</strong> Flat ₹60 express freight across Karnataka. <strong>FREE shipping on all orders above ₹1,499.</strong></li>
                    <li><strong>Tracking:</strong> Real-time AWB tracking number with scannable barcode sent via SMS and WhatsApp as soon as parcel is handed to courier van.</li>
                  </ul>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <h4 className="font-bold text-stone-900 text-xs mb-1">📦 3. Discreet & Tamper-Proof Packaging</h4>
                  <p className="text-[11px] text-stone-600 leading-relaxed">
                    All jewellery is packed securely inside custom foam-lined boxes with authentic velvet jewellery cases. Outer packaging has no mention of high-value jewelry to prevent pilferage during transit.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: REFUND & RETURNS */}
          {activeTab === 'refund' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 text-amber-950">
                <h3 className="font-serif font-bold text-sm text-[#5A3F29] mb-1">
                  Cancellation, Return & 1-Year Polish Guarantee Policy
                </h3>
                <p className="text-[11px] text-[#7A5B40]">
                  We stand 100% behind the quality and craftsmanship of our 1-Gram Micro Gold and 18K Anti-Tarnish jewellery.
                </p>
              </div>

              <div className="space-y-3">
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <h4 className="font-bold text-stone-900 text-xs mb-1 flex items-center gap-1.5">
                    <span>🛑 1. Order Cancellation Policy</span>
                  </h4>
                  <ul className="list-disc pl-5 text-[11px] text-stone-600 space-y-1">
                    <li><strong>Before Dispatch:</strong> You may cancel an order free of charge at any time before the courier pickup is scheduled. Call or WhatsApp +91 89218 44922 with your Order Number (e.g. SLJ-123456). Online payments will be refunded 100% immediately.</li>
                    <li><strong>After Dispatch:</strong> Once a carrier AWB tracking waybill is generated and handover is completed, cancellation is subject to return freight deduction.</li>
                  </ul>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <h4 className="font-bold text-stone-900 text-xs mb-1 flex items-center gap-1.5">
                    <span>🔄 2. 7-Day Doorstep Replacement Guarantee</span>
                    <span className="bg-emerald-100 text-emerald-800 text-[10px] px-2 py-0.5 rounded font-bold">100% FREE REPLACEMENT</span>
                  </h4>
                  <ul className="list-disc pl-5 text-[11px] text-stone-600 space-y-1">
                    <li>If any item arrives damaged in transit, defective, or incorrect piece received, we provide a <strong>100% free doorstep replacement</strong> or full refund within 7 days of delivery.</li>
                    <li><strong>Mandatory Unboxing Video:</strong> In accordance with Indian courier logistics norms for jewellery, customers are required to record a continuous unboxing video from sealed package opening without cuts or edits to claim transit damage.</li>
                  </ul>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <h4 className="font-bold text-stone-900 text-xs mb-1 flex items-center gap-1.5">
                    <span>✨ 3. Authentic 1-Year Shine & Polish Warranty</span>
                  </h4>
                  <p className="text-[11px] text-stone-600 leading-relaxed">
                    Every piece of 1-Gram Gold & Anti-Tarnish jewellery includes an official Guarantee Card. We guarantee gold polish and anti-tarnish coating for 12 months under normal wear (avoid direct contact with strong industrial chemicals or bleaches). Free repolishing or replacement is provided if premature discoloration occurs.
                  </p>
                </div>

                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                  <h4 className="font-bold text-stone-900 text-xs mb-1 flex items-center gap-1.5">
                    <span>💰 4. Refund Process & Settlement Timelines</span>
                  </h4>
                  <ul className="list-disc pl-5 text-[11px] text-stone-600 space-y-1">
                    <li>Approved refunds are processed through the official Razorpay gateway directly to your original payment source (UPI, Credit/Debit Card, or NetBanking).</li>
                    <li><strong>Refund Settlement Time:</strong> 5 to 7 business days as per standard RBI banking timelines.</li>
                    <li>For Cash on Delivery orders, refunds are transferred directly to the customer's verified UPI ID or Bank NEFT upon receipt of return.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: TERMS & CONDITIONS */}
          {activeTab === 'terms' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 text-amber-950">
                <h3 className="font-serif font-bold text-sm text-[#5A3F29] mb-1">
                  Terms of Service & Commercial Usage Agreement
                </h3>
                <p className="text-[11px] text-[#7A5B40]">
                  By browsing, accessing, or placing an order on Sparkle Jewelry, you agree to be bound by the terms outlined below.
                </p>
              </div>

              <div className="space-y-3 text-[11px] text-stone-600">
                <div>
                  <strong className="text-stone-900">1. Nature of Jewellery Products:</strong><br />
                  All jewellery items sold on this website are categorized as <strong>1-Gram Micro Gold Plated Jewellery</strong>, <strong>18K PVD Anti-Tarnish Stainless Steel Jewellery</strong>, or <strong>Designer Imitation Ornaments</strong>. These are fashion imitation jewellery crafted to mirror real 22K gold designs, but are NOT solid 22K/24K bullion. Weights and stone carats indicated are approximate.
                </div>

                <div>
                  <strong className="text-stone-900">2. Pricing & Payments:</strong><br />
                  All prices are quoted in Indian Rupees (INR ₹) and are inclusive of applicable GST taxes. Payments are securely processed via Razorpay (PCI-DSS Level 1 compliant gateway). We reserve the right to decline or cancel orders resulting from typographical pricing errors or system faults.
                </div>

                <div>
                  <strong className="text-stone-900">3. Doorstep Handover & OTP:</strong><br />
                  For local deliveries in Sullia town, the customer must present the 4-digit Doorstep Delivery OTP generated on their order screen to the rider upon receipt. Handover without OTP verification is strictly prohibited to prevent misplacement.
                </div>

                <div>
                  <strong className="text-stone-900">4. Intellectual Property:</strong><br />
                  The trade name "Sparkle Jewelry", original product photography, logos, and descriptions are protected under Indian intellectual property laws. Unauthorized duplication or commercial misuse is prohibited.
                </div>

                <div className="p-3 bg-stone-100 rounded-lg border border-stone-300 text-stone-900">
                  <strong className="font-bold">5. Governing Law & Legal Jurisdiction:</strong><br />
                  This user agreement and any disputes, controversies, or claims arising out of orders placed on this website shall be governed exclusively by the laws of the Republic of India. The competent courts in <strong>Sullia / Mangaluru, Dakshina Kannada District, Karnataka</strong> shall have exclusive jurisdiction over any legal proceedings.
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: PRIVACY POLICY */}
          {activeTab === 'privacy' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-3.5 text-amber-950">
                <h3 className="font-serif font-bold text-sm text-[#5A3F29] mb-1">
                  Customer Privacy & Data Protection Commitment
                </h3>
                <p className="text-[11px] text-[#7A5B40]">
                  Your trust is our most valuable asset. We follow strict Indian IT Act guidelines and ensure your personal data is never misused.
                </p>
              </div>

              <div className="space-y-3 text-[11px] text-stone-600">
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-950">
                  <strong className="text-emerald-900 flex items-center gap-1.5 font-bold mb-1">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Strict No-Spam & Zero-Selling Policy</span>
                  </strong>
                  We <strong>NEVER</strong> sell, rent, lease, or share your mobile number, delivery address, or email to third-party telemarketers, loan callers, or spam advertisers. Your phone number is used strictly for delivery rider communication and tracking.
                </div>

                <div>
                  <strong className="text-stone-900">1. Information We Collect:</strong><br />
                  When you place an order, we collect your full name, phone number, doorstep delivery address, and pincode. This data is utilized solely for courier waybill generation, delivery routing, and GST tax invoice generation.
                </div>

                <div>
                  <strong className="text-stone-900">2. Financial Data Protection (Zero Storage):</strong><br />
                  We <strong>DO NOT</strong> store, collect, or have access to customer bank account details, credit card / debit card numbers, CVV codes, or UPI PINs. All payment transactions occur inside Razorpay's RBI-regulated, 256-bit SSL encrypted PCI-DSS Level 1 compliant gateway.
                </div>

                <div>
                  <strong className="text-stone-900">3. Cookies & Local Storage:</strong><br />
                  We use lightweight browser storage only to keep track of your shopping bag items, wishlist, and pincode check. No invasive third-party tracking scripts are utilized.
                </div>

                <div>
                  <strong className="text-stone-900">4. Grievance Officer Contact:</strong><br />
                  In compliance with the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, for any questions regarding your data privacy, please contact:<br />
                  <strong>Grievance Officer:</strong> Store Manager, Sparkle Jewelry<br />
                  <strong>Address:</strong> Sullia Centre Complex, 3rd Floor, Opp. KSRTC Bus Stand, Sullia, DK, Karnataka - 574239<br />
                  <strong>Email:</strong> privacy@sulliajewellery.com / contact@sulliajewellery.com | <strong>Phone:</strong> +91 89218 44922
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-stone-50 border-t border-stone-200 flex justify-between items-center text-xs">
          <div className="text-[11px] text-stone-500 flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>100% RBI & Razorpay Compliant Merchant</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-[#1E130C] hover:bg-[#382315] text-white text-xs font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
