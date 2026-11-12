// filepath: components/public/about/AboutRolesSection.tsx
import React from 'react';
import Link from 'next/link';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

const ROLES = [
  {
    role: 'Warehouse Staff',
    title: 'Floor Specialists',
    badgeColor: 'bg-sky-50 text-sky-700 border-sky-200',
    description:
      'Execute daily floor duties: receiving deliveries from docks, physical cycle counts, checklist picking, kit packing, and logging damages for review.',
    features: ['Zone & Bin stock lookup', 'Active pick workstation', 'Blind cycle audits', 'Discrepancy tickets'],
    link: '/staff',
  },
  {
    role: 'Inventory Manager',
    title: 'Operations Supervisors',
    badgeColor: 'bg-teal-50 text-[#008a90] border-teal-200',
    description:
      'Review and approve replenishment requests, authorize transfers, monitor expiring lots, supervise shift output, and resolve inventory variances.',
    features: ['One-click approval queues', 'Batch expiry monitor', 'Inter-warehouse transfers', 'Staff performance metrics'],
    link: '/manager',
  },
  {
    role: 'System Administrator',
    title: 'Executive Controllers',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    description:
      'Oversee enterprise-wide inventory performance, manage user roles & permissions, inspect audit logs, and analyze cross-facility turnover.',
    features: ['Multi-depot analytics', 'Role & user management', 'System audit trail', 'Financial reports'],
    link: '/admin',
  },
];

export function AboutRolesSection() {
  return (
    <section className="w-full bg-[#f8fbfb] py-20 sm:py-24 border-y border-slate-200/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs sm:text-sm font-bold tracking-widest text-[#008a90] uppercase">
            — ROLE-BASED WORKSPACES —
          </span>
          <h2 className="mt-2 text-2xl sm:text-4xl font-black tracking-tight text-[#0a2540]">
            Unified Collaboration Across Three Core Roles
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600">
            Every team member gets a tailored, distraction-free workstation with the exact tools and permissions they need.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {ROLES.map((item) => (
            <div
              key={item.role}
              className="rounded-3xl bg-white border border-slate-200/90 p-7 sm:p-8 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-[#008a90]">
                    {item.role}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${item.badgeColor}`}>
                    {item.title}
                  </span>
                </div>

                <h3 className="font-sans text-xl font-bold text-[#0a2540] mt-3">
                  {item.role}
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {item.description}
                </p>

                <div className="mt-6 pt-5 border-t border-slate-100 space-y-2.5">
                  {item.features.map((feat) => (
                    <div key={feat} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#008a90] shrink-0" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-4">
                <Link
                  href="/login"
                  className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors"
                >
                  <span>Log In to {item.role}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

