// filepath: app/login/page.tsx
'use client';

/**
 * @file app/login/page.tsx
 * @description Universal Enterprise Authentication & Role Gateway for VISTA Portal.
 * Features:
 * - Direct 1-Click Role Switchers for testing/demo (Administrator, Manager, Staff)
 * - Email & Password authentication with state management and loading feedback
 * - Microsoft Entra ID / Corporate SSO integration simulation
 * - 256-bit TLS encrypted security badge and support link
 */

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
  Users,
  Shield,
  Layers,
  Sparkles,
} from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('admin@vista.org');
  const [password, setPassword] = useState('••••••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingRole, setLoadingRole] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleRoleQuickLogin = (role: 'admin' | 'manager' | 'staff') => {
    setError(null);
    setLoadingRole(role);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
      setTimeout(() => {
        if (role === 'manager') router.push('/manager');
        else if (role === 'staff') router.push('/staff');
        else router.push('/admin');
      }, 500);
    }, 600);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email) {
      setError('Please provide your work email address.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
      setTimeout(() => {
        const lower = email.toLowerCase();
        if (lower.includes('staff') || lower.includes('chen')) {
          router.push('/staff');
        } else if (lower.includes('manager') || lower.includes('jane')) {
          router.push('/manager');
        } else {
          router.push('/admin');
        }
      }, 600);
    }, 800);
  };

  return (
    <div className="flex min-h-[calc(100vh-80px)] w-full items-center justify-center bg-gradient-to-b from-[#f8fbfb] via-white to-[#f0f7f7] px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-lg space-y-8">
        
        {/* Top Brand Header */}
        <div className="text-center space-y-2">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 transition-transform hover:scale-105"
            aria-label="VISTA Home"
          >
            {/* Isometric 3D Teal Cube Logo */}
            <div className="flex h-11 w-11 items-center justify-center">
              <svg
                className="h-11 w-11"
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
            <span className="font-sans text-3xl font-black tracking-tight text-[#0a2540]">
              VISTA
            </span>
          </Link>

          <h1 className="text-2xl font-extrabold tracking-tight text-[#0a2540]">
            Sign in to your portal
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time warehouse control, clinical supply tracking & operations
          </p>
        </div>

        {/* Demo Role Switcher Bar */}
        <div className="rounded-2xl border border-teal-200/80 bg-teal-50/50 p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#008a90] flex items-center gap-1.5 uppercase tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              Quick Demo Access by Role
            </span>
            <span className="text-[10px] text-slate-500 font-medium">1-Click Sign In</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleRoleQuickLogin('admin')}
              className="flex flex-col items-center p-2 rounded-xl bg-white border border-slate-200 hover:border-purple-300 hover:bg-purple-50/40 text-center transition-all cursor-pointer shadow-2xs group"
            >
              <Shield className="w-4 h-4 text-purple-600 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-slate-800">Admin</span>
              <span className="text-[10px] text-slate-400">Full Control</span>
            </button>

            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleRoleQuickLogin('manager')}
              className="flex flex-col items-center p-2 rounded-xl bg-white border border-slate-200 hover:border-teal-400 hover:bg-teal-50/40 text-center transition-all cursor-pointer shadow-2xs group"
            >
              <Users className="w-4 h-4 text-[#008a90] mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-slate-800">Manager</span>
              <span className="text-[10px] text-slate-400">Approvals</span>
            </button>

            <button
              type="button"
              disabled={isLoading}
              onClick={() => handleRoleQuickLogin('staff')}
              className="flex flex-col items-center p-2 rounded-xl bg-white border border-slate-200 hover:border-sky-300 hover:bg-sky-50/40 text-center transition-all cursor-pointer shadow-2xs group"
            >
              <Layers className="w-4 h-4 text-sky-600 mb-1 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-slate-800">Staff</span>
              <span className="text-[10px] text-slate-400">Floor Specialist</span>
            </button>
          </div>
        </div>

        {/* Main Card Container */}
        <div className="rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-8 shadow-xl shadow-slate-200/50">
          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="block text-xs font-semibold text-slate-700"
              >
                Work Email Address
              </label>
              <div className="relative rounded-xl shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                  <Mail className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@vista.org"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2.5 pl-10 pr-3 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#008a90] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#008a90]/20 transition-all"
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
                    alert('Password reset link has been dispatched to your corporate email.');
                  }}
                  className="text-[11px] font-semibold text-[#008a90] hover:underline"
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
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/60 py-2.5 pl-10 pr-10 text-xs text-slate-900 focus:border-[#008a90] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#008a90]/20 transition-all font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Device Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-[#008a90] focus:ring-[#008a90]"
                />
                <span className="text-xs text-slate-600 font-medium">
                  Remember this workstation for 30 days
                </span>
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            {/* Success Message */}
            {isSuccess && (
              <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <div>
                  <span className="font-bold">Authentication successful!</span>
                  <div className="text-[11px] text-emerald-700">
                    Routing to your VISTA Dashboard...
                  </div>
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
                    <span>Sign In to VISTA</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Social / SSO Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-3 text-slate-400 font-medium">
                Or continue with Single Sign-On
              </span>
            </div>
          </div>

          {/* Organization SSO Button */}
          <button
            type="button"
            onClick={() => handleRoleQuickLogin('admin')}
            className="flex w-full items-center justify-center gap-2.5 rounded-xl border border-slate-200 bg-white py-2.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <Building2 className="h-4 w-4 text-slate-500" />
            <span>Microsoft Entra ID / Healthcare SSO</span>
          </button>
        </div>

        {/* Security & Support Footer */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-600">
            <ShieldCheck className="h-3.5 w-3.5 text-[#008a90]" />
            <span>256-bit TLS Encrypted Session • HIPAA / WHO GDP Certified</span>
          </div>

          <p className="text-xs text-slate-500">
            Need an operational role assignment?{' '}
            <Link
              href="/about"
              className="font-semibold text-[#008a90] hover:underline"
            >
              Learn about VISTA Workspaces
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
