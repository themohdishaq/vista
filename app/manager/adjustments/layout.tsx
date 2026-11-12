// filepath: app/manager/adjustments/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Stock Adjustments & Recounts | VISTA Manager',
  description:
    'Approve physical count discrepancies, authorize bin adjustments, or mandate physical recounts.',
};

export default function ManagerAdjustmentsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="w-full">{children}</div>;
}

