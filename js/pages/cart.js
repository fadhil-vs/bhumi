/**
 * Bhumi Foods — Cart Page Script
 * Full implementation with WhatsApp checkout & customer details validation.
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

  // WhatsApp checkout with customer form validation
  document.getElementById('whatsapp-checkout-btn')?.addEventListener('click', () => {
    const nameInput    = document.getElementById('cust-name');
    const phoneInput   = document.getElementById('cust-phone');
    const addressInput = document.getElementById('cust-address');
    const errorEl      = document.getElementById('checkout-error');

    const name    = nameInput?.value?.trim();
    const phone   = phoneInput?.value?.trim();
    const address = addressInput?.value?.trim();

    if (errorEl) errorEl.classList.add('hidden');

    if (!name || !phone || !address) {
      if (errorEl) {
        errorEl.textContent = lang === 'ml'
          ? 'ദയവായി പേര്, ഫോൺ നമ്പർ, വിലാസം എന്നിവ നൽകുക.'
          : 'Please enter your Name, Phone number, and Delivery Address.';
        errorEl.classList.remove('hidden');
      }
      if (!name) nameInput?.focus();
      else if (!phone) phoneInput?.focus();
      else if (!address) addressInput?.focus();
      return;
    }

    openWhatsAppCheckout({ name, phone, address });
  });

  // Listen for cart updates
  window.addEventListener('bhumi:cart-updated', () => renderCart(lang));
}

function renderCart(lang) {
  const cart        = getCart();
  const total       = getCartTotal();
  const container   = document.getElementById('cart-items');
  const totalEl     = document.getElementById('cart-total');
  const summaryEl   = document.getElementById('summary-lines');
  const formWrap    = document.getElementById('customer-form-wrap');
  const checkoutBtn = document.getElementById('whatsapp-checkout-btn');

  if (totalEl) totalEl.textContent = formatPrice(total);

  if (cart.length === 0) {
    if (formWrap) formWrap.classList.add('hidden');
    if (checkoutBtn) checkoutBtn.disabled = true;

    if (container) container.innerHTML = /* html */`
      <div class="bg-white p-12 text-center rounded-sm border border-sage/60">
        <div class="w-16 h-16 rounded-full bg-sage-light flex items-center justify-center mx-auto mb-4">
          <svg class="w-7 h-7 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
          </svg>
        </div>
        <h2 class="font-heading text-xl text-forest font-normal mb-2">${t('cart.empty', lang)}</h2>
        <p class="text-sm text-gray-500 mb-6">Explore our authentic range of Kerala spices.</p>
        <a href="/products.html" class="btn-forest inline-flex items-center gap-2 rounded-sm text-sm py-2.5 px-6">
          ${t('cart.shopNow', lang)}
        </a>
      </div>
    `;
    if (summaryEl) summaryEl.innerHTML = `<p class="text-xs text-gray-400">Cart is empty</p>`;
    return;
  }

  if (formWrap) formWrap.classList.remove('hidden');
  if (checkoutBtn) checkoutBtn.disabled = false;

  // Render items list
  if (container) {
    container.innerHTML = `
      <div class="bg-white rounded-sm border border-sage/60 divide-y divide-sage/40">
        ${cart.map((item, index) => renderCartItem(item, index, lang)).join('')}
      </div>
    `;
    initCartItemListeners(lang);
  }

  // Render summary lines
  if (summaryEl) {
    summaryEl.innerHTML = cart.map(item => `
      <div class="flex justify-between text-xs text-gray-600">
        <span class="truncate max-w-[180px]">${lang === 'ml' ? (item.name_ml || item.name_en) : item.name_en} (${item.weight_label}) × ${item.qty}</span>
        <span class="font-medium text-gray-800 ml-2">${formatPrice(item.price * item.qty)}</span>
      </div>
    `).join('');
  }
}

function renderCartItem(item, index, lang) {
  const name      = lang === 'ml' ? (item.name_ml || item.name_en) : item.name_en;
  const lineTotal = item.price * item.qty;

  return /* html */`
    <div class="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4" data-cart-index="${index}">
      <div class="flex items-center gap-4">
        <img src="${item.image_url || '/assets/images/product-placeholder.svg'}"
          alt="${name}"
          class="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-sm border border-sage/60 flex-shrink-0 bg-sage-light"
          onerror="this.src='/assets/images/product-placeholder.svg'">
        <div>
          <h3 class="font-heading text-base font-medium text-gray-900 leading-snug">${name}</h3>
          <p class="text-xs text-gray-500 mt-0.5">Weight: <span class="font-medium text-forest">${item.weight_label}</span> · ${formatPrice(item.price)} each</p>
          <span class="font-semibold text-sm text-beige sm:hidden mt-1 block">${formatPrice(lineTotal)}</span>
        </div>
      </div>

      <div class="flex items-center justify-between sm:justify-end gap-6">
        <!-- Qty selector -->
        <div class="flex items-center border border-sage rounded-sm bg-white">
          <button class="cart-qty-btn px-2.5 py-1 text-gray-500 hover:text-forest transition-colors" data-action="minus" data-id="${item.id}">−</button>
          <span class="px-3 text-xs font-medium text-gray-800">${item.qty}</span>
          <button class="cart-qty-btn px-2.5 py-1 text-gray-500 hover:text-forest transition-colors" data-action="plus" data-id="${item.id}">+</button>
        </div>

        <span class="font-semibold text-base text-beige hidden sm:block w-20 text-right">${formatPrice(lineTotal)}</span>

        <!-- Remove -->
        <button class="cart-remove-btn text-gray-400 hover:text-red-500 p-1.5 transition-colors" data-id="${item.id}" aria-label="Remove item">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
          </svg>
        </button>
      </div>
    </div>
  `;
}

function initCartItemListeners(lang) {
  document.querySelectorAll('.cart-qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const cart = getCart();
      const item = cart.find(i => i.id === id);
      if (!item) return;

      if (btn.dataset.action === 'plus') {
        updateQty(id, item.qty + 1);
      } else if (btn.dataset.action === 'minus') {
        if (item.qty > 1) {
          updateQty(id, item.qty - 1);
        } else {
          removeFromCart(id);
        }
      }
    });
  });

  document.querySelectorAll('.cart-remove-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      removeFromCart(btn.dataset.id);
    });
  });
}

document.addEventListener('DOMContentLoaded', init);
