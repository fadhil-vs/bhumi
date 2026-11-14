/**
 * Bhumi Foods — Categories Service
 */

import { supabase, isSupabaseReady } from '../config/supabase.js';

export const PLACEHOLDER_CATEGORIES = [
  { id: 'c1', name_en: 'Chilli Powders',       name_ml: 'മുളക് പൊടി',    slug: 'chilli-powders',    image_path: null, is_active: true },
  { id: 'c2', name_en: 'Turmeric Powders',      name_ml: 'മഞ്ഞൾ പൊടി',   slug: 'turmeric-powders',  image_path: null, is_active: true },
  { id: 'c3', name_en: 'Coriander Powders',     name_ml: 'മല്ലി പൊടി',   slug: 'coriander-powders', image_path: null, is_active: true },
  { id: 'c4', name_en: 'Garam Masala',          name_ml: 'ഗരം മസാല',     slug: 'garam-masala',      image_path: null, is_active: true },
  { id: 'c5', name_en: 'Meat Masala',           name_ml: 'മീറ്റ് മസാല',  slug: 'meat-masala',       image_path: null, is_active: true },
  { id: 'c6', name_en: 'Special Spice Blends',  name_ml: 'സ്പെഷ്യൽ മസാല', slug: 'special-blends',   image_path: null, is_active: true },
];

/** Fetch all active categories */
export async function getCategories() {
  if (!isSupabaseReady) return PLACEHOLDER_CATEGORIES;
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name_en, name_ml, slug, image_path, display_order')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn('[Categories] Fetch failed —', err.message);
    return PLACEHOLDER_CATEGORIES;
  }
}

/** Fetch a single category by slug */
export async function getCategoryBySlug(slug) {
  if (!isSupabaseReady) {
    return PLACEHOLDER_CATEGORIES.find(c => c.slug === slug) || null;
  }
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .eq('is_active', true)
      .single();
    if (error) throw error;
    return data;
  } catch (err) {
    console.warn('[Categories] Single fetch failed —', err.message);
    return null;
  }
}
