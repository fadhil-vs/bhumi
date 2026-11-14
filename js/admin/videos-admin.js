/**
 * Bhumi Foods — Videos Admin JS
 * Uses YouTube URLs instead of file uploads.
 */
import { requireAuth, initLogout } from './auth.js';
import { supabase } from '../config/supabase.js';

async function init() {
  await requireAuth();
  initLogout();
  await loadVideoSlots();
}

/** Extract YouTube video ID from any YT URL format */
function getYouTubeId(url) {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const p of patterns) {
    const m = url.match(p);
    if (m) return m[1];
  }
  return null;
}

function getYouTubeThumbnail(id) {
  return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null;
}

async function loadVideoSlots() {
  const container = document.getElementById('video-slots');
  if (!container) return;
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
    const ytId      = getYouTubeId(video.storage_path);
    const thumbUrl  = getYouTubeThumbnail(ytId);
    const hasVideo  = !!ytId;

    const card = document.createElement('div');
    card.className = 'admin-card video-slot';
    card.dataset.id = video.id;
    card.innerHTML = `
      <div class="flex items-center justify-between mb-5">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-full bg-forest/10 flex items-center justify-center">
            <span class="text-forest font-bold text-sm">${video.process_step}</span>
          </div>
          <div>
            <h3 class="font-heading text-base text-forest font-normal">${video.title_en || `Step ${video.process_step}`}</h3>
            <p class="text-xs text-gray-500">${video.sub_en || ''}</p>
          </div>
        </div>
        <label class="relative inline-flex items-center cursor-pointer" title="Active">
          <input type="checkbox" name="is_active" class="sr-only peer" ${video.is_active ? 'checked' : ''}>
          <div class="w-9 h-5 bg-gray-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-forest"></div>
        </label>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-5">

        <!-- YouTube URL + Preview -->
        <div>
          <label class="admin-label">YouTube Video URL</label>
          <input type="url" name="youtube_url" class="admin-input text-sm mb-2"
            placeholder="https://www.youtube.com/watch?v=..."
            value="${video.storage_path || ''}">
          <div class="yt-preview ${hasVideo ? '' : 'hidden'} mt-2 rounded-sm overflow-hidden border border-sage">
            ${hasVideo ? `
              <img src="${thumbUrl}" alt="Video thumbnail"
                class="w-full object-cover aspect-video bg-gray-100">
              <p class="text-xs text-center text-green-700 bg-green-50 py-1">
                ✓ YouTube video linked
              </p>` : ''}
          </div>
          ${!hasVideo ? `<p class="text-xs text-gray-400 mt-1">Paste a YouTube or YouTube Shorts URL above.</p>` : ''}
        </div>

        <!-- Titles -->
        <div class="space-y-3">
          <div>
            <label class="admin-label">Step Title (English)</label>
            <input type="text" name="title_en" class="admin-input text-sm"
              placeholder="e.g. Ingredient Selection"
              value="${video.title_en || ''}">
          </div>
          <div>
            <label class="admin-label">Step Title (Malayalam)</label>
            <input type="text" name="title_ml" class="admin-input text-sm font-ml" lang="ml"
              placeholder="ഉദാ. ചേരുവ തിരഞ്ഞെടുക്കൽ"
              value="${video.title_ml || ''}">
          </div>
          <button type="button" class="save-video-btn btn-forest rounded-sm text-xs py-2 px-4 w-full justify-center">
            Save This Step
          </button>
          <p class="save-status text-xs text-center text-gray-400 hidden"></p>
        </div>
      </div>`;

    // Live URL preview
    card.querySelector('[name="youtube_url"]').addEventListener('input', e => {
      const id  = getYouTubeId(e.target.value.trim());
      const preview = card.querySelector('.yt-preview');
      if (id) {
        preview.innerHTML = `
          <img src="${getYouTubeThumbnail(id)}" alt="Video thumbnail"
            class="w-full object-cover aspect-video bg-gray-100">
          <p class="text-xs text-center text-green-700 bg-green-50 py-1">✓ YouTube video detected</p>`;
        preview.classList.remove('hidden');
      } else {
        preview.classList.add('hidden');
      }
    });

    // Save button
    card.querySelector('.save-video-btn').addEventListener('click', async () => {
      const btn        = card.querySelector('.save-video-btn');
      const statusEl   = card.querySelector('.save-status');
      const youtubeUrl = card.querySelector('[name="youtube_url"]').value.trim();
      const ytId       = getYouTubeId(youtubeUrl);

      btn.textContent = 'Saving…'; btn.disabled = true;

      const payload = {
        title_en:       card.querySelector('[name="title_en"]').value.trim(),
        title_ml:       card.querySelector('[name="title_ml"]').value.trim() || null,
        is_active:      card.querySelector('[name="is_active"]').checked,
        storage_path:   youtubeUrl || null,          // reuse column for YT URL
        thumbnail_path: getYouTubeThumbnail(ytId),   // auto-generate from YT
      };

      const { error } = await supabase
        .from('factory_videos').update(payload).eq('id', video.id);

      btn.disabled = false;
      if (error) {
        btn.textContent = 'Error!';
        statusEl.textContent = error.message;
        statusEl.classList.remove('hidden');
      } else {
        btn.textContent = 'Saved ✓';
        statusEl.textContent = 'Changes saved successfully.';
        statusEl.classList.remove('hidden');
        setTimeout(() => {
          btn.textContent = 'Save This Step';
          statusEl.classList.add('hidden');
        }, 2500);
      }
    });

    container.appendChild(card);
  });
}

init();
