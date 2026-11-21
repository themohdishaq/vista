// filepath: app/staff/transfers/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Internal Stock Movements | Field Inventory Staff',
  description:
    'Execute approved inter-bin and cross-dock stock relocations.',
};

export default function StaffTransfersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="w-full">{children}</div>;
}

