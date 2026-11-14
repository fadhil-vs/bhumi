/**
 * Bhumi Foods — Admin Authentication
 * Handles login, session guard, and logout.
 * Fully implemented in Milestone 7; scaffold here for page wiring.
 */

import { supabase } from '../config/supabase.js';

const LOGIN_PAGE    = '/admin/login.html';
const DASHBOARD_PAGE = '/admin/dashboard.html';

/** Redirect to login if not authenticated */
export async function requireAuth() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    window.location.href = LOGIN_PAGE;
    return null;
  }
  return session;
}

/** Logout and redirect */
export async function logout() {
  await supabase.auth.signOut();
  window.location.href = LOGIN_PAGE;
}

/** Attach logout button */
export function initLogout() {
  document.getElementById('logout-btn')?.addEventListener('click', logout);
}

/* ── Login page logic ─────────────────────────────────── */
const form    = document.getElementById('login-form');
const errBox  = document.getElementById('login-error');
const loginBtn = document.getElementById('login-btn');
const togglePw = document.getElementById('toggle-pw');
const pwInput  = document.getElementById('password');

// If already logged in, go to dashboard
(async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) window.location.href = DASHBOARD_PAGE;
})();

// Password visibility toggle
togglePw?.addEventListener('click', () => {
  pwInput.type = pwInput.type === 'password' ? 'text' : 'password';
});

// Login form submit
form?.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (errBox) errBox.classList.add('hidden');
  if (loginBtn) { loginBtn.textContent = 'Signing in…'; loginBtn.disabled = true; }

  const email    = document.getElementById('email')?.value?.trim();
  const password = document.getElementById('password')?.value;

  if (!email || !password) {
    if (errBox) { errBox.textContent = 'Please enter your email and password.'; errBox.classList.remove('hidden'); }
    if (loginBtn) { loginBtn.textContent = 'Sign In'; loginBtn.disabled = false; }
    return;
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (errBox) {
      errBox.textContent = error.message === 'Invalid login credentials'
        ? 'Incorrect email or password. Please try again.'
        : error.message;
      errBox.classList.remove('hidden');
    }
    if (loginBtn) { loginBtn.textContent = 'Sign In'; loginBtn.disabled = false; }
  } else {
    window.location.href = DASHBOARD_PAGE;
  }
});
