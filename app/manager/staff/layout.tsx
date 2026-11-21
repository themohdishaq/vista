// filepath: app/manager/staff/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Staff Supervision & Rosters | Field Inventory Manager',
  description:
    'Supervise floor staff shifts, picking velocity, assigned zones, and task completion.',
};

export default function ManagerStaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="w-full">{children}</div>;
}

