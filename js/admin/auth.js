/**
 * Bhumi Foods — Admin Auth & Navigation Utilities
 * Shared by ALL admin pages (dashboard, products, orders, etc.)
 * Does NOT contain any login-page-specific logic.
 */

import { supabase } from '../config/supabase.js';

const LOGIN_PAGE     = '/admin/login.html';
const DASHBOARD_PAGE = '/admin/dashboard.html';

/**
 * Call at the top of every protected admin page.
 * - If no session → redirect to login (page stays hidden)
 * - If session OK  → reveal the page body and setup mobile drawer
 */
export async function requireAuth() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    window.location.href = LOGIN_PAGE;
    return null;
  }
  document.body.style.visibility = 'visible';
  initMobileSidebar();
  return session;
}

/** Sign out and redirect to login */
export async function logout() {
  await supabase.auth.signOut();
  window.location.href = LOGIN_PAGE;
}

/** Wire up the logout button (call from every protected page) */
export function initLogout() {
  document.querySelectorAll('#logout-btn, .admin-logout-btn').forEach(btn => {
    btn.addEventListener('click', logout);
  });
}

/** Setup mobile off-canvas drawer navigation for admin pages */
function initMobileSidebar() {
  const aside = document.querySelector('aside');
  if (!aside) return;

  // Insert mobile hamburger button into header if missing
  const header = document.querySelector('header');
  let mobileBtn = document.getElementById('mobile-sidebar-btn');
  if (header && !mobileBtn) {
    mobileBtn = document.createElement('button');
    mobileBtn.id = 'mobile-sidebar-btn';
    mobileBtn.className = 'md:hidden p-1.5 -ml-1 text-forest hover:bg-sage-light rounded mr-2';
    mobileBtn.setAttribute('aria-label', 'Toggle admin menu');
    mobileBtn.innerHTML = `
      <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
      </svg>
    `;
    header.prepend(mobileBtn);
  }

  // Create mobile overlay backdrop
  let overlay = document.getElementById('admin-drawer-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'admin-drawer-overlay';
    overlay.className = 'fixed inset-0 bg-black/50 z-40 hidden md:hidden transition-opacity';
    document.body.appendChild(overlay);
  }

  const toggleDrawer = (open) => {
    if (open) {
      aside.classList.remove('hidden');
      aside.classList.add('fixed', 'inset-y-0', 'left-0', 'z-50', 'w-64', 'shadow-2xl', 'flex');
      overlay.classList.remove('hidden');
    } else {
      aside.classList.add('hidden');
      aside.classList.remove('fixed', 'inset-y-0', 'left-0', 'z-50', 'w-64', 'shadow-2xl', 'flex');
      overlay.classList.add('hidden');
    }
  };

  mobileBtn?.addEventListener('click', () => {
    const isOpen = !aside.classList.contains('hidden');
    toggleDrawer(!isOpen);
  });

  overlay.addEventListener('click', () => toggleDrawer(false));
}

export { DASHBOARD_PAGE, LOGIN_PAGE };
