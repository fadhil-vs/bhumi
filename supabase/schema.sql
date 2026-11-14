-- ============================================================
-- Bhumi Foods — Supabase Database Schema
-- Run this entire file in Supabase SQL Editor
-- Project: https://supabase.com → SQL Editor → New Query
-- ============================================================


-- ── 1. CATEGORIES ────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en       text NOT NULL,
  name_ml       text,
  slug          text UNIQUE NOT NULL,
  image_path    text,
  is_active     boolean NOT NULL DEFAULT true,
  display_order int NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- ── 2. PRODUCTS ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS products (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name_en         text NOT NULL,
  name_ml         text,
  description_en  text,
  description_ml  text,
  category_id     uuid REFERENCES categories(id) ON DELETE SET NULL,
  is_active       boolean NOT NULL DEFAULT true,
  is_featured     boolean NOT NULL DEFAULT false,
  featured_order  int,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ── 3. PRODUCT VARIANTS ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS product_variants (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id    uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  weight_label  text NOT NULL,       -- "100g", "250g", "500g", "1kg"
  price         numeric(10,2) NOT NULL CHECK (price >= 0),
  stock_qty     int NOT NULL DEFAULT 0 CHECK (stock_qty >= 0),
  is_available  boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- ── 4. PRODUCT IMAGES ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS product_images (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id    uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  storage_path  text NOT NULL,       -- Supabase Storage path
  position      int NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- ── 5. FACTORY VIDEOS ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS factory_videos (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  process_step    int NOT NULL UNIQUE CHECK (process_step BETWEEN 1 AND 5),
  title_en        text,
  title_ml        text,
  sub_en          text,
  sub_ml          text,
  storage_path    text,              -- Supabase Storage path (MP4)
  thumbnail_path  text,
  is_active       boolean NOT NULL DEFAULT true,
  display_order   int NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- Insert 5 placeholder process steps
INSERT INTO factory_videos (process_step, title_en, title_ml, sub_en, sub_ml, is_active, display_order)
VALUES
  (1, 'Ingredient Selection', 'ചേരുവ തിരഞ്ഞെടുക്കൽ', 'Carefully chosen from trusted farms', 'വിശ്വസ്ത കർഷകരിൽ നിന്ന് ശ്രദ്ധയോടെ', true, 1),
  (2, 'Cleaning & Sorting',   'ശുചീകരണം',             'Sorted by hand for purity',           'ശുദ്ധതയ്ക്കായി കൈകൊണ്ട് തരംതിരിക്കൽ', true, 2),
  (3, 'Drying',               'ഉണക്കൽ',               'Sun-dried for natural preservation',   'പ്രകൃതിദത്ത സംരക്ഷണത്തിനായി ഉണക്കൽ', true, 3),
  (4, 'Grinding',             'പൊടിക്കൽ',             'Ground fresh for full flavour',        'പൂർണ്ണ രുചിക്കായി പുതുതായി പൊടിക്കൽ', true, 4),
  (5, 'Packaging',            'പാക്കേജിംഗ്',          'Sealed hygienically for freshness',    'പുതുമ നിലനിർത്താൻ ശുചിയായി പൊതിയൽ', true, 5)
ON CONFLICT (process_step) DO NOTHING;

-- ── 6. SITE SETTINGS ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS site_settings (
  id                int PRIMARY KEY DEFAULT 1,
  whatsapp_number   text NOT NULL DEFAULT '919744033555',
  instagram_url     text DEFAULT 'https://www.instagram.com/bhumi_foodsindia',
  youtube_url       text DEFAULT 'https://www.youtube.com/@bhumifoods',
  brand_logo        text,
  factory_address   text DEFAULT '14/31D Peringannur, Mundur, Thrissur, Kerala 680545',
  factory_email     text DEFAULT 'info@bhumifoods.net',
  factory_hours     text DEFAULT 'Mon–Sat: 8:30 AM – 6:30 PM',
  factory_phone     text DEFAULT '+91 9744 033 555',
  default_language  text DEFAULT 'en',
  brand_story_en    text,
  brand_story_ml    text,
  CONSTRAINT one_row CHECK (id = 1)
);

-- Insert default settings row
INSERT INTO site_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- ── 7. TRUST ITEMS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS trust_items (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  label_en      text NOT NULL,
  label_ml      text,
  desc_en       text,
  desc_ml       text,
  icon_name     text,
  is_active     boolean NOT NULL DEFAULT true,
  display_order int NOT NULL DEFAULT 0
);

-- Default trust items
INSERT INTO trust_items (label_en, label_ml, desc_en, desc_ml, is_active, display_order)
VALUES
  ('Carefully Sourced',    'ശ്രദ്ധയോടെ തിരഞ്ഞെടുത്തത്',  'Ingredients selected from trusted farms across Kerala.', 'കേരളത്തിലെ വിശ്വസ്ത കർഷകരിൽ നിന്ന്.', true, 1),
  ('Quality Processing',   'ഗുണ നിലവാര നിർമ്മാണം',       'Cleaned, dried and ground with consistent attention.',    'ശ്രദ്ധയോടെ ശുദ്ധീകരിച്ച്, ഉണക്കി, പൊടിച്ചത്.', true, 2),
  ('Hygienic Packaging',   'ശുചിയായ പാക്കേജിംഗ്',         'Sealed fresh at our Mundur facility, Mon–Sat.',           'മുണ്ടൂർ ഫാക്ടറിയിൽ പുതുതായി സീൽ ചെയ്തത്.', true, 3),
  ('No Artificial Agents', 'കൃത്രിമ ഘടകങ്ങൾ ഇല്ല',       'Free from added colours, preservatives or fillers.',      'നിറം, സംരക്ഷകങ്ങൾ, ഫില്ലറുകൾ ഇല്ലാതെ.', true, 4)
ON CONFLICT DO NOTHING;

-- ── 8. ORDERS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS orders (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_whatsapp   text,
  items               jsonb NOT NULL,       -- [{name, variant, qty, price}]
  total_amount        numeric(10,2) NOT NULL,
  language            text NOT NULL DEFAULT 'en',
  status              text NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending','confirmed','cancelled')),
  notes               text,
  created_at          timestamptz NOT NULL DEFAULT now()
);

-- ── 9. INDEXES ───────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_products_category    ON products(category_id);
CREATE INDEX IF NOT EXISTS idx_products_featured    ON products(is_featured, featured_order) WHERE is_featured = true;
CREATE INDEX IF NOT EXISTS idx_products_active      ON products(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_variants_product     ON product_variants(product_id);
CREATE INDEX IF NOT EXISTS idx_images_product       ON product_images(product_id, position);
CREATE INDEX IF NOT EXISTS idx_orders_status        ON orders(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_categories_active    ON categories(is_active, display_order);

-- ── 10. UPDATED_AT TRIGGER ───────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_products_updated_at ON products;
CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS)
-- Public = read active rows only
-- Admin  = full CRUD (via Supabase Auth service role or JWT)
-- ════════════════════════════════════════════════════════════

ALTER TABLE categories     ENABLE ROW LEVEL SECURITY;
ALTER TABLE products       ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE factory_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings  ENABLE ROW LEVEL SECURITY;
ALTER TABLE trust_items    ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders         ENABLE ROW LEVEL SECURITY;

-- ── Drop existing policies (makes script safe to re-run) ─────
DROP POLICY IF EXISTS "Public can read active categories"           ON categories;
DROP POLICY IF EXISTS "Public can read active products"             ON products;
DROP POLICY IF EXISTS "Public can read variants of active products" ON product_variants;
DROP POLICY IF EXISTS "Public can read images of active products"   ON product_images;
DROP POLICY IF EXISTS "Public can read active factory videos"       ON factory_videos;
DROP POLICY IF EXISTS "Public can read site settings"              ON site_settings;
DROP POLICY IF EXISTS "Public can read active trust items"         ON trust_items;
DROP POLICY IF EXISTS "Anyone can place an order"                  ON orders;
DROP POLICY IF EXISTS "Admins can read orders"                     ON orders;
DROP POLICY IF EXISTS "Admins can update order status"             ON orders;
DROP POLICY IF EXISTS "Admins manage categories"                   ON categories;
DROP POLICY IF EXISTS "Admins manage products"                     ON products;
DROP POLICY IF EXISTS "Admins manage variants"                     ON product_variants;
DROP POLICY IF EXISTS "Admins manage images"                       ON product_images;
DROP POLICY IF EXISTS "Admins manage videos"                       ON factory_videos;
DROP POLICY IF EXISTS "Admins update settings"                     ON site_settings;
DROP POLICY IF EXISTS "Admins manage trust items"                  ON trust_items;

-- ── Public read policies ──────────────────────────────────
CREATE POLICY "Public can read active categories"
  ON categories FOR SELECT USING (is_active = true);

CREATE POLICY "Public can read active products"
  ON products FOR SELECT USING (is_active = true);

CREATE POLICY "Public can read variants of active products"
  ON product_variants FOR SELECT USING (
    EXISTS (SELECT 1 FROM products p WHERE p.id = product_id AND p.is_active = true)
  );

CREATE POLICY "Public can read images of active products"
  ON product_images FOR SELECT USING (
    EXISTS (SELECT 1 FROM products p WHERE p.id = product_id AND p.is_active = true)
  );

CREATE POLICY "Public can read active factory videos"
  ON factory_videos FOR SELECT USING (is_active = true);

CREATE POLICY "Public can read site settings"
  ON site_settings FOR SELECT USING (true);

CREATE POLICY "Public can read active trust items"
  ON trust_items FOR SELECT USING (is_active = true);

-- ── Orders: anyone can INSERT, only admins can read/update ──
CREATE POLICY "Anyone can place an order"
  ON orders FOR INSERT WITH CHECK (true);

CREATE POLICY "Admins can read orders"
  ON orders FOR SELECT USING (
    auth.role() = 'authenticated'
  );

CREATE POLICY "Admins can update order status"
  ON orders FOR UPDATE USING (
    auth.role() = 'authenticated'
  );

-- ── Admin full-access policies (authenticated users only) ──
CREATE POLICY "Admins manage categories"
  ON categories FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admins manage products"
  ON products FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admins manage variants"
  ON product_variants FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admins manage images"
  ON product_images FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admins manage videos"
  ON factory_videos FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admins update settings"
  ON site_settings FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Admins manage trust items"
  ON trust_items FOR ALL USING (auth.role() = 'authenticated');


-- ════════════════════════════════════════════════════════════
-- STORAGE BUCKETS
-- Run these in Supabase Dashboard → Storage → New Bucket
-- Or uncomment and run below (requires storage extension)
-- ════════════════════════════════════════════════════════════

-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('products', 'products', true)
-- ON CONFLICT DO NOTHING;

-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('categories', 'categories', true)
-- ON CONFLICT DO NOTHING;

-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('videos', 'videos', true)
-- ON CONFLICT DO NOTHING;

-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('brand', 'brand', true)
-- ON CONFLICT DO NOTHING;

-- ✅ Schema complete. 
-- Next: seed categories using the INSERT statements in supabase/seed.sql
