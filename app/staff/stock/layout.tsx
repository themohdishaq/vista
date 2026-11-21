// filepath: app/staff/stock/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Assigned Floor Stock | Field Inventory Staff',
  description:
    'View real-time available stock and bin balances in your assigned warehouse zones.',
};

export default function StaffStockLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="w-full">{children}</div>;
}

