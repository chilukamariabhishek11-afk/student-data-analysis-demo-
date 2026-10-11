// js/fees.js - Student Fee Tracking, Payment Collection, and Printable Receipt Generator

let activeFeeStudentId = null;

function initFeesModule() {
  const statusFilter = document.getElementById('fee-status-filter');
  const gradeFilter = document.getElementById('fee-grade-filter');
  const searchInput = document.getElementById('fee-search-input');

  [statusFilter, gradeFilter].forEach(el => {
    if (el) el.addEventListener('change', () => renderFeesTable());
  });
  if (searchInput) {
    searchInput.addEventListener('input', () => renderFeesTable());
  }

  // Collect Fee Form submission
  const paymentForm = document.getElementById('collect-fee-form');
  if (paymentForm) {
    paymentForm.addEventListener('submit', handleFeePaymentSubmit);
  }
}

function getFilteredFeeAccounts() {
  const accounts = window.store.getAllFeeAccounts();
  const statusFilter = document.getElementById('fee-status-filter')?.value || 'all';
  const gradeFilter = document.getElementById('fee-grade-filter')?.value || 'all';
  const search = document.getElementById('fee-search-input')?.value.toLowerCase().trim() || '';

  return accounts.filter(acc => {
    if (!acc.student) return false;
    const matchStatus = statusFilter === 'all' || acc.status.toLowerCase() === statusFilter.toLowerCase();
    const matchGrade = gradeFilter === 'all' || acc.student.grade === gradeFilter;
    const matchSearch = !search || acc.student.name.toLowerCase().includes(search) || acc.student.rollNo.includes(search);
    return matchStatus && matchGrade && matchSearch;
  });
}

function renderFeesTable() {
  const filtered = getFilteredFeeAccounts();
  const allAccounts = window.store.getAllFeeAccounts();
  const settings = window.store.getSettings();
  const currency = settings.currency || '$';

  // Compute top overview stats
  let totalBilled = 0;
  let totalCollected = 0;
  let totalPending = 0;

  allAccounts.forEach(acc => {
    totalBilled += acc.effectiveFee;
    totalCollected += acc.paidAmount;
    totalPending += acc.dueAmount;
  });

  const billedEl = document.getElementById('fees-kpi-billed');
  const collectedEl = document.getElementById('fees-kpi-collected');
  const pendingEl = document.getElementById('fees-kpi-pending');
  const rateEl = document.getElementById('fees-kpi-rate');

  if (billedEl) billedEl.textContent = `${currency}${totalBilled.toLocaleString()}`;
  if (collectedEl) collectedEl.textContent = `${currency}${totalCollected.toLocaleString()}`;
  if (pendingEl) pendingEl.textContent = `${currency}${totalPending.toLocaleString()}`;
  if (rateEl) {
    const rate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0;
    rateEl.textContent = `${rate}%`;
  }

  const tbody = document.getElementById('fees-table-body');
  if (!tbody) return;

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="8" class="py-8 text-center text-slate-400 text-sm">
          No student fee records found matching filters.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(acc => {
    const s = acc.student;
    const statusBadge = acc.status === 'Paid' 
      ? '<span class="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800">Paid</span>'
      : acc.status === 'Partial'
      ? '<span class="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-800">Partial</span>'
      : '<span class="px-2.5 py-1 text-xs font-bold rounded-full bg-rose-100 text-rose-800">Unpaid</span>';

    return `
      <tr class="border-b border-slate-100 hover:bg-slate-50/70 transition-colors">
        <td class="py-3.5 px-4">
          <div class="font-bold text-slate-800 text-sm">${s.name}</div>
          <div class="text-[11px] text-slate-400">Roll: ${s.rollNo} &bull; Gr ${s.grade}-${s.section}</div>
        </td>
        <td class="py-3.5 px-4 text-xs font-semibold text-slate-700">
          ${currency}${acc.totalFee.toLocaleString()}
          ${acc.discount > 0 ? `<div class="text-[10px] text-emerald-600 font-medium">-${currency}${acc.discount} discount</div>` : ''}
        </td>
        <td class="py-3.5 px-4 text-xs font-bold text-slate-900">
          ${currency}${acc.effectiveFee.toLocaleString()}
        </td>
        <td class="py-3.5 px-4 text-xs font-bold text-emerald-600">
          ${currency}${acc.paidAmount.toLocaleString()}
        </td>
        <td class="py-3.5 px-4 text-xs font-bold ${acc.dueAmount > 0 ? 'text-rose-600' : 'text-slate-400'}">
          ${currency}${acc.dueAmount.toLocaleString()}
        </td>
        <td class="py-3.5 px-4">
          ${statusBadge}
        </td>
        <td class="py-3.5 px-4 text-right space-x-1">
          <button 
            onclick="window.openCollectFeeModal('${s.id}')"
            class="px-2.5 py-1.5 bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white rounded-lg text-xs font-semibold transition"
            title="Record Fee Payment">
            + Pay
          </button>
          <button 
            onclick="window.openStudentReceiptHistory('${s.id}')"
            class="px-2.5 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-semibold transition"
            title="View Receipts">
            Receipts (${acc.transactions.length})
          </button>
        </td>
      </tr>
    `;
  }).join('');

  if (window.lucide) window.lucide.createIcons();
}

function openCollectFeeModal(studentId) {
  const account = window.store.getFeeAccount(studentId);
  if (!account) return;

  activeFeeStudentId = studentId;
  const settings = window.store.getSettings();
  const currency = settings.currency || '$';

  document.getElementById('pay-student-name').textContent = account.student.name;
  document.getElementById('pay-student-info').textContent = `Roll No: ${account.student.rollNo} | Grade ${account.student.grade}-${account.student.section}`;
  document.getElementById('pay-due-amount').textContent = `${currency}${account.dueAmount.toLocaleString()}`;
  
  // Set default amount to remaining due
  const amountInput = document.getElementById('pay-amount-input');
  if (amountInput) {
    amountInput.value = account.dueAmount > 0 ? account.dueAmount : 0;
    amountInput.max = account.dueAmount > 0 ? account.dueAmount : 999999;
  }

  // Set today's date
  const dateInput = document.getElementById('pay-date-input');
  if (dateInput) {
    dateInput.value = new Date().toISOString().split('T')[0];
  }

  window.openModal('collect-fee-modal');
}

function handleFeePaymentSubmit(e) {
  e.preventDefault();
  if (!activeFeeStudentId) return;

  const amount = Number(document.getElementById('pay-amount-input').value);
  const method = document.getElementById('pay-method-input').value;
  const remarks = document.getElementById('pay-remarks-input').value;
  const date = document.getElementById('pay-date-input').value;

  if (amount <= 0) {
    window.showToast('Please enter a valid payment amount greater than 0', 'error');
    return;
  }

  const tx = window.store.addFeePayment(activeFeeStudentId, { amount, method, remarks, date });
  window.closeModal('collect-fee-modal');
  renderFeesTable();
  if (window.renderDashboard) window.renderDashboard();
  window.showToast(`Payment of $${amount} recorded successfully. Receipt #${tx.receiptNo}`, 'success');

  // Offer to view receipt immediately
  setTimeout(() => {
    openPrintableReceipt(activeFeeStudentId, tx.id);
  }, 300);
}

function openStudentReceiptHistory(studentId) {
  const account = window.store.getFeeAccount(studentId);
  if (!account) return;

  const settings = window.store.getSettings();
  const currency = settings.currency || '$';

  const modalBody = document.getElementById('receipt-history-modal-body');
  if (!modalBody) return;

  modalBody.innerHTML = `
    <div class="mb-4 flex items-center justify-between pb-3 border-b border-slate-100">
      <div>
        <h4 class="font-bold text-slate-800 text-base">${account.student.name}</h4>
        <p class="text-xs text-slate-500">Roll No: ${account.student.rollNo} &bull; Grade ${account.student.grade}-${account.student.section}</p>
      </div>
      <div class="text-right">
        <p class="text-xs text-slate-400">Total Paid</p>
        <p class="text-base font-extrabold text-emerald-600">${currency}${account.paidAmount.toLocaleString()}</p>
      </div>
    </div>

    ${account.transactions.length === 0 ? `
      <div class="py-8 text-center text-slate-400 text-xs">
        No payment transactions found for this student.
      </div>
    ` : `
      <div class="space-y-3">
        ${account.transactions.map(tx => `
          <div class="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between">
            <div>
              <div class="flex items-center space-x-2">
                <span class="text-xs font-bold text-slate-800">${tx.receiptNo}</span>
                <span class="text-[10px] px-2 py-0.5 rounded font-semibold bg-indigo-50 text-indigo-700">${tx.method}</span>
              </div>
              <p class="text-[11px] text-slate-400 mt-0.5">${tx.date} &bull; ${tx.remarks || 'Tuition Fee'}</p>
            </div>
            <div class="text-right flex items-center space-x-3">
              <span class="text-sm font-bold text-emerald-600">${currency}${Number(tx.amount).toLocaleString()}</span>
              <button 
                onclick="window.openPrintableReceipt('${account.student.id}', '${tx.id}')"
                class="px-2.5 py-1 text-xs font-semibold bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-100 transition shadow-sm inline-flex items-center space-x-1">
                <i data-lucide="printer" class="w-3.5 h-3.5"></i>
                <span>Receipt</span>
              </button>
            </div>
          </div>
        `).join('')}
      </div>
    `}
  `;

  if (window.lucide) window.lucide.createIcons();
  window.openModal('receipt-history-modal');
}

function openPrintableReceipt(studentId, transactionId) {
  const account = window.store.getFeeAccount(studentId);
  if (!account) return;

  const tx = (account.transactions || []).find(t => t.id === transactionId);
  if (!tx) return;

  const settings = window.store.getSettings();
  const currency = settings.currency || '$';

  const receiptArea = document.getElementById('printable-receipt-area');
  if (!receiptArea) return;

  receiptArea.innerHTML = `
    <div class="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-sm max-w-xl mx-auto font-sans text-slate-800">
      <!-- Header -->
      <div class="flex justify-between items-start border-b-2 border-indigo-600 pb-5 mb-6">
        <div>
          <div class="flex items-center space-x-2">
            <div class="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-black text-sm">
              ED
            </div>
            <h2 class="text-lg font-black tracking-tight text-slate-900">${settings.institutionName}</h2>
          </div>
          <p class="text-xs text-slate-500 mt-1">${settings.tagline}</p>
          <p class="text-[11px] text-slate-400">${settings.address} &bull; ${settings.phone}</p>
        </div>
        <div class="text-right">
          <span class="inline-block px-3 py-1 bg-emerald-50 text-emerald-700 font-extrabold text-xs uppercase tracking-wider rounded-md border border-emerald-200">
            Official Receipt
          </span>
          <p class="text-xs font-mono font-bold text-slate-700 mt-2">${tx.receiptNo}</p>
          <p class="text-[11px] text-slate-400">Date: ${tx.date}</p>
        </div>
      </div>

      <!-- Student Details -->
      <div class="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl text-xs mb-6 border border-slate-100">
        <div>
          <span class="text-slate-400 block text-[10px] uppercase font-bold">Student Name</span>
          <span class="font-bold text-slate-800 text-sm">${account.student.name}</span>
          <span class="text-slate-500 block mt-1">Roll No: ${account.student.rollNo}</span>
        </div>
        <div>
          <span class="text-slate-400 block text-[10px] uppercase font-bold">Grade & Section</span>
          <span class="font-bold text-slate-800">Grade ${account.student.grade} - ${account.student.section}</span>
          <span class="text-slate-500 block mt-1">Guardian: ${account.student.guardianName || 'N/A'}</span>
        </div>
      </div>

      <!-- Payment Breakdown Table -->
      <table class="w-full text-xs mb-6">
        <thead>
          <tr class="border-b border-slate-200 text-slate-500 font-semibold text-left">
            <th class="py-2">Description</th>
            <th class="py-2">Payment Mode</th>
            <th class="py-2 text-right">Amount Paid</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 font-medium">
          <tr>
            <td class="py-3">
              <span class="font-bold text-slate-800 block">${tx.remarks || 'Academic Tuition Fee'}</span>
              <span class="text-[11px] text-slate-400">Academic Year: ${settings.academicYear}</span>
            </td>
            <td class="py-3 font-semibold text-slate-700">${tx.method}</td>
            <td class="py-3 text-right font-bold text-slate-900">${currency}${Number(tx.amount).toLocaleString()}</td>
          </tr>
        </tbody>
      </table>

      <!-- Summary Balance -->
      <div class="bg-indigo-50/60 p-4 rounded-xl border border-indigo-100 mb-6 text-xs space-y-1.5">
        <div class="flex justify-between text-slate-600">
          <span>Total Assigned Fee:</span>
          <span class="font-semibold">${currency}${account.totalFee.toLocaleString()}</span>
        </div>
        ${account.discount > 0 ? `
          <div class="flex justify-between text-emerald-600">
            <span>Scholarship / Discount:</span>
            <span class="font-semibold">-${currency}${account.discount.toLocaleString()}</span>
          </div>
        ` : ''}
        <div class="flex justify-between text-slate-800 font-bold border-t border-indigo-100 pt-1.5">
          <span>Total Paid to Date:</span>
          <span class="text-emerald-700">${currency}${account.paidAmount.toLocaleString()}</span>
        </div>
        <div class="flex justify-between font-bold ${account.dueAmount > 0 ? 'text-rose-600' : 'text-slate-500'}">
          <span>Remaining Balance Due:</span>
          <span>${currency}${account.dueAmount.toLocaleString()}</span>
        </div>
      </div>

      <!-- Footer & Signature -->
      <div class="flex justify-between items-end pt-6 border-t border-slate-100 text-center">
        <div>
          <div class="w-28 border-b border-slate-300 pb-1 mx-auto text-[11px] text-slate-400">
            Verified Online
          </div>
          <span class="text-[10px] text-slate-400 mt-1 block">System Generated</span>
        </div>
        <div>
          <div class="w-36 border-b border-slate-400 pb-1 mx-auto font-serif text-xs italic text-slate-600">
            Accounts Office
          </div>
          <span class="text-[10px] text-slate-400 mt-1 block font-medium">Authorized Signatory</span>
        </div>
      </div>
    </div>
  `;

  // Close other modals and open receipt modal
  window.closeModal('collect-fee-modal');
  window.closeModal('receipt-history-modal');
  window.openModal('printable-receipt-modal');
}

window.initFeesModule = initFeesModule;
window.renderFeesTable = renderFeesTable;
window.openCollectFeeModal = openCollectFeeModal;
window.openStudentReceiptHistory = openStudentReceiptHistory;
window.openPrintableReceipt = openPrintableReceipt;
