// filepath: components/admin/dashboard/StatGrid.tsx
import React from 'react';
import { StatKPI } from '@/types/admin';
import { StatCard } from './StatCard';

/**
 * @file components/admin/dashboard/StatGrid.tsx
 * @description 4-Card Responsive Grid for Executive Inventory KPIs:
 * Total Items, Warehouses, Stock Movements, and Low Stock Items.
 */

interface StatGridProps {
  stats: StatKPI[];
}

export function StatGrid({ stats }: StatGridProps) {
  return (
    <section aria-label="Inventory Metrics Summary" className="w-full">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.id} stat={stat} />
        ))}
      </div>
    </section>
  );
}

