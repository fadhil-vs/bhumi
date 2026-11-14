/**
 * Bhumi Foods — Admin Dashboard Page Script (scaffold)
 * Full implementation in Milestone 7.
 */

import { requireAuth, initLogout } from './auth.js';
import { supabase, isSupabaseReady } from '../config/supabase.js';

async function init() {
  await requireAuth();
  initLogout();

  // Show email
  const { data: { user } } = await supabase.auth.getUser();
  const emailEl = document.getElementById('admin-email');
  if (emailEl && user) emailEl.textContent = user.email;

  // Show setup notice if Supabase not configured
  if (!isSupabaseReady) {
    document.getElementById('setup-notice')?.classList.remove('hidden');
  }

  // Load stats
  await loadStats();
}

async function loadStats() {
  if (!isSupabaseReady) return;
  try {
    const [products, categories, orders] = await Promise.all([
      supabase.from('products').select('id', { count: 'exact', head: true }),
      supabase.from('categories').select('id', { count: 'exact', head: true }),
      supabase.from('orders').select('id', { count: 'exact', head: true }),
    ]);
    setStatEl('stat-products',   products.count ?? '—');
    setStatEl('stat-categories', categories.count ?? '—');
    setStatEl('stat-orders',     orders.count ?? '—');
  } catch { /* non-critical */ }
}

function setStatEl(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

init();
