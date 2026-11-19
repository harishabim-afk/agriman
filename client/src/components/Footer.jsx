import React from 'react';
import { Sprout, ShieldCheck, HeartHandshake, PhoneCall } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-stone-200 mt-auto text-xs text-stone-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="space-y-2 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold">
                <Sprout className="w-5 h-5" />
              </div>
              <span className="text-base font-bold text-stone-900">
                Agro<span className="text-emerald-600">Harvest</span>
              </span>
            </div>
            <p className="text-stone-500 text-xs leading-relaxed">
              Wholesale agricultural exchange connecting certified grain cooperatives directly with mills, food processors, and international exporters.
            </p>
          </div>

          <div>
            <h5 className="font-bold text-stone-900 mb-2">Core Commodities</h5>
            <ul className="space-y-1.5 text-stone-600">
              <li>🌾 Basmati & Non-Basmati Paddy</li>
              <li>🌽 Yellow Field Corn & Hard Flint Maize</li>
              <li>🥜 Bold & Java Groundnuts / Peanuts</li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-stone-900 mb-2">Platform Safeguards</h5>
            <ul className="space-y-1.5 text-stone-600">
              <li className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Verified Cooperative Badging</span>
              </li>
              <li className="flex items-center gap-1.5">
                <HeartHandshake className="w-3.5 h-3.5 text-emerald-600" />
                <span>Escrow Payment Protection</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 text-center font-bold text-blue-600">%</span>
                <span>Moisture Lab Verification</span>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-stone-900 mb-2">Exchange Support</h5>
            <p className="text-stone-600 mb-2">
              Wholesale trading assistance & dispute arbitration desk available 24/7.
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-100 font-semibold text-stone-800">
              <PhoneCall className="w-3.5 h-3.5 text-emerald-600" />
              <span>1-800-AGRO-HARVEST</span>
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-stone-400 text-[11px]">
          <p>© 2026 AgroHarvest Agricultural Technologies Inc. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <span>Trading Standards</span>
            <span>Escrow Agreement</span>
            <span>Grain Grading Bylaws</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
