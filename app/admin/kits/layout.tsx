// filepath: app/admin/kits/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kit Management & Packing Lists | Field Inventory Management',
  description:
    'Bill of materials (BOM), trauma kits, surgical packs, and box assembly tracking.',
};

export default function KitsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="w-full">{children}</div>;
}

