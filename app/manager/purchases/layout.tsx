// filepath: app/manager/purchases/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Local Purchases Review | VISTA Manager',
  description:
    'Review and approve local purchase orders recorded by warehouse floor teams.',
};

export default function ManagerPurchasesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="w-full">{children}</div>;
}

