// filepath: app/staff/returns/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ward Returns & Consumption | VISTA Staff',
  description:
    'Record returned excess items from hospital wards and log floor consumption.',
};

export default function StaffReturnsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="w-full">{children}</div>;
}

