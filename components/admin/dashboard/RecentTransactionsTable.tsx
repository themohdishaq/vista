// filepath: components/admin/dashboard/RecentTransactionsTable.tsx
import React from 'react';
import Link from 'next/link';
import { Clock, ArrowRight } from 'lucide-react';
import { TransactionItem, TransactionType } from '@/types/admin';

/**
 * @file components/admin/dashboard/RecentTransactionsTable.tsx
 * @description Recent Transactions Table component for VISTA Admin Dashboard.
 * Displays transactional audit entries with color-coded classification pills
 * (Receipt, Issue, Transfer, Adjustment), signed quantities, and user attribution.
 */

interface RecentTransactionsTableProps {
  transactions: TransactionItem[];
}

export function RecentTransactionsTable({ transactions }: RecentTransactionsTableProps) {
  const getTypeBadge = (type: TransactionType) => {
    switch (type) {
      case 'Receipt':
        return 'bg-[#dcfce7] text-[#15803d] border-emerald-200';
      case 'Issue':
        return 'bg-[#e0f2fe] text-[#0369a1] border-sky-200';
      case 'Transfer':
        return 'bg-[#f3e8ff] text-[#7e22ce] border-purple-200';
      case 'Adjustment':
        return 'bg-[#dbeafe] text-[#1d4ed8] border-blue-200';
    }
  };

  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-[#008a90]" />
          <h2 className="text-base font-bold text-[#0a2540]">
            Recent Transactions
          </h2>
        </div>

        <Link
          href="/admin/movements"
          className="inline-flex items-center gap-1 text-xs font-semibold text-[#008a90] hover:text-[#007075] transition-colors"
        >
          <span>View All</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Table Body */}
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
              <th className="pb-3 font-medium">Date</th>
              <th className="pb-3 font-medium">Type</th>
              <th className="pb-3 font-medium">Item</th>
              <th className="pb-3 font-medium">Quantity</th>
              <th className="pb-3 font-medium text-right">By</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {transactions.map((txn) => {
              const badgeStyle = getTypeBadge(txn.type);
              return (
                <tr key={txn.id} className="hover:bg-slate-50/70 transition-colors">
                  {/* Date */}
                  <td className="py-3 text-slate-500 font-medium whitespace-nowrap">
                    {txn.date}
                  </td>

                  {/* Type Badge */}
                  <td className="py-3">
                    <span
                      className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${badgeStyle}`}
                    >
                      {txn.type}
                    </span>
                  </td>

                  {/* Item Name */}
                  <td className="py-3 font-semibold text-[#0a2540] whitespace-nowrap">
                    {txn.item}
                  </td>

                  {/* Quantity */}
                  <td
                    className={`py-3 font-mono font-bold ${
                      txn.isPositiveQty ? 'text-emerald-600' : 'text-slate-700'
                    }`}
                  >
                    {txn.quantity}
                  </td>

                  {/* Operator / User */}
                  <td className="py-3 text-right text-slate-600 font-medium whitespace-nowrap">
                    {txn.by}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="pt-2" />
    </div>
  );
}

