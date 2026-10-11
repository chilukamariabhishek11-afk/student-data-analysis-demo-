// js/attendance.js - Attendance Tracking, Bulk Updates, and Monthly Logs

let currentAttendanceDate = new Date().toISOString().split('T')[0];

function initAttendanceModule() {
  const dateInput = document.getElementById('att-date-picker');
  if (dateInput) {
    dateInput.value = currentAttendanceDate;
    dateInput.addEventListener('change', (e) => {
      currentAttendanceDate = e.target.value;
      renderAttendanceSheet();
    });
  }

  const gradeFilter = document.getElementById('att-grade-filter');
  const sectionFilter = document.getElementById('att-section-filter');
  const searchInput = document.getElementById('att-search-input');

  [gradeFilter, sectionFilter].forEach(el => {
    if (el) el.addEventListener('change', () => renderAttendanceSheet());
  });
  if (searchInput) {
    searchInput.addEventListener('input', () => renderAttendanceSheet());
  }

  // Bulk buttons
  const btnAllPresent = document.getElementById('btn-mark-all-present');
  const btnAllAbsent = document.getElementById('btn-mark-all-absent');
  const btnExportAtt = document.getElementById('btn-export-attendance');

  if (btnAllPresent) {
    btnAllPresent.addEventListener('click', () => {
      bulkUpdateCurrentView('present');
    });
  }

  if (btnAllAbsent) {
    btnAllAbsent.addEventListener('click', () => {
      bulkUpdateCurrentView('absent');
    });
  }

  if (btnExportAtt) {
    btnExportAtt.addEventListener('click', exportAttendanceCSV);
  }
}

function getFilteredAttendanceStudents() {
  const students = window.store.getStudents();
  const grade = document.getElementById('att-grade-filter')?.value || 'all';
  const section = document.getElementById('att-section-filter')?.value || 'all';
  const query = document.getElementById('att-search-input')?.value.toLowerCase().trim() || '';

  return students.filter(s => {
    const matchGrade = grade === 'all' || s.grade === grade;
    const matchSection = section === 'all' || s.section === section;
    const matchQuery = !query || s.name.toLowerCase().includes(query) || s.rollNo.includes(query);
    return matchGrade && matchSection && matchQuery;
  });
}

function renderAttendanceSheet() {
  const filteredStudents = getFilteredAttendanceStudents();
  const attendanceData = window.store.getAttendanceForDate(currentAttendanceDate);
  const tbody = document.getElementById('attendance-table-body');
  if (!tbody) return;

  let presentCount = 0;
  let absentCount = 0;
  let lateCount = 0;
  let excusedCount = 0;
  let unmarkedCount = 0;

  if (filteredStudents.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="6" class="py-8 text-center text-slate-400 text-sm">
          No students found matching current filters.
        </td>
      </tr>
    `;
    updateAttendanceCounters(0, 0, 0, 0, 0);
    return;
  }

  tbody.innerHTML = filteredStudents.map((s, index) => {
    const currentStatus = attendanceData[s.id] || null;

    if (currentStatus === 'present') presentCount++;
    else if (currentStatus === 'absent') absentCount++;
    else if (currentStatus === 'late') lateCount++;
    else if (currentStatus === 'excused') excusedCount++;
    else unmarkedCount++;

    const overallStats = window.store.getStudentAttendanceStats(s.id);
    const badgeColor = overallStats.percentage >= 85 ? 'bg-emerald-100 text-emerald-800' :
                       overallStats.percentage >= 75 ? 'bg-blue-100 text-blue-800' :
                       'bg-rose-100 text-rose-800';

    return `
      <tr class="border-b border-slate-100 hover:bg-slate-50/70 transition-colors">
        <td class="py-3 px-4 text-xs font-semibold text-slate-500">${index + 1}</td>
        <td class="py-3 px-4">
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
              ${s.name.charAt(0)}${s.name.split(' ')[1] ? s.name.split(' ')[1].charAt(0) : ''}
            </div>
            <div>
              <div class="font-bold text-slate-800 text-xs sm:text-sm">${s.name}</div>
              <div class="text-[11px] text-slate-400">Roll: ${s.rollNo}</div>
            </div>
          </div>
        </td>
        <td class="py-3 px-4 text-xs text-slate-600 font-medium">
          Grade ${s.grade}-${s.section}
        </td>
        <td class="py-3 px-4 text-xs">
          <button onclick="window.viewStudentAttendanceHistory('${s.id}')" class="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${badgeColor} hover:opacity-80 transition cursor-pointer">
            ${overallStats.percentage}% avg (${overallStats.present}/${overallStats.total})
          </button>
        </td>
        <td class="py-3 px-4">
          <div class="inline-flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button 
              onclick="window.setSingleAttendance('${s.id}', 'present')"
              class="att-btn px-2.5 py-1 text-xs font-bold rounded-md ${currentStatus === 'present' ? 'selected-p' : 'text-slate-600 hover:text-emerald-700 hover:bg-emerald-50'}"
              title="Present">
              P
            </button>
            <button 
              onclick="window.setSingleAttendance('${s.id}', 'absent')"
              class="att-btn px-2.5 py-1 text-xs font-bold rounded-md ${currentStatus === 'absent' ? 'selected-a' : 'text-slate-600 hover:text-rose-700 hover:bg-rose-50'}"
              title="Absent">
              A
            </button>
            <button 
              onclick="window.setSingleAttendance('${s.id}', 'late')"
              class="att-btn px-2.5 py-1 text-xs font-bold rounded-md ${currentStatus === 'late' ? 'selected-l' : 'text-slate-600 hover:text-amber-700 hover:bg-amber-50'}"
              title="Late">
              L
            </button>
            <button 
              onclick="window.setSingleAttendance('${s.id}', 'excused')"
              class="att-btn px-2.5 py-1 text-xs font-bold rounded-md ${currentStatus === 'excused' ? 'selected-e' : 'text-slate-600 hover:text-indigo-700 hover:bg-indigo-50'}"
              title="Excused">
              E
            </button>
          </div>
        </td>
        <td class="py-3 px-4 text-right">
          <button onclick="window.viewStudentAttendanceHistory('${s.id}')" class="text-xs font-medium text-indigo-600 hover:text-indigo-800 p-1.5 rounded-md hover:bg-indigo-50 inline-flex items-center space-x-1">
            <i data-lucide="history" class="w-3.5 h-3.5"></i>
            <span>Log</span>
          </button>
        </td>
      </tr>
    `;
  }).join('');

  updateAttendanceCounters(presentCount, absentCount, lateCount, excusedCount, unmarkedCount);
  if (window.lucide) window.lucide.createIcons();
}

function updateAttendanceCounters(present, absent, late, excused, unmarked) {
  const total = present + absent + late + excused + unmarked;
  const pCountEl = document.getElementById('att-summary-present');
  const aCountEl = document.getElementById('att-summary-absent');
  const lCountEl = document.getElementById('att-summary-late');
  const eCountEl = document.getElementById('att-summary-excused');
  const pctEl = document.getElementById('att-summary-percentage');

  if (pCountEl) pCountEl.textContent = present;
  if (aCountEl) aCountEl.textContent = absent;
  if (lCountEl) lCountEl.textContent = late;
  if (eCountEl) eCountEl.textContent = excused;

  const validMarked = present + absent + late + excused;
  const effectivePresent = present + (late * 0.8);
  const percentage = validMarked > 0 ? Math.round((effectivePresent / validMarked) * 100) : 0;
  if (pctEl) pctEl.textContent = `${percentage}%`;
}

function setSingleAttendance(studentId, status) {
  window.store.setAttendance(currentAttendanceDate, studentId, status);
  renderAttendanceSheet();
  if (window.renderDashboard) window.renderDashboard();
}

function bulkUpdateCurrentView(status) {
  const filtered = getFilteredAttendanceStudents();
  const ids = filtered.map(s => s.id);
  window.store.bulkSetAttendance(currentAttendanceDate, ids, status);
  renderAttendanceSheet();
  if (window.renderDashboard) window.renderDashboard();
  window.showToast(`Marked ${ids.length} students as ${status.toUpperCase()} for ${currentAttendanceDate}`, 'success');
}

function viewStudentAttendanceHistory(studentId) {
  const student = window.store.getStudent(studentId);
  if (!student) return;

  const dates = window.store.getAttendanceDates().reverse();
  const historyList = [];

  dates.forEach(d => {
    const status = window.store.getAttendanceForDate(d)[studentId];
    if (status) {
      historyList.push({ date: d, status });
    }
  });

  const stats = window.store.getStudentAttendanceStats(studentId);

  const modalBody = document.getElementById('attendance-history-modal-body');
  if (modalBody) {
    modalBody.innerHTML = `
      <div class="mb-4 flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h4 class="font-bold text-slate-800 text-base">${student.name}</h4>
          <p class="text-xs text-slate-500">Roll No: ${student.rollNo} &bull; Grade ${student.grade}-${student.section}</p>
        </div>
        <div class="text-right">
          <div class="text-xl font-extrabold ${stats.percentage >= 75 ? 'text-emerald-600' : 'text-rose-600'}">${stats.percentage}%</div>
          <p class="text-[11px] text-slate-400">Overall Rate</p>
        </div>
      </div>

      <div class="grid grid-cols-4 gap-2 mb-4 text-center">
        <div class="bg-emerald-50 p-2 rounded-lg border border-emerald-100">
          <p class="text-xs font-semibold text-emerald-800">Present</p>
          <p class="text-base font-bold text-emerald-600">${stats.present}</p>
        </div>
        <div class="bg-rose-50 p-2 rounded-lg border border-rose-100">
          <p class="text-xs font-semibold text-rose-800">Absent</p>
          <p class="text-base font-bold text-rose-600">${stats.absent}</p>
        </div>
        <div class="bg-amber-50 p-2 rounded-lg border border-amber-100">
          <p class="text-xs font-semibold text-amber-800">Late</p>
          <p class="text-base font-bold text-amber-600">${stats.late}</p>
        </div>
        <div class="bg-indigo-50 p-2 rounded-lg border border-indigo-100">
          <p class="text-xs font-semibold text-indigo-800">Excused</p>
          <p class="text-base font-bold text-indigo-600">${stats.excused}</p>
        </div>
      </div>

      <h5 class="text-xs font-bold uppercase text-slate-400 tracking-wider mb-2">Past Date Records</h5>
      <div class="max-h-60 overflow-y-auto space-y-1 pr-1">
        ${historyList.length === 0 ? '<p class="text-xs text-slate-400 py-3 text-center">No past records found.</p>' : 
          historyList.map(h => {
            const badgeClass = h.status === 'present' ? 'bg-emerald-100 text-emerald-700' :
                               h.status === 'absent' ? 'bg-rose-100 text-rose-700' :
                               h.status === 'late' ? 'bg-amber-100 text-amber-700' :
                               'bg-indigo-100 text-indigo-700';
            return `
              <div class="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-100 text-xs">
                <span class="font-medium text-slate-700">${h.date}</span>
                <span class="px-2 py-0.5 rounded font-bold uppercase text-[10px] ${badgeClass}">${h.status}</span>
              </div>
            `;
          }).join('')
        }
      </div>
    `;
    window.openModal('attendance-history-modal');
  }
}

function exportAttendanceCSV() {
  const filtered = getFilteredAttendanceStudents();
  const attData = window.store.getAttendanceForDate(currentAttendanceDate);
  
  let csvContent = "data:text/csv;charset=utf-8,";
  csvContent += `Attendance Report - Date: ${currentAttendanceDate}\n`;
  csvContent += "Roll No,Student Name,Grade,Section,Status\n";

  filtered.forEach(s => {
    const status = (attData[s.id] || 'Unmarked').toUpperCase();
    csvContent += `"${s.rollNo}","${s.name}","${s.grade}","${s.section}","${status}"\n`;
  });

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `Attendance_${currentAttendanceDate}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.showToast("Attendance CSV exported successfully", "success");
}

window.initAttendanceModule = initAttendanceModule;
window.renderAttendanceSheet = renderAttendanceSheet;
window.setSingleAttendance = setSingleAttendance;
window.viewStudentAttendanceHistory = viewStudentAttendanceHistory;
