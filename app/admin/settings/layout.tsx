// filepath: app/admin/settings/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'System Settings & Configuration | VISTA Admin',
  description: 'Manage warehouse thresholds, notification alerts, security policies, and database connection settings.',
};

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
