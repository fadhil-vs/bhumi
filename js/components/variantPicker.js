/**
 * Bhumi Foods — Variant Picker Component
 * Weight selector for product detail page.
 */

import { t, getLang } from '../utils/i18n.js';
import { formatPrice } from '../utils/format.js';

/**
 * @param {Array}    variants   - product_variants rows
 * @param {Function} onChange   - called with selected variant object
 * @param {string}   [lang]
 * @returns {string} HTML
 */
export function renderVariantPicker(variants, onChange, lang = null) {
  lang = lang || getLang();
  const sorted = [...variants].sort((a, b) => a.price - b.price);

  return /* html */`
    <div class="variant-picker" role="group" aria-label="${t('product.selectWeight', lang)}">
      <p class="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">
        ${t('product.selectWeight', lang)}
      </p>
      <div class="flex flex-wrap gap-2" id="variant-buttons">
        ${sorted.map((v, i) => `
          <button
            type="button"
            class="variant-pill ${i === 0 ? 'selected' : ''} ${!v.is_available ? 'unavailable' : ''}"
            data-variant-id="${v.id}"
            data-price="${v.price}"
            data-weight="${v.weight_label}"
            ${!v.is_available ? 'disabled aria-disabled="true"' : ''}
            aria-pressed="${i === 0 ? 'true' : 'false'}"
            aria-label="${v.weight_label} — ${formatPrice(v.price)}${!v.is_available ? ' (unavailable)' : ''}">
            ${v.weight_label}
          </button>
        `).join('')}
      </div>
      <!-- Selected price display -->
      <div class="mt-4 flex items-baseline gap-2">
        <span class="text-2xl font-semibold text-beige" id="selected-price">
          ${formatPrice(sorted[0]?.price ?? 0)}
        </span>
        <span class="text-sm text-gray-400" id="selected-weight">
          ${sorted[0]?.weight_label ?? ''}
        </span>
      </div>
    </div>
  `;
}

/** Attach variant selection behaviour after rendering */
export function initVariantPicker(onChange) {
  const container = document.getElementById('variant-buttons');
  const priceEl   = document.getElementById('selected-price');
  const weightEl  = document.getElementById('selected-weight');
  if (!container) return;

  container.addEventListener('click', (e) => {
    const btn = e.target.closest('.variant-pill');
    if (!btn || btn.disabled) return;

    // Update selected state
    container.querySelectorAll('.variant-pill').forEach(b => {
      b.classList.remove('selected');
      b.setAttribute('aria-pressed', 'false');
    });
    btn.classList.add('selected');
    btn.setAttribute('aria-pressed', 'true');

    // Update price display
    const variant = {
      id:           btn.dataset.variantId,
      price:        Number(btn.dataset.price),
      weight_label: btn.dataset.weight,
    };
    if (priceEl)  priceEl.textContent  = formatPrice(variant.price);
    if (weightEl) weightEl.textContent = variant.weight_label;

    if (typeof onChange === 'function') onChange(variant);
  });
}
