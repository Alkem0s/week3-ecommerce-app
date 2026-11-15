export function getEffectivePrice(price, discountPercent = 0) {
  const safePrice = Number(price) || 0;
  const safeDiscount = Math.min(99, Math.max(0, Number(discountPercent) || 0));
  return Number((safePrice * (1 - safeDiscount / 100)).toFixed(2));
}

export function getCompetitorDelta(effectivePrice, competitorPrice) {
  const comp = Number(competitorPrice) || 0;
  if (comp <= 0) {
    return null;
  }
  const diffPercent = ((effectivePrice - comp) / comp) * 100;
  const rounded = Math.abs(diffPercent).toFixed(1);

  if (Math.abs(diffPercent) < 0.5) {
    return { status: 'matched', label: 'Market parity', diffPercent };
  }
  if (diffPercent < 0) {
    return { status: 'cheaper', label: `${rounded}% below market`, diffPercent };
  }
  return { status: 'higher', label: `${rounded}% above market`, diffPercent };
}

export function getStockStatus(stock, lowStockThreshold = 10) {
  const qty = Number(stock) || 0;
  const threshold = Number(lowStockThreshold) || 0;

  if (qty <= 0) {
    return {
      key: 'out',
      label: 'Out of Stock',
      badgeClass: 'bg-red-50 text-red-700 border-red-200',
    };
  }
  if (qty <= threshold) {
    return {
      key: 'low',
      label: 'Low Stock',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
    };
  }
  return {
    key: 'in',
    label: 'In Stock',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };
}

export function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);
}
