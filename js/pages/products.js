/**
 * Bhumi Foods — Products Page Script (scaffold)
 * Full implementation in Milestone 5.
 */

import { renderNavbar, initNavbar }  from '../components/navbar.js';
import { renderFooter, initFooter }  from '../components/footer.js';
import { renderProductCard, renderProductCardSkeleton, initQuickAddButtons } from '../components/productCard.js';
import { getProducts }               from '../services/products.js';
import { getCategories }             from '../services/categories.js';
import { getLang, t, applyLangFont } from '../utils/i18n.js';
import { initScrollSpy }             from '../utils/dom.js';
import { getParam }                  from '../utils/format.js';

async function init() {
  const lang = getLang();
  applyLangFont();

  document.getElementById('nav-container').innerHTML  = renderNavbar();
  document.getElementById('footer-container').innerHTML = renderFooter();
  initNavbar();
  initFooter();
  initScrollSpy();
  initQuickAddButtons();

  // Load categories for filter
  const categories = await getCategories();
  renderCategoryFilters(categories, lang);

  // Load products (filtered by URL param if present)
  const categorySlug = getParam('category');
  const categoryId   = categories.find(c => c.slug === categorySlug)?.id || null;
  await loadProducts({ categoryId, lang });
}

function renderCategoryFilters(categories, lang) {
  const container = document.getElementById('category-filters');
  if (!container) return;

  const allBtn = container.querySelector('[data-category=""]');
  if (allBtn) {
    allBtn.addEventListener('click', () => {
      selectFilter(null, lang);
      container.querySelectorAll('button').forEach(b => b.classList.remove('selected'));
      allBtn.classList.add('selected');
    });
  }

  categories.forEach(cat => {
    const btn = document.createElement('button');
    btn.className  = 'variant-pill text-sm py-2 px-4';
    btn.dataset.category = cat.id;
    btn.textContent = cat[`name_${lang}`] || cat.name_en;
    btn.addEventListener('click', () => {
      container.querySelectorAll('button').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      selectFilter(cat.id, lang);
    });
    container.appendChild(btn);
  });
}

async function selectFilter(categoryId, lang) {
  await loadProducts({ categoryId, lang, page: 1 });
}

async function loadProducts({ categoryId = null, lang, page = 1 }) {
  const grid = document.getElementById('products-grid');
  if (!grid) return;

  grid.innerHTML = Array(10).fill(renderProductCardSkeleton()).join('');

  const { data, count } = await getProducts({ categoryId, page });
  if (data.length === 0) {
    grid.innerHTML = `<div class="col-span-full text-center py-16 text-sm text-gray-500">${t('common.noResults', lang)}</div>`;
    return;
  }

  grid.innerHTML = data.map(p => renderProductCard(p, lang)).join('');
}

init();
