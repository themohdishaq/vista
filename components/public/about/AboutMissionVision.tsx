// filepath: components/public/about/AboutMissionVision.tsx
import React from 'react';
import { HeartPulse, Globe2, CheckCircle2 } from 'lucide-react';

export function AboutMissionVision() {
  return (
    <section className="w-full bg-[#f8fbfb] py-20 sm:py-24 border-b border-slate-200/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs sm:text-sm font-bold tracking-widest text-[#008a90] uppercase">
            — OUR FOUNDATION —
          </span>
          <h2 className="mt-2 text-2xl sm:text-4xl font-black tracking-tight text-[#0a2540]">
            Built with Purpose, Engineered for Trust
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600">
            Every feature in Field Inventory Management was developed to ensure that medical facilities, clinics, and warehouses never experience critical supply interruptions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Mission Card */}
          <div className="rounded-3xl bg-white border border-slate-200/90 p-8 sm:p-10 shadow-xs hover:shadow-md transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 h-32 w-32 bg-teal-50 rounded-bl-full pointer-events-none" />
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-[#008a90] border border-teal-200/80 mb-6">
              <HeartPulse className="h-6 w-6" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-[#0a2540]">
              Our Mission
            </h3>
            <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
              To eradicate stockouts and pharmaceutical expiration across healthcare supply chains. We empower teams with automated visibility so that every lifesaving medication, surgical instrument, and sterile supply reaches patient care areas safely, accurately, and on time.
            </p>
            <div className="mt-6 flex items-center gap-2 text-xs font-bold text-[#008a90]">
              <CheckCircle2 className="w-4 h-4" />
              <span>Zero preventable supply delays</span>
            </div>
          </div>

          {/* Vision Card */}
          <div className="rounded-3xl bg-white border border-slate-200/90 p-8 sm:p-10 shadow-xs hover:shadow-md transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 h-32 w-32 bg-sky-50 rounded-bl-full pointer-events-none" />
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-sky-600 border border-sky-200/80 mb-6">
              <Globe2 className="h-6 w-6" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-[#0a2540]">
              Our Vision
            </h3>
            <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
              To be the global benchmark for secure, smart, and verified inventory orchestration. Combining IoT cold-chain telemetry, barcode-level cycle audits, and predictive demand modeling to create self-healing, highly resilient supply networks.
            </p>
            <div className="mt-6 flex items-center gap-2 text-xs font-bold text-sky-700">
              <CheckCircle2 className="w-4 h-4 text-sky-600" />
              <span>End-to-end autonomous supply network</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

