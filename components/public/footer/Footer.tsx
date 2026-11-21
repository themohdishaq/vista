// filepath: components/public/footer/Footer.tsx
import React from 'react';

/**
 * @file components/public/footer/Footer.tsx
 * @description Global Public Footer for VISTA Portal.
 * Matches the design:
 * - Left: Teal isometric cube logo + "VISTA" brand text + vertical divider + copyright notice
 * - Right: Glowing teal status bullet + "Simple. Organized. Reliable." tagline
 */

export default function Footer() {
  return (
    <footer className="w-full bg-[#071927] text-slate-300 py-6 border-t border-slate-800">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          
          {/* Left: Logo, Divider & Copyright */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-4 text-xs sm:text-sm">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center">
                <svg
                  className="h-7 w-7"
                  viewBox="0 0 40 40"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M20 4L35 12.5V27.5L20 36L5 27.5V12.5L20 4Z"
                    stroke="#00c4b4"
                    strokeWidth="3.2"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M20 20L35 12.5"
                    stroke="#00c4b4"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M20 20L5 12.5"
                    stroke="#00c4b4"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M20 20V36"
                    stroke="#00c4b4"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <span className="font-sans text-lg font-black tracking-tight text-white">
                Field Inventory Management
              </span>
            </div>

            {/* Vertical Divider */}
            <div className="hidden sm:block h-5 w-[1.5px] bg-slate-700" aria-hidden="true" />

            {/* Copyright */}
            <p className="text-slate-400 text-xs sm:text-[13px]">
              © 2025 Field Inventory Management System. All rights reserved.
            </p>
          </div>

          {/* Right: Tagline with Status Dot */}
          <div className="flex items-center gap-2 text-xs sm:text-[13px] text-slate-300 font-medium">
            <span className="h-2 w-2 rounded-full bg-[#00c4b4] inline-block shadow-[0_0_8px_#00c4b4]" />
            <span>Simple. Organized. Reliable.</span>
          </div>

        </div>
      </div>
    </footer>
  );
}

