import { getEffectivePrice, getStockStatus } from './pricing';

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeCsvCell(value) {
  const str = String(value ?? '');
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function exportCatalogAsJson(products) {
  const payload = JSON.stringify(products, null, 2);
  const blob = new Blob([payload], { type: 'application/json;charset=utf-8' });
  const dateStamp = new Date().toISOString().slice(0, 10);
  triggerDownload(blob, `ecommerce-catalog-${dateStamp}.json`);
}

export function exportCatalogAsCsv(products) {
  const headers = [
    'SKU',
    'Title',
    'Category',
    'Base Price',
    'Discount %',
    'Effective Price',
    'Competitor Price',
    'Stock',
    'Low Stock Threshold',
    'Stock Status',
    'On Promotion',
    'Seasonality',
    'Notes',
    'Updated At',
  ];

  const rows = products.map((p) => {
    const effPrice = getEffectivePrice(p.price, p.discountPercent);
    const stockInfo = getStockStatus(p.stock, p.lowStockThreshold);
    return [
      p.sku,
      p.title,
      p.category,
      Number(p.price || 0).toFixed(2),
      Number(p.discountPercent || 0),
      effPrice.toFixed(2),
      Number(p.competitorPrice || 0).toFixed(2),
      Number(p.stock || 0),
      Number(p.lowStockThreshold || 0),
      stockInfo.label,
      p.isOnPromotion ? 'Yes' : 'No',
      p.seasonality || 'All-Season',
      p.notes || '',
      p.updatedAt || '',
    ].map(escapeCsvCell);
  });

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const dateStamp = new Date().toISOString().slice(0, 10);
  triggerDownload(blob, `ecommerce-catalog-${dateStamp}.csv`);
}
