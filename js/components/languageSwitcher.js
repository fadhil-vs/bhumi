/**
 * Bhumi Foods — Language Switcher Component
 * Standalone floating switcher (used in nav & footer).
 * Re-exported from i18n for convenience.
 */

export { getLang, setLang } from '../utils/i18n.js';

/**
 * Render an inline language toggle button.
 * @param {string} currentLang - 'en' | 'ml'
 * @param {string} [className] - additional CSS classes
 */
export function renderLangToggle(currentLang = 'en', className = '') {
  return `
    <button
      class="lang-toggle text-xs font-semibold px-3.5 py-1.5 rounded-full border border-current
             hover:bg-black/5 transition-colors duration-200 ${className}"
      aria-label="Switch language"
      data-current="${currentLang}">
      ${currentLang === 'en' ? 'മലയാളം' : 'English'}
    </button>
  `;
}

/** Attach click handler to any .lang-toggle button */
export function initLangToggle() {
  document.querySelectorAll('.lang-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
      const { setLang, getLang } = window.__bhumi_i18n__ || {};
      const next = btn.dataset.current === 'en' ? 'ml' : 'en';
      localStorage.setItem('bhumi_lang', next);
      window.location.reload();
    });
  });
}
