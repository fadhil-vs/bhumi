/**
 * Bhumi Foods — Orders Admin JS
 */
import { requireAuth, initLogout } from './auth.js';
import { supabase } from '../config/supabase.js';

async function init() {
  await requireAuth();
  initLogout();
  await loadOrders();
  document.getElementById('status-filter')?.addEventListener('change', loadOrders);
  document.getElementById('order-modal-close')?.addEventListener('click', closeModal);
}

async function loadOrders() {
  const tbody  = document.getElementById('orders-table-body');
  const filter = document.getElementById('status-filter')?.value;

  tbody.innerHTML = `<tr><td colspan="6" class="px-5 py-10 text-center text-sm text-gray-400">Loading orders…</td></tr>`;

  let query = supabase.from('orders').select('*').order('created_at', { ascending: false });
  if (filter) query = query.eq('status', filter);

  const { data, error } = await query;

  if (error) {
    tbody.innerHTML = `<tr><td colspan="6" class="px-5 py-10 text-center text-sm text-red-500">Error: ${error.message}</td></tr>`;
    return;
  }

  if (!data?.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="px-5 py-10 text-center text-sm text-gray-400">No orders yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = data.map(order => {
    const date = new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    const itemCount = Array.isArray(order.items) ? order.items.length : '?';
    const statusColor = { pending: 'bg-yellow-100 text-yellow-700', confirmed: 'bg-green-100 text-green-700', cancelled: 'bg-red-100 text-red-700' };
    return `
      <tr class="border-b border-sage/50 hover:bg-sage-light/40 transition-colors">
        <td class="px-5 py-3.5">
          <p class="text-sm font-medium text-gray-800">${order.customer_whatsapp || 'Unknown'}</p>
          <p class="text-xs text-gray-400 mt-0.5">#${order.id.slice(0,8).toUpperCase()}</p>
        </td>
        <td class="px-5 py-3.5 text-sm text-gray-600 hidden md:table-cell">${date}</td>
        <td class="px-5 py-3.5 text-sm text-gray-600 hidden lg:table-cell">${itemCount} item(s)</td>
        <td class="px-5 py-3.5 text-sm font-medium text-gray-800">₹${Number(order.total_amount).toFixed(2)}</td>
        <td class="px-5 py-3.5">
          <span class="text-xs font-medium px-2 py-1 rounded-full ${statusColor[order.status] || 'bg-gray-100 text-gray-500'}">
            ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        </td>
        <td class="px-5 py-3.5 text-right">
          <div class="flex items-center justify-end gap-2">
            <button class="text-xs font-medium text-forest hover:underline view-btn" data-order='${JSON.stringify(order)}'>View</button>
            <select class="text-xs border border-sage rounded-sm px-2 py-1 status-select" data-id="${order.id}">
              <option value="pending"   ${order.status==='pending'   ? 'selected':''}>Pending</option>
              <option value="confirmed" ${order.status==='confirmed' ? 'selected':''}>Confirmed</option>
              <option value="cancelled" ${order.status==='cancelled' ? 'selected':''}>Cancelled</option>
            </select>
          </div>
        </td>
      </tr>`;
  }).join('');

  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', () => openModal(JSON.parse(btn.dataset.order)));
  });
  document.querySelectorAll('.status-select').forEach(sel => {
    sel.addEventListener('change', async e => {
      await supabase.from('orders').update({ status: e.target.value }).eq('id', sel.dataset.id);
    });
  });
}

function openModal(order) {
  const content = document.getElementById('order-modal-content');
  const items = Array.isArray(order.items) ? order.items : [];
  content.innerHTML = `
    <div class="space-y-4 text-sm">
      <div class="grid grid-cols-2 gap-3">
        <div><p class="text-xs text-gray-400">Order ID</p><p class="font-mono text-xs">${order.id}</p></div>
        <div><p class="text-xs text-gray-400">Date</p><p>${new Date(order.created_at).toLocaleString('en-IN')}</p></div>
        <div><p class="text-xs text-gray-400">WhatsApp</p><p>${order.customer_whatsapp || '—'}</p></div>
        <div><p class="text-xs text-gray-400">Language</p><p>${order.language?.toUpperCase() || 'EN'}</p></div>
      </div>
      <div class="border-t border-sage pt-4">
        <p class="text-xs text-gray-400 mb-2 font-semibold uppercase tracking-widest">Items</p>
        ${items.map(item => `
          <div class="flex justify-between py-1.5 border-b border-sage/40">
            <div><p class="font-medium">${item.name || item.name_en || '?'}</p><p class="text-xs text-gray-400">${item.variant || ''} × ${item.qty}</p></div>
            <p class="font-medium">₹${item.price}</p>
          </div>`).join('')}
      </div>
      <div class="flex justify-between font-semibold text-base pt-2">
        <span>Total</span><span>₹${Number(order.total_amount).toFixed(2)}</span>
      </div>
      ${order.notes ? `<div class="bg-cream border border-beige/30 rounded-sm p-3 text-xs text-gray-600"><strong>Notes:</strong> ${order.notes}</div>` : ''}
    </div>`;
  document.getElementById('order-modal').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('order-modal').classList.add('hidden');
}

init();
