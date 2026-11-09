'use client';

import React, { useState } from 'react';
import { checkPincode } from '../lib/api';
import { PincodeInfo } from '../types';
import { X, MapPin, Truck, CheckCircle2, Clock } from 'lucide-react';

interface PincodeCheckerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPincode: (pincode: string) => void;
}

export default function PincodeCheckerModal({
  isOpen,
  onClose,
  onSelectPincode
}: PincodeCheckerModalProps) {
  const [inputPin, setInputPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PincodeInfo | null>(null);

  if (!isOpen) return null;

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPin.trim().length !== 6) return;
    setLoading(true);
    try {
      const data = await checkPincode(inputPin.trim());
      setResult(data);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (result) {
      onSelectPincode(result.pincode);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/50 backdrop-blur-xs p-4 animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-xl border border-stone-200">
        <div className="flex justify-between items-center pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-amber-600" />
            <h3 className="font-serif font-bold text-base text-stone-900">Check Delivery to Your Area</h3>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleCheck} className="mt-4">
          <label className="text-xs font-semibold text-stone-600 block mb-1.5">
            Enter 6-Digit Indian PIN Code:
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              maxLength={6}
              value={inputPin}
              onChange={(e) => setInputPin(e.target.value.replace(/\D/g, ''))}
              placeholder="e.g. 574239 (Sullia) or 575001 (Mangalore)"
              className="flex-1 border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 font-mono"
            />
            <button
              type="submit"
              disabled={loading || inputPin.length !== 6}
              className="bg-amber-600 hover:bg-amber-700 disabled:bg-stone-300 text-white font-semibold text-xs px-4 py-2 rounded-lg transition-colors"
            >
              {loading ? 'Checking...' : 'Check'}
            </button>
          </div>
        </form>

        {/* Quick Suggestion Pills */}
        <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] text-stone-500">
          <span>Popular:</span>
          <button
            onClick={() => setInputPin('574239')}
            className="underline hover:text-amber-700"
          >
            574239 (Sullia)
          </button>
          <span>•</span>
          <button
            onClick={() => setInputPin('574201')}
            className="underline hover:text-amber-700"
          >
            574201 (Puttur)
          </button>
          <span>•</span>
          <button
            onClick={() => setInputPin('575001')}
            className="underline hover:text-amber-700"
          >
            575001 (Mangalore)
          </button>
          <span>•</span>
          <button
            onClick={() => setInputPin('560001')}
            className="underline hover:text-amber-700"
          >
            560001 (Bengaluru)
          </button>
        </div>

        {/* Result Card - Flipkart Style Accurate Delivery Date */}
        {result && (
          <div className="mt-4 p-4 bg-[#FAF4EB] border border-[#C68A4C]/40 rounded-xl space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Serviceable Area ({result.pincode})</span>
              </div>
              <span className="text-[10px] bg-emerald-100 text-emerald-900 font-semibold px-2 py-0.5 rounded-full border border-emerald-300">
                Verified Route
              </span>
            </div>

            {/* Prominent Delivery Date Badge */}
            <div className="bg-white p-3 rounded-lg border border-[#EDE3D2] space-y-1">
              <div className="text-[10px] uppercase font-bold tracking-wider text-[#A37B55]">
                Guaranteed Estimate
              </div>
              <div className="text-sm sm:text-base font-serif font-bold text-[#1E130C] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#C68A4C] shrink-0" />
                <span>{result.deliveryDateStr || result.estimatedDeliveryTime}</span>
              </div>
              {result.cutoffUrgency && (
                <div className="text-[11px] font-medium text-amber-900 bg-amber-50 px-2 py-1 rounded border border-amber-200 mt-1">
                  ⏳ {result.cutoffUrgency}
                </div>
              )}
            </div>

            {/* Dispatch & Courier Information */}
            <div className="space-y-1 text-[11px] text-stone-700">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-stone-900">Dispatch:</span>
                <span>{result.dispatchNotice || 'Dispatched directly from Sullia Counter'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-[#C68A4C] shrink-0" />
                <span>
                  Partners: <strong>{result.couriersAvailable.join(', ')}</strong>
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-[#EDE3D2] flex justify-between items-center text-[11px] text-stone-600">
              <span>
                Delivery: <strong>{result.shippingFee === 0 ? 'FREE' : `₹${result.shippingFee}`}</strong>
              </span>
              <span className="text-emerald-700 font-semibold">
                FREE above ₹{result.freeShippingAbove}
              </span>
            </div>

            <div className="text-[10px] text-stone-500 italic">
              * Includes standard route transit safety buffer. Real-time WhatsApp tracking link sent upon handover.
            </div>

            <button
              onClick={handleApply}
              className="w-full mt-2 bg-[#C68A4C] hover:bg-[#B3793E] text-[#1E130C] font-semibold py-2.5 rounded-lg text-xs transition-colors shadow-2xs"
            >
              Set this Delivery PIN ({result.pincode})
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
