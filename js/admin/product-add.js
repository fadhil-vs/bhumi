/**
 * Bhumi Foods — Add Product Admin JS
 * Images uploaded to Cloudinary, data saved to Supabase.
 */
import { requireAuth, initLogout } from './auth.js';
import { supabase } from '../config/supabase.js';
import { uploadToCloudinary } from '../utils/cloudinary.js';

// Collected image URLs after Cloudinary upload
let uploadedImageUrls = [];

async function init() {
  await requireAuth();
  initLogout();
  await loadCategories();
  initVariants();
  initImageUpload();
  initFeaturedToggle();
  initSave();
}

async function loadCategories() {
  const sel = document.getElementById('category_id');
  const { data } = await supabase.from('categories').select('id, name_en').eq('is_active', true).order('display_order');
  if (data) data.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.id; opt.textContent = c.name_en;
    sel.appendChild(opt);
  });
}

function initVariants() {
  const container = document.getElementById('variants-container');
  const tmpl      = document.getElementById('variant-row-template');
  document.getElementById('add-variant-btn')?.addEventListener('click', () => addRow());

  function addRow() {
    const clone = tmpl.content.cloneNode(true);
    clone.querySelector('.remove-variant')?.addEventListener('click', e => e.target.closest('.variant-row').remove());
    container.appendChild(clone);
  }
  addRow(); // start with one row
}

function initImageUpload() {
  const zone    = document.getElementById('image-drop-zone');
  const input   = document.getElementById('image-input');
  const grid    = document.getElementById('image-preview-grid');
  const statusEl = document.createElement('p');
  statusEl.className = 'text-xs text-gray-500 mt-2';
  zone?.parentNode.insertBefore(statusEl, grid);

  zone?.addEventListener('click',    () => input.click());
  zone?.addEventListener('dragover', e  => { e.preventDefault(); zone.classList.add('border-forest'); });
  zone?.addEventListener('dragleave', () => zone.classList.remove('border-forest'));
  zone?.addEventListener('drop', e => { e.preventDefault(); zone.classList.remove('border-forest'); handleFiles(e.dataTransfer.files); });
  input?.addEventListener('change', () => handleFiles(input.files));

  async function handleFiles(files) {
    for (const file of [...files].slice(0, 6 - uploadedImageUrls.length)) {
      // Local preview
      const wrap = document.createElement('div');
      wrap.className = 'relative group';
      const img = document.createElement('img');
      img.className = 'w-full aspect-square object-cover rounded-sm border border-sage opacity-50';
      wrap.appendChild(img);

      const loader = document.createElement('div');
      loader.className = 'absolute inset-0 flex items-center justify-center text-xs text-gray-500';
      loader.textContent = 'Uploading…';
      wrap.appendChild(loader);
      grid.appendChild(wrap);

      const reader = new FileReader();
      reader.onload = e => { img.src = e.target.result; };
      reader.readAsDataURL(file);

      // Upload to Cloudinary
      statusEl.textContent = `Uploading ${file.name}…`;
      const result = await uploadToCloudinary(file, 'bhumi/products');

      if (result) {
        img.style.opacity = '1';
        loader.remove();
        uploadedImageUrls.push(result.url);

        const removeBtn = document.createElement('button');
        removeBtn.type = 'button';
        removeBtn.className = 'absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 text-xs hidden group-hover:flex items-center justify-center';
        removeBtn.textContent = '×';
        removeBtn.addEventListener('click', () => {
          uploadedImageUrls = uploadedImageUrls.filter(u => u !== result.url);
          wrap.remove();
        });
        wrap.appendChild(removeBtn);
        statusEl.textContent = `${uploadedImageUrls.length} image(s) uploaded.`;
      } else {
        loader.textContent = 'Failed';
        loader.className = 'absolute inset-0 flex items-center justify-center text-xs text-red-500';
        statusEl.textContent = 'Upload failed — check Cloudinary config.';
      }

      input.value = '';
    }
  }
}

function initFeaturedToggle() {
  document.getElementById('is_featured')?.addEventListener('change', e => {
    document.getElementById('featured-order-wrap')?.classList.toggle('hidden', !e.target.checked);
  });
}

function initSave() {
  document.getElementById('save-btn')?.addEventListener('click',       () => save(true));
  document.getElementById('save-draft-btn')?.addEventListener('click', () => save(false));
}

async function save(isActive) {
  const errBox = document.getElementById('form-error');
  errBox?.classList.add('hidden');

  const name_en     = document.getElementById('name_en')?.value.trim();
  const category_id = document.getElementById('category_id')?.value;
  if (!name_en)     { showError('Product name (English) is required.'); return; }
  if (!category_id) { showError('Please select a category.'); return; }

  const rows     = document.querySelectorAll('.variant-row');
  const variants = [];
  for (const row of rows) {
    const wl = row.querySelector('[name="weight_label"]')?.value.trim();
    const pr = parseFloat(row.querySelector('[name="price"]')?.value);
    const sq = parseInt(row.querySelector('[name="stock_qty"]')?.value) || 0;
    const av = row.querySelector('[name="is_available"]')?.checked ?? true;
    if (wl && !isNaN(pr)) variants.push({ weight_label: wl, price: pr, stock_qty: sq, is_available: av });
  }
  if (!variants.length) { showError('Add at least one weight/price variant.'); return; }

  const btn = document.getElementById('save-btn');
  btn.textContent = 'Saving…'; btn.disabled = true;

  const { data: product, error } = await supabase.from('products').insert({
    name_en,
    name_ml:        document.getElementById('name_ml')?.value.trim() || null,
    description_en: document.getElementById('description_en')?.value.trim() || null,
    description_ml: document.getElementById('description_ml')?.value.trim() || null,
    category_id,
    is_active:      isActive,
    is_featured:    document.getElementById('is_featured')?.checked ?? false,
    featured_order: parseInt(document.getElementById('featured_order')?.value) || null,
  }).select().single();

  if (error) { showError(error.message); btn.textContent = 'Publish Product'; btn.disabled = false; return; }

  // Insert variants
  if (variants.length) {
    await supabase.from('product_variants').insert(variants.map(v => ({ ...v, product_id: product.id })));
  }

  // Insert images (Cloudinary URLs stored as storage_path)
  if (uploadedImageUrls.length) {
    await supabase.from('product_images').insert(
      uploadedImageUrls.map((url, i) => ({ product_id: product.id, storage_path: url, position: i }))
    );
  }

  window.location.href = '/admin/products/index.html';
}

function showError(msg) {
  const errBox = document.getElementById('form-error');
  if (errBox) { errBox.textContent = msg; errBox.classList.remove('hidden'); }
}

init();
