// filepath: components/public/about/AboutComplianceBanner.tsx
import React from 'react';

const COMPLIANCE_ITEMS = [
  'WHO GDP Compliant',
  'ISO 9001 / 13485',
  'HIPAA Data Governance',
  '256-Bit TLS Encryption',
];

export function AboutComplianceBanner() {
  return (
    <section className="w-full bg-slate-900 py-14 text-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <span className="text-xs font-bold text-teal-400 tracking-wider uppercase">
              Enterprise Standards & Certifications
            </span>
            <h3 className="text-xl font-bold text-white">
              Validated for Regulatory & Healthcare Compliance
            </h3>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {COMPLIANCE_ITEMS.map((item) => (
              <span
                key={item}
                className="px-3.5 py-1.5 rounded-xl bg-white/10 border border-white/10 text-xs font-semibold text-slate-200"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

