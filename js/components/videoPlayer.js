/**
 * Bhumi Foods — Process Video Player Component
 * Renders YouTube embed cards for the factory process section.
 * Falls back to a styled placeholder if no YouTube URL is set.
 */

/** Extract YouTube video ID from any YT URL */
function getYouTubeId(url) {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/);
  return m ? m[1] : null;
}

/**
 * Render a single process step card.
 * @param {Object} step  - { step_number, title_en, title_ml, sub_en, sub_ml, storage_path, thumbnail_path }
 * @param {string} lang
 */
export function renderVideoCard(step, lang = 'en') {
  const title  = step[`title_${lang}`] || step.title_en || `Step ${step.step_number}`;
  const sub    = step[`sub_${lang}`]   || step.sub_en   || '';
  const ytId   = getYouTubeId(step.storage_path);
  const thumb  = step.thumbnail_path || (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : null);

  return /* html */`
    <div class="process-step-card rounded-sm overflow-hidden flex-shrink-0 w-[280px] sm:w-auto" role="listitem">

      <!-- Video / Placeholder area -->
      <div class="video-placeholder aspect-video relative group">

        ${ytId ? `
          <!-- YouTube embed — loads on click to avoid autoplay issues -->
          <div class="yt-embed-wrapper absolute inset-0 cursor-pointer" data-ytid="${ytId}">
            ${thumb ? `<img src="${thumb}" alt="${title}" class="w-full h-full object-cover">` : ''}
            <!-- Play button overlay -->
            <div class="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/20 transition-colors">
              <div class="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                <svg class="w-6 h-6 text-forest ml-1" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </div>
            </div>
          </div>
        ` : `
          <!-- Placeholder until YouTube URL is added in admin -->
          <div class="absolute inset-0 flex flex-col items-center justify-center gap-3 p-4">
            <div class="w-12 h-12 rounded-full border border-beige/40 flex items-center justify-center">
              <span class="font-heading text-xl text-beige/70">${step.step_number}</span>
            </div>
            <span class="text-white/30 text-xs uppercase tracking-widest text-center">
              ${lang === 'ml' ? 'വീഡിയോ ഉടൻ വരും' : 'Video Coming Soon'}
            </span>
          </div>
        `}

        <!-- Step number badge -->
        <div class="absolute top-3 left-3 w-7 h-7 rounded-full bg-beige/90 flex items-center justify-center z-10">
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
 * After rendering cards, call this to wire up the click-to-play YouTube embeds.
 */
export function initYouTubeEmbeds() {
  document.querySelectorAll('.yt-embed-wrapper').forEach(wrapper => {
    wrapper.addEventListener('click', () => {
      const id = wrapper.dataset.ytid;
      if (!id) return;
      const iframe = document.createElement('iframe');
      iframe.src = `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
      iframe.className = 'absolute inset-0 w-full h-full';
      iframe.setAttribute('frameborder', '0');
      iframe.setAttribute('allow', 'autoplay; encrypted-media; fullscreen');
      iframe.setAttribute('allowfullscreen', '');
      wrapper.replaceWith(iframe);
    });
  });
}

/**
 * Build 5 placeholder step objects (used before DB data loads).
 */
export function buildPlaceholderSteps(lang = 'en') {
  const steps = {
    en: ['Ingredient Selection','Cleaning & Sorting','Drying','Grinding','Packaging'],
    ml: ['ചേരുവ തിരഞ്ഞെടുക്കൽ','ശുചീകരണം','ഉണക്കൽ','പൊടിക്കൽ','പാക്കേജിംഗ്'],
  };
  const subs = {
    en: ['Carefully chosen from trusted farms','Sorted by hand for purity','Sun-dried for natural preservation','Ground fresh for full flavour','Sealed hygienically for freshness'],
    ml: ['വിശ്വസ്ത കർഷകരിൽ നിന്ന്','കൈകൊണ്ട് തരംതിരിക്കൽ','വെയിലത്ത് ഉണക്കൽ','പുതുതായി പൊടിക്കൽ','ശുചിയായി പൊതിയൽ'],
  };
  return (steps[lang] || steps.en).map((title, i) => ({
    step_number:    i + 1,
    title_en:       steps.en[i],
    title_ml:       steps.ml[i],
    sub_en:         subs.en[i],
    sub_ml:         subs.ml[i],
    storage_path:   null,
    thumbnail_path: null,
  }));
}
