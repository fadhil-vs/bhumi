/**
 * Bhumi Foods — Site Settings Service
 * Fetches configurable settings from Supabase (falls back to defaults).
 */

import { supabase, isSupabaseReady } from '../config/supabase.js';

/** Default settings used before Supabase is configured */
const DEFAULTS = {
  whatsapp_number: '919744033555',
  instagram_url:   'https://www.instagram.com/bhumi_foodsindia',
  youtube_url:     'https://www.youtube.com/@bhumifoods',
  brand_logo:      '/assets/images/logo.png',
  factory_address: '14/31D Peringannur, Mundur, Thrissur, Kerala 680545',
  factory_email:   'info@bhumifoods.net',
  factory_hours:   'Mon–Sat: 8:30 AM – 6:30 PM',
  factory_phone:   '+91 9744 033 555',
  default_language: 'en',
  brand_story_en:  '',
  brand_story_ml:  '',
};

let _cached = null;

/**
 * Fetch site settings. Cached after the first call.
 * @returns {Promise<Object>} settings object
 */
export async function getSettings() {
  if (_cached) return _cached;
  if (!isSupabaseReady) {
    _cached = { ...DEFAULTS };
    return _cached;
  }
  try {
    const { data, error } = await supabase
      .from('site_settings')
      .select('*')
      .eq('id', 1)
      .single();
    if (error) throw error;
    _cached = { ...DEFAULTS, ...data };
  } catch (err) {
    console.warn('[Settings] Using defaults —', err.message);
    _cached = { ...DEFAULTS };
  }
  return _cached;
}

/** Clear settings cache (call after admin saves settings) */
export function invalidateSettings() {
  _cached = null;
}
