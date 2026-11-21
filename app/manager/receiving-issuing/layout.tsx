// filepath: app/manager/receiving-issuing/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Receiving & Issuing Approvals | Field Inventory Manager',
  description:
    'Authorize high-volume inbound consignments and department issue vouchers.',
};

export default function ManagerReceivingIssuingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="w-full">{children}</div>;
}

