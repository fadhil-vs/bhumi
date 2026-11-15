/**
 * Bhumi Foods — Product Card Component
 * Renders a single product card with interactive weight selector and instant price update.
 */

import { t, getLang } from '../utils/i18n.js';
import { formatPrice, resolveImageUrl } from '../utils/format.js';
import { addToCart } from '../services/cart.js';

/**
 * @param {Object} product
 * @param {string} [lang]
 * @returns {string} HTML string
 */
export function renderProductCard(product, lang = null) {
  lang = lang || getLang();

  const name      = product[`name_${lang}`]        || product.name_en  || '';
  const desc      = product[`description_${lang}`] || product.description_en || '';
  const shortDesc = desc.length > 75 ? desc.slice(0, 75).trimEnd() + '…' : desc;

  // Sort variants by price
  const variants  = (product.variants || product.product_variants || [])
    .sort((a, b) => a.price - b.price);
  const minVariant = variants[0];
  const minPrice   = minVariant?.price ?? 0;

  // First image
  const imgs = product.images || product.product_images || [];
  const imgPath = imgs.sort((a, b) => a.position - b.position)[0]?.storage_path;
  const imgSrc  = imgPath
    ? resolveImageUrl(imgPath)
    : '/assets/images/product-placeholder.svg';

  const isFeatured = product.is_featured;

  // Serialize variants for client-side interactivity
  const safeVariantsJson = JSON.stringify(variants).replace(/"/g, '&quot;');

  return /* html */`
    <article
      class="product-card group relative flex flex-col bg-white border border-sage/60 rounded-sm overflow-hidden hover:border-forest/40 hover:shadow-md transition-all duration-300"
      data-product-id="${product.id}"
      data-variants="${safeVariantsJson}">

      <!-- Image -->
      <a href="/product.html?id=${product.id}" class="product-card-img-wrap block aspect-square overflow-hidden bg-sage-light/50 relative">
        <img
          src="${imgSrc}"
          alt="${name}"
          loading="lazy"
          decoding="async"
          class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onerror="this.src='/assets/images/product-placeholder.svg'">
        ${isFeatured ? `
          <span class="absolute top-3 left-3 bg-forest text-white text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 z-10 shadow-sm">
            ${t('featured.popular', lang)}
          </span>` : ''}
      </a>

      <!-- Body -->
      <div class="p-4 md:p-5 flex flex-col flex-1">

        <!-- Name -->
        <h3 class="font-heading text-[15px] md:text-base font-medium text-gray-900 leading-snug mb-1.5 hover:text-forest transition-colors">
          <a href="/product.html?id=${product.id}">${name}</a>
        </h3>

        <!-- Short description -->
        ${shortDesc ? `
          <p class="text-[13px] text-gray-500 leading-relaxed mb-3 flex-1 line-clamp-2">${shortDesc}</p>
        ` : '<div class="flex-1"></div>'}

        <!-- Interactive Variant pills -->
        ${variants.length ? `
          <div class="flex flex-wrap gap-1.5 mb-4" aria-label="Available weights">
            ${variants.map((v, i) => `
              <button
                type="button"
                class="variant-pill-btn text-[11px] px-2.5 py-1 font-medium rounded-sm border transition-all duration-150 ${i === 0 ? 'bg-forest text-white border-forest active-variant' : 'bg-sage-light text-forest border-sage hover:border-forest/50'}"
                data-product-id="${product.id}"
                data-variant-id="${v.id}"
                data-weight="${v.weight_label}"
                data-price="${v.price}">
                ${v.weight_label}
              </button>
            `).join('')}
          </div>
        ` : ''}

        <!-- Price + Actions -->
        <div class="flex items-center justify-between gap-2 pt-2 border-t border-sage/40">
          <div>
            <span class="block text-[10px] text-gray-400 uppercase tracking-widest leading-tight">${t('featured.from', lang)}</span>
            <span class="card-price-display text-beige font-semibold text-base" data-product-id="${product.id}">
              ${formatPrice(minPrice)}
            </span>
          </div>

          <div class="flex items-center gap-1.5">
            ${minVariant ? `
              <button
                type="button"
                class="quick-add-btn p-2 text-forest bg-sage-light hover:bg-forest hover:text-white rounded-sm transition-all duration-200"
                data-product-id="${product.id}"
                data-variant-id="${minVariant.id}"
                data-name-en="${product.name_en || ''}"
                data-name-ml="${product.name_ml || ''}"
                data-weight="${minVariant.weight_label || ''}"
                data-price="${minVariant.price || 0}"
                data-image="${imgSrc}"
                title="${lang === 'ml' ? 'കാർട്ടിൽ ചേർക്കൂ' : 'Quick add to cart'}"
                aria-label="${lang === 'ml' ? 'കാർട്ടിൽ ചേർക്കൂ' : 'Quick add to cart'}">
                <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                </svg>
              </button>
            ` : ''}

            <a
              href="/product.html?id=${product.id}"
              class="text-[12px] font-semibold text-forest border border-forest/40 px-3 py-1.5 hover:bg-forest hover:text-white hover:border-forest transition-all duration-200 rounded-sm">
              ${t('featured.viewBtn', lang)}
            </a>
          </div>
        </div>
      </div>
    </article>
  `;
}

/**
 * Global handler for interactive variant pills and quick-add buttons across product grids.
 */
export function initQuickAddButtons() {
  // Delegate clicks on variant pill buttons
  document.addEventListener('click', (e) => {
    const pill = e.target.closest('.variant-pill-btn');
    if (pill) {
      e.preventDefault();
      e.stopPropagation();

      const card = pill.closest('.product-card');
      if (!card) return;

      const variantId = pill.dataset.variantId;
      const weight    = pill.dataset.weight;
      const price     = parseFloat(pill.dataset.price);

      // 1. Update active styling on pills
      card.querySelectorAll('.variant-pill-btn').forEach(btn => {
        btn.classList.remove('bg-forest', 'text-white', 'border-forest', 'active-variant');
        btn.classList.add('bg-sage-light', 'text-forest', 'border-sage');
      });
      pill.classList.remove('bg-sage-light', 'text-forest', 'border-sage');
      pill.classList.add('bg-forest', 'text-white', 'border-forest', 'active-variant');

      // 2. Update price display
      const priceEl = card.querySelector('.card-price-display');
      if (priceEl && !isNaN(price)) {
        priceEl.textContent = formatPrice(price);
      }

      // 3. Update quick-add button data payload
      const quickAddBtn = card.querySelector('.quick-add-btn');
      if (quickAddBtn) {
        quickAddBtn.dataset.variantId = variantId;
        quickAddBtn.dataset.weight    = weight;
        quickAddBtn.dataset.price     = price;
      }
      return;
    }

    // Delegate clicks on quick-add button
    const btn = e.target.closest('.quick-add-btn');
    if (!btn) return;

    e.preventDefault();
    e.stopPropagation();

    const lang = getLang();
    const productId = btn.dataset.productId;
    const variantId = btn.dataset.variantId;
    const nameEn    = btn.dataset.nameEn;
    const nameMl    = btn.dataset.nameMl;
    const weight    = btn.dataset.weight;
    const price     = parseFloat(btn.dataset.price) || 0;
    const imgUrl    = btn.dataset.image;

    addToCart({
      id:           `${productId}_${variantId}`,
      product_id:   productId,
      variant_id:   variantId,
      name_en:      nameEn,
      name_ml:      nameMl,
      weight_label: weight,
      price:        price,
      qty:          1,
      image_url:    imgUrl && !imgUrl.includes('placeholder') ? imgUrl : null,
    });

    // Animate button feedback
    const originalHTML = btn.innerHTML;
    btn.innerHTML = `<svg class="w-4 h-4 text-green-600 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>`;
    setTimeout(() => { btn.innerHTML = originalHTML; }, 1200);

    // Show temporary toast notification
    showQuickAddToast(lang === 'ml' ? 'കാർട്ടിൽ ചേർത്തു!' : 'Added to cart!');
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

/**
 * Render a skeleton placeholder card (for loading state).
 */
export function renderProductCardSkeleton() {
  return `
    <div class="bg-white overflow-hidden border border-sage/40 rounded-sm">
      <div class="skeleton" style="height: 220px;"></div>
      <div class="p-4 space-y-3">
        <div class="skeleton h-4 w-3/4 rounded-sm"></div>
        <div class="skeleton h-3 w-full rounded-sm"></div>
        <div class="skeleton h-3 w-5/6 rounded-sm"></div>
        <div class="flex gap-2 pt-1">
          <div class="skeleton h-5 w-10 rounded-sm"></div>
          <div class="skeleton h-5 w-10 rounded-sm"></div>
          <div class="skeleton h-5 w-10 rounded-sm"></div>
        </div>
        <div class="flex justify-between items-center pt-1">
          <div class="skeleton h-5 w-14 rounded-sm"></div>
          <div class="skeleton h-8 w-24 rounded-sm"></div>
        </div>
      </div>
    </div>
  `;
}
