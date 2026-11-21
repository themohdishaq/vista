// filepath: app/manager/returns/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Returns & Consumption Audits | Field Inventory Manager',
  description:
    'Review returned field stock, authorize quarantine write-offs, and track consumption.',
};

export default function ManagerReturnsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="w-full">{children}</div>;
}

