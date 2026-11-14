/**
 * Bhumi Foods — Videos Admin JS
 */
import { requireAuth, initLogout } from './auth.js';
import { supabase } from '../config/supabase.js';

async function init() {
  await requireAuth();
  initLogout();
  await loadVideoSlots();
}

async function loadVideoSlots() {
  const container = document.getElementById('video-slots');
  const tmpl = document.getElementById('video-slot-template');
  if (!container || !tmpl) return;

  container.innerHTML = '';

  const { data, error } = await supabase
    .from('factory_videos')
    .select('*')
    .order('process_step');

  if (error) {
    container.innerHTML = `<p class="text-red-500 text-sm">Error: ${error.message}</p>`;
    return;
  }

  (data || []).forEach(video => {
    const clone = tmpl.content.cloneNode(true);
    const slot  = clone.querySelector('.video-slot');

    slot.dataset.step = video.process_step;
    slot.dataset.id   = video.id;

    clone.querySelector('.step-number').textContent = video.process_step;
    clone.querySelector('.step-title').textContent  = `Step ${video.process_step}`;
    clone.querySelector('.step-sub').textContent    = video.sub_en || '';
    clone.querySelector('[name="title_en"]').value  = video.title_en || '';
    clone.querySelector('[name="title_ml"]').value  = video.title_ml || '';
    clone.querySelector('[name="is_active"]').checked = video.is_active;

    if (video.storage_path) {
      clone.querySelector('.video-preview')?.classList.remove('hidden');
      clone.querySelector('.video-placeholder-label')?.classList.add('hidden');
      const vid = clone.querySelector('video');
      if (vid) vid.src = video.storage_path;
    }

    // Save button
    clone.querySelector('.save-video-btn')?.addEventListener('click', async () => {
      const parentSlot = container.querySelector(`[data-id="${video.id}"]`);
      const payload = {
        title_en:  parentSlot.querySelector('[name="title_en"]').value.trim(),
        title_ml:  parentSlot.querySelector('[name="title_ml"]').value.trim() || null,
        is_active: parentSlot.querySelector('[name="is_active"]').checked,
      };
      const btn = parentSlot.querySelector('.save-video-btn');
      btn.textContent = 'Saving…'; btn.disabled = true;
      const { error: saveErr } = await supabase.from('factory_videos').update(payload).eq('id', video.id);
      btn.textContent = saveErr ? 'Error!' : 'Saved ✓';
      btn.disabled = false;
      setTimeout(() => { btn.textContent = 'Save This Step'; }, 2000);
    });

    // Video file drop
    const dropZone  = clone.querySelector('.video-drop-zone');
    const fileInput = clone.querySelector('.video-file-input');
    dropZone?.addEventListener('click', () => fileInput.click());
    fileInput?.addEventListener('change', async e => {
      const file = e.target.files[0];
      if (!file) return;
      fileInput.disabled = true;
      // Upload to Supabase Storage
      const path = `videos/step-${video.process_step}-${Date.now()}.mp4`;
      const { error: upErr } = await supabase.storage.from('videos').upload(path, file, { upsert: true });
      if (!upErr) {
        const { data: urlData } = supabase.storage.from('videos').getPublicUrl(path);
        await supabase.from('factory_videos').update({ storage_path: urlData.publicUrl }).eq('id', video.id);
        const vid = container.querySelector(`[data-id="${video.id}"] video`);
        if (vid) { vid.src = urlData.publicUrl; }
        container.querySelector(`[data-id="${video.id}"] .video-preview`)?.classList.remove('hidden');
        container.querySelector(`[data-id="${video.id}"] .video-placeholder-label`)?.classList.add('hidden');
      }
      fileInput.disabled = false;
    });

    container.appendChild(clone);
  });
}

init();
