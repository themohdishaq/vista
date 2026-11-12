// filepath: app/manager/stock/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Stock Balances & Bins | VISTA Manager',
  description:
    'Monitor live stock availability, reserved units, and bin allocations across assigned warehouses.',
};

export default function ManagerStockLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="w-full">{children}</div>;
}

