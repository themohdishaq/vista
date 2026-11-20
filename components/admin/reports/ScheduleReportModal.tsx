// filepath: components/admin/reports/ScheduleReportModal.tsx
'use client';

import React, { useState } from 'react';
import {
  X,
  Calendar,
  CheckCircle2,
  Mail,
  Clock,
  Building2,
  Loader2,
} from 'lucide-react';
import { ScheduledReportItem } from '@/types/reports';

interface ScheduleReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScheduleReport: (item: ScheduledReportItem) => Promise<void> | void;
}

export function ScheduleReportModal({
  isOpen,
  onClose,
  onScheduleReport,
}: ScheduleReportModalProps) {
  const [name, setName] = useState('Weekly Inventory & Reorder Summary');
  const [category, setCategory] = useState('Inventory');
  const [frequency, setFrequency] = useState<'Daily' | 'Weekly' | 'Monthly'>('Weekly');
  const [recipients, setRecipients] = useState('admin@vista.com, logistics@vista.com');
  const [deliveryTime, setDeliveryTime] = useState('08:00 AM');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const scheduledItem: ScheduledReportItem = {
        id: `sch-${Date.now()}`,
        name,
        category,
        frequency,
        recipients,
        nextRun:
          frequency === 'Daily'
            ? `Tomorrow at ${deliveryTime}`
            : frequency === 'Weekly'
            ? `Monday at ${deliveryTime}`
            : `1st of next month at ${deliveryTime}`,
        status: 'Active',
      };

      await onScheduleReport(scheduledItem);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#008a90]">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-base">
                Schedule Automated Report
              </h3>
              <p className="text-xs text-slate-500">
                Setup periodic automated report delivery to stakeholders
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Task Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#008a90]"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-hidden focus:border-[#008a90]"
            >
              <option value="Inventory">Inventory Summary &amp; Balances</option>
              <option value="Movements">Movements Ledger &amp; Velocity</option>
              <option value="Quality & Expiry">Quality, Expiry &amp; Cold-Chain</option>
              <option value="Finance & Assets">Valuation &amp; Procurement</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Cadence
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as any)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-hidden focus:border-[#008a90]"
              >
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Dispatch Time
              </label>
              <input
                type="text"
                value={deliveryTime}
                onChange={(e) => setDeliveryTime(e.target.value)}
                placeholder="08:00 AM UTC"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#008a90]"
              />
            </div>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Recipient Email Addresses (comma separated)
            </label>
            <input
              type="text"
              required
              value={recipients}
              onChange={(e) => setRecipients(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-hidden focus:border-[#008a90]"
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-2.5 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-5 py-2 text-white bg-[#008a90] hover:bg-[#00747a] font-semibold rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Configuring Schedule...</span>
                </>
              ) : (
                <>
                  <Calendar className="w-4 h-4" />
                  <span>Activate Schedule</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
