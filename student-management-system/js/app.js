// js/app.js - Main Application Controller, Student Management, Academics & Router

let activeTab = 'dashboard';
let editingStudentId = null;

document.addEventListener('DOMContentLoaded', () => {
  initRouter();
  initStudentModule();
  initAcademicsModule();
  initSettingsModule();
  if (window.initAttendanceModule) window.initAttendanceModule();
  if (window.initFeesModule) window.initFeesModule();

  // Initial render
  navigateToTab('dashboard');

  // Global escape key to close modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeAllModals();
    }
  });

  // Create Lucide Icons
  if (window.lucide) window.lucide.createIcons();
});

// --- Tab Routing ---
function initRouter() {
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = link.getAttribute('data-target');
      navigateToTab(target);
    });
  });
}

function navigateToTab(tabId) {
  activeTab = tabId;

  // Update nav links styling
  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.getAttribute('data-target') === tabId) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Switch visible section
  document.querySelectorAll('.tab-view').forEach(view => {
    if (view.id === `view-${tabId}`) {
      view.classList.remove('hidden');
    } else {
      view.classList.add('hidden');
    }
  });

  // Trigger view renderers
  if (tabId === 'dashboard' && window.renderDashboard) {
    window.renderDashboard();
  } else if (tabId === 'students') {
    renderStudentsList();
  } else if (tabId === 'attendance' && window.renderAttendanceSheet) {
    window.renderAttendanceSheet();
  } else if (tabId === 'fees' && window.renderFeesTable) {
    window.renderFeesTable();
  } else if (tabId === 'academics') {
    renderAcademicsTab();
  } else if (tabId === 'settings') {
    renderSettingsTab();
  }

  // Refresh icons
  if (window.lucide) window.lucide.createIcons();
}

// --- Toast System ---
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  const bg = type === 'success' ? 'bg-emerald-600 text-white' :
             type === 'error' ? 'bg-rose-600 text-white' :
             type === 'warning' ? 'bg-amber-500 text-white' : 'bg-slate-800 text-white';

  const iconName = type === 'success' ? 'check-circle' :
                   type === 'error' ? 'alert-octagon' :
                   type === 'warning' ? 'alert-triangle' : 'info';

  toast.className = `toast-item flex items-center space-x-2.5 px-4 py-3 rounded-xl shadow-xl text-xs font-semibold ${bg}`;
  toast.innerHTML = `
    <i data-lucide="${iconName}" class="w-4 h-4"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  if (window.lucide) window.lucide.createIcons();

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px) scale(0.95)';
    toast.style.transition = 'all 0.2s ease-out';
    setTimeout(() => toast.remove(), 250);
  }, 3200);
}

// --- Modal Helper Functions ---
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  if (window.lucide) window.lucide.createIcons();
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  modal.classList.add('hidden');
  document.body.style.overflow = '';
}

function closeAllModals() {
  document.querySelectorAll('.modal-overlay').forEach(modal => {
    modal.classList.add('hidden');
  });
  document.body.style.overflow = '';
}

// --- Student Directory Module ---
function initStudentModule() {
  const searchInput = document.getElementById('student-search-input');
  const gradeFilter = document.getElementById('student-grade-filter');
  const sectionFilter = document.getElementById('student-section-filter');

  if (searchInput) searchInput.addEventListener('input', () => renderStudentsList());
  if (gradeFilter) gradeFilter.addEventListener('change', () => renderStudentsList());
  if (sectionFilter) sectionFilter.addEventListener('change', () => renderStudentsList());

  // Form submit for Add / Edit Student
  const form = document.getElementById('student-form');
  if (form) {
    form.addEventListener('submit', handleStudentFormSubmit);
  }
}

function getFilteredStudents() {
  const students = window.store.getStudents();
  const search = document.getElementById('student-search-input')?.value.toLowerCase().trim() || '';
  const grade = document.getElementById('student-grade-filter')?.value || 'all';
  const section = document.getElementById('student-section-filter')?.value || 'all';

  return students.filter(s => {
    const matchGrade = grade === 'all' || s.grade === grade;
    const matchSection = section === 'all' || s.section === section;
    const matchSearch = !search || 
      s.name.toLowerCase().includes(search) || 
      s.rollNo.includes(search) ||
      (s.email && s.email.toLowerCase().includes(search)) ||
      (s.phone && s.phone.includes(search));
    return matchGrade && matchSection && matchSearch;
  });
}

function renderStudentsList() {
  const filtered = getFilteredStudents();
  const tbody = document.getElementById('students-table-body');
  if (!tbody) return;

  const countBadge = document.getElementById('student-count-badge');
  if (countBadge) countBadge.textContent = `${filtered.length} Students`;

  if (filtered.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="py-10 text-center text-slate-400 text-sm">
          No students found matching current filters.
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = filtered.map(s => {
    const attStats = window.store.getStudentAttendanceStats(s.id);
    const feeAcc = window.store.getFeeAccount(s.id);
    const settings = window.store.getSettings();
    const currency = settings.currency || '$';

    const attBadge = attStats.percentage >= 75 
      ? `<span class="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold text-xs">${attStats.percentage}%</span>`
      : `<span class="text-rose-700 bg-rose-50 px-2 py-0.5 rounded font-bold text-xs">${attStats.percentage}% (Low)</span>`;

    const feeBadge = feeAcc.status === 'Paid'
      ? `<span class="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold text-xs">Clear</span>`
      : `<span class="text-rose-700 bg-rose-50 px-2 py-0.5 rounded font-bold text-xs">${currency}${feeAcc.dueAmount} Due</span>`;

    return `
      <tr class="border-b border-slate-100 hover:bg-slate-50/70 transition-colors">
        <td class="py-3 px-4 font-mono font-bold text-xs text-slate-600">${s.rollNo}</td>
        <td class="py-3 px-4">
          <div class="flex items-center space-x-3">
            <div class="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
              ${s.name.charAt(0)}${s.name.split(' ')[1] ? s.name.split(' ')[1].charAt(0) : ''}
            </div>
            <div>
              <div class="font-bold text-slate-800 text-sm hover:text-indigo-600 cursor-pointer" onclick="window.viewStudentProfile('${s.id}')">
                ${s.name}
              </div>
              <div class="text-[11px] text-slate-400">${s.email || 'No email registered'}</div>
            </div>
          </div>
        </td>
        <td class="py-3 px-4 text-xs font-semibold text-slate-600">
          Grade ${s.grade}-${s.section}
        </td>
        <td class="py-3 px-4 text-xs text-slate-500">
          <div>${s.guardianName || 'N/A'}</div>
          <div class="text-[10px] text-slate-400">${s.guardianPhone || s.phone || ''}</div>
        </td>
        <td class="py-3 px-4 text-xs">
          ${attBadge}
        </td>
        <td class="py-3 px-4 text-xs">
          ${feeBadge}
        </td>
        <td class="py-3 px-4 text-right space-x-1">
          <button onclick="window.viewStudentProfile('${s.id}')" class="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition" title="View Profile">
            <i data-lucide="eye" class="w-4 h-4"></i>
          </button>
          <button onclick="window.editStudent('${s.id}')" class="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition" title="Edit Student">
            <i data-lucide="edit" class="w-4 h-4"></i>
          </button>
          <button onclick="window.deleteStudentPrompt('${s.id}')" class="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition" title="Delete Student">
            <i data-lucide="trash-2" class="w-4 h-4"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');

  if (window.lucide) window.lucide.createIcons();
}

function openAddStudentModal() {
  editingStudentId = null;
  const form = document.getElementById('student-form');
  if (form) form.reset();
  
  document.getElementById('student-modal-title').textContent = 'Add New Student';
  // suggest next roll number
  const students = window.store.getStudents();
  const nextRoll = students.length > 0 ? String(1000 + students.length + 1) : '1001';
  document.getElementById('input-roll').value = nextRoll;
  document.getElementById('input-fee').value = '2500';

  openModal('student-form-modal');
}

function editStudent(id) {
  const student = window.store.getStudent(id);
  if (!student) return;

  editingStudentId = id;
  document.getElementById('student-modal-title').textContent = 'Edit Student Details';

  document.getElementById('input-name').value = student.name || '';
  document.getElementById('input-roll').value = student.rollNo || '';
  document.getElementById('input-grade').value = student.grade || '10';
  document.getElementById('input-section').value = student.section || 'A';
  document.getElementById('input-gender').value = student.gender || 'Male';
  document.getElementById('input-dob').value = student.dob || '';
  document.getElementById('input-blood').value = student.bloodGroup || 'O+';
  document.getElementById('input-fee').value = student.totalFee || 2500;
  document.getElementById('input-phone').value = student.phone || '';
  document.getElementById('input-email').value = student.email || '';
  document.getElementById('input-guardian-name').value = student.guardianName || '';
  document.getElementById('input-guardian-phone').value = student.guardianPhone || '';
  document.getElementById('input-address').value = student.address || '';

  openModal('student-form-modal');
}

function handleStudentFormSubmit(e) {
  e.preventDefault();

  const studentData = {
    name: document.getElementById('input-name').value.trim(),
    rollNo: document.getElementById('input-roll').value.trim(),
    grade: document.getElementById('input-grade').value,
    section: document.getElementById('input-section').value,
    gender: document.getElementById('input-gender').value,
    dob: document.getElementById('input-dob').value,
    bloodGroup: document.getElementById('input-blood').value,
    totalFee: Number(document.getElementById('input-fee').value) || 2500,
    phone: document.getElementById('input-phone').value.trim(),
    email: document.getElementById('input-email').value.trim(),
    guardianName: document.getElementById('input-guardian-name').value.trim(),
    guardianPhone: document.getElementById('input-guardian-phone').value.trim(),
    address: document.getElementById('input-address').value.trim()
  };

  if (!studentData.name || !studentData.rollNo) {
    showToast('Student name and Roll Number are required', 'error');
    return;
  }

  if (editingStudentId) {
    window.store.updateStudent(editingStudentId, studentData);
    showToast(`Updated profile for ${studentData.name}`, 'success');
  } else {
    window.store.addStudent(studentData);
    showToast(`Enrolled new student: ${studentData.name}`, 'success');
  }

  closeModal('student-form-modal');
  renderStudentsList();
  if (window.renderDashboard) window.renderDashboard();
}

function deleteStudentPrompt(id) {
  const student = window.store.getStudent(id);
  if (!student) return;

  if (confirm(`Are you sure you want to delete student "${student.name}" (Roll: ${student.rollNo})? All attendance and fee records for this student will be removed.`)) {
    window.store.deleteStudent(id);
    showToast(`Student ${student.name} deleted`, 'info');
    renderStudentsList();
    if (window.renderDashboard) window.renderDashboard();
  }
}

function viewStudentProfile(id) {
  const s = window.store.getStudent(id);
  if (!s) return;

  const attStats = window.store.getStudentAttendanceStats(id);
  const feeAcc = window.store.getFeeAccount(id);
  const grades = window.store.getStudentGrades(id);
  const settings = window.store.getSettings();
  const currency = settings.currency || '$';

  const modalBody = document.getElementById('student-profile-modal-body');
  if (!modalBody) return;

  modalBody.innerHTML = `
    <!-- Header banner -->
    <div class="bg-gradient-to-r from-indigo-600 to-indigo-800 p-6 rounded-2xl text-white flex items-center justify-between mb-6 shadow-md">
      <div class="flex items-center space-x-4">
        <div class="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center text-xl font-black">
          ${s.name.charAt(0)}${s.name.split(' ')[1] ? s.name.split(' ')[1].charAt(0) : ''}
        </div>
        <div>
          <h3 class="text-xl font-bold">${s.name}</h3>
          <p class="text-indigo-200 text-xs mt-0.5">Roll No: <strong>${s.rollNo}</strong> &bull; Grade ${s.grade}-${s.section} &bull; ${s.gender}</p>
          <p class="text-indigo-200 text-xs">Admitted on: ${s.admissionDate || 'N/A'}</p>
        </div>
      </div>
      <div class="flex space-x-2">
        <button onclick="window.closeModal('student-profile-modal'); window.editStudent('${s.id}')" class="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-semibold transition">
          Edit
        </button>
      </div>
    </div>

    <!-- Quick Stats Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
      <div class="bg-slate-50 border border-slate-100 p-4 rounded-xl">
        <span class="text-slate-400 text-xs font-medium uppercase">Attendance Record</span>
        <div class="flex items-baseline justify-between mt-1">
          <span class="text-xl font-bold ${attStats.percentage >= 75 ? 'text-emerald-600' : 'text-rose-600'}">${attStats.percentage}%</span>
          <span class="text-xs text-slate-500">${attStats.present}/${attStats.total} Days</span>
        </div>
        <p class="text-[11px] text-slate-400 mt-1">${attStats.absent} absences, ${attStats.late} late</p>
      </div>

      <div class="bg-slate-50 border border-slate-100 p-4 rounded-xl">
        <span class="text-slate-400 text-xs font-medium uppercase">Fee Account</span>
        <div class="flex items-baseline justify-between mt-1">
          <span class="text-xl font-bold ${feeAcc.dueAmount > 0 ? 'text-rose-600' : 'text-emerald-600'}">
            ${currency}${feeAcc.dueAmount}
          </span>
          <span class="text-xs font-bold px-2 py-0.5 rounded-full ${feeAcc.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}">
            ${feeAcc.status}
          </span>
        </div>
        <p class="text-[11px] text-slate-400 mt-1">Paid: ${currency}${feeAcc.paidAmount} of ${currency}${feeAcc.effectiveFee}</p>
      </div>

      <div class="bg-slate-50 border border-slate-100 p-4 rounded-xl">
        <span class="text-slate-400 text-xs font-medium uppercase">Academics</span>
        <div class="flex items-baseline justify-between mt-1">
          <span class="text-xl font-bold text-indigo-600">${grades.length > 0 ? `${calculateGPA(grades)}%` : 'N/A'}</span>
          <span class="text-xs text-slate-500">${grades.length} Exams Recorded</span>
        </div>
        <p class="text-[11px] text-slate-400 mt-1">Mid-Term Assessment</p>
      </div>
    </div>

    <!-- Personal & Guardian Details -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
      <div class="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
        <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Contact & Personal Details</h4>
        <div class="space-y-2 text-xs">
          <div class="flex justify-between"><span class="text-slate-400">Date of Birth:</span> <span class="font-medium text-slate-700">${s.dob || 'Not provided'}</span></div>
          <div class="flex justify-between"><span class="text-slate-400">Blood Group:</span> <span class="font-medium text-slate-700">${s.bloodGroup || 'N/A'}</span></div>
          <div class="flex justify-between"><span class="text-slate-400">Phone:</span> <span class="font-medium text-slate-700">${s.phone || 'N/A'}</span></div>
          <div class="flex justify-between"><span class="text-slate-400">Email:</span> <span class="font-medium text-slate-700">${s.email || 'N/A'}</span></div>
          <div class="flex justify-between"><span class="text-slate-400">Address:</span> <span class="font-medium text-slate-700 text-right max-w-[200px]">${s.address || 'N/A'}</span></div>
        </div>
      </div>

      <div class="bg-white border border-slate-200 p-4 rounded-xl shadow-xs">
        <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Guardian Information</h4>
        <div class="space-y-2 text-xs">
          <div class="flex justify-between"><span class="text-slate-400">Guardian Name:</span> <span class="font-medium text-slate-700">${s.guardianName || 'N/A'}</span></div>
          <div class="flex justify-between"><span class="text-slate-400">Guardian Contact:</span> <span class="font-medium text-slate-700">${s.guardianPhone || 'N/A'}</span></div>
          <div class="flex justify-between"><span class="text-slate-400">Assigned Fee Plan:</span> <span class="font-medium text-slate-700">${currency}${s.totalFee} / year</span></div>
        </div>
        <div class="mt-4 pt-3 border-t border-slate-100 flex space-x-2">
          <button onclick="window.closeModal('student-profile-modal'); window.openCollectFeeModal('${s.id}')" class="flex-1 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded-lg hover:bg-indigo-100 transition">
            Collect Fee
          </button>
          <button onclick="window.closeModal('student-profile-modal'); window.viewStudentAttendanceHistory('${s.id}')" class="flex-1 py-1.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-lg hover:bg-slate-200 transition">
            Attendance Log
          </button>
        </div>
      </div>
    </div>
  `;

  openModal('student-profile-modal');
}

function calculateGPA(grades) {
  if (!grades || grades.length === 0) return 0;
  const totalMarks = grades.reduce((sum, g) => sum + Number(g.marks), 0);
  const totalMax = grades.reduce((sum, g) => sum + Number(g.maxMarks), 0);
  return totalMax > 0 ? Math.round((totalMarks / totalMax) * 100) : 0;
}

// --- Academics Module ---
function initAcademicsModule() {
  const gradeFilter = document.getElementById('academic-grade-filter');
  if (gradeFilter) {
    gradeFilter.addEventListener('change', () => renderAcademicsTab());
  }

  const marksForm = document.getElementById('marks-form');
  if (marksForm) {
    marksForm.addEventListener('submit', handleMarksFormSubmit);
  }
}

function renderAcademicsTab() {
  const students = window.store.getStudents();
  const gradeFilter = document.getElementById('academic-grade-filter')?.value || 'all';
  const filtered = students.filter(s => gradeFilter === 'all' || s.grade === gradeFilter);

  const container = document.getElementById('academics-cards-container');
  if (!container) return;

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-12 text-center text-slate-400 text-sm">
        No students found for this grade.
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(s => {
    const grades = window.store.getStudentGrades(s.id);
    const avgScore = calculateGPA(grades);
    const gradeLetter = avgScore >= 90 ? 'A+' : avgScore >= 80 ? 'A' : avgScore >= 70 ? 'B' : avgScore >= 60 ? 'C' : avgScore > 0 ? 'D' : 'N/A';

    return `
      <div class="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-xs">
              ${s.name.charAt(0)}${s.name.split(' ')[1] ? s.name.split(' ')[1].charAt(0) : ''}
            </div>
            <div>
              <h4 class="font-bold text-slate-800 text-sm">${s.name}</h4>
              <p class="text-xs text-slate-400">Roll: ${s.rollNo} &bull; Gr ${s.grade}-${s.section}</p>
            </div>
          </div>
          <div class="text-right">
            <span class="inline-block px-2.5 py-0.5 rounded-md font-extrabold text-sm ${avgScore >= 80 ? 'bg-emerald-100 text-emerald-800' : avgScore >= 60 ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'}">
              ${gradeLetter}
            </span>
            <p class="text-[10px] text-slate-400 mt-0.5">${avgScore > 0 ? avgScore + '%' : 'No marks'}</p>
          </div>
        </div>

        <!-- Subjects table -->
        <div class="space-y-1.5 mb-4 text-xs">
          ${grades.length === 0 ? `
            <p class="text-slate-400 text-[11px] py-2 text-center">No examination marks added yet.</p>
          ` : grades.map(g => `
            <div class="flex items-center justify-between py-1 border-b border-slate-50">
              <span class="text-slate-600 font-medium">${g.subject}</span>
              <span class="font-bold text-slate-800">${g.marks} <span class="text-slate-400 font-normal">/ ${g.maxMarks}</span></span>
            </div>
          `).join('')}
        </div>

        <button onclick="window.openAddMarksModal('${s.id}')" class="w-full py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5">
          <i data-lucide="edit-3" class="w-3.5 h-3.5"></i>
          <span>Edit Report Card</span>
        </button>
      </div>
    `;
  }).join('');

  if (window.lucide) window.lucide.createIcons();
}

let activeMarksStudentId = null;

function openAddMarksModal(studentId) {
  const student = window.store.getStudent(studentId);
  if (!student) return;

  activeMarksStudentId = studentId;
  const grades = window.store.getStudentGrades(studentId);

  document.getElementById('marks-modal-student-name').textContent = student.name;
  document.getElementById('marks-modal-student-info').textContent = `Roll: ${student.rollNo} &bull; Grade ${student.grade}-${student.section}`;

  const container = document.getElementById('marks-rows-container');
  if (!container) return;

  const defaultSubjects = ['Mathematics', 'Science', 'English', 'Social Studies', 'Computer Science'];
  const subjectsToUse = grades.length > 0 ? grades.map(g => g.subject) : defaultSubjects;

  container.innerHTML = subjectsToUse.map((subj, index) => {
    const existing = grades.find(g => g.subject === subj) || { marks: '', maxMarks: 100 };
    return `
      <div class="flex items-center space-x-3 mb-2 marks-row">
        <input type="text" value="${subj}" class="subject-name flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg font-medium" placeholder="Subject" />
        <input type="number" value="${existing.marks}" class="subject-score w-24 px-3 py-1.5 text-xs border border-slate-200 rounded-lg text-center" placeholder="Marks" min="0" max="100" />
        <span class="text-slate-400 text-xs">/</span>
        <input type="number" value="${existing.maxMarks || 100}" class="subject-max w-20 px-2 py-1.5 text-xs border border-slate-200 rounded-lg text-center text-slate-500" placeholder="Max" min="1" />
      </div>
    `;
  }).join('');

  openModal('add-marks-modal');
}

function handleMarksFormSubmit(e) {
  e.preventDefault();
  if (!activeMarksStudentId) return;

  const rows = document.querySelectorAll('.marks-row');
  const gradesList = [];

  rows.forEach(row => {
    const subj = row.querySelector('.subject-name').value.trim();
    const scoreVal = row.querySelector('.subject-score').value.trim();
    const maxVal = row.querySelector('.subject-max').value.trim() || '100';

    if (subj && scoreVal !== '') {
      gradesList.push({
        subject: subj,
        marks: Number(scoreVal),
        maxMarks: Number(maxVal),
        term: 'Mid-Term'
      });
    }
  });

  window.store.saveStudentGrades(activeMarksStudentId, gradesList);
  closeModal('add-marks-modal');
  renderAcademicsTab();
  showToast('Student report card updated successfully', 'success');
}

// --- Settings & Data Backup Module ---
function initSettingsModule() {
  const form = document.getElementById('settings-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const updated = {
        institutionName: document.getElementById('setting-name').value.trim(),
        tagline: document.getElementById('setting-tagline').value.trim(),
        currency: document.getElementById('setting-currency').value.trim() || '$',
        academicYear: document.getElementById('setting-year').value.trim(),
        phone: document.getElementById('setting-phone').value.trim(),
        address: document.getElementById('setting-address').value.trim()
      };
      window.store.updateSettings(updated);
      showToast('Institute settings saved', 'success');
      updateBrandingUI();
    });
  }

  const exportBtn = document.getElementById('btn-export-json');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const json = window.store.exportJSON();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `EduFlow_Backup_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Backup JSON exported successfully', 'success');
    });
  }

  const importInput = document.getElementById('import-json-file');
  if (importInput) {
    importInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (event) => {
        const res = window.store.importJSON(event.target.result);
        if (res.success) {
          showToast('Data imported successfully!', 'success');
          navigateToTab('dashboard');
        } else {
          showToast(`Import failed: ${res.error}`, 'error');
        }
      };
      reader.readAsText(file);
    });
  }

  const resetBtn = document.getElementById('btn-reset-demo');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('Reset all student data, attendance, and fees back to original demo dataset?')) {
        window.store.resetToDemo();
        showToast('Reset to demo data completed', 'info');
        navigateToTab('dashboard');
      }
    });
  }
}

function renderSettingsTab() {
  const s = window.store.getSettings();
  document.getElementById('setting-name').value = s.institutionName || '';
  document.getElementById('setting-tagline').value = s.tagline || '';
  document.getElementById('setting-currency').value = s.currency || '$';
  document.getElementById('setting-year').value = s.academicYear || '2026-2027';
  document.getElementById('setting-phone').value = s.phone || '';
  document.getElementById('setting-address').value = s.address || '';
}

function updateBrandingUI() {
  const s = window.store.getSettings();
  document.querySelectorAll('.brand-inst-name').forEach(el => {
    el.textContent = s.institutionName;
  });
}

// Global exports
window.navigateToTab = navigateToTab;
window.showToast = showToast;
window.openModal = openModal;
window.closeModal = closeModal;
window.closeAllModals = closeAllModals;
window.openAddStudentModal = openAddStudentModal;
window.editStudent = editStudent;
window.deleteStudentPrompt = deleteStudentPrompt;
window.viewStudentProfile = viewStudentProfile;
window.openAddMarksModal = openAddMarksModal;
