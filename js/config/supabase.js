/**
 * Bhumi Foods — Supabase Client Configuration
 *
 * Credentials can be set via:
 * 1. window.__ENV__ in env.js (ignored in git)
 * 2. Or replace fallback placeholders below
 *
 * ⚠️ NEVER use the service_role key in frontend code.
 *    Only the public anon key belongs here.
 */

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const env = (typeof window !== 'undefined' && window.__ENV__) || {};

export const SUPABASE_URL = env.SUPABASE_URL || 'https://YOUR_PROJECT_REF.supabase.co';
export const SUPABASE_ANON = env.SUPABASE_ANON_KEY || 'YOUR_SUPABASE_PUBLIC_ANON_KEY';

if (SUPABASE_ANON === 'YOUR_SUPABASE_PUBLIC_ANON_KEY' || SUPABASE_ANON === 'YOUR_ANON_KEY_HERE') {
  console.warn(
    '[Bhumi Foods] Supabase not configured yet.\n' +
    'Add credentials in env.js (copy env.example.js to env.js) or set in js/config/supabase.js.'
  );
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/** True once Supabase is configured with real credentials */
export const isSupabaseReady =
  !SUPABASE_URL.includes('YOUR_PROJECT_REF') &&
  (SUPABASE_ANON.startsWith('sb_publishable_') || SUPABASE_ANON.startsWith('eyJ'));
