/**
 * Bhumi Foods — Internationalisation (EN / ML)
 * Usage:
 *   import { t, getLang, setLang } from '../utils/i18n.js';
 *   t('nav.home')          → 'Home' or 'ഹോം'
 *   t('nav.home', 'ml')   → always Malayalam
 */

export const translations = {
  en: {
    nav: {
      home:     'Home',
      products: 'Explore Products',
      story:    'Our Story',
      process:  'Our Process',
      cart:     'Cart',
    },
    hero: {
      label:        'Pure Kerala Masalas',
      heading:      'Authentic Flavours.',
      headingItalic:'Carefully Crafted.',
      sub:          'Discover carefully prepared masala powders, made with attention to quality and the flavours of tradition.',
      cta1:         'Explore Products',
      cta2:         'Our Story',
      scroll:       'Scroll',
    },
    featured: {
      heading:  'Our Most Popular',
      sub:      'Handpicked by our customers, season after season.',
      viewBtn:  'View Product',
      from:     'From',
      popular:  'Popular',
    },
    process: {
      label:    'Inside Our Factory',
      heading:  'See the Difference in Every Step',
      sub:      'From sourcing carefully selected raw ingredients to cleaning, drying, grinding and packing — discover how our products are prepared.',
      watchBtn: 'Watch Our Process',
      steps:    ['Ingredient Selection', 'Cleaning & Sorting', 'Drying', 'Grinding', 'Packaging'],
      stepSub:  [
        'Carefully chosen from trusted farms',
        'Sorted by hand for purity',
        'Sun-dried for natural preservation',
        'Ground fresh for full flavour',
        'Sealed hygienically for freshness',
      ],
      videoComingSoon: 'Video Coming Soon',
      playVideo:       'Play video',
    },
    story: {
      label:      'Our Story',
      heading:    'More Than Spices.',
      headingItalic: 'A Tradition of Flavour.',
      sub:        'Rooted in the spice-rich lands of Kerala, Bhumi Foods was founded with a simple belief — that great food begins with honest ingredients.',
      body:       'From our processing unit in Mundur, Thrissur, we source, clean, dry, grind and pack every product with the same attention that home cooks bring to their kitchens. No shortcuts. No additives. Just the pure, intense flavours that Kerala is known for.',
      cta:        'Learn Our Story',
    },
    categories: {
      label:    'What We Offer',
      heading:  'Explore Our Products',
      sub:      'Pure, natural spices and blends for every dish.',
      shopAll:  'Shop All Products',
      viewCategory: 'Explore',
    },
    trust: {
      label:   'Our Promise',
      heading: 'Our Commitment to Quality',
      sub:     'Every step of our process reflects our dedication to purity and flavour.',
      items: [
        { title: 'Carefully Sourced',    desc: 'Ingredients selected from trusted farms across Kerala.' },
        { title: 'Quality Processing',   desc: 'Cleaned, dried and ground with consistent attention to detail.' },
        { title: 'Hygienic Packaging',   desc: 'Sealed fresh at our Mundur facility, Mon–Sat.' },
        { title: 'No Artificial Agents', desc: 'Free from added colours, preservatives or fillers.' },
      ],
    },
    footer: {
      tagline:    'Rooted in Nature, Crafted for You.',
      ourFactory: 'Our Factory',
      quickLinks: 'Quick Links',
      followUs:   'Follow Our Journey',
      followSub:  'Catch live behind-the-scenes clips from our Mundur processing unit, harvest updates, and culinary ideas.',
      rights:     '© 2024 Bhumi Foods. All rights reserved.',
    },
    product: {
      selectWeight:  'Select Weight',
      quantity:      'Quantity',
      addToCart:     'Add to Cart',
      buyNow:        'Buy via WhatsApp',
      outOfStock:    'Out of Stock',
      description:   'Description',
      images:        'Product Images',
      relatedProducts: 'You May Also Like',
      share:         'Share',
    },
    cart: {
      heading:     'Your Cart',
      empty:       'Your cart is empty.',
      emptyHint:   'Browse our products and add something you love.',
      shopNow:     'Shop Now',
      continueShopping: 'Continue Shopping',
      product:     'Product',
      variant:     'Weight',
      qty:         'Qty',
      price:       'Price',
      remove:      'Remove',
      total:       'Total',
      checkout:    'Checkout via WhatsApp',
      checkoutNote:'You will be redirected to WhatsApp to confirm your order.',
      orderMsg:    'Hello! I would like to place an order.',
      orderConfirm:'Please confirm my order.',
      orderItem:   'Weight: {variant} | Qty: {qty} | ₹{price}',
    },
    admin: {
      dashboard:  'Dashboard',
      products:   'Products',
      categories: 'Categories',
      homepage:   'Homepage',
      videos:     'Factory Videos',
      orders:     'Orders',
      settings:   'Settings',
      logout:     'Log Out',
      save:       'Save Changes',
      cancel:     'Cancel',
      add:        'Add New',
      edit:       'Edit',
      delete:     'Delete',
      confirm:    'Confirm',
      active:     'Active',
      inactive:   'Inactive',
    },
    common: {
      loading:   'Loading…',
      error:     'Something went wrong. Please try again.',
      noResults: 'No results found.',
      viewAll:   'View All',
      close:     'Close',
      back:      'Back',
      next:      'Next',
      prev:      'Previous',
      price:     'Price',
      currency:  '₹',
    },
  },

  ml: {
    nav: {
      home:     'ഹോം',
      products: 'ഉൽപ്പന്നങ്ങൾ',
      story:    'ഞങ്ങളുടെ കഥ',
      process:  'നിർമ്മാണ പ്രക്രിയ',
      cart:     'കാർട്ട്',
    },
    hero: {
      label:        'ശുദ്ധ കേരള മസാലകൾ',
      heading:      'ആധികാരിക രുചികൾ.',
      headingItalic:'ശ്രദ്ധയോടെ തയ്യാറാക്കിയത്.',
      sub:          'ഗുണനിലവാരത്തിൽ ശ്രദ്ധയോടെ തയ്യാറാക്കിയ മസാല പൗഡറുകൾ — പാരമ്പര്യ രുചികളുടെ ലോകം കണ്ടെത്തൂ.',
      cta1:         'ഉൽപ്പന്നങ്ങൾ കാണൂ',
      cta2:         'ഞങ്ങളുടെ കഥ',
      scroll:       'സ്ക്രോൾ ചെയ്യൂ',
    },
    featured: {
      heading:  'ഏറ്റവും ജനപ്രിയമായവ',
      sub:      'ഞങ്ങളുടെ ഉപഭോക്താക്കൾ ആവർത്തിച്ച് തിരഞ്ഞെടുക്കുന്ന ഉൽപ്പന്നങ്ങൾ.',
      viewBtn:  'ഉൽപ്പന്നം കാണൂ',
      from:     'തുടങ്ങി',
      popular:  'ജനപ്രിയം',
    },
    process: {
      label:    'ഞങ്ങളുടെ ഫാക്ടറി',
      heading:  'ഓരോ ഘട്ടത്തിലും വ്യത്യാസം കാണൂ',
      sub:      'ചേരുവകൾ തിരഞ്ഞെടുക്കൽ മുതൽ ശുചീകരണം, ഉണക്കൽ, പൊടിക്കൽ, പാക്കേജിംഗ് വരെ — ഞങ്ങളുടെ പ്രക്രിയ കണ്ടെത്തൂ.',
      watchBtn: 'ഞങ്ങളുടെ പ്രക്രിയ കാണൂ',
      steps:    ['ചേരുവ തിരഞ്ഞെടുക്കൽ', 'ശുചീകരണം', 'ഉണക്കൽ', 'പൊടിക്കൽ', 'പാക്കേജിംഗ്'],
      stepSub:  [
        'വിശ്വസ്ത കർഷകരിൽ നിന്ന് ശ്രദ്ധയോടെ',
        'ശുദ്ധതയ്ക്കായി കൈകൊണ്ട് തരംതിരിക്കൽ',
        'പ്രകൃതിദത്ത സംരക്ഷണത്തിനായി വെയിലത്ത് ഉണക്കൽ',
        'പൂർണ്ണ രുചിക്കായി പുതുതായി പൊടിക്കൽ',
        'പുതുമ നിലനിർത്താൻ ശുചിയായി പൊതിയൽ',
      ],
      videoComingSoon: 'വീഡിയോ ഉടൻ വരും',
      playVideo:       'വീഡിയോ കാണൂ',
    },
    story: {
      label:         'ഞങ്ങളുടെ കഥ',
      heading:       'കേവലം മസാലകൾ മാത്രമല്ല.',
      headingItalic: 'ഒരു രുചി പാരമ്പര്യം.',
      sub:           'കേരളത്തിന്റെ മസാല സമ്പന്ന ഭൂമിയിൽ വേരൂന്നി, Bhumi Foods ഒരു ലളിതമായ വിശ്വാസത്തോടെ ആരംഭിച്ചു — മഹത്തായ ഭക്ഷണം ആരംഭിക്കുന്നത് സത്യസന്ധമായ ചേരുവകളിൽ നിന്ന്.',
      body:          'തൃശ്ശൂർ മുണ്ടൂരിലെ ഞങ്ങളുടെ ഫാക്ടറിയിൽ, ഓരോ ഉൽപ്പന്നവും ഉറവിടം കണ്ടെത്തൽ, ശുചീകരണം, ഉണക്കൽ, പൊടിക്കൽ, പാക്കേജ് ചെയ്യൽ — എല്ലാം ഒരേ ശ്രദ്ധയോടെ. കൃത്രിമ ചേരുവകൾ ഇല്ല. കേവലം ശുദ്ധ, തീവ്ര രുചികൾ.',
      cta:           'ഞങ്ങളെ അറിയൂ',
    },
    categories: {
      label:        'ഞങ്ങൾ വിൽക്കുന്നത്',
      heading:      'ഞങ്ങളുടെ ഉൽപ്പന്നങ്ങൾ',
      sub:          'ഓരോ വിഭവത്തിനും ശുദ്ധമായ മസാലകളും ബ്ലെൻഡുകളും.',
      shopAll:      'എല്ലാ ഉൽപ്പന്നങ്ങളും',
      viewCategory: 'കാണൂ',
    },
    trust: {
      label:   'ഞങ്ങളുടെ വാഗ്ദാനം',
      heading: 'ഗുണനിലവാരത്തോടുള്ള ഞങ്ങളുടെ പ്രതിബദ്ധത',
      sub:     'ഞങ്ങളുടെ ഓരോ ഘട്ടവും ശുദ്ധതയോടും രുചിയോടുമുള്ള ഞങ്ങളുടെ സമർപ്പണം പ്രതിഫലിപ്പിക്കുന്നു.',
      items: [
        { title: 'ശ്രദ്ധയോടെ തിരഞ്ഞെടുത്തത്',  desc: 'കേരളത്തിലെ വിശ്വസ്ത കർഷകരിൽ നിന്ന്.' },
        { title: 'ഗുണ നിലവാര നിർമ്മാണം',       desc: 'ശ്രദ്ധയോടെ ശുദ്ധീകരിച്ച്, ഉണക്കി, പൊടിച്ചത്.' },
        { title: 'ശുചിയായ പാക്കേജിംഗ്',          desc: 'മുണ്ടൂർ ഫാക്ടറിയിൽ പുതുതായി സീൽ ചെയ്തത്.' },
        { title: 'കൃത്രിമ ഘടകങ്ങൾ ഇല്ല',        desc: 'നിറം, സംരക്ഷകങ്ങൾ അല്ലെങ്കിൽ ഫില്ലറുകൾ ഇല്ലാതെ.' },
      ],
    },
    footer: {
      tagline:    'പ്രകൃതിയിൽ വേരൂന്നി, നിങ്ങൾക്കായി.',
      ourFactory: 'ഞങ്ങളുടെ ഫാക്ടറി',
      quickLinks: 'ദ്രുത ലിങ്കുകൾ',
      followUs:   'ഞങ്ങളെ പിന്തുടരൂ',
      followSub:  'മുണ്ടൂർ ഫാക്ടറിയിൽ നിന്ന് തൽസമയ ദൃശ്യങ്ങൾ, വിളവെടുപ്പ് വിവരങ്ങൾ, പാചക ആശയങ്ങൾ.',
      rights:     '© 2024 Bhumi Foods. എല്ലാ അവകാശങ്ങളും സംരക്ഷിതം.',
    },
    product: {
      selectWeight:    'തൂക്കം തിരഞ്ഞെടുക്കൂ',
      quantity:        'എണ്ണം',
      addToCart:       'കാർട്ടിൽ ചേർക്കൂ',
      buyNow:          'WhatsApp വഴി വാങ്ങൂ',
      outOfStock:      'സ്റ്റോക്ക് ഇല്ല',
      description:     'വിവരണം',
      images:          'ഉൽപ്പന്ന ചിത്രങ്ങൾ',
      relatedProducts: 'ഇതും ഇഷ്ടപ്പെടാം',
      share:           'പങ്കിടൂ',
    },
    cart: {
      heading:     'നിങ്ങളുടെ കാർട്ട്',
      empty:       'കാർട്ട് ഒഴിഞ്ഞിരിക്കുന്നു.',
      emptyHint:   'ഉൽപ്പന്നങ്ങൾ ബ്രൗസ് ചെയ്ത് ഇഷ്ടപ്പെട്ടത് തിരഞ്ഞെടുക്കൂ.',
      shopNow:     'ഇപ്പോൾ ഷോപ്പ് ചെയ്യൂ',
      continueShopping: 'ഷോപ്പിംഗ് തുടരൂ',
      product:     'ഉൽപ്പന്നം',
      variant:     'തൂക്കം',
      qty:         'എണ്ണം',
      price:       'വില',
      remove:      'നീക്കം ചെയ്യൂ',
      total:       'ആകെ',
      checkout:    'WhatsApp വഴി ഓർഡർ ചെയ്യൂ',
      checkoutNote:'WhatsApp-ൽ ഓർഡർ സ്ഥിരീകരിക്കാൻ നിങ്ങൾ അയക്കപ്പെടും.',
      orderMsg:    'നമസ്കാരം! എനിക്ക് ഒരു ഓർഡർ ചെയ്യണം.',
      orderConfirm:'ദയവായി എന്റെ ഓർഡർ സ്ഥിരീകരിക്കൂ.',
      orderItem:   'തൂക്കം: {variant} | എണ്ണം: {qty} | ₹{price}',
    },
    admin: {
      dashboard:  'ഡാഷ്ബോർഡ്',
      products:   'ഉൽപ്പന്നങ്ങൾ',
      categories: 'വിഭാഗങ്ങൾ',
      homepage:   'ഹോംപേജ്',
      videos:     'ഫാക്ടറി വീഡിയോ',
      orders:     'ഓർഡറുകൾ',
      settings:   'ക്രമീകരണം',
      logout:     'ലോഗ് ഔട്ട്',
      save:       'മാറ്റങ്ങൾ സേവ് ചെയ്യൂ',
      cancel:     'റദ്ദാക്കൂ',
      add:        'പുതുതായി ചേർക്കൂ',
      edit:       'എഡിറ്റ്',
      delete:     'ഇല്ലാതാക്കൂ',
      confirm:    'സ്ഥിരീകരിക്കൂ',
      active:     'സജീവം',
      inactive:   'നിഷ്ക്രിയം',
    },
    common: {
      loading:   'ലോഡ് ചെയ്യുന്നു…',
      error:     'എന്തോ പ്രശ്നം. ദയവായി വീണ്ടും ശ്രമിക്കൂ.',
      noResults: 'ഫലങ്ങൾ ഒന്നും കണ്ടെത്തിയില്ല.',
      viewAll:   'എല്ലാം കാണൂ',
      close:     'അടയ്ക്കൂ',
      back:      'തിരിക്കൂ',
      next:      'അടുത്തത്',
      prev:      'മുൻപത്തേത്',
      price:     'വില',
      currency:  '₹',
    },
  },
};

/** Get current language from localStorage (defaults to 'en') */
export function getLang() {
  return localStorage.getItem('bhumi_lang') || 'en';
}

/** Persist and reload in the new language */
export function setLang(lang) {
  if (lang !== 'en' && lang !== 'ml') return;
  localStorage.setItem('bhumi_lang', lang);
  document.documentElement.lang = lang;
  window.location.reload();
}

/**
 * Translate a dot-separated key in the current (or specified) language.
 * Falls back to English, then to the raw key string.
 *
 * @param {string} key   - e.g. 'nav.home', 'trust.items'
 * @param {string} [lang]- 'en' | 'ml' (defaults to current)
 * @returns {*} translated string, array, or object
 */
export function t(key, lang = null) {
  const l = lang || getLang();
  const keys = key.split('.');
  let val = translations[l];
  for (const k of keys) {
    val = val?.[k];
    if (val === undefined) break;
  }
  // Fallback to English
  if (val === undefined && l !== 'en') {
    let enVal = translations.en;
    for (const k of keys) {
      enVal = enVal?.[k];
      if (enVal === undefined) break;
    }
    return enVal ?? key;
  }
  return val ?? key;
}

/** Apply current language font to entire document */
export function applyLangFont() {
  const lang = getLang();
  document.documentElement.lang = lang;
  if (lang === 'ml') {
    document.body.style.fontFamily = "'Noto Sans Malayalam', sans-serif";
  } else {
    document.body.style.fontFamily = '';
  }
}
