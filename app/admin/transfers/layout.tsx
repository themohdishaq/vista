// filepath: app/admin/transfers/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Inter-Warehouse Transfers | Field Inventory Management',
  description:
    'Dispatch, authorize, and track multi-facility inventory transfers with transit tracking.',
};

export default function TransfersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="w-full">{children}</div>;
}

