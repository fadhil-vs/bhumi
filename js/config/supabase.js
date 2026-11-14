/**
 * Bhumi Foods — Supabase Client Configuration
 *
 * SETUP INSTRUCTIONS:
 * 1. Create a Supabase project at https://supabase.com
 * 2. Go to Project Settings → API
 * 3. Copy the Project URL and anon (public) key
 * 4. Replace the placeholder values below
 *
 * ⚠️  NEVER use the service_role key in frontend code.
 *     Only the anon key belongs here.
 */

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL  = 'https://kjvxswuzbhcmtarxairm.supabase.co';
const SUPABASE_ANON = 'sb_publishable_vZ7H4pPuWpo2V8FuGFNCNw_AYG3znie';

if (SUPABASE_ANON === 'YOUR_ANON_KEY_HERE') {
  console.warn(
    '[Bhumi Foods] Supabase not configured yet.\n' +
    'Open js/config/supabase.js and add your project URL and anon key.'
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
export const isSupabaseReady = !SUPABASE_URL.includes('YOUR_PROJECT_REF') &&
  (SUPABASE_ANON.startsWith('sb_publishable_') || SUPABASE_ANON.startsWith('eyJ'));
