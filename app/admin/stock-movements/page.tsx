// filepath: app/admin/stock-movements/page.tsx
import { redirect } from 'next/navigation';

export default function StockMovementsRedirect() {
  redirect('/admin/movements');
}

