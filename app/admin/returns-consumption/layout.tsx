// filepath: app/admin/returns-consumption/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Returns & Consumption Management | VISTA Portal',
  description:
    'Manage returns, excess items, damaged batches, and floor consumption.',
};

export default function ReturnsConsumptionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="w-full">{children}</div>;
}

