// filepath: app/admin-login/page.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login');
  }, [router]);

  return (
    <div className="flex min-h-[calc(100vh-80px)] w-full items-center justify-center bg-slate-50">
      <div className="flex items-center gap-2 text-sm text-slate-500">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#008a90] border-t-transparent" />
        <span>Redirecting to Field Inventory Management Login...</span>
      </div>
    </div>
  );
}
