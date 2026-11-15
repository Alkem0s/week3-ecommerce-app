import { CATEGORIES, SEASONALITY_OPTIONS } from '../constants/categories';
import { SEED_PRODUCTS } from '../constants/seedData';

const STORAGE_KEY = 'ecommerce_catalog_v1';

function sanitizeProduct(item, index) {
  if (!item || typeof item !== 'object') return null;

  const title = typeof item.title === 'string' ? item.title.trim() : '';
  const sku = typeof item.sku === 'string' ? item.sku.trim().toUpperCase() : '';
  if (!title || !sku) return null;

  const category = CATEGORIES.includes(item.category)
    ? item.category
    : CATEGORIES[0];
  const seasonality = SEASONALITY_OPTIONS.includes(item.seasonality)
    ? item.seasonality
    : 'All-Season';

  const price = Math.max(0.01, Number(item.price) || 0.01);
  const discountPercent = Math.min(
    99,
    Math.max(0, Math.round(Number(item.discountPercent) || 0))
  );
  const competitorPrice = Math.max(0, Number(item.competitorPrice) || 0);
  const stock = Math.max(0, Math.floor(Number(item.stock) || 0));
  const hasThreshold =
    item.lowStockThreshold !== null &&
    item.lowStockThreshold !== undefined &&
    item.lowStockThreshold !== '';
  const parsedThreshold = hasThreshold ? Number(item.lowStockThreshold) : NaN;
  const lowStockThreshold = Number.isFinite(parsedThreshold)
    ? Math.max(0, Math.floor(parsedThreshold))
    : 10;

  return {
    id: typeof item.id === 'string' && item.id ? item.id : `prod-rec-${index}`,
    sku,
    title,
    category,
    imageUrl: typeof item.imageUrl === 'string' ? item.imageUrl : '',
    stock,
    lowStockThreshold,
    price,
    discountPercent,
    competitorPrice,
    isOnPromotion: Boolean(item.isOnPromotion),
    seasonality,
    notes: typeof item.notes === 'string' ? item.notes : '',
    updatedAt:
      typeof item.updatedAt === 'string'
        ? item.updatedAt
        : new Date().toISOString(),
  };
}

export function loadProducts() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = structuredClone(SEED_PRODUCTS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return { products: initial, recovered: false };
    }

    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      throw new Error('Stored catalog is not an array');
    }

    const sanitized = parsed
      .map((item, idx) => sanitizeProduct(item, idx))
      .filter(Boolean);

    if (sanitized.length !== parsed.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(sanitized));
      return { products: sanitized, recovered: true };
    }

    return { products: sanitized, recovered: false };
  } catch {
    const fallback = structuredClone(SEED_PRODUCTS);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fallback));
    } catch {
      // Ignore storage write failure in restricted contexts
    }
    return { products: fallback, recovered: true };
  }
}

export function saveProducts(products) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error:
        err?.name === 'QuotaExceededError'
          ? 'Browser storage quota exceeded. Try using an external image URL or a smaller uploaded image.'
          : 'Failed to save catalog changes to LocalStorage.',
    };
  }
}

export function resetDemoData() {
  const fresh = structuredClone(SEED_PRODUCTS);
  saveProducts(fresh);
  return fresh;
}
