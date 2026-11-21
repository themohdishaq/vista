// filepath: components/admin/items/ImportItemsModal.tsx
'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Building2,
} from 'lucide-react';

interface ImportItemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess?: () => void;
  warehouses?: { id: string; name: string; city?: string }[];
}

export function ImportItemsModal({
  isOpen,
  onClose,
  onImportSuccess,
  warehouses: propWarehouses = [],
}: ImportItemsModalProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [warehouses, setWarehouses] = useState<{ id: string; name: string; city?: string }[]>(propWarehouses);
  const [warehouseId, setWarehouseId] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState<number | null>(null);

  useEffect(() => {
    if (propWarehouses.length > 0) {
      setWarehouses(propWarehouses);
      if (!warehouseId) setWarehouseId(propWarehouses[0].id);
    } else {
      fetch('/api/warehouses')
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.data) && data.data.length > 0) {
            setWarehouses(data.data);
            setWarehouseId(data.data[0].id);
          }
        })
        .catch(() => {});
    }
  }, [propWarehouses, isOpen]);

  if (!isOpen) return null;

  const handleDownloadTemplate = () => {
    const csv = `Item Code,Item Name,Category,Unit,Stock Quantity,Reorder Level,Description
VST-101,Digital Blood Pressure Monitor,Equipment,Unit,50,15,Automatic upper arm digital BP monitor with cuff.
VST-102,Sterile Surgical Blade #10,Consumables,Box,200,50,Carbon steel sterile surgical scalpel blades box of 100.
VST-103,Ibuprofen 400mg Film-Coated,Pharmaceuticals,Pack,500,100,Nonsteroidal anti-inflammatory drug blister pack.
VST-104,Chlorhexidine Gluconate 4%,Hygiene,Bottle,120,30,Surgical hand scrub antiseptic solution 500ml.`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'FIM_Item_Import_Template.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setError('Please choose an Excel (.xlsx, .xls) or CSV file to import.');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('warehouseId', warehouseId || 'wh-001');

      const res = await fetch('/api/items/import', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.message || 'Failed to import items from spreadsheet.');
        setIsProcessing(false);
        return;
      }

      setSuccessCount(data.importedCount);
      setIsProcessing(false);

      setTimeout(() => {
        if (onImportSuccess) onImportSuccess();
        onClose();
      }, 1200);
    } catch (err: any) {
      setError('Network or upload error: ' + err.message);
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center text-[#008a90]">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 text-base">
                Import Items from Excel / CSV
              </h3>
              <p className="text-xs text-slate-500">
                Bulk register SKUs and allocate initial warehouse stock balances
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

        {/* Content */}
        <form onSubmit={handleImport} className="p-6 overflow-y-auto space-y-4 text-xs">
          {/* Template Download Banner */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-teal-50/60 border border-teal-200/80">
            <div className="space-y-0.5">
              <span className="font-bold text-[#008a90] block">Spreadsheet Template</span>
              <span className="text-[11px] text-slate-500 block">
                Download the standardized CSV schema with column headers
              </span>
            </div>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-teal-200 text-[#008a90] font-bold text-xs hover:bg-teal-50 transition-colors shadow-2xs cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Template</span>
            </button>
          </div>

          {/* Warehouse Selector (Dynamic from DB / API) */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Initial Stock Destination Warehouse
            </label>
            <div className="relative">
              <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <select
                value={warehouseId}
                onChange={(e) => setWarehouseId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 pl-9 pr-3 py-2 bg-slate-50 focus:bg-white focus:outline-none cursor-pointer"
              >
                {warehouses.map((wh) => (
                  <option key={wh.id} value={wh.id}>
                    {wh.name} {wh.city ? `(${wh.city})` : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Drag & Drop Upload Zone */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Upload Spreadsheet File (.xlsx, .xls, .csv)
            </label>
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 text-center hover:border-[#008a90] hover:bg-teal-50/20 transition-all cursor-pointer relative">
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <Upload className="w-7 h-7 text-[#008a90] mx-auto mb-2" />
              <div className="font-semibold text-slate-700">
                {selectedFile ? selectedFile.name : 'Click to select or drag and drop file'}
              </div>
              <div className="text-[11px] text-slate-400 mt-1">
                Supports Excel (.xlsx, .xls) and Comma-Separated Values (.csv) up to 10MB
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Success Message */}
          {successCount !== null && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>Successfully imported {successCount} item(s) into database!</span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing || !selectedFile}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#008a90] hover:bg-[#00747a] text-white font-bold disabled:opacity-50 cursor-pointer shadow-md shadow-teal-950/20"
            >
              {isProcessing ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Importing...</span>
                </>
              ) : (
                <>
                  <Upload className="w-3.5 h-3.5" />
                  <span>Start Import</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
