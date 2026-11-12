// filepath: app/manager/approvals/page.tsx
'use client';

/**
 * @file app/manager/approvals/page.tsx
 * @description Dedicated Approvals Center for the VISTA Inventory Manager.
 */

import React, { useState } from 'react';
import { ClipboardCheck, CheckCircle2 } from 'lucide-react';
import { PendingApprovalsQueue } from '@/components/manager/dashboard/PendingApprovalsQueue';
import { ReviewApprovalModal } from '@/components/manager/dashboard/ReviewApprovalModal';
import { INITIAL_PENDING_APPROVALS } from '@/lib/data/manager-seed-data';
import { PendingApprovalItem } from '@/types/manager';

export default function ManagerApprovalsPage() {
  const [approvals, setApprovals] = useState<PendingApprovalItem[]>(
    INITIAL_PENDING_APPROVALS
  );
  const [reviewItem, setReviewItem] = useState<PendingApprovalItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleApprove = (id: string) => {
    const item = approvals.find((a) => a.id === id);
    setApprovals((prev) => prev.filter((a) => a.id !== id));
    if (item) showToast(`Authorized ${item.type} [${item.documentId}].`);
  };

  const handleReject = (id: string, reason?: string) => {
    const item = approvals.find((a) => a.id === id);
    setApprovals((prev) => prev.filter((a) => a.id !== id));
    if (item) showToast(`Rejected ${item.type} [${item.documentId}]: ${reason || 'Denied by manager'}`);
  };

  return (
    <div className="space-y-6 pb-12">
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-xl text-xs border border-slate-700 animate-in slide-in-from-top-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white shadow-xs">
          <ClipboardCheck className="w-5 h-5 stroke-[2.5]" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Manager Approvals Center
          </h1>
          <p className="text-xs text-slate-500">
            Sign-off on stock requests, inter-warehouse transfers, receiving vouchers, and adjustments
          </p>
        </div>
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

