'use client';

import React from 'react';
import { X, MapPin, Phone, MessageCircle, Clock, Navigation } from 'lucide-react';

interface StoreLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function StoreLocationModal({
  isOpen,
  onClose
}: StoreLocationModalProps) {
  if (!isOpen) return null;

  const mapsLink = 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent('Sullia Centre Complex Opposite KSRTC Bus Stand Sullia Karnataka 574239');

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-stone-900/60 backdrop-blur-xs p-0 sm:p-4 animate-fadeIn">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl max-w-md w-full p-5 shadow-2xl border border-stone-200">
        <div className="flex justify-between items-center pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full overflow-hidden border border-[#C68A4C]/40 shrink-0 shadow-xs bg-[#FAF4EB]">
              <img
                src="/sparkle-logo-256.webp"
                alt="Sparkle Jewelry"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h3 className="font-serif font-bold text-base text-stone-900">Visit Our Showroom</h3>
              <p className="text-[11px] text-stone-500">Sullia, Dakshina Kannada</p>
            </div>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-600 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-3.5 text-xs text-stone-700">
          {/* Address Box */}
          <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 space-y-1">
            <strong className="text-sm font-serif font-bold text-stone-900 block">Sparkle Jewelry</strong>
            <p className="text-stone-700 leading-relaxed text-[11px]">
              Sullia Centre Complex, 3rd Floor,<br />
              Opposite KSRTC Bus Stand,<br />
              Sullia, Dakshina Kannada, Karnataka - 574239
            </p>
          </div>

          {/* Timings */}
          <div className="flex items-center gap-2 text-stone-600 text-[11px] bg-stone-50 p-2.5 rounded-lg border border-stone-200">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Open Every Day: <strong>9:30 AM – 8:30 PM</strong> (Mon – Sun)</span>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-1">
            <a
              href={mapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <Navigation className="w-4 h-4" />
              <span>Get Directions on Google Maps</span>
            </a>

            <div className="grid grid-cols-2 gap-2">
              <a
                href="tel:+918921844922"
                className="p-2.5 border border-stone-300 rounded-xl text-stone-800 hover:bg-stone-50 font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-stone-600" />
                <span>Call Store</span>
              </a>

              <a
                href="https://wa.me/918921844922?text=Hi%20Sparkle%20Jewelry,%20I%20want%20to%20visit%20your%20shop%20in%20Sullia."
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 border border-emerald-500 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
