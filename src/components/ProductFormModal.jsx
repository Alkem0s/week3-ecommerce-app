import { useEffect, useState } from 'react';
import { AlertCircle, Trash2, Upload, X } from 'lucide-react';
import { CATEGORIES, SEASONALITY_OPTIONS } from '../constants/categories';
import {
  formatCurrency,
  getCompetitorDelta,
  getEffectivePrice,
  getStockStatus,
} from '../utils/pricing';
import { ProductImage } from './ProductImage';

const INITIAL_FORM = {
  sku: '',
  title: '',
  category: CATEGORIES[0],
  imageUrl: '/samples/electronics-1.jpg',
  stock: 10,
  lowStockThreshold: 10,
  price: 29.99,
  discountPercent: 0,
  competitorPrice: 29.99,
  isOnPromotion: false,
  seasonality: 'All-Season',
  notes: '',
};

function compressImageFile(file, maxSize = 480) {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      reject(new Error('Please select a valid image file (PNG, JPG, WebP).'));
      return;
    }
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read selected file.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Unsupported or corrupted image file.'));
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const width = Math.max(1, Math.round(img.width * scale));
        const height = Math.max(1, Math.round(img.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', 0.82));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

export function ProductFormModal({
  isOpen,
  editingProduct,
  existingSkus = [],
  onClose,
  onSave,
  onDelete,
}) {
  const [formData, setFormData] = useState(() =>
    editingProduct
      ? {
          sku: editingProduct.sku || '',
          title: editingProduct.title || '',
          category: editingProduct.category || CATEGORIES[0],
          imageUrl: editingProduct.imageUrl || '',
          stock: editingProduct.stock ?? 0,
          lowStockThreshold: editingProduct.lowStockThreshold ?? 10,
          price: editingProduct.price ?? 0,
          discountPercent: editingProduct.discountPercent ?? 0,
          competitorPrice: editingProduct.competitorPrice ?? 0,
          isOnPromotion: Boolean(editingProduct.isOnPromotion),
          seasonality: editingProduct.seasonality || 'All-Season',
          notes: editingProduct.notes || '',
        }
      : { ...INITIAL_FORM }
  );
  const [errors, setErrors] = useState({});
  const [uploadError, setUploadError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (!isOpen) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const previewPrice = Math.max(0, Number(formData.price) || 0);
  const previewDiscount = Math.min(
    99,
    Math.max(0, Number(formData.discountPercent) || 0)
  );
  const previewStock = Math.max(0, Math.floor(Number(formData.stock) || 0));
  const previewThreshold = Math.max(
    0,
    Math.floor(Number(formData.lowStockThreshold) || 0)
  );
  const previewCompPrice = Math.max(0, Number(formData.competitorPrice) || 0);

  const effectivePrice = getEffectivePrice(previewPrice, previewDiscount);
  const compDelta = getCompetitorDelta(effectivePrice, previewCompPrice);
  const stockStatus = getStockStatus(previewStock, previewThreshold);

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError('');
    try {
      const compressedDataUrl = await compressImageFile(file, 480);
      handleChange('imageUrl', compressedDataUrl);
    } catch (err) {
      setUploadError(err.message || 'Image upload failed.');
    } finally {
      e.target.value = '';
    }
  };

  const validate = () => {
    const nextErrors = {};
    const cleanTitle = formData.title.trim();
    const cleanSku = formData.sku.trim().toUpperCase();

    if (!cleanTitle) {
      nextErrors.title = 'Product title is required.';
    }
    if (!cleanSku) {
      nextErrors.sku = 'SKU is required.';
    } else {
      const isDuplicate = existingSkus.some(
        (sku) =>
          sku.toUpperCase() === cleanSku &&
          (!editingProduct || editingProduct.sku.toUpperCase() !== cleanSku)
      );
      if (isDuplicate) {
        nextErrors.sku = `SKU "${cleanSku}" already exists.`;
      }
    }

    const priceNum = Number(formData.price);
    if (!Number.isFinite(priceNum) || priceNum <= 0) {
      nextErrors.price = 'Price must be greater than $0.';
    }

    const discNum = Number(formData.discountPercent);
    if (!Number.isFinite(discNum) || discNum < 0 || discNum > 99) {
      nextErrors.discountPercent = 'Discount must be between 0% and 99%.';
    }

    const compNum = Number(formData.competitorPrice);
    if (!Number.isFinite(compNum) || compNum < 0) {
      nextErrors.competitorPrice = 'Competitor price cannot be negative.';
    }

    const stockNum = Number(formData.stock);
    if (!Number.isFinite(stockNum) || stockNum < 0) {
      nextErrors.stock = 'Stock units cannot be negative.';
    }

    const threshNum = Number(formData.lowStockThreshold);
    if (!Number.isFinite(threshNum) || threshNum < 0) {
      nextErrors.lowStockThreshold = 'Threshold cannot be negative.';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      ...formData,
      sku: formData.sku.trim().toUpperCase(),
      title: formData.title.trim(),
      imageUrl: formData.imageUrl.trim(),
      stock: Math.max(0, Math.floor(Number(formData.stock) || 0)),
      lowStockThreshold: Math.max(
        0,
        Math.floor(Number(formData.lowStockThreshold) || 0)
      ),
      price: Number(Number(formData.price).toFixed(2)),
      discountPercent: Math.min(
        99,
        Math.max(0, Math.round(Number(formData.discountPercent) || 0))
      ),
      competitorPrice: Math.max(
        0,
        Number(Number(formData.competitorPrice || 0).toFixed(2))
      ),
      notes: formData.notes.trim(),
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/50 backdrop-blur-xs"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 id="modal-title" className="text-lg font-semibold text-slate-900">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </h2>
            <p className="text-xs text-slate-500">
              Changes persist directly to LocalStorage
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} noValidate className="overflow-y-auto p-6 space-y-5">
          {/* Identity */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Product Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="e.g., Wireless Noise-Canceling Headphones"
                className={`w-full px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 ${
                  errors.title
                    ? 'border-rose-400 focus:ring-rose-500/20'
                    : 'border-slate-300 focus:ring-slate-900/15 focus:border-slate-500'
                }`}
              />
              {errors.title && (
                <p className="mt-1 text-xs text-rose-600">{errors.title}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                SKU *
              </label>
              <input
                type="text"
                value={formData.sku}
                onChange={(e) => handleChange('sku', e.target.value)}
                placeholder="EL-1042"
                className={`w-full px-3 py-2 text-sm font-mono rounded-lg border focus:outline-none focus:ring-2 ${
                  errors.sku
                    ? 'border-rose-400 focus:ring-rose-500/20'
                    : 'border-slate-300 focus:ring-slate-900/15 focus:border-slate-500'
                }`}
              />
              {errors.sku && (
                <p className="mt-1 text-xs text-rose-600">{errors.sku}</p>
              )}
            </div>
          </div>

          {/* Category & Seasonality */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-500"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Seasonality
              </label>
              <select
                value={formData.seasonality}
                onChange={(e) => handleChange('seasonality', e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-500"
              >
                {SEASONALITY_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Image URL or Local Upload + Preview */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <ProductImage
                src={formData.imageUrl}
                alt="Product preview"
                className="h-20 w-20 rounded-lg object-contain border border-slate-200 bg-white p-1 shrink-0"
                iconClassName="h-6 w-6"
              />
              <div className="flex-1 w-full space-y-2">
                <label className="block text-xs font-medium text-slate-700">
                  Product Image URL or Upload File (Auto-resized for storage safety)
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={formData.imageUrl}
                    onChange={(e) => handleChange('imageUrl', e.target.value)}
                    placeholder="https://... or /samples/electronics-1.jpg"
                    className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/15"
                  />
                  <label className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 cursor-pointer shrink-0">
                    <Upload className="h-3.5 w-3.5" />
                    Upload
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
            {uploadError && (
              <p className="inline-flex items-center gap-1.5 text-xs text-rose-600">
                <AlertCircle className="h-3.5 w-3.5" />
                {uploadError}
              </p>
            )}
          </div>

          {/* Pricing & Inventory */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Base Price ($)
              </label>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={formData.price}
                onChange={(e) => handleChange('price', e.target.value)}
                className={`w-full px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 ${
                  errors.price
                    ? 'border-rose-400 focus:ring-rose-500/20'
                    : 'border-slate-300 focus:ring-slate-900/15'
                }`}
              />
              {errors.price && (
                <p className="mt-1 text-[11px] text-rose-600">{errors.price}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Discount (%)
              </label>
              <input
                type="number"
                min="0"
                max="99"
                step="1"
                value={formData.discountPercent}
                onChange={(e) => handleChange('discountPercent', e.target.value)}
                className={`w-full px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 ${
                  errors.discountPercent
                    ? 'border-rose-400 focus:ring-rose-500/20'
                    : 'border-slate-300 focus:ring-slate-900/15'
                }`}
              />
              {errors.discountPercent && (
                <p className="mt-1 text-[11px] text-rose-600">
                  {errors.discountPercent}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Competitor ($)
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.competitorPrice}
                onChange={(e) => handleChange('competitorPrice', e.target.value)}
                className={`w-full px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 ${
                  errors.competitorPrice
                    ? 'border-rose-400 focus:ring-rose-500/20'
                    : 'border-slate-300 focus:ring-slate-900/15'
                }`}
              />
              {errors.competitorPrice && (
                <p className="mt-1 text-[11px] text-rose-600">
                  {errors.competitorPrice}
                </p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Stock Units
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={formData.stock}
                onChange={(e) => handleChange('stock', e.target.value)}
                className={`w-full px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 ${
                  errors.stock
                    ? 'border-rose-400 focus:ring-rose-500/20'
                    : 'border-slate-300 focus:ring-slate-900/15'
                }`}
              />
              {errors.stock && (
                <p className="mt-1 text-[11px] text-rose-600">{errors.stock}</p>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Alert At
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={formData.lowStockThreshold}
                onChange={(e) => handleChange('lowStockThreshold', e.target.value)}
                className={`w-full px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2 ${
                  errors.lowStockThreshold
                    ? 'border-rose-400 focus:ring-rose-500/20'
                    : 'border-slate-300 focus:ring-slate-900/15'
                }`}
              />
              {errors.lowStockThreshold && (
                <p className="mt-1 text-[11px] text-rose-600">
                  {errors.lowStockThreshold}
                </p>
              )}
            </div>
          </div>

          {/* Live Calculation Preview */}
          <div className="rounded-xl bg-slate-900 text-white p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <p className="text-slate-400">Calculated Effective Price</p>
              <p className="mt-0.5 text-base font-bold">
                {formatCurrency(effectivePrice)}
              </p>
            </div>
            <div>
              <p className="text-slate-400">Competitor Comparison</p>
              <p className="mt-0.5 text-sm font-semibold">
                {compDelta ? compDelta.label : 'No competitor price set'}
              </p>
            </div>
            <div>
              <p className="text-slate-400">Inventory Valuation</p>
              <p className="mt-0.5 text-sm font-semibold">
                {formatCurrency(effectivePrice * previewStock)} ({stockStatus.label})
              </p>
            </div>
          </div>

          {/* Promo Checkbox & Notes */}
          <div className="space-y-3">
            <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isOnPromotion}
                onChange={(e) => handleChange('isOnPromotion', e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
              />
              Mark as On Active Promotion
            </label>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Merchandising Notes
              </label>
              <textarea
                rows={2}
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                placeholder="Supplier notes, restock ETA, or packaging specifications..."
                className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/15"
              />
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
            <div>
              {editingProduct &&
                (confirmDelete ? (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onDelete(editingProduct.id)}
                      className="px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 cursor-pointer"
                    >
                      Confirm Delete
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="text-xs text-slate-500 hover:text-slate-800 cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-rose-600 hover:bg-rose-50 cursor-pointer"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Product
                  </button>
                ))}
            </div>

            <div className="flex items-center gap-2.5 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-lg text-sm font-medium text-white bg-slate-900 hover:bg-slate-800 cursor-pointer"
              >
                {editingProduct ? 'Save Changes' : 'Create Product'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
