/**
 * Bhumi Foods — Orders Admin JS
 * - Lists orders with status filter
 * - Status change to "confirmed" auto-deducts stock from product_variants
 * - Manual "Deduct Stock" button available on each confirmed order
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

  const statusColor = {
    pending:   'bg-yellow-100 text-yellow-700',
    confirmed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-600',
    completed: 'bg-blue-100 text-blue-700',
  };

  tbody.innerHTML = data.map(order => {
    const date      = new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
    const itemCount = Array.isArray(order.items) ? order.items.length : 0;
    const sc        = statusColor[order.status] || 'bg-gray-100 text-gray-500';
    const isStockDeducted = order.stock_deducted === true;

    return `
      <tr class="border-b border-sage/50 hover:bg-sage-light/40 transition-colors" data-order-id="${order.id}">
        <td class="px-5 py-3.5">
          <p class="text-sm font-medium text-gray-800">${order.customer_whatsapp || 'Unknown'}</p>
          <p class="text-xs text-gray-400 mt-0.5 font-mono">#${order.id.slice(0,8).toUpperCase()}</p>
        </td>
        <td class="px-5 py-3.5 text-sm text-gray-600 hidden md:table-cell">${date}</td>
        <td class="px-5 py-3.5 text-sm text-gray-600 hidden lg:table-cell">${itemCount} item(s)</td>
        <td class="px-5 py-3.5 text-sm font-medium text-gray-800">₹${Number(order.total_amount).toFixed(2)}</td>
        <td class="px-5 py-3.5">
          <span class="text-xs font-medium px-2 py-1 rounded-full ${sc}">
            ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
          ${isStockDeducted
            ? `<span class="ml-1 text-xs text-green-600 font-medium">· Stock ✓</span>`
            : (order.status === 'confirmed'
              ? `<span class="ml-1 text-xs text-orange-500 font-medium">· Stock pending</span>`
              : '')}
        </td>
        <td class="px-5 py-3.5 text-right">
          <div class="flex items-center justify-end gap-2 flex-wrap">
            <button class="text-xs font-medium text-forest hover:underline view-btn" data-order='${JSON.stringify(order).replace(/'/g, "&#39;")}'>View</button>
            <select class="text-xs border border-sage rounded-sm px-1.5 py-1 status-select" data-id="${order.id}" data-stock-deducted="${isStockDeducted}">
              <option value="pending"   ${order.status==='pending'   ?'selected':''}>Pending</option>
              <option value="confirmed" ${order.status==='confirmed' ?'selected':''}>Confirmed</option>
              <option value="completed" ${order.status==='completed' ?'selected':''}>Completed</option>
              <option value="cancelled" ${order.status==='cancelled' ?'selected':''}>Cancelled</option>
            </select>
            ${!isStockDeducted && (order.status === 'confirmed' || order.status === 'completed')
              ? `<button class="text-xs font-medium text-white bg-forest rounded-sm px-2 py-1 deduct-btn hover:bg-forest/80 transition-colors"
                   data-id="${order.id}" data-items='${JSON.stringify(order.items || []).replace(/'/g, "&#39;")}'>
                   Deduct Stock
                 </button>`
              : ''}
          </div>
        </td>
      </tr>`;
  }).join('');

  // ── Listeners ──────────────────────────────────────────────
  document.querySelectorAll('.view-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      try { openModal(JSON.parse(btn.dataset.order)); } catch {}
    });
  });

  document.querySelectorAll('.status-select').forEach(sel => {
    sel.addEventListener('change', async e => {
      const newStatus      = e.target.value;
      const orderId        = sel.dataset.id;
      const stockDeducted  = sel.dataset.stockDeducted === 'true';

      await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);

      // Auto-deduct stock when order is confirmed (only once)
      if (newStatus === 'confirmed' && !stockDeducted) {
        const row   = sel.closest('tr');
        const items = JSON.parse(row.querySelector('.deduct-btn')?.dataset.items || '[]');
        if (items.length) {
          await deductStock(orderId, items);
          await loadOrders(); // refresh to reflect deduction
        }
      } else if (newStatus === 'cancelled') {
        // If confirmed order is cancelled and stock was deducted, restore it
        // (optional — requires separate logic; left for future)
      }
    });
  });

  document.querySelectorAll('.deduct-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const items = JSON.parse(btn.dataset.items || '[]');
      btn.textContent = 'Deducting…'; btn.disabled = true;
      await deductStock(btn.dataset.id, items);
      await loadOrders();
    });
  });
}

/**
 * Deduct ordered quantities from product_variants.stock_qty
 * and mark order.stock_deducted = true.
 */
async function deductStock(orderId, items) {
  for (const item of items) {
    if (!item.variant_id) continue;

    // Get current stock
    const { data: variant } = await supabase
      .from('product_variants')
      .select('stock_qty')
      .eq('id', item.variant_id)
      .single();

    if (!variant) continue;

    const newQty = Math.max(0, (variant.stock_qty || 0) - (item.qty || 1));

    await supabase
      .from('product_variants')
      .update({
        stock_qty:    newQty,
        is_available: newQty > 0,
      })
      .eq('id', item.variant_id);
  }

  // Mark order as stock deducted
  await supabase
    .from('orders')
    .update({ stock_deducted: true })
    .eq('id', orderId);
}

function openModal(order) {
  const content = document.getElementById('order-modal-content');
  const items   = Array.isArray(order.items) ? order.items : [];

  content.innerHTML = `
    <div class="space-y-4 text-sm">
      <div class="grid grid-cols-2 gap-3 text-sm">
        <div><p class="text-xs text-gray-400">Order ID</p><p class="font-mono text-xs">#${order.id.slice(0,8).toUpperCase()}</p></div>
        <div><p class="text-xs text-gray-400">Date</p><p>${new Date(order.created_at).toLocaleString('en-IN')}</p></div>
        <div><p class="text-xs text-gray-400">WhatsApp</p><p>${order.customer_whatsapp || '—'}</p></div>
        <div><p class="text-xs text-gray-400">Status</p>
          <p class="font-semibold capitalize ${order.status === 'confirmed' ? 'text-green-700' : order.status === 'cancelled' ? 'text-red-600' : 'text-yellow-700'}">
            ${order.status}
          </p>
        </div>
        <div><p class="text-xs text-gray-400">Language</p><p>${order.language?.toUpperCase() || 'EN'}</p></div>
        <div><p class="text-xs text-gray-400">Stock Deducted</p>
          <p class="${order.stock_deducted ? 'text-green-600 font-semibold' : 'text-orange-500'}">
            ${order.stock_deducted ? 'Yes ✓' : 'No — deduct on confirm'}
          </p>
        </div>
      </div>

      <div class="border-t border-sage pt-4">
        <p class="text-xs text-gray-400 mb-2 font-semibold uppercase tracking-widest">Items Ordered</p>
        ${items.map(item => `
          <div class="flex justify-between py-1.5 border-b border-sage/40">
            <div>
              <p class="font-medium">${item.name_en || '?'}</p>
              <p class="text-xs text-gray-400">${item.weight_label || ''} × ${item.qty}</p>
            </div>
            <p class="font-medium">₹${(item.price * item.qty).toLocaleString('en-IN')}</p>
          </div>`).join('')}
      </div>

      <div class="flex justify-between font-semibold text-base pt-2">
        <span>Total</span>
        <span>₹${Number(order.total_amount).toLocaleString('en-IN')}</span>
      </div>

      ${order.notes ? `<div class="bg-cream border border-beige/30 rounded-sm p-3 text-xs text-gray-600"><strong>Notes:</strong> ${order.notes}</div>` : ''}
    </div>`;

  document.getElementById('order-modal').classList.remove('hidden');
}

function closeModal() {
  document.getElementById('order-modal').classList.add('hidden');
}

init();
