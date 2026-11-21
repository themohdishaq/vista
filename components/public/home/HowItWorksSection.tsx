// filepath: components/public/home/HowItWorksSection.tsx
import React from 'react';
import Link from 'next/link';
import { Truck, Package, TrendingUp, ArrowRight } from 'lucide-react';

/**
 * @file components/public/home/HowItWorksSection.tsx
 * @description How VISTA Works Process Flow Section.
 * Features:
 * - Soft cyan pastel background (#eaf5f7)
 * - Left column with headline: "A Simple Process for Better Control" & "Learn More →" CTA
 * - Right column with 3 sequential process cards (01 Receive, 02 Manage, 03 Track) connected with arrows
 */

export default function HowItWorksSection() {
  return (
    <section id="how-it-works" className="w-full bg-[#eaf5f7] py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
          
          {/* ================= LEFT COLUMN: HEADLINE & COPY ================= */}
          <div className="lg:col-span-5 space-y-5">
            <p className="text-xs sm:text-sm font-bold tracking-widest text-[#00a896] uppercase">
              — HOW IT WORKS —
            </p>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#0a2540] leading-tight">
              A Simple Process <br />
              for Better Control
            </h2>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-md">
              From receiving to deployment, every transaction is tracked and recorded.
            </p>

            <div className="pt-2">
              <Link
                href="/about"
                className="group inline-flex items-center gap-2 rounded-xl bg-[#09293e] hover:bg-[#061e2d] px-6 py-3.5 text-sm font-semibold text-white shadow-md transition-all duration-200 active:scale-95"
              >
                <span>Learn More</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: 3 PROCESS CARDS ================= */}
          <div className="lg:col-span-7 flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-3">
            
            {/* Step 1: Receive */}
            <div className="relative flex flex-col items-center justify-center rounded-2xl bg-white p-6 shadow-sm border border-slate-100/80 w-full md:w-1/3 min-h-[190px] text-center">
              {/* Number Badge */}
              <div className="absolute -top-3.5 flex h-7 w-7 items-center justify-center rounded-full bg-[#005f69] font-mono text-xs font-bold text-white shadow-sm">
                01
              </div>

              {/* Icon */}
              <div className="mt-2 text-[#008a90]">
                <Truck className="h-8 w-8" />
              </div>

              {/* Title */}
              <h3 className="mt-3 text-base font-bold text-[#0a2540]">
                Receive
              </h3>

              {/* Description */}
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Record incoming supplies with batch and expiry details.
              </p>
            </div>

            {/* Connecting Arrow 1 */}
            <div className="hidden md:flex items-center justify-center text-[#008a90] shrink-0">
              <ArrowRight className="h-5 w-5" />
            </div>

            {/* Step 2: Manage */}
            <div className="relative flex flex-col items-center justify-center rounded-2xl bg-white p-6 shadow-sm border border-slate-100/80 w-full md:w-1/3 min-h-[190px] text-center">
              {/* Number Badge */}
              <div className="absolute -top-3.5 flex h-7 w-7 items-center justify-center rounded-full bg-[#005f69] font-mono text-xs font-bold text-white shadow-sm">
                02
              </div>

              {/* Icon */}
              <div className="mt-2 text-[#008a90]">
                <Package className="h-8 w-8" />
              </div>

              {/* Title */}
              <h3 className="mt-3 text-base font-bold text-[#0a2540]">
                Manage
              </h3>

              {/* Description */}
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Track stock, requests and movements.
              </p>
            </div>

            {/* Connecting Arrow 2 */}
            <div className="hidden md:flex items-center justify-center text-[#008a90] shrink-0">
              <ArrowRight className="h-5 w-5" />
            </div>

            {/* Step 3: Track */}
            <div className="relative flex flex-col items-center justify-center rounded-2xl bg-white p-6 shadow-sm border border-slate-100/80 w-full md:w-1/3 min-h-[190px] text-center">
              {/* Number Badge */}
              <div className="absolute -top-3.5 flex h-7 w-7 items-center justify-center rounded-full bg-[#005f69] font-mono text-xs font-bold text-white shadow-sm">
                03
              </div>

              {/* Icon */}
              <div className="mt-2 text-[#008a90]">
                <TrendingUp className="h-8 w-8" />
              </div>

              {/* Title */}
              <h3 className="mt-3 text-base font-bold text-[#0a2540]">
                Track
              </h3>

              {/* Description */}
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Review reports and monitor stock levels.
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

