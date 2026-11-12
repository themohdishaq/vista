// filepath: app/staff/cycle-counts/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Physical Stock Counts | VISTA Staff',
  description:
    'Perform physical stock counts, verify bin balances, and report count variances.',
};

export default function StaffCycleCountsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="w-full">{children}</div>;
}

