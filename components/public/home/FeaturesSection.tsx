// filepath: components/public/home/FeaturesSection.tsx
import React from 'react';
import {
  ClipboardList,
  Warehouse,
  TrendingUp,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';

/**
 * @file components/public/home/FeaturesSection.tsx
 * @description Features Grid Section for VISTA Portal ("WHAT VISTA OFFERS").
 * Renders the 6 core inventory management capability cards in a 3x2 layout:
 * - Real-Time Inventory
 * - Stock In & Out
 * - Warehouse Management
 * - Reports & Analytics
 * - Stock Transfers
 * - Controlled Access
 */

const features = [
  {
    id: 'real-time-inventory',
    title: 'Real-Time Inventory',
    description: 'View stock, quantities, batches and expiry dates.',
    customIcon: (
      /* Isometric Teal 3D Cube Icon matching design */
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
  },
  {
    id: 'stock-in-out',
    title: 'Stock In & Out',
    description: 'Record receiving, issuing and returns with ease.',
    icon: ClipboardList,
  },
  {
    id: 'warehouse-management',
    title: 'Warehouse Management',
    description: 'Organize inventory by location, shelf and kit.',
    icon: Warehouse,
  },
  {
    id: 'reports-analytics',
    title: 'Reports & Analytics',
    description: 'Get insights into stock movement and consumption.',
    icon: TrendingUp,
  },
  {
    id: 'stock-transfers',
    title: 'Stock Transfers',
    description: 'Move inventory between locations securely.',
    icon: RefreshCw,
  },
  {
    id: 'controlled-access',
    title: 'Controlled Access',
    description: 'Three access roles for secure and organized operations.',
    icon: ShieldCheck,
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="w-full bg-[#fcfdfe] py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center space-y-2 mb-12 sm:mb-16">
          <p className="text-xs sm:text-sm font-bold tracking-widest text-[#00a896] uppercase">
            — WHAT WE OFFER —
          </p>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#0a2540]">
            Everything You Need to Manage Stock
          </h2>
        </div>

        {/* 3x2 Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.id}
                className="group flex items-start gap-4 rounded-2xl border border-slate-100 bg-white p-6 sm:p-7 shadow-[0_2px_12px_rgba(0,0,0,0.03)] hover:shadow-lg hover:border-teal-100 transition-all duration-200"
              >
                {/* Rounded Mint/Cyan Icon Container */}
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#e1f7f5] text-[#008a90] group-hover:scale-105 transition-transform duration-200">
                  {feature.customIcon ? (
                    feature.customIcon
                  ) : Icon ? (
                    <Icon className="h-7 w-7 text-[#008a90]" />
                  ) : null}
                </div>

                {/* Card Content */}
                <div className="space-y-1">
                  <h3 className="text-base sm:text-lg font-bold text-[#0a2540]">
                    {feature.title}
                  </h3>
                  <p className="text-xs sm:text-[13px] text-slate-500 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

