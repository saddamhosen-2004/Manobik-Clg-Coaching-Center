# Product Requirements Document (PRD)
## Manobik College Coaching Center — Management System

---

## 1. Product Overview

**Product Name:** Manobik College Coaching Center Management System
**UI Language:** Fully Bangla (both Admin Panel and Public Website will be entirely in Bangla)
**Target:** HSC (College level) Arts (Manobik) department coaching center
**Model:** Fully dynamic admin panel — Admin can add, edit, and delete everything
**System Type:** Web-based software — covering everything from full coaching center operations to complete financial accounting

---

## 2. Tech Stack

| Technology | Purpose |
|---|---|
| **Next.js** | Frontend + Backend (API Routes) |
| **Tailwind CSS** | UI Styling |
| **Supabase** | Database + Authentication + Realtime |
| **ImageKit.io** | Student/Teacher/Director photo storage |
| **GitHub** | Code version control |
| **Vercel** | Hosting & Deployment |

---

## 3. Two Parts of the System

The system will be clearly divided into two parts:

### 3.1 Public Website (Visible to everyone, no login required)
- Student list (general info)
- Teacher list
- Routine
- Suggestions
- Result (search by own Roll/ID only)

### 3.2 Admin Panel (Only accessible to logged-in admin)
- All management modules (detailed below)
- Complete financial data — this will **never** be shown on the Public Website

---

## 4. User Roles

| Role | Access |
|---|---|
| **Super Admin** | Full system access — can add/edit/delete everything, can view all financial data |
| **Public Visitor** | Can view the Public Website without login — cannot edit anything |

---

## 5. Core Modules (Admin Panel)

---

### 5.1 Dashboard

First page shown after admin login.

**Will display:**
- Total number of students (by batch)
- Total number of teachers
- Total fee collected this month
- Total dues/outstanding this month
- Total expenses this month
- Net profit/loss (at a glance)
- Recent enrollments in the Preparation Program
- Recent activity log

---

### 5.2 Student Management

**Fields required when adding a student:**
- Student's name
- Student's photo (uploaded to ImageKit.io)
- Father's name
- Mother's name
- Guardian's mobile number
- Address
- College name
- College year (1st Year / 2nd Year)
- Batch selection (Morning 1 / Morning 2 / Afternoon 1 / Afternoon 2 — dynamic)
- Admission date
- Monthly package fee
- Roll/Student ID (auto-generated)

**Student list features:**
- Search and filter (by name, roll, batch)
- Edit and delete options
- View student profile (including fee history and exam results)

---

### 5.3 Teacher Management

**Fields required when adding a teacher:**
- Teacher's name
- Photo (uploaded to ImageKit.io)
- Mobile number
- Address
- Qualification/educational background
- Subject taught
- Batch assigned
- Monthly salary
- Joining date

**Teacher list features:**
- Edit and delete options
- View teacher profile (including salary history)

---

### 5.4 Batch Management

**Dynamic batch system:**
- Admin can create new batches (e.g., Morning 1, Morning 2, Afternoon 1, Afternoon 2 — and more in the future)
- Set timing for each batch (start and end time)
- Batch capacity
- Edit and delete batches

---

### 5.5 Subject Management

- Admin can add new subjects (Bangla, English, History, Islamic History, Civics, Economics, Sociology, Logic, etc.)
- Edit and delete subjects
- Assign a teacher to each subject

---

### 5.6 Director Management

**Fields required when adding a director:**
- Name
- Position (e.g., Chief Director, Assistant Director)
- Mobile number
- Address
- Photo (uploaded to ImageKit.io)

**Director page features:**
- List of all directors
- Edit and delete options
- **This page will be shown on the Public Website** — so that visitors can see who manages/runs the coaching center (builds trust and credibility)

---

### 5.7 Preparation Program (প্রস্তুতি প্রোগ্রাম) — Special Feature

This is a unique and important feature specific to this coaching center.

**How it works:**
- About 3 months before the final exam, a special "Preparation Program" is launched
- Besides regular students, new/outside students can also enroll in this program
- Each enrollment must be tracked with:
  - Student's name and information
  - Enrollment date
  - Amount paid at enrollment
  - Program name/session (e.g., "Preparation Program 2026")

**Admin can:**
- Create a new Preparation Program (a new program is typically created each year)
- Enroll students into the program and view the list
- View total enrollments and total amount collected
- This data is stored separately from the main student list

---

### 5.8 Exam & Result Management

**When creating an exam:**
- Exam name (e.g., Weekly Test, Monthly Test, Model Test, 1st Term Exam)
- Which batch it applies to
- Exam date
- Subjects and total marks

**Result entry:**
- Enter subject-wise marks per student
- Total marks auto-calculated
- Pass/Fail determined automatically

**Exam list:**
- Sorted by date
- Clicking on an exam shows results for that exam

---

### 5.9 Suggestion Management

- Teachers create suggestions before exams (which chapters/topics questions might come from)
- Subject-wise and exam-wise suggestions
- Can be uploaded as text or PDF
- Edit and delete options
- These suggestions will be shown on the Public Website

---

### 5.10 Routine Management

- Create class routines by batch
- Which subject, which teacher, on which day and time
- Edit and delete options
- This routine will be shown on the Public Website

---

### 5.11 Financial Management — Admin-Only, Private

This entire section will **never** be shown on the Public Website. Only the logged-in admin can view and manage this data.

**a) Student Fee / Income:**
- How much fee each student has paid
- How much is due per student
- Monthly and total collection summary
- Generate and print receipts

**b) Teacher Salary / Expense:**
- How much salary was paid to each teacher
- Date of payment
- Any outstanding/due salary

**c) Other Expenses:**
- What was spent and where (rent, electricity bill, furniture, printing, etc.)
- Entry by expense category
- Recorded with date

**d) Overall Financial Report:**
- Total income (student fees + preparation program income)
- Total expenses (teacher salaries + other expenses)
- Net profit/loss
- Monthly and annual reports (with print functionality)

---

## 6. Public Website (No login required)

| Page | Description |
|---|---|
| **Student List** | Name, photo, batch — sensitive info like phone number/address will NOT be shown |
| **Teacher List** | Name, photo, subject, qualification |
| **Director List** | Name, position, photo — shown publicly so visitors know who runs the coaching center |
| **Routine** | Batch-wise class routine |
| **Suggestion** | Subject-wise exam suggestions |
| **Result** | Search by Roll/Student ID to view only their own result — no other student's result or merit list will be shown here |

---

## 7. Database Schema (Supabase)

```
students
- id, name, photo_url, father_name, mother_name
- guardian_phone, address, college_name, college_year (1st_year/2nd_year)
- batch_id, admission_date, monthly_fee
- student_id (auto-generated), created_at

teachers
- id, name, photo_url, phone, address
- qualification, subject_id, batch_id
- monthly_salary, joining_date, created_at

batches
- id, name, start_time, end_time, capacity, created_at

subjects
- id, name, teacher_id, created_at

directors
- id, name, position, phone, address, photo_url, created_at

preparation_program
- id, program_name, session_year, created_at

preparation_enrollment
- id, program_id, student_name, guardian_phone
- amount_paid, enrollment_date, created_at

exams
- id, name, batch_id, exam_date, total_marks, created_at

results
- id, exam_id, student_id, subject_id, marks_obtained, created_at

suggestions
- id, subject_id, exam_name, content_text, file_url, created_at

routines
- id, batch_id, day_of_week, time, subject_id, teacher_id, created_at

fee_collection
- id, student_id, month, year, amount, paid_date
- receipt_number, created_at

teacher_salary
- id, teacher_id, month, year, amount, paid_date, created_at

expenses
- id, title, amount, category, expense_date, created_at

users
- id, email, role (admin), created_at
```

---

## 8. Page Structure (Next.js)

```
/app
  /(public)                      → Public Website (no login)
    /                             → Home page
    /students                     → Student list
    /teachers                     → Teacher list
    /directors                    → Director list
    /routine                      → Routine
    /suggestion                   → Suggestions
    /result                       → Result search (by Roll/ID)

  /(admin)                        → Admin Panel (login required)
    /login                        → Login page
    /dashboard                    → Dashboard
    /students                     → Student management
    /teachers                     → Teacher management
    /batches                      → Batch management
    /subjects                     → Subject management
    /directors                    → Director management
    /preparation-program          → Preparation Program management
    /exams                        → Exams & results
    /suggestions                  → Suggestion management
    /routines                     → Routine management
    /finance
      /fees                       → Fee collection
      /salary                     → Teacher salary
      /expenses                   → Other expenses
      /reports                    → Financial reports
    /settings                     → Settings

  /api
    /students, /teachers, /batches, /subjects, /directors
    /preparation-program, /exams, /results, /suggestions
    /routines, /fees, /salary, /expenses
```

---

## 9. Folder Structure

```
/
├── app/
│   ├── (public)/
│   ├── (admin)/
│   │   └── layout.tsx           → Sidebar + Header (Admin only)
│   └── api/
├── components/
│   ├── ui/                      → Base UI components
│   ├── forms/                   → Form components
│   ├── tables/                  → Table components
│   └── layout/                  → Sidebar, Header, Footer
├── lib/
│   ├── supabase.ts               → Supabase client
│   ├── imagekit.ts               → ImageKit config
│   └── utils.ts                  → Helper functions
├── types/
│   └── index.ts                  → TypeScript types
└── public/
```

---

## 10. UI/UX Guidelines

### Language — Fully in Bangla
Both the Admin Panel and the Public Website must be entirely in Bangla. This includes:
- Sidebar menu items
- All page titles/headings
- All form labels (e.g., "ছাত্রের নাম", "মোবাইল নম্বর")
- All buttons (e.g., "যোগ করুন", "সম্পাদনা করুন", "মুছুন", "সংরক্ষণ করুন")
- Table column headers
- All success/error/validation messages
- Input field placeholder text
- Confirmation dialogs (e.g., "আপনি কি নিশ্চিত মুছে ফেলতে চান?")
- Dropdown options

### Other Rules
- **Simple interface** — designed with general/non-technical users in mind
- **Mobile responsive**
- **Sidebar navigation** (for Admin Panel)
- **Font:** Use **Hind Siliguri** as the primary font throughout the entire application (both Admin Panel and Public Website). Import it from Google Fonts:
  ```
  https://fonts.google.com/specimen/Hind+Siliguri
  ```
  Apply it globally in the Next.js app (e.g., via `next/font/google` or in the global CSS) so that every page, form, button, and table uses this font consistently for all Bangla text.
- **Color theme:** to be decided based on the institution's own branding

### Access Control
| Data | Who can view |
|---|---|
| Public pages (student/teacher list, routine, suggestion) | Everyone (no login) |
| Result | Only via Roll/ID search — own result only |
| Financial data (fees, salary, expenses, profit/loss) | **Admin only** |
| Student/Teacher personal info (phone, address) | **Admin only** — Public pages show only name/photo/batch |

---

## 11. Development Phases

### Phase 1 (Build first):
- Admin login system
- Dashboard
- Student management
- Teacher management
- Batch & subject management
- Fee collection (Financial — Fee)

### Phase 2:
- Exam & result management
- Public Website (students, teachers, routine)
- Result search page (Public)

### Phase 3:
- Suggestion management
- Director page
- Preparation Program management
- Complete financial reports (salary, expenses, profit/loss)

---

## 12. Special Notes

- The system will be sold on a **one-time purchase** model (though built specifically for this client, it can later be sold to other coaching centers too)
- The entire system must be **fully dynamic** — no hardcoded data; admin can add/edit/delete everything (students, teachers, batches, subjects, exams, suggestions)
- **Financial data is completely private** — this data must never be exposed on the Public Website
- Photos will be uploaded to **ImageKit.io**; only the URL will be stored in Supabase
- All form validation messages will display in Bangla
- Receipts and reports will have **print** functionality

---

*Document Created: July 2026*
*Developer: [Your Name]*
*Product: Manobik College Coaching Center Management System*
