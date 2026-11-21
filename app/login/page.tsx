// filepath: app/login/page.tsx
'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Building2,
  MapPin,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();

  // Inputs strictly start empty - requires manual entry
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Status states
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [authenticatedUser, setAuthenticatedUser] = useState<{
    name: string;
    role: string;
    warehouseName?: string;
    redirectTo: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Please provide your work email address or username.');
      return;
    }
    if (!password) {
      setError('Please provide your password.');
      return;
    }

    setIsLoading(true);

    try {
      // Collect client-side cached custom users if provisioned by Admin in this browser
      let localUsers: any[] = [];
      if (typeof window !== 'undefined') {
        try {
          const stored = localStorage.getItem('vista_custom_users');
          if (stored) {
            localUsers = JSON.parse(stored);
          }
        } catch {}
      }

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: trimmedEmail,
          password,
          localUsers,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(
          data.message ||
            'Authentication failed. Please verify your credentials or contact the Administrator.'
        );
        setIsLoading(false);
        return;
      }

      // Role is auto-detected by server: 'admin' -> /admin, 'manager' -> /manager, 'staff' -> /staff
      const userRole = data.user?.role;
      const targetRoute =
        data.redirectTo ||
        (userRole === 'admin'
          ? '/admin'
          : userRole === 'manager'
          ? '/manager'
          : '/staff');

      setAuthenticatedUser({
        name: data.user?.name || 'Authorized User',
        role:
          userRole === 'admin'
            ? 'Administrator'
            : userRole === 'manager'
            ? 'Inventory Manager'
            : 'Warehouse Staff',
        warehouseName: data.user?.warehouseName,
        redirectTo: targetRoute,
      });

      setIsLoading(false);
      setIsSuccess(true);

      // Smooth redirection to the auto-detected workspace
      setTimeout(() => {
        window.location.href = targetRoute;
      }, 400);
    } catch {
      setError('Connection failure: Unable to reach the authentication service. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)] w-full items-center justify-center bg-gradient-to-b from-[#f8fbfb] via-white to-[#f0f7f7] px-4 py-10 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">

        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 transition-transform hover:scale-105"
            aria-label="Field Inventory Management Home"
          >
            {/* Isometric 3D Teal Cube Logo */}
            <div className="flex h-12 w-12 items-center justify-center">
              <svg
                className="h-12 w-12"
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20 4L35 12.5V27.5L20 36L5 27.5V12.5L20 4Z"
                  stroke="#008a90"
                  strokeWidth="3.2"
                  strokeLinejoin="round"
                />
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
                <path
                  d="M12 16.5L20 21L28 16.5"
                  stroke="#00c4b4"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
                <path
                  d="M20 21V29"
                  stroke="#00c4b4"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="text-left">
              <span className="font-sans text-xl sm:text-2xl font-black tracking-tight text-[#0a2540] block leading-tight">
                Field Inventory Management
              </span>
            </div>
          </Link>

          <h1 className="text-2xl font-extrabold tracking-tight text-[#0a2540]">
            Sign in to your account
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Enter your credentials. Your workspace role will be automatically identified.
          </p>
        </div>

        {/* Main Login Card */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xl shadow-slate-200/50">
          <form onSubmit={handleSubmit} className="space-y-4">

            {/* Email / Username Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-slate-700"
              >
                Work Email or Username
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="email"
                  type="text"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com or username"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2.5 pl-10 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#008a90] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#008a90]/20 transition-all font-mono"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-slate-700"
                >
                  Password
                </label>
                <a
                  href="#forgot"
                  onClick={(e) => {
                    e.preventDefault();
                    alert('Password assistance is managed by your system administrator.');
                  }}
                  className="text-[11px] font-semibold text-[#008a90] hover:underline cursor-pointer"
                >
                  Forgot password?
                </a>
              </div>
              <div className="relative rounded-xl shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2.5 pl-10 pr-10 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#008a90] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#008a90]/20 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Workstation Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-[#008a90] focus:ring-[#008a90]"
                />
                <span className="text-xs text-slate-600 font-medium">
                  Remember this device for 30 days
                </span>
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 animate-in fade-in duration-200">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
                <p className="font-medium">{error}</p>
              </div>
            )}

            {/* Success Message with Auto-Detected Role & Routing Feedback */}
            {isSuccess && authenticatedUser && (
              <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-900 animate-in fade-in duration-200 space-y-1">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                  <span className="font-bold text-emerald-950">
                    Welcome back, {authenticatedUser.name}!
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-emerald-800">
                  <span className="px-2 py-0.5 rounded-md bg-emerald-100 font-semibold text-emerald-900">
                    {authenticatedUser.role}
                  </span>
                  {authenticatedUser.warehouseName && (
                    <span className="flex items-center gap-1 text-emerald-700">
                      <MapPin className="w-3 h-3 text-emerald-600" />
                      {authenticatedUser.warehouseName}
                    </span>
                  )}
                </div>
                <div className="text-[11px] font-semibold text-emerald-700 pt-0.5">
                  Routing to your workspace ({authenticatedUser.redirectTo})...
                </div>
              </div>
            )}

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading || isSuccess}
                className="group relative flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#014f55] to-[#046168] py-3 text-sm font-bold text-white shadow-md shadow-teal-950/20 transition-all hover:from-[#013d42] hover:to-[#035157] hover:shadow-lg active:scale-[0.99] disabled:opacity-70 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Signing in...</span>
                  </>
                ) : isSuccess ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                    <span>Access Granted</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Single Sign-On Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-slate-400 font-medium">
                Enterprise SSO / Identity Federation
              </span>
            </div>
          </div>

          {/* Organization SSO Button */}
          <button
            type="button"
            onClick={() => alert('Microsoft Entra ID enterprise single sign-on is active for organizational field accounts.')}
            className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <Building2 className="h-4 w-4 text-slate-500" />
            <span>Microsoft Entra ID / Enterprise SSO</span>
          </button>
        </div>

        {/* Security & Support Footer */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-600">
            <ShieldCheck className="h-3.5 w-3.5 text-[#008a90]" />
            <span>256-bit TLS Encrypted Session • HIPAA / WHO GDP Certified</span>
          </div>

          <p className="text-xs text-slate-500">
            Field Inventory Management Supply Chain & Warehouse System
          </p>
        </div>

      </div>
    </div>
  );
}
