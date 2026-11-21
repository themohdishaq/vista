// filepath: components/public/about/AboutMilestonesSection.tsx
import React from 'react';

const MILESTONES = [
  {
    year: '2022',
    title: 'The Inception of Field Inventory Management',
    desc: 'Engineered in response to healthcare supply bottlenecks to create an error-free, real-time inventory tracking system.',
  },
  {
    year: '2023',
    title: 'Cold-Chain & WHO Standards',
    desc: 'Integrated real-time IoT logger telemetry and WHO Good Distribution Practice (GDP) prequalification verification.',
  },
  {
    year: '2024',
    title: 'Enterprise Multi-Depot Expansion',
    desc: 'Scaled to 35 regional healthcare facilities, clinical warehouses, and disaster response rapid-deployment staging bays.',
  },
  {
    year: '2025+',
    title: 'Autonomous Replenishment & Intelligence',
    desc: 'Advanced predictive stock forecasting, automated ward reordering, and unified operational role dashboards.',
  },
];

export function AboutMilestonesSection() {
  return (
    <section className="w-full bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs sm:text-sm font-bold tracking-widest text-[#008a90] uppercase">
            — OUR JOURNEY —
          </span>
          <h2 className="mt-2 text-2xl sm:text-4xl font-black tracking-tight text-[#0a2540]">
            Milestones in Healthcare Logistics
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600">
            From our first clinical pilot to multi-depot automated distribution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {MILESTONES.map((m, idx) => (
            <div
              key={m.year}
              className="relative rounded-2xl bg-slate-50/70 border border-slate-200/80 p-6 flex flex-col justify-between hover:border-[#008a90]/40 transition-colors"
            >
              <div>
                <div className="font-mono text-2xl font-black text-[#008a90]">
                  {m.year}
                </div>
                <h4 className="font-sans text-base font-bold text-slate-900 mt-2">
                  {m.title}
                </h4>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {m.desc}
                </p>
              </div>
              <div className="mt-6 flex items-center gap-1.5 text-[11px] font-bold text-[#008a90]">
                <span>Phase 0{idx + 1}</span>
                <span>•</span>
                <span>Completed</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

