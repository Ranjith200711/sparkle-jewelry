'use client';

import { useState, useEffect, useCallback } from 'react';
import { Product } from '../types';

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
}

const CART_STORAGE_KEY = 'sullia_jewellery_cart';

export function getStoredCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveStoredCart(cart: CartItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    window.dispatchEvent(new Event('sullia-cart-updated'));
  } catch (e) {
    console.error('Failed to save cart to localStorage', e);
  }
}

export function useCart() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setCart(getStoredCart());
    setIsLoaded(true);

    const handleUpdate = () => {
      setCart(getStoredCart());
    };

    window.addEventListener('sullia-cart-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('sullia-cart-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const addToCart = useCallback((product: Product, quantity = 1, selectedSize?: string) => {
    const current = getStoredCart();
    const existingIndex = current.findIndex(
      (item) => item.product.id === product.id && item.selectedSize === selectedSize
    );

    let updated: CartItem[];
    if (existingIndex > -1) {
      updated = current.map((item, idx) =>
        idx === existingIndex ? { ...item, quantity: item.quantity + quantity } : item
      );
    } else {
      updated = [...current, { product, quantity, selectedSize }];
    }
    saveStoredCart(updated);
    setCart(updated);
  }, []);

  const updateQuantity = useCallback((productId: string, delta: number) => {
    const current = getStoredCart();
    const updated = current
      .map((item) => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      })
      .filter(Boolean) as CartItem[];
    saveStoredCart(updated);
    setCart(updated);
  }, []);

  const removeItem = useCallback((productId: string) => {
    const current = getStoredCart();
    const updated = current.filter((item) => item.product.id !== productId);
    saveStoredCart(updated);
    setCart(updated);
  }, []);

  const clearCart = useCallback(() => {
    saveStoredCart([]);
    setCart([]);
  }, []);

  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  return {
    cart,
    isLoaded,
    addToCart,
    updateQuantity,
    removeItem,
    clearCart,
    totalCount,
    subtotal,
  };
}
