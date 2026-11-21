// filepath: app/admin/movements/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Stock Movements & Audit Log | Field Inventory Management',
  description:
    'Full traceability of all inventory receipts, issues, transfers, and barcode scans across facilities.',
};

export default function MovementsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="w-full">{children}</div>;
}

