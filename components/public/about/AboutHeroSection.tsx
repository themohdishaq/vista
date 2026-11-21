// filepath: components/public/about/AboutHeroSection.tsx
'use client';
import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
export function AboutHeroSection() {
  return (
    <section className="relative w-full overflow-hidden bg-[#071d2b] py-20 sm:py-28 lg:py-32">
      {/* Subtle Background Glow & Radial Accents */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 h-96 w-96 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl space-y-6">
          {/* Pre-title Badge */}
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-bold tracking-widest text-[#00c4b4] uppercase">
              — ABOUT FIELD INVENTORY MANAGEMENT —
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.14]">
            Pioneering Precision in <br />
            <span className="text-[#00c4b4]">Healthcare & Warehouse</span> Logistics
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-lg text-slate-200/95 font-normal leading-relaxed max-w-2xl">
            Field Inventory Management was purpose-built to deliver hospital-grade inventory control, real-time batch traceability, and audit-ready governance across modern supply chains.
          </p>

        </div>

      </div>
    </section>
  );
}

