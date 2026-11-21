// filepath: app/admin/items/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Item Master Catalog | Field Inventory Management',
  description:
    'Catalog management, barcode generation, reorder thresholds, and medical SKU specifications.',
};

export default function ItemsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="w-full">{children}</div>;
}

