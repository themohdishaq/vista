// filepath: components/admin/kits/KitCategoriesSidebar.tsx
'use client';

import React from 'react';
import {
  PlusCircle,
  AlertCircle,
  Briefcase,
  Sparkles,
  Grid,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { KitCategory, KitRecord } from '@/types/kits';

/**
 * @file components/admin/kits/KitCategoriesSidebar.tsx
 * @description Left sidebar cards for Kits & Packing screen:
 * 1. Kit Categories list with category icons and active selection
 * 2. Kit Details preview card for the currently highlighted kit
 */

interface KitCategoriesSidebarProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  selectedKit: KitRecord | null;
  onViewDetails: (kit: KitRecord) => void;
  categoryCounts: Record<string, number>;
}

export function KitCategoriesSidebar({
  selectedCategory,
  onSelectCategory,
  selectedKit,
  onViewDetails,
  categoryCounts,
}: KitCategoriesSidebarProps) {
  const categories: {
    name: KitCategory;
    icon: React.ReactNode;
    colorBg: string;
    iconColor: string;
  }[] = [
    {
      name: 'Medical Kits',
      icon: <PlusCircle className="h-4 w-4" />,
      colorBg: 'bg-emerald-50',
      iconColor: 'text-emerald-600',
    },
    {
      name: 'Emergency Kits',
      icon: <ShieldAlert className="h-4 w-4" />,
      colorBg: 'bg-rose-50',
      iconColor: 'text-rose-600',
    },
    {
      name: 'Office Kits',
      icon: <Briefcase className="h-4 w-4" />,
      colorBg: 'bg-blue-50',
      iconColor: 'text-blue-600',
    },
    {
      name: 'Cleaning Kits',
      icon: <Sparkles className="h-4 w-4" />,
      colorBg: 'bg-purple-50',
      iconColor: 'text-purple-600',
    },
    {
      name: 'Other Kits',
      icon: <Grid className="h-4 w-4" />,
      colorBg: 'bg-slate-100',
      iconColor: 'text-slate-600',
    },
  ];

  // First Aid Kit Red Case Graphic
  const renderFirstAidKitBox = () => {
    return (
      <div className="relative flex h-20 w-24 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 p-2 shadow-md shadow-rose-500/20">
        {/* Handle at top */}
        <div className="absolute -top-2 h-2.5 w-10 rounded-t-md border-2 border-red-700 bg-red-400" />
        {/* Box White Cross */}
        <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-white/95 shadow-xs">
          <div className="absolute h-5 w-2 rounded-xs bg-red-600" />
          <div className="absolute h-2 w-5 rounded-xs bg-red-600" />
        </div>
        {/* Latches */}
        <div className="absolute left-1 top-1/2 -translate-y-1/2 h-2 w-1 rounded-xs bg-red-800" />
        <div className="absolute right-1 top-1/2 -translate-y-1/2 h-2 w-1 rounded-xs bg-red-800" />
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* 1. Kit Categories Card */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-sm font-bold text-slate-800">Kit Categories</h3>
          <button
            onClick={() => onSelectCategory('all')}
            className="text-xs font-semibold text-[#008a90] hover:underline"
          >
            View All →
          </button>
        </div>

        <div className="mt-3 space-y-1.5">
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.name;
            const count = categoryCounts[cat.name] || 0;

            return (
              <button
                key={cat.name}
                onClick={() => onSelectCategory(isSelected ? 'all' : cat.name)}
                className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-[#e1f7f5] text-[#008a90] shadow-xs'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`flex h-6 w-6 items-center justify-center rounded-lg ${cat.colorBg} ${cat.iconColor}`}
                  >
                    {cat.icon}
                  </div>
                  <span>{cat.name}</span>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                    isSelected
                      ? 'bg-white text-[#008a90]'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Kit Details Preview Card */}
      {selectedKit && (
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm space-y-3 animate-in fade-in">
          <div className="border-b border-slate-100 pb-2">
            <h4 className="text-xs font-bold text-slate-800">Kit Details</h4>
          </div>

          <div className="flex items-start gap-3">
            {renderFirstAidKitBox()}
            <div className="min-w-0 flex-1">
              <h5 className="font-extrabold text-slate-900 text-sm">
                {selectedKit.name}
              </h5>
              <p className="text-xs font-mono font-medium text-slate-500">
                ({selectedKit.code})
              </p>
              <div className="mt-1">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ${
                    selectedKit.status === 'Active'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {selectedKit.status}
                </span>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
            {selectedKit.description}
          </p>

          <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
            <span>Components: <strong>{selectedKit.componentCount} items</strong></span>
            <button
              onClick={() => onViewDetails(selectedKit)}
              className="font-bold text-[#008a90] hover:underline flex items-center gap-0.5"
            >
              View Details →
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
