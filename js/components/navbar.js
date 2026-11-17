/**
 * Bhumi Foods — Navbar Component
 * Renders and initialises the sticky site navigation.
 */

import { t, getLang, setLang } from '../utils/i18n.js';
import { getCartCount } from '../services/cart.js';

/** Generate navbar HTML string */
export function renderNavbar() {
  const lang      = getLang();
  const count     = getCartCount();
  const badgeHTML = count > 0
    ? `<span class="cart-badge" aria-label="${count} items in cart">${count}</span>`
    : '';

  return /* html */`
    <nav class="navbar fixed top-0 left-0 right-0 z-50 bg-white/96 backdrop-blur-md border-b border-[#D6E4F2]" role="navigation" aria-label="Main navigation">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex items-center justify-between h-16 md:h-[72px]">

          <!-- ── Logo ── -->
          <a href="/index.html" class="flex items-center gap-2.5 flex-shrink-0 group" aria-label="Bhumi Foods — Home">
            <img src="/assets/images/logo.png" alt="Bhumi Foods logo"
              class="h-9 w-9 object-contain transition-opacity duration-200 group-hover:opacity-80"
              onerror="this.style.display='none'">
            <span class="font-heading text-[17px] font-semibold text-forest tracking-wider leading-none">
              BHUMI<br><span class="text-[#D4930D] text-[11px] tracking-[0.25em] font-normal">FOODS</span>
            </span>
          </a>

          <!-- ── Desktop Links ── -->
          <div class="hidden md:flex items-center gap-7" role="menubar">
            <a href="/index.html"       class="nav-link text-sm font-medium text-gray-600 hover:text-forest transition-colors duration-200" role="menuitem">${t('nav.home', lang)}</a>
            <a href="/products.html"    class="nav-link text-sm font-medium text-gray-600 hover:text-forest transition-colors duration-200" role="menuitem">${t('nav.products', lang)}</a>
            <a href="/index.html#story" class="nav-link text-sm font-medium text-gray-600 hover:text-forest transition-colors duration-200" role="menuitem">${t('nav.story', lang)}</a>
            <a href="/index.html#process" class="nav-link text-sm font-medium text-gray-600 hover:text-forest transition-colors duration-200" role="menuitem">${t('nav.process', lang)}</a>
          </div>

          <!-- ── Right Controls ── -->
          <div class="flex items-center gap-2">

            <!-- Language Toggle -->
            <button
              id="lang-toggle"
              class="hidden sm:inline-flex text-xs font-semibold px-3 py-1.5 rounded-full border border-[#D6E4F2] text-forest hover:bg-sage-light hover:border-forest/30 transition-all duration-200"
              aria-label="Switch language">
              ${lang === 'en' ? 'മലയാളം' : 'English'}
            </button>

            <!-- Cart -->
            <a href="/cart.html"
              class="relative p-2 text-forest hover:text-[#27598A] transition-colors duration-200 ml-1"
              aria-label="${t('nav.cart', lang)}">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-[22px] w-[22px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75" aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
              </svg>
              ${badgeHTML}
            </a>

            <!-- Mobile Hamburger -->
            <button
              id="mobile-menu-btn"
              class="md:hidden p-2 text-forest hover:text-[#27598A] transition-colors duration-200 ml-1"
              aria-label="Open navigation menu"
              aria-expanded="false"
              aria-controls="mobile-menu">
              <svg id="icon-menu"  class="h-5 w-5"        fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
              <svg id="icon-close" class="h-5 w-5 hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.75"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
            </button>
          </div>
        </div>
      </div>

      <!-- ── Mobile Menu ── -->
      <div id="mobile-menu"
        class="md:hidden hidden bg-white border-t border-[#D6E4F2]"
        aria-hidden="true"
        role="menu">
        <div class="px-5 py-6 space-y-1">
          <a href="/index.html"         class="mobile-nav-link flex items-center gap-3 py-3 text-[15px] font-medium text-gray-700 hover:text-forest border-b border-sage-light" role="menuitem">${t('nav.home', lang)}</a>
          <a href="/products.html"      class="mobile-nav-link flex items-center gap-3 py-3 text-[15px] font-medium text-gray-700 hover:text-forest border-b border-sage-light" role="menuitem">${t('nav.products', lang)}</a>
          <a href="/index.html#story"   class="mobile-nav-link flex items-center gap-3 py-3 text-[15px] font-medium text-gray-700 hover:text-forest border-b border-sage-light" role="menuitem">${t('nav.story', lang)}</a>
          <a href="/index.html#process" class="mobile-nav-link flex items-center gap-3 py-3 text-[15px] font-medium text-gray-700 hover:text-forest" role="menuitem">${t('nav.process', lang)}</a>

          <!-- Mobile language toggle -->
          <div class="pt-4">
            <button id="lang-toggle-mobile"
              class="w-full text-center text-sm font-semibold py-2.5 rounded-full border border-forest/30 text-forest hover:bg-sage-light transition-colors duration-200">
              ${lang === 'en' ? 'മലയാളത്തിൽ കാണൂ' : 'View in English'}
            </button>
          </div>
        </div>
      </div>
    </nav>
    <!-- Spacer for fixed navbar -->
    <div class="h-16 md:h-[72px]" aria-hidden="true"></div>
  `;
}

/** Attach navbar interactivity after rendering */
export function initNavbar() {
  // Scroll-shadow
  const nav = document.querySelector('.navbar');
  if (nav) {
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // Mobile menu toggle
  const btn      = document.getElementById('mobile-menu-btn');
  const menu     = document.getElementById('mobile-menu');
  const iconMenu  = document.getElementById('icon-menu');
  const iconClose = document.getElementById('icon-close');

  if (btn && menu) {
    btn.addEventListener('click', () => {
      const isOpen = !menu.classList.contains('hidden');
      menu.classList.toggle('hidden', isOpen);
      menu.setAttribute('aria-hidden', String(isOpen));
      btn.setAttribute('aria-expanded', String(!isOpen));
      iconMenu.classList.toggle('hidden', !isOpen);
      iconClose.classList.toggle('hidden', isOpen);
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!btn.contains(e.target) && !menu.contains(e.target)) {
        menu.classList.add('hidden');
        menu.setAttribute('aria-hidden', 'true');
        btn.setAttribute('aria-expanded', 'false');
        iconMenu.classList.remove('hidden');
        iconClose.classList.add('hidden');
      }
    });
  }

  // Language toggles
  const langBtn        = document.getElementById('lang-toggle');
  const langBtnMobile  = document.getElementById('lang-toggle-mobile');
  const toggle = () => setLang(getLang() === 'en' ? 'ml' : 'en');
  langBtn?.addEventListener('click', toggle);
  langBtnMobile?.addEventListener('click', toggle);

  // Active link highlight
  const path = window.location.pathname.replace(/\/$/, '') || '/index.html';
  document.querySelectorAll('.nav-link, .mobile-nav-link').forEach(link => {
    const href = link.getAttribute('href')?.split('#')[0];
    if (href && (path.endsWith(href) || (path === '' && href === '/index.html'))) {
      link.classList.add('text-forest', 'font-semibold');
    }
  });

  // Listen for cart updates to refresh badge
  window.addEventListener('bhumi:cart-updated', () => {
    const container = document.getElementById('nav-container');
    if (container) {
      container.innerHTML = renderNavbar();
      initNavbar();
    }
  });
}
