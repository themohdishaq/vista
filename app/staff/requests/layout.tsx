// filepath: app/staff/requests/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Submit Stock Request | Field Inventory Staff',
  description:
    'Submit replenishment stock requests for emergency and field requisitions.',
};

export default function StaffRequestsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="w-full">{children}</div>;
}

