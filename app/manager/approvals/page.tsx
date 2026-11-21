// filepath: app/manager/approvals/page.tsx
'use client';

/**
 * @file app/manager/approvals/page.tsx
 * @description Dedicated Approvals Center for the VISTA Inventory Manager.
 * Consolidates stock requests, inter-warehouse transfers, local spot purchases, and adjustments.
 */

import React, { useState, useEffect } from 'react';
import { ClipboardCheck, CheckCircle2, RefreshCw } from 'lucide-react';
import { PendingApprovalsQueue } from '@/components/manager/dashboard/PendingApprovalsQueue';
import { ReviewApprovalModal } from '@/components/manager/dashboard/ReviewApprovalModal';
import { PendingApprovalItem } from '@/types/manager';

export default function ManagerApprovalsPage() {
  const [approvals, setApprovals] = useState<PendingApprovalItem[]>([]);
  const [reviewItem, setReviewItem] = useState<PendingApprovalItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const fetchApprovals = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/manager/dashboard');
      const data = await res.json();
      if (data.success && data.data?.approvals) {
        setApprovals(data.data.approvals);
      }
    } catch (e) {
      console.error('Failed to fetch pending approvals:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals();
  }, []);

  const handleApprove = async (id: string, notes?: string) => {
    const item = approvals.find((a) => a.id === id);
    if (!item) return;

    try {
      if (item.type === 'Stock Request') {
        await fetch('/api/requests', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: item.documentId || id, action: 'approve' }),
        });
      } else if (item.type === 'Transfer') {
        await fetch('/api/transfers', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: item.documentId || id, action: 'approve' }),
        });
      } else if (item.type === 'Stock Adjustment') {
        await fetch('/api/adjustments', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: item.documentId || id }),
        });
      } else if (item.type === 'Local Purchase') {
        await fetch('/api/staff/local-purchases', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: item.documentId || id, status: 'Approved' }),
        });
      }

      setApprovals((prev) => prev.filter((a) => a.id !== id));
      showToast(`Authorized ${item.type} [${item.documentId}].`);
      fetchApprovals();
    } catch {
      showToast(`Failed to record authorization.`);
    }
  };

  const handleReject = async (id: string, reason?: string) => {
    const item = approvals.find((a) => a.id === id);
    if (!item) return;

    try {
      if (item.type === 'Stock Request') {
        await fetch('/api/requests', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: item.documentId || id, action: 'reject', reason }),
        });
      } else if (item.type === 'Transfer') {
        await fetch('/api/transfers', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: item.documentId || id, action: 'reject', reason }),
        });
      }

      setApprovals((prev) => prev.filter((a) => a.id !== id));
      showToast(`Rejected ${item.type} [${item.documentId}]: ${reason || 'Denied by manager'}`);
      fetchApprovals();
    } catch {
      showToast(`Failed to update status.`);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl text-xs border border-slate-700 animate-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-xs">
            <ClipboardCheck className="w-5 h-5 stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Manager Approvals Center
            </h1>
            <p className="text-xs text-slate-500">
              Sign-off on field requisitions, inter-facility transfers, local emergency spot buys, and stock adjustments
            </p>
          </div>
        </div>

        <button
          onClick={fetchApprovals}
          className="self-start sm:self-auto flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-xs transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-[#008a90]' : ''}`} />
          <span>Refresh Queue ({approvals.length})</span>
        </button>
      </div>

      <PendingApprovalsQueue
        approvals={approvals}
        onApprove={handleApprove}
        onReject={handleReject}
        onReview={(item) => setReviewItem(item)}
      />

      <ReviewApprovalModal
        isOpen={Boolean(reviewItem)}
        onClose={() => setReviewItem(null)}
        item={reviewItem}
        onApprove={handleApprove}
        onReject={handleReject}
      />
    </div>
  );
}
