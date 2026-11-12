// filepath: app/staff/requests/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Submit Stock Request | VISTA Staff',
  description:
    'Submit replenishment stock requests for emergency and ward requisitions.',
};

export default function StaffRequestsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="w-full">{children}</div>;
}

