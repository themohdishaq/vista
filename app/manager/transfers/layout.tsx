// filepath: app/manager/transfers/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Transfer Authorizations | VISTA Manager',
  description:
    'Authorize and track inter-facility stock transfers and transit manifests across assigned facilities.',
};

export default function ManagerTransfersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="w-full">{children}</div>;
}

