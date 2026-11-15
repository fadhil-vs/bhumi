/**
 * Bhumi Foods — Product Card Component
 * Renders a single product card for grids and carousels.
 */

import { t, getLang } from '../utils/i18n.js';
import { formatPrice, resolveImageUrl } from '../utils/format.js';

/**
 * @param {Object} product
 * @param {string} [lang]
 * @returns {string} HTML string
 */
export function renderProductCard(product, lang = null) {
  lang = lang || getLang();

  const name     = product[`name_${lang}`]        || product.name_en  || '';
  const desc     = product[`description_${lang}`] || product.description_en || '';
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

  return /* html */`
    <article class="product-card" data-product-id="${product.id}">

      <!-- Image -->
      <div class="product-card-img-wrap">
        <img
          src="${imgSrc}"
          alt="${name}"
          loading="lazy"
          decoding="async"
          onerror="this.src='/assets/images/product-placeholder.svg'">
        ${isFeatured ? `
          <span class="absolute top-3 left-3 bg-forest text-white text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1">
            ${t('featured.popular', lang)}
          </span>` : ''}
      </div>

      <!-- Body -->
      <div class="p-4 md:p-5 flex flex-col flex-1">

        <!-- Name -->
        <h3 class="font-heading text-[15px] md:text-base font-medium text-gray-900 leading-snug mb-1.5">
          ${name}
        </h3>

        <!-- Short description -->
        ${shortDesc ? `
          <p class="text-[13px] text-gray-500 leading-relaxed mb-3 flex-1">${shortDesc}</p>
        ` : '<div class="flex-1"></div>'}

        <!-- Variant pills (first 4) -->
        ${variants.length ? `
          <div class="flex flex-wrap gap-1.5 mb-4" aria-label="Available weights">
            ${variants.slice(0, 4).map(v => `
              <span class="text-[11px] px-2 py-0.5 bg-sage-light text-forest border border-sage font-medium rounded-sm">
                ${v.weight_label}
              </span>
            `).join('')}
            ${variants.length > 4 ? `<span class="text-[11px] text-gray-400">+${variants.length - 4} more</span>` : ''}
          </div>
        ` : ''}

        <!-- Price + CTA -->
        <div class="flex items-center justify-between gap-2">
          <div>
            <span class="block text-[10px] text-gray-400 uppercase tracking-widest">${t('featured.from', lang)}</span>
            <span class="text-beige font-semibold text-base">${formatPrice(minPrice)}</span>
          </div>
          <a
            href="/product.html?id=${product.id}"
            class="text-[12px] font-semibold text-forest border border-forest/40 px-3.5 py-2 hover:bg-forest hover:text-white hover:border-forest transition-all duration-200 rounded-sm">
            ${t('featured.viewBtn', lang)}
          </a>
        </div>
      </div>
    </article>
  `;
}

/**
 * Render a skeleton placeholder card (for loading state).
 */
export function renderProductCardSkeleton() {
  return `
    <div class="bg-white overflow-hidden">
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
