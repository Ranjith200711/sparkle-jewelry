'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '../../../components/Navbar';
import CartDrawer from '../../../components/CartDrawer';
import WishlistDrawer from '../../../components/WishlistDrawer';
import PincodeCheckerModal from '../../../components/PincodeCheckerModal';
import MobileBottomNav from '../../../components/MobileBottomNav';
import CategoriesSheet from '../../../components/CategoriesSheet';
import StoreLocationModal from '../../../components/StoreLocationModal';
import AccountModal from '../../../components/AccountModal';
import PolicyModal, { PolicyTab } from '../../../components/PolicyModal';
import { fetchProductById, checkPincode } from '../../../lib/api';
import { useCart } from '../../../lib/cart';
import { useWishlist } from '../../../lib/wishlist';
import { Product } from '../../../types';
import {
  ChevronRight,
  ChevronLeft,
  Share2,
  Heart,
  ShoppingCart,
  Zap,
  Truck,
  ShieldCheck,
  Droplets,
  Sparkles,
  ArrowRight,
  Check,
  MessageCircle,
  HelpCircle,
  Clock,
  Layers,
  Sparkle,
  MapPin,
  Phone
} from 'lucide-react';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'detail' | 'price'>('detail');
  const [selectedSize, setSelectedSize] = useState<string>('');

  // Wishlist Management
  const { isInWishlist, toggleWishlist, totalCount: wishlistCount } = useWishlist();
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const isWishlisted = product ? isInWishlist(product.id) : false;

  // Cart Management
  const { cart, addToCart, updateQuantity, removeItem, clearCart, totalCount: cartItemCount } = useCart();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAddedFeedback, setIsAddedFeedback] = useState(false);

  // Pincode & Delivery State
  const [pincodeInput, setPincodeInput] = useState('574239');
  const [isPincodeModalOpen, setIsPincodeModalOpen] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState<{
    dateStr: string;
    description: string;
    isLocal: boolean;
    cutoffUrgency?: string;
    dispatchNotice?: string;
  }>({
    dateStr: 'TODAY (Within 2–4 Hours)',
    description: '⚡ Same Day Delivery in Sullia town via Local Shop Rider (Free on orders above ₹499)',
    isLocal: true,
  });

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

  // Load Product Data
  useEffect(() => {
    async function loadProduct() {
      if (!productId) return;
      setLoading(true);
      const data = await fetchProductById(productId);
      setProduct(data);
      if (data?.sizeOptions && data.sizeOptions.length > 0) {
        setSelectedSize(data.sizeOptions[0]);
      }
      setLoading(false);
    }
    loadProduct();
    handleCheckPincode(pincodeInput || '574239');
  }, [productId]);

  // Handle Delivery Calculation using Flipkart-style accurate logistics algorithm
  const handleCheckPincode = async (code: string) => {
    const pin = code.trim();
    if (!pin || pin.length < 6) return;

    const res = await checkPincode(pin);
    const isSullia = pin === '574239';

    if (isSullia) {
      setDeliveryInfo({
        dateStr: res.deliveryDateStr || 'TODAY (Within 2–4 Hours)',
        description: `⚡ Same-Day Delivery in Sullia Town by Local Rider (Free on orders above ₹${res.freeShippingAbove})`,
        isLocal: true,
        cutoffUrgency: res.cutoffUrgency,
        dispatchNotice: res.dispatchNotice,
      });
    } else {
      setDeliveryInfo({
        dateStr: res.deliveryDateStr || res.estimatedDeliveryTime,
        description: `📦 ${res.dispatchNotice || 'Dispatches within 24 Hours'} via Express Courier (Fee: ₹${res.shippingFee}, FREE above ₹${res.freeShippingAbove})`,
        isLocal: false,
        cutoffUrgency: res.cutoffUrgency,
        dispatchNotice: res.dispatchNotice,
      });
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleAddToCartClick = () => {
    if (!product) return;
    addToCart(product, 1, selectedSize);
    setIsAddedFeedback(true);
    setTimeout(() => setIsAddedFeedback(false), 1800);
  };

  const handleBuyNowClick = () => {
    if (!product) return;
    addToCart(product, 1, selectedSize);
    setIsCartOpen(true);
  };

  const handlePrevImage = () => {
    if (!product || product.images.length === 0) return;
    setSelectedImageIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    if (!product || product.images.length === 0) return;
    setSelectedImageIndex((prev) => (prev === product.images.length - 1 ? 0 : prev + 1));
  };

  const handleMobileTabSelect = (tab: 'home' | 'categories' | 'store' | 'account') => {
    setMobileTab(tab);
    if (tab === 'home') {
      router.push('/');
    } else if (tab === 'categories') {
      setIsCategoriesSheetOpen(true);
    } else if (tab === 'store') {
      setIsStoreModalOpen(true);
    } else if (tab === 'account') {
      setIsAccountModalOpen(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col">
        <Navbar
          cartCount={cartItemCount}
          onOpenCart={() => setIsCartOpen(true)}
          wishlistCount={wishlistCount}
          onOpenWishlist={() => setIsWishlistOpen(true)}
          onOpenAccount={() => setIsAccountModalOpen(true)}
          onOpenPincodeModal={() => setIsPincodeModalOpen(true)}
          selectedPincode={pincodeInput}
        />
        <div className="max-w-6xl mx-auto px-4 py-16 flex-1 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-[#C68A4C] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-stone-500 font-medium">Loading exquisite jewellery details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#FAF8F5] flex flex-col">
        <Navbar
          cartCount={cartItemCount}
          onOpenCart={() => setIsCartOpen(true)}
          wishlistCount={wishlistCount}
          onOpenWishlist={() => setIsWishlistOpen(true)}
          onOpenAccount={() => setIsAccountModalOpen(true)}
          onOpenPincodeModal={() => setIsPincodeModalOpen(true)}
          selectedPincode={pincodeInput}
        />
        <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
          <div className="w-16 h-16 bg-stone-200 text-stone-500 rounded-full flex items-center justify-center mx-auto text-2xl font-serif">
            ?
          </div>
          <h2 className="text-xl font-serif font-bold text-stone-900">Jewellery Not Found</h2>
          <p className="text-xs text-stone-500">The product you are looking for is no longer available or was moved.</p>
          <Link
            href="/"
            className="inline-block bg-[#C68A4C] hover:bg-[#B5793C] text-[#1E130C] font-semibold text-xs px-5 py-2.5 rounded-lg"
          >
            ← Back to All Collections
          </Link>
        </div>
      </div>
    );
  }

  // Pre-formatted pricing
  const formattedPrice = `₹ ${product.price.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  const formattedOriginalPrice = `₹ ${product.originalPrice.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  const discountPercent =
    product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : 0;

  // Price Breakup Calculations (Standard Indian jewellery e-commerce structure)
  const estimatedMetalRate = Math.round(product.price * 0.78);
  const estimatedMakingCharges = Math.round(product.price * 0.19);
  const estimatedGst = Math.round(product.price * 0.03);

  // Category display
  const categoryLabel =
    product.category === '1-gram-gold'
      ? '22 KT'
      : product.category === 'anti-tarnish'
      ? '18K PVD'
      : 'FASHION';

  // WhatsApp enquire URL
  const whatsappUrl = `https://wa.me/918921844922?text=${encodeURIComponent(
    `Hi Sparkle Jewelry! I am interested in "${product.name}" (Price: ₹${product.price}, SKU: ${product.id}). Is this design currently available in your store?`
  )}`;

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-stone-900 flex flex-col pb-20 md:pb-8">
      {/* Primary Sticky Header */}
      <Navbar
        cartCount={cartItemCount}
        onOpenCart={() => setIsCartOpen(true)}
        wishlistCount={wishlistCount}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenPincodeModal={() => setIsPincodeModalOpen(true)}
        selectedPincode={pincodeInput}
        onSearchChange={(q) => {
          if (q.trim()) {
            router.push(`/?search=${encodeURIComponent(q.trim())}`);
          }
        }}
      />

      {/* Breadcrumbs */}
      <div className="max-w-6xl mx-auto px-4 sm:px-8 py-3.5 w-full">
        <nav className="flex items-center text-[11px] sm:text-xs text-stone-500 gap-1.5 flex-wrap">
          <Link href="/" className="hover:text-[#B5793C] transition-colors underline">
            Home
          </Link>
          <ChevronRight className="w-3 h-3 text-stone-400 shrink-0" />
          <Link href={`/?category=${product.category}`} className="hover:text-[#B5793C] transition-colors underline capitalize">
            {product.category.replace('-', ' ')}
          </Link>
          <ChevronRight className="w-3 h-3 text-stone-400 shrink-0" />
          <span className="hover:text-[#B5793C] transition-colors capitalize">
            {product.subcategory}
          </span>
          <ChevronRight className="w-3 h-3 text-stone-400 shrink-0" />
          <span className="text-stone-800 font-semibold truncate max-w-[200px] sm:max-w-none">
            {product.name}
          </span>
        </nav>
      </div>

      {/* Main PDP Grid (2-Column Desktop layout matching reference screenshot) */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* ================= LEFT COLUMN: PRODUCT GALLERY ================= */}
          <div className="lg:col-span-6 flex flex-col space-y-4">
            {/* Main Image Stage */}
            <div className="relative bg-white border border-stone-200 rounded-2xl overflow-hidden aspect-square flex items-center justify-center p-6 shadow-xs group">
              {/* Image Navigation Arrows */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition-all z-20 shadow-xs"
                    aria-label="Previous Image"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition-all z-20 shadow-xs"
                    aria-label="Next Image"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Action Icons (Top-Right: Share & Wishlist) */}
              <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
                <button
                  onClick={handleShare}
                  className="p-2 rounded-full bg-white/90 hover:bg-stone-100 border border-stone-200 text-stone-600 transition-colors shadow-xs relative"
                  title="Share Product"
                >
                  <Share2 className="w-4 h-4" />
                  {copied && (
                    <span className="absolute -bottom-8 right-0 bg-stone-900 text-white text-[10px] px-2 py-0.5 rounded whitespace-nowrap shadow-md">
                      Link Copied!
                    </span>
                  )}
                </button>
                <button
                  onClick={() => product && toggleWishlist(product)}
                  className={`p-2 rounded-full border transition-all shadow-xs active:scale-95 ${
                    isWishlisted
                      ? 'bg-rose-50 text-rose-600 border-rose-200 shadow-rose-100'
                      : 'bg-white/90 hover:bg-stone-100 text-stone-600 border-stone-200'
                  }`}
                  title={isWishlisted ? 'Remove from Wishlist' : 'Save to Wishlist'}
                >
                  <Heart className={`w-4 h-4 transition-transform ${isWishlisted ? 'fill-rose-500 text-rose-500 scale-110' : ''}`} />
                </button>
              </div>

              {/* Primary Image Display with Smooth Zoom on Hover */}
              <div className="w-full h-full flex items-center justify-center overflow-hidden">
                <img
                  src={product.images[selectedImageIndex] || product.images[0]}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain transition-transform duration-500 ease-out group-hover:scale-110"
                />
              </div>

              {/* Previous / Next Angle Arrows (if multi-photos exist) */}
              {product.images.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-stone-700 hover:text-stone-900 border border-stone-200/80 shadow-md flex items-center justify-center transition-all opacity-80 hover:opacity-100 active:scale-95"
                    title="Previous Photo Angle"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleNextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-stone-700 hover:text-stone-900 border border-stone-200/80 shadow-md flex items-center justify-center transition-all opacity-80 hover:opacity-100 active:scale-95"
                    title="Next Photo Angle"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Image Counter & Gold Progress Line (Exact match to Jos Alukkas / Reference UI) */}
              <div className="absolute bottom-3 left-4 right-4 flex flex-col gap-1.5 z-10">
                <span className="text-[11px] font-medium text-stone-500">
                  {selectedImageIndex + 1} / {product.images.length}
                </span>
                <div className="w-full h-[2px] bg-stone-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#C68A4C] transition-all duration-300 rounded-full"
                    style={{
                      width: `${((selectedImageIndex + 1) / product.images.length) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Thumbnails Carousel */}
            {product.images.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
                {product.images.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-20 h-20 rounded-xl bg-white border-2 overflow-hidden flex items-center justify-center p-1.5 transition-all shrink-0 ${
                      selectedImageIndex === idx
                        ? 'border-[#C68A4C] ring-2 ring-[#C68A4C]/20 shadow-xs'
                        : 'border-stone-200 hover:border-stone-300 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`${product.name} angle ${idx + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ================= RIGHT COLUMN: PRODUCT INFO & PURCHASE ================= */}
          <div className="lg:col-span-6 flex flex-col space-y-5">
            {/* Title & Compare */}
            <div className="flex items-start justify-between gap-4 border-b border-stone-200 pb-4">
              <div className="space-y-1.5">
                <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-stone-900 uppercase">
                  {product.name}
                </h1>

                {/* Sub-Badges / SKU line */}
                <div className="flex items-center gap-2.5 text-xs text-stone-600 flex-wrap">
                  {/* Coin Badge */}
                  <span className="inline-flex items-center gap-1 bg-[#F5ECDF] text-[#7A5328] font-bold px-2 py-0.5 rounded-full text-[11px] border border-[#E0D0BB]">
                    <span className="w-2 h-2 rounded-full bg-[#C68A4C]"></span>
                    {categoryLabel}
                  </span>
                  <span className="font-semibold uppercase tracking-wide text-stone-700">
                    {product.subcategory}
                  </span>
                  <span className="text-stone-300">|</span>
                  <span className="text-stone-500 font-mono text-[11px]">
                    SKU : SJ-{product.id.replace('prod-', '').toUpperCase()}
                  </span>
                </div>
              </div>

              {/* Compare Pill Button */}
              <button
                onClick={() => alert(`Item "${product.name}" added to comparison sheet.`)}
                className="shrink-0 text-[11px] font-semibold border border-stone-300 hover:border-stone-500 text-stone-700 px-3 py-1 rounded-full uppercase tracking-wider transition-colors"
              >
                COMPARE
              </button>
            </div>

            {/* Pricing Section */}
            <div className="space-y-1">
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-2xl sm:text-3xl font-bold text-stone-900 tracking-tight">
                  {formattedPrice}
                </span>

                {product.originalPrice > product.price && (
                  <>
                    <span className="text-sm sm:text-base text-[#9E3E26] line-through font-medium">
                      {formattedOriginalPrice}
                    </span>
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold px-2 py-0.5 rounded-md">
                      {discountPercent}% OFF
                    </span>
                  </>
                )}

                {/* Color Swatch */}
                <div className="ml-auto flex items-center gap-1.5 text-xs text-stone-600">
                  <span>Yellow</span>
                  <span className="w-4 h-4 rounded bg-[#E4B84D] border border-amber-600 inline-block shadow-2xs"></span>
                </div>
              </div>
              <p className="text-[11px] text-stone-500 font-normal">
                (MRP Inclusive of all taxes)
              </p>
            </div>

            {/* Delivery Estimation Card (Flipkart-Style Accurate Logistics) */}
            <div className="bg-[#FAF6F0] border border-[#EFE5D8] rounded-2xl p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] tracking-wider text-[#A37B55] uppercase font-bold">
                    Expected Delivery
                  </span>
                  <p className="text-base sm:text-lg font-serif font-bold text-[#1E130C] tracking-tight mt-0.5">
                    {deliveryInfo.dateStr}
                  </p>
                </div>

                {/* Delivery Truck Graphic */}
                <div className="flex items-center gap-1 shrink-0">
                  <div className="w-12 h-[2px] border-b-2 border-dashed border-stone-300 hidden sm:block"></div>
                  <img
                    src="/delivery-truck.png"
                    alt="Fast Delivery"
                    className="w-16 h-8 object-contain"
                  />
                </div>
              </div>

              {/* Urgency Dispatch Countdown (Flipkart style) */}
              {deliveryInfo.cutoffUrgency && (
                <div className="text-[11px] font-medium text-amber-900 bg-amber-50/90 px-2.5 py-1.5 rounded-lg border border-amber-200 flex items-center gap-1.5">
                  <span>⏳</span>
                  <span>{deliveryInfo.cutoffUrgency}</span>
                </div>
              )}

              {/* Pincode Input with Check Button */}
              <div className="flex items-center gap-2 bg-white rounded-full border border-stone-300 p-1 pl-4 focus-within:border-[#C68A4C] focus-within:ring-2 focus-within:ring-[#C68A4C]/20 transition-all">
                <input
                  type="text"
                  maxLength={6}
                  value={pincodeInput}
                  onChange={(e) => setPincodeInput(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 6-digit pincode"
                  className="w-full text-xs text-stone-900 focus:outline-none bg-transparent font-mono"
                />
                <button
                  onClick={() => handleCheckPincode(pincodeInput)}
                  className="bg-[#1E130C] hover:bg-[#382618] text-white text-xs font-semibold px-5 py-2 rounded-full transition-colors active:scale-95"
                >
                  Check
                </button>
              </div>

              {/* Delivery Description & Transit Reassurance */}
              <div className="space-y-1">
                <p className="text-[11px] text-stone-700 leading-snug font-medium">
                  {deliveryInfo.description}
                </p>
                <p className="text-[10px] text-stone-500 italic">
                  * Calculated with route safety buffer. WhatsApp tracking link sent upon courier handover.
                </p>
              </div>
            </div>

            {/* Size Options (If Available) */}
            {product.sizeOptions && product.sizeOptions.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <label className="text-xs font-semibold text-stone-800">
                  Select Size / Style:
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {product.sizeOptions.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`text-xs px-3.5 py-1.5 rounded-lg border font-medium transition-all ${
                        selectedSize === sz
                          ? 'border-[#C68A4C] bg-[#F9F3EA] text-[#7A5328] font-bold shadow-2xs'
                          : 'border-stone-200 bg-white text-stone-700 hover:border-stone-300'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* CTA Buttons: Add to Cart & Buy Now */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              {/* Add to Cart Button */}
              <button
                onClick={handleAddToCartClick}
                disabled={!product.inStock}
                className="w-full bg-white hover:bg-stone-50 border-2 border-[#1E130C] text-[#1E130C] font-bold text-xs sm:text-sm py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xs disabled:opacity-50"
              >
                {isAddedFeedback ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                    <span className="text-emerald-700">Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4 stroke-[2]" />
                    <span>ADD TO CART</span>
                  </>
                )}
              </button>

              {/* Buy Now Button (Solid Warm Luxury Gradient) */}
              <button
                onClick={handleBuyNowClick}
                disabled={!product.inStock}
                className="w-full bg-gradient-to-r from-[#C68A4C] to-[#AA7137] hover:from-[#B5793C] hover:to-[#96632E] text-white font-bold text-xs sm:text-sm py-3 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 disabled:opacity-50"
              >
                <span>BUY NOW</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Fast Delivery Item Badge */}
            <div className="border border-stone-200 rounded-xl p-3 flex items-center gap-3 bg-white shadow-2xs">
              <div className="w-9 h-9 rounded-lg bg-stone-100 flex items-center justify-center text-stone-700 shrink-0">
                <Truck className="w-5 h-5 text-[#C68A4C]" />
              </div>
              <div className="text-xs">
                <span className="font-bold text-stone-900 block">Fast Delivery Item</span>
                <span className="text-stone-500 text-[11px]">Dispatch within 24 hours from Sparkle Jewelry Sullia store</span>
              </div>
            </div>

            {/* Interactive Tabs: Product Detail vs Price Breakup */}
            <div className="pt-2 space-y-4">
              <div className="flex items-center gap-3 border-b border-stone-200 pb-3">
                <button
                  onClick={() => setActiveTab('detail')}
                  className={`text-xs font-bold px-4 py-2 rounded-full transition-all ${
                    activeTab === 'detail'
                      ? 'bg-[#1E130C] text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Product Detail
                </button>
                <button
                  onClick={() => setActiveTab('price')}
                  className={`text-xs font-bold px-4 py-2 rounded-full transition-all ${
                    activeTab === 'price'
                      ? 'bg-[#1E130C] text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Price Breakup
                </button>
              </div>

              {/* Tab Content 1: Product Detail Specifications */}
              {activeTab === 'detail' && (
                <div className="space-y-4 text-xs">
                  <p className="text-stone-600 leading-relaxed font-normal">
                    {product.description}
                  </p>

                  <div className="bg-white border border-stone-200 rounded-xl divide-y divide-stone-100 overflow-hidden shadow-2xs">
                    <div className="grid grid-cols-3 p-3">
                      <span className="text-stone-500 font-medium">Metal & Base</span>
                      <span className="col-span-2 text-stone-900 font-semibold">{product.material}</span>
                    </div>

                    <div className="grid grid-cols-3 p-3">
                      <span className="text-stone-500 font-medium">Shine Warranty</span>
                      <span className="col-span-2 text-[#7A5328] font-semibold">{product.polishWarranty}</span>
                    </div>

                    <div className="grid grid-cols-3 p-3">
                      <span className="text-stone-500 font-medium">Water Resistance</span>
                      <span className="col-span-2 text-stone-900 font-semibold flex items-center gap-1.5">
                        {product.isWaterproof ? (
                          <>
                            <Droplets className="w-3.5 h-3.5 text-blue-500" />
                            <span>100% Shower Safe & Waterproof</span>
                          </>
                        ) : (
                          <span>Daily Wear Water Resistant (Keep away from perfumes)</span>
                        )}
                      </span>
                    </div>

                    {product.weightGrams && (
                      <div className="grid grid-cols-3 p-3">
                        <span className="text-stone-500 font-medium">Approx Weight</span>
                        <span className="col-span-2 text-stone-900 font-semibold">{product.weightGrams} grams</span>
                      </div>
                    )}

                    <div className="grid grid-cols-3 p-3">
                      <span className="text-stone-500 font-medium">Care Advice</span>
                      <span className="col-span-2 text-stone-700 leading-relaxed">{product.careInstructions}</span>
                    </div>

                    <div className="grid grid-cols-3 p-3">
                      <span className="text-stone-500 font-medium">Packaging</span>
                      <span className="col-span-2 text-stone-900 font-medium">
                        Luxury Velvet SPARKLE Box + Tamper-Proof Seal
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab Content 2: Transparent Price Breakup */}
              {activeTab === 'price' && (
                <div className="bg-white border border-stone-200 rounded-xl p-4 space-y-3 text-xs shadow-2xs">
                  <div className="flex justify-between items-center text-stone-600">
                    <span>Base Metal & Polish Value</span>
                    <span className="font-semibold text-stone-800">
                      ₹ {estimatedMetalRate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-stone-600">
                    <span>Making & Handcraft Charges</span>
                    <span className="font-semibold text-stone-800">
                      ₹ {estimatedMakingCharges.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-stone-600">
                    <span>GST (3% Government Tax)</span>
                    <span className="font-semibold text-stone-800">
                      ₹ {estimatedGst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="pt-2 border-t border-stone-200 flex justify-between items-center font-bold text-sm text-stone-900">
                    <span>Total (Inclusive of all taxes)</span>
                    <span className="text-base text-[#1E130C]">{formattedPrice}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Comprehensive Razorpay-Compliant E-Commerce Footer */}
      <footer className="bg-[#140D07] text-[#C9BAA9] text-xs pt-12 pb-8 px-4 sm:px-8 border-t border-[#2A1C12] mt-16 w-full max-w-full overflow-hidden">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
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
              <Phone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
              <a href="tel:+918921844922" className="text-emerald-400 font-mono font-bold hover:underline">
                +91 89218 44922
              </a>
            </div>
            <div className="text-[10px] text-[#8C7B6A]">
              Open Mon–Sat: 9:30 AM – 8:00 PM | Sun: 10 AM – 6 PM
            </div>
          </div>

          <div className="space-y-2.5">
            <h4 className="font-bold text-white text-xs uppercase tracking-wider text-[#C68A4C]">
              Payment & Logistics
            </h4>
            <div className="bg-[#1F150D] p-3 rounded-xl border border-[#3A2616] space-y-2 text-[11px]">
              <div className="text-white font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
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
              <ShieldCheck className="w-2.5 h-2.5 inline" />
            </Link>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Quick Action Button (Right bottom) */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-20 md:bottom-6 right-5 z-30 w-12 h-12 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
        title="Chat on WhatsApp"
      >
        <MessageCircle className="w-6 h-6 fill-white stroke-none" />
      </a>

      {/* Modals & Slide-out Drawers */}
      <PincodeCheckerModal
        isOpen={isPincodeModalOpen}
        onClose={() => setIsPincodeModalOpen(false)}
        onSelectPincode={(pin) => {
          setPincodeInput(pin);
          handleCheckPincode(pin);
        }}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeItem}
        onClearCart={clearCart}
        defaultPincode={pincodeInput}
      />

      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav
        activeTab={mobileTab}
        onSelectTab={handleMobileTabSelect}
      />

      <CategoriesSheet
        isOpen={isCategoriesSheetOpen}
        onClose={() => {
          setIsCategoriesSheetOpen(false);
          setMobileTab('home');
        }}
        onSelectCategory={(cat) => router.push(`/?category=${cat}`)}
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
