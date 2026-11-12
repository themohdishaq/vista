// filepath: app/staff/discrepancies/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Report Shortages & Discrepancies | VISTA Staff',
  description:
    'Report receiving shortages, package damages, and shelf count variances.',
};

export default function StaffDiscrepanciesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="w-full">{children}</div>;
}

