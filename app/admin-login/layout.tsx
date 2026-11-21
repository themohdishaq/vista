// filepath: app/admin-login/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Administrator Security Gateway | Field Inventory Management',
  description: 'Dedicated administrative authentication gateway for Field Inventory Management System Administrators.',
};

export default function AdminLoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="w-full min-h-[calc(100vh-80px)]">{children}</div>;
}
