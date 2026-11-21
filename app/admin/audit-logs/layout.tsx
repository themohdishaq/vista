// filepath: app/admin/audit-logs/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'System Audit Logs | Field Inventory Management',
  description: 'Immutable compliance ledger, security logs, and inventory movement audit records.',
};

export default function AuditLogsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
