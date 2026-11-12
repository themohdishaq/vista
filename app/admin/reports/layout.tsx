// filepath: app/admin/reports/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Reports & Analytics | VISTA Portal',
  description:
    'Comprehensive insights into inventory performance, turnover rates, warehouse distributions, and scheduled audits.',
};

export default function ReportsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="w-full">{children}</div>;
}

