// filepath: app/login/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | Field Inventory Management",
  description: "Sign in to access your Field Inventory Management portal.",
};

export default function LoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="w-full min-h-[calc(100vh-80px)]">{children}</div>;
}
