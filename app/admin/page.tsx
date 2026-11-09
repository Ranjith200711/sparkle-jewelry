'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Order, Product, JewelleryCategory } from '../../types';
import {
  fetchOrders,
  requestPickup,
  fetchProducts,
  deleteProduct,
  adminLogin,
  verifyAdminSession,
  setAdminToken,
  getAdminToken,
  getAuthHeaders,
  fetchCourierConfig,
  saveCourierConfig,
  testCourierConnection,
  fetchCourierComparison,
  fetchRazorpayConfig,
  saveRazorpayConfig,
  API_BASE_URL
} from '../../lib/api';
import {
  Package,
  Truck,
  CheckCircle,
  Printer,
  MessageCircle,
  ArrowLeft,
  RefreshCw,
  ShoppingBag,
  IndianRupee,
  Phone,
  Plus,
  X,
  Sparkles,
  Droplets,
  Diamond,
  UploadCloud,
  Camera,
  Image as ImageIcon,
  Trash2,
  Lock,
  LogOut,
  KeyRound,
  ShieldAlert,
  Send,
  FileText,
  CheckCircle2,
  ExternalLink,
  CreditCard
} from 'lucide-react';

export default function OwnerAdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<'orders' | 'inventory' | 'courier'>('orders');
  const [orderFilter, setOrderFilter] = useState<'all' | 'confirmed' | 'packed' | 'delivered'>('all');
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [newOrderAlert, setNewOrderAlert] = useState<string | null>(null);
  const knownOrderIdsRef = useRef<Set<string> | null>(null);

  // Courier & Delivery Configuration State
  const [courierEmail, setCourierEmail] = useState('');
  const [courierPassword, setCourierPassword] = useState('');
  const [courierPickupLocation, setCourierPickupLocation] = useState('Primary');
  const [courierMode, setCourierMode] = useState<'test' | 'live'>('test');
  const [courierTesting, setCourierTesting] = useState(false);
  const [courierSaving, setCourierSaving] = useState(false);
  const [courierStatusMsg, setCourierStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isCourierConfigured, setIsCourierConfigured] = useState(false);

  const loadCourierConfig = async () => {
    const res = await fetchCourierConfig();
    if (res.success && res.data) {
      setCourierEmail(res.data.email || '');
      setCourierPickupLocation(res.data.pickupLocation || 'Primary');
      setCourierMode(res.data.mode || 'test');
      setIsCourierConfigured(res.data.isConfigured);
    }
  };

  // Razorpay Online Payments State
  const [rzpKeyId, setRzpKeyId] = useState('');
  const [rzpKeySecret, setRzpKeySecret] = useState('');
  const [rzpIsLive, setRzpIsLive] = useState(false);
  const [rzpSaving, setRzpSaving] = useState(false);
  const [rzpStatusMsg, setRzpStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadRazorpayConfig = async () => {
    const res = await fetchRazorpayConfig();
    if (res.success && res.data) {
      setRzpKeyId(res.data.keyId || '');
      setRzpIsLive(res.data.isLive);
    }
  };

  const handleSaveRazorpay = async () => {
    setRzpSaving(true);
    setRzpStatusMsg(null);
    const res = await saveRazorpayConfig({
      keyId: rzpKeyId,
      keySecret: rzpKeySecret,
      mode: rzpKeyId.startsWith('rzp_live') ? 'live' : 'test'
    });
    setRzpSaving(false);
    if (res.success) {
      setRzpStatusMsg({ type: 'success', text: '✅ Razorpay API keys saved successfully!' });
      await loadRazorpayConfig();
    } else {
      setRzpStatusMsg({ type: 'error', text: '❌ Failed to save Razorpay keys: ' + res.message });
    }
  };

  // Option 3: Side-by-Side Live Courier Comparison Modal State
  const [comparisonModalOrder, setComparisonModalOrder] = useState<Order | null>(null);
  const [comparisonRates, setComparisonRates] = useState<any[]>([]);
  const [loadingRates, setLoadingRates] = useState(false);
  const [packageWeight, setPackageWeight] = useState<number>(0.25);
  const [packageWeightInput, setPackageWeightInput] = useState<string>('0.25');
  const weightDebounceTimerRef = useRef<any>(null);

  const openCourierComparison = async (order: Order) => {
    // 1. Auto-detect weight from order items + packaging
    let netGrams = 0;
    if (order.items && Array.isArray(order.items)) {
      netGrams = order.items.reduce((sum, i: any) => sum + (Number(i.weightGrams || i.weight || 25) * Number(i.quantity || 1)), 0);
    }
    const autoWeight = Math.max(0.25, Math.ceil((netGrams + 100) / 100) / 10);
    setPackageWeight(autoWeight);
    setPackageWeightInput(autoWeight.toString());

    setComparisonModalOrder(order);
    setLoadingRates(true);
    setComparisonRates([]);
    const res = await fetchCourierComparison(
      order.customer.pincode,
      order.paymentMethod === 'cod',
      order.totalAmount,
      autoWeight
    );
    if (res.success && res.data) {
      setComparisonRates(res.data);
    }
    setLoadingRates(false);
  };

  const refreshRatesForWeight = async (newWeight: number) => {
    if (!comparisonModalOrder) return;
    setLoadingRates(true);
    const res = await fetchCourierComparison(
      comparisonModalOrder.customer.pincode,
      comparisonModalOrder.paymentMethod === 'cod',
      comparisonModalOrder.totalAmount,
      newWeight
    );
    if (res.success && res.data) {
      setComparisonRates(res.data);
    }
    setLoadingRates(false);
  };

  const handleWeightInputChange = (rawVal: string) => {
    setPackageWeightInput(rawVal);
    const parsed = parseFloat(rawVal);
    if (!isNaN(parsed) && parsed > 0) {
      setPackageWeight(parsed);
      if (weightDebounceTimerRef.current) clearTimeout(weightDebounceTimerRef.current);
      weightDebounceTimerRef.current = setTimeout(() => {
        refreshRatesForWeight(parsed);
      }, 350);
    }
  };

  // Owner Authentication Security State (Server-verified 24h JWT)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authErrorMessage, setAuthErrorMessage] = useState('');

  useEffect(() => {
    async function verifyAuth() {
      const isValid = await verifyAdminSession();
      if (isValid) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        setAdminToken(null);
      }
    }
    verifyAuth();
  }, []);

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pinInput.trim()) return;

    setAuthLoading(true);
    setAuthErrorMessage('');

    const res = await adminLogin(pinInput);
    setAuthLoading(false);

    if (res.success && res.token) {
      setIsAuthenticated(true);
      setPinError(false);
      setPinInput('');
      await loadData();
    } else {
      setPinError(true);
      setAuthErrorMessage(res.message || 'Incorrect Owner PIN.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setAdminToken(null);
  };

  // Add Product Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState<JewelleryCategory>('1-gram-gold');
  const [newProdSubcategory, setNewProdSubcategory] = useState<'chains' | 'bangles' | 'necklaces' | 'earrings' | 'rings' | 'temple-sets' | 'bracelets'>('necklaces');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdOriginalPrice, setNewProdOriginalPrice] = useState('');
  const [newProdImages, setNewProdImages] = useState<string[]>([]);
  const [manualUrlInput, setManualUrlInput] = useState('');
  const [newProdMaterial, setNewProdMaterial] = useState('Pure Copper Base with 1-Gram Micro Gold Plating');
  const [newProdWarranty, setNewProdWarranty] = useState('22KT Micro Gold Plated Finish');
  const [newProdWaterproof, setNewProdWaterproof] = useState(false);
  const [newProdStock, setNewProdStock] = useState('10');
  const [newProdWeight, setNewProdWeight] = useState('');
  const [newProdDescription, setNewProdDescription] = useState('');
  const [isSubmittingProd, setIsSubmittingProd] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Close modal on Escape key & handle body scroll lock
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isAddModalOpen) {
        setIsAddModalOpen(false);
      }
    };
    if (isAddModalOpen) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isAddModalOpen]);

  // Photo Upload Handler (Camera / Gallery / Multiple Files)
  const handlePhotoFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append('photos', file);
      });

      const token = getAdminToken();
      const res = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      const json = await res.json();
      if (json.success && json.imageUrls) {
        setNewProdImages((prev) => [...prev, ...json.imageUrls].slice(0, 8));
      } else {
        throw new Error(json.message || 'Upload failed');
      }
    } catch {
      // Local fallback: generate Base64 preview data URLs
      const readers = Array.from(files).map((file) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
      });
      const dataUrls = await Promise.all(readers);
      setNewProdImages((prev) => [...prev, ...dataUrls].slice(0, 8));
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = (index: number) => {
    setNewProdImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSetCoverPhoto = (index: number) => {
    setNewProdImages((prev) => {
      const target = prev[index];
      const rest = prev.filter((_, i) => i !== index);
      return [target, ...rest];
    });
  };

  const handleAddManualUrl = () => {
    const trimmed = manualUrlInput.trim();
    if (!trimmed) return;
    setNewProdImages((prev) => [...prev, trimmed].slice(0, 8));
    setManualUrlInput('');
  };

  // Play subtle web audio notification chime on new order
  const playNewOrderSound = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const audioCtx = new AudioContextClass();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.4);
    } catch {}
  };

  // Load orders and products (with optional background silent refresh)
  const loadData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const [fetchedOrders, fetchedProducts] = await Promise.all([
        fetchOrders(),
        fetchProducts()
      ]);

      // ONLY trigger popup & chime if a newly arrived order has status === 'confirmed'
      if (knownOrderIdsRef.current !== null) {
        const newIncoming = fetchedOrders.filter(
          (o) => !knownOrderIdsRef.current!.has(o.id)
        );
        const newConfirmed = newIncoming.find((o) => o.status === 'confirmed');

        if (newConfirmed) {
          setNewOrderAlert(
            `🔔 NEW CONFIRMED ORDER: #${newConfirmed.orderNumber} placed by ${newConfirmed.customer.fullName} (₹${newConfirmed.totalAmount})!`
          );
          playNewOrderSound();
        }
      }

      knownOrderIdsRef.current = new Set(fetchedOrders.map((o) => o.id));

      setOrders(fetchedOrders);
      setProducts(fetchedProducts);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Auto-dismiss new confirmed order alert banner after 12 seconds
  useEffect(() => {
    if (newOrderAlert) {
      const timer = setTimeout(() => {
        setNewOrderAlert(null);
      }, 12000);
      return () => clearTimeout(timer);
    }
  }, [newOrderAlert]);

  useEffect(() => {
    loadData();

    // Auto-sync every 8 seconds so owner sees new customer orders instantly without manual refresh
    const timer = setInterval(() => {
      loadData(true);
    }, 8000);

    return () => clearInterval(timer);
  }, []);

  // Update defaults when category changes
  const handleCategoryChange = (cat: JewelleryCategory) => {
    setNewProdCategory(cat);
    if (cat === 'anti-tarnish') {
      setNewProdMaterial('316L Surgical Stainless Steel + 18K Real Gold PVD Coating');
      setNewProdWarranty('18K PVD Anti-Tarnish Coating');
      setNewProdWaterproof(true);
    } else if (cat === '1-gram-gold') {
      setNewProdMaterial('Pure Copper Base with 1-Gram Micro Gold Plating');
      setNewProdWarranty('22KT Micro Gold Plated Finish');
      setNewProdWaterproof(false);
    } else {
      setNewProdMaterial('Alloy / Brass with High Grade CZ & Kundan Stones');
      setNewProdWarranty('High Grade Kundan / CZ Party Wear Finish');
      setNewProdWaterproof(false);
    }
  };

  // Create Product Submit Handler
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice) {
      alert('Please enter a product name and price.');
      return;
    }

    setIsSubmittingProd(true);
    try {
      const payload = {
        name: newProdName,
        category: newProdCategory,
        subcategory: newProdSubcategory,
        description: newProdDescription.trim() || `${newProdName} crafted with ${newProdMaterial}. Premium South Indian luxury finish.`,
        price: Number(newProdPrice),
        originalPrice: Number(newProdOriginalPrice || newProdPrice),
        images: newProdImages.length > 0 ? newProdImages : [
          'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600&auto=format&fit=crop&q=80'
        ],
        material: newProdMaterial,
        polishWarranty: newProdWarranty,
        isWaterproof: newProdWaterproof,
        isSweatproof: true,
        weightGrams: newProdWeight ? Number(newProdWeight) : undefined,
        stockCount: Number(newProdStock || 10),
        inStock: true
      };

      const res = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error('Failed to create product');

      // Reset form & reload
      setNewProdName('');
      setNewProdPrice('');
      setNewProdOriginalPrice('');
      setNewProdImages([]);
      setManualUrlInput('');
      setNewProdWeight('');
      setNewProdDescription('');
      setIsAddModalOpen(false);
      await loadData();
      alert('Jewellery piece with all photos published successfully to your store!');
    } catch (err: any) {
      alert('Error creating product: ' + err.message);
    } finally {
      setIsSubmittingProd(false);
    }
  };

  // Handle 1-Click "Request Pickup"
  const handleRequestPickup = async (orderId: string, dispatchType?: 'courier' | 'local_rider', courierPreference?: string, weightKg?: number) => {
    setActionLoadingId(orderId);
    try {
      const response = await requestPickup(orderId, dispatchType, courierPreference, weightKg);
      if (response.success) {
        setNewOrderAlert(null);
        if (response.deliveryType === 'local_sullia' && response.whatsappDispatchUrl) {
          window.open(response.whatsappDispatchUrl, '_blank');
        } else {
          alert(`✅ Order Dispatched!\nCarrier: ${response.courierName}\nAWB Tracking Code: ${response.awbCode}${response.freightCharge ? `\nCourier Freight Rate: ₹${response.freightCharge} (Lowest Rate Locked)` : ''}\n\nYou can now click "Print Shipping Label" to print the Code-128 barcode!`);
        }
        await loadData();
      }
    } catch (err: any) {
      alert('Error scheduling pickup: ' + err.message);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Toggle in/out of stock
  const handleToggleStock = async (productId: string, currentStock: boolean) => {
    try {
      await fetch(`${API_BASE_URL}/products/${productId}/stock`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ inStock: !currentStock })
      });
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, inStock: !currentStock } : p))
      );
    } catch {
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, inStock: !currentStock } : p))
      );
    }
  };

  // Permanently Delete Product
  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${productName}" from your store?`)) {
      return;
    }

    try {
      await deleteProduct(productId);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    } catch {
      setProducts((prev) => prev.filter((p) => p.id !== productId));
    }
  };

  // Financial metrics
  const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const pendingPackCount = orders.filter((o) => o.status === 'confirmed').length;

  const filteredOrders = orders.filter((o) => {
    if (orderFilter === 'all') return true;
    return o.status === orderFilter;
  });

  // Owner Secret Security Gate (Blocked for unauthorized visitors)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#140D07] flex flex-col items-center justify-center p-4 text-[#FAF4EB]">
        <div className="bg-[#1E130C] border border-[#3D2617] rounded-2xl max-w-sm w-full p-6 sm:p-7 shadow-2xl space-y-5 text-center animate-fadeIn">
          <div className="w-16 h-16 rounded-full overflow-hidden mx-auto border-2 border-[#C68A4C] bg-[#FAF4EB] p-0.5 shadow-md">
            <img
              src="/sparkle-logo-256.webp"
              alt="Sparkle Logo"
              className="w-full h-full object-contain rounded-full"
            />
          </div>

          <div>
            <h2 className="font-serif font-bold text-xl text-[#FAF4EB]">Sparkle Jewelry</h2>
            <p className="text-[10px] tracking-[0.25em] uppercase text-[#C68A4C] font-semibold mt-0.5">
              Owner Security Portal
            </p>
            <p className="text-xs text-[#C4B29E] mt-2 leading-relaxed">
              Enter the Owner Secret PIN to access store orders, customer addresses & inventory controls.
            </p>
          </div>

          <form onSubmit={handlePinSubmit} className="space-y-3">
            <div className="relative">
              <input
                type="password"
                maxLength={6}
                autoFocus
                value={pinInput}
                onChange={(e) => {
                  setPinInput(e.target.value);
                  setPinError(false);
                }}
                placeholder="Enter 4-digit PIN"
                className="w-full bg-[#140D07] border border-[#523520] focus:border-[#C68A4C] rounded-xl px-4 py-3 text-center text-xl font-mono tracking-widest text-[#FAF4EB] focus:outline-none focus:ring-2 focus:ring-[#C68A4C]/30"
              />
            </div>

            {pinError && (
              <div className="text-xs text-rose-300 bg-rose-950/60 border border-rose-800/80 p-2.5 rounded-lg flex items-center justify-center gap-1.5 animate-fadeIn">
                <ShieldAlert className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{authErrorMessage || 'Incorrect PIN. Try again.'}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-[#C68A4C] hover:bg-[#B3793E] active:scale-95 disabled:bg-stone-600 text-[#1E130C] font-bold text-xs py-3 rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              <span>{authLoading ? 'Verifying with Security Vault...' : 'Unlock Store Dashboard'}</span>
            </button>
          </form>

          <div className="pt-2 text-[10px] text-stone-400 flex items-center justify-center gap-1">
            <Lock className="w-3 h-3 text-[#C68A4C]" />
            <span>Protected by 256-Bit Encrypted JWT & Server Security</span>
          </div>

          <div className="pt-2 border-t border-[#3D2617]/80 text-[11px] text-[#A69584]">
            <Link href="/" className="hover:text-white transition-colors underline">
              ← Return to Customer Storefront
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 flex flex-col w-full max-w-full overflow-x-hidden">
      {/* Top Admin Header - Clean & Decongested for Mobile and Desktop */}
      <header className="bg-stone-900 text-white px-3 sm:px-6 py-2.5 sm:py-3 border-b border-stone-800 sticky top-0 z-30 shadow-md w-full">
        <div className="flex items-center justify-between gap-2 sm:gap-4 max-w-6xl mx-auto">
          {/* Left: Back Arrow + Store Title */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <Link
              href="/"
              className="text-stone-400 hover:text-white shrink-0 flex items-center justify-center border border-stone-700 w-8 h-8 sm:w-auto sm:px-2.5 sm:py-1.5 rounded-lg transition-colors text-xs"
              title="Return to Storefront"
            >
              <ArrowLeft className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline ml-1 font-medium">Storefront</span>
            </Link>

            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden border border-amber-500/40 shrink-0 bg-stone-800 shadow-2xs">
              <img
                src="/sparkle-logo-256.webp"
                alt="Sparkle Logo"
                className="w-full h-full object-cover"
              />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-nowrap">
                <h1 className="font-serif font-bold text-sm sm:text-lg text-amber-200 truncate">
                  Sparkle Jewelry
                </h1>
                <span className="bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded font-sans font-bold uppercase tracking-wider shrink-0">
                  Owner
                </span>
              </div>
              <p className="text-[10px] sm:text-[11px] text-stone-400 truncate hidden sm:block">
                Shop Counter Management & Express Dispatch
              </p>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Live Cloud Sync Pill */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-700/40 text-[10px] text-emerald-300 font-medium tracking-wide">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Live Cloud Sync</span>
            </div>

            {/* Add Product Button */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs flex items-center gap-1 shadow-sm transition-all whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Add Jewellery</span>
              <span className="sm:hidden text-xs">Add</span>
            </button>

            {/* Refresh Button */}
            <button
              onClick={() => loadData(false)}
              className="text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-700 active:scale-95 w-8 h-8 sm:w-auto sm:px-2.5 sm:py-1.5 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-colors shrink-0"
              title="Refresh Orders"
            >
              <RefreshCw className={`w-3.5 h-3.5 shrink-0 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline font-medium">Refresh</span>
            </button>

            {/* Lock Portal Button */}
            <button
              onClick={handleLogout}
              className="text-stone-300 hover:text-amber-300 bg-stone-800 hover:bg-stone-700 active:scale-95 px-2.5 py-1.5 rounded-lg text-xs flex items-center gap-1.5 transition-colors shrink-0"
              title="Lock Owner Portal"
            >
              <Lock className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline font-medium">Lock</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6 w-full flex-1 space-y-4 sm:space-y-6">
        {/* Dynamic New Order Incoming Alert Banner */}
        {newOrderAlert && (
          <div className="bg-emerald-600 border border-emerald-500 text-white font-bold text-xs sm:text-sm py-3 px-4 rounded-xl shadow-lg flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-2">
              <span className="text-base">🎉</span>
              <span>{newOrderAlert}</span>
            </div>
            <button
              onClick={() => setNewOrderAlert(null)}
              className="text-white/80 hover:text-white font-bold text-base px-2 py-0.5 rounded transition-colors"
            >
              ✕
            </button>
          </div>
        )}
        {/* KPI Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3">
          <div className="bg-white p-2.5 sm:p-3.5 rounded-xl border border-stone-200 shadow-xs flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 sm:p-2.5 rounded-lg bg-amber-50 text-amber-700 shrink-0">
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] sm:text-[11px] text-stone-500 font-medium truncate">Total Orders</div>
              <div className="text-base sm:text-lg font-bold font-mono text-stone-900">{orders.length}</div>
            </div>
          </div>

          <div className="bg-white p-2.5 sm:p-3.5 rounded-xl border border-stone-200 shadow-xs flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 sm:p-2.5 rounded-lg bg-yellow-50 text-yellow-700 shrink-0">
              <Package className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] sm:text-[11px] text-stone-500 font-medium truncate">Needs Packing</div>
              <div className="text-base sm:text-lg font-bold font-mono text-amber-800">{pendingPackCount}</div>
            </div>
          </div>

          <div className="bg-white p-2.5 sm:p-3.5 rounded-xl border border-stone-200 shadow-xs flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 sm:p-2.5 rounded-lg bg-emerald-50 text-emerald-700 shrink-0">
              <IndianRupee className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] sm:text-[11px] text-stone-500 font-medium truncate">Total Business</div>
              <div className="text-base sm:text-lg font-bold font-mono text-stone-900 truncate">₹{totalRevenue.toLocaleString('en-IN')}</div>
            </div>
          </div>

          <div className="bg-white p-2.5 sm:p-3.5 rounded-xl border border-stone-200 shadow-xs flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 sm:p-2.5 rounded-lg bg-blue-50 text-blue-700 shrink-0">
              <Truck className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] sm:text-[11px] text-stone-500 font-medium truncate">Active Designs</div>
              <div className="text-base sm:text-lg font-bold font-mono text-stone-900">{products.length}</div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-stone-200 gap-2 sm:gap-4 text-xs font-bold overflow-x-auto no-scrollbar whitespace-nowrap">
          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-2.5 flex items-center gap-1.5 transition-all shrink-0 ${
              activeTab === 'orders'
                ? 'border-b-2 border-amber-600 text-amber-800'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Package className="w-4 h-4 shrink-0" />
            <span>Customer Orders ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('inventory')}
            className={`pb-2.5 flex items-center gap-1.5 transition-all shrink-0 ${
              activeTab === 'inventory'
                ? 'border-b-2 border-amber-600 text-amber-800'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <ShoppingBag className="w-4 h-4 shrink-0" />
            <span>Manage Stock ({products.length})</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('courier');
              loadCourierConfig();
              loadRazorpayConfig();
            }}
            className={`pb-2.5 flex items-center gap-1.5 transition-all shrink-0 ${
              activeTab === 'courier'
                ? 'border-b-2 border-amber-600 text-amber-800'
                : 'text-stone-500 hover:text-stone-800'
            }`}
          >
            <Truck className="w-4 h-4 shrink-0" />
            <span>
              <span className="sm:hidden">Logistics & Gateway</span>
              <span className="hidden sm:inline">Courier & Online Payments (Shiprocket & Razorpay)</span>
            </span>
          </button>
        </div>

        {/* ================= TAB 1: ORDERS FEED ================= */}
        {activeTab === 'orders' && (
          <div className="space-y-3 sm:space-y-4">
            {/* Filter Pills */}
            <div className="flex gap-1.5 sm:gap-2 text-xs overflow-x-auto no-scrollbar pb-1">
              {(['all', 'confirmed', 'packed', 'delivered'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setOrderFilter(tab)}
                  className={`px-3 py-1.5 rounded-full capitalize font-medium transition-colors shrink-0 whitespace-nowrap ${
                    orderFilter === tab
                      ? 'bg-amber-700 text-white shadow-xs'
                      : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  {tab === 'all' ? 'All Orders' : tab === 'confirmed' ? '🟡 Unpacked' : tab === 'packed' ? '🔵 Packed' : '🟢 Delivered'}
                </button>
              ))}
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl border border-stone-200 text-stone-400 text-xs">
                No orders found under this status.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredOrders.map((order) => {
                  const isLocalSullia = order.deliveryZone === 'local_sullia';
                  const needsPacking = order.status === 'confirmed';

                  return (
                    <div
                      key={order.id}
                      className="bg-white rounded-xl border border-stone-200 p-4 shadow-xs space-y-3 flex flex-col justify-between"
                    >
                      <div className="flex justify-between items-start border-b border-stone-100 pb-2.5">
                        <div>
                          <div className="font-mono font-bold text-sm text-stone-900">{order.orderNumber}</div>
                          <div className="text-[11px] text-stone-400">
                            {new Date(order.createdAt).toLocaleDateString('en-IN', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              order.status === 'confirmed'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : order.status === 'packed'
                                ? 'bg-blue-100 text-blue-800 border border-blue-200'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}
                          >
                            {order.status === 'confirmed' ? 'Needs Packing' : order.status}
                          </span>

                          <span className="text-[10px] font-semibold text-stone-600">
                            {order.paymentMethod === 'cod' ? '🟡 Cash on Delivery' : '🟢 UPI Prepaid'}
                          </span>
                        </div>
                      </div>

                      {/* Customer Details */}
                      <div className="bg-stone-50 rounded-lg p-2.5 text-xs text-stone-700 space-y-1">
                        <div className="flex justify-between items-center">
                          <strong className="text-stone-900">{order.customer.fullName}</strong>
                          <a
                            href={`tel:${order.customer.phoneNumber}`}
                            className="text-emerald-700 font-mono font-bold hover:underline flex items-center gap-1"
                          >
                            <Phone className="w-3 h-3" />
                            {order.customer.phoneNumber}
                          </a>
                        </div>
                        <div className="text-[11px] text-stone-600 leading-tight">
                          {order.customer.addressLine}
                          {order.customer.landmark ? `, Near ${order.customer.landmark}` : ''}
                        </div>
                        <div className="flex items-center gap-2 pt-1 font-mono text-[11px]">
                          <span className="bg-stone-200 px-1.5 py-0.5 rounded">PIN: {order.customer.pincode}</span>
                          <span className="font-bold text-amber-800">
                            {isLocalSullia
                              ? '🛵 Sullia Local Town (Shop Rider)'
                              : order.courierName
                              ? `📦 ${order.courierName}`
                              : '📦 Courier: Assigned on Dispatch'}
                          </span>
                        </div>
                      </div>

                      {/* Ordered Items */}
                      <div className="space-y-1.5">
                        <div className="text-[11px] font-bold uppercase text-stone-400">Items Ordered:</div>
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center gap-2 text-xs text-stone-800">
                            <img
                              src={item.image}
                              alt=""
                              className="w-8 h-8 rounded object-cover bg-stone-100"
                            />
                            <div className="flex-1 truncate">
                              <span className="font-medium">{item.productName}</span>
                              <span className="text-stone-400 text-[11px]"> x {item.quantity}</span>
                            </div>
                            <span className="font-mono font-semibold">₹{item.price * item.quantity}</span>
                          </div>
                        ))}
                      </div>

                      {/* Price & Courier Info */}
                      <div className="pt-2 border-t border-stone-100 flex justify-between items-center text-xs">
                        <div>
                          <span className="text-stone-500">Total: </span>
                          <span className="text-sm font-bold text-stone-900 font-mono">
                            ₹{order.totalAmount.toLocaleString('en-IN')}
                          </span>
                        </div>
                        {order.awbCode && (
                          <div className="text-[11px] text-stone-500 font-mono">
                            AWB: <strong>{order.awbCode}</strong> ({order.courierName})
                          </div>
                        )}
                        {isLocalSullia && (
                          <div className="text-[11px] text-amber-800 font-mono bg-amber-50 px-2 py-0.5 rounded">
                            OTP: <strong>{order.otpCode || '4821'}</strong>
                          </div>
                        )}
                      </div>

                      {/* Action Dispatch Buttons */}
                      <div className="pt-2 flex flex-col gap-2">
                        {needsPacking ? (
                          <div className="flex flex-col gap-1.5">
                            {isLocalSullia ? (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleRequestPickup(order.id, 'local_rider')}
                                  disabled={actionLoadingId === order.id}
                                  className="flex-1 font-bold text-xs py-2.5 px-2 rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition-all bg-emerald-600 hover:bg-emerald-700 text-white"
                                  title="Assign to local Sullia shop bike delivery rider with OTP & WhatsApp"
                                >
                                  {actionLoadingId === order.id ? (
                                    'Assigning...'
                                  ) : (
                                    <>
                                      <MessageCircle className="w-3.5 h-3.5" />
                                      <span>Assign Sullia Rider</span>
                                    </>
                                  )}
                                </button>

                                <button
                                  onClick={() => handleRequestPickup(order.id, 'courier')}
                                  disabled={actionLoadingId === order.id}
                                  className="flex-1 font-bold text-xs py-2.5 px-2 rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition-all bg-amber-600 hover:bg-amber-700 text-white"
                                  title="Auto-route to Delhivery or Blue Dart courier, generate AWB & shipping label"
                                >
                                  {actionLoadingId === order.id ? (
                                    'Routing...'
                                  ) : (
                                    <>
                                      <Truck className="w-3.5 h-3.5" />
                                      <span>Route Courier ({order.totalAmount > 1500 ? 'Blue Dart' : 'Delhivery'})</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            ) : (
                              <>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleRequestPickup(order.id, 'courier', 'delhivery')}
                                    disabled={actionLoadingId === order.id}
                                    className="flex-1 font-bold text-xs py-2.5 px-2 rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition-all bg-amber-600 hover:bg-amber-700 text-white"
                                    title="Dispatch via Delhivery Express (Surface courier: ~₹42)"
                                  >
                                    {actionLoadingId === order.id ? (
                                      'Routing...'
                                    ) : (
                                      <>
                                        <Truck className="w-3.5 h-3.5" />
                                        <span>Delhivery (₹42)</span>
                                      </>
                                    )}
                                  </button>

                                  <button
                                    onClick={() => handleRequestPickup(order.id, 'courier', 'bluedart')}
                                    disabled={actionLoadingId === order.id}
                                    className="flex-1 font-bold text-xs py-2.5 px-2 rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition-all bg-blue-700 hover:bg-blue-800 text-white"
                                    title="Dispatch via Blue Dart Express (High-value secured cargo: ~₹65)"
                                  >
                                    {actionLoadingId === order.id ? (
                                      'Routing...'
                                    ) : (
                                      <>
                                        <ShieldAlert className="w-3.5 h-3.5" />
                                        <span>Blue Dart (₹65)</span>
                                      </>
                                    )}
                                  </button>
                                </div>

                                <button
                                  onClick={() => openCourierComparison(order)}
                                  className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-900 border border-indigo-200 text-[11px] font-semibold py-2 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                                  title="Compare all 15+ couriers with exact prices, delivery speeds, and customer ratings"
                                >
                                  <ExternalLink className="w-3.5 h-3.5 text-indigo-600" />
                                  <span>📊 Compare All Courier Rates & Ship (Live)</span>
                                </button>
                              </>
                            )}

                            <a
                              href={`${API_BASE_URL}/shipping/invoice/${order.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold py-1.5 px-3 rounded-lg border border-stone-300 flex items-center justify-center gap-1.5 transition-colors"
                              title="Print GST Retail Tax Invoice with 1-Year Guarantee"
                            >
                              <FileText className="w-3.5 h-3.5 text-stone-600" />
                              <span>Print Bill / Invoice for Packing</span>
                            </a>
                          </div>
                        ) : (
                          <div className="w-full flex flex-wrap gap-2">
                            {order.awbCode && (
                              <a
                                href={`${API_BASE_URL}/shipping/label-preview/${order.awbCode}?cod=${order.paymentMethod === 'cod'}&amount=${order.totalAmount}&name=${encodeURIComponent(order.customer.fullName)}&address=${encodeURIComponent(order.customer.addressLine)}&city=${encodeURIComponent(order.customer.city)}&pincode=${order.customer.pincode}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 min-w-[130px] bg-stone-800 hover:bg-stone-900 text-white text-xs font-semibold py-2 px-2.5 rounded-lg flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                              >
                                <Printer className="w-3.5 h-3.5" />
                                <span>Print Shipping Label</span>
                              </a>
                            )}
                            <a
                              href={`${API_BASE_URL}/shipping/invoice/${order.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 min-w-[130px] bg-amber-50 hover:bg-amber-100 text-amber-950 text-xs font-semibold py-2 px-2.5 rounded-lg border border-amber-300 flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                              title="Print GST Retail Tax Invoice with 1-Year Guarantee"
                            >
                              <FileText className="w-3.5 h-3.5 text-amber-700" />
                              <span>Print Bill / Invoice</span>
                            </a>
                            <button
                              onClick={() => {
                                fetch(`${API_BASE_URL}/orders/${order.id}/status`, {
                                  method: 'PATCH',
                                  headers: getAuthHeaders(),
                                  body: JSON.stringify({ status: 'delivered' })
                                }).then(() => loadData());
                              }}
                              className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg border border-emerald-200 flex items-center gap-1 shrink-0"
                            >
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Delivered</span>
                            </button>
                          </div>
                        )}

                        {/* Level 1: 1-Click WhatsApp Quick Actions */}
                        <div className="pt-2 border-t border-stone-100 flex flex-wrap gap-2 items-center justify-between">
                          {/* 1-Click WhatsApp Customer Button */}
                          <a
                            href={`https://wa.me/91${order.customer.phoneNumber.replace(/\D/g, '')}?text=${encodeURIComponent(
                              isLocalSullia
                                ? `Hi ${order.customer.fullName}! ✨ Your Sparkle Jewelry order #${order.orderNumber} (₹${order.totalAmount}) is on the way with our Sullia shop delivery rider! Delivery Address: ${order.customer.addressLine}. Amount to Pay: ₹${order.totalAmount} (${order.paymentMethod.toUpperCase()}). Your Doorstep Verification OTP: ${order.otpCode || '4821'}. The rider will arrive shortly at your doorstep!`
                                : `Hi ${order.customer.fullName}! ✨ Your Sparkle Jewelry order #${order.orderNumber} (₹${order.totalAmount}) is packed for dispatch${order.courierName ? ` via ${order.courierName}` : ''}! Tracking AWB: ${order.awbCode || 'Assigned on Pickup'}. Expected Arrival: ${order.notes || 'Within 2-3 Business Days'}. Track package: ${order.trackingUrl || 'https://shiprocket.co/tracking'}. Thank you for shopping with Sparkle Jewelry Sullia!`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-semibold px-2.5 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-2xs text-[11px]"
                            title="1-Click: Send Pre-typed WhatsApp Update to Customer (Zero Typing)"
                          >
                            <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                            <span>1-Click WhatsApp Customer</span>
                          </a>

                          {/* 1-Click WhatsApp Rider Button (if Local Sullia) */}
                          {isLocalSullia && (
                            <a
                              href={`https://wa.me/?text=${encodeURIComponent(
                                `🛵 *NEW SULLIA LOCAL DELIVERY DISPATCH*\n` +
                                `------------------------------------\n` +
                                `Order #: ${order.orderNumber}\n` +
                                `Customer: ${order.customer.fullName} (${order.customer.phoneNumber})\n` +
                                `Address: ${order.customer.addressLine}, ${order.customer.landmark || ''}\n` +
                                `Collect Cash: ₹${order.totalAmount} (${order.paymentMethod.toUpperCase()})\n` +
                                `Doorstep Verification OTP: ${order.otpCode || '4821'}\n` +
                                `------------------------------------\n` +
                                `Collect jewellery package from Sparkle Jewelry Counter, Sullia Centre Complex, 3rd Floor, Opp KSRTC Bus Stand.`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-semibold px-2.5 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-2xs text-[11px]"
                              title="1-Click: Send Pre-typed Dispatch Details to Delivery Boy"
                            >
                              <Truck className="w-3.5 h-3.5 text-amber-700" />
                              <span>WhatsApp Rider</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 2: INVENTORY STOCK ================= */}
        {activeTab === 'inventory' && (
          <div className="bg-white rounded-xl border border-stone-200 overflow-hidden shadow-xs space-y-3">
            <div className="p-3.5 sm:p-4 border-b border-stone-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2.5 sm:gap-3">
              <div>
                <h3 className="font-bold text-sm text-stone-900">Jewellery Catalogue & Stock Status</h3>
                <p className="text-xs text-stone-500 hidden sm:block">Add new designs or toggle items in/out of stock instantly</p>
              </div>

              <button
                onClick={() => setIsAddModalOpen(true)}
                className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold px-3.5 py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Jewellery Design</span>
              </button>
            </div>

            <div className="divide-y divide-stone-100 text-xs">
              {products.map((prod) => (
                <div key={prod.id} className="p-3.5 flex items-center justify-between gap-3 hover:bg-stone-50">
                  <div className="flex items-center gap-3">
                    <img
                      src={prod.images[0]}
                      alt=""
                      className="w-12 h-12 object-cover rounded-lg bg-stone-100 border border-stone-200"
                    />
                    <div>
                      <h4 className="font-semibold text-stone-900 text-xs">{prod.name}</h4>
                      <div className="text-[11px] text-stone-500 flex items-center gap-2 mt-0.5">
                        <span className="font-mono font-bold text-stone-800">₹{prod.price}</span>
                        {prod.originalPrice > prod.price && (
                          <span className="line-through text-stone-400">₹{prod.originalPrice}</span>
                        )}
                        <span>•</span>
                        <span className="capitalize">{prod.category.replace('-', ' ')}</span>
                        {prod.isWaterproof && (
                          <span className="text-blue-600 font-semibold">• 💧 Waterproof</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Stock Toggle Switch & Delete Button */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[11px] font-bold hidden sm:inline ${prod.inStock ? 'text-emerald-700' : 'text-stone-400'}`}>
                        {prod.inStock ? 'In Stock' : 'Out of Stock'}
                      </span>
                      <button
                        onClick={() => handleToggleStock(prod.id, prod.inStock)}
                        className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                          prod.inStock ? 'bg-emerald-600' : 'bg-stone-300'
                        }`}
                        title="Toggle In/Out of Stock"
                      >
                        <div
                          className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                            prod.inStock ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    {/* Delete Jewellery Button */}
                    <button
                      onClick={() => handleDeleteProduct(prod.id, prod.name)}
                      className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Permanently Delete Design"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= TAB 3: COURIER & DELIVERY INTEGRATION ================= */}
        {activeTab === 'courier' && (
          <div className="space-y-4">
            {/* Status Overview Card */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isCourierConfigured ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base sm:text-lg text-stone-900 flex items-center gap-2">
                      <span>Shiprocket Courier & Delivery Agency</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        isCourierConfigured ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {isCourierConfigured ? '🟢 Live Connected' : '🧪 Simulation / Test Mode'}
                      </span>
                    </h3>
                    <p className="text-xs text-stone-500">
                      Auto-assigns Blue Dart, Delhivery, DTDC & Sullia local shop riders.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <a
                    href="https://app.shiprocket.in/register"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-300 font-semibold px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <span>Create Free Shiprocket Account</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Connected Delivery Network Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-stone-900">
                    <span>🛵 Sullia Local Rider</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">Active</span>
                  </div>
                  <div className="text-[11px] text-stone-600">Pincode 574239 • 2–4 Hr Delivery with Doorstep OTP</div>
                </div>

                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-stone-900">
                    <span>🚚 Delhivery Express</span>
                    <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">Auto-Routed</span>
                  </div>
                  <div className="text-[11px] text-stone-600">Regional Karnataka & Pan-India Standard Ground</div>
                </div>

                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-stone-900">
                    <span>✈️ Blue Dart Express</span>
                    <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">High Value</span>
                  </div>
                  <div className="text-[11px] text-stone-600">Secured Air Cargo for High-Purity Jewellery (&gt; ₹1,500)</div>
                </div>

                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-stone-900">
                    <span>🏷️ ISO Code-128 Labels</span>
                    <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded">Scannable</span>
                  </div>
                  <div className="text-[11px] text-stone-600">Pure Vector SVG Barcode + 2D Live GPS QR Code</div>
                </div>
              </div>

              {/* Testing / Credentials Form */}
              <div className="pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Shiprocket API Credentials & Testing
                </h4>
                <p className="text-xs text-stone-600 mb-4 leading-relaxed">
                  Enter your Shiprocket account credentials below to test live API authentication, or leave blank to run in <strong>Simulation / Test Mode</strong> (which simulates full order dispatch and barcodes without charging any wallet balance).
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      Shiprocket Login Email
                    </label>
                    <input
                      type="email"
                      value={courierEmail}
                      onChange={(e) => setCourierEmail(e.target.value)}
                      placeholder="e.g. your-email@gmail.com"
                      className="w-full text-xs border border-stone-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      Shiprocket Password
                    </label>
                    <input
                      type="password"
                      value={courierPassword}
                      onChange={(e) => setCourierPassword(e.target.value)}
                      placeholder="Enter account password"
                      className="w-full text-xs border border-stone-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      Pickup Address Nickname
                    </label>
                    <input
                      type="text"
                      value={courierPickupLocation}
                      onChange={(e) => setCourierPickupLocation(e.target.value)}
                      placeholder="Primary"
                      className="w-full text-xs border border-stone-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Status Message */}
                {courierStatusMsg && (
                  <div className={`mt-3 p-3 rounded-lg text-xs flex items-center gap-2 ${
                    courierStatusMsg.type === 'success'
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                  }`}>
                    {courierStatusMsg.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                    )}
                    <span>{courierStatusMsg.text}</span>
                  </div>
                )}

                {/* Buttons */}
                <div className="mt-4 flex flex-wrap gap-2.5">
                  <button
                    type="button"
                    disabled={courierTesting}
                    onClick={async () => {
                      setCourierTesting(true);
                      setCourierStatusMsg(null);
                      const res = await testCourierConnection({
                        email: courierEmail,
                        password: courierPassword
                      });
                      setCourierTesting(false);
                      if (res.success) {
                        setCourierStatusMsg({ type: 'success', text: res.message });
                        setIsCourierConfigured(true);
                      } else {
                        setCourierStatusMsg({ type: 'error', text: res.message || 'Connection failed' });
                      }
                    }}
                    className="bg-stone-800 hover:bg-stone-900 active:scale-95 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${courierTesting ? 'animate-spin' : ''}`} />
                    <span>{courierTesting ? 'Testing Connection...' : 'Test Live Connection'}</span>
                  </button>

                  <button
                    type="button"
                    disabled={courierSaving}
                    onClick={async () => {
                      setCourierSaving(true);
                      setCourierStatusMsg(null);
                      const res = await saveCourierConfig({
                        email: courierEmail,
                        password: courierPassword,
                        pickupLocation: courierPickupLocation,
                        mode: courierEmail ? 'live' : 'test'
                      });
                      setCourierSaving(false);
                      if (res.success) {
                        setCourierStatusMsg({ type: 'success', text: 'Courier settings saved & applied successfully!' });
                        setIsCourierConfigured(Boolean(courierEmail && courierPassword));
                      } else {
                        setCourierStatusMsg({ type: 'error', text: res.message || 'Failed to save settings' });
                      }
                    }}
                    className="bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                  >
                    <UploadCloud className="w-3.5 h-3.5" />
                    <span>{courierSaving ? 'Saving...' : 'Save & Connect Credentials'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      setCourierEmail('');
                      setCourierPassword('');
                      setCourierPickupLocation('Primary');
                      await saveCourierConfig({
                        email: 'demo@sulliajewellery.com',
                        password: 'your-shiprocket-password',
                        pickupLocation: 'Primary',
                        mode: 'test'
                      });
                      setIsCourierConfigured(false);
                      setCourierStatusMsg({
                        type: 'success',
                        text: 'Switched to Simulation / Test Mode. You can test without real courier charges.'
                      });
                    }}
                    className="bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs px-3.5 py-2 rounded-lg border border-stone-300 transition-colors cursor-pointer"
                  >
                    <span>Switch to Simulation Mode (Demo)</span>
                  </button>
                </div>
              </div>
            </div>

            {/* ================= RAZORPAY PAYMENT GATEWAY CARD ================= */}
            <div className="bg-white rounded-2xl border border-stone-200 p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    rzpIsLive ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base sm:text-lg text-stone-900 flex items-center gap-2">
                      <span>Razorpay Online Payments Gateway</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        rzpIsLive ? 'bg-emerald-100 text-emerald-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {rzpIsLive ? '🟢 Live Connected' : '🧪 Simulation / Test Mode'}
                      </span>
                    </h3>
                    <p className="text-xs text-stone-500">
                      Accept automated payments via Google Pay, PhonePe, Paytm, Credit/Debit Cards & NetBanking.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <a
                    href="https://razorpay.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-blue-800 bg-blue-50 hover:bg-blue-100 border border-blue-300 font-semibold px-3 py-1.5 rounded-lg transition-colors"
                  >
                    <span>Create Free Razorpay Account</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Supported Payment Channels */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-stone-900">
                    <span>⚡ 1-Click UPI</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded">Zero Failure</span>
                  </div>
                  <div className="text-[11px] text-stone-600">Google Pay, PhonePe, Paytm, BHIM & Any UPI ID</div>
                </div>

                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-stone-900">
                    <span>💳 Credit & Debit Cards</span>
                    <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded">3D Secure</span>
                  </div>
                  <div className="text-[11px] text-stone-600">Visa, Mastercard, RuPay & International Cards</div>
                </div>

                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-stone-900">
                    <span>🏦 50+ NetBanking Banks</span>
                    <span className="text-[10px] bg-purple-100 text-purple-800 px-1.5 py-0.5 rounded">Direct</span>
                  </div>
                  <div className="text-[11px] text-stone-600">SBI, HDFC, Canara Bank, ICICI, Axis Bank</div>
                </div>

                <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-1">
                  <div className="flex items-center justify-between font-bold text-stone-900">
                    <span>💰 Bank Payouts</span>
                    <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded">T+2 Days</span>
                  </div>
                  <div className="text-[11px] text-stone-600">Deposits directly into Sullia shop bank account</div>
                </div>
              </div>

              {/* Status Message */}
              {rzpStatusMsg && (
                <div className={`p-3 rounded-xl text-xs font-semibold ${
                  rzpStatusMsg.type === 'success'
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                    : 'bg-rose-50 text-rose-900 border border-rose-200'
                }`}>
                  {rzpStatusMsg.text}
                </div>
              )}

              {/* Razorpay Credentials Form */}
              <div className="pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Razorpay API Keys & Mode Switcher
                </h4>
                <p className="text-xs text-stone-600 mb-4 leading-relaxed">
                  Enter your Razorpay Key ID and Key Secret from your Razorpay Dashboard (<em>Settings → API Keys</em>), or leave in <strong>Simulation / Test Mode</strong> to test online checkout with simulated UPI and cards for ₹0.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      Razorpay Key ID
                    </label>
                    <input
                      type="text"
                      value={rzpKeyId}
                      onChange={(e) => setRzpKeyId(e.target.value)}
                      placeholder="e.g. rzp_live_xxxxxxxx or rzp_test_xxxxxxxx"
                      className="w-full text-xs font-mono border border-stone-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">
                      Razorpay Key Secret
                    </label>
                    <input
                      type="password"
                      value={rzpKeySecret}
                      onChange={(e) => setRzpKeySecret(e.target.value)}
                      placeholder="Enter Key Secret from Razorpay Dashboard"
                      className="w-full text-xs font-mono border border-stone-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-stone-100 mt-4">
                  <button
                    type="button"
                    disabled={rzpSaving}
                    onClick={handleSaveRazorpay}
                    className="bg-blue-700 hover:bg-blue-800 active:scale-95 text-white font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>{rzpSaving ? 'Saving...' : 'Save Razorpay Keys'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      setRzpKeyId('');
                      setRzpKeySecret('');
                      await saveRazorpayConfig({ keyId: '', keySecret: '', mode: 'test' });
                      setRzpIsLive(false);
                      setRzpStatusMsg({
                        type: 'success',
                        text: 'Switched to Razorpay Simulation Mode. Customers can test payments for ₹0.'
                      });
                    }}
                    className="bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs px-3.5 py-2 rounded-lg border border-stone-300 transition-colors cursor-pointer"
                  >
                    <span>Switch to Simulation Mode (Demo)</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* ================= MODAL: ADD NEW JEWELLERY ================= */}
      {isAddModalOpen && (
        <div
          onClick={() => setIsAddModalOpen(false)}
          className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/75 backdrop-blur-sm p-3 sm:p-6 flex items-start sm:items-center justify-center animate-fadeIn"
          style={{ minHeight: '100dvh' }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl max-w-lg w-full max-h-[calc(100dvh-2.5rem)] sm:max-h-[88vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden relative my-auto mt-4 sm:my-auto"
          >
            {/* Pinned Header - Always 100% visible, never cut off */}
            <div className="flex justify-between items-center px-4 sm:px-5 py-3 sm:py-3.5 border-b border-stone-200 bg-[#FAF4EB] shrink-0 gap-3 sticky top-0 z-20">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-serif font-bold text-sm sm:text-base text-stone-900 truncate">
                    Add New Jewellery Piece
                  </h3>
                  <p className="text-[11px] text-stone-600 truncate">
                    Publish immediately to customer store
                  </p>
                </div>
              </div>

              {/* Close Cross Button - fully circular, distinct & shrink-proof */}
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-stone-200/90 hover:bg-stone-300 active:scale-95 text-stone-700 hover:text-stone-950 flex items-center justify-center shrink-0 transition-all cursor-pointer shadow-xs border border-stone-300"
                title="Close Modal (Esc)"
                aria-label="Close"
              >
                <X className="w-4 h-4 shrink-0 stroke-[2.5]" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleCreateProduct} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-3.5 text-xs">
              {/* Product Name */}
              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  Design Name *
                </label>
                <input
                  type="text"
                  required
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  placeholder="e.g. 1-Gram Antique Lakshmi Jhumkas"
                  className="w-full border border-stone-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              {/* Category Selector */}
              <div>
                <label className="font-bold text-stone-700 block mb-1">
                  Collection Category *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleCategoryChange('1-gram-gold')}
                    className={`p-2 rounded-lg border text-center transition-all ${
                      newProdCategory === '1-gram-gold'
                        ? 'border-amber-600 bg-amber-50 text-amber-900 font-bold'
                        : 'border-stone-200 hover:bg-stone-50 text-stone-600'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 mx-auto mb-0.5 text-amber-600" />
                    <span>✨ 1-Gram Gold</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCategoryChange('anti-tarnish')}
                    className={`p-2 rounded-lg border text-center transition-all ${
                      newProdCategory === 'anti-tarnish'
                        ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold'
                        : 'border-stone-200 hover:bg-stone-50 text-stone-600'
                    }`}
                  >
                    <Droplets className="w-3.5 h-3.5 mx-auto mb-0.5 text-blue-600" />
                    <span>💧 Anti-Tarnish</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCategoryChange('fashion-imitation')}
                    className={`p-2 rounded-lg border text-center transition-all ${
                      newProdCategory === 'fashion-imitation'
                        ? 'border-purple-600 bg-purple-50 text-purple-900 font-bold'
                        : 'border-stone-200 hover:bg-stone-50 text-stone-600'
                    }`}
                  >
                    <Diamond className="w-3.5 h-3.5 mx-auto mb-0.5 text-purple-600" />
                    <span>💎 Imitation</span>
                  </button>
                </div>
              </div>

              {/* Subcategory */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">
                    Jewellery Type
                  </label>
                  <select
                    value={newProdSubcategory}
                    onChange={(e: any) => setNewProdSubcategory(e.target.value)}
                    className="w-full border border-stone-300 rounded-lg px-2.5 py-2 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="necklaces">Necklaces / Harams</option>
                    <option value="chains">Daily Wear Chains</option>
                    <option value="bangles">Bangles / Kadas</option>
                    <option value="earrings">Earrings / Jhumkas</option>
                    <option value="rings">Rings / Bands</option>
                    <option value="bracelets">Bracelets</option>
                    <option value="temple-sets">Temple Bridal Sets</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">
                    Initial Stock Count
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(e.target.value)}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Price & Original Price */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">
                    Selling Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 850"
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">
                    Original Price / MRP (₹)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 1400"
                    value={newProdOriginalPrice}
                    onChange={(e) => setNewProdOriginalPrice(e.target.value)}
                    className="w-full border border-stone-300 rounded-lg px-3 py-2 font-mono focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Multi-Photo Upload: Camera / Gallery / URLs */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-bold text-stone-700">
                    Jewellery Photos * <span className="text-[10px] font-normal text-stone-500">(1 to 6 Angles)</span>
                  </label>
                  {newProdImages.length > 0 && (
                    <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                      {newProdImages.length} Photo{newProdImages.length > 1 ? 's' : ''} Attached
                    </span>
                  )}
                </div>

                {/* Hidden File Input for Camera / Multiple Files */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handlePhotoFileChange}
                />

                {newProdImages.length > 0 ? (
                  <div className="space-y-2">
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 p-2.5 bg-stone-50 border border-stone-200 rounded-xl">
                      {newProdImages.map((imgUrl, idx) => (
                        <div
                          key={idx}
                          className="relative aspect-square rounded-lg overflow-hidden border border-stone-300 group bg-white shadow-2xs"
                        >
                          <img
                            src={imgUrl}
                            alt={`Angle ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          {idx === 0 ? (
                            <span className="absolute top-1 left-1 bg-amber-600 text-white font-bold text-[8px] px-1.5 py-0.5 rounded shadow-xs uppercase">
                              Cover
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleSetCoverPhoto(idx)}
                              className="absolute top-1 left-1 bg-black/70 hover:bg-black text-white text-[8px] font-semibold px-1 py-0.5 rounded transition-all"
                              title="Set as Main Cover Photo"
                            >
                              Set Cover
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(idx)}
                            className="absolute top-1 right-1 bg-rose-600 hover:bg-rose-700 text-white p-1 rounded-full shadow-xs transition-colors"
                            title="Remove Photo"
                          >
                            <X className="w-2.5 h-2.5" />
                          </button>
                          <span className="absolute bottom-1 right-1 bg-black/60 text-white text-[8px] px-1 rounded font-mono">
                            #{idx + 1}
                          </span>
                        </div>
                      ))}

                      {newProdImages.length < 6 && (
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploadingPhoto}
                          className="aspect-square border-2 border-dashed border-amber-300 hover:border-amber-500 bg-amber-50/50 hover:bg-amber-50 rounded-lg flex flex-col items-center justify-center gap-1 text-center transition-all p-1"
                        >
                          <Camera className="w-4 h-4 text-amber-700" />
                          <span className="text-[10px] font-bold text-amber-900">
                            {uploadingPhoto ? 'Adding...' : '+ Add Photo'}
                          </span>
                        </button>
                      )}
                    </div>
                    <p className="text-[10px] text-stone-500">
                      💡 Tip: First photo marked <strong>Cover</strong> will be shown on the catalog card.
                    </p>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingPhoto}
                    className="w-full border-2 border-dashed border-amber-300 hover:border-amber-500 bg-amber-50/50 hover:bg-amber-50 rounded-xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5"
                  >
                    <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center shadow-xs">
                      <Camera className="w-5 h-5" />
                    </div>
                    <span className="font-bold text-amber-900 text-xs">
                      {uploadingPhoto ? 'Uploading Photos...' : '📸 Tap to Take Photo or Pick from Gallery (1 to 6 Photos)'}
                    </span>
                    <span className="text-[10px] text-stone-500">
                      Upload front angle, side angle, macro close-up, or wearing photo
                    </span>
                  </button>
                )}

                {/* Optional Web URL Input */}
                <div className="mt-2 flex items-center gap-1.5">
                  <input
                    type="url"
                    placeholder="or paste web image URL..."
                    value={manualUrlInput}
                    onChange={(e) => setManualUrlInput(e.target.value)}
                    className="flex-1 border border-stone-200 rounded-lg px-2.5 py-1.5 text-[11px] focus:ring-1 focus:ring-amber-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddManualUrl}
                    className="bg-stone-800 hover:bg-stone-900 text-white text-[11px] font-semibold px-2.5 py-1.5 rounded-lg whitespace-nowrap"
                  >
                    Add URL
                  </button>
                </div>
              </div>

              {/* Polish & Material Guarantee */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">
                    Material
                  </label>
                  <input
                    type="text"
                    value={newProdMaterial}
                    onChange={(e) => setNewProdMaterial(e.target.value)}
                    className="w-full border border-stone-300 rounded-lg px-2.5 py-1.5 text-[11px] focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">
                    Guarantee / Warranty
                  </label>
                  <input
                    type="text"
                    value={newProdWarranty}
                    onChange={(e) => setNewProdWarranty(e.target.value)}
                    className="w-full border border-stone-300 rounded-lg px-2.5 py-1.5 text-[11px] focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Weight & Custom Detail (Shown in Customer's Product Detail Tab) */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">
                    Approx Weight (grams)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 14.5"
                    value={newProdWeight}
                    onChange={(e) => setNewProdWeight(e.target.value)}
                    className="w-full border border-stone-300 rounded-lg px-2.5 py-1.5 text-[11px] focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">
                    Product Description / Note
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Antique South Kanara finish"
                    value={newProdDescription}
                    onChange={(e) => setNewProdDescription(e.target.value)}
                    className="w-full border border-stone-300 rounded-lg px-2.5 py-1.5 text-[11px] focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Waterproof Checkbox */}
              <div className="flex items-center gap-2 p-2 bg-stone-50 rounded-lg border border-stone-200">
                <input
                  type="checkbox"
                  id="waterproofCheck"
                  checked={newProdWaterproof}
                  onChange={(e) => setNewProdWaterproof(e.target.checked)}
                  className="rounded border-stone-300 text-blue-600 focus:ring-blue-500"
                />
                <label htmlFor="waterproofCheck" className="text-stone-700 font-medium cursor-pointer">
                  💧 100% Waterproof & Shower-Safe (Anti-Tarnish)
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-stone-200 flex gap-2 sticky bottom-0 bg-white pb-1">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-1/3 py-2.5 border border-stone-300 rounded-xl text-stone-700 font-semibold hover:bg-stone-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingProd}
                  className="w-2/3 bg-amber-600 hover:bg-amber-700 disabled:bg-stone-300 text-white font-bold py-2.5 rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition-all"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>{isSubmittingProd ? 'Publishing...' : 'Save & Publish Design'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= OPTION 3: COURIER COMPARISON & SELECTION MODAL ================= */}
      {comparisonModalOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl flex flex-col border border-stone-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-stone-200 bg-stone-900 text-white flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5 text-amber-400" />
                  <h3 className="font-serif font-bold text-base sm:text-lg text-amber-100">
                    Compare Courier Rates & Choose Carrier
                  </h3>
                </div>
                <div className="text-xs text-stone-300 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span>Order: <strong>{comparisonModalOrder.orderNumber}</strong></span>
                  <span>•</span>
                  <span>Customer: <strong>{comparisonModalOrder.customer.fullName}</strong></span>
                  <span>•</span>
                  <span className="bg-stone-800 px-2 py-0.5 rounded font-mono text-amber-300">
                    📍 {comparisonModalOrder.customer.city} ({comparisonModalOrder.customer.pincode})
                  </span>
                  <span>•</span>
                  <span className="font-mono text-emerald-400">
                    ₹{comparisonModalOrder.totalAmount} ({comparisonModalOrder.paymentMethod.toUpperCase()})
                  </span>
                </div>
              </div>

              <button
                onClick={() => setComparisonModalOrder(null)}
                className="w-8 h-8 rounded-full bg-stone-800 hover:bg-stone-700 text-stone-300 flex items-center justify-center transition-colors"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Bar with Weight Auto-Detect, Override & Quick Slabs */}
            <div className="bg-amber-50/80 p-3 sm:p-4 border-b border-amber-200/80 space-y-2 text-xs text-amber-950">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-bold text-stone-800 flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-amber-700" />
                    <span>Package Gross Weight:</span>
                  </span>

                  <div className="flex items-center bg-white border border-stone-300 rounded-lg px-2 py-0.5 shadow-2xs focus-within:ring-2 focus-within:ring-amber-500">
                    <input
                      type="number"
                      step="0.05"
                      min="0.1"
                      max="20"
                      value={packageWeightInput}
                      onChange={(e) => handleWeightInputChange(e.target.value)}
                      className="w-16 font-mono font-bold text-stone-900 text-xs focus:outline-none"
                    />
                    <span className="text-[11px] font-bold text-stone-500 ml-1">kg</span>
                  </div>

                  <span className="text-[11px] text-stone-500 font-medium hidden sm:inline">
                    (Auto-calculated: items + velvet case + packaging)
                  </span>
                </div>

                <a
                  href="https://app.shiprocket.in/orders"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 font-bold text-amber-800 hover:text-amber-950 underline hover:no-underline text-[11px]"
                  title="Open Shiprocket Dashboard in new tab"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open in Shiprocket Web Portal</span>
                </a>
              </div>

              {/* 1-Click Weight Slab Quick Pickers */}
              <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-amber-200/60">
                <span className="text-[10px] uppercase font-bold text-stone-400 mr-1">Quick Slabs:</span>
                {[
                  { label: '0.25 kg', desc: ' (Base Box)', val: 0.25 },
                  { label: '0.50 kg', desc: ' (Standard Case)', val: 0.50 },
                  { label: '0.80 kg', desc: ' (Gift Box)', val: 0.80 },
                  { label: '1.20 kg', desc: ' (Bridal / Hamper)', val: 1.20 }
                ].map((preset) => (
                  <button
                    key={preset.val}
                    type="button"
                    onClick={() => {
                      setPackageWeightInput(preset.val.toString());
                      setPackageWeight(preset.val);
                      refreshRatesForWeight(preset.val);
                    }}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md transition-all ${
                      Math.abs(packageWeight - preset.val) < 0.01
                        ? 'bg-amber-700 text-white shadow-2xs'
                        : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <span>{preset.label}</span>
                    <span className="hidden sm:inline text-stone-500 font-normal">{preset.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Rates Table / List */}
            <div className="p-4 sm:p-5 overflow-y-auto space-y-3 flex-1 bg-stone-50">
              {loadingRates ? (
                <div className="text-center py-12 space-y-3">
                  <RefreshCw className="w-8 h-8 text-amber-600 animate-spin mx-auto" />
                  <p className="text-xs font-semibold text-stone-600">
                    Fetching live courier comparison rates for PIN {comparisonModalOrder.customer.pincode}...
                  </p>
                </div>
              ) : comparisonRates.length === 0 ? (
                <div className="text-center py-8 text-stone-500 text-xs">
                  No live rates found. You can still use the 1-click Delhivery or Blue Dart dispatch buttons.
                </div>
              ) : (
                <div className="space-y-2.5">
                  <div className="text-[11px] font-bold uppercase text-stone-500 px-1">
                    Available Courier Delivery Agencies ({comparisonRates.length}):
                  </div>

                  {comparisonRates.map((c, idx) => (
                    <div
                      key={idx}
                      className="bg-white rounded-xl border border-stone-200 hover:border-amber-400 p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs hover:shadow-md transition-all"
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-sm text-stone-900">{c.courierName}</h4>
                          <span className="text-xs text-amber-600 font-bold">⭐ {c.rating}</span>
                          {c.badge && (
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                c.badge.includes('Lowest')
                                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                  : c.badge.includes('Secured')
                                  ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                  : 'bg-amber-100 text-amber-800 border border-amber-300'
                              }`}
                            >
                              {c.badge}
                            </span>
                          )}
                        </div>

                        <div className="text-[11px] text-stone-500 flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span>⏱️ Delivery: <strong className="text-stone-800">{c.etd}</strong></span>
                          <span>•</span>
                          <span>💡 Best for: <em className="text-stone-700">{c.recommendedFor}</em></span>
                        </div>
                      </div>

                      {/* Price & Action Button */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-stone-100">
                        <div className="text-left sm:text-right">
                          <div className="text-lg font-bold font-mono text-stone-900">
                            ₹{c.rate}
                          </div>
                          <div className="text-[10px] text-stone-400 font-medium">freight charge</div>
                        </div>

                        <button
                          onClick={async () => {
                            await handleRequestPickup(comparisonModalOrder.id, 'courier', c.courierName, packageWeight);
                            setComparisonModalOrder(null);
                          }}
                          disabled={actionLoadingId === comparisonModalOrder.id}
                          className="bg-stone-900 hover:bg-amber-700 text-white font-bold text-xs py-2 px-3.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs active:scale-95"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>Ship with this Courier</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-white border-t border-stone-200 flex justify-end">
              <button
                onClick={() => setComparisonModalOrder(null)}
                className="px-4 py-1.5 rounded-lg border border-stone-300 text-stone-700 text-xs font-semibold hover:bg-stone-100 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
