// filepath: app/manager/returns/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Returns & Consumption Audits | VISTA Manager',
  description:
    'Review returned ward stock, authorize quarantine write-offs, and track consumption.',
};

export default function ManagerReturnsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="w-full">{children}</div>;
}

