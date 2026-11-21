// filepath: app/manager/requests/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Stock Requests Review | Field Inventory Manager',
  description:
    'Review, authorize, or deny department and field unit requisition orders.',
};

export default function ManagerRequestsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="w-full">{children}</div>;
}

