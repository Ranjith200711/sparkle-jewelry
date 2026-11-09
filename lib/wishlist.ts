'use client';

import { useState, useEffect, useCallback } from 'react';
import { Product } from '../types';

const WISHLIST_STORAGE_KEY = 'sullia_jewellery_wishlist';

export function getStoredWishlist(): Product[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStoredWishlist(wishlist: Product[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlist));
    window.dispatchEvent(new Event('sullia-wishlist-updated'));
  } catch (e) {
    console.error('Failed to save wishlist to localStorage', e);
  }
}

export function useWishlist() {
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setWishlist(getStoredWishlist());
    setIsLoaded(true);

    const handleUpdate = () => {
      setWishlist(getStoredWishlist());
    };

    window.addEventListener('sullia-wishlist-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('sullia-wishlist-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const isInWishlist = useCallback(
    (productId: string) => {
      return wishlist.some((item) => item.id === productId);
    },
    [wishlist]
  );

  const toggleWishlist = useCallback((product: Product): boolean => {
    const current = getStoredWishlist();
    const exists = current.some((item) => item.id === product.id);
    let updated: Product[];
    if (exists) {
      updated = current.filter((item) => item.id !== product.id);
    } else {
      updated = [product, ...current];
    }
    saveStoredWishlist(updated);
    setWishlist(updated);
    return !exists;
  }, []);

  const addToWishlist = useCallback((product: Product) => {
    const current = getStoredWishlist();
    if (!current.some((item) => item.id === product.id)) {
      const updated = [product, ...current];
      saveStoredWishlist(updated);
      setWishlist(updated);
    }
  }, []);

  const removeFromWishlist = useCallback((productId: string) => {
    const current = getStoredWishlist();
    const updated = current.filter((item) => item.id !== productId);
    saveStoredWishlist(updated);
    setWishlist(updated);
  }, []);

  const clearWishlist = useCallback(() => {
    saveStoredWishlist([]);
    setWishlist([]);
  }, []);

  const totalCount = wishlist.length;

  return {
    wishlist,
    isLoaded,
    isInWishlist,
    toggleWishlist,
    addToWishlist,
    removeFromWishlist,
    clearWishlist,
    totalCount,
  };
}
