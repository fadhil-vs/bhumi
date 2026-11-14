/**
 * Bhumi Foods — WhatsApp Checkout Service
 * Builds order messages in EN and ML and opens WhatsApp.
 */

import { getCart, getCartTotal } from './cart.js';
import { getSettings } from './settings.js';
import { getLang } from '../utils/i18n.js';

/**
 * Build the WhatsApp order message.
 * @param {string} lang - 'en' | 'ml'
 * @returns {string}
 */
export function buildOrderMessage(lang = 'en') {
  const cart  = getCart();
  const total = getCartTotal();

  if (cart.length === 0) return '';

  const lines = cart.map((item, i) => {
    const name   = lang === 'ml' ? (item.name_ml || item.name_en) : item.name_en;
    const lineTotal = item.price * item.qty;
    if (lang === 'ml') {
      return `${i + 1}. ${name}\n   തൂക്കം: ${item.weight_label} | എണ്ണം: ${item.qty} | ₹${lineTotal.toLocaleString('en-IN')}`;
    }
    return `${i + 1}. ${name}\n   Weight: ${item.weight_label} | Qty: ${item.qty} | ₹${lineTotal.toLocaleString('en-IN')}`;
  });

  if (lang === 'ml') {
    return [
      'നമസ്കാരം! എനിക്ക് ഒരു ഓർഡർ ചെയ്യണം.',
      '',
      ...lines,
      '',
      `ആകെ: ₹${total.toLocaleString('en-IN')}`,
      '',
      'ദയവായി എന്റെ ഓർഡർ സ്ഥിരീകരിക്കൂ.',
    ].join('\n');
  }

  return [
    'Hello! I would like to place an order.',
    '',
    ...lines,
    '',
    `Total: ₹${total.toLocaleString('en-IN')}`,
    '',
    'Please confirm my order.',
  ].join('\n');
}

/**
 * Open WhatsApp with the generated order message.
 * Does NOT submit or confirm an order automatically.
 * The customer must tap Send in WhatsApp.
 */
export async function openWhatsAppCheckout() {
  const lang     = getLang();
  const settings = await getSettings();
  const phone    = settings.whatsapp_number?.replace(/\D/g, '') || '919744033555';
  const message  = buildOrderMessage(lang);

  if (!message) {
    alert(lang === 'ml' ? 'കാർട്ട് ഒഴിഞ്ഞിരിക്കുന്നു.' : 'Your cart is empty.');
    return;
  }

  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}
