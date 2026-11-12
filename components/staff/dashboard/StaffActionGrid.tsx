// filepath: components/staff/dashboard/StaffActionGrid.tsx
'use client';

/**
 * @file components/staff/dashboard/StaffActionGrid.tsx
 * @description Quick floor operational launcher covering all 10 core staff responsibilities.
 * 1. View stock in assigned bins
 * 2. Submit stock requests
 * 3. Record received inventory
 * 4. Record stock issues & distributions
 * 5. Record consumption & returns
 * 6. Record damaged/expired stock
 * 7. Perform physical stock counts
 * 8. Prepare packing lists & kits
 * 9. Record local purchases
 * 10. Report shortages & discrepancies
 */

import React from 'react';
import {
  Layers,
  PlusSquare,
  Truck,
  ClipboardCheck,
  RotateCcw,
  AlertTriangle,
  ClipboardList,
  Boxes,
  Receipt,
  ShieldAlert,
  ArrowRight,
} from 'lucide-react';

interface StaffActionGridProps {
  onOpenAction: (actionKey: string) => void;
}

export function StaffActionGrid({ onOpenAction }: StaffActionGridProps) {
  const actions = [
    {
      key: 'stock',
      title: '1. View Assigned Stock',
      desc: 'Check live balances, lots, and min thresholds in Zone A.',
      icon: Layers,
      color: 'bg-teal-50 text-[#008a90] border-teal-200/80',
      actionLabel: 'Inspect Bins',
    },
    {
      key: 'request',
      title: '2. Submit Stock Request',
      desc: 'Request bin replenishment or emergency floor supplies.',
      icon: PlusSquare,
      color: 'bg-sky-50 text-sky-700 border-sky-200/80',
      actionLabel: 'Submit Request',
    },
    {
      key: 'receive',
      title: '3. Record Received Stock',
      desc: 'Log inbound delivery from PO, inspect cartons & assign bins.',
      icon: Truck,
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      actionLabel: 'Scan Inbound',
    },
    {
      key: 'issue',
      title: '4. Issue & Distribute',
      desc: 'Dispense picked items to hospital wards and clinics.',
      icon: ClipboardCheck,
      color: 'bg-blue-50 text-blue-700 border-blue-200/80',
      actionLabel: 'Issue Supplies',
    },
    {
      key: 'returns',
      title: '5. Record Returns & Use',
      desc: 'Log ward returns, excess items, and floor consumption.',
      icon: RotateCcw,
      color: 'bg-indigo-50 text-indigo-700 border-indigo-200/80',
      actionLabel: 'Log Return',
    },
    {
      key: 'damaged',
      title: '6. Log Damaged / Expired',
      desc: 'Record broken, spoiled or expired stock for manager review.',
      icon: AlertTriangle,
      color: 'bg-rose-50 text-rose-700 border-rose-200/80',
      actionLabel: 'Log Incident',
    },
    {
      key: 'count',
      title: '7. Physical Stock Count',
      desc: 'Perform blind cycle count audits and record physical counts.',
      icon: ClipboardList,
      color: 'bg-amber-50 text-amber-800 border-amber-200/80',
      actionLabel: 'Start Audit',
    },
    {
      key: 'kit',
      title: '8. Packing Lists & Kits',
      desc: 'Assemble First Aid & Emergency kits, print packing slips.',
      icon: Boxes,
      color: 'bg-purple-50 text-purple-700 border-purple-200/80',
      actionLabel: 'Pack Kit',
    },
    {
      key: 'purchase',
      title: '9. Record Local Purchase',
      desc: 'Log spot invoice, receipt slip and items for manager approval.',
      icon: Receipt,
      color: 'bg-cyan-50 text-cyan-800 border-cyan-200/80',
      actionLabel: 'Record Bill',
    },
    {
      key: 'shortage',
      title: '10. Report Discrepancy',
      desc: 'Report missing stock, bin mismatches and inventory variances.',
      icon: ShieldAlert,
      color: 'bg-orange-50 text-orange-800 border-orange-200/80',
      actionLabel: 'Report Shortage',
    },
  ];

  return (
    <div className="rounded-2xl bg-white border border-slate-200/90 shadow-xs p-5 sm:p-6">
      <div className="mb-5">
        <h3 className="font-sans text-base font-bold text-[#0a2540]">
          Floor Duties & Action Terminal
        </h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Direct 1-click execution for all 10 core inventory staff responsibilities.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <div
              key={act.key}
              onClick={() => onOpenAction(act.key)}
              className="group cursor-pointer rounded-xl border border-slate-200 bg-white p-3.5 hover:border-[#008a90] hover:shadow-sm transition-all flex flex-col justify-between"
            >
              <div>
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg border ${act.color} group-hover:scale-105 transition-transform`}
                >
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <h4 className="font-sans text-xs font-bold text-slate-900 mt-2.5 group-hover:text-[#008a90] transition-colors">
                  {act.title}
                </h4>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {act.desc}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold text-[#008a90]">
                <span>{act.actionLabel}</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

