import { LayoutGrid, List, Search, Tag, AlertCircle, X } from 'lucide-react';
import { CATEGORIES } from '../constants/categories';

export function FilterToolbar({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  lowStockOnly,
  onToggleLowStock,
  lowStockCount = 0,
  promoOnly,
  onTogglePromo,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  filteredCount,
  totalCount,
  onClearFilters,
}) {
  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedCategory !== 'All' ||
    lowStockOnly ||
    promoOnly;

  return (
    <section
      aria-label="Catalog Filters and Sorting"
      className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs space-y-3"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:items-center gap-3">
        {/* Search Input */}
        <div className="relative sm:col-span-2 lg:flex-1 min-w-0">
          <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by product title or SKU..."
            className="w-full pl-9 pr-8 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-500"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Category Select */}
        <div className="w-full lg:w-60 shrink-0">
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value)}
            aria-label="Filter by category"
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-500"
          >
            <option value="All">All Categories (9)</option>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Select */}
        <div className="w-full lg:w-48 shrink-0">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            aria-label="Sort catalog"
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-500"
          >
            <option value="newest">Sort: Newest Updated</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="stock-asc">Stock: Low to High</option>
            <option value="stock-desc">Stock: High to Low</option>
          </select>
        </div>

        {/* View Mode Switcher */}
        <div className="sm:col-span-2 lg:w-auto flex items-center justify-between lg:justify-end gap-2 shrink-0">
          <span className="text-xs font-medium text-slate-500 lg:hidden">
            Catalog layout
          </span>
          <div className="inline-flex rounded-lg border border-slate-300 p-0.5 bg-slate-100">
            <button
              type="button"
              onClick={() => onViewModeChange('grid')}
              aria-label="Grid view"
              aria-pressed={viewMode === 'grid'}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Grid
            </button>
            <button
              type="button"
              onClick={() => onViewModeChange('table')}
              aria-label="Table view"
              aria-pressed={viewMode === 'table'}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="h-3.5 w-3.5" />
              Table
            </button>
          </div>
        </div>
      </div>

      {/* Quick Filter Toggles & Result Count */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2.5 pt-2 border-t border-slate-100">
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={onToggleLowStock}
            aria-pressed={lowStockOnly}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
              lowStockOnly
                ? 'bg-amber-50 text-amber-800 border-amber-300'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <AlertCircle className="h-3.5 w-3.5" />
            Low Stock Only
            <span
              className={`ml-0.5 px-1.5 py-0.2 rounded-full text-[11px] font-semibold ${
                lowStockOnly
                  ? 'bg-amber-200/80 text-amber-900'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {lowStockCount}
            </span>
          </button>

          <button
            type="button"
            onClick={onTogglePromo}
            aria-pressed={promoOnly}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
              promoOnly
                ? 'bg-indigo-50 text-indigo-700 border-indigo-300'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Tag className="h-3.5 w-3.5" />
            On Promotion
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onClearFilters}
              className="text-xs font-medium text-slate-500 hover:text-slate-800 underline underline-offset-2 px-1 cursor-pointer"
            >
              Clear filters
            </button>
          )}
        </div>

        <p className="text-xs text-slate-500 sm:text-right">
          Showing <span className="font-semibold text-slate-800">{filteredCount}</span> of{' '}
          <span className="font-semibold text-slate-800">{totalCount}</span> SKUs
        </p>
      </div>
    </section>
  );
}
