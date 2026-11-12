// filepath: app/about/layout.tsx
import type { Metadata } from 'next';
import React from 'react';

export const metadata: Metadata = {
  title: 'About VISTA | Smart Inventory Management & Precision Logistics',
  description:
    'Discover VISTA (Vendor Inventory, Shipment & Tracking Application) — purpose-built for hospital-grade inventory control, real-time batch traceability, and audit-ready governance.',
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

