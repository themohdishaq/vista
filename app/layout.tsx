// filepath: app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { PublicShell } from "@/components/layout/PublicShell";

export const metadata: Metadata = {
  title: "VISTA | Vendor Inventory, Shipment & Tracking Application",
  description: "VISTA is a smart inventory management portal for real-time warehouse control, stock tracking, and orders.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased font-sans">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <PublicShell>{children}</PublicShell>
      </body>
    </html>
  );
}
