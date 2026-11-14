/**
 * Bhumi Foods — Settings Admin JS
 */
import { requireAuth, initLogout } from './auth.js';
import { supabase } from '../config/supabase.js';

async function init() {
  await requireAuth();
  initLogout();
  await loadSettings();
  initSave();
}

async function loadSettings() {
  const { data, error } = await supabase.from('site_settings').select('*').eq('id', 1).single();
  if (error || !data) return;

  const fields = ['whatsapp_number','factory_email','factory_hours','instagram_url','youtube_url','default_language'];
  fields.forEach(f => {
    const el = document.getElementById(f);
    if (el && data[f] != null) el.value = data[f];
  });
}

function initSave() {
  document.getElementById('save-settings-btn')?.addEventListener('click', async () => {
    const btn = document.getElementById('save-settings-btn');
    btn.textContent = 'Saving…'; btn.disabled = true;

    const payload = {
      whatsapp_number:  document.getElementById('whatsapp_number')?.value.trim(),
      factory_email:    document.getElementById('factory_email')?.value.trim(),
      factory_hours:    document.getElementById('factory_hours')?.value.trim(),
      instagram_url:    document.getElementById('instagram_url')?.value.trim(),
      youtube_url:      document.getElementById('youtube_url')?.value.trim(),
      default_language: document.getElementById('default_language')?.value,
    };

    const { error } = await supabase.from('site_settings').update(payload).eq('id', 1);

    btn.textContent = 'Save Settings'; btn.disabled = false;

    const success = document.getElementById('settings-success');
    const errBox  = document.getElementById('settings-error');

    if (error) {
      if (errBox) { errBox.textContent = error.message; errBox.classList.remove('hidden'); }
      success?.classList.add('hidden');
    } else {
      success?.classList.remove('hidden');
      errBox?.classList.add('hidden');
      setTimeout(() => success?.classList.add('hidden'), 3000);
    }
  });
}

init();
