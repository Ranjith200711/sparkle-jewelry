'use client';

import React from 'react';
import { X, Sparkles, Droplets, Diamond, ArrowRight } from 'lucide-react';
import { JewelleryCategory } from '../types';

interface CategoriesSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectCategory: (cat: JewelleryCategory | 'all') => void;
}

export default function CategoriesSheet({
  isOpen,
  onClose,
  onSelectCategory
}: CategoriesSheetProps) {
  if (!isOpen) return null;

  const categories = [
    {
      id: '1-gram-gold' as JewelleryCategory,
      title: '✨ 1-Gram Micro Gold',
      subtitle: 'Traditional Temple Necklaces, Harams & Daily Wear Chains',
      badge: '22K Gold Look • 1-Yr Polish',
      color: 'bg-amber-50 border-amber-200 text-amber-900',
      icon: Sparkles
    },
    {
      id: 'anti-tarnish' as JewelleryCategory,
      title: '💧 Anti-Tarnish (Waterproof)',
      subtitle: '18K PVD Stainless Steel Rings, Clover Bracelets & Chains',
      badge: '100% Shower & Gym Safe',
      color: 'bg-blue-50 border-blue-200 text-blue-900',
      icon: Droplets
    },
    {
      id: 'fashion-imitation' as JewelleryCategory,
      title: '💎 Fashion & Imitation',
      subtitle: 'Royal Kundan Choker Sets & American Diamond Solitaires',
      badge: 'Bridal & Party Wear',
      color: 'bg-purple-50 border-purple-200 text-purple-900',
      icon: Diamond
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-stone-900/60 backdrop-blur-xs p-0 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl max-w-md w-full p-5 shadow-2xl border border-stone-200 max-h-[85vh] overflow-y-auto">
        <div className="flex justify-between items-center pb-3 border-b border-stone-100">
          <div>
            <h3 className="font-serif font-bold text-base text-stone-900">Explore Collections</h3>
            <p className="text-[11px] text-stone-500">Pick a collection to browse designs</p>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-2.5">
          <button
            onClick={() => {
              onSelectCategory('all');
              onClose();
            }}
            className="w-full text-left p-3 rounded-xl border border-stone-200 bg-stone-50 hover:bg-stone-100 flex items-center justify-between text-xs font-bold text-stone-800 transition-colors"
          >
            <span>🛍️ View All Collections</span>
            <ArrowRight className="w-4 h-4 text-stone-400" />
          </button>

          {categories.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  onSelectCategory(cat.id);
                  onClose();
                }}
                className={`w-full text-left p-3.5 rounded-xl border ${cat.color} hover:brightness-95 transition-all space-y-1 block`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-serif font-bold text-sm flex items-center gap-1.5">
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{cat.title}</span>
                  </div>
                  <span className="text-[10px] bg-white/80 px-2 py-0.5 rounded-full font-bold shadow-xs">
                    {cat.badge}
                  </span>
                </div>
                <p className="text-[11px] text-stone-600 leading-snug">
                  {cat.subtitle}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
