// filepath: app/admin/stock-overview/page.tsx
'use client';

/**
 * @file app/admin/stock-overview/page.tsx
 * @description Administrative Stock Overview Screen for VISTA Portal.
 * Matches the design specification:
 * - Top header with Isometric 3D Cube Icon + Date Range Dropdown ("Last 30 Days ⌵")
 * - Row 1: 4 KPI Cards (Total Stock Quantity, Warehouses, Unique Items, Low Stock Items)
 * - Row 2: 2 Data Visualization Cards:
 *   - Stock by Category Donut Chart (Medical Supplies 38.5%, Pharmaceuticals 28.2%, Equipment 18.7%, Hygiene 8.1%, Others 6.5%)
 *   - Stock Trend Dual-series Area Chart (Total Stock vs. Available Stock across April)
 * - Row 3: Stock by Location Multi-Warehouse Inventory Table with Search, Category & Warehouse Dropdowns, CSV Export & Actions
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { StockOverviewStatGrid } from '@/components/admin/stock-overview/StockOverviewStatGrid';
import { StockByCategoryChart } from '@/components/admin/stock-overview/StockByCategoryChart';
import { StockTrendChart } from '@/components/admin/stock-overview/StockTrendChart';
import { StockByLocationTable } from '@/components/admin/stock-overview/StockByLocationTable';
import { LocationStockItem, StockOverviewKPIData } from '@/types/stock-overview';

export default function StockOverviewPage() {
  const [dateRange, setDateRange] = useState('Last 30 Days');
  const [locationItems, setLocationItems] = useState<LocationStockItem[]>([]);
  const [totalWarehouseCount, setTotalWarehouseCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  const fetchStockData = async () => {
    try {
      setIsLoading(true);
      const [stockRes, whRes] = await Promise.all([
        fetch('/api/stock'),
        fetch('/api/warehouses'),
      ]);
      const [stockJson, whJson] = await Promise.all([
        stockRes.json(),
        whRes.json(),
      ]);

      if (stockJson.success && Array.isArray(stockJson.data)) {
        setLocationItems(stockJson.data);
      }
      if (whJson.success && Array.isArray(whJson.data)) {
        setTotalWarehouseCount(whJson.data.length);
      }
    } catch (err) {
      console.error('Failed to load stock overview data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStockData();
  }, []);

  const handleUpdateItem = (updated: LocationStockItem) => {
    setLocationItems((prev) =>
      prev.map((i) => (i.id === updated.id ? updated : i))
    );
  };

  const dynamicKpiData: StockOverviewKPIData = useMemo(() => {
    const totalQty = locationItems.reduce((acc, curr) => acc + (curr.totalStock || 0), 0);
    const uniqueItemCodes = new Set(locationItems.map((i) => i.code)).size;
    const lowStockCount = locationItems.filter(
      (i) => i.status === 'Low Stock' || i.status === 'Out of Stock'
    ).length;
    const activeWhCount = totalWarehouseCount || new Set(locationItems.map((i) => i.location)).size;

    return {
      totalStockQuantity: {
        value: totalQty.toLocaleString(),
        label: 'Total Stock Quantity',
        change: '+0.0%',
        isPositive: true,
        sparkline: [totalQty, totalQty, totalQty],
      },
      warehouses: {
        value: activeWhCount.toString(),
        label: 'Warehouses',
        change: 'Active',
        isPositive: true,
        sparkline: [activeWhCount, activeWhCount, activeWhCount],
      },
      uniqueItems: {
        value: uniqueItemCodes.toLocaleString(),
        label: 'Unique Items',
        change: '+0.0%',
        isPositive: true,
        sparkline: [uniqueItemCodes, uniqueItemCodes, uniqueItemCodes],
      },
      lowStockItems: {
        value: lowStockCount.toLocaleString(),
        label: 'Low Stock Items',
        change: lowStockCount > 0 ? 'Action Required' : 'Optimal',
        isPositive: lowStockCount === 0,
        sparkline: [lowStockCount, lowStockCount, lowStockCount],
      },
    };
  }, [locationItems, totalWarehouseCount]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      
      {/* ================= PAGE HEADER ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        
        {/* Left: Isometric 3D Cube Icon + Title & Description */}
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#e1f7f5] text-[#008a90] shadow-sm">
            <svg
              className="h-7 w-7 text-[#008a90]"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M16 3L28 9.5V22.5L16 29L4 22.5V9.5L16 3Z"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinejoin="round"
              />
              <path
                d="M16 16L28 9.5"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M16 16L4 9.5"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
              <path
                d="M16 16V29"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#0a2540]">
              Stock Overview
            </h1>
            <p className="mt-0.5 text-xs sm:text-sm text-slate-500">
              Real-time overview of your inventory across all warehouses and locations.
            </p>
          </div>
        </div>

        {/* Right: Date Range Dropdown */}
        <div className="relative self-start sm:self-auto">
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white py-2 pl-3 pr-8 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors">
            <Calendar className="h-4 w-4 text-[#008a90]" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="appearance-none bg-transparent pr-2 focus:outline-none cursor-pointer"
            >
              <option value="Last 7 Days">Last 7 Days</option>
              <option value="Last 30 Days">Last 30 Days</option>
              <option value="Last 90 Days">Last 90 Days</option>
              <option value="This Quarter">This Quarter</option>
              <option value="This Year">This Year</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          </div>
        </div>

      </div>

      {/* ================= ROW 1: 4 KPI CARDS ================= */}
      <StockOverviewStatGrid data={dynamicKpiData} />

      {/* ================= ROW 2: 2 VISUALIZATION CARDS ================= */}
      
        
          <StockByCategoryChart items={locationItems} />

      

      {/* ================= ROW 3: STOCK BY LOCATION TABLE ================= */}
      <StockByLocationTable
        items={locationItems}
        onUpdateItem={handleUpdateItem}
      />

    </div>
  );
}

