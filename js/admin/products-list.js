/**
 * Bhumi Foods — Admin Products List
 * Lists, filters, searches and deletes products.
 */
import { requireAuth, initLogout } from './auth.js';
import { supabase } from '../config/supabase.js';

let allProducts = [];
let currentFilter = 'all';
let searchQuery   = '';

async function init() {
  await requireAuth();
  initLogout();
  await loadProducts();
  initFilters();
  initSearch();
  initDeleteModal();
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
    tbody.innerHTML = `<tr><td colspan="6" class="px-5 py-10 text-center text-sm text-red-500">Error loading products: ${error.message}</td></tr>`;
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
    filtered = filtered.filter(p => p.name_en.toLowerCase().includes(q) || (p.name_ml||'').includes(q));
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
          ${p.is_featured ? `<span class="ml-1 inline-flex items-center text-xs font-medium px-2 py-1 rounded-full bg-beige/30 text-beige-700">★ Featured</span>` : ''}
        </td>
        <td class="px-5 py-3.5 text-right">
          <div class="flex items-center justify-end gap-2">
            <a href="/admin/products/edit.html?id=${p.id}" class="text-xs font-medium text-forest hover:underline">Edit</a>
            <button class="text-xs font-medium text-red-500 hover:underline delete-btn" data-id="${p.id}" data-name="${p.name_en}">Delete</button>
          </div>
        </td>
      </tr>`;
  }).join('');

  // Attach delete listeners
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
    if (!error) {
      allProducts = allProducts.filter(p => p.id !== pendingDeleteId);
      renderTable();
    }
    closeDeleteModal();
  });
}

function openDeleteModal(id, name) {
  pendingDeleteId = id;
  const modal = document.getElementById('delete-modal');
  modal?.querySelector('p')?.setAttribute('data-name', name);
  modal?.classList.remove('hidden');
}

function closeDeleteModal() {
  pendingDeleteId = null;
  document.getElementById('delete-modal')?.classList.add('hidden');
}

init();
