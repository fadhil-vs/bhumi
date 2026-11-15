/**
 * Bhumi Foods — Homepage Page Script
 * Orchestrates all sections on index.html:
 * - 50/50 Split Hero with instant product showcase
 * - 9-Product Featured Grid
 * - Video process cards & Categories
 */

import { renderNavbar, initNavbar }   from '../components/navbar.js';
import { renderFooter, initFooter }   from '../components/footer.js';
import { renderProductCard, renderProductCardSkeleton, initQuickAddButtons } from '../components/productCard.js';
import { renderVideoCard, buildPlaceholderSteps } from '../components/videoPlayer.js';
import { getFeaturedProducts, getProducts } from '../services/products.js';
import { getCategories, PLACEHOLDER_CATEGORIES } from '../services/categories.js';
import { getLang, t, applyLangFont }  from '../utils/i18n.js';
import { initScrollSpy }              from '../utils/dom.js';

async function init() {
  const lang = getLang();
  applyLangFont();

  // ── Shared layout components ──────────────────────────────
  document.getElementById('nav-container').innerHTML  = renderNavbar();
  document.getElementById('footer-container').innerHTML = renderFooter();
  initNavbar();
  initFooter();
  initScrollSpy();
  initQuickAddButtons();

  // ── Run sections in parallel ──────────────────────────────
  await Promise.all([
    loadHeroShowcase(lang),
    loadFeaturedProducts(lang),
    loadProcessVideos(lang),
    loadCategories(lang),
  ]);

  // ── Page ready ───────────────────────────────────────────
  document.body.classList.add('page-enter');
}

/* ── Hero Showcase (Top Products beside Headline) ───────── */
async function loadHeroShowcase(lang) {
  const container = document.getElementById('hero-products-showcase');
  if (!container) return;

  try {
    const featured = await getFeaturedProducts();
    const showcaseItems = featured.slice(0, 4); // Show up to 4 top products right at the top

    if (showcaseItems.length) {
      container.innerHTML = showcaseItems.map(p => renderProductCard(p, lang)).join('');
    } else {
      const all = await getProducts({ perPage: 4 });
      if (all?.data?.length) {
        container.innerHTML = all.data.map(p => renderProductCard(p, lang)).join('');
      }
    }
  } catch (err) {
    console.warn('[Hero] Showcase load failed:', err.message);
  }
}

/* ── Featured Products (Up to 9 products in 3x3 Grid) ───── */
async function loadFeaturedProducts(lang) {
  const grid = document.getElementById('featured-grid');
  if (!grid) return;

  // Show 9 skeletons while loading
  grid.innerHTML = Array(9).fill(renderProductCardSkeleton()).join('');

  try {
    const products = await getFeaturedProducts();
    if (products.length) {
      grid.innerHTML = products.map(p => renderProductCard(p, lang)).join('');
    } else {
      const all = await getProducts({ perPage: 9 });
      if (all?.data?.length) {
        grid.innerHTML = all.data.map(p => renderProductCard(p, lang)).join('');
      }
    }
  } catch {
    // Skeletons replaced with placeholder data from service
  }
}

/* ── Factory Videos ──────────────────────────────────────── */
async function loadProcessVideos(lang) {
  const container = document.getElementById('process-videos');
  if (!container) return;

  const steps = buildPlaceholderSteps(lang);
  container.innerHTML = steps.map(s => renderVideoCard(s, lang)).join('');
}

/* ── Category Grid ───────────────────────────────────────── */
async function loadCategories(lang) {
  const grid = document.getElementById('category-grid');
  if (!grid) return;

  try {
    const categories = await getCategories();
    grid.innerHTML = categories.map(cat => renderCategoryCard(cat, lang)).join('');
  } catch {
    grid.innerHTML = PLACEHOLDER_CATEGORIES.map(cat => renderCategoryCard(cat, lang)).join('');
  }
}

function renderCategoryCard(cat, lang) {
  const name    = cat[`name_${lang}`] || cat.name_en;
  const imgPath = cat.image_path
    ? resolveImageUrl(cat.image_path)
    : `/assets/images/category-placeholder.svg`;

  const bgMap = {
    'chilli-powders':    '#7B2D1E',
    'turmeric-powders':  '#C07722',
    'coriander-powders': '#3A6B35',
    'garam-masala':      '#5C3317',
    'meat-masala':       '#6B2D2D',
    'special-blends':    '#214A36',
  };
  const bg = bgMap[cat.slug] || '#214A36';

  return /* html */`
    <a href="/products.html?category=${cat.slug}"
      class="category-card group block overflow-hidden rounded-sm relative aspect-[4/5] bg-sage-light hover:shadow-lg transition-all duration-300">
      <div class="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
        style="background-color: ${bg};">
        <img
          src="${imgPath}"
          alt="${name}"
          loading="lazy"
          class="w-full h-full object-cover opacity-85 group-hover:opacity-95 transition-opacity"
          onerror="this.style.display='none'">
      </div>
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
      <div class="absolute bottom-0 left-0 right-0 p-5">
        <h3 class="font-heading text-lg font-medium text-white mb-1 group-hover:text-beige transition-colors">
          ${name}
        </h3>
        <span class="text-xs text-white/70 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
          View range <span aria-hidden="true">→</span>
        </span>
      </div>
    </a>
  `;
}

document.addEventListener('DOMContentLoaded', init);
