// filepath: app/staff/damages/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Log Damaged & Expired Items | VISTA Staff',
  description:
    'Quarantine damaged, expired, or non-compliant stock for supervisory review.',
};

export default function StaffDamagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="w-full">{children}</div>;
}

