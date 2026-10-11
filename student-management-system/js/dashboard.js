// js/dashboard.js - Dashboard Metrics, Analytics, and Chart.js Visualizations

let attendanceChartInstance = null;
let feeDistributionChartInstance = null;

function renderDashboard() {
  const students = window.store.getStudents();
  const settings = window.store.getSettings();
  const currency = settings.currency || '$';

  // 1. Total Students
  const totalStudentsEl = document.getElementById('dash-total-students');
  if (totalStudentsEl) totalStudentsEl.textContent = students.length;

  // 2. Attendance Metric for Today
  const todayStr = new Date().toISOString().split('T')[0];
  let todayAtt = window.store.getAttendanceForDate(todayStr);
  let checkedToday = Object.keys(todayAtt).length;

  // If today has no records, fallback to the latest available date for demo preview
  let activeAttDate = todayStr;
  if (checkedToday === 0) {
    const dates = window.store.getAttendanceDates();
    if (dates.length > 0) {
      activeAttDate = dates[dates.length - 1];
      todayAtt = window.store.getAttendanceForDate(activeAttDate);
      checkedToday = Object.keys(todayAtt).length;
    }
  }

  let presentCount = 0;
  Object.values(todayAtt).forEach(status => {
    if (status === 'present' || status === 'late') presentCount++;
  });
  const attRate = checkedToday > 0 ? Math.round((presentCount / checkedToday) * 100) : 0;

  const dashAttRateEl = document.getElementById('dash-att-rate');
  const dashAttSubEl = document.getElementById('dash-att-subtitle');
  if (dashAttRateEl) dashAttRateEl.textContent = `${attRate}%`;
  if (dashAttSubEl) {
    dashAttSubEl.textContent = checkedToday > 0 
      ? `${presentCount} of ${checkedToday} students marked present (${activeAttDate})`
      : 'No attendance marked yet today';
  }

  // 3. Fee Metrics
  const feeAccounts = window.store.getAllFeeAccounts();
  let totalReceivable = 0;
  let totalCollected = 0;
  let totalPending = 0;
  let paidCount = 0;
  let partialCount = 0;
  let unpaidCount = 0;

  feeAccounts.forEach(acc => {
    totalReceivable += acc.effectiveFee;
    totalCollected += acc.paidAmount;
    totalPending += acc.dueAmount;

    if (acc.status === 'Paid') paidCount++;
    else if (acc.status === 'Partial') partialCount++;
    else unpaidCount++;
  });

  const dashCollectedEl = document.getElementById('dash-fees-collected');
  const dashPendingEl = document.getElementById('dash-fees-pending');
  const dashFeeRateEl = document.getElementById('dash-fee-rate');

  if (dashCollectedEl) dashCollectedEl.textContent = `${currency}${totalCollected.toLocaleString()}`;
  if (dashPendingEl) dashPendingEl.textContent = `${currency}${totalPending.toLocaleString()}`;
  if (dashFeeRateEl) {
    const collectionPct = totalReceivable > 0 ? Math.round((totalCollected / totalReceivable) * 100) : 0;
    dashFeeRateEl.textContent = `${collectionPct}% collected of ${currency}${totalReceivable.toLocaleString()}`;
  }

  // 4. Low Attendance Alerts (< 75%)
  renderLowAttendanceAlerts(students);

  // 5. Recent Transactions
  renderRecentTransactions(feeAccounts, currency);

  // 6. Charts
  renderAttendanceTrendChart();
  renderFeeBreakdownChart(paidCount, partialCount, unpaidCount);
}

function renderLowAttendanceAlerts(students) {
  const container = document.getElementById('dash-low-attendance-list');
  if (!container) return;

  const lowAttStudents = [];
  students.forEach(s => {
    const stats = window.store.getStudentAttendanceStats(s.id);
    if (stats.total > 0 && stats.percentage < 75) {
      lowAttStudents.push({ ...s, stats });
    }
  });

  if (lowAttStudents.length === 0) {
    container.innerHTML = `
      <div class="py-6 text-center text-slate-400">
        <i data-lucide="check-circle" class="w-8 h-8 mx-auto mb-2 text-emerald-500"></i>
        <p class="text-sm font-medium">All students maintain satisfactory attendance (&ge; 75%)</p>
      </div>
    `;
    if (window.lucide) window.lucide.createIcons();
    return;
  }

  container.innerHTML = lowAttStudents.map(item => `
    <div class="flex items-center justify-between p-3 rounded-xl bg-rose-50/60 border border-rose-100 hover:bg-rose-50 transition-colors">
      <div class="flex items-center space-x-3">
        <div class="w-9 h-9 rounded-full bg-rose-100 text-rose-700 font-bold flex items-center justify-center text-xs">
          ${item.name.charAt(0)}${item.name.split(' ')[1] ? item.name.split(' ')[1].charAt(0) : ''}
        </div>
        <div>
          <h4 class="text-xs font-bold text-slate-800">${item.name}</h4>
          <p class="text-[11px] text-slate-500">Grade ${item.grade}-${item.section} &bull; Roll: ${item.rollNo}</p>
        </div>
      </div>
      <div class="text-right">
        <span class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold bg-rose-200/80 text-rose-800">
          ${item.stats.percentage}%
        </span>
        <p class="text-[10px] text-rose-600 font-medium mt-0.5">${item.stats.absent} Absences</p>
      </div>
    </div>
  `).join('');

  if (window.lucide) window.lucide.createIcons();
}

function renderRecentTransactions(feeAccounts, currency) {
  const container = document.getElementById('dash-recent-transactions');
  if (!container) return;

  const allTx = [];
  feeAccounts.forEach(acc => {
    (acc.transactions || []).forEach(tx => {
      allTx.push({
        ...tx,
        studentName: acc.student.name,
        rollNo: acc.student.rollNo,
        grade: acc.student.grade,
        section: acc.student.section
      });
    });
  });

  // Sort newest first
  allTx.sort((a, b) => new Date(b.date) - new Date(a.date));
  const recent = allTx.slice(0, 5);

  if (recent.length === 0) {
    container.innerHTML = `
      <div class="py-6 text-center text-slate-400 text-xs">
        No payment transactions recorded yet.
      </div>
    `;
    return;
  }

  container.innerHTML = recent.map(tx => `
    <div class="flex items-center justify-between py-2.5 border-b border-slate-100 last:border-0">
      <div class="flex items-center space-x-3">
        <div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
          <i data-lucide="receipt" class="w-4 h-4"></i>
        </div>
        <div>
          <p class="text-xs font-bold text-slate-800">${tx.studentName} <span class="font-normal text-slate-400">(${tx.rollNo})</span></p>
          <p class="text-[11px] text-slate-400">${tx.date} &bull; ${tx.method}</p>
        </div>
      </div>
      <div class="text-right">
        <span class="text-xs font-bold text-emerald-600">+${currency}${Number(tx.amount).toLocaleString()}</span>
        <p class="text-[10px] text-slate-400">${tx.receiptNo}</p>
      </div>
    </div>
  `).join('');

  if (window.lucide) window.lucide.createIcons();
}

function renderAttendanceTrendChart() {
  const canvas = document.getElementById('attendanceTrendChart');
  if (!canvas) return;

  const dates = window.store.getAttendanceDates().slice(-7); // Last 7 recorded dates
  if (dates.length === 0) return;

  const students = window.store.getStudents();
  const total = students.length || 1;

  const dataPoints = dates.map(d => {
    const att = window.store.getAttendanceForDate(d);
    let p = 0;
    Object.values(att).forEach(st => {
      if (st === 'present' || st === 'late') p++;
    });
    return Math.round((p / total) * 100);
  });

  const formattedLabels = dates.map(d => {
    const parts = d.split('-');
    return `${parts[1]}/${parts[2]}`;
  });

  if (attendanceChartInstance) {
    attendanceChartInstance.destroy();
  }

  const ctx = canvas.getContext('2d');
  attendanceChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: formattedLabels,
      datasets: [{
        label: 'Attendance Rate (%)',
        data: dataPoints,
        borderColor: '#4f46e5',
        backgroundColor: 'rgba(79, 70, 229, 0.08)',
        fill: true,
        tension: 0.35,
        borderWidth: 2.5,
        pointBackgroundColor: '#4f46e5',
        pointBorderColor: '#ffffff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#0f172a',
          titleFont: { family: 'Plus Jakarta Sans', size: 12 },
          bodyFont: { family: 'Plus Jakarta Sans', size: 12 },
          padding: 10,
          cornerRadius: 8,
          callbacks: {
            label: context => `Attendance: ${context.raw}%`
          }
        }
      },
      scales: {
        y: {
          min: 0,
          max: 100,
          ticks: {
            stepSize: 20,
            callback: value => value + '%',
            font: { family: 'Plus Jakarta Sans', size: 11 }
          },
          grid: { color: '#f1f5f9' }
        },
        x: {
          ticks: { font: { family: 'Plus Jakarta Sans', size: 11 } },
          grid: { display: false }
        }
      }
    }
  });
}

function renderFeeBreakdownChart(paid, partial, unpaid) {
  const canvas = document.getElementById('feeDistributionChart');
  if (!canvas) return;

  if (feeDistributionChartInstance) {
    feeDistributionChartInstance.destroy();
  }

  const ctx = canvas.getContext('2d');
  feeDistributionChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Fully Paid', 'Partial Payment', 'Pending / Unpaid'],
      datasets: [{
        data: [paid, partial, unpaid],
        backgroundColor: ['#10b981', '#f59e0b', '#ef4444'],
        borderWidth: 2,
        borderColor: '#ffffff',
        hoverOffset: 4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '70%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            boxWidth: 12,
            padding: 14,
            font: { family: 'Plus Jakarta Sans', size: 11 }
          }
        },
        tooltip: {
          backgroundColor: '#0f172a',
          padding: 10,
          cornerRadius: 8
        }
      }
    }
  });
}

window.renderDashboard = renderDashboard;
