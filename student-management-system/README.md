# EduFlow - Student & Fee Management System

A modern, responsive, full-featured web application designed for schools, academies, colleges, and coaching institutes to manage student records, track attendance, collect and monitor fees, record examination grades, and generate printable receipts.

---

## 🌟 Key Features

### 1. Executive Dashboard
- **Live KPIs**: Total Enrolled Students, Daily Attendance Percentage, Total Fees Collected, and Outstanding Balances.
- **Visual Analytics**: Interactive 7-Day Attendance Trend Line Chart & Fee Distribution Doughnut Chart (powered by Chart.js).
- **Attendance Watchlist**: Automatically surfaces students falling below the 75% attendance threshold with one-click profile review.
- **Recent Activity**: Live ledger of recent fee payments.

### 2. Student Directory & Profiles
- **Enrollment Form**: Full student profile support including Roll Number, Grade, Section, Gender, Date of Birth, Blood Group, Phone, Email, Guardian Contact, and Residential Address.
- **Rich Student Cards & Detailed Profile Modal**: View complete student information, academic performance, guardian records, and individual attendance statistics.
- **Search & Filters**: Instant multi-criteria filtering by name, roll number, grade, or section.
- **Actions**: Add, Edit, View, and Delete students.

### 3. Attendance Management
- **Daily Attendance Sheet**: Date picker to view or record attendance for any calendar date.
- **Rapid Status Toggle**: Interactive 4-state buttons: **Present (P)**, **Absent (A)**, **Late (L)**, and **Excused (E)**.
- **Bulk Actions**: One-click **"All Present"** and **"All Absent"** buttons for swift classroom roll calls.
- **Attendance History Log**: View student-specific historical calendar logs and attendance percentage.
- **CSV Export**: One-click export of daily or filtered attendance sheets.

### 4. Fee Management & Invoicing
- **Financial Ledger**: Track assigned tuition fees, scholarships/discounts, total paid, and outstanding balances.
- **Payment Collection**: Record payments across various methods (Online UPI, Cash, Credit/Debit Card, Bank Transfer, Cheque) with date stamps and transaction notes.
- **Printable Invoices & Receipts**: Beautiful, professional fee receipt generator ready for printing or exporting to PDF with school branding, student details, payment breakdown, and signature stamp.
- **Filter by Status**: Quickly isolate Fully Paid, Partial, and Unpaid/Overdue accounts.

### 5. Academics & Examination Grades
- **Report Cards**: Track marks across core subjects (Mathematics, Science, English, Social Studies, Computer Science).
- **Automated Grading**: Dynamic calculation of total score percentage and letter grades (A+, A, B, C, D).
- **Custom Subject Score Editor**: Edit or add marks anytime.

### 6. Settings, Backup & Restore
- **Institute Branding**: Customize School Name, Motto, Academic Year, Official Phone, Address, and Currency Symbol (e.g., `$`, `₹`, `£`, `€`).
- **Data Persistence**: Automatic client-side persistence in `localStorage`.
- **JSON Backup & Restore**: Download full system data snapshots or restore previous backups.
- **Factory Demo Data**: Reset button to quickly populate realistic sample data for testing or demonstrations.

---

## 🚀 How to Run the Website

### Method 1: Using Python Local Server (Recommended)
You can run the included zero-dependency Python server:

```powershell
cd C:\Users\ADMIN\.gemini\antigravity\scratch\student-management-system
python server.py
```

This will automatically start a local server at `http://localhost:8000` and open your default web browser.

### Method 2: Direct Browser Launch
Since EduFlow is built with modern web standards and uses CDNs for styles and charts, you can simply **double-click** `index.html` or open it with any modern browser (Chrome, Edge, Firefox, Brave):

```powershell
Start-Process "C:\Users\ADMIN\.gemini\antigravity\scratch\student-management-system\index.html"
```

---

## 📂 Project Structure

```
student-management-system/
├── index.html          # Main application Single-Page Application (SPA)
├── server.py           # Zero-dependency Python HTTP server with auto-launch
├── README.md           # Documentation and user guide
├── css/
│   └── styles.css      # Custom UI styles, animations, and print media rules
└── js/
    ├── store.js        # State management, localStorage persistence & demo data
    ├── dashboard.js    # Metric calculations & Chart.js visualizations
    ├── attendance.js   # Daily attendance sheet, bulk actions, and CSV export
    ├── fees.js         # Fee ledger, payment collection & printable invoice generator
    └── app.js          # App controller, student CRUD, academics, and backup system
```
