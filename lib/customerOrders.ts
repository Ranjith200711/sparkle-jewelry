'use client';

import { useState, useEffect, useCallback } from 'react';
import { Order } from '../types';
import { fetchOrders, fetchOrderById } from './api';

const CUSTOMER_ORDERS_KEY = 'sparkle_customer_orders';

export function getStoredCustomerOrders(): Order[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CUSTOMER_ORDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomerOrder(order: Order): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getStoredCustomerOrders();
    // Prepend new order, remove duplicate if exists
    const updated = [
      order,
      ...existing.filter(
        (o) => o.id !== order.id && o.orderNumber !== order.orderNumber
      ),
    ];
    localStorage.setItem(CUSTOMER_ORDERS_KEY, JSON.stringify(updated.slice(0, 50)));
    window.dispatchEvent(new Event('sparkle-orders-updated'));
  } catch (err) {
    console.error('Failed to save order to localStorage:', err);
  }
}

export function clearStoredCustomerOrders(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(CUSTOMER_ORDERS_KEY);
    window.dispatchEvent(new Event('sparkle-orders-updated'));
  } catch {}
}

export function useCustomerOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshOrders = useCallback(async () => {
    const local = getStoredCustomerOrders();
    setOrders(local);

    // If local orders exist, try to sync their latest status from the server
    if (local.length > 0) {
      try {
        const serverOrders = await fetchOrders();
        if (serverOrders && serverOrders.length > 0) {
          const serverMap = new Map<string, Order>();
          serverOrders.forEach((o) => {
            serverMap.set(o.id, o);
            serverMap.set(o.orderNumber, o);
          });

          let hasChanges = false;
          const merged = local.map((lo) => {
            const updated = serverMap.get(lo.id) || serverMap.get(lo.orderNumber);
            if (updated && (updated.status !== lo.status || updated.updatedAt !== lo.updatedAt)) {
              hasChanges = true;
              return { ...lo, ...updated };
            }
            return lo;
          });

          if (hasChanges) {
            localStorage.setItem(CUSTOMER_ORDERS_KEY, JSON.stringify(merged));
            setOrders(merged);
          }
        }
      } catch {
        // Fallback silently to local cache if offline
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    refreshOrders();

    const handleUpdate = () => {
      setOrders(getStoredCustomerOrders());
    };

    window.addEventListener('sparkle-orders-updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('sparkle-orders-updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [refreshOrders]);

  return {
    orders,
    loading,
    refreshOrders,
    clearStoredCustomerOrders,
  };
}
