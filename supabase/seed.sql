-- ============================================================
-- Bhumi Foods — Seed Data
-- Run AFTER schema.sql to populate initial categories
-- ============================================================

INSERT INTO categories (name_en, name_ml, slug, is_active, display_order)
VALUES
  ('Chilli Powders',      'മുളക് പൊടി',    'chilli-powders',    true, 1),
  ('Turmeric Powders',    'മഞ്ഞൾ പൊടി',   'turmeric-powders',  true, 2),
  ('Coriander Powders',   'മല്ലി പൊടി',   'coriander-powders', true, 3),
  ('Garam Masala',        'ഗരം മസാല',     'garam-masala',      true, 4),
  ('Meat Masala',         'മീറ്റ് മസാല',  'meat-masala',       true, 5),
  ('Special Spice Blends','സ്പെഷ്യൽ മസാല','special-blends',    true, 6)
ON CONFLICT (slug) DO NOTHING;
