'use client';

import React from 'react';
import { Home, LayoutGrid, MapPin, User } from 'lucide-react';

interface MobileBottomNavProps {
  activeTab: 'home' | 'categories' | 'store' | 'account';
  onSelectTab: (tab: 'home' | 'categories' | 'store' | 'account') => void;
}

export default function MobileBottomNav({
  activeTab,
  onSelectTab
}: MobileBottomNavProps) {
  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'categories', label: 'Categories', icon: LayoutGrid },
    { id: 'store', label: 'Find Store', icon: MapPin },
    { id: 'account', label: 'My Account', icon: User },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-amber-200/60 shadow-[0_-4px_12px_rgba(0,0,0,0.04)] md:hidden w-full max-w-full">
      <div className="grid grid-cols-4 h-14 max-w-md mx-auto items-center px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onSelectTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 transition-all active:scale-95 ${
                isActive ? 'text-amber-800 font-bold' : 'text-stone-500 hover:text-stone-800'
              }`}
            >
              <div className="relative">
                <Icon className={`w-4 h-4 sm:w-5 sm:h-5 transition-transform ${isActive ? 'scale-110 text-amber-700 stroke-[2.2]' : 'stroke-[1.8]'}`} />
                {isActive && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-600" />
                )}
              </div>
              <span className={`text-[10px] mt-0.5 tracking-tight ${isActive ? 'text-amber-900 font-bold' : 'text-stone-500'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
