/**
 * Bhumi Foods — Admin Auth Utilities
 * Shared by ALL admin pages (dashboard, products, orders, etc.)
 * Does NOT contain any login-page-specific logic.
 */

import { supabase } from '../config/supabase.js';

const LOGIN_PAGE     = '/admin/login.html';
const DASHBOARD_PAGE = '/admin/dashboard.html';

/**
 * Call at the top of every protected admin page.
 * - If no session → redirect to login (page stays hidden)
 * - If session OK  → reveal the page body
 */
export async function requireAuth() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    window.location.href = LOGIN_PAGE;
    return null;
  }
  document.body.style.visibility = 'visible';
  return session;
}

/** Sign out and redirect to login */
export async function logout() {
  await supabase.auth.signOut();
  window.location.href = LOGIN_PAGE;
}

/** Wire up the logout button (call from every protected page) */
export function initLogout() {
  document.getElementById('logout-btn')?.addEventListener('click', logout);
}

export { DASHBOARD_PAGE, LOGIN_PAGE };
