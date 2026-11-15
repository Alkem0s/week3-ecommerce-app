# AI-Assisted Development Log

This document records how AI assistance was used collaboratively across planning, component generation, code evaluation, and debugging while building the **E-Commerce Catalog & Inventory Manager** (`week3-ecommerce-app`). All generated code was inspected, linted (`oxlint`), compiled (`vite build`), and verified visually across desktop and mobile viewports.

---

## Stage 1 — Architecture Planning & Data Model Design

- **Goal**: Define the screen architecture and client-side data model before writing application code.
- **How AI Was Used**:
  - Mapped out the four primary UI zones: sticky action header (`Header`), live metric cards (`KpiSummaryStrip`), search/filter/sort toolbar (`FilterToolbar`), and dual catalog presentation (`ProductCard` grid / `ProductTable` list) backed by `ProductFormModal`.
  - Structured the product schema (`id`, `sku`, `title`, `category`, `imageUrl`, `stock`, `lowStockThreshold`, `price`, `discountPercent`, `competitorPrice`, `isOnPromotion`, `seasonality`, `notes`, `updatedAt`) covering 9 fixed retail categories (`src/constants/categories.js`).
  - Kept all calculations (`getEffectivePrice`, `getCompetitorDelta`, `getStockStatus`) purely deterministic and computed client-side in `src/utils/pricing.js` with no mocked backend calls.

---

## Stage 2 — Project Scaffolding, Styling & LocalStorage Foundation

- **Goal**: Set up the Vite + React + Tailwind CSS project, starter catalog, header, and KPI strip.
- **How AI Was Used**:
  - Scaffolded the React Vite app, configured `@tailwindcss/vite`, and installed `lucide-react`.
  - Populated `src/constants/seedData.js` with 12 realistic starter SKUs across all 9 categories and bundled local product imagery under `public/samples/`.
  - Implemented `src/components/Header.jsx`, `src/components/KpiSummaryStrip.jsx`, and initial `src/utils/storage.js` helpers including **Reset Demo** restoration.

---

## Stage 3 — Core Interactive Catalog & CRUD Modal

- **Goal**: Implement Grid/Table switching, real-time filtering/sorting, inline stock adjustments, and product creation/editing.
- **How AI Was Used**:
  - Generated `FilterToolbar.jsx` supporting keyword search (`title`/`SKU`), category filtering, **Low Stock Only** and **On Promotion** toggles, multi-criteria sorting (`newest`, `price-asc`, `price-desc`, `stock-asc`, `stock-desc`), and Grid/Table layout toggling.
  - Built `ProductCard.jsx` and `ProductTable.jsx` sharing unified pricing and stock utilities (`src/utils/pricing.js`) with inline `-1` / `+1` stock steppers.
  - Built `ProductFormModal.jsx` supporting all product fields, image URL or local file upload, delete confirmation, and a live preview panel showing computed effective price, market comparison percentage, and inventory valuation prior to saving.

---

## Stage 4 — Code Evaluation & Edge-Case Hardening

- **Goal**: Audit early code for reliability, validation gaps, storage failure modes, and linter compliance.
- **Issues Caught & Fixes Applied**:
  1. **Form Validation (`ProductFormModal.jsx`)**: Switched form submission to `noValidate` + explicit `validate()` logic enforcing required `title` and `sku`, case-insensitive duplicate SKU prevention (`existingSkus`), `price > 0`, `0–99%` discount bounds, and non-negative numeric fields with inline error feedback.
  2. **Storage Resilience & Image Size (`storage.js`, `ProductFormModal.jsx`)**:
     - Added item-level schema sanitization (`loadProducts()` returning `{ products, recovered }`) so malformed JSON or corrupted `LocalStorage` objects fall back safely with a user-facing notice banner.
     - Caught `QuotaExceededError` in `saveProducts()` to surface actionable errors instead of crashing.
     - Added client-side canvas image resizing (`compressImageFile`, `480px` max, JPEG `0.82`) for local image uploads so `LocalStorage` stays well under browser quota limits.
     - Resolved an `oxlint` `eslint(no-constant-binary-expression)` warning on `lowStockThreshold` sanitization in `storage.js` using explicit `Number.isFinite(...)` checks so `0` thresholds remain valid while invalid values default to `10`.
  3. **Broken Image Fallback (`ProductImage.jsx`)**: Extracted `<ProductImage />` with `onError` state reset on `src` changes so invalid external URLs render a clean placeholder icon instead of broken browser frames.
  4. **Data Backup (`export.js`, `EmptyState.jsx`, `Header.jsx`)**: Added CSV (with proper quote escaping and computed effective price/stock status columns) and JSON catalog export actions alongside an actionable empty-state screen when filters return zero items.

---

## Stage 5 — Debugging & Responsive Polish

- **Goal**: Fix layout regressions on narrow screens, modal dismissal edge cases, and filter/KPI synchronization.
- **Bugs Diagnosed & Resolved**:
  1. **Mobile Table Horizontal Overflow (`ProductTable.jsx`, `App.jsx`)**: Added `min-w-0` on the flex-column `<main>` container and `w-full max-w-full min-w-0` + `overscroll-x-contain` on the table card wrapper, ensuring horizontal table scrolling remains strictly inside its container on `390px` mobile screens, plus a narrow-screen swipe hint banner.
  2. **Filter Bar Wrapping (`FilterToolbar.jsx`)**: Replaced `flex-col` + fixed select widths (`sm:w-64`, `sm:w-52`) that left awkward trailing space on tablet widths with `grid grid-cols-1 sm:grid-cols-2 lg:flex lg:items-center`.
  3. **Modal Escape, Backdrop & Stale State (`ProductFormModal.jsx`, `App.jsx`)**:
     - Added a `keydown` (`Escape`) listener with proper cleanup inside `ProductFormModal`.
     - Replaced `onClick` backdrop closing with `onMouseDown` checking `e.target === e.currentTarget` so dragging outside the dialog while selecting input text no longer dismisses the modal accidentally.
     - Added an incrementing `modalSession` key prop alongside conditional unmounting (`isModalOpen`) so opening **Add Product** after dismissing an edited item always mounts fresh initial state.
  4. **KPI Card Synchronization (`KpiSummaryStrip.jsx`, `FilterToolbar.jsx`)**: Converted the **Low-Stock Alerts** KPI card into an interactive button (`aria-pressed={lowStockOnly}`) synced with the **Low Stock Only** filter pill (with a live `lowStockCount` badge), guaranteeing immediate count updates across KPIs, filter badges, and visible rows on every inline `+1` / `-1` stock stepper click.

---

## Stage 6 — Verification, Screenshots & Documentation

- Verified production bundle integrity via `npm run lint` (`oxlint`: 0 warnings, 0 errors across 16 files) and `npm run build` (`vite build` cleanly bundling `dist/`).
- Captured desktop (`1440px`), filtered table, edit-modal preview, and mobile (`390px`) screenshots against the built `vite preview` server into `docs/screenshots/`.
- Authored [README.md](README.md) with setup instructions, static deployment guidance for Vercel/Netlify, embedded screenshots, and this development log.
