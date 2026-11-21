// filepath: app/manager/reports/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Operational Reports & Audits | Field Inventory Manager',
  description:
    'Generate and schedule operational inventory reports, shift reconciliations, batch expiry audits, and packing throughput across assigned facilities.',
};

export default function ManagerReportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="w-full">{children}</div>;
}
