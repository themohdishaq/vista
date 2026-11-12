// filepath: components/layout/PublicShell.tsx
'use client';

/**
 * @file components/layout/PublicShell.tsx
 * @description Client shell wrapper that renders the public Navbar and Footer
 * on public pages, while allowing administrative routes (/admin) to render
 * their own dedicated enterprise sidebar and topbar without visual collisions.
 */

import React from 'react';
import { usePathname } from 'next/navigation';
import Navbar from '@/components/public/navbar/Navbar';
import Footer from '@/components/public/footer/Footer';

interface PublicShellProps {
  children: React.ReactNode;
}

export function PublicShell({ children }: PublicShellProps) {
  const pathname = usePathname();
  const isPortalRoute = ['/admin', '/staff', '/manager'].some((route) =>
    pathname?.startsWith(route)
  );

  if (isPortalRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar />
      <div className="flex-1">{children}</div>
      <Footer />
    </>
  );
}

