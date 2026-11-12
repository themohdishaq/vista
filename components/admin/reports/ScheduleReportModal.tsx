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
} from 'lucide-react';
import { ScheduledReportItem } from '@/types/reports';

interface ScheduleReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScheduleReport: (item: ScheduledReportItem) => void;
}

export function ScheduleReportModal({
  isOpen,
  onClose,
  onScheduleReport,
}: ScheduleReportModalProps) {
  const [name, setName] = useState('Weekly Inventory & Reorder Summary');
  const [category, setCategory] = useState('Inventory');
  const [frequency, setFrequency] = useState<'Daily' | 'Weekly' | 'Monthly'>('Weekly');
  const [recipients, setRecipients] = useState('director@vista.org, warehouse-manager@vista.org');
  const [deliveryTime, setDeliveryTime] = useState('08:00 AM');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const scheduledItem: ScheduledReportItem = {
      id: `sch-${Date.now()}`,
      name,
      category,
      frequency,
      recipients,
      nextRun: frequency === 'Daily' ? 'Tomorrow at 08:00 AM' : frequency === 'Weekly' ? 'Monday at 08:00 AM' : '1st of next month',
      status: 'Active',
    };

    onScheduleReport(scheduledItem);
    onClose();
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
                Setup periodic email delivery of operational reports
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
              Report Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden focus:border-[#008a90]"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-medium text-slate-700 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-700 focus:outline-hidden focus:border-[#008a90]"
              >
                <option value="Inventory">Inventory</option>
                <option value="Transactions">Transactions</option>
                <option value="Expiry">Expiry</option>
                <option value="Finance">Finance</option>
              </select>
            </div>

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
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Email Recipients
            </label>
            <input
              type="text"
              value={recipients}
              onChange={(e) => setRecipients(e.target.value)}
              placeholder="e.g. user@org.com, team@org.com"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden focus:border-[#008a90]"
              required
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">
              Dispatch Time
            </label>
            <input
              type="text"
              value={deliveryTime}
              onChange={(e) => setDeliveryTime(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-700 focus:outline-hidden focus:border-[#008a90]"
            />
          </div>

          {/* Modal Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold text-white bg-[#008a90] hover:bg-[#00747a] rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              Save Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

