// filepath: app/manager/approvals/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Approvals Queue | VISTA Manager',
  description:
    'Dedicated approval center for stock requests, adjustments, transfers, and receiving.',
};

export default function ManagerApprovalsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="w-full">{children}</div>;
}

