/**
 * Bhumi Foods — Product Detail Page Script (scaffold)
 * Full implementation in Milestone 5.
 */

import { renderNavbar, initNavbar }     from '../components/navbar.js';
import { renderFooter, initFooter }     from '../components/footer.js';
import { renderImageGallery, initImageGallery } from '../components/imageGallery.js';
import { renderVariantPicker, initVariantPicker } from '../components/variantPicker.js';
import { renderProductCard }            from '../components/productCard.js';
import { getProduct, getProducts }     from '../services/products.js';
import { addToCart }                   from '../services/cart.js';
import { getLang, t, applyLangFont }   from '../utils/i18n.js';
import { formatPrice, getParam, resolveImageUrl } from '../utils/format.js';
import { initScrollSpy }               from '../utils/dom.js';

let selectedVariant = null;

async function init() {
  const lang = getLang();
  applyLangFont();

  document.getElementById('nav-container').innerHTML  = renderNavbar();
  document.getElementById('footer-container').innerHTML = renderFooter();
  initNavbar();
  initFooter();
  initScrollSpy();

  const id = getParam('id');
  if (!id) { showError(lang); return; }

  const product = await getProduct(id);
  if (!product) { showError(lang); return; }

  renderProduct(product, lang);
  loadRelated(product, lang);
}

function renderProduct(product, lang) {
  const name = product[`name_${lang}`] || product.name_en;
  const desc = product[`description_${lang}`] || product.description_en || '';
  const variants = (product.product_variants || product.variants || []).sort((a, b) => a.price - b.price);

  // Update breadcrumb
  document.getElementById('breadcrumb-name').textContent = name;
  document.title = `${name} — Bhumi Foods`;

  // Gallery
  const galleryEl = document.getElementById('product-gallery');
  galleryEl.innerHTML = renderImageGallery(product.product_images || product.images || [], name);
  initImageGallery();

  // Info
  const infoEl = document.getElementById('product-info');
  selectedVariant = variants[0] || null;

  infoEl.innerHTML = /* html */`
    <div class="space-y-5">
      <div>
        <h1 class="font-heading text-2xl md:text-3xl text-forest font-normal leading-tight mb-2">${name}</h1>
      </div>

      ${variants.length ? `<div id="variant-picker-mount">${renderVariantPicker(variants, v => { selectedVariant = v; })}</div>` : ''}

      <!-- Quantity -->
      <div>
        <p class="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-3">${t('product.quantity', lang)}</p>
        <div class="flex items-center gap-3 w-32">
          <button id="qty-minus" class="w-9 h-9 border border-sage flex items-center justify-center hover:bg-sage-light transition-colors font-medium text-lg" aria-label="Decrease quantity">−</button>
          <span id="qty-display" class="text-base font-semibold text-center w-8">1</span>
          <button id="qty-plus"  class="w-9 h-9 border border-sage flex items-center justify-center hover:bg-sage-light transition-colors font-medium text-lg" aria-label="Increase quantity">+</button>
        </div>
      </div>

      <!-- Add to cart -->
      <div class="flex flex-col sm:flex-row gap-3 pt-2">
        <button id="add-to-cart-btn" class="btn-forest flex-1 justify-center rounded-sm py-3.5">
          ${t('product.addToCart', lang)}
        </button>
      </div>

      <!-- Description -->
      ${desc ? `
        <div class="pt-5 border-t border-sage">
          <h2 class="font-heading text-base text-forest font-normal mb-3">${t('product.description', lang)}</h2>
          <p class="text-sm text-gray-600 leading-relaxed">${desc}</p>
        </div>
      ` : ''}
    </div>
  `;

  // Init variant picker behaviour
  if (variants.length) initVariantPicker(v => { selectedVariant = v; });

  // Quantity controls
  let qty = 1;
  const qtyDisplay = document.getElementById('qty-display');
  document.getElementById('qty-minus')?.addEventListener('click', () => { if (qty > 1) { qty--; qtyDisplay.textContent = qty; } });
  document.getElementById('qty-plus')?.addEventListener('click',  () => { qty++; qtyDisplay.textContent = qty; });

  // Add to cart
  document.getElementById('add-to-cart-btn')?.addEventListener('click', () => {
    if (!selectedVariant) return;
    const imgs = product.product_images || product.images || [];
    const firstImg = [...imgs].sort((a, b) => a.position - b.position)[0]?.storage_path;
    addToCart({
      id:           `${product.id}_${selectedVariant.id}`,
      product_id:   product.id,
      variant_id:   selectedVariant.id,
      name_en:      product.name_en,
      name_ml:      product.name_ml,
      weight_label: selectedVariant.weight_label,
      price:        selectedVariant.price,
      qty,
      image_url:    firstImg ? resolveImageUrl(firstImg) : null,
    });
    showToast(lang === 'ml' ? 'കാർട്ടിൽ ചേർത്തു' : 'Added to cart', lang);
  });
}

function showToast(msg) {
  const toast = document.getElementById('cart-toast');
  const msgEl = document.getElementById('cart-toast-msg');
  if (!toast || !msgEl) return;
  msgEl.textContent = msg;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 2500);
}

async function loadRelated(product, lang) {
  const container = document.getElementById('related-products');
  if (!container) return;
  const { data } = await getProducts({ categoryId: product.category_id });
  const others = data.filter(p => p.id !== product.id).slice(0, 4);
  container.innerHTML = others.map(p => renderProductCard(p, lang)).join('');
}

function showError(lang) {
  document.getElementById('product-detail').innerHTML =
    `<div class="col-span-full text-center py-16 text-sm text-gray-500">${t('common.error', lang)}</div>`;
}

init();
