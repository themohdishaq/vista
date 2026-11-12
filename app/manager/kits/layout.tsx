// filepath: app/manager/kits/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kit Supervision & Packing | VISTA Manager',
  description:
    'Supervise BOM assembly, inspect packing progress, assign lead packers, and authorize dispatch.',
};

export default function ManagerKitsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="w-full">{children}</div>;
}

