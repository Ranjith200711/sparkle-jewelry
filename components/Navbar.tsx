'use client';

import React from 'react';
import Link from 'next/link';
import { ShoppingBag, MapPin, ShieldCheck, Sparkles, Heart, Search, X, User } from 'lucide-react';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  wishlistCount?: number;
  onOpenWishlist?: () => void;
  onOpenAccount?: () => void;
  onOpenPincodeModal: () => void;
  selectedPincode?: string;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onSearchSubmit?: () => void;
}

export default function Navbar({
  cartCount,
  onOpenCart,
  wishlistCount = 0,
  onOpenWishlist,
  onOpenAccount,
  onOpenPincodeModal,
  selectedPincode,
  searchQuery,
  onSearchChange,
  onSearchSubmit
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 w-full max-w-full overflow-hidden shadow-xs">
      {/* Top Banner - Exactly as in the design */}
      <div className="bg-[#140D07] text-[#D8C7B5] text-[10px] sm:text-xs py-1.5 px-3 text-center font-sans font-medium flex items-center justify-center gap-2 overflow-hidden border-b border-[#2A1C12]">
        <Sparkles className="w-3 h-3 text-[#C68A4C] shrink-0" />
        <span className="truncate">
          Sullia Town: Same-Day 2–4Hr Delivery &nbsp;/&nbsp; 🚚 Express Courier Dispatch
        </span>
      </div>

      {/* Main Navbar - Warm Cream Luxury Ivory */}
      <div className="bg-[#F9F3EA] border-b border-[#EDE3D2] px-3 sm:px-6 lg:px-8 h-15 sm:h-16 md:h-18 flex items-center justify-between gap-2 sm:gap-3 w-full">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2 sm:gap-2.5 shrink-0 group min-w-0">
          <div className="w-8 h-8 sm:w-10 sm:h-10 md:w-11 md:h-11 rounded-full overflow-hidden shrink-0 shadow-xs border border-[#C68A4C]/40 bg-[#FAF4EB] flex items-center justify-center">
            <img
              src="/sparkle-logo-256.webp"
              srcSet="/sparkle-logo-256.webp 1x, /sparkle-logo-512.webp 2x, /sparkle-logo.png 3x"
              alt="Sparkle Jewelry"
              className="w-full h-full object-contain rounded-full transition-transform duration-300 group-hover:scale-105"
            />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="font-serif font-bold text-sm sm:text-lg lg:text-xl tracking-tight text-[#1E130C] truncate leading-tight">
              Sparkle Jewelry
            </span>
            <span className="text-[8px] sm:text-[9px] tracking-[0.25em] uppercase text-[#A37B55] font-sans font-bold hidden sm:block">
              Ornaments
            </span>
          </div>
        </Link>

        {/* Desktop Search Bar - Positioned in between Sparkle Jewelry and Deliver to on sm+ */}
        <div className="hidden sm:block flex-1 min-w-0 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg mx-2 sm:mx-3 md:mx-4">
          <div className="relative w-full">
            <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#8C6D53] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery ?? ''}
              onChange={(e) => onSearchChange?.(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  onSearchSubmit?.();
                  const el = document.getElementById('collection-grid');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              placeholder="Search chains, bangles, rings..."
              className="w-full bg-white border border-[#E0D3C1] hover:border-[#C68A4C] focus:border-[#C68A4C] rounded-full pl-9 pr-8 py-1.5 sm:py-2 text-xs text-[#1E130C] placeholder:text-[#A8927E] focus:outline-none focus:ring-2 focus:ring-[#C68A4C]/25 transition-all shadow-2xs"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange?.('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 w-4 h-4 rounded-full flex items-center justify-center text-xs"
                title="Clear Search"
                aria-label="Clear Search"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Deliver to PIN */}
          <button
            onClick={onOpenPincodeModal}
            className="flex items-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs bg-[#EFE6D7] hover:bg-[#E5DAC8] text-[#5A3F29] px-2 sm:px-2.5 py-1.5 rounded-lg transition-colors shrink-0"
            title="Deliver to Pincode"
          >
            <MapPin className="w-3.5 h-3.5 text-[#C68A4C] shrink-0" />
            <span className="hidden md:inline text-[#7A5B40]">Deliver to:</span>
            <span className="font-bold underline">{selectedPincode || '574239'}</span>
          </button>

          {/* Account & My Orders Button (Desktop and Tablet) */}
          {onOpenAccount && (
            <button
              onClick={onOpenAccount}
              className="hidden sm:flex p-1.5 sm:px-3 sm:py-2 rounded-lg border border-[#EDE3D2] bg-[#FAF6F0] hover:bg-[#F3EBE0] text-[#5A3F29] items-center gap-1.5 transition-all active:scale-95 text-xs font-medium relative shadow-2xs shrink-0"
              title="My Account & Orders"
              aria-label="My Account and Orders"
            >
              <User className="w-4 h-4 text-[#7A5B40] shrink-0" />
              <span className="hidden md:inline">Account</span>
            </button>
          )}

          {/* Wishlist Button */}
          {onOpenWishlist && (
            <button
              onClick={onOpenWishlist}
              className="p-1.5 sm:px-3 sm:py-2 rounded-lg border border-[#EDE3D2] bg-[#FAF6F0] hover:bg-[#F3EBE0] text-[#5A3F29] flex items-center gap-1.5 transition-all active:scale-95 text-xs font-medium relative shadow-2xs shrink-0"
              title="My Wishlist"
              aria-label="View Wishlist"
            >
              <Heart
                className={`w-4 h-4 transition-transform ${
                  wishlistCount > 0 ? 'text-rose-600 fill-rose-500 scale-105' : 'text-[#7A5B40]'
                }`}
              />
              <span className="hidden sm:inline">Wishlist</span>
              {wishlistCount > 0 && (
                <span className="bg-rose-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                  {wishlistCount}
                </span>
              )}
            </button>
          )}

          {/* Cart Button - Fully visible on all screens */}
          <button
            onClick={onOpenCart}
            className="bg-[#C68A4C] hover:bg-[#B3793E] text-white px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg flex items-center gap-1.5 sm:gap-2 transition-all shadow-xs active:scale-95 font-sans font-medium text-xs sm:text-sm shrink-0"
            aria-label="View Cart"
          >
            <ShoppingBag className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Cart</span>
            {cartCount > 0 && (
              <span className="bg-[#1E130C] text-[#F9F3EA] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow-xs shrink-0">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Search Row - Visible on mobile only (<640px) */}
      <div className="sm:hidden px-3 pb-2.5 pt-1 bg-[#F9F3EA] border-b border-[#EDE3D2] w-full">
        <div className="relative w-full">
          <Search className="w-3.5 h-3.5 text-[#8C6D53] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery ?? ''}
            onChange={(e) => onSearchChange?.(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onSearchSubmit?.();
                const el = document.getElementById('collection-grid');
                el?.scrollIntoView({ behavior: 'smooth' });
              }
            }}
            placeholder="Search jewellery designs..."
            className="w-full bg-white border border-[#E0D3C1] hover:border-[#C68A4C] focus:border-[#C68A4C] rounded-full pl-8 pr-7 py-1.5 text-xs text-[#1E130C] placeholder:text-[#A8927E] focus:outline-none focus:ring-2 focus:ring-[#C68A4C]/25 transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange?.('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 w-4 h-4 rounded-full flex items-center justify-center text-xs"
              title="Clear Search"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
