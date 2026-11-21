// filepath: app/manager/expiry/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Batch & Expiry Monitoring | Field Inventory Manager',
  description:
    'Monitor inventory and supply batch lots, days remaining, and FIFO reallocation.',
};

export default function ManagerExpiryLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="w-full">{children}</div>;
}

