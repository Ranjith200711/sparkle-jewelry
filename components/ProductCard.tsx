'use client';

import React from 'react';
import Link from 'next/link';
import { Product } from '../types';
import { useWishlist } from '../lib/wishlist';
import { Droplets, Sparkles, MessageCircle, ShoppingBag, Check, Heart } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  isAdded?: boolean;
}

export default function ProductCard({ product, onAddToCart, isAdded }: ProductCardProps) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const isWishlisted = isInWishlist(product.id);
  // Category specific badge styling
  const getCategoryBadge = () => {
    switch (product.category) {
      case 'anti-tarnish':
        return (
          <span className="inline-flex items-center gap-1 bg-blue-50 text-blue-700 border border-blue-200 text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full shadow-2xs">
            <Droplets className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-blue-500 shrink-0" />
            <span>Anti-Tarnish</span>
            <span className="hidden sm:inline">• Waterproof</span>
          </span>
        );
      case '1-gram-gold':
        return (
          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 border border-amber-200 text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full shadow-2xs">
            <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-600 shrink-0" />
            <span>1-Gram Gold</span>
          </span>
        );
      case 'fashion-imitation':
        return (
          <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 border border-purple-200 text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded-full shadow-2xs">
            <span>💎 Imitation</span>
          </span>
        );
    }
  };

  // WhatsApp link with pre-filled question
  const whatsappUrl = `https://wa.me/918921844922?text=${encodeURIComponent(
    `Hi Sparkle Jewelry! I am interested in "${product.name}" (Price: ₹${product.price}). Can you please share more details or photos?`
  )}`;

  return (
    <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group relative">
      {/* Product Image Container Link */}
      <Link href={`/product/${product.id}`} className="block relative aspect-square overflow-hidden bg-stone-50 cursor-pointer">
        <img
          src={product.images[0]}
          alt={product.name}
          className={`w-full h-full object-contain p-2 transition-all duration-300 ${
            product.images.length > 1 ? 'group-hover:opacity-0 scale-100' : 'group-hover:scale-105'
          }`}
          loading="lazy"
        />

        {/* Secondary Image on Hover if multi-photos exist */}
        {product.images.length > 1 && (
          <img
            src={product.images[1]}
            alt={`${product.name} alternate angle`}
            className="w-full h-full object-contain p-2 absolute inset-0 opacity-0 group-hover:opacity-100 group-hover:scale-105 transition-all duration-300"
            loading="lazy"
          />
        )}

        {/* Multi-Photo Count Pill */}
        {product.images.length > 1 && (
          <div className="absolute bottom-2.5 right-2.5 z-10 bg-black/60 backdrop-blur-xs text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1 shadow-xs pointer-events-none tracking-tight">
            <span>📷</span>
            <span>{product.images.length} Photos</span>
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start z-10">
          {getCategoryBadge()}
          {product.isWaterproof && (
            <span className="bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-xs uppercase">
              Shower Safe
            </span>
          )}
        </div>

        {/* Wishlist Heart Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className={`absolute top-2.5 right-2.5 z-20 p-2 rounded-full transition-all duration-200 shadow-xs active:scale-90 ${
            isWishlisted
              ? 'bg-rose-50 text-rose-600 border border-rose-200'
              : 'bg-white/90 hover:bg-white text-stone-500 hover:text-rose-600 border border-stone-200/80'
          }`}
          title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          aria-label="Toggle Wishlist"
        >
          <Heart
            className={`w-3.5 h-3.5 transition-transform ${
              isWishlisted ? 'fill-rose-500 text-rose-500 scale-110' : ''
            }`}
          />
        </button>

        {/* Out of Stock Overlay */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-stone-900/60 backdrop-blur-[1px] flex items-center justify-center z-20">
            <span className="bg-white text-stone-900 font-bold text-xs uppercase tracking-wider px-3 py-1 rounded">
              Out of Stock
            </span>
          </div>
        )}
      </Link>

      {/* Product Content */}
      <div className="p-3.5 flex flex-col flex-grow justify-between">
        <div>
          <Link href={`/product/${product.id}`} className="block cursor-pointer">
            <h3 className="font-semibold text-stone-900 text-sm line-clamp-2 leading-snug group-hover:text-amber-800 transition-colors">
              {product.name}
            </h3>
          </Link>

          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-base font-bold text-stone-900">₹{product.price.toLocaleString('en-IN')}</span>
            {product.originalPrice > product.price && (
              <span className="text-xs text-stone-400 line-through">
                ₹{product.originalPrice.toLocaleString('en-IN')}
              </span>
            )}
            {product.originalPrice > product.price && (
              <span className="text-[11px] font-bold text-emerald-600">
                {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
              </span>
            )}
          </div>

          <p className="text-[11px] text-stone-500 mt-1 line-clamp-1">
            {product.polishWarranty}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-3 pt-2 border-t border-stone-100 grid grid-cols-5 gap-1.5 min-w-0">
          {/* WhatsApp Enquire Button */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="col-span-2 border border-emerald-500 text-emerald-700 hover:bg-emerald-50 text-[10px] sm:text-xs font-medium py-1.5 sm:py-2 rounded-lg flex items-center justify-center gap-1 transition-colors min-w-0"
            title="Enquire on WhatsApp"
          >
            <MessageCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
            <span className="truncate">Chat</span>
          </a>

          {/* Add to Cart Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart(product);
            }}
            disabled={!product.inStock}
            className={`col-span-3 text-[10px] sm:text-xs font-semibold py-1.5 sm:py-2 px-1 sm:px-2 rounded-lg flex items-center justify-center gap-1 transition-all active:scale-95 min-w-0 ${
              isAdded
                ? 'bg-emerald-600 text-white'
                : 'bg-amber-600 hover:bg-amber-700 disabled:bg-stone-300 text-white shadow-xs'
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                <span className="truncate">Added!</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                <span className="truncate">Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
