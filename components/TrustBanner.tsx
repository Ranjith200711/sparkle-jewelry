import React from 'react';
import { Droplet, Sparkles, Truck, ShieldCheck } from 'lucide-react';

export default function TrustBanner() {
  return (
    <div className="bg-amber-50/70 border-y border-amber-200/50 py-3 px-3 sm:px-4 my-3 sm:my-4 w-full max-w-full overflow-hidden">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3 text-center">
        <div className="flex items-center justify-center gap-2 text-stone-800">
          <div className="p-1.5 rounded-full bg-amber-100 text-amber-700">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="text-left">
            <div className="text-xs font-bold text-stone-900">1-Gram Micro Gold</div>
            <div className="text-[11px] text-stone-500">22K Gold Look & Finish</div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-stone-800">
          <div className="p-1.5 rounded-full bg-blue-100 text-blue-700">
            <Droplet className="w-4 h-4" />
          </div>
          <div className="text-left">
            <div className="text-xs font-bold text-stone-900">100% Anti-Tarnish</div>
            <div className="text-[11px] text-stone-500">Waterproof & Sweatproof</div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-stone-800">
          <div className="p-1.5 rounded-full bg-emerald-100 text-emerald-700">
            <Truck className="w-4 h-4" />
          </div>
          <div className="text-left">
            <div className="text-xs font-bold text-stone-900">Sullia Same-Day</div>
            <div className="text-[11px] text-stone-500">Local Rider & Express Courier</div>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-stone-800">
          <div className="p-1.5 rounded-full bg-purple-100 text-purple-700">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="text-left">
            <div className="text-xs font-bold text-stone-900">Discreet Packing</div>
            <div className="text-[11px] text-stone-500">Tamper-Proof Box</div>
          </div>
        </div>
      </div>
    </div>
  );
}
