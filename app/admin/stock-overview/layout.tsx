// filepath: app/admin/stock-overview/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Stock Overview | VISTA Portal',
  description:
    'Real-time inventory levels, stock by category, bin allocations, and multi-warehouse balances.',
};

export default function StockOverviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="w-full">{children}</div>;
}

