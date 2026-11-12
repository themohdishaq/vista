// filepath: components/admin/users/ImportUsersModal.tsx
'use client';

import React, { useState } from 'react';
import {
  X,
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { UserRecord } from '@/types/users';

interface ImportUsersModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportUsers: (newUsers: UserRecord[]) => void;
}

export function ImportUsersModal({
  isOpen,
  onClose,
  onImportUsers,
}: ImportUsersModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleDownloadTemplate = () => {
    const csv = `Full Name,Email,Role,Department,Warehouse Access
Alex Morgan,alex.morgan@vista.org,Inventory Staff,Logistics,Main Warehouse
Jordan Reed,jordan.reed@vista.org,Inventory Manager,Operations,West Warehouse
Taylor Brooks,taylor.brooks@vista.org,Auditor,Finance,All Facilities`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'VISTA_User_Import_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      const mockImported: UserRecord[] = [
        {
          id: `usr-imp-1-${Date.now()}`,
          fullName: 'Alex Morgan',
          username: 'alex.morgan@vista.org',
          email: 'alex.morgan@vista.org',
          role: 'Inventory Staff',
          department: 'Logistics',
          status: 'Active',
          lastLogin: 'Never',
          warehouseAccess: 'Main Warehouse',
          permissionsCount: 18,
        },
        {
          id: `usr-imp-2-${Date.now()}`,
          fullName: 'Jordan Reed',
          username: 'jordan.reed@vista.org',
          email: 'jordan.reed@vista.org',
          role: 'Inventory Manager',
          department: 'Operations',
          status: 'Active',
          lastLogin: 'Never',
          warehouseAccess: 'West Warehouse',
          permissionsCount: 36,
        },
      ];

      onImportUsers(mockImported);
      setIsProcessing(false);
      onClose();
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#008a90]">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-base">
                Import Users
              </h3>
              <p className="text-xs text-slate-500">
                Bulk upload user roster via CSV or XLSX spreadsheet
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 p-1.5 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleImport} className="p-6 space-y-4 text-xs">
          {/* Template Download */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
            <div>
              <span className="font-semibold text-slate-800 block">
                Standard CSV Template
              </span>
              <p className="text-[11px] text-slate-500">
                Pre-formatted headers for user profiles and roles
              </p>
            </div>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="px-3 py-1.5 text-xs font-semibold text-[#008a90] bg-white border border-teal-200 rounded-lg hover:bg-teal-50 transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              Template
            </button>
          </div>

          {/* Upload Area */}
          <div className="border-2 border-dashed border-slate-200 hover:border-[#008a90] rounded-2xl p-6 text-center transition-colors bg-slate-50/50">
            <input
              type="file"
              id="user-file-input"
              accept=".csv,.xlsx"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="hidden"
            />
            <label
              htmlFor="user-file-input"
              className="cursor-pointer flex flex-col items-center gap-2"
            >
              <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 shadow-2xs">
                <FileSpreadsheet className="w-5 h-5 text-[#008a90]" />
              </div>
              <div>
                <span className="font-semibold text-slate-700 block">
                  {selectedFile ? selectedFile.name : 'Click to select CSV file'}
                </span>
                <span className="text-[11px] text-slate-400 mt-0.5 block">
                  {selectedFile
                    ? `${(selectedFile.size / 1024).toFixed(1)} KB`
                    : 'Supports CSV, XLSX up to 10MB'}
                </span>
              </div>
            </label>
          </div>

          {/* Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="px-5 py-2 text-xs font-semibold text-white bg-[#008a90] hover:bg-[#00747a] rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Upload className="w-4 h-4" />
              {isProcessing ? 'Importing...' : 'Upload & Import'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

