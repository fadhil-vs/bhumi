/**
 * Bhumi Foods — Cart Service
 * Persists cart to localStorage. No login required.
 *
 * Cart item shape:
 * {
 *   id:          string  (product_id + '_' + variant_id)
 *   product_id:  string
 *   variant_id:  string
 *   name_en:     string
 *   name_ml:     string
 *   weight_label:string  ("250g")
 *   price:       number
 *   qty:         number
 *   image_url:   string
 * }
 */

const CART_KEY = 'bhumi_cart';

/** Load cart array from localStorage */
export function getCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

/** Persist cart array to localStorage */
function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  window.dispatchEvent(new CustomEvent('bhumi:cart-updated', { detail: { cart } }));
}

/** Total number of items (sum of qty) */
export function getCartCount() {
  return getCart().reduce((sum, item) => sum + (item.qty || 1), 0);
}

/** Total price */
export function getCartTotal() {
  return getCart().reduce((sum, item) => sum + item.price * (item.qty || 1), 0);
}

/**
 * Add a product variant to cart (or increment qty if already present).
 * @param {Object} item - cart item shape (see above)
 */
export function addToCart(item) {
  const cart = getCart();
  const idx  = cart.findIndex(c => c.id === item.id);
  if (idx > -1) {
    cart[idx].qty = (cart[idx].qty || 1) + (item.qty || 1);
  } else {
    cart.push({ ...item, qty: item.qty || 1 });
  }
  saveCart(cart);
}

/**
 * Update the quantity of a cart item.
 * Removes the item if qty drops to 0.
 */
export function updateQty(itemId, qty) {
  let cart = getCart();
  if (qty <= 0) {
    cart = cart.filter(c => c.id !== itemId);
  } else {
    const item = cart.find(c => c.id === itemId);
    if (item) item.qty = qty;
  }
  saveCart(cart);
}

/** Remove a single item from cart */
export function removeFromCart(itemId) {
  saveCart(getCart().filter(c => c.id !== itemId));
}

/** Empty the entire cart */
export function clearCart() {
  saveCart([]);
}
