/**
 * Bhumi Foods — Categories Admin JS
 */
import { requireAuth, initLogout } from './auth.js';
import { supabase } from '../config/supabase.js';

let editingId = null;

async function init() {
  await requireAuth();
  initLogout();
  await loadCategories();
  initModal();
}

async function loadCategories() {
  const tbody = document.getElementById('categories-table-body');
  tbody.innerHTML = `<tr><td colspan="6" class="px-5 py-10 text-center text-sm text-gray-400">Loading…</td></tr>`;

  const { data, error } = await supabase
    .from('categories')
    .select('id, name_en, name_ml, slug, image_path, is_active, display_order')
    .order('display_order');

  if (error) {
    tbody.innerHTML = `<tr><td colspan="6" class="px-5 py-10 text-center text-sm text-red-500">Error: ${error.message}</td></tr>`;
    return;
  }

  if (!data?.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="px-5 py-10 text-center text-sm text-gray-400">No categories yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = data.map(cat => `
    <tr class="border-b border-sage/50 hover:bg-sage-light/40 transition-colors" data-id="${cat.id}">
      <td class="px-5 py-3.5 text-gray-300 cursor-grab">⠿</td>
      <td class="px-5 py-3.5">
        ${cat.image_path
          ? `<img src="${cat.image_path}" class="h-10 w-10 object-cover rounded-sm border border-sage">`
          : `<div class="h-10 w-10 bg-sage rounded-sm border border-sage flex items-center justify-center text-xs text-gray-400">No img</div>`}
      </td>
      <td class="px-5 py-3.5 font-medium text-sm text-gray-800">${cat.name_en}</td>
      <td class="px-5 py-3.5 text-sm text-gray-500 hidden md:table-cell">${cat.name_ml || '—'}</td>
      <td class="px-5 py-3.5">
        <span class="text-xs font-medium px-2 py-1 rounded-full ${cat.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}">
          ${cat.is_active ? 'Active' : 'Hidden'}
        </span>
      </td>
      <td class="px-5 py-3.5 text-right">
        <div class="flex items-center justify-end gap-3">
          <button class="text-xs font-medium text-forest hover:underline edit-btn"
            data-id="${cat.id}" data-name-en="${cat.name_en}" data-name-ml="${cat.name_ml || ''}">Edit</button>
          <button class="text-xs font-medium text-red-500 hover:underline delete-btn" data-id="${cat.id}">Delete</button>
        </div>
      </td>
    </tr>`).join('');

  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', () => openModal(btn.dataset.id, btn.dataset.nameEn, btn.dataset.nameMl));
  });
  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => deleteCategory(btn.dataset.id));
  });
}

function initModal() {
  document.getElementById('add-category-btn')?.addEventListener('click', () => openModal());
  document.getElementById('modal-cancel')?.addEventListener('click', closeModal);
  document.getElementById('cat-image-drop')?.addEventListener('click', () => document.getElementById('cat-image-input')?.click());
  document.getElementById('cat-image-input')?.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      document.getElementById('cat-preview-img').src = ev.target.result;
      document.getElementById('cat-image-preview').classList.remove('hidden');
    };
    reader.readAsDataURL(file);
  });

  document.getElementById('category-form')?.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = document.getElementById('modal-save');
    btn.textContent = 'Saving…'; btn.disabled = true;

    const name_en = document.getElementById('cat-name-en')?.value.trim();
    const name_ml = document.getElementById('cat-name-ml')?.value.trim() || null;
    if (!name_en) { btn.textContent = 'Save Category'; btn.disabled = false; return; }

    const slug = name_en.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    const payload = { name_en, name_ml, slug };

    let error;
    if (editingId) {
      ({ error } = await supabase.from('categories').update(payload).eq('id', editingId));
    } else {
      ({ error } = await supabase.from('categories').insert({ ...payload, display_order: 99 }));
    }

    btn.textContent = 'Save Category'; btn.disabled = false;
    if (!error) { closeModal(); await loadCategories(); }
    else alert('Error: ' + error.message);
  });
}

function openModal(id = null, nameEn = '', nameMl = '') {
  editingId = id;
  document.getElementById('modal-title').textContent = id ? 'Edit Category' : 'Add Category';
  document.getElementById('cat-name-en').value = nameEn;
  document.getElementById('cat-name-ml').value = nameMl;
  document.getElementById('cat-image-preview').classList.add('hidden');
  document.getElementById('category-modal').classList.remove('hidden');
}

function closeModal() {
  editingId = null;
  document.getElementById('category-modal').classList.add('hidden');
}

async function deleteCategory(id) {
  if (!confirm('Delete this category? Products in it will be uncategorised.')) return;
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (!error) await loadCategories();
  else alert('Error: ' + error.message);
}

init();
