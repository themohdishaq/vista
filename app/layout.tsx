// filepath: app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";
import { PublicShell } from "@/components/layout/PublicShell";

export const metadata: Metadata = {
  title: "Field Inventory Management | Smart Warehouse Control & Logistics",
  description: "Field Inventory Management is an enterprise inventory portal for real-time warehouse control, stock tracking, and logistics.",
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
