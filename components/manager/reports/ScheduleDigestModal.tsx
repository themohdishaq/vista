// filepath: components/manager/reports/ScheduleDigestModal.tsx
'use client';

import React, { useState } from 'react';
import {
  X,
  Calendar,
  Clock,
  Mail,
  Building2,
  CheckCircle2,
} from 'lucide-react';
import { ManagerScheduledAudit } from '@/lib/data/manager-reports-data';

interface ScheduleDigestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSchedule: (schedule: ManagerScheduledAudit) => void;
}

export function ScheduleDigestModal({
  isOpen,
  onClose,
  onAddSchedule,
}: ScheduleDigestModalProps) {
  const [auditName, setAuditName] = useState('Daily Shift Handover Audit');
  const [frequency, setFrequency] = useState('Daily');
  const [time, setTime] = useState('06:00');
  const [facility, setFacility] = useState('Main Warehouse (Primary)');
  const [recipients, setRecipients] = useState('sarah.johnson@vista.org');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newSchedule: ManagerScheduledAudit = {
      id: `sch-${Date.now()}`,
      auditName,
      schedule: `${frequency} at ${time} AM`,
      facility,
      recipients,
      status: 'Active',
      nextRun: `Tomorrow at ${time} AM`,
    };
    onAddSchedule(newSchedule);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Schedule Automated Floor Digest
              </h3>
              <p className="text-xs text-slate-500">
                Automate recurring audit emails to supervisory teams
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Audit Name
            </label>
            <input
              type="text"
              value={auditName}
              onChange={(e) => setAuditName(e.target.value)}
              required
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-900 font-semibold focus:outline-hidden focus:border-[#008a90]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Recurrence
              </label>
              <select
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-800 font-medium focus:outline-hidden focus:border-[#008a90]"
              >
                <option value="Daily">Daily</option>
                <option value="Every Monday">Every Monday</option>
                <option value="Every Friday">Every Friday</option>
                <option value="Monthly (1st)">Monthly (1st Day)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Trigger Time
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-hidden focus:border-[#008a90]"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Assigned Warehouse Facility
            </label>
            <select
              value={facility}
              onChange={(e) => setFacility(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-white text-slate-800 font-medium focus:outline-hidden focus:border-[#008a90]"
            >
              <option value="Main Warehouse (Primary)">Main Warehouse (Primary)</option>
              <option value="West Warehouse (Secondary)">West Warehouse (Secondary)</option>
              <option value="East Warehouse">East Warehouse</option>
              <option value="Cold Storage Depot">Cold Storage Depot</option>
              <option value="All Assigned Facilities">All Assigned Facilities</option>
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Distribution Recipients (comma separated)
            </label>
            <input
              type="text"
              value={recipients}
              onChange={(e) => setRecipients(e.target.value)}
              required
              placeholder="e.g. manager@vista.org, lead@vista.org"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 font-medium focus:outline-hidden focus:border-[#008a90]"
            />
          </div>

          {/* Footer buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-[#008a90] hover:bg-[#00747a] text-white font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-2"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Save Schedule</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

