/**
 * Bhumi Foods — Cloudinary Upload Utility
 * Unsigned upload — safe to use in frontend.
 */

import { CLOUDINARY_CLOUD_NAME, CLOUDINARY_UPLOAD_PRESET, isCloudinaryReady } from '../config/cloudinary.js';

/**
 * Upload a File to Cloudinary.
 * @param {File}   file    - The image file to upload
 * @param {string} folder  - Subfolder inside your Cloudinary account e.g. 'bhumi/products'
 * @returns {Promise<{ url: string, publicId: string } | null>}
 */
export async function uploadToCloudinary(file, folder = 'bhumi') {
  if (!isCloudinaryReady) {
    console.error('[Cloudinary] Not configured. Open js/config/cloudinary.js and add your credentials.');
    return null;
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('folder', folder);

  try {
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      { method: 'POST', body: formData }
    );

    if (!res.ok) {
      const err = await res.json();
      console.error('[Cloudinary] Upload error:', err);
      return null;
    }

    const data = await res.json();
    return {
      url:      data.secure_url,   // https://res.cloudinary.com/...
      publicId: data.public_id,
    };
  } catch (e) {
    console.error('[Cloudinary] Network error:', e);
    return null;
  }
}

/**
 * Create a drag-and-drop upload zone wired to Cloudinary.
 *
 * @param {Object} opts
 * @param {string}   opts.dropZoneId   - ID of the drop zone element
 * @param {string}   opts.fileInputId  - ID of the hidden file input
 * @param {string}   opts.previewId    - ID of the img element to preview (optional)
 * @param {string}   opts.folder       - Cloudinary folder
 * @param {Function} opts.onUpload     - Callback(url, publicId) called after success
 * @param {Function} opts.onProgress   - Optional callback(message) for status updates
 */
export function initCloudinaryDropZone({ dropZoneId, fileInputId, previewId, folder = 'bhumi', onUpload, onProgress }) {
  const zone  = document.getElementById(dropZoneId);
  const input = document.getElementById(fileInputId);
  const preview = previewId ? document.getElementById(previewId) : null;

  if (!zone || !input) return;

  zone.addEventListener('click',    () => input.click());
  zone.addEventListener('dragover', e  => { e.preventDefault(); zone.classList.add('border-forest'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('border-forest'));
  zone.addEventListener('drop', e => {
    e.preventDefault(); zone.classList.remove('border-forest');
    handleFile(e.dataTransfer.files[0]);
  });
  input.addEventListener('change', () => handleFile(input.files[0]));

  async function handleFile(file) {
    if (!file) return;

    // Show local preview immediately
    if (preview) {
      const reader = new FileReader();
      reader.onload = e => { preview.src = e.target.result; preview.closest('[id$="-preview"]')?.classList.remove('hidden'); };
      reader.readAsDataURL(file);
    }

    onProgress?.('Uploading…');
    zone.style.pointerEvents = 'none';

    const result = await uploadToCloudinary(file, folder);

    zone.style.pointerEvents = '';
    input.value = '';

    if (result) {
      onProgress?.('Uploaded ✓');
      onUpload?.(result.url, result.publicId);
    } else {
      onProgress?.('Upload failed. Check Cloudinary config.');
    }
  }
}
