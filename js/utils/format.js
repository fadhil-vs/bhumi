/**
 * Bhumi Foods — Formatting Utilities
 */

/**
 * Format a number as Indian Rupees.
 * e.g. formatPrice(1250) → '₹1,250'
 */
export function formatPrice(amount) {
  if (typeof amount !== 'number' || isNaN(amount)) return '₹0';
  return '₹' + amount.toLocaleString('en-IN');
}

/**
 * Format a date string to a readable format.
 * e.g. formatDate('2024-01-15T10:00:00') → '15 Jan 2024'
 */
export function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

/**
 * Truncate text to a max length, appending '…'.
 */
export function truncate(str, maxLen = 80) {
  if (!str || str.length <= maxLen) return str || '';
  return str.slice(0, maxLen).trimEnd() + '…';
}

/**
 * Build a Supabase Storage public URL or resolve any relative image path.
 * @param {string} path    - file path inside the bucket, or full URL
 * @param {string} [bucket]- storage bucket name (default 'product-images')
 */
export function resolveImageUrl(path, bucket = 'product-images') {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const baseUrl = (typeof window !== 'undefined' && window.__ENV__?.SUPABASE_URL) || 'https://kjvxswuzbhcmtarxairm.supabase.co';
  return `${baseUrl}/storage/v1/object/public/${bucket}/${path.replace(/^\/+/, '')}`;
}

/**
 * Build a Supabase Storage public URL.
 * @param {string} bucket  - storage bucket name
 * @param {string} path    - file path inside the bucket
 * @param {string} baseUrl - Supabase project URL
 */
export function storageUrl(bucket, path, baseUrl) {
  if (!path || !baseUrl) return '';
  return `${baseUrl}/storage/v1/object/public/${bucket}/${path}`;
}

/**
 * Generate a WhatsApp click-to-chat URL.
 * @param {string} phone   - phone number with country code, digits only
 * @param {string} message - pre-filled message text
 */
export function whatsappUrl(phone, message) {
  const digits = phone.replace(/\D/g, '');
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

/**
 * Slugify a string for URL-safe usage.
 * e.g. 'Kerala Garam Masala' → 'kerala-garam-masala'
 */
export function slugify(str) {
  return str
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
}

/**
 * Parse query string parameters.
 * e.g. getParam('id') from ?id=abc
 */
export function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}
