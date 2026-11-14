/**
 * Bhumi Foods — Process Video Player Component
 * Renders autoplay-muted-loop video cards for the factory section.
 * Videos are stored in Supabase Storage (MP4).
 * Placeholder shown until videos are uploaded via admin.
 */

import { t, getLang } from '../utils/i18n.js';

/**
 * Render a single process step video card.
 * @param {Object} step    - { step_number, title_en, title_ml, sub_en, sub_ml, storage_path, thumbnail_path }
 * @param {string} [lang]
 * @returns {string} HTML
 */
export function renderVideoCard(step, lang = null) {
  lang = lang || getLang();
  const title = step[`title_${lang}`] || step.title_en || `Step ${step.step_number}`;
  const sub   = step[`sub_${lang}`]   || step.sub_en   || '';

  const hasVideo = !!step.storage_path;
  const videoSrc  = hasVideo ? step.storage_path : null;
  const thumbSrc  = step.thumbnail_path || null;

  return /* html */`
    <div class="process-step-card rounded-sm overflow-hidden flex-shrink-0 w-[280px] sm:w-auto" role="listitem">
      <!-- Video / Placeholder area -->
      <div class="video-placeholder aspect-video relative group">
        ${hasVideo ? `
          <video
            class="process-video-player"
            src="${videoSrc}"
            ${thumbSrc ? `poster="${thumbSrc}"` : ''}
            autoplay muted loop playsinline
            aria-label="${title}">
          </video>
        ` : `
          <!-- Placeholder until video is uploaded -->
          <div class="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4">
            <!-- Step number -->
            <div class="w-12 h-12 rounded-full border border-beige/40 flex items-center justify-center">
              <span class="font-heading text-xl text-beige/70">${step.step_number}</span>
            </div>
            <span class="text-white/30 text-xs uppercase tracking-widest text-center">
              ${t('process.videoComingSoon', lang)}
            </span>
          </div>
        `}

        <!-- Step number badge (shown over video) -->
        <div class="absolute top-3 left-3 w-7 h-7 rounded-full bg-beige/90 flex items-center justify-center">
          <span class="text-white text-xs font-bold">${step.step_number}</span>
        </div>
      </div>

      <!-- Label -->
      <div class="p-4">
        <p class="text-white font-semibold text-sm leading-snug mb-1">${title}</p>
        ${sub ? `<p class="text-white/50 text-xs leading-relaxed">${sub}</p>` : ''}
      </div>
    </div>
  `;
}

/**
 * Build 5 placeholder step objects from the i18n steps array.
 * Used when no videos have been uploaded yet.
 * @param {string} lang
 * @returns {Array}
 */
export function buildPlaceholderSteps(lang = 'en') {
  const steps = t('process.steps',  lang);
  const subs  = t('process.stepSub', lang);
  return steps.map((title, i) => ({
    step_number:  i + 1,
    [`title_${lang}`]: title,
    [`sub_${lang}`]:   subs[i] || '',
    storage_path:  null,
    thumbnail_path: null,
  }));
}

/** Import helper used inside buildPlaceholderSteps */
function t(key, lang) {
  // Local shim — full i18n loaded from home.js
  const data = {
    en: {
      'process.steps':   ['Ingredient Selection','Cleaning & Sorting','Drying','Grinding','Packaging'],
      'process.stepSub': [
        'Carefully chosen from trusted farms',
        'Sorted by hand for purity',
        'Sun-dried for natural preservation',
        'Ground fresh for full flavour',
        'Sealed hygienically for freshness',
      ],
      'process.videoComingSoon': 'Video Coming Soon',
    },
    ml: {
      'process.steps':   ['ചേരുവ തിരഞ്ഞെടുക്കൽ','ശുചീകരണം','ഉണക്കൽ','പൊടിക്കൽ','പാക്കേജിംഗ്'],
      'process.stepSub': [
        'വിശ്വസ്ത കർഷകരിൽ നിന്ന് ശ്രദ്ധയോടെ',
        'ശുദ്ധതയ്ക്കായി കൈകൊണ്ട് തരംതിരിക്കൽ',
        'പ്രകൃതിദത്ത സംരക്ഷണത്തിനായി വെയിലത്ത് ഉണക്കൽ',
        'പൂർണ്ണ രുചിക്കായി പുതുതായി പൊടിക്കൽ',
        'പുതുമ നിലനിർത്താൻ ശുചിയായി പൊതിയൽ',
      ],
      'process.videoComingSoon': 'വീഡിയോ ഉടൻ വരും',
    },
  };
  return data[lang]?.[key] ?? data.en[key] ?? key;
}
