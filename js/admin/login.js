/**
 * Bhumi Foods — Login Page Script
 * Only loaded by admin/login.html
 */

import { supabase } from '../config/supabase.js';

const LOGIN_PAGE     = '/admin/login.html';
const DASHBOARD_PAGE = '/admin/dashboard.html';

// If already logged in → go straight to dashboard (page stays hidden)
(async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (session) {
    window.location.href = DASHBOARD_PAGE;
  } else {
    // Not logged in — show the login form
    document.body.style.visibility = 'visible';
  }
})();

// Password visibility toggle
document.getElementById('toggle-pw')?.addEventListener('click', () => {
  const pw = document.getElementById('password');
  if (pw) pw.type = pw.type === 'password' ? 'text' : 'password';
});

// Login form submit
document.getElementById('login-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const errBox  = document.getElementById('login-error');
  const loginBtn = document.getElementById('login-btn');

  errBox?.classList.add('hidden');
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
