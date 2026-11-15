import { Edit2, Minus, Plus, Tag, Trash2 } from 'lucide-react';
import { CATEGORY_STYLES } from '../constants/categories';
import {
  formatCurrency,
  getCompetitorDelta,
  getEffectivePrice,
  getStockStatus,
} from '../utils/pricing';
import { ProductImage } from './ProductImage';

export function ProductCard({ product, onAdjustStock, onEdit, onDelete }) {
  const effectivePrice = getEffectivePrice(product.price, product.discountPercent);
  const compDelta = getCompetitorDelta(effectivePrice, product.competitorPrice);
  const stockInfo = getStockStatus(product.stock, product.lowStockThreshold);
  const categoryBadge =
    CATEGORY_STYLES[product.category] ||
    'bg-slate-100 text-slate-700 border-slate-200';

  return (
    <article className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden flex flex-col hover:border-slate-300 transition-colors">
      {/* Product Image Header */}
      <div className="relative aspect-[4/3] bg-slate-100 border-b border-slate-100 overflow-hidden">
        <ProductImage
          src={product.imageUrl}
          alt={product.title}
          className="w-full h-full object-contain bg-white p-2"
          iconClassName="h-8 w-8"
        />
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5">
          {product.isOnPromotion && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-600 text-white shadow-xs">
              <Tag className="h-3 w-3" />
              Promo
            </span>
          )}
          {product.discountPercent > 0 && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-600 text-white shadow-xs">
              -{product.discountPercent}%
            </span>
          )}
        </div>
        <span className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-white/90 text-slate-700 border border-slate-200 backdrop-blur-xs">
          {product.seasonality}
        </span>
      </div>

      {/* Body */}
      <div className="p-4 flex-1 flex flex-col gap-3">
        <div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-mono text-slate-500">{product.sku}</span>
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${stockInfo.badgeClass}`}
            >
              {stockInfo.label}
            </span>
          </div>
          <h3 className="mt-1.5 text-sm font-semibold text-slate-900 line-clamp-2 leading-snug">
            {product.title}
          </h3>
          <span
            className={`mt-2 inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border ${categoryBadge}`}
          >
            {product.category}
          </span>
        </div>

        {/* Pricing & Competitor Comparison */}
        <div className="pt-2 border-t border-slate-100 space-y-1.5">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-slate-900">
              {formatCurrency(effectivePrice)}
            </span>
            {product.discountPercent > 0 && (
              <span className="text-xs text-slate-400 line-through">
                {formatCurrency(product.price)}
              </span>
            )}
          </div>

          {compDelta && (
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">
                Competitor: {formatCurrency(product.competitorPrice)}
              </span>
              <span
                className={`font-medium px-1.5 py-0.5 rounded ${
                  compDelta.status === 'cheaper'
                    ? 'bg-emerald-50 text-emerald-700'
                    : compDelta.status === 'higher'
                      ? 'bg-amber-50 text-amber-700'
                      : 'bg-slate-100 text-slate-600'
                }`}
              >
                {compDelta.label}
              </span>
            </div>
          )}
        </div>

        {product.notes && (
          <p className="text-xs text-slate-500 line-clamp-2">{product.notes}</p>
        )}

        {/* Footer Controls */}
        <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          {/* Quick Stock Stepper */}
          <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50">
            <button
              type="button"
              onClick={() => onAdjustStock(product.id, -1)}
              disabled={product.stock <= 0}
              aria-label={`Decrease stock for ${product.title}`}
              className="p-1.5 text-slate-600 hover:bg-slate-200/70 disabled:opacity-40 disabled:pointer-events-none rounded-l-lg transition-colors cursor-pointer"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>
            <span className="px-2.5 text-xs font-semibold text-slate-800 min-w-[2.5rem] text-center">
              {product.stock}
            </span>
            <button
              type="button"
              onClick={() => onAdjustStock(product.id, 1)}
              aria-label={`Increase stock for ${product.title}`}
              className="p-1.5 text-slate-600 hover:bg-slate-200/70 rounded-r-lg transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onEdit(product)}
              aria-label={`Edit ${product.title}`}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(product.id)}
              aria-label={`Delete ${product.title}`}
              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
