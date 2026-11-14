/**
 * Bhumi Foods — Cloudinary Configuration
 *
 * SETUP:
 * 1. Go to cloudinary.com → Dashboard → copy your Cloud Name
 * 2. Go to Settings → Upload → Upload Presets → Add preset
 *    - Signing Mode: Unsigned
 *    - Folder: bhumi  (optional)
 *    - Save and copy the Preset Name
 * 3. Replace the values below
 */

export const CLOUDINARY_CLOUD_NAME  = 'YOUR_CLOUD_NAME';   // e.g. 'dxyz123abc'
export const CLOUDINARY_UPLOAD_PRESET = 'YOUR_PRESET_NAME'; // e.g. 'bhumi_unsigned'

/** True once credentials are filled in */
export const isCloudinaryReady =
  !CLOUDINARY_CLOUD_NAME.includes('YOUR_') &&
  !CLOUDINARY_UPLOAD_PRESET.includes('YOUR_');
