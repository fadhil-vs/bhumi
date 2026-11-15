/**
 * Bhumi Foods — WhatsApp Checkout Service
 * 1. Saves order to Supabase FIRST (including customer details)
 * 2. Opens WhatsApp with the order message & customer info
 * 3. Clears the cart immediately
 */

import { getCart, getCartTotal, clearCart } from './cart.js';
import { getSettings } from './settings.js';
import { getLang } from '../utils/i18n.js';
import { supabase } from '../config/supabase.js';

/**
 * Build the WhatsApp message string from customer info & cart items.
 */
export function buildOrderMessage(lang = 'en', cart = null, total = null, customer = null) {
  cart  = cart  ?? getCart();
  total = total ?? getCartTotal();
  if (!cart.length) return '';

  const isMl = lang === 'ml';

  const customerHeader = isMl
    ? [
        '*ഭൂമി ഫുഡ്സ് — പുതിയ ഓർഡർ*',
        '',
        '*ഉപഭോക്താവിന്റെ വിവരങ്ങൾ:*',
        customer?.name ? `👤 പേര്: ${customer.name}` : '',
        customer?.phone ? `📱 ഫോൺ: ${customer.phone}` : '',
        customer?.address ? `📍 വിലാസം:\n${customer.address}` : '',
        '',
        '*ഓർഡർ ചെയ്ത സാധനങ്ങൾ:*',
      ].filter(Boolean)
    : [
        '*BHUMI FOODS — NEW ORDER*',
        '',
        '*Customer Details:*',
        customer?.name ? `👤 Name: ${customer.name}` : '',
        customer?.phone ? `📱 Phone: ${customer.phone}` : '',
        customer?.address ? `📍 Delivery Address:\n${customer.address}` : '',
        '',
        '*Order Items:*',
      ].filter(Boolean);

  const lines = cart.map((item, i) => {
    const name      = isMl ? (item.name_ml || item.name_en) : item.name_en;
    const lineTotal = item.price * item.qty;
    return isMl
      ? `${i + 1}. *${name}*\n   തൂക്കം: ${item.weight_label} | എണ്ണം: ${item.qty} | ₹${lineTotal.toLocaleString('en-IN')}`
      : `${i + 1}. *${name}*\n   Weight: ${item.weight_label} | Qty: ${item.qty} | ₹${lineTotal.toLocaleString('en-IN')}`;
  });

  const footer = isMl
    ? ['', `*ആകെ തുക: ₹${total.toLocaleString('en-IN')}*`, '', 'ദയവായി എന്റെ ഓർഡർ സ്ഥിരീകരിക്കൂ.']
    : ['', `*Total Amount: ₹${total.toLocaleString('en-IN')}*`, '', 'Please confirm my order.'];

  return [...customerHeader, ...lines, ...footer].join('\n');
}

/**
 * Full checkout flow:
 * @param {Object} [customer] - { name, phone, address }
 */
export async function openWhatsAppCheckout(customer = {}) {
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
    items: cart.map(item => ({
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
    customer_whatsapp: customer?.phone || phone,
    notes: customer?.name ? `Customer: ${customer.name}\nAddress: ${customer.address || 'N/A'}` : null,
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

  // ── 2. Build WhatsApp message ───────────────────────────────
  const message  = buildOrderMessage(lang, cart, total, customer);
  const orderRef = orderId ? `\n\n_Order ID: #${orderId.slice(0, 8).toUpperCase()}_` : '';
  const fullMsg  = message + orderRef;
  const url      = `https://wa.me/${phone}?text=${encodeURIComponent(fullMsg)}`;

  window.open(url, '_blank', 'noopener,noreferrer');

  // ── 3. Clear cart after WhatsApp opens ─────────────────────
  clearCart();
}
