// filepath: app/not-found.tsx
'use client';

/**
 * @file app/not-found.tsx
 * @description Clean, minimalist 404 Not Found & Coming Soon screen for VISTA Portal.
 */

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Home } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 sm:px-6">
      <div className="max-w-md w-full text-center space-y-6">
        
        {/* Large 404 Label */}
        <div className="space-y-2">
          <p className="text-6xl sm:text-7xl font-black tracking-tight text-[#008a90]">
            404
          </p>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0a2540]">
            Page Not Found
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            This page is under development or does not exist. Coming soon!
          </p>
        </div>

        {/* Clean Action Buttons */}
        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>

          <Link
            href="/"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#008a90] hover:bg-[#00747a] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>

      </div>
    </div>
  );
}
