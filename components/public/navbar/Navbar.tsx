// filepath: components/public/navbar/Navbar.tsx
'use client';

/**
 * @file components/public/navbar/Navbar.tsx
 * @description Production Navigation Bar for VISTA Portal with direct links and no dropdown menus.
 * Features:
 * - Geometric isometric teal cube logo + bold navy "VISTA" brand
 * - Vertical separator dividers
 * - Center direct links: Home, Features, How It Works, and About
 * - Right action button: "Log In" with deep teal gradient
 * - Mobile responsive drawer menu
 */

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  LayoutGrid,
  FileText,
  Info,
  LogIn,
  Menu,
  X,
} from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const [activeTab, setActiveTab] = useState<'home' | 'features' | 'how-it-works' | 'about'>(
    pathname === '/about' ? 'about' : 'home'
  );
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (pathname === '/about') {
      setActiveTab('about');
    } else if (pathname === '/') {
      setActiveTab('home');
    }
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-[0_1px_3px_0_rgba(0,0,0,0.03)]">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* ================= LEFT: LOGO & BRAND ================= */}
        <div className="flex items-center">
          <Link
            href="/"
            onClick={() => setActiveTab('home')}
            className="group flex items-center gap-3 transition-opacity hover:opacity-95"
            aria-label="Field Inventory Management Home"
          >
            {/* Geometric Isometric Cube Icon */}
            <div className="relative flex h-10 w-10 items-center justify-center transition-transform group-hover:scale-105">
              <svg
                className="h-10 w-10"
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Isometric Cube Outer Contour */}
                <path
                  d="M20 4L35 12.5V27.5L20 36L5 27.5V12.5L20 4Z"
                  stroke="#008a90"
                  strokeWidth="3.2"
                  strokeLinejoin="round"
                />
                {/* Upper Rhombus Y-Axis lines */}
                <path
                  d="M20 20L35 12.5"
                  stroke="#008a90"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                />
                <path
                  d="M20 20L5 12.5"
                  stroke="#008a90"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                />
                <path
                  d="M20 20V36"
                  stroke="#008a90"
                  strokeWidth="3.2"
                  strokeLinecap="round"
                />
                {/* Inner Geometry Cutouts for 3D Box Effect */}
                <path
                  d="M12 16.5L20 21L28 16.5"
                  stroke="#00a896"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
                <path
                  d="M20 21V29"
                  stroke="#00a896"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            {/* Brand Typography */}
            <span className="font-sans text-lg sm:text-xl font-black tracking-tight text-[#0a2540]">
              Field Inventory Management
            </span>
          </Link>

          {/* Left Vertical Divider */}
          <div
            className="mx-6 hidden h-7 w-[1.5px] bg-slate-200 lg:block"
            aria-hidden="true"
          />
        </div>

        {/* ================= CENTER: NAVIGATION LINKS ================= */}
        <nav
          className="hidden items-center space-x-1 lg:flex"
          aria-label="Main Navigation"
        >
          {/* 1. HOME LINK */}
          <div className="relative">
            <Link
              href="/"
              onClick={() => setActiveTab('home')}
              className={`flex items-center gap-2 px-3.5 py-2 text-[15px] font-semibold transition-colors ${
                activeTab === 'home'
                  ? 'text-[#008a90]'
                  : 'text-slate-600 hover:text-[#008a90]'
              }`}
            >
              <Home
                className={`h-4 w-4 ${
                  activeTab === 'home' ? 'text-[#008a90] fill-[#008a90]' : 'text-slate-500'
                }`}
              />
              <span>Home</span>
            </Link>

            {/* Active Indicator Underline */}
            {activeTab === 'home' && (
              <span
                className="absolute -bottom-[21px] left-3.5 right-3.5 h-[3px] rounded-full bg-[#008a90]"
                aria-hidden="true"
              />
            )}
          </div>

          {/* 2. FEATURES LINK (Direct Link, No Dropdown) */}
          <Link
            href="/#features"
            onClick={() => setActiveTab('features')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-[15px] font-medium transition-colors ${
              activeTab === 'features'
                ? 'text-[#0a2540] font-semibold'
                : 'text-slate-600 hover:text-[#008a90]'
            }`}
          >
            <LayoutGrid className="h-4 w-4 text-slate-500" />
            <span>Features</span>
          </Link>

          {/* 3. HOW IT WORKS LINK (Direct Link, No Dropdown) */}
          <Link
            href="/#how-it-works"
            onClick={() => setActiveTab('how-it-works')}
            className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-[15px] font-medium transition-colors ${
              activeTab === 'how-it-works'
                ? 'text-[#0a2540] font-semibold'
                : 'text-slate-600 hover:text-[#008a90]'
            }`}
          >
            <FileText className="h-4 w-4 text-slate-500" />
            <span>How It Works</span>
          </Link>

          {/* 4. ABOUT LINK */}
          <div className="relative">
            <Link
              href="/about"
              onClick={() => setActiveTab('about')}
              className={`flex items-center gap-2 px-3.5 py-2 text-[15px] font-semibold transition-colors ${
                activeTab === 'about'
                  ? 'text-[#008a90]'
                  : 'text-slate-600 hover:text-[#008a90]'
              }`}
            >
              <Info
                className={`h-4 w-4 ${
                  activeTab === 'about' ? 'text-[#008a90]' : 'text-slate-500'
                }`}
              />
              <span>About</span>
            </Link>

            {/* Active Indicator Underline */}
            {activeTab === 'about' && (
              <span
                className="absolute -bottom-[21px] left-3.5 right-3.5 h-[3px] rounded-full bg-[#008a90]"
                aria-hidden="true"
              />
            )}
          </div>
        </nav>

        {/* ================= RIGHT: DIVIDER & LOG IN BUTTON ================= */}
        <div className="hidden items-center lg:flex">
          {/* Right Vertical Divider */}
          <div
            className="mr-6 h-7 w-[1.5px] bg-slate-200"
            aria-hidden="true"
          />

          {/* Log In Button */}
          <Link
            href="/login"
            className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#014f55] to-[#046168] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:from-[#013d42] hover:to-[#035157] hover:shadow-md active:scale-95 cursor-pointer"
          >
            <span>Log In</span>
            <LogIn className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>

        {/* ================= MOBILE HAMBURGER BUTTON ================= */}
        <div className="flex items-center gap-3 lg:hidden">
          <Link
            href="/login"
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#014f55] px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm"
          >
            <span>Log In</span>
            <LogIn className="h-3.5 w-3.5" />
          </Link>

          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 focus:outline-none cursor-pointer"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6 text-slate-700" />
            ) : (
              <Menu className="h-6 w-6 text-slate-700" />
            )}
          </button>
        </div>
      </div>

      {/* ================= MOBILE COLLAPSIBLE MENU ================= */}
      {mobileMenuOpen && (
        <div className="border-t border-slate-200/80 bg-white px-4 pt-3 pb-6 shadow-xl lg:hidden">
          <div className="space-y-1">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                pathname === '/'
                  ? 'text-[#008a90] bg-teal-50/60'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Home className="h-4 w-4 text-[#008a90]" />
              <span>Home</span>
            </Link>

            <Link
              href="/#features"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <LayoutGrid className="h-4 w-4 text-slate-500" />
              <span>Features</span>
            </Link>

            <Link
              href="/#how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <FileText className="h-4 w-4 text-slate-500" />
              <span>How It Works</span>
            </Link>

            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors ${
                pathname === '/about'
                  ? 'text-[#008a90] bg-teal-50/60'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Info className="h-4 w-4 text-slate-500" />
              <span>About</span>
            </Link>

            <div className="pt-3 border-t border-slate-100">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#014f55] to-[#046168] py-2.5 text-sm font-semibold text-white shadow-sm"
              >
                <span>Log In</span>
                <LogIn className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
