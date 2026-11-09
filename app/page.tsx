'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '../components/Navbar';
import TrustBanner from '../components/TrustBanner';
import ProductCard from '../components/ProductCard';
import PincodeCheckerModal from '../components/PincodeCheckerModal';
import CartDrawer from '../components/CartDrawer';
import WishlistDrawer from '../components/WishlistDrawer';
import MobileBottomNav from '../components/MobileBottomNav';
import CategoriesSheet from '../components/CategoriesSheet';
import StoreLocationModal from '../components/StoreLocationModal';
import AccountModal from '../components/AccountModal';
import PolicyModal, { PolicyTab } from '../components/PolicyModal';
import { fetchProducts } from '../lib/api';
import { useCart } from '../lib/cart';
import { useWishlist } from '../lib/wishlist';
import { Product, JewelleryCategory } from '../types';
import { Sparkles, Droplets, Diamond, Search, PhoneCall, MapPin, Heart, ShieldCheck, Truck, Lock } from 'lucide-react';

export default function StorefrontPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<JewelleryCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Cart from shared store & Modal State
  const { cart, addToCart, updateQuantity, removeItem, clearCart, totalCount: cartItemCount } = useCart();
  const { totalCount: wishlistCount } = useWishlist();
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isPincodeModalOpen, setIsPincodeModalOpen] = useState(false);
  const [deliveryPincode, setDeliveryPincode] = useState('574239'); // Default Sullia
  const [recentlyAddedId, setRecentlyAddedId] = useState<string | null>(null);

  // Mobile Bottom Navigation States
  const [mobileTab, setMobileTab] = useState<'home' | 'categories' | 'store' | 'account'>('home');
  const [isCategoriesSheetOpen, setIsCategoriesSheetOpen] = useState(false);
  const [isStoreModalOpen, setIsStoreModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);
  const [policyTab, setPolicyTab] = useState<PolicyTab>('contact');

  const handleOpenPolicy = (tab: PolicyTab) => {
    setPolicyTab(tab);
    setIsPolicyModalOpen(true);
  };

  const handleMobileTabSelect = (tab: 'home' | 'categories' | 'store' | 'account') => {
    setMobileTab(tab);
    if (tab === 'home') {
      setActiveCategory('all');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (tab === 'categories') {
      setIsCategoriesSheetOpen(true);
    } else if (tab === 'store') {
      setIsStoreModalOpen(true);
    } else if (tab === 'account') {
      setIsAccountModalOpen(true);
    }
  };

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      const data = await fetchProducts();
      setProducts(data);
      setLoading(false);
    }
    loadData();

    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const q = params.get('search');
      if (q) setSearchQuery(q);
      const cat = params.get('category');
      if (cat && ['1-gram-gold', 'anti-tarnish', 'fashion-imitation'].includes(cat)) {
        setActiveCategory(cat as any);
      }
    }
  }, []);

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    setRecentlyAddedId(product.id);
    setTimeout(() => setRecentlyAddedId(null), 1500);
  };

  // Filtered Products
  const filteredProducts = products.filter((p) => {
    const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.material.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col text-stone-900 w-full max-w-full overflow-x-hidden pb-16 md:pb-0">
      {/* Navigation */}
      <Navbar
        cartCount={cartItemCount}
        onOpenCart={() => setIsCartOpen(true)}
        wishlistCount={wishlistCount}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenAccount={() => setIsAccountModalOpen(true)}
        onOpenPincodeModal={() => setIsPincodeModalOpen(true)}
        selectedPincode={deliveryPincode}
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
        }}
        onSearchSubmit={() => {
          const el = document.getElementById('collection-grid');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Hero Banner - Responsive WebP Background with Zero Pixelation */}
      <section className="hero-luxury-banner hero-bg-responsive relative w-full max-w-full overflow-hidden border-b border-[#2C1A0E] min-h-[420px] sm:min-h-[460px] md:min-h-[500px] flex items-center">
        {/* Left Gradient Overlay to Ensure Crisp Typography Readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#140C07]/95 via-[#140C07]/60 to-transparent md:w-[60%] lg:w-[55%] w-full pointer-events-none"></div>

        {/* Hero Content Overlay */}
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10 sm:py-16 w-full relative z-10">
          <div className="max-w-xl space-y-4 sm:space-y-5 text-left">
            {/* Header Accent Line */}
            <div className="flex items-center gap-2.5">
              <span className="w-6 sm:w-10 h-[1px] bg-[#C49B66]/80"></span>
              <span className="text-[10px] sm:text-xs tracking-[0.25em] uppercase text-[#C49B66] font-medium font-sans">
                SPARKLE JEWELRY
              </span>
              <span className="w-6 sm:w-10 h-[1px] bg-[#C49B66]/80"></span>
            </div>

            {/* Main Title */}
            <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl text-[#FAF4EB] tracking-tight leading-[1.15]">
              Timeless Beauty,<br />
              <span className="italic font-serif font-normal text-[#C49B66]">Always.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-[#D4C3B3] text-xs sm:text-sm font-sans font-normal leading-relaxed max-w-md">
              Discover exquisite 1-gram gold jewellery
            </p>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  setActiveCategory('all');
                  const el = document.getElementById('collection-grid');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="bg-[#C68A4C] hover:bg-[#B5793C] text-[#1E130C] font-semibold text-xs sm:text-sm px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg shadow-sm transition-all flex items-center gap-2 active:scale-95"
              >
                <span>Shop Collection</span>
                <span>→</span>
              </button>

              <button
                onClick={() => setIsCategoriesSheetOpen(true)}
                className="border border-[#7A583E] hover:border-[#C68A4C] text-[#F3E8DE] hover:bg-white/5 font-medium text-xs sm:text-sm px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg transition-all active:scale-95"
              >
                Explore Collections
              </button>
            </div>

            {/* 3 Trust Features with Dividers */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-5 sm:pt-6 text-[11px] sm:text-xs text-[#E3D3C4] border-t border-[#311C0F]/80">
              <div className="flex items-center gap-2">
                <Diamond className="w-4 h-4 text-[#C68A4C] stroke-[1.8]" />
                <span className="font-medium">1-Gram Gold</span>
              </div>
              <span className="w-[1px] h-3.5 bg-[#4A3222] hidden sm:inline-block"></span>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#C68A4C] stroke-[1.8]" />
                <span className="font-medium">Waterproof</span>
              </div>
              <span className="w-[1px] h-3.5 bg-[#4A3222] hidden sm:inline-block"></span>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-[#C68A4C] stroke-[1.8]" />
                <span className="font-medium">Local Delivery</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main id="collection-grid" className="max-w-6xl mx-auto px-3 sm:px-6 py-6 sm:py-8 flex-1 w-full max-w-full overflow-hidden space-y-5 sm:space-y-6">
        {/* Category Filter Section & Active Search Feedback */}
        <div className="space-y-3.5 w-full max-w-full overflow-hidden">
          {searchQuery && (
            <div className="flex items-center gap-2 text-xs text-[#5A3F29] bg-[#F9F3EA] border border-[#E0D3C1] px-3.5 py-1.5 rounded-full w-fit">
              <span>Showing results for: <strong>"{searchQuery}"</strong> ({filteredProducts.length} items)</span>
              <button
                onClick={() => setSearchQuery('')}
                className="text-stone-400 hover:text-[#1E130C] text-xs ml-1 font-bold"
                title="Clear filter"
              >
                ✕ Clear
              </button>
            </div>
          )}

          {/* 3 Pillar Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar w-full max-w-full touch-pan-x">
            <button
              onClick={() => setActiveCategory('all')}
              className={`px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === 'all'
                  ? 'bg-stone-900 text-white shadow-xs'
                  : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
              }`}
            >
              All Jewellery
            </button>

            <button
              onClick={() => setActiveCategory('1-gram-gold')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === '1-gram-gold'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>✨ 1-Gram Gold Collection</span>
            </button>

            <button
              onClick={() => setActiveCategory('anti-tarnish')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === 'anti-tarnish'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
              }`}
            >
              <Droplets className="w-3.5 h-3.5" />
              <span>💧 Anti-Tarnish (Waterproof)</span>
            </button>

            <button
              onClick={() => setActiveCategory('fashion-imitation')}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                activeCategory === 'fashion-imitation'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
              }`}
            >
              <Diamond className="w-3.5 h-3.5" />
              <span>💎 Fashion & Imitation</span>
            </button>
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 py-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-stone-200 animate-pulse h-64 rounded-xl" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-stone-200 p-8 space-y-2">
            <Heart className="w-10 h-10 text-stone-300 mx-auto" />
            <h3 className="text-sm font-bold text-stone-800">No jewellery designs found</h3>
            <p className="text-xs text-stone-500">Try changing your search term or select another category.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                isAdded={recentlyAddedId === product.id}
              />
            ))}
          </div>
        )}
      </main>

      {/* Comprehensive Razorpay-Compliant E-Commerce Footer */}
      <footer className="bg-[#140D07] text-[#C9BAA9] text-xs pt-12 pb-8 px-4 sm:px-8 border-t border-[#2A1C12] mt-16 w-full max-w-full overflow-hidden">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Column 1: Brand & Craftsmanship */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#C68A4C] text-[#140D07] font-serif font-bold flex items-center justify-center text-xs">
                SJ
              </div>
              <h4 className="font-serif font-bold text-white text-base tracking-tight">Sparkle Jewelry</h4>
            </div>
            <p className="text-[#A89886] text-[11px] leading-relaxed">
              Premium 1-Gram Micro Gold Plated Jewellery, 18K PVD Shower-Safe Anti-Tarnish Daily Wear, and South Indian Bridal Imitation Jewellery in Sullia, Karnataka.
            </p>
            <div className="text-[11px] text-[#C68A4C] flex items-center gap-1.5 font-semibold">
              <ShieldCheck className="w-4 h-4 shrink-0 text-[#C68A4C]" />
              <span>100% Authentic Guarantee Included</span>
            </div>
          </div>

          {/* Column 2: Mandatory Razorpay Compliance Policies */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider text-[#C68A4C]">
              Store Policies & Legal
            </h4>
            <ul className="space-y-2 text-[11px]">
              <li>
                <button
                  onClick={() => handleOpenPolicy('contact')}
                  className="hover:text-[#E8DACB] transition-colors text-left"
                >
                  📞 Contact Us
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleOpenPolicy('shipping')}
                  className="hover:text-[#E8DACB] transition-colors text-left"
                >
                  🚚 Shipping & Delivery Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleOpenPolicy('refund')}
                  className="hover:text-[#E8DACB] transition-colors text-left"
                >
                  🔄 Refund, Return & 1-Yr Warranty
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleOpenPolicy('terms')}
                  className="hover:text-[#E8DACB] transition-colors text-left"
                >
                  📜 Terms & Conditions
                </button>
              </li>
              <li>
                <button
                  onClick={() => handleOpenPolicy('privacy')}
                  className="hover:text-[#E8DACB] transition-colors text-left"
                >
                  🔒 Privacy Policy (Zero Data Selling)
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Store & Counter Address */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider text-[#C68A4C]">
              Showroom & Counter
            </h4>
            <div className="flex items-start gap-2 text-[11px] text-[#A89886] leading-relaxed">
              <MapPin className="w-3.5 h-3.5 text-[#C68A4C] shrink-0 mt-0.5" />
              <span>
                <strong>Sparkle Jewelry</strong><br />
                Sullia Centre Complex, 3rd Floor,<br />
                Opp. KSRTC Bus Stand, Main Road,<br />
                Sullia, DK, Karnataka — 574239
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px]">
              <PhoneCall className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <a href="tel:+918921844922" className="text-emerald-400 font-mono font-bold hover:underline">
                +91 89218 44922
              </a>
            </div>
            <div className="text-[10px] text-[#8C7B6A]">
              Open Mon–Sat: 9:30 AM – 8:00 PM | Sun: 10 AM – 6 PM
            </div>
          </div>

          {/* Column 4: Payment & Logistics Security */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider text-[#C68A4C]">
              Payment & Logistics
            </h4>
            <div className="bg-[#1F150D] p-3 rounded-xl border border-[#3A2616] space-y-2 text-[11px]">
              <div className="text-white font-semibold flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-500" />
                <span>100% Secure Razorpay Gateway</span>
              </div>
              <p className="text-[10px] text-[#A89886] leading-normal">
                Supports UPI (GPay, PhonePe, Paytm), RuPay, Visa, Mastercard, NetBanking & COD.
              </p>
              <div className="pt-1 border-t border-[#3A2616] flex items-center gap-2 flex-wrap text-[9px] font-mono text-[#D8C7B5]">
                <span className="bg-[#2D1C10] px-1.5 py-0.5 rounded">UPI</span>
                <span className="bg-[#2D1C10] px-1.5 py-0.5 rounded">RuPay</span>
                <span className="bg-[#2D1C10] px-1.5 py-0.5 rounded">Cards</span>
                <span className="bg-[#2D1C10] px-1.5 py-0.5 rounded">COD</span>
              </div>
            </div>
            <p className="text-[10px] text-[#8C7B6A]">
              Express Courier via Shiprocket • Sullia Town same-day rider with OTP.
            </p>
          </div>
        </div>

        {/* Bottom Legal Copyright & Jurisdiction */}
        <div className="max-w-6xl mx-auto pt-6 mt-8 border-t border-[#2A1C12] text-center text-[10px] text-[#7A6B5C] space-y-1">
          <p>
            © {new Date().getFullYear()} Sparkle Jewelry, Sullia. All rights reserved. Registered in Karnataka, India.
          </p>
          <p className="text-[9px] text-[#635548]">
            Legal Jurisdiction: Competent courts in Sullia / Mangaluru, Dakshina Kannada District, Karnataka.
          </p>
          <div className="pt-1 flex items-center justify-center gap-3 text-[10px] flex-wrap">
            <Link href="/contact" className="hover:text-white underline">Contact</Link>
            <span>•</span>
            <Link href="/shipping-policy" className="hover:text-white underline">Shipping Policy</Link>
            <span>•</span>
            <Link href="/refund-policy" className="hover:text-white underline">Refund Policy</Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-white underline">Terms & Conditions</Link>
            <span>•</span>
            <Link href="/privacy" className="hover:text-white underline">Privacy Policy</Link>
            <span>•</span>
            <Link href="/admin" className="opacity-20 hover:opacity-100 text-stone-500 hover:text-amber-500 transition-opacity p-0.5" title="Owner Access">
              <Lock className="w-2.5 h-2.5 inline" />
            </Link>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <PincodeCheckerModal
        isOpen={isPincodeModalOpen}
        onClose={() => setIsPincodeModalOpen(false)}
        onSelectPincode={(pin) => setDeliveryPincode(pin)}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
        onClearCart={clearCart}
        defaultPincode={deliveryPincode}
      />

      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Mobile Bottom Navigation Bar (Visible only on mobile devices) */}
      <MobileBottomNav
        activeTab={mobileTab}
        onSelectTab={handleMobileTabSelect}
      />

      {/* Mobile Modals */}
      <CategoriesSheet
        isOpen={isCategoriesSheetOpen}
        onClose={() => {
          setIsCategoriesSheetOpen(false);
          setMobileTab('home');
        }}
        onSelectCategory={(cat) => {
          setActiveCategory(cat);
          const el = document.getElementById('collection-grid');
          el?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      <StoreLocationModal
        isOpen={isStoreModalOpen}
        onClose={() => {
          setIsStoreModalOpen(false);
          setMobileTab('home');
        }}
      />

      <AccountModal
        isOpen={isAccountModalOpen}
        onClose={() => {
          setIsAccountModalOpen(false);
          setMobileTab('home');
        }}
        wishlistCount={wishlistCount}
        onOpenWishlist={() => setIsWishlistOpen(true)}
      />

      {/* Razorpay & Legal Policy Modal */}
      <PolicyModal
        isOpen={isPolicyModalOpen}
        onClose={() => setIsPolicyModalOpen(false)}
        initialTab={policyTab}
      />
    </div>
  );
}
