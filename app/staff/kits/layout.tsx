// filepath: app/staff/kits/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Kit Packing & Box Records | VISTA Staff',
  description:
    'Assemble medical trauma kits, verify component checklists, and log pack completion.',
};

export default function StaffKitsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="w-full">{children}</div>;
}

