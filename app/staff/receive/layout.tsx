// filepath: app/staff/receive/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Receive Inventory | Field Inventory Staff',
  description:
    'Scan and record inbound supplier deliveries, log batch codes, and stage inventory for inspection.',
};

export default function StaffReceiveLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="w-full">{children}</div>;
}

