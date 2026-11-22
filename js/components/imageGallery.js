/**
 * Bhumi Foods — Image Gallery Component
 * Product detail image viewer with thumbnails.
 */

import { resolveImageUrl } from '../utils/format.js';

/**
 * @param {Array}  images   - product_images rows sorted by position
 * @param {string} altText  - accessibility alt text
 * @returns {string} HTML
 */
export function renderImageGallery(images, altText = 'Product image') {
  if (!images || images.length === 0) {
    return `
      <div class="gallery-empty aspect-square bg-sage-light flex items-center justify-center">
        <img src="/assets/images/product-placeholder.svg" alt="${altText}" class="w-2/3 opacity-60">
      </div>
    `;
  }

  const sorted = [...images].sort((a, b) => a.position - b.position);
  const toUrl  = (path) => path
    ? resolveImageUrl(path)
    : '/assets/images/product-placeholder.svg';

  return /* html */`
    <div class="product-gallery">
      <!-- Main Image -->
      <div class="gallery-main aspect-square bg-sage-light overflow-hidden mb-3">
        <img
          id="gallery-main-img"
          src="${toUrl(sorted[0].storage_path)}"
          alt="${altText}"
          class="w-full h-full object-cover"
          loading="eager"
          onerror="this.src='/assets/images/product-placeholder.svg'">
      </div>

      <!-- Thumbnails (only if >1 image) -->
      ${sorted.length > 1 ? `
        <div class="grid grid-cols-5 gap-2" id="gallery-thumbs" role="listbox" aria-label="Product images">
          ${sorted.map((img, i) => `
            <button
              type="button"
              class="gallery-thumb overflow-hidden ${i === 0 ? 'active' : ''}"
              role="option"
              aria-selected="${i === 0}"
              data-src="${toUrl(img.storage_path)}"
              data-index="${i}"
              aria-label="Image ${i + 1}">
              <img
                src="${toUrl(img.storage_path)}"
                alt="${altText} ${i + 1}"
                class="w-full h-full object-cover"
                loading="lazy"
                onerror="this.src='/assets/images/product-placeholder.svg'">
            </button>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `;
}

/** Attach thumbnail click behaviour */
export function initImageGallery() {
  const thumbsContainer = document.getElementById('gallery-thumbs');
  const mainImg         = document.getElementById('gallery-main-img');
  if (!thumbsContainer || !mainImg) return;

  thumbsContainer.addEventListener('click', (e) => {
    const thumb = e.target.closest('.gallery-thumb');
    if (!thumb) return;

    // Update main image
    mainImg.style.opacity = '0';
    setTimeout(() => {
      mainImg.src = thumb.dataset.src;
      mainImg.style.opacity = '1';
    }, 150);

    // Update active state
    thumbsContainer.querySelectorAll('.gallery-thumb').forEach(t => {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
    });
    thumb.classList.add('active');
    thumb.setAttribute('aria-selected', 'true');
  });

  // Smooth fade transition on main image
  mainImg.style.transition = 'opacity 150ms ease';
}
