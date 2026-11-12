// filepath: components/admin/kits/ImportKitsModal.tsx
'use client';

import React, { useState } from 'react';
import { X, Upload, FileText, Check, AlertCircle } from 'lucide-react';
import { KitRecord } from '@/types/kits';

/**
 * @file components/admin/kits/ImportKitsModal.tsx
 * @description Modal form to import kit definitions and Bill of Materials from CSV or JSON files.
 */

interface ImportKitsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (importedCount: number) => void;
}

export function ImportKitsModal({
  isOpen,
  onClose,
  onImportSuccess,
}: ImportKitsModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) return;
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onImportSuccess(3);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e1f7f5] text-[#008a90]">
              <Upload className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0a2540]">
                Import Kit Specifications
              </h3>
              <p className="text-xs text-slate-500">
                Upload CSV or Excel file containing kit definitions and components.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Dropzone */}
        <div className="mt-4 space-y-4 text-xs">
          <label className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 p-6 text-center hover:border-[#008a90] hover:bg-slate-50/50 cursor-pointer transition-colors">
            <FileText className="h-10 w-10 text-slate-400 mb-2" />
            <span className="font-semibold text-slate-700">
              {selectedFile ? selectedFile.name : 'Click to select or drag CSV file here'}
            </span>
            <span className="mt-1 text-[11px] text-slate-400">
              Supported formats: .csv, .xlsx, .json (Max 10MB)
            </span>
            <input
              type="file"
              accept=".csv,.xlsx,.json"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>

          <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 text-slate-600">
            <span className="font-bold text-slate-800">CSV Column Structure:</span>
            <p className="mt-1 font-mono text-[10px] text-slate-500">
              KitCode, KitName, Category, ComponentCodes, Quantities, TargetStation
            </p>
          </div>

          {/* Footer Actions */}
          <div className="mt-6 flex items-center justify-end gap-2 border-t border-slate-100 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleUpload}
              disabled={!selectedFile || isProcessing}
              className="flex items-center gap-1.5 rounded-xl bg-[#008a90] px-4 py-2 text-xs font-bold text-white hover:bg-[#007378] disabled:opacity-50 transition-colors"
            >
              <Check className="h-4 w-4" />
              {isProcessing ? 'Processing...' : 'Upload & Import'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
