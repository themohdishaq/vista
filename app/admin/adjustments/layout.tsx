// filepath: app/admin/adjustments/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Stock Adjustments & Variance | VISTA Portal',
  description:
    'Cycle count adjustments, write-offs, variance investigation, and reconciliation audits.',
};

export default function AdjustmentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="w-full">{children}</div>;
}

