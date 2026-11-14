/**
 * Bhumi Foods — Admin Products List
 * Lists, filters, searches, deletes products and CSV import.
 */
import { requireAuth, initLogout } from './auth.js';
import { supabase } from '../config/supabase.js';

let allProducts   = [];
let currentFilter = 'all';
let searchQuery   = '';

async function init() {
  await requireAuth();
  initLogout();
  await loadProducts();
  initFilters();
  initSearch();
  initDeleteModal();
  initCSVImport();
}

async function loadProducts() {
  const tbody = document.getElementById('products-table-body');
  tbody.innerHTML = `<tr><td colspan="6" class="px-5 py-10 text-center text-sm text-gray-400">Loading products…</td></tr>`;

  const { data, error } = await supabase
    .from('products')
    .select(`id, name_en, name_ml, is_active, is_featured, featured_order,
             category:category_id(name_en),
             variants:product_variants(id, weight_label, price, stock_qty)`)
    .order('created_at', { ascending: false });

  if (error) {
    tbody.innerHTML = `<tr><td colspan="6" class="px-5 py-10 text-center text-sm text-red-500">Error: ${error.message}</td></tr>`;
    return;
  }
  allProducts = data || [];
  renderTable();
}

function renderTable() {
  const tbody = document.getElementById('products-table-body');
  let filtered = allProducts;

  if (currentFilter === 'active')   filtered = filtered.filter(p => p.is_active);
  if (currentFilter === 'inactive') filtered = filtered.filter(p => !p.is_active);
  if (currentFilter === 'featured') filtered = filtered.filter(p => p.is_featured);
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    filtered = filtered.filter(p =>
      p.name_en.toLowerCase().includes(q) || (p.name_ml || '').includes(q));
  }

  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="px-5 py-10 text-center text-sm text-gray-400">No products found.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map((p, i) => {
    const minPrice = p.variants?.length ? Math.min(...p.variants.map(v => v.price)) : null;
    const stock    = p.variants?.reduce((s, v) => s + (v.stock_qty || 0), 0) ?? 0;
    const catName  = p.category?.name_en || '—';
    return `
      <tr class="border-b border-sage/50 hover:bg-sage-light/40 transition-colors">
        <td class="px-5 py-3.5 text-xs text-gray-400">${i + 1}</td>
        <td class="px-5 py-3.5">
          <p class="font-medium text-sm text-gray-800">${p.name_en}</p>
          ${p.name_ml ? `<p class="text-xs text-gray-400 mt-0.5">${p.name_ml}</p>` : ''}
          ${minPrice !== null ? `<p class="text-xs text-forest mt-0.5">From ₹${minPrice} · Stock: ${stock}</p>` : ''}
        </td>
        <td class="px-5 py-3.5 text-sm text-gray-600 hidden md:table-cell">${catName}</td>
        <td class="px-5 py-3.5 text-sm text-gray-600 hidden lg:table-cell">${p.variants?.length || 0} variant(s)</td>
        <td class="px-5 py-3.5">
          <span class="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${p.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}">
            ${p.is_active ? 'Active' : 'Draft'}
          </span>
          ${p.is_featured ? `<span class="ml-1 text-xs font-medium px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">★ Featured</span>` : ''}
        </td>
        <td class="px-5 py-3.5 text-right">
          <div class="flex items-center justify-end gap-2">
            <a href="/admin/products/edit.html?id=${p.id}" class="text-xs font-medium text-forest hover:underline">Edit</a>
            <button class="text-xs font-medium text-red-500 hover:underline delete-btn"
              data-id="${p.id}" data-name="${p.name_en}">Delete</button>
          </div>
        </td>
      </tr>`;
  }).join('');

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => openDeleteModal(btn.dataset.id, btn.dataset.name));
  });
}

function initFilters() {
  document.querySelectorAll('[data-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-filter]').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      currentFilter = btn.dataset.filter;
      renderTable();
    });
  });
}

function initSearch() {
  document.getElementById('search-input')?.addEventListener('input', e => {
    searchQuery = e.target.value.trim();
    renderTable();
  });
}

let pendingDeleteId = null;
function initDeleteModal() {
  document.getElementById('delete-cancel')?.addEventListener('click', closeDeleteModal);
  document.getElementById('delete-confirm')?.addEventListener('click', async () => {
    if (!pendingDeleteId) return;
    const { error } = await supabase.from('products').delete().eq('id', pendingDeleteId);
    if (!error) { allProducts = allProducts.filter(p => p.id !== pendingDeleteId); renderTable(); }
    closeDeleteModal();
  });
}
function openDeleteModal(id, name) {
  pendingDeleteId = id;
  document.getElementById('delete-modal')?.classList.remove('hidden');
}
function closeDeleteModal() {
  pendingDeleteId = null;
  document.getElementById('delete-modal')?.classList.add('hidden');
}

/* ══════════════════════════════════════════════════════════
   CSV IMPORT
   ══════════════════════════════════════════════════════════ */

const CSV_TEMPLATE = [
  'name_en,name_ml,description_en,category_slug,is_active,is_featured,weight_label,price,stock_qty',
  'Kerala Chilli Powder,കേരള മുളക് പൊടി,Freshly ground red chilli powder,chilli-powders,true,false,100g,45,100',
  'Kerala Chilli Powder,കേരള മുളക് പൊടി,Freshly ground red chilli powder,chilli-powders,true,false,250g,95,50',
  'Kerala Chilli Powder,കേരള മുളക് പൊടി,Freshly ground red chilli powder,chilli-powders,true,true,500g,170,30',
  'Turmeric Powder,മഞ്ഞൾ പൊടി,Pure Kerala turmeric powder,turmeric-powders,true,false,100g,40,80',
  'Turmeric Powder,മഞ്ഞൾ പൊടി,Pure Kerala turmeric powder,turmeric-powders,true,false,250g,85,40',
].join('\n');

let parsedCSVRows   = [];
let categorySlugMap = {};

function initCSVImport() {
  document.getElementById('csv-import-btn')?.addEventListener('click', openCSVModal);
  document.getElementById('csv-modal-close')?.addEventListener('click', closeCSVModal);
  document.getElementById('csv-modal-cancel')?.addEventListener('click', closeCSVModal);
  document.getElementById('download-template-btn')?.addEventListener('click', downloadTemplate);
  document.getElementById('csv-import-confirm')?.addEventListener('click', runImport);

  const dropZone  = document.getElementById('csv-drop-zone');
  const fileInput = document.getElementById('csv-file-input');

  dropZone?.addEventListener('click', () => fileInput.click());
  dropZone?.addEventListener('dragover',  e => { e.preventDefault(); dropZone.classList.add('border-forest'); });
  dropZone?.addEventListener('dragleave', () => dropZone.classList.remove('border-forest'));
  dropZone?.addEventListener('drop', e => {
    e.preventDefault(); dropZone.classList.remove('border-forest');
    handleCSVFile(e.dataTransfer.files[0]);
  });
  fileInput?.addEventListener('change', () => handleCSVFile(fileInput.files[0]));
}

function openCSVModal()  { resetCSVModal(); document.getElementById('csv-modal')?.classList.remove('hidden'); }
function closeCSVModal() { document.getElementById('csv-modal')?.classList.add('hidden'); resetCSVModal(); }

function resetCSVModal() {
  parsedCSVRows = [];
  document.getElementById('csv-preview')?.classList.add('hidden');
  document.getElementById('csv-status')?.classList.add('hidden');
  document.getElementById('csv-import-confirm')?.classList.add('hidden');
  const body = document.getElementById('csv-preview-body');
  if (body) body.innerHTML = '';
  const fi = document.getElementById('csv-file-input');
  if (fi) fi.value = '';
}

function downloadTemplate() {
  const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = 'bhumi-products-template.csv'; a.click();
  URL.revokeObjectURL(url);
}

function handleCSVFile(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => parseAndPreviewCSV(e.target.result);
  reader.readAsText(file, 'UTF-8');
}

function parseCSV(text) {
  const lines = text.trim().split('\n').map(l => l.trim()).filter(Boolean);
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
  return lines.slice(1).map((line, i) => {
    const vals = []; let cur = '', inQ = false;
    for (const ch of line + ',') {
      if (ch === '"') inQ = !inQ;
      else if (ch === ',' && !inQ) { vals.push(cur.trim()); cur = ''; }
      else cur += ch;
    }
    const row = {};
    headers.forEach((h, j) => { row[h] = (vals[j] || '').replace(/"/g, '').trim(); });
    row._line = i + 2;
    return row;
  });
}

function parseAndPreviewCSV(text) {
  const rows = parseCSV(text);
  if (!rows.length) { setStatus('error', 'Could not parse CSV. Check your headers.'); return; }

  const errors = [];
  rows.forEach(r => {
    if (!r.name_en)                 errors.push(`Row ${r._line}: Missing name_en`);
    if (!r.category_slug)           errors.push(`Row ${r._line}: Missing category_slug`);
    if (!r.weight_label)            errors.push(`Row ${r._line}: Missing weight_label`);
    if (isNaN(parseFloat(r.price))) errors.push(`Row ${r._line}: Invalid price "${r.price}"`);
  });

  if (errors.length) {
    setStatus('error', 'Fix these errors before importing:<br>' +
      errors.slice(0, 5).join('<br>') + (errors.length > 5 ? `<br>…and ${errors.length - 5} more.` : ''));
    return;
  }

  parsedCSVRows = rows;
  document.getElementById('csv-preview-body').innerHTML = rows.map(r => `
    <tr class="border-b border-sage/40">
      <td class="px-3 py-2 font-medium text-gray-800">${r.name_en}</td>
      <td class="px-3 py-2 text-gray-500">${r.category_slug}</td>
      <td class="px-3 py-2 text-gray-700">${r.weight_label}</td>
      <td class="px-3 py-2 text-gray-700">₹${r.price}</td>
      <td class="px-3 py-2 text-gray-700">${r.stock_qty || 0}</td>
      <td class="px-3 py-2">
        <span class="text-xs px-1.5 py-0.5 rounded-full ${r.is_active === 'true' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}">
          ${r.is_active === 'true' ? 'Active' : 'Draft'}
        </span>
      </td>
    </tr>`).join('');

  document.getElementById('csv-preview-label').textContent = `Preview — ${rows.length} variant row(s)`;
  document.getElementById('csv-preview')?.classList.remove('hidden');
  document.getElementById('csv-import-confirm')?.classList.remove('hidden');
  setStatus('info', `${rows.length} rows parsed successfully. Review above then click "Import Products".`);
}

async function runImport() {
  if (!parsedCSVRows.length) return;
  const btn = document.getElementById('csv-import-confirm');
  btn.textContent = 'Importing…'; btn.disabled = true;

  const { data: cats } = await supabase.from('categories').select('id, slug');
  categorySlugMap = {};
  (cats || []).forEach(c => { categorySlugMap[c.slug] = c.id; });

  // Group rows by product name_en (one product = many variant rows)
  const productMap = new Map();
  for (const row of parsedCSVRows) {
    const key = row.name_en.trim();
    if (!productMap.has(key)) {
      productMap.set(key, {
        meta: {
          name_en:        row.name_en.trim(),
          name_ml:        row.name_ml?.trim() || null,
          description_en: row.description_en?.trim() || null,
          category_id:    categorySlugMap[row.category_slug] || null,
          is_active:      row.is_active === 'true',
          is_featured:    row.is_featured === 'true',
        },
        variants: [],
      });
    }
    productMap.get(key).variants.push({
      weight_label: row.weight_label.trim(),
      price:        parseFloat(row.price),
      stock_qty:    parseInt(row.stock_qty) || 0,
      is_available: true,
    });
  }

  let inserted = 0, skipped = 0, failed = 0;
  const failedNames = [];

  for (const [name, { meta, variants }] of productMap) {
    // Skip if already exists
    const { data: existing } = await supabase
      .from('products').select('id').eq('name_en', name).maybeSingle();
    if (existing) { skipped++; continue; }

    const { data: product, error } = await supabase
      .from('products').insert(meta).select().single();

    if (error || !product) { failed++; failedNames.push(name); continue; }

    await supabase.from('product_variants').insert(
      variants.map(v => ({ ...v, product_id: product.id }))
    );
    inserted++;
  }

  btn.textContent = 'Import Products'; btn.disabled = false;

  let msg = `Import complete! ${inserted} product(s) added.`;
  if (skipped) msg += ` ${skipped} skipped (already exist).`;
  if (failed)  msg += ` ${failed} failed: ${failedNames.join(', ')}.`;

  setStatus(failed ? 'error' : 'success', msg);
  document.getElementById('csv-import-confirm')?.classList.add('hidden');
  await loadProducts();
}

function setStatus(type, html) {
  const el = document.getElementById('csv-status');
  if (!el) return;
  el.className = 'mt-3 text-sm px-4 py-3 rounded-sm ' + (
    type === 'error'   ? 'bg-red-50 border border-red-200 text-red-700' :
    type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' :
                         'bg-cream border border-beige/30 text-gray-700');
  el.innerHTML = html;
  el.classList.remove('hidden');
}

init();
