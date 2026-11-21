// filepath: app/about/layout.tsx
import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'About Field Inventory Management | Smart Inventory Control & Precision Logistics',
  description:
    'Discover Field Inventory Management — purpose-built for enterprise-grade inventory control, real-time batch traceability, and audit-ready governance.',
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="w-full flex-1 flex flex-col bg-white">
      {children}
    </div>
  );
}

