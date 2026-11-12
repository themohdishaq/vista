// filepath: components/public/about/AboutCtaSection.tsx
import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

export function AboutCtaSection() {
  return (
    <section className="w-full bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#023742] via-[#025460] to-[#016f7c] px-6 py-10 sm:px-12 sm:py-14 shadow-xl">
          {/* Polygonal Background Overlay */}
          <div className="absolute inset-0 pointer-events-none opacity-20">
            <svg
              className="w-full h-full object-cover"
              viewBox="0 0 1200 240"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <polygon points="0,0 300,120 150,240 0,240" fill="#ffffff" opacity="0.1" />
              <polygon points="300,120 600,0 750,240 450,240" fill="#ffffff" opacity="0.15" />
              <polygon points="600,0 900,120 1050,0 1200,120" fill="#ffffff" opacity="0.2" />
              <polygon points="900,120 1200,240 750,240" fill="#ffffff" opacity="0.1" />
            </svg>
          </div>

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
            <div className="space-y-1.5 max-w-xl">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
                Experience VISTA Today
              </h2>
              <p className="text-xs sm:text-base text-cyan-100/90 font-normal">
                Access the inventory management portal designed for operational excellence.
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-3">
              <Link
                href="/login"
                className="group inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm sm:text-base font-bold text-[#014f55] shadow-lg transition-all duration-200 hover:bg-slate-100 hover:scale-[1.02] active:scale-95"
              >
                <span>Log In to VISTA</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

