/**
 * Bhumi Foods — Homepage Page Script
 * Orchestrates all sections on index.html.
 */

import { renderNavbar, initNavbar }   from '../components/navbar.js';
import { renderFooter, initFooter }   from '../components/footer.js';
import { renderProductCard, renderProductCardSkeleton, initQuickAddButtons } from '../components/productCard.js';
import { renderVideoCard, buildPlaceholderSteps } from '../components/videoPlayer.js';
import { getFeaturedProducts }         from '../services/products.js';
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
    loadFeaturedProducts(lang),
    loadProcessVideos(lang),
    loadCategories(lang),
  ]);

  // ── Page ready ───────────────────────────────────────────
  document.body.classList.add('page-enter');
}

/* ── Featured Products ───────────────────────────────────── */
async function loadFeaturedProducts(lang) {
  const grid = document.getElementById('featured-grid');
  if (!grid) return;

  // Show skeletons while loading
  grid.innerHTML = Array(5).fill(renderProductCardSkeleton()).join('');

  try {
    const products = await getFeaturedProducts();
    if (products.length) {
      grid.innerHTML = products.map(p => renderProductCard(p, lang)).join('');
    }
  } catch {
    // Skeletons replaced with placeholder data from service
  }
}

/* ── Factory Videos ──────────────────────────────────────── */
async function loadProcessVideos(lang) {
  const container = document.getElementById('process-videos');
  if (!container) return;

  // For M1: show placeholder steps
  // In M4: fetch real videos from Supabase
  const steps = buildPlaceholderSteps(lang);
  container.innerHTML = steps.map(s => renderVideoCard(s, lang)).join('');
}

/* ── Categories ──────────────────────────────────────────── */
async function loadCategories(lang) {
  const grid = document.getElementById('categories-grid');
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

  // Brand colours per category for placeholder backgrounds
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
      class="category-card block relative aspect-[4/3] overflow-hidden rounded-sm"
      aria-label="${name}">
      ${cat.image_path
        ? `<img src="${imgPath}" alt="${name}" class="w-full h-full object-cover" loading="lazy">`
        : `<div class="w-full h-full" style="background-color:${bg}; opacity:0.85;"></div>`
      }
      <div class="category-card-overlay"></div>
      <div class="absolute bottom-0 left-0 right-0 p-4 md:p-5">
        <h3 class="font-heading text-white text-base md:text-lg font-medium leading-snug mb-1">
          ${name}
        </h3>
        <span class="text-white/70 text-xs font-medium flex items-center gap-1">
          ${t('categories.viewCategory', lang)}
          <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
          </svg>
        </span>
      </div>
    </a>
  `;
}

// Bootstrap
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
