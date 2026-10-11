// js/store.js - Central Data Store with LocalStorage Persistence & Demo Data

const STORAGE_KEY = 'EDUFLOW_SMS_DATA_V1';

const INITIAL_DEMO_DATA = {
  students: [
    {
      id: 'std-101',
      rollNo: '1001',
      name: 'Aarav Sharma',
      grade: '10',
      section: 'A',
      gender: 'Male',
      dob: '2010-04-15',
      phone: '+1 555-0101',
      email: 'aarav.sharma@example.com',
      guardianName: 'Rajesh Sharma',
      guardianPhone: '+1 555-0102',
      address: '42 Orchid Blossom Ave, Silicon Heights',
      admissionDate: '2023-06-10',
      bloodGroup: 'B+',
      totalFee: 2400
    },
    {
      id: 'std-102',
      rollNo: '1002',
      name: 'Sophia Chen',
      grade: '10',
      section: 'A',
      gender: 'Female',
      dob: '2010-08-22',
      phone: '+1 555-0103',
      email: 'sophia.chen@example.com',
      guardianName: 'David Chen',
      guardianPhone: '+1 555-0104',
      address: '15 Maple Grove, West Park',
      admissionDate: '2023-06-10',
      bloodGroup: 'O+',
      totalFee: 2400
    },
    {
      id: 'std-103',
      rollNo: '1003',
      name: 'Liam Johnson',
      grade: '10',
      section: 'B',
      gender: 'Male',
      dob: '2009-11-05',
      phone: '+1 555-0105',
      email: 'liam.j@example.com',
      guardianName: 'Sarah Johnson',
      guardianPhone: '+1 555-0106',
      address: '88 Riverview Terrace, East Bay',
      admissionDate: '2023-06-12',
      bloodGroup: 'A+',
      totalFee: 2400
    },
    {
      id: 'std-104',
      rollNo: '1004',
      name: 'Ananya Patel',
      grade: '10',
      section: 'B',
      gender: 'Female',
      dob: '2010-01-30',
      phone: '+1 555-0107',
      email: 'ananya.p@example.com',
      guardianName: 'Vikram Patel',
      guardianPhone: '+1 555-0108',
      address: '104 Sunrise Boulevard, Sector 4',
      admissionDate: '2023-06-15',
      bloodGroup: 'AB+',
      totalFee: 2400
    },
    {
      id: 'std-105',
      rollNo: '1101',
      name: 'Ethan Martinez',
      grade: '11',
      section: 'A',
      gender: 'Male',
      dob: '2009-03-12',
      phone: '+1 555-0109',
      email: 'ethan.m@example.com',
      guardianName: 'Carlos Martinez',
      guardianPhone: '+1 555-0110',
      address: '77 Crestwood Way, North Hills',
      admissionDate: '2022-07-01',
      bloodGroup: 'O-',
      totalFee: 2800
    },
    {
      id: 'std-106',
      rollNo: '1102',
      name: 'Zara Al-Mansoor',
      grade: '11',
      section: 'A',
      gender: 'Female',
      dob: '2009-07-19',
      phone: '+1 555-0111',
      email: 'zara.m@example.com',
      guardianName: 'Tariq Al-Mansoor',
      guardianPhone: '+1 555-0112',
      address: '210 Palm Vista, Marina Bay',
      admissionDate: '2022-07-02',
      bloodGroup: 'A-',
      totalFee: 2800
    },
    {
      id: 'std-107',
      rollNo: '1103',
      name: 'Noah Williams',
      grade: '11',
      section: 'B',
      gender: 'Male',
      dob: '2008-12-14',
      phone: '+1 555-0113',
      email: 'noah.w@example.com',
      guardianName: 'Emma Williams',
      guardianPhone: '+1 555-0114',
      address: '33 Willowbrook St, Highland',
      admissionDate: '2022-07-05',
      bloodGroup: 'B-',
      totalFee: 2800
    },
    {
      id: 'std-108',
      rollNo: '1201',
      name: 'Priya Nair',
      grade: '12',
      section: 'A',
      gender: 'Female',
      dob: '2008-05-25',
      phone: '+1 555-0115',
      email: 'priya.nair@example.com',
      guardianName: 'Madhav Nair',
      guardianPhone: '+1 555-0116',
      address: '512 Pinecrest Circle, Lakeview',
      admissionDate: '2021-08-10',
      bloodGroup: 'O+',
      totalFee: 3200
    },
    {
      id: 'std-109',
      rollNo: '1202',
      name: 'Lucas Dupont',
      grade: '12',
      section: 'A',
      gender: 'Male',
      dob: '2007-09-08',
      phone: '+1 555-0117',
      email: 'lucas.d@example.com',
      guardianName: 'Claire Dupont',
      guardianPhone: '+1 555-0118',
      address: '90 Heritage Court, Downtown',
      admissionDate: '2021-08-10',
      bloodGroup: 'A+',
      totalFee: 3200
    },
    {
      id: 'std-110',
      rollNo: '1203',
      name: 'Fatima Zahra',
      grade: '12',
      section: 'B',
      gender: 'Female',
      dob: '2008-02-18',
      phone: '+1 555-0119',
      email: 'fatima.z@example.com',
      guardianName: 'Hassan Zahra',
      guardianPhone: '+1 555-0120',
      address: '14 Jasmine Lane, Green Valley',
      admissionDate: '2021-08-12',
      bloodGroup: 'B+',
      totalFee: 3200
    }
  ],
  attendance: {}, // populated dynamically below
  fees: {
    'std-101': {
      studentId: 'std-101',
      totalFee: 2400,
      discount: 0,
      transactions: [
        { id: 'tx-1001', receiptNo: 'REC-2026-001', date: '2026-08-05', amount: 1200, method: 'Online UPI', remarks: 'Term 1 Fee' },
        { id: 'tx-1002', receiptNo: 'REC-2026-002', date: '2026-09-10', amount: 1200, method: 'Card', remarks: 'Term 2 Fee' }
      ]
    },
    'std-102': {
      studentId: 'std-102',
      totalFee: 2400,
      discount: 200,
      transactions: [
        { id: 'tx-1003', receiptNo: 'REC-2026-003', date: '2026-08-06', amount: 1500, method: 'Bank Transfer', remarks: 'Merit Scholarship Applied - Partial Payment' }
      ]
    },
    'std-103': {
      studentId: 'std-103',
      totalFee: 2400,
      discount: 0,
      transactions: []
    },
    'std-104': {
      studentId: 'std-104',
      totalFee: 2400,
      discount: 0,
      transactions: [
        { id: 'tx-1004', receiptNo: 'REC-2026-004', date: '2026-08-10', amount: 2400, method: 'Cash', remarks: 'Full Annual Fee paid in advance' }
      ]
    },
    'std-105': {
      studentId: 'std-105',
      totalFee: 2800,
      discount: 0,
      transactions: [
        { id: 'tx-1005', receiptNo: 'REC-2026-005', date: '2026-08-15', amount: 1400, method: 'Online UPI', remarks: 'First Installment' }
      ]
    },
    'std-106': {
      studentId: 'std-106',
      totalFee: 2800,
      discount: 300,
      transactions: [
        { id: 'tx-1006', receiptNo: 'REC-2026-006', date: '2026-08-12', amount: 2500, method: 'Net Banking', remarks: 'Full Payment with Sibling Discount' }
      ]
    },
    'std-107': {
      studentId: 'std-107',
      totalFee: 2800,
      discount: 0,
      transactions: []
    },
    'std-108': {
      studentId: 'std-108',
      totalFee: 3200,
      discount: 0,
      transactions: [
        { id: 'tx-1007', receiptNo: 'REC-2026-007', date: '2026-08-01', amount: 3200, method: 'Online UPI', remarks: 'Annual Tuition & Lab Fees' }
      ]
    },
    'std-109': {
      studentId: 'std-109',
      totalFee: 3200,
      discount: 0,
      transactions: [
        { id: 'tx-1008', receiptNo: 'REC-2026-008', date: '2026-08-18', amount: 1600, method: 'Card', remarks: 'Term 1 Fee' }
      ]
    },
    'std-110': {
      studentId: 'std-110',
      totalFee: 3200,
      discount: 200,
      transactions: [
        { id: 'tx-1009', receiptNo: 'REC-2026-009', date: '2026-08-20', amount: 3000, method: 'Cash', remarks: 'Paid in full' }
      ]
    }
  },
  academics: {
    'std-101': [
      { subject: 'Mathematics', marks: 92, maxMarks: 100, term: 'Mid-Term' },
      { subject: 'Science', marks: 88, maxMarks: 100, term: 'Mid-Term' },
      { subject: 'English', marks: 85, maxMarks: 100, term: 'Mid-Term' },
      { subject: 'Social Studies', marks: 90, maxMarks: 100, term: 'Mid-Term' },
      { subject: 'Computer Science', marks: 96, maxMarks: 100, term: 'Mid-Term' }
    ],
    'std-102': [
      { subject: 'Mathematics', marks: 95, maxMarks: 100, term: 'Mid-Term' },
      { subject: 'Science', marks: 94, maxMarks: 100, term: 'Mid-Term' },
      { subject: 'English', marks: 90, maxMarks: 100, term: 'Mid-Term' },
      { subject: 'Social Studies', marks: 87, maxMarks: 100, term: 'Mid-Term' },
      { subject: 'Computer Science', marks: 98, maxMarks: 100, term: 'Mid-Term' }
    ],
    'std-103': [
      { subject: 'Mathematics', marks: 64, maxMarks: 100, term: 'Mid-Term' },
      { subject: 'Science', marks: 70, maxMarks: 100, term: 'Mid-Term' },
      { subject: 'English', marks: 72, maxMarks: 100, term: 'Mid-Term' },
      { subject: 'Social Studies', marks: 68, maxMarks: 100, term: 'Mid-Term' },
      { subject: 'Computer Science', marks: 75, maxMarks: 100, term: 'Mid-Term' }
    ]
  },
  settings: {
    institutionName: 'Brightwood Academy & College',
    tagline: 'Excellence in Education & Character',
    currency: '$',
    address: '742 Evergreen Terrace, Springfield, IL',
    phone: '+1 (555) 789-2026',
    email: 'admin@brightwood.edu',
    academicYear: '2026-2027'
  }
};

// Generate realistic attendance for the past 14 days
(function seedAttendance() {
  const dates = [];
  const today = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    // skip Sundays (0)
    if (d.getDay() !== 0) {
      dates.push(d.toISOString().split('T')[0]);
    }
  }

  const studentIds = INITIAL_DEMO_DATA.students.map(s => s.id);
  dates.forEach((dateStr, idx) => {
    INITIAL_DEMO_DATA.attendance[dateStr] = {};
    studentIds.forEach((sid, sidx) => {
      // Liam Johnson (std-103) has sporadic attendance to demo low attendance warning
      if (sid === 'std-103') {
        const rand = (idx + sidx) % 5;
        INITIAL_DEMO_DATA.attendance[dateStr][sid] = (rand === 0 || rand === 3) ? 'absent' : (rand === 2 ? 'late' : 'present');
      } else {
        const rand = (idx * 3 + sidx * 7) % 15;
        if (rand === 1) {
          INITIAL_DEMO_DATA.attendance[dateStr][sid] = 'absent';
        } else if (rand === 2) {
          INITIAL_DEMO_DATA.attendance[dateStr][sid] = 'late';
        } else if (rand === 3) {
          INITIAL_DEMO_DATA.attendance[dateStr][sid] = 'excused';
        } else {
          INITIAL_DEMO_DATA.attendance[dateStr][sid] = 'present';
        }
      }
    });
  });
})();

class AppStore {
  constructor() {
    this.data = this.loadData();
  }

  loadData() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to parse stored data from localStorage', e);
    }
    // Deep clone demo data
    const clone = JSON.parse(JSON.stringify(INITIAL_DEMO_DATA));
    this.saveData(clone);
    return clone;
  }

  saveData(data = this.data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      this.data = data;
    } catch (e) {
      console.error('Failed to save to localStorage', e);
    }
  }

  resetToDemo() {
    const clone = JSON.parse(JSON.stringify(INITIAL_DEMO_DATA));
    this.saveData(clone);
    return clone;
  }

  // --- Students CRUD ---
  getStudents() {
    return this.data.students || [];
  }

  getStudent(id) {
    return this.getStudents().find(s => s.id === id);
  }

  addStudent(studentData) {
    const newStudent = {
      ...studentData,
      id: 'std-' + Date.now(),
      rollNo: studentData.rollNo || String(1000 + this.data.students.length + 1),
      totalFee: Number(studentData.totalFee) || 2500,
      admissionDate: studentData.admissionDate || new Date().toISOString().split('T')[0]
    };

    this.data.students.push(newStudent);
    // Initialize fee record
    if (!this.data.fees[newStudent.id]) {
      this.data.fees[newStudent.id] = {
        studentId: newStudent.id,
        totalFee: newStudent.totalFee,
        discount: 0,
        transactions: []
      };
    }
    this.saveData();
    return newStudent;
  }

  updateStudent(id, updatedFields) {
    const idx = this.data.students.findIndex(s => s.id === id);
    if (idx !== -1) {
      this.data.students[idx] = { ...this.data.students[idx], ...updatedFields };
      if (updatedFields.totalFee && this.data.fees[id]) {
        this.data.fees[id].totalFee = Number(updatedFields.totalFee);
      }
      this.saveData();
      return this.data.students[idx];
    }
    return null;
  }

  deleteStudent(id) {
    this.data.students = this.data.students.filter(s => s.id !== id);
    delete this.data.fees[id];
    delete this.data.academics[id];
    // Remove from attendance records
    Object.keys(this.data.attendance).forEach(date => {
      delete this.data.attendance[date][id];
    });
    this.saveData();
  }

  // --- Attendance ---
  getAttendanceForDate(dateStr) {
    return this.data.attendance[dateStr] || {};
  }

  setAttendance(dateStr, studentId, status) {
    if (!this.data.attendance[dateStr]) {
      this.data.attendance[dateStr] = {};
    }
    this.data.attendance[dateStr][studentId] = status;
    this.saveData();
  }

  bulkSetAttendance(dateStr, studentIds, status) {
    if (!this.data.attendance[dateStr]) {
      this.data.attendance[dateStr] = {};
    }
    studentIds.forEach(id => {
      this.data.attendance[dateStr][id] = status;
    });
    this.saveData();
  }

  getStudentAttendanceStats(studentId) {
    let total = 0;
    let present = 0;
    let late = 0;
    let absent = 0;
    let excused = 0;

    Object.keys(this.data.attendance).forEach(date => {
      const record = this.data.attendance[date][studentId];
      if (record) {
        total++;
        if (record === 'present') present++;
        else if (record === 'late') {
          late++;
          // Count late as half or present for calculation
          present += 0.8;
        }
        else if (record === 'excused') excused++;
        else if (record === 'absent') absent++;
      }
    });

    const percentage = total > 0 ? Math.round((present / total) * 100) : 100;
    return {
      total,
      present: Math.round(present),
      late,
      absent,
      excused,
      percentage
    };
  }

  getAttendanceDates() {
    return Object.keys(this.data.attendance).sort();
  }

  // --- Fees ---
  getFeeAccount(studentId) {
    const student = this.getStudent(studentId);
    if (!student) return null;

    let feeRec = this.data.fees[studentId];
    if (!feeRec) {
      feeRec = {
        studentId,
        totalFee: student.totalFee || 2500,
        discount: 0,
        transactions: []
      };
      this.data.fees[studentId] = feeRec;
    }

    const totalFee = Number(feeRec.totalFee) || Number(student.totalFee) || 0;
    const discount = Number(feeRec.discount) || 0;
    const effectiveFee = Math.max(0, totalFee - discount);
    const paidAmount = (feeRec.transactions || []).reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
    const dueAmount = Math.max(0, effectiveFee - paidAmount);

    let status = 'Unpaid';
    if (paidAmount >= effectiveFee && effectiveFee > 0) {
      status = 'Paid';
    } else if (paidAmount > 0) {
      status = 'Partial';
    } else if (effectiveFee === 0) {
      status = 'Paid';
    }

    return {
      student,
      feeRecord: feeRec,
      totalFee,
      discount,
      effectiveFee,
      paidAmount,
      dueAmount,
      status,
      transactions: feeRec.transactions || []
    };
  }

  getAllFeeAccounts() {
    return this.getStudents().map(s => this.getFeeAccount(s.id));
  }

  addFeePayment(studentId, { amount, method, remarks, date }) {
    if (!this.data.fees[studentId]) {
      const student = this.getStudent(studentId);
      this.data.fees[studentId] = {
        studentId,
        totalFee: student ? student.totalFee : 2500,
        discount: 0,
        transactions: []
      };
    }

    const txId = 'tx-' + Date.now();
    const receiptNo = 'REC-' + new Date().getFullYear() + '-' + String(Math.floor(1000 + Math.random() * 9000));
    const transaction = {
      id: txId,
      receiptNo,
      date: date || new Date().toISOString().split('T')[0],
      amount: Number(amount),
      method: method || 'Cash',
      remarks: remarks || 'Tuition Fee Payment'
    };

    this.data.fees[studentId].transactions.push(transaction);
    this.saveData();
    return transaction;
  }

  updateFeeDiscount(studentId, discount) {
    if (!this.data.fees[studentId]) {
      const student = this.getStudent(studentId);
      this.data.fees[studentId] = {
        studentId,
        totalFee: student ? student.totalFee : 2500,
        discount: 0,
        transactions: []
      };
    }
    this.data.fees[studentId].discount = Number(discount) || 0;
    this.saveData();
  }

  // --- Academics ---
  getStudentGrades(studentId) {
    return this.data.academics[studentId] || [];
  }

  saveStudentGrades(studentId, gradesList) {
    this.data.academics[studentId] = gradesList;
    this.saveData();
  }

  // --- Settings ---
  getSettings() {
    return this.data.settings || INITIAL_DEMO_DATA.settings;
  }

  updateSettings(newSettings) {
    this.data.settings = { ...this.getSettings(), ...newSettings };
    this.saveData();
    return this.data.settings;
  }

  // --- Backup / Restore ---
  exportJSON() {
    return JSON.stringify(this.data, null, 2);
  }

  importJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.students && Array.isArray(parsed.students)) {
        this.saveData(parsed);
        return { success: true };
      }
      return { success: false, error: 'Invalid data format: missing students array.' };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
}

// Global instance
window.store = new AppStore();
