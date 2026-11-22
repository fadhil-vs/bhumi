/**
 * Bhumi Foods — Product Card Component (v2)
 * Redesigned: clickable card, weight+price grid, big Add to Cart button.
 * No backend / Supabase / cart logic changed.
 */

import { t, getLang }                   from '../utils/i18n.js';
import { formatPrice, resolveImageUrl } from '../utils/format.js';
import { addToCart }                    from '../services/cart.js';

/**
 * @param {Object} product
 * @param {string} [lang]
 * @returns {string} HTML string
 */
export function renderProductCard(product, lang = null) {
  lang = lang || getLang();

  const name = product[`name_${lang}`] || product.name_en || '';

  // Sort variants by price ascending
  const variants = (product.variants || product.product_variants || [])
    .slice()
    .sort((a, b) => a.price - b.price);

  // First image
  const imgs    = (product.images || product.product_images || []).slice();
  const imgPath = imgs.sort((a, b) => a.position - b.position)[0]?.storage_path;
  const imgSrc  = imgPath
    ? resolveImageUrl(imgPath)
    : '/assets/images/product-placeholder.svg';

  const isFeatured = product.is_featured;

  // Encode cart data onto the article for the global handler
  const safeVariantsJson = JSON.stringify(variants).replace(/"/g, '&quot;');

  // ── Size/price boxes ──────────────────────────────────────────────────────
  const sizeBoxes = variants.length
    ? `<div class="pc2-size-grid" aria-label="Available sizes">
        ${variants.map((v, i) => `
          <button
            type="button"
            class="pc2-size-btn${i === 0 ? ' pc2-size-btn--active' : ''}"
            data-variant-id="${v.id}"
            data-weight="${v.weight_label}"
            data-price="${v.price}"
            aria-pressed="${i === 0}"
            aria-label="${v.weight_label} – ${formatPrice(v.price)}">
            <span class="pc2-size-weight">${v.weight_label}</span>
            <span class="pc2-size-price">${formatPrice(v.price)}</span>
          </button>
        `).join('')}
      </div>`
    : '';

  // First variant for initial cart payload
  const first = variants[0];

  return /* html */`
    <article
      class="pc2-card"
      role="article"
      data-product-id="${product.id}"
      data-href="/product.html?id=${product.id}"
      data-name-en="${product.name_en  || ''}"
      data-name-ml="${product.name_ml  || ''}"
      data-image="${imgSrc}"
      data-variants="${safeVariantsJson}">

      <!-- Image area -->
      <div class="pc2-img-wrap">
        <img
          src="${imgSrc}"
          alt="${name}"
          loading="lazy"
          decoding="async"
          class="pc2-img"
          onerror="this.src='/assets/images/product-placeholder.svg'">
        ${isFeatured ? `
          <span class="pc2-popular-tag">
            ${t('featured.popular', lang)}
          </span>` : ''}
      </div>

      <!-- Body -->
      <div class="pc2-body">
        <!-- Title -->
        <h3 class="pc2-title">${name}</h3>

        <!-- Size + price grid -->
        ${sizeBoxes}

        <!-- Add to Cart button -->
        ${first ? `
          <button
            type="button"
            class="pc2-atc-btn"
            data-product-id="${product.id}"
            data-variant-id="${first.id}"
            data-weight="${first.weight_label}"
            data-price="${first.price}"
            data-name-en="${product.name_en || ''}"
            data-name-ml="${product.name_ml || ''}"
            data-image="${imgSrc}"
            aria-label="${lang === 'ml' ? 'കാർട്ടിൽ ചേർക്കൂ' : 'Add to cart'}">
            <svg class="pc2-atc-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
            </svg>
            <span class="pc2-atc-label">${lang === 'ml' ? 'കാർട്ടിൽ ചേർക്കൂ' : 'Add to cart'}</span>
          </button>
        ` : ''}
      </div>
    </article>
  `;
}

/**
 * Global delegated handler — attaches once on document.
 * Handles: size selection, add-to-cart, card navigation.
 */
export function initQuickAddButtons() {
  document.addEventListener('click', (e) => {

    // ── 1. Size box clicked ───────────────────────────────────────────────
    const sizeBtn = e.target.closest('.pc2-size-btn');
    if (sizeBtn) {
      e.preventDefault();
      e.stopPropagation();

      const card = sizeBtn.closest('.pc2-card');
      if (!card) return;

      // Update active styling
      card.querySelectorAll('.pc2-size-btn').forEach(b => {
        b.classList.remove('pc2-size-btn--active');
        b.setAttribute('aria-pressed', 'false');
      });
      sizeBtn.classList.add('pc2-size-btn--active');
      sizeBtn.setAttribute('aria-pressed', 'true');

      // Sync ATC button payload
      const atcBtn = card.querySelector('.pc2-atc-btn');
      if (atcBtn) {
        atcBtn.dataset.variantId = sizeBtn.dataset.variantId;
        atcBtn.dataset.weight    = sizeBtn.dataset.weight;
        atcBtn.dataset.price     = sizeBtn.dataset.price;
      }
      return;
    }

    // ── 2. Add-to-Cart button clicked ────────────────────────────────────
    const atcBtn = e.target.closest('.pc2-atc-btn');
    if (atcBtn) {
      e.preventDefault();
      e.stopPropagation();

      const lang      = getLang();
      const productId = atcBtn.dataset.productId;
      const variantId = atcBtn.dataset.variantId;
      const weight    = atcBtn.dataset.weight;
      const price     = parseFloat(atcBtn.dataset.price) || 0;
      const nameEn    = atcBtn.dataset.nameEn;
      const nameMl    = atcBtn.dataset.nameMl;
      const imgUrl    = atcBtn.dataset.image;

      addToCart({
        id:           `${productId}_${variantId}`,
        product_id:   productId,
        variant_id:   variantId,
        name_en:      nameEn,
        name_ml:      nameMl,
        weight_label: weight,
        price,
        qty:          1,
        image_url:    imgUrl && !imgUrl.includes('placeholder') ? imgUrl : null,
      });

      // "Added" feedback for 1.4 s
      const labelEl = atcBtn.querySelector('.pc2-atc-label');
      if (labelEl) {
        const orig = labelEl.textContent;
        labelEl.textContent = lang === 'ml' ? 'ചേർത്തു ✓' : 'Added ✓';
        atcBtn.classList.add('pc2-atc-btn--added');
        setTimeout(() => {
          labelEl.textContent = orig;
          atcBtn.classList.remove('pc2-atc-btn--added');
        }, 1400);
      }

      showQuickAddToast(lang === 'ml' ? 'കാർട്ടിൽ ചേർത്തു!' : 'Added to cart!');
      return;
    }

    // ── 3. Card body clicked → navigate to product page ──────────────────
    const card = e.target.closest('.pc2-card');
    if (card && card.dataset.href) {
      window.location.href = card.dataset.href;
    }
  });
}

function showQuickAddToast(message) {
  let toast = document.getElementById('quick-add-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'quick-add-toast';
    toast.className = 'fixed bottom-6 right-6 z-50 bg-forest text-white text-sm px-5 py-3 rounded shadow-xl flex items-center gap-3 transition-opacity duration-300';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `
    <svg class="w-4 h-4 text-beige" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
    </svg>
    <span>${message}</span>
    <a href="/cart.html" class="underline text-beige ml-2 font-medium text-xs">View Cart →</a>
  `;
  toast.style.opacity = '1';
  toast.classList.remove('hidden');
  clearTimeout(window.__quickAddToastTimeout);
  window.__quickAddToastTimeout = setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.classList.add('hidden'), 300);
  }, 2500);
}

/** Skeleton placeholder (unchanged) */
export function renderProductCardSkeleton() {
  return `
    <div class="bg-white overflow-hidden border border-sage/40 rounded-sm">
      <div class="skeleton" style="height:300px;"></div>
      <div class="p-5 space-y-3">
        <div class="skeleton h-5 w-3/4 rounded-sm"></div>
        <div class="flex gap-2 pt-1">
          <div class="skeleton h-12 flex-1 rounded-sm"></div>
          <div class="skeleton h-12 flex-1 rounded-sm"></div>
          <div class="skeleton h-12 flex-1 rounded-sm"></div>
        </div>
        <div class="skeleton h-14 w-full rounded-sm"></div>
      </div>
    </div>
  `;
}
