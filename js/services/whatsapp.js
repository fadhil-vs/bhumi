/**
 * Bhumi Foods — WhatsApp Checkout Service
 * 1. Saves order to Supabase FIRST
 * 2. Opens WhatsApp with the order message
 * 3. Clears the cart immediately
 */

import { getCart, getCartTotal, clearCart } from './cart.js';
import { getSettings } from './settings.js';
import { getLang } from '../utils/i18n.js';
import { supabase } from '../config/supabase.js';

/**
 * Build the WhatsApp message string from cart items.
 */
export function buildOrderMessage(lang = 'en', cart = null, total = null) {
  cart  = cart  ?? getCart();
  total = total ?? getCartTotal();
  if (!cart.length) return '';

  const lines = cart.map((item, i) => {
    const name      = lang === 'ml' ? (item.name_ml || item.name_en) : item.name_en;
    const lineTotal = item.price * item.qty;
    return lang === 'ml'
      ? `${i + 1}. ${name}\n   തൂക്കം: ${item.weight_label} | എണ്ണം: ${item.qty} | ₹${lineTotal.toLocaleString('en-IN')}`
      : `${i + 1}. ${name}\n   Weight: ${item.weight_label} | Qty: ${item.qty} | ₹${lineTotal.toLocaleString('en-IN')}`;
  });

  return lang === 'ml'
    ? ['നമസ്കാരം! എനിക്ക് ഒരു ഓർഡർ ചെയ്യണം.', '', ...lines, '', `ആകെ: ₹${total.toLocaleString('en-IN')}`, '', 'ദയവായി എന്റെ ഓർഡർ സ്ഥിരീകരിക്കൂ.'].join('\n')
    : ['Hello! I would like to place an order.', '', ...lines, '', `Total: ₹${total.toLocaleString('en-IN')}`, '', 'Please confirm my order.'].join('\n');
}

/**
 * Full checkout flow:
 * 1. Save order record to Supabase (status = 'pending')
 * 2. Open WhatsApp with order message
 * 3. Clear customer cart
 */
export async function openWhatsAppCheckout() {
  const lang     = getLang();
  const cart     = getCart();
  const total    = getCartTotal();
  const settings = await getSettings();
  const phone    = settings?.whatsapp_number?.replace(/\D/g, '') || '919744033555';

  if (!cart.length) {
    alert(lang === 'ml' ? 'കാർട്ട് ഒഴിഞ്ഞിരിക്കുന്നു.' : 'Your cart is empty.');
    return;
  }

  // ── 1. Save order to Supabase ───────────────────────────────
  const orderPayload = {
    items:         cart.map(item => ({
      product_id:   item.product_id,
      variant_id:   item.variant_id,
      name_en:      item.name_en,
      name_ml:      item.name_ml || null,
      weight_label: item.weight_label,
      price:        item.price,
      qty:          item.qty,
    })),
    total_amount:  total,
    status:        'pending',
    language:      lang,
    // We store WhatsApp number as customer identifier
    customer_whatsapp: phone,
  };

  let orderId = null;
  try {
    const { data, error } = await supabase
      .from('orders')
      .insert(orderPayload)
      .select('id')
      .single();

    if (!error && data) orderId = data.id;
  } catch (_) {
    // Non-fatal — still open WhatsApp even if DB save fails
  }

  // ── 2. Build WhatsApp message (include order ID if saved) ───
  const message  = buildOrderMessage(lang, cart, total);
  const orderRef = orderId ? `\nOrder Ref: #${orderId.slice(0,8).toUpperCase()}` : '';
  const fullMsg  = message + orderRef;
  const url      = `https://wa.me/${phone}?text=${encodeURIComponent(fullMsg)}`;

  window.open(url, '_blank', 'noopener,noreferrer');

  // ── 3. Clear cart after WhatsApp opens ─────────────────────
  clearCart();
}
