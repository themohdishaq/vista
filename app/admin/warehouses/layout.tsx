// filepath: app/admin/warehouses/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Warehouse & Facility Management | Field Inventory Management',
  description:
    'Monitor warehouse capacity, cold chain zones, bin utilization, and facility health.',
};

export default function WarehousesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="w-full">{children}</div>;
}

