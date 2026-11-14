/**
 * Bhumi Foods — Homepage Admin JS
 */
import { requireAuth, initLogout } from './auth.js';
import { supabase } from '../config/supabase.js';

async function init() {
  await requireAuth();
  initLogout();
  await Promise.all([loadFeaturedSelector(), loadBrandStory(), loadTrustItems()]);
  initSaveAll();
}

/* ── Featured Products ──────────────────────────────────── */
async function loadFeaturedSelector() {
  const container = document.getElementById('featured-selector');
  if (!container) return;

  const { data: products } = await supabase
    .from('products')
    .select('id, name_en')
    .eq('is_active', true)
    .order('name_en');

  const { data: featured } = await supabase
    .from('products')
    .select('id, featured_order')
    .eq('is_featured', true)
    .order('featured_order');

  const featuredIds = (featured || []).map(p => p.id);
  const opts = `<option value="">— None —</option>` +
    (products || []).map(p => `<option value="${p.id}">${p.name_en}</option>`).join('');

  container.innerHTML = [1,2,3,4,5].map(slot => {
    const sel = featuredIds[slot - 1] || '';
    return `
      <div class="flex items-center gap-3">
        <span class="w-6 text-center text-xs font-bold text-gray-400">${slot}</span>
        <select class="admin-input flex-1 py-2 text-sm featured-slot" data-slot="${slot}">
          ${opts.replace(`value="${sel}"`, `value="${sel}" selected`)}
        </select>
      </div>`;
  }).join('');
}

/* ── Brand Story ────────────────────────────────────────── */
async function loadBrandStory() {
  const { data } = await supabase.from('site_settings').select('brand_story_en, brand_story_ml').eq('id', 1).single();
  if (!data) return;
  const enEl = document.getElementById('story-en');
  const mlEl = document.getElementById('story-ml');
  if (enEl && data.brand_story_en) enEl.value = data.brand_story_en;
  if (mlEl && data.brand_story_ml) mlEl.value = data.brand_story_ml;

  // Story photo drop
  document.getElementById('story-photo-drop')?.addEventListener('click', () => document.getElementById('story-photo-input')?.click());
  document.getElementById('story-photo-input')?.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      document.getElementById('story-preview-img').src = ev.target.result;
      document.getElementById('story-photo-preview').classList.remove('hidden');
    };
    reader.readAsDataURL(file);
  });
}

/* ── Trust Items ────────────────────────────────────────── */
async function loadTrustItems() {
  const list = document.getElementById('trust-items-list');
  if (!list) return;

  const { data } = await supabase.from('trust_items').select('*').order('display_order');
  if (!data?.length) { list.innerHTML = '<p class="text-sm text-gray-400">No trust items.</p>'; return; }

  list.innerHTML = data.map(item => `
    <div class="flex items-center justify-between bg-white border border-sage rounded-sm px-4 py-3" data-id="${item.id}">
      <div>
        <p class="text-sm font-medium text-gray-800">${item.label_en}</p>
        <p class="text-xs text-gray-400">${item.desc_en || ''}</p>
      </div>
      <label class="relative inline-flex items-center cursor-pointer ml-4" title="Active">
        <input type="checkbox" class="sr-only peer trust-toggle" data-id="${item.id}" ${item.is_active ? 'checked' : ''}>
        <div class="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-forest"></div>
      </label>
    </div>`).join('');

  document.querySelectorAll('.trust-toggle').forEach(toggle => {
    toggle.addEventListener('change', async e => {
      await supabase.from('trust_items').update({ is_active: e.target.checked }).eq('id', toggle.dataset.id);
    });
  });

  document.getElementById('add-trust-btn')?.addEventListener('click', async () => {
    const label = prompt('Trust item label (English):');
    if (!label) return;
    const desc = prompt('Short description:') || '';
    await supabase.from('trust_items').insert({ label_en: label, desc_en: desc, is_active: true, display_order: 99 });
    await loadTrustItems();
  });
}

/* ── Save All ───────────────────────────────────────────── */
function initSaveAll() {
  document.getElementById('save-all-btn')?.addEventListener('click', async () => {
    const btn = document.getElementById('save-all-btn');
    btn.textContent = 'Saving…'; btn.disabled = true;

    // 1. Update featured products
    await supabase.from('products').update({ is_featured: false, featured_order: null }).neq('id', '00000000-0000-0000-0000-000000000000');
    const slots = document.querySelectorAll('.featured-slot');
    for (const sel of slots) {
      const id = sel.value;
      const slot = parseInt(sel.dataset.slot);
      if (id) await supabase.from('products').update({ is_featured: true, featured_order: slot }).eq('id', id);
    }

    // 2. Update brand story
    await supabase.from('site_settings').update({
      brand_story_en: document.getElementById('story-en')?.value.trim() || null,
      brand_story_ml: document.getElementById('story-ml')?.value.trim() || null,
    }).eq('id', 1);

    btn.textContent = 'Saved ✓'; btn.disabled = false;
    setTimeout(() => { btn.textContent = 'Save All Changes'; }, 2000);
  });
}

init();
