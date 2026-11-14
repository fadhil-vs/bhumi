/**
 * Bhumi Foods — Edit Product Admin JS
 * Images uploaded to Supabase Storage.
 */
import { requireAuth, initLogout } from './auth.js';
import { supabase } from '../config/supabase.js';

const productId = new URLSearchParams(location.search).get('id');

async function init() {
  await requireAuth();
  initLogout();
  if (!productId) { window.location.href = '/admin/products/index.html'; return; }
  await loadCategories();
  await loadProduct();
  initFeaturedToggle();
  initSave();
  initDelete();
}

async function loadCategories() {
  const sel = document.getElementById('category_id');
  const { data } = await supabase.from('categories').select('id, name_en').order('display_order');
  if (data) data.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.id; opt.textContent = c.name_en;
    sel.appendChild(opt);
  });
}

async function loadProduct() {
  const loadingEl = document.getElementById('loading-state');
  const formEl    = document.getElementById('edit-product-form');

  const { data, error } = await supabase
    .from('products')
    .select('*, variants:product_variants(*), images:product_images(*)')
    .eq('id', productId)
    .single();

  if (error || !data) {
    if (loadingEl) loadingEl.textContent = 'Product not found.';
    return;
  }

  loadingEl?.classList.add('hidden');
  formEl?.classList.remove('hidden');

  document.getElementById('page-title').textContent  = `Edit: ${data.name_en}`;
  document.getElementById('name_en').value            = data.name_en || '';
  document.getElementById('name_ml').value            = data.name_ml || '';
  document.getElementById('description_en').value     = data.description_en || '';
  document.getElementById('description_ml').value     = data.description_ml || '';
  document.getElementById('category_id').value        = data.category_id || '';
  document.getElementById('is_active').checked        = data.is_active;
  document.getElementById('is_featured').checked      = data.is_featured;

  if (data.featured_order) {
    document.getElementById('featured_order').value = data.featured_order;
    document.getElementById('featured-order-wrap')?.classList.remove('hidden');
  }

  const container = document.getElementById('variants-container');
  container.innerHTML = '';
  (data.variants || []).forEach(v => addVariantRow(v));
  document.getElementById('add-variant-btn')?.addEventListener('click', () => addVariantRow());

  (data.images || []).forEach(img => addImagePreview(img.storage_path, img.id));
  initImageUpload();
}

function addVariantRow(v = {}) {
  const container = document.getElementById('variants-container');
  const tmpl      = document.getElementById('variant-row-template');
  const clone     = tmpl.content.cloneNode(true);
  const row       = clone.querySelector('.variant-row');

  if (v.id) row.dataset.variantId = v.id;
  row.querySelector('[name="weight_label"]').value   = v.weight_label || '';
  row.querySelector('[name="price"]').value          = v.price || '';
  row.querySelector('[name="stock_qty"]').value      = v.stock_qty ?? 0;
  row.querySelector('[name="is_available"]').checked = v.is_available ?? true;

  row.querySelector('.remove-variant')?.addEventListener('click', async () => {
    if (v.id) await supabase.from('product_variants').delete().eq('id', v.id);
    row.remove();
  });
  container.appendChild(clone);
}

function addImagePreview(url, dbId = null) {
  const grid = document.getElementById('image-preview-grid');
  const wrap = document.createElement('div');
  wrap.className = 'relative group';
  wrap.innerHTML = `
    <img src="${url}" class="w-full aspect-square object-cover rounded-sm border border-sage">
    <button type="button" class="remove-img absolute top-1 right-1 bg-black/60 text-white rounded-full w-5 h-5 text-xs hidden group-hover:flex items-center justify-center">×</button>`;
  wrap.querySelector('.remove-img').addEventListener('click', async () => {
    if (dbId) await supabase.from('product_images').delete().eq('id', dbId);
    wrap.remove();
  });
  grid.appendChild(wrap);
}

function initImageUpload() {
  const zone    = document.getElementById('image-drop-zone');
  const input   = document.getElementById('image-input');
  const statusEl = document.createElement('p');
  statusEl.className = 'text-xs text-gray-500 mt-2';
  zone?.parentNode?.appendChild(statusEl);

  zone?.addEventListener('click',    () => input.click());
  zone?.addEventListener('dragover', e  => { e.preventDefault(); zone.classList.add('border-forest'); });
  zone?.addEventListener('dragleave', () => zone.classList.remove('border-forest'));
  zone?.addEventListener('drop', e => { e.preventDefault(); zone.classList.remove('border-forest'); handleFiles(e.dataTransfer.files, statusEl); });
  input?.addEventListener('change', () => handleFiles(input.files, statusEl));
}

async function handleFiles(files, statusEl) {
  for (const file of [...files].slice(0, 6)) {
    statusEl.textContent = `Uploading ${file.name}…`;

    const tempUrl = URL.createObjectURL(file);
    const grid    = document.getElementById('image-preview-grid');
    const wrap    = document.createElement('div');
    wrap.className = 'relative group opacity-50';
    wrap.innerHTML = `<img src="${tempUrl}" class="w-full aspect-square object-cover rounded-sm border border-sage"><div class="absolute inset-0 flex items-center justify-center text-xs text-white bg-black/30">Uploading…</div>`;
    grid.appendChild(wrap);

    const url = await uploadToSupabase(file);

    if (url) {
      const { data: imgRow } = await supabase
        .from('product_images')
        .insert({ product_id: productId, storage_path: url, position: grid.children.length })
        .select().single();
      wrap.remove();
      addImagePreview(url, imgRow?.id || null);
      statusEl.textContent = '✓ Image uploaded.';
    } else {
      wrap.innerHTML = `<div class="w-full aspect-square bg-red-50 rounded-sm border border-red-200 flex items-center justify-center text-xs text-red-500">Upload failed</div>`;
      statusEl.textContent = '✗ Upload failed.';
    }

    URL.revokeObjectURL(tempUrl);
    document.getElementById('image-input').value = '';
  }
}

async function uploadToSupabase(file) {
  const ext  = file.name.split('.').pop();
  const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from('product-images').upload(path, file, { upsert: false });
  if (error) { console.error('Upload error:', error.message); return null; }
  const { data } = supabase.storage.from('product-images').getPublicUrl(path);
  return data.publicUrl;
}

function initFeaturedToggle() {
  document.getElementById('is_featured')?.addEventListener('change', e => {
    document.getElementById('featured-order-wrap')?.classList.toggle('hidden', !e.target.checked);
  });
}

function initSave() {
  document.getElementById('save-btn')?.addEventListener('click', async () => {
    const btn    = document.getElementById('save-btn');
    const errBox = document.getElementById('form-error');
    errBox?.classList.add('hidden');

    const name_en     = document.getElementById('name_en')?.value.trim();
    const category_id = document.getElementById('category_id')?.value;
    if (!name_en)     { showError('Product name (English) is required.'); return; }
    if (!category_id) { showError('Please select a category.'); return; }

    btn.textContent = 'Saving…'; btn.disabled = true;

    const { error } = await supabase.from('products').update({
      name_en,
      name_ml:        document.getElementById('name_ml')?.value.trim() || null,
      description_en: document.getElementById('description_en')?.value.trim() || null,
      description_ml: document.getElementById('description_ml')?.value.trim() || null,
      category_id,
      is_active:      document.getElementById('is_active')?.checked,
      is_featured:    document.getElementById('is_featured')?.checked,
      featured_order: parseInt(document.getElementById('featured_order')?.value) || null,
    }).eq('id', productId);

    if (error) { showError(error.message); btn.textContent = 'Save Changes'; btn.disabled = false; return; }

    for (const row of document.querySelectorAll('.variant-row')) {
      const wl = row.querySelector('[name="weight_label"]')?.value.trim();
      const pr = parseFloat(row.querySelector('[name="price"]')?.value);
      const sq = parseInt(row.querySelector('[name="stock_qty"]')?.value) || 0;
      const av = row.querySelector('[name="is_available"]')?.checked ?? true;
      if (!wl || isNaN(pr)) continue;
      const payload = { product_id: productId, weight_label: wl, price: pr, stock_qty: sq, is_available: av };
      if (row.dataset.variantId) {
        await supabase.from('product_variants').update(payload).eq('id', row.dataset.variantId);
      } else {
        const { data: newV } = await supabase.from('product_variants').insert(payload).select().single();
        if (newV) row.dataset.variantId = newV.id;
      }
    }

    btn.textContent = 'Saved ✓';
    setTimeout(() => { btn.textContent = 'Save Changes'; btn.disabled = false; }, 1500);
  });
}

function initDelete() {
  document.getElementById('delete-btn')?.addEventListener('click', async () => {
    if (!confirm('Delete this product permanently? Cannot be undone.')) return;
    await supabase.from('products').delete().eq('id', productId);
    window.location.href = '/admin/products/index.html';
  });
}

function showError(msg) {
  const el = document.getElementById('form-error');
  if (el) { el.textContent = msg; el.classList.remove('hidden'); }
}

init();
