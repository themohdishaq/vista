// filepath: app/admin/users/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'User Management | Field Inventory Management',
  description:
    'Manage users, roles, security permissions, and operational credentials across Field Inventory Management.',
};

export default function UsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="w-full">{children}</div>;
}

