import { useMemo, useState } from 'react';
import { EmptyState } from './components/EmptyState';
import { FilterToolbar } from './components/FilterToolbar';
import { Header } from './components/Header';
import { KpiSummaryStrip } from './components/KpiSummaryStrip';
import { ProductCard } from './components/ProductCard';
import { ProductFormModal } from './components/ProductFormModal';
import { ProductTable } from './components/ProductTable';
import { exportCatalogAsCsv, exportCatalogAsJson } from './utils/export';
import { getEffectivePrice } from './utils/pricing';
import { loadProducts, resetDemoData, saveProducts } from './utils/storage';

export default function App() {
  const [initialLoad] = useState(() => loadProducts());
  const [products, setProducts] = useState(initialLoad.products);
  const [notice, setNotice] = useState(
    initialLoad.recovered
      ? {
          type: 'warning',
          text: 'Corrupted LocalStorage entries were detected and safely recovered.',
        }
      : null
  );

  // Filter & view state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [promoOnly, setPromoOnly] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [modalSession, setModalSession] = useState(0);

  const showNotice = (text, type = 'info') => {
    setNotice({ text, type });
    setTimeout(() => setNotice(null), 4000);
  };

  const commitProducts = (nextProducts, successMsg) => {
    const result = saveProducts(nextProducts);
    if (!result.ok) {
      showNotice(result.error, 'error');
      return false;
    }
    setProducts(nextProducts);
    if (successMsg) showNotice(successMsg, 'info');
    return true;
  };

  const handleResetDemo = () => {
    const fresh = resetDemoData();
    setProducts(fresh);
    showNotice('Starter catalog restored (12 sample products across 9 categories).');
  };

  const handleAdjustStock = (id, delta) => {
    const next = products.map((item) => {
      if (item.id !== id) return item;
      const updatedStock = Math.max(0, (Number(item.stock) || 0) + delta);
      return {
        ...item,
        stock: updatedStock,
        updatedAt: new Date().toISOString(),
      };
    });
    commitProducts(next);
  };

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setModalSession((s) => s + 1);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (product) => {
    setEditingProduct(product);
    setModalSession((s) => s + 1);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSaveProduct = (formValues) => {
    const now = new Date().toISOString();
    if (editingProduct) {
      const next = products.map((p) =>
        p.id === editingProduct.id ? { ...p, ...formValues, updatedAt: now } : p
      );
      if (commitProducts(next, `Updated "${formValues.title}".`)) {
        handleCloseModal();
      }
    } else {
      const newProduct = {
        ...formValues,
        id: `prod-${Date.now()}`,
        updatedAt: now,
      };
      const next = [newProduct, ...products];
      if (commitProducts(next, `Added "${formValues.title}" to catalog.`)) {
        handleCloseModal();
      }
    }
  };

  const handleDeleteProduct = (id) => {
    const target = products.find((p) => p.id === id);
    const next = products.filter((p) => p.id !== id);
    if (commitProducts(next, target ? `Removed "${target.title}".` : 'Product removed.')) {
      handleCloseModal();
    }
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setLowStockOnly(false);
    setPromoOnly(false);
  };

  const existingSkus = useMemo(() => products.map((p) => p.sku), [products]);

  const lowStockCount = useMemo(
    () =>
      products.filter(
        (p) => (Number(p.stock) || 0) <= (Number(p.lowStockThreshold) || 0)
      ).length,
    [products]
  );

  const filteredProducts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const matched = products.filter((p) => {
      if (q) {
        const titleMatch = p.title.toLowerCase().includes(q);
        const skuMatch = p.sku.toLowerCase().includes(q);
        if (!titleMatch && !skuMatch) return false;
      }
      if (selectedCategory !== 'All' && p.category !== selectedCategory) {
        return false;
      }
      if (
        lowStockOnly &&
        (Number(p.stock) || 0) > (Number(p.lowStockThreshold) || 0)
      ) {
        return false;
      }
      if (promoOnly && !p.isOnPromotion) {
        return false;
      }
      return true;
    });

    return [...matched].sort((a, b) => {
      if (sortBy === 'price-asc') {
        return (
          getEffectivePrice(a.price, a.discountPercent) -
          getEffectivePrice(b.price, b.discountPercent)
        );
      }
      if (sortBy === 'price-desc') {
        return (
          getEffectivePrice(b.price, b.discountPercent) -
          getEffectivePrice(a.price, a.discountPercent)
        );
      }
      if (sortBy === 'stock-asc') {
        return (Number(a.stock) || 0) - (Number(b.stock) || 0);
      }
      if (sortBy === 'stock-desc') {
        return (Number(b.stock) || 0) - (Number(a.stock) || 0);
      }
      return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0);
    });
  }, [products, searchQuery, selectedCategory, lowStockOnly, promoOnly, sortBy]);

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    selectedCategory !== 'All' ||
    lowStockOnly ||
    promoOnly;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      <Header
        totalProducts={products.length}
        onResetDemo={handleResetDemo}
        onOpenAddModal={handleOpenAdd}
        onExportJson={() => {
          exportCatalogAsJson(products);
          showNotice('Catalog exported as JSON.');
        }}
        onExportCsv={() => {
          exportCatalogAsCsv(products);
          showNotice('Catalog exported as CSV.');
        }}
      />

      <main className="max-w-7xl w-full min-w-0 mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-1">
        {notice && (
          <div
            role="status"
            className={`rounded-lg border px-4 py-2.5 text-sm shadow-xs ${
              notice.type === 'error'
                ? 'border-rose-200 bg-rose-50 text-rose-800'
                : notice.type === 'warning'
                  ? 'border-amber-200 bg-amber-50 text-amber-800'
                  : 'border-slate-200 bg-white text-slate-700'
            }`}
          >
            {notice.text}
          </div>
        )}

        <KpiSummaryStrip
          products={products}
          lowStockOnly={lowStockOnly}
          onToggleLowStock={() => setLowStockOnly((v) => !v)}
        />

        <FilterToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          lowStockOnly={lowStockOnly}
          onToggleLowStock={() => setLowStockOnly((v) => !v)}
          lowStockCount={lowStockCount}
          promoOnly={promoOnly}
          onTogglePromo={() => setPromoOnly((v) => !v)}
          sortBy={sortBy}
          onSortChange={setSortBy}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          filteredCount={filteredProducts.length}
          totalCount={products.length}
          onClearFilters={handleClearFilters}
        />

        {filteredProducts.length === 0 ? (
          <EmptyState
            hasFilters={hasActiveFilters}
            onClearFilters={handleClearFilters}
            onAddProduct={handleOpenAdd}
          />
        ) : viewMode === 'grid' ? (
          <section
            aria-label="Product Grid"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
          >
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAdjustStock={handleAdjustStock}
                onEdit={handleOpenEdit}
                onDelete={handleDeleteProduct}
              />
            ))}
          </section>
        ) : (
          <ProductTable
            products={filteredProducts}
            onAdjustStock={handleAdjustStock}
            onEdit={handleOpenEdit}
            onDelete={handleDeleteProduct}
          />
        )}
      </main>

      {isModalOpen && (
        <ProductFormModal
          key={
            editingProduct
              ? `edit-${editingProduct.id}-${modalSession}`
              : `new-${modalSession}`
          }
          isOpen={isModalOpen}
          editingProduct={editingProduct}
          existingSkus={existingSkus}
          onClose={handleCloseModal}
          onSave={handleSaveProduct}
          onDelete={handleDeleteProduct}
        />
      )}
    </div>
  );
}
