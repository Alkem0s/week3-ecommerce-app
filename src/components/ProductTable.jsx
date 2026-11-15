import { Edit2, Minus, Plus, Tag, Trash2 } from 'lucide-react';
import { CATEGORY_STYLES } from '../constants/categories';
import {
  formatCurrency,
  getCompetitorDelta,
  getEffectivePrice,
  getStockStatus,
} from '../utils/pricing';
import { ProductImage } from './ProductImage';

export function ProductTable({ products, onAdjustStock, onEdit, onDelete }) {
  return (
    <div className="w-full max-w-full min-w-0 bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      <div className="md:hidden px-4 py-2 bg-slate-50 border-b border-slate-200 text-[11px] font-medium text-slate-500">
        Swipe horizontally to inspect all inventory columns →
      </div>
      <div className="w-full max-w-full overflow-x-auto overscroll-x-contain">
        <table className="w-full text-left border-collapse min-w-[760px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              <th className="py-3 px-3">Product</th>
              <th className="py-3 px-3">Category</th>
              <th className="py-3 px-3">Effective Price</th>
              <th className="py-3 px-3">Market Comparison</th>
              <th className="py-3 px-3">Stock Level</th>
              <th className="py-3 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-sm">
            {products.map((product) => {
              const effectivePrice = getEffectivePrice(
                product.price,
                product.discountPercent
              );
              const compDelta = getCompetitorDelta(
                effectivePrice,
                product.competitorPrice
              );
              const stockInfo = getStockStatus(
                product.stock,
                product.lowStockThreshold
              );
              const categoryBadge =
                CATEGORY_STYLES[product.category] ||
                'bg-slate-100 text-slate-700 border-slate-200';

              return (
                <tr
                  key={product.id}
                  className="hover:bg-slate-50/80 transition-colors"
                >
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-3">
                      <ProductImage
                        src={product.imageUrl}
                        alt={product.title}
                        className="h-11 w-11 rounded-lg object-contain border border-slate-200 bg-white p-0.5 shrink-0"
                        iconClassName="h-4 w-4"
                      />
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900 truncate max-w-[230px]">
                          {product.title}
                        </p>
                        <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
                          <span className="font-mono">{product.sku}</span>
                          <span>•</span>
                          <span>{product.seasonality}</span>
                          {product.isOnPromotion && (
                            <span className="inline-flex items-center gap-0.5 text-indigo-600 font-medium">
                              <Tag className="h-3 w-3" />
                              Promo
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-3 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${categoryBadge}`}
                    >
                      {product.category}
                    </span>
                  </td>

                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-semibold text-slate-900">
                        {formatCurrency(effectivePrice)}
                      </span>
                      {product.discountPercent > 0 && (
                        <>
                          <span className="text-xs text-slate-400 line-through">
                            {formatCurrency(product.price)}
                          </span>
                          <span className="text-[11px] font-semibold text-rose-600">
                            -{product.discountPercent}%
                          </span>
                        </>
                      )}
                    </div>
                  </td>

                  <td className="py-3 px-3 whitespace-nowrap">
                    {compDelta ? (
                      <div className="space-y-0.5">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                            compDelta.status === 'cheaper'
                              ? 'bg-emerald-50 text-emerald-700'
                              : compDelta.status === 'higher'
                                ? 'bg-amber-50 text-amber-700'
                                : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {compDelta.label}
                        </span>
                        <p className="text-[11px] text-slate-400">
                          Ref: {formatCurrency(product.competitorPrice)}
                        </p>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>

                  <td className="py-3 px-3 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50">
                        <button
                          type="button"
                          onClick={() => onAdjustStock(product.id, -1)}
                          disabled={product.stock <= 0}
                          aria-label={`Decrease stock for ${product.title}`}
                          className="p-1 text-slate-600 hover:bg-slate-200/70 disabled:opacity-40 disabled:pointer-events-none rounded-l-lg cursor-pointer"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="px-2 text-xs font-semibold text-slate-800 min-w-[2rem] text-center">
                          {product.stock}
                        </span>
                        <button
                          type="button"
                          onClick={() => onAdjustStock(product.id, 1)}
                          aria-label={`Increase stock for ${product.title}`}
                          className="p-1 text-slate-600 hover:bg-slate-200/70 rounded-r-lg cursor-pointer"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <span
                        className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium border ${stockInfo.badgeClass}`}
                      >
                        {stockInfo.label}
                      </span>
                    </div>
                  </td>

                  <td className="py-3 px-3 whitespace-nowrap text-right">
                    <div className="inline-flex items-center gap-1">
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
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
