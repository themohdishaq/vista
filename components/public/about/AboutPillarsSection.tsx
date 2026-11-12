// filepath: components/public/about/AboutPillarsSection.tsx
import React from 'react';
import { Snowflake, ShieldCheck, Boxes } from 'lucide-react';

const PILLARS = [
  {
    title: 'Batch & Lot Expiry Integrity',
    description:
      'Granular tracking down to individual storage bins. Automated 30, 60, and 90-day expiry alarms prevent stock expiration and guarantee patient safety.',
    icon: (
      <svg
        className="h-7 w-7 text-[#008a90]"
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M16 3L28 9.5V22.5L16 29L4 22.5V9.5L16 3Z"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
        <path
          d="M16 16L28 9.5"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M16 16L4 9.5"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M16 16V29"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
      </svg>
    ),
    tag: 'Traceability',
  },
  {
    title: 'Cold-Chain & Telemetry Guard',
    description:
      'Continuous temperature and humidity tracking for biologics, vaccines, and sensitive reagents with automated quarantine if thresholds are breached.',
    icon: <Snowflake className="h-7 w-7 text-[#008a90]" />,
    tag: 'Cold Storage',
  },
  {
    title: 'Strict Role-Based Governance',
    description:
      'Segregation of duties between Floor Specialists, Inventory Managers, and Administrators ensures zero unilateral write-offs and complete audit compliance.',
    icon: <ShieldCheck className="h-7 w-7 text-[#008a90]" />,
    tag: 'Security & RBAC',
  },
  {
    title: 'Dynamic Bill-of-Materials Kitting',
    description:
      'Assemble complex medical response kits, trauma bags, and surgical packs with multi-item checklists, tamper-evident seals, and instant packing slips.',
    icon: <Boxes className="h-7 w-7 text-[#008a90]" />,
    tag: 'Kitting & Packing',
  },
];

export function AboutPillarsSection() {
  return (
    <section className="w-full bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs sm:text-sm font-bold tracking-widest text-[#008a90] uppercase">
            — CORE CAPABILITIES —
          </span>
          <h2 className="mt-2 text-2xl sm:text-4xl font-black tracking-tight text-[#0a2540]">
            The Four Pillars of VISTA Architecture
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600">
            Designed from the ground up for high reliability in high-stakes warehousing environments.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {PILLARS.map((pillar) => (
            <div
              key={pillar.title}
              className="group rounded-3xl border border-slate-200/80 bg-white p-7 sm:p-8 shadow-xs hover:border-[#008a90]/40 hover:shadow-lg transition-all"
            >
              <div className="flex items-center justify-between mb-5">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 border border-teal-200/60 group-hover:scale-105 transition-transform">
                  {pillar.icon}
                </div>
                <span className="rounded-full bg-teal-50 px-3 py-1 text-[11px] font-bold text-[#008a90] border border-teal-200/80">
                  {pillar.tag}
                </span>
              </div>
              <h3 className="font-sans text-lg sm:text-xl font-bold text-[#0a2540] group-hover:text-[#008a90] transition-colors">
                {pillar.title}
              </h3>
              <p className="mt-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
                {pillar.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

