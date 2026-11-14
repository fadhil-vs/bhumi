/**
 * Bhumi Foods — Products Service
 * All product data access. Falls back to placeholder data
 * until Supabase is configured (Milestone 3).
 */

import { supabase, isSupabaseReady } from '../config/supabase.js';

/* ── Placeholder Data (used until Supabase is ready) ── */
export const PLACEHOLDER_PRODUCTS = [
  {
    id: 'p1',
    name_en: 'Kerala Garam Masala',
    name_ml: 'കേരള ഗരം മസാല',
    description_en: 'A warming blend of whole spices, slow-roasted and ground fresh. Ideal for biryanis, curries and meat dishes.',
    description_ml: 'സമ്പൂർണ്ണ ഇന്ത്യൻ മസാലകളുടെ ഒരു ഊഷ്മള മിശ്രിതം — ബിരിയാണി, കറി, മാംസ വിഭവങ്ങൾക്ക് അനുയോജ്യം.',
    category_id: 'c5',
    is_active: true,
    is_featured: true,
    featured_order: 1,
    images: [{ storage_path: null, position: 0 }],
    variants: [
      { id: 'v1a', weight_label: '100g', price: 55,  is_available: true },
      { id: 'v1b', weight_label: '250g', price: 120, is_available: true },
      { id: 'v1c', weight_label: '500g', price: 220, is_available: true },
      { id: 'v1d', weight_label: '1kg',  price: 400, is_available: true },
    ],
  },
  {
    id: 'p2',
    name_en: 'Special Chilli Powder',
    name_ml: 'സ്പെഷ്യൽ മുളക് പൊടി',
    description_en: 'Bold, vibrant red chilli powder with the right heat and colour. Ground from selected whole red chillies.',
    description_ml: 'തിരഞ്ഞെടുത്ത ചുവന്ന മുളകുകളിൽ നിന്ന് ഉണ്ടാക്കിയ, ശരിയായ ചൂടും നിറവുമുള്ള മുളക് പൊടി.',
    category_id: 'c1',
    is_active: true,
    is_featured: true,
    featured_order: 2,
    images: [{ storage_path: null, position: 0 }],
    variants: [
      { id: 'v2a', weight_label: '100g', price: 45,  is_available: true },
      { id: 'v2b', weight_label: '250g', price: 100, is_available: true },
      { id: 'v2c', weight_label: '500g', price: 185, is_available: true },
    ],
  },
  {
    id: 'p3',
    name_en: 'Pure Turmeric Powder',
    name_ml: 'ശുദ്ധ മഞ്ഞൾ പൊടി',
    description_en: 'Bright, earthy turmeric powder sourced from Kerala farms. Rich in curcumin, vibrant in colour.',
    description_ml: 'കേരളത്തിലെ കർഷകരിൽ നിന്നുള്ള തിളക്കമുള്ള, ഭൂമിയുടെ ഗന്ധമുള്ള മഞ്ഞൾ പൊടി.',
    category_id: 'c2',
    is_active: true,
    is_featured: true,
    featured_order: 3,
    images: [{ storage_path: null, position: 0 }],
    variants: [
      { id: 'v3a', weight_label: '100g', price: 40,  is_available: true },
      { id: 'v3b', weight_label: '250g', price: 90,  is_available: true },
      { id: 'v3c', weight_label: '500g', price: 165, is_available: true },
    ],
  },
  {
    id: 'p4',
    name_en: 'Coriander Powder',
    name_ml: 'മല്ലി പൊടി',
    description_en: 'Freshly ground coriander with a mild citrus note. The base of a great curry.',
    description_ml: 'ഒരു നേരിയ സിട്രസ് സ്വരവുമായി പുതുതായി പൊടിച്ച മല്ലി — ഒരു നല്ല കറിയുടെ അടിത്തറ.',
    category_id: 'c3',
    is_active: true,
    is_featured: true,
    featured_order: 4,
    images: [{ storage_path: null, position: 0 }],
    variants: [
      { id: 'v4a', weight_label: '100g', price: 38,  is_available: true },
      { id: 'v4b', weight_label: '250g', price: 85,  is_available: true },
      { id: 'v4c', weight_label: '500g', price: 155, is_available: true },
    ],
  },
  {
    id: 'p5',
    name_en: 'Meat Masala',
    name_ml: 'മീറ്റ് മസാല',
    description_en: 'A rich, complex blend crafted for beef, mutton and chicken dishes. Deep, satisfying flavour.',
    description_ml: 'ബീഫ്, മട്ടൻ, ചിക്കൻ വിഭവങ്ങൾക്കായി തയ്യാറാക്കിയ സമ്പന്നമായ മസാല മിശ്രിതം.',
    category_id: 'c5',
    is_active: true,
    is_featured: true,
    featured_order: 5,
    images: [{ storage_path: null, position: 0 }],
    variants: [
      { id: 'v5a', weight_label: '100g', price: 60,  is_available: true },
      { id: 'v5b', weight_label: '250g', price: 135, is_available: true },
      { id: 'v5c', weight_label: '500g', price: 250, is_available: true },
    ],
  },
];

/* ── Service Functions ── */

/**
 * Fetch the 5 admin-selected featured products.
 * Returns placeholder data if Supabase is not ready.
 */
export async function getFeaturedProducts() {
  if (!isSupabaseReady) return PLACEHOLDER_PRODUCTS.filter(p => p.is_featured);
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        id, name_en, name_ml, description_en, description_ml,
        is_featured, featured_order, category_id,
        product_variants (id, weight_label, price, is_available),
        product_images    (storage_path, position)
      `)
      .eq('is_active', true)
      .eq('is_featured', true)
      .order('featured_order', { ascending: true })
      .limit(5);
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn('[Products] Featured fetch failed —', err.message);
    return PLACEHOLDER_PRODUCTS.filter(p => p.is_featured);
  }
}

/**
 * Fetch all active products, optionally filtered by category slug.
 */
export async function getProducts({ categoryId = null, page = 1, perPage = 20 } = {}) {
  if (!isSupabaseReady) {
    let list = PLACEHOLDER_PRODUCTS.filter(p => p.is_active);
    if (categoryId) list = list.filter(p => p.category_id === categoryId);
    return { data: list, count: list.length };
  }
  try {
    let query = supabase
      .from('products')
      .select(`
        id, name_en, name_ml, description_en, description_ml,
        category_id, is_featured,
        product_variants (id, weight_label, price, is_available),
        product_images    (storage_path, position)
      `, { count: 'exact' })
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range((page - 1) * perPage, page * perPage - 1);
    if (categoryId) query = query.eq('category_id', categoryId);
    const { data, error, count } = await query;
    if (error) throw error;
    return { data: data || [], count: count || 0 };
  } catch (err) {
    console.warn('[Products] Fetch failed —', err.message);
    return { data: PLACEHOLDER_PRODUCTS, count: PLACEHOLDER_PRODUCTS.length };
  }
}

/**
 * Fetch a single product by ID with all variants and images.
 */
export async function getProduct(id) {
  if (!isSupabaseReady) {
    return PLACEHOLDER_PRODUCTS.find(p => p.id === id) || null;
  }
  try {
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        product_variants (id, weight_label, price, stock_qty, is_available),
        product_images    (id, storage_path, position)
      `)
      .eq('id', id)
      .eq('is_active', true)
      .single();
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn('[Products] Single fetch failed —', err.message);
    return null;
  }
}
