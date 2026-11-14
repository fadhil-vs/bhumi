/**
 * Bhumi Foods — Safe DOM Utilities
 */

/**
 * Safely query a selector and throw a clear error if missing.
 * @param {string} selector
 * @param {Element|Document} [root=document]
 */
export function $(selector, root = document) {
  return root.querySelector(selector);
}

/**
 * Query all matching elements.
 * @returns {Element[]}
 */
export function $$(selector, root = document) {
  return Array.from(root.querySelectorAll(selector));
}

/**
 * Set innerHTML safely and return the container.
 */
export function setHTML(el, html) {
  if (!el) return null;
  el.innerHTML = html;
  return el;
}

/**
 * Show a loading skeleton inside a container.
 * @param {Element} container
 * @param {number}  count      - number of skeleton cards
 * @param {string}  height     - CSS height of each skeleton
 */
export function showSkeletons(container, count = 4, height = '280px') {
  if (!container) return;
  container.innerHTML = Array.from({ length: count })
    .map(() => `<div class="skeleton rounded-sm" style="height:${height}"></div>`)
    .join('');
}

/**
 * Show a full-width error message inside a container.
 */
export function showError(container, message = 'Something went wrong.') {
  if (!container) return;
  container.innerHTML = `
    <div class="col-span-full text-center py-12 text-sm text-gray-500">
      <p>${message}</p>
    </div>
  `;
}

/**
 * Scroll to an anchor section smoothly.
 * @param {string} id - element id (without #)
 */
export function scrollTo(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Run a callback when the DOM is ready.
 */
export function onReady(fn) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fn, { once: true });
  } else {
    fn();
  }
}

/**
 * Debounce a function call.
 */
export function debounce(fn, ms = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

/**
 * Add a scroll listener that marks the navbar as 'scrolled'
 * when the page scrolls past a threshold.
 */
export function initScrollSpy(selector = '.navbar', threshold = 60) {
  const el = document.querySelector(selector);
  if (!el) return;
  const handler = () => {
    el.classList.toggle('scrolled', window.scrollY > threshold);
  };
  window.addEventListener('scroll', handler, { passive: true });
  handler(); // Run immediately
}
