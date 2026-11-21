// filepath: app/admin/requests/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Stock Requests & Requisitions | Field Inventory Management',
  description:
    'Review, approve, and track departmental stock requests, emergency orders, and fulfillment pipelines.',
};

export default function RequestsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="w-full">{children}</div>;
}

