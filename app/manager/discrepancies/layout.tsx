// filepath: app/manager/discrepancies/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Discrepancies & Shortages | VISTA Manager',
  description:
    'Identify and resolve inventory shortages, damaged stock, and bin count variances.',
};

export default function ManagerDiscrepanciesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="w-full">{children}</div>;
}

