// filepath: components/public/home/TeamRolesSection.tsx
import React from 'react';
import { ShieldCheck, Users, User } from 'lucide-react';

/**
 * @file components/public/home/TeamRolesSection.tsx
 * @description Role Access & Team Permissions Section ("ACCESS FOR YOUR TEAM").
 * Features:
 * - Centered header: "The Right Access for Every Role"
 * - 3 clean role columns with vertical divider lines:
 *   1. Administrator ("Full control of the system.")
 *   2. Inventory Manager ("Manage operations and approvals.")
 *   3. Inventory Staff ("Handle day-to-day inventory tasks.")
 */

const roles = [
  {
    id: 'administrator',
    title: 'Administrator',
    description: 'Full control of the system.',
    icon: ShieldCheck,
  },
  {
    id: 'inventory-manager',
    title: 'Inventory Manager',
    description: 'Manage operations and approvals.',
    icon: Users,
  },
  {
    id: 'inventory-staff',
    title: 'Inventory Staff',
    description: 'Handle day-to-day inventory tasks.',
    icon: User,
  },
];

export default function TeamRolesSection() {
  return (
    <section className="w-full bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center space-y-2 mb-12 sm:mb-16">
          <p className="text-xs sm:text-sm font-bold tracking-widest text-[#00a896] uppercase">
            ACCESS FOR YOUR TEAM
          </p>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#0a2540]">
            The Right Access for Every Role
          </h2>
        </div>

        {/* 3-Column Roles Display with Vertical Separators */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200">
          {roles.map((role) => {
            const Icon = role.icon;
            return (
              <div
                key={role.id}
                className="flex flex-col items-center justify-center p-6 sm:p-8 text-center"
              >
                {/* Circular Mint/Cyan Icon Badge */}
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#e3f7f5] text-[#008a90] shadow-sm mb-4">
                  <Icon className="h-8 w-8" />
                </div>

                {/* Role Title */}
                <h3 className="text-lg sm:text-xl font-bold text-[#0a2540]">
                  {role.title}
                </h3>

                {/* Role Description */}
                <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xs leading-relaxed">
                  {role.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

