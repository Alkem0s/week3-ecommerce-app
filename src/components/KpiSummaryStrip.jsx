import { AlertTriangle, Boxes, DollarSign, Layers } from 'lucide-react';
import { formatCurrency, getEffectivePrice } from '../utils/pricing';

export function KpiSummaryStrip({
  products,
  lowStockOnly = false,
  onToggleLowStock,
}) {
  const totalSkus = products.length;
  const totalUnits = products.reduce((sum, p) => sum + (Number(p.stock) || 0), 0);
  const totalValue = products.reduce((sum, p) => {
    const effPrice = getEffectivePrice(p.price, p.discountPercent);
    return sum + effPrice * (Number(p.stock) || 0);
  }, 0);

  const lowStockItems = products.filter(
    (p) => (Number(p.stock) || 0) <= (Number(p.lowStockThreshold) || 0)
  );
  const outOfStockCount = products.filter((p) => (Number(p.stock) || 0) <= 0).length;
  const categoryCount = new Set(products.map((p) => p.category)).size;

  const cards = [
    {
      label: 'Total SKUs',
      value: totalSkus.toLocaleString(),
      subtext: `Across ${categoryCount} categories`,
      icon: Layers,
      iconBg: 'bg-blue-50 text-blue-600',
      borderClass: 'border-slate-200',
    },
    {
      label: 'Total Stock Units',
      value: totalUnits.toLocaleString(),
      subtext: 'Available inventory count',
      icon: Boxes,
      iconBg: 'bg-emerald-50 text-emerald-600',
      borderClass: 'border-slate-200',
    },
    {
      label: 'Total Inventory Value',
      value: formatCurrency(totalValue),
      subtext: 'Calculated at effective price',
      icon: DollarSign,
      iconBg: 'bg-indigo-50 text-indigo-600',
      borderClass: 'border-slate-200',
    },
    {
      label: 'Low-Stock Alerts',
      value: lowStockItems.length.toLocaleString(),
      subtext: lowStockOnly
        ? 'Showing low-stock SKUs (click to show all)'
        : outOfStockCount > 0
          ? `${outOfStockCount} out of stock · Click to filter`
          : 'Click to filter low-stock SKUs',
      icon: AlertTriangle,
      iconBg: lowStockOnly
        ? 'bg-amber-100 text-amber-700'
        : lowStockItems.length > 0
          ? 'bg-amber-50 text-amber-600'
          : 'bg-slate-100 text-slate-500',
      borderClass: lowStockOnly
        ? 'border-amber-400 ring-2 ring-amber-400/30 bg-amber-50/40'
        : lowStockItems.length > 0
          ? 'border-amber-200 hover:border-amber-300'
          : 'border-slate-200 hover:border-slate-300',
      onClick: onToggleLowStock,
      pressed: lowStockOnly,
    },
  ];

  return (
    <section
      aria-label="Inventory Summary KPIs"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {cards.map((card) => {
        const Icon = card.icon;
        const content = (
          <>
            <div className="min-w-0 text-left">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                {card.label}
              </p>
              <p className="mt-1.5 text-2xl font-bold text-slate-900 truncate">
                {card.value}
              </p>
              <p className="mt-1 text-xs text-slate-500 truncate">{card.subtext}</p>
            </div>
            <div className={`p-2.5 rounded-lg shrink-0 ${card.iconBg}`}>
              <Icon className="h-5 w-5" />
            </div>
          </>
        );

        if (card.onClick) {
          return (
            <button
              key={card.label}
              type="button"
              onClick={card.onClick}
              aria-pressed={card.pressed}
              className={`w-full bg-white rounded-xl border ${card.borderClass} p-5 shadow-xs flex items-start justify-between gap-4 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500/40`}
            >
              {content}
            </button>
          );
        }

        return (
          <div
            key={card.label}
            className={`bg-white rounded-xl border ${card.borderClass} p-5 shadow-xs flex items-start justify-between gap-4`}
          >
            {content}
          </div>
        );
      })}
    </section>
  );
}
