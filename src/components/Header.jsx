import { Download, FileSpreadsheet, Package, Plus, RotateCcw } from 'lucide-react';

export function Header({
  totalProducts,
  onResetDemo,
  onOpenAddModal,
  onExportJson,
  onExportCsv,
}) {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm shrink-0">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-semibold text-slate-900 tracking-tight">
              E-Commerce Catalog &amp; Inventory Manager
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              {totalProducts} active SKUs synced locally via LocalStorage
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onExportCsv}
            disabled={totalProducts === 0}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="h-4 w-4 text-slate-500" />
            Export CSV
          </button>

          <button
            type="button"
            onClick={onExportJson}
            disabled={totalProducts === 0}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            <Download className="h-4 w-4 text-slate-500" />
            Export JSON
          </button>

          <button
            type="button"
            onClick={onResetDemo}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 active:bg-slate-100 transition-colors cursor-pointer"
          >
            <RotateCcw className="h-4 w-4 text-slate-500" />
            Reset Demo
          </button>

          <button
            type="button"
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs sm:text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 active:bg-slate-950 transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </button>
        </div>
      </div>
    </header>
  );
}
