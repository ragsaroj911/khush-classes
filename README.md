# 🎓 Khush Classes — Student Fee Management System (SFMS)

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Resend](https://img.shields.io/badge/Resend-Email_API-000000?style=for-the-badge&logo=resend)](https://resend.com/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000000?style=for-the-badge&logo=vercel)](https://vercel.com/)

A modern, minimalist, responsive **Student Fee Management System** built with **Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui design patterns, Supabase (PostgreSQL), and Resend**.

Designed specifically for **Khush Classes** to streamline student admissions, customizable fee structures (itemized heads builder), installment tracking, overdue fee reminders, downloadable vector PDF receipts, and monthly collection reports.

---

## 🌟 Key Highlights

- 🇮🇳 **Standardized Indian Rupee (`₹` / INR)**: Indian currency format (`en-IN`, e.g. `₹ 1,20,000.00`) across all dashboards, rosters, receipts, and emails.
- 🛠️ **Customizable Fee Structure (Non-Fixed Fees)**: Custom itemized fee heads builder per student (Tuition, Admission, Study Modules, Test Series, Bus/Transport, Hostel, or Custom Heads).
- 🚀 **Eye-Catching Guided Admission Wizard**: 4-step interactive enrollment process at `/students/new` with instant roll number generation (`KC-2024-XXX`).
- 🔙 **Persistent Top-Right Back Button**: One-click navigation returning step-by-step across all subpages until reaching the Home Dashboard.
- ⚡ **Dual-Engine Data Layer**: Connects to live **Supabase PostgreSQL** with automated fallback to local storage for zero-downtime testing.
- 📄 **Vector PDF Receipts & Printable Vouchers**: Instant client-side PDF generation (`jspdf`) + print-ready official vouchers (`/receipt/[id]`).
- ✉️ **Resend Transactional Emails**: Automated payment confirmations and overdue fee reminders with HTML styling.

---

## ✨ Features Breakdown

### 1. 👨‍🎓 Student Management & Fee Customization
- **Eye-Catching 4-Step Registration Wizard (`/students/new`)**:
  - **Step 1: Student Profile** — Personal info, parent/guardian contact, auto-generating Roll Number (`KC-2024-XXX`).
  - **Step 2: Program & Cohort** — Course selection with real-time batch intake capacity badges.
  - **Step 3: Customizable Fee Heads Builder** — Toggle between package lump-sum or flexible itemized heads. Add custom heads with user-defined descriptions and amounts. Includes 1-click scholarship presets (*Merit 90%+*, *Early Bird*, *Sibling Concession*, *EWS Support*).
  - **Step 4: Admission Review & Confirmation** — Complete financial summary with installment schedules (1 lumpsum, 2/3/4 installments).
- **Direct Fee Customization Modal**: Edit or adjust fee heads for any existing student directly from the student roster or detail ledger without re-registering.

### 2. 💳 Payment Tracking & Collection
- Multiple payment channels supported: **UPI / QR Code, Cash, Credit/Debit Card, Bank Transfer (NEFT/RTGS), Cheque**.
- Dynamic balance calculation: `Gross Fee - Scholarship = Net Fee`, `Net Fee - Paid Amount = Balance Due`.
- Automatic payment status badges: `Paid in Full`, `Partial Payment`, `Pending`, `Overdue`.
- Automated unique Receipt Number generation (e.g. `REC-2024-1001`).

### 3. 📄 Official PDF Receipts & Printable Vouchers
- Client-side vector **PDF Receipt** generation using `jspdf` and `jspdf-autotable`.
- Itemized fee particulars table listing each customized fee component and payment credit.
- Dedicated web voucher view (`/receipt/[id]`) optimized for clean A4 printing (`window.print()`).
- Institutional header, student details, payment method, reference transaction ID, and cashier signature line.

### 4. ⏰ Pending Dues & Automated Email Reminders (Resend)
- Dedicated Pending Dues tracker (`/pending`) filtering partial, pending, and overdue accounts.
- Overdue aging counter (e.g. *14 days overdue*).
- 1-click individual or bulk email due reminders powered by **Resend**.
- Clean, responsive HTML email templates with payment particulars and institutional branding.
- Sent reminder audit history with delivery timestamps and Resend message IDs.

### 5. 📊 Analytics, Reports & CSV Export
- Executive KPI summary cards: Total Billed, Total Collected, Total Outstanding, Collection Efficiency Ratio.
- Monthly collection bar chart and payment channel distribution (UPI vs Cash vs Card vs Bank).
- One-click **Export to CSV** for spreadsheets and accounting audits.

---

## 🏗️ Technology Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   Next.js 14 App Router                     │
│  (React 18, TypeScript, Tailwind CSS, Lucide React Icons)  │
└──────────────┬──────────────────────────────┬───────────────┘
               │                              │
               ▼                              ▼
    ┌────────────────────┐         ┌────────────────────┐
    │  Supabase (Cloud)  │         │    Resend Email    │
    │  PostgreSQL 15+    │         │  Transactional API │
    │  - RLS Policies    │         │  - Payment Receipt │
    │  - Fee Triggers    │         │  - Due Reminders   │
    │  - Schema Cascade  │         │  - HTML Templates  │
    └────────────────────┘         └────────────────────┘
```

| Component | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | Next.js 14 (App Router) | Modern React framework with hybrid SSR & Client components |
| **Language** | TypeScript 5.6 | Strict type-safety across all schemas and API routes |
| **Styling** | Tailwind CSS 3.4 | Clean, responsive, minimalist institutional UI |
| **Database** | Supabase (PostgreSQL) | Relational database with Row Level Security & Triggers |
| **Email Service** | Resend API SDK | Fast, reliable transactional email delivery |
| **PDF Engine** | jsPDF + Autotable | Vector client-side PDF receipts (zero server overhead) |
| **Hosting** | Vercel | Seamless zero-config deployment with custom domain support |

---

## 📁 Repository Structure

```
├── public/                     # Static assets & public files
├── src/
│   ├── app/                    # Next.js App Router routes
│   │   ├── api/                # Backend API route handlers
│   │   │   ├── payments/       # Payment receipt email endpoint
│   │   │   └── reminders/      # Fee due reminder email endpoint
│   │   ├── courses/            # Course & Batch catalog page
│   │   ├── payments/           # Payments ledger & receipt downloads
│   │   ├── pending/            # Pending & overdue student dues
│   │   ├── receipt/[id]/       # Printable official voucher view
│   │   ├── reminders/          # Resend email logs & bulk dispatch
│   │   ├── reports/            # Monthly collection reports & charts
│   │   ├── students/           # Student directory & registry
│   │   │   └── new/            # 4-Step Student Registration Wizard
│   │   ├── globals.css         # Global styles & print utilities
│   │   ├── layout.tsx          # Root layout with AppShell wrapper
│   │   └── page.tsx            # Executive Dashboard
│   ├── components/
│   │   ├── courses/            # Course and batch modals & lists
│   │   ├── layout/             # Top-right Back Button, Sidebar, Navbar
│   │   ├── payments/           # Record payment modal & vouchers
│   │   ├── reminders/          # Due reminder modal & logs
│   │   ├── reports/            # Visual financial charts
│   │   ├── students/           # StudentTable, RegistrationWizard, CustomizeFeeModal
│   │   └── ui/                 # Accessible button, card, badge, modal, input
│   ├── lib/
│   │   ├── receipt-generator.ts# High-fidelity jsPDF receipt generator
│   │   ├── resend.ts           # Resend email service & templates
│   │   ├── storage.ts          # Dual-engine Supabase & Local storage layer
│   │   ├── utils.ts            # Indian Rupee (₹), date, and badge helpers
│   │   └── supabase/           # Supabase client initialization
│   └── types/                  # TypeScript interfaces (Student, FeeItem, Payment)
├── supabase/
│   └── schema.sql              # Complete PostgreSQL schema, RLS, triggers & seed
├── .env.example                # Clean environment variables template
├── .gitignore                  # Git ignore rules (protects private keys)
├── next.config.mjs             # Next.js configuration
├── package.json                # Project dependencies and build scripts
├── tsconfig.json               # TypeScript compiler configuration
└── README.md                   # Documentation & setup guide
```

---

## 🚀 Local Development Setup

### 1. Clone the Repository
```bash
git clone https://github.com/<your-username>/<repo-name>.git
cd <repo-name>
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the root directory by copying `.env.example`:
```bash
cp .env.example .env.local
```

Fill in your configuration details:
```env
# 1. Supabase (PostgreSQL Database)
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# 2. Resend (Email Notifications)
RESEND_API_KEY=re_your_resend_api_key
RESEND_FROM_EMAIL=Khush Classes <onboarding@resend.dev>

# 3. Application & Institution Branding
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_INSTITUTE_NAME=Khush Classes
NEXT_PUBLIC_INSTITUTE_TAGLINE=Premier Coaching & Academic Excellence
NEXT_PUBLIC_INSTITUTE_ADDRESS=Main Market Road, Knowledge Park, Delhi NCR
NEXT_PUBLIC_INSTITUTE_PHONE=+91 98765 43210
NEXT_PUBLIC_INSTITUTE_EMAIL=fees@khushclasses.com
NEXT_PUBLIC_CURRENCY_SYMBOL=₹
```

> **Note:** If environment variables are omitted during initial local testing, the application automatically launches in **Local Demo Mode** with pre-seeded Khush Classes records.

### 4. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (or the active port specified) in your browser.

---

## 🗄️ Database Setup (Supabase)

1. Create a project at [supabase.com](https://supabase.com).
2. Go to the **SQL Editor** tab in your Supabase project dashboard.
3. Open [`supabase/schema.sql`](supabase/schema.sql) in this repository.
4. Copy the entire file contents and paste them into the SQL Editor.
5. Click **Run** (`Ctrl + Enter`).
6. The script will:
   - Create tables: `courses`, `batches`, `fee_structures`, `students`, `payments`, `reminders`.
   - Add `custom_fee_items` JSONB support for itemized fee customization.
   - Attach automatic payment balance recalculation triggers.
   - Configure Row Level Security (RLS) policies.
   - Seed starter courses, batches, and student records.

---

## ☁️ Deploy to Vercel (Production Ready)

This repository is optimized for zero-config deployment on **Vercel**.

### Step 1: Push Code to GitHub
```bash
git add .
git commit -m "feat: complete student fee management system for Khush Classes"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git push -u origin main
```

### Step 2: Import into Vercel
1. Log in to [vercel.com](https://vercel.com) and click **"Add New" $\rightarrow$ "Project"**.
2. Select your GitHub repository and click **Import**.
3. Under **Environment Variables**, add the variables from `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `RESEND_API_KEY`
   - `RESEND_FROM_EMAIL`
   - `NEXT_PUBLIC_APP_URL` (set to your Vercel URL e.g. `https://khushclasses.vercel.app`)
   - `NEXT_PUBLIC_INSTITUTE_NAME`
   - `NEXT_PUBLIC_CURRENCY_SYMBOL`
4. Click **Deploy**. Vercel will compile and deploy your production app in under 60 seconds.

### Step 3: Connect a Custom Domain (Optional)
1. In your Vercel Project Dashboard, navigate to **Settings $\rightarrow$ Domains**.
2. Enter your custom domain (e.g. `fees.khushclasses.com` or `khushclasses.com`).
3. Add the DNS records provided by Vercel in your domain registrar (GoDaddy, Namecheap, Cloudflare):
   - **Type A**: `76.76.21.21` (for root domain)
   - **Type CNAME**: `cname.vercel-dns.com` (for subdomain)
4. Vercel will automatically provision and manage free SSL certificates.

---

## 🔒 Security & Data Integrity

- **Protected Secrets**: Private API keys (`SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`) run only on server handlers and are never exposed to client browsers.
- **Git Security**: `.gitignore` strictly excludes `.env*.local` and `.env` files to prevent credentials from entering version control.
- **PostgreSQL Row Level Security (RLS)**: Enforced on all Supabase tables.
- **Accurate Balance Math**: All fee calculations enforce non-negative constraints using `Math.max(net_fee - paid_amount, 0)`.
- **Client-Side PDF Architecture**: `jspdf` executes directly in the user's browser, eliminating heavy headless browser requirements on serverless runtimes.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE). Built for **Khush Classes**.
