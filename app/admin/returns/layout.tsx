// filepath: app/admin/returns/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Returns & Consumption | VISTA Portal',
  description:
    'Track returns, ward consumption activities, RMA vouchers, and stock write-offs across all warehouse facilities.',
};

export default function ReturnsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="w-full">{children}</div>;
}

