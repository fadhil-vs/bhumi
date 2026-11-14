# Bhumi Foods — E-commerce Website

Premium Kerala masala powder e-commerce website.
**Stack:** HTML5 · Tailwind CSS · Vanilla JS (ES Modules) · Supabase

---

## 🚀 Quick Start (Development)

1. Open `index.html` directly in a browser — no build step required.
2. All JS runs as ES modules via native browser support.
3. Tailwind styles are served via CDN during development.

> **Note:** Chrome and Edge require a local server for ES module imports.
> Use VS Code **Live Server** extension or run:
> ```
> npx serve .
> ```

---

## ⚙️ Supabase Setup (Required for Database)

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **Project Settings → API**
3. Open `js/config/supabase.js`
4. Replace the placeholder values:
   ```js
   const SUPABASE_URL  = 'https://YOUR_PROJECT_REF.supabase.co';
   const SUPABASE_ANON = 'YOUR_ANON_KEY_HERE';
   ```
5. Run the SQL schema (see `supabase/schema.sql` — created in Milestone 3)

Until Supabase is configured, the site uses built-in placeholder data.

---

## 📁 Project Structure

```
bhumi/
├── index.html              ← Homepage (all 8 sections)
├── products.html           ← Product catalogue
├── product.html            ← Product detail (?id=...)
├── cart.html               ← Shopping cart + WhatsApp checkout
├── package.json
├── vercel.json             ← Vercel deployment config
│
├── assets/
│   ├── css/
│   │   └── main.css        ← Brand styles & design system
│   └── images/
│       ├── logo.png        ← ⚠️  Replace with Bhumi Foods logo
│       ├── product-placeholder.svg
│       └── category-placeholder.svg
│
├── js/
│   ├── config/
│   │   └── supabase.js     ← ⚠️  Add your Supabase credentials
│   ├── utils/
│   │   ├── i18n.js         ← EN/ML translations
│   │   ├── format.js       ← Price, date, URL helpers
│   │   └── dom.js          ← Safe DOM utilities
│   ├── services/
│   │   ├── products.js     ← Product data (Supabase + fallback)
│   │   ├── categories.js   ← Category data
│   │   ├── cart.js         ← Cart (localStorage)
│   │   ├── settings.js     ← Site settings
│   │   └── whatsapp.js     ← WhatsApp checkout message builder
│   ├── components/
│   │   ├── navbar.js       ← Sticky nav (renders + init)
│   │   ├── footer.js       ← Footer (renders + init)
│   │   ├── productCard.js  ← Reusable product card
│   │   ├── variantPicker.js← Weight selector
│   │   ├── imageGallery.js ← Product image viewer
│   │   ├── videoPlayer.js  ← Factory process video cards
│   │   └── languageSwitcher.js
│   ├── pages/
│   │   ├── home.js         ← Homepage orchestrator
│   │   ├── products.js     ← Catalogue page
│   │   ├── productDetail.js← Detail page
│   │   └── cart.js         ← Cart page
│   └── admin/
│       ├── auth.js         ← Login / session guard
│       └── dashboard.js    ← Dashboard stats
│
└── admin/
    ├── login.html
    ├── dashboard.html
    ├── categories.html
    ├── homepage.html
    ├── videos.html
    ├── orders.html
    ├── settings.html
    └── products/
        ├── index.html      ← Product list
        ├── add.html        ← Add product form
        └── edit.html       ← Edit product (?id=...)
```

---

## 🌐 Language Support

- **English** (default) and **Malayalam**
- Language stored in `localStorage` as `bhumi_lang`
- Toggle appears in nav and footer
- All UI strings live in `js/utils/i18n.js`
- Product content: `name_en`/`name_ml`, `description_en`/`description_ml`

---

## 🛒 WhatsApp Checkout Flow

1. Customer adds products to cart (stored in `localStorage`)
2. Taps "Checkout via WhatsApp"
3. Order message generated in selected language
4. WhatsApp opens with pre-filled message
5. Customer taps **Send** to confirm

No automatic order confirmation. No payment processed online.

---

## 🎨 Design System

| Token | Value | Usage |
|-------|-------|-------|
| `sage-light` | `#F1F4E9` | Page background |
| `sage`       | `#DDE8D4` | Cards, borders |
| `forest`     | `#214A36` | Nav, headings, CTAs |
| `cream`      | `#F4EBDD` | Story section |
| `beige`      | `#B7A078` | Accents, prices |

**Fonts:** Playfair Display (headings) · DM Sans (body) · Noto Sans Malayalam

---

## 📦 Development Milestones

| # | Milestone | Status |
|---|-----------|--------|
| M1 | Project Setup & Design System | ✅ **Complete** |
| M2 | Responsive Homepage | 🔄 Next |
| M3 | Supabase Schema & RLS | Pending |
| M4 | Live DB Integration | Pending |
| M5 | Products & Detail Pages | Pending |
| M6 | Cart & WhatsApp Checkout | Pending |
| M7 | Admin Authentication | Pending |
| M8 | Admin Product & Category Management | Pending |
| M9 | Admin Homepage & Video Upload | Pending |
| M10 | Bilingual Polish | Pending |
| M11 | Excel Import | Pending |
| M12 | QA, Performance & Deploy | Pending |

---

## 🔐 Security Notes

- Only the **anon key** is used in frontend code
- **Never** commit the `service_role` key to this repository
- Supabase Row Level Security (RLS) enforces access control at the DB level
- Admin pages are protected by Supabase Auth session checks

---

## 📞 Contact

**Bhumi Foods** · Mundur, Thrissur, Kerala  
📱 +91 9744 033 555 · 📧 info@bhumifoods.net  
🕐 Mon–Sat: 8:30 AM – 6:30 PM
