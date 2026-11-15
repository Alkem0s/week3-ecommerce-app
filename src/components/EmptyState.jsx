import { PackageOpen } from 'lucide-react';

export function EmptyState({ hasFilters, onClearFilters, onAddProduct }) {
  return (
    <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center">
      <div className="mx-auto h-12 w-12 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
        <PackageOpen className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-900">
        {hasFilters ? 'No products match your active filters' : 'Your catalog is empty'}
      </h3>
      <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
        {hasFilters
          ? 'Try adjusting your search keywords, category selection, or stock filter toggles.'
          : 'Add your first SKU to begin tracking inventory value, discounts, and stock thresholds.'}
      </p>
      <div className="mt-5 flex justify-center gap-3">
        {hasFilters ? (
          <button
            type="button"
            onClick={onClearFilters}
            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 cursor-pointer"
          >
            Clear All Filters
          </button>
        ) : (
          <button
            type="button"
            onClick={onAddProduct}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 cursor-pointer"
          >
            Add First Product
          </button>
        )}
      </div>
    </div>
  );
}
