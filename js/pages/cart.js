/**
 * Bhumi Foods — Cart Page Script
 * Full implementation in Milestone 7.
 */

import { renderNavbar, initNavbar }  from '../components/navbar.js';
import { renderFooter, initFooter }  from '../components/footer.js';
import { getCart, updateQty, removeFromCart, getCartTotal } from '../services/cart.js';
import { openWhatsAppCheckout }      from '../services/whatsapp.js';
import { getLang, t, applyLangFont } from '../utils/i18n.js';
import { formatPrice }               from '../utils/format.js';
import { initScrollSpy }             from '../utils/dom.js';

function init() {
  const lang = getLang();
  applyLangFont();

  document.getElementById('nav-container').innerHTML  = renderNavbar();
  document.getElementById('footer-container').innerHTML = renderFooter();
  initNavbar();
  initFooter();
  initScrollSpy();

  renderCart(lang);

  // WhatsApp checkout
  document.getElementById('whatsapp-checkout-btn')?.addEventListener('click', () => {
    openWhatsAppCheckout();
  });

  // Listen for cart updates
  window.addEventListener('bhumi:cart-updated', () => renderCart(lang));
}

function renderCart(lang) {
  const cart    = getCart();
  const total   = getCartTotal();
  const container = document.getElementById('cart-items');
  const totalEl   = document.getElementById('cart-total');
  const summaryEl = document.getElementById('summary-lines');
  const checkoutBtn = document.getElementById('whatsapp-checkout-btn');

  if (totalEl)   totalEl.textContent = formatPrice(total);

  if (cart.length === 0) {
    if (container) container.innerHTML = /* html */`
      <div class="bg-white p-12 text-center">
        <div class="w-16 h-16 rounded-full bg-sage-light flex items-center justify-center mx-auto mb-4">
          <svg class="w-7 h-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
          </svg>
        </div>
        <p class="font-heading text-lg text-forest font-normal mb-2">${t('cart.empty', lang)}</p>
        <p class="text-sm text-gray-500 mb-6">${t('cart.emptyHint', lang)}</p>
        <a href="/products.html" class="btn-forest rounded-sm text-sm inline-flex">${t('cart.shopNow', lang)}</a>
      </div>
    `;
    if (summaryEl) summaryEl.innerHTML = '';
    if (checkoutBtn) checkoutBtn.disabled = true;
    return;
  }

  if (checkoutBtn) checkoutBtn.disabled = false;

  if (container) container.innerHTML = /* html */`
    <div class="bg-white overflow-hidden">
      <div class="divide-y divide-sage">
        ${cart.map(item => renderCartItem(item, lang)).join('')}
      </div>
    </div>
  `;

  if (summaryEl) summaryEl.innerHTML = cart.map(item => `
    <div class="flex justify-between text-sm">
      <span class="text-gray-600 truncate max-w-[180px]">${item[`name_${lang}`] || item.name_en} (${item.weight_label} × ${item.qty})</span>
      <span class="font-medium text-gray-800 ml-2 flex-shrink-0">${formatPrice(item.price * item.qty)}</span>
    </div>
  `).join('');

  // Event delegation for qty and remove
  container.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-action]');
    if (!btn) return;
    const { action, itemId } = btn.dataset;
    const qtyEl = container.querySelector(`[data-qty-display="${itemId}"]`);
    const currentQty = parseInt(qtyEl?.textContent || '1');

    if (action === 'increase')  updateQty(itemId, currentQty + 1);
    if (action === 'decrease')  updateQty(itemId, currentQty - 1);
    if (action === 'remove')    removeFromCart(itemId);
  });
}

function renderCartItem(item, lang) {
  const name = item[`name_${lang}`] || item.name_en;
  return /* html */`
    <div class="flex gap-4 p-4 md:p-5">
      <!-- Image -->
      <div class="w-20 h-20 flex-shrink-0 bg-sage-light overflow-hidden">
        <img src="${item.image_url || '/assets/images/product-placeholder.svg'}"
          alt="${name}" class="w-full h-full object-cover"
          onerror="this.src='/assets/images/product-placeholder.svg'">
      </div>
      <!-- Info -->
      <div class="flex-1 min-w-0">
        <h3 class="font-heading text-sm font-medium text-gray-900 leading-snug truncate">${name}</h3>
        <p class="text-xs text-gray-500 mt-0.5 mb-3">${item.weight_label}</p>
        <!-- Qty controls -->
        <div class="flex items-center gap-2">
          <button class="w-7 h-7 border border-sage flex items-center justify-center hover:bg-sage-light transition-colors text-sm"
            data-action="decrease" data-item-id="${item.id}" aria-label="Decrease">−</button>
          <span class="text-sm font-semibold w-6 text-center" data-qty-display="${item.id}">${item.qty}</span>
          <button class="w-7 h-7 border border-sage flex items-center justify-center hover:bg-sage-light transition-colors text-sm"
            data-action="increase" data-item-id="${item.id}" aria-label="Increase">+</button>
        </div>
      </div>
      <!-- Price + Remove -->
      <div class="flex flex-col items-end justify-between flex-shrink-0">
        <span class="font-semibold text-beige text-sm">${formatPrice(item.price * item.qty)}</span>
        <button class="text-xs text-gray-400 hover:text-red-500 transition-colors mt-2"
          data-action="remove" data-item-id="${item.id}" aria-label="Remove ${name}">
          Remove
        </button>
      </div>
    </div>
  `;
}

init();
