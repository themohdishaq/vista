// filepath: app/staff/purchases/layout.tsx
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Record Local Purchases | VISTA Staff',
  description:
    'Record emergency local purchases and supplier invoices for managerial review.',
};

export default function StaffPurchasesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="w-full">{children}</div>;
}
