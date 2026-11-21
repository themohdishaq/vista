// filepath: components/public/home/HeroSection.tsx
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

/**
 * @file components/public/home/HeroSection.tsx
 * @description Hero Section for VISTA Portal.
 * Features:
 * - High-res background warehouse image (/home/Hero Image.png) with dark left gradient
 * - Pre-title badge: "— SMART INVENTORY MANAGEMENT —"
 * - Main title: "Transform Your Inventory with VISTA"
 * - Subtitle: "Real-time inventory management, warehouse control and stock tracking — all in one place."
 * - Vibrant teal CTA button: "Access VISTA →"
 */

export default function HeroSection() {
  return (
    <section className="relative w-full overflow-hidden bg-[#071d2b]">
      {/* Background Hero Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/home/hero-image.png"
          alt="VISTA Smart Warehouse Logistics and Inventory Management"
          fill
          priority
          className="object-cover object-right sm:object-center"
        />
        {/* Dark Navy / Slate Gradient Overlay on Left */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#061d2b] via-[#072437]/90 to-transparent" />
      </div>

      {/* Hero Foreground Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-16 lg:py-20">
        <div className="max-w-2xl space-y-6">

          {/* Pre-title Badge */}
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-bold tracking-widest text-[#00c4b4] uppercase">
              — SMART INVENTORY MANAGEMENT —
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.12]">
            Transform Your <br />
            Field Inventory <span className="text-[#00c4b4]">Management</span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-lg text-slate-200/95 font-normal leading-relaxed max-w-xl">
            Real-time inventory management, warehouse control and stock tracking — all in one place.
          </p>

          {/* CTA Pill Button */}
          <div className="pt-2">
            <Link
              href="/login"
              className="group inline-flex items-center gap-2 rounded-full bg-[#00a896] hover:bg-[#009282] px-7 py-3.5 text-sm sm:text-base font-bold text-white shadow-xl shadow-teal-950/40 transition-all duration-200 hover:scale-[1.02] active:scale-95"
            >
              <span>Access Portal</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}

