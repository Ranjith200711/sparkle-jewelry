'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Product } from '../types';
import { useWishlist } from '../lib/wishlist';
import { useCart } from '../lib/cart';
import {
  X,
  Heart,
  ShoppingCart,
  Trash2,
  ArrowRight,
  Share2,
  MessageCircle,
  Sparkles,
  Droplets,
  Check
} from 'lucide-react';

interface WishlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCart?: () => void;
}

export default function WishlistDrawer({
  isOpen,
  onClose,
  onOpenCart
}: WishlistDrawerProps) {
  const { wishlist, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();
  const [addedItemIds, setAddedItemIds] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  const handleMoveToCart = (product: Product) => {
    addToCart(product, 1);
    setAddedItemIds((prev) => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setAddedItemIds((prev) => ({ ...prev, [product.id]: false }));
    }, 1800);
  };

  const handleMoveAllToCart = () => {
    wishlist.forEach((product) => {
      if (product.inStock) {
        addToCart(product, 1);
      }
    });
    if (onOpenCart) {
      onClose();
      onOpenCart();
    }
  };

  // WhatsApp Share wishlist text
  const wishlistItemsText = wishlist
    .map((p, idx) => `${idx + 1}. ${p.name} (₹${p.price})`)
    .join('\n');
  const shareWhatsAppUrl = `https://wa.me/918921844922?text=${encodeURIComponent(
    `Hi Sparkle Jewelry! I have saved these designs to my Wishlist:\n\n${wishlistItemsText}\n\nCould you please confirm their current availability at your Sullia counter?`
  )}`;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-stone-200">
          {/* Header */}
          <div className="p-4 sm:p-5 bg-[#140D07] text-[#FAF4EB] flex items-center justify-between border-b border-[#2A1C12]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
              </div>
              <div>
                <h2 className="font-serif font-bold text-base sm:text-lg tracking-tight text-white flex items-center gap-2">
                  <span>My Wishlist</span>
                  <span className="text-xs bg-[#C68A4C] text-[#1E130C] px-2 py-0.5 rounded-full font-sans font-bold">
                    {wishlist.length}
                  </span>
                </h2>
                <p className="text-[11px] text-stone-300">Saved jewellery pieces you love</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-stone-400 hover:text-white hover:bg-stone-800 transition-colors"
              aria-label="Close Wishlist"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {wishlist.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4 space-y-4">
                <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-400 flex items-center justify-center border border-rose-100 shadow-xs">
                  <Heart className="w-8 h-8 stroke-[1.5]" />
                </div>
                <div className="space-y-1.5 max-w-xs">
                  <h3 className="font-serif font-bold text-base text-stone-900">
                    Your Wishlist is Empty
                  </h3>
                  <p className="text-xs text-stone-500 leading-relaxed">
                    Explore our 1-Gram Gold and Shower-Safe Anti-Tarnish collections. Tap the heart icon on any design to save it here for later.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="bg-[#C68A4C] hover:bg-[#B3793E] text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-xs transition-colors"
                >
                  Explore Jewellery Collections
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {wishlist.map((product) => {
                  const discountPercent =
                    product.originalPrice > product.price
                      ? Math.round(
                          ((product.originalPrice - product.price) / product.originalPrice) * 100
                        )
                      : 0;
                  const isAdded = addedItemIds[product.id];

                  return (
                    <div
                      key={product.id}
                      className="bg-[#FAF8F5] border border-stone-200 rounded-xl p-3 flex gap-3 items-center hover:border-amber-300 transition-colors group relative"
                    >
                      {/* Product Thumbnail */}
                      <Link
                        href={`/product/${product.id}`}
                        onClick={onClose}
                        className="w-18 h-18 sm:w-20 sm:h-20 bg-white rounded-lg p-1.5 border border-stone-200 shrink-0 overflow-hidden flex items-center justify-center cursor-pointer"
                      >
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform"
                        />
                      </Link>

                      {/* Info & Pricing */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-1.5">
                          {product.category === '1-gram-gold' ? (
                            <span className="text-[10px] font-bold text-amber-800 bg-amber-100/80 px-1.5 py-0.2 rounded">
                              ✨ 1-Gram
                            </span>
                          ) : product.category === 'anti-tarnish' ? (
                            <span className="text-[10px] font-bold text-blue-800 bg-blue-100/80 px-1.5 py-0.2 rounded">
                              💧 Waterproof
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-purple-800 bg-purple-100/80 px-1.5 py-0.2 rounded">
                              💎 Fashion
                            </span>
                          )}
                          {!product.inStock && (
                            <span className="text-[9px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded">
                              Out of Stock
                            </span>
                          )}
                        </div>

                        <Link
                          href={`/product/${product.id}`}
                          onClick={onClose}
                          className="font-semibold text-xs text-stone-900 block truncate hover:text-[#C68A4C] transition-colors"
                        >
                          {product.name}
                        </Link>

                        <div className="flex items-baseline gap-2">
                          <span className="font-bold font-mono text-xs sm:text-sm text-stone-900">
                            ₹{product.price.toLocaleString('en-IN')}
                          </span>
                          {product.originalPrice > product.price && (
                            <>
                              <span className="text-[11px] text-stone-400 line-through">
                                ₹{product.originalPrice.toLocaleString('en-IN')}
                              </span>
                              <span className="text-[10px] font-bold text-emerald-600">
                                {discountPercent}% OFF
                              </span>
                            </>
                          )}
                        </div>

                        {/* Actions: Add to Cart button */}
                        <div className="pt-1 flex items-center gap-2">
                          <button
                            onClick={() => handleMoveToCart(product)}
                            disabled={!product.inStock}
                            className={`text-[11px] font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all active:scale-95 disabled:opacity-40 ${
                              isAdded
                                ? 'bg-emerald-600 text-white'
                                : 'bg-[#1E130C] hover:bg-[#382618] text-white shadow-2xs'
                            }`}
                          >
                            {isAdded ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Added!</span>
                              </>
                            ) : (
                              <>
                                <ShoppingCart className="w-3.5 h-3.5" />
                                <span>Add to Cart</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeFromWishlist(product.id)}
                        className="p-1.5 text-stone-400 hover:text-rose-600 rounded-lg transition-colors shrink-0"
                        title="Remove from Wishlist"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          {wishlist.length > 0 && (
            <div className="p-4 sm:p-5 bg-[#FAF8F5] border-t border-stone-200 space-y-2.5">
              {/* Move All to Cart */}
              <button
                onClick={handleMoveAllToCart}
                className="w-full bg-[#C68A4C] hover:bg-[#B3793E] text-white font-bold py-2.5 rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition-all active:scale-95"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Move All Available to Cart</span>
              </button>

              {/* Share Wishlist on WhatsApp */}
              <a
                href={shareWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Enquire Wishlist on WhatsApp</span>
              </a>

              {/* Clear Wishlist */}
              <div className="pt-1 text-center">
                <button
                  onClick={clearWishlist}
                  className="text-[11px] text-stone-400 hover:text-rose-600 transition-colors underline"
                >
                  Clear Wishlist
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
