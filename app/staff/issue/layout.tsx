// filepath: app/staff/issue/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Issue & Distribute Stock | Field Inventory Staff',
  description:
    'Prepare and record stock issues, bin picks, and field unit distributions.',
};

export default function StaffIssueLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="w-full">{children}</div>;
}

