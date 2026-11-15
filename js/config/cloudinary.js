/**
 * Bhumi Foods — Cloudinary Configuration
 *
 * Credentials can be set via:
 * 1. window.__ENV__ in env.js (ignored in git)
 * 2. Or replace fallback placeholders below
 */

const env = (typeof window !== 'undefined' && window.__ENV__) || {};

export const CLOUDINARY_CLOUD_NAME    = env.CLOUDINARY_CLOUD_NAME || 'YOUR_CLOUDINARY_CLOUD_NAME';
export const CLOUDINARY_UPLOAD_PRESET = env.CLOUDINARY_UPLOAD_PRESET || 'YOUR_CLOUDINARY_UPLOAD_PRESET';

/** True once credentials are filled in */
export const isCloudinaryReady =
  !CLOUDINARY_CLOUD_NAME.includes('YOUR_') &&
  !CLOUDINARY_UPLOAD_PRESET.includes('YOUR_');
