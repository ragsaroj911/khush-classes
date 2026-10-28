# 🎓 Student Fee Management System (SFMS)

A modern, minimalist, responsive **Student Fee Management System** built with **Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui, Supabase (PostgreSQL), and Resend**.

Designed for universities, colleges, schools, and coaching academies to handle student admissions, fee structures, payment tracking, pending dues, downloadable PDF receipts, monthly collection analytics, and automated email reminders.

---

## ✨ Features

- **👨‍🎓 Student Registration & Records**:
  - Full student profile management (Name, Roll No/ID, Email, Phone, Guardian Info, Admission Date).
  - Course and Cohort/Batch assignment.
  - Automatic Gross Fee, Scholarship/Waiver deductions, and Net Fee calculations.
  - Real-time ledger tracking: Paid Amount, Balance Outstanding, and Payment Status (`paid`, `partial`, `pending`, `overdue`).

- **📚 Course & Batch Management**:
  - Configure degree programs, diploma courses, durations, and default total fees.
  - Define cohorts and batches with academic year, start/end dates, and capacity caps.
  - Itemized **Fee Structure Breakdown** (Tuition Fee, Admission Fee, Examination Fee, Lab & Library Fee, Other Charges).

- **💳 Payment Recording & Tracking**:
  - Multi-channel payment recording: **UPI / QR Code, Cash, Credit/Debit Card, Bank Transfer (NEFT/RTGS), Cheque**.
  - One-click "Pay Full Remaining Balance" or partial installment payments.
  - Transaction references, payment date, notes, and cashier records.
  - Automated unique Receipt Number generation (e.g., `REC-2024-1002`).

- **📄 Downloadable PDF Receipts & Printable Vouchers**:
  - Instant vector **PDF Receipt Download** generated client-side using `jspdf` and `jspdf-autotable`.
  - Dedicated **Printable Official Receipt Page** (`/receipt/[id]`) formatted for crisp A4 paper printing (`window.print()`).
  - Itemized particulars, cumulative payment ledger summary, institutional address, and authorized cashier sign-off.

- **⏰ Pending Dues & Aging Records**:
  - Dedicated Pending Fee dashboard (`/pending`) filtering by overdue, partial, and pending accounts.
  - Dynamic Overdue Days aging counter (e.g. `14 days overdue`).
  - One-click "Collect Payment" or "Send Due Reminder".

- **📧 Fee Due Reminders & Receipts via Resend**:
  - Direct integration with the official **Resend SDK** for reliable transactional email delivery.
  - Beautiful, responsive HTML email templates with institutional branding, amount due, and due date.
  - Automatic email receipt dispatch upon payment confirmation.
  - **Bulk Overdue Reminders**: 1-click batch dispatch with progress feedback.
  - Sent reminders audit log with timestamps and Resend message IDs.

- **📊 Monthly Collection Reports & Financial Analytics**:
  - Real-time KPI summaries: Total Billed, Total Collected, Total Overdue, Collection Efficiency Ratio.
  - Interactive **Monthly Revenue Trend Bar Chart** across calendar months.
  - Collections breakdown by payment channel (UPI vs Cash vs Card vs Bank).
  - Revenue distribution across academic degree programs.
  - **One-click Export to CSV** for financial auditing and Excel reporting.

- **⚡ Dual-Engine Hybrid Architecture**:
  - **Live Supabase Mode**: Connects directly to PostgreSQL database with Row Level Security (RLS) policies and triggers.
  - **Instant Local/Demo Mode**: Out-of-the-box working experience with pre-seeded sample data and local reactivity if environment variables are not yet configured.

---

## 🏗️ Tech Stack

| Component | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS + CSS Variables |
| **Icons & UI** | Lucide React + shadcn/ui design patterns |
| **Database & Auth** | Supabase (PostgreSQL 15+, RLS Policies, Triggers) |
| **Email Service** | Resend API SDK |
| **PDF Generation** | jsPDF + jspdf-autotable |
| **Deployment** | Vercel (zero-config SSR/Edge) |

---

## 📁 Project Structure

```
├── public/                 # Static assets & icons
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── api/            # API Route Handlers
│   │   │   ├── payments/   # Payment receipt email endpoint
│   │   │   └── reminders/  # Fee reminder email endpoint
│   │   ├── courses/        # Course and batch management
│   │   ├── payments/       # Collections ledger & PDF receipts
│   │   ├── pending/        # Pending dues & overdue aging view
│   │   ├── receipt/[id]/   # Printable official voucher view
│   │   ├── reminders/      # Resend email logs & bulk dispatch
│   │   ├── reports/        # Collection reports & financial analytics
│   │   ├── students/       # Student directory & registration
│   │   ├── globals.css     # Design system & print stylesheets
│   │   ├── layout.tsx      # Root layout
│   │   └── page.tsx        # Executive Dashboard
│   ├── components/         # Reusable UI & Feature components
│   │   ├── courses/        # Course & Batch manager
│   │   ├── layout/         # Sidebar, AppShell, Mobile navigation
│   │   ├── payments/       # Payment modals & history tables
│   │   ├── reminders/      # Due reminders manager & modals
│   │   ├── reports/        # Analytics & charts
│   │   ├── students/       # Student table, form & detail modals
│   │   └── ui/             # Button, Card, Badge, Modal, Input
│   ├── lib/
│   │   ├── receipt-generator.ts # High-fidelity jsPDF engine
│   │   ├── resend.ts            # Resend email templates & client
│   │   ├── storage.ts           # Hybrid Supabase / Local storage engine
│   │   ├── utils.ts             # Currency, Date, Status helpers
│   │   └── supabase/            # Client and server Supabase clients
│   └── types/                   # TypeScript interfaces & types
├── supabase/
│   └── schema.sql          # Complete PostgreSQL schema, RLS, triggers & seed
├── .env.example            # Environment variables template
└── README.md
```

---

## 🚀 Getting Started

### 1. Clone & Install Dependencies

```bash
git clone <your-github-repo-url>
cd student-fee-management
npm install
```

### 2. Configure Environment Variables

Create `.env.local` based on `.env.example`:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Resend Configuration
RESEND_API_KEY=re_your_api_key_here
RESEND_FROM_EMAIL=Fee Management <onboarding@resend.dev>

# Institution Details
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_INSTITUTE_NAME=Apex International Institute
NEXT_PUBLIC_INSTITUTE_ADDRESS=Sector 62, Knowledge Boulevard, Institutional Area
NEXT_PUBLIC_INSTITUTE_PHONE=+91 120 4567 890
NEXT_PUBLIC_INSTITUTE_EMAIL=fees@apex-institute.edu
NEXT_PUBLIC_CURRENCY_SYMBOL=₹
```

> **Note:** If you run without keys, the system automatically launches in **Local Demo Mode** with pre-seeded data so you can test all features immediately!

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🗄️ Supabase PostgreSQL Database Setup

1. Create a new project at [Supabase Dashboard](https://supabase.com).
2. Go to the **SQL Editor** tab in your Supabase project.
3. Open `supabase/schema.sql` from this repository.
4. Copy and paste the entire SQL contents into the SQL Editor and click **Run**.
5. It will:
   - Create tables: `courses`, `batches`, `fee_structures`, `students`, `payments`, `reminders`.
   - Setup foreign keys with integrity cascades.
   - Attach the **automatic fee recalculation trigger** `recalculate_student_fees()` on `payments`.
   - Enable Row Level Security (RLS) with secure policies.
   - Insert starter sample degree courses, cohorts, and student records.
6. Copy your project URL and keys from **Settings -> API** into your `.env.local`.

---

## ✉️ Resend Email Setup

1. Sign up for free at [Resend.com](https://resend.com).
2. Generate an API Key under **API Keys**.
3. For testing, set `RESEND_FROM_EMAIL=onboarding@resend.dev` (delivered to your registered Resend email address).
4. For production, add your custom domain (e.g. `mail.apex-institute.edu`) in Resend and verify DNS records (DKIM, SPF).

---

## 🌐 Deploy to Vercel & Connect Custom Domain

### Option A: Deploy via GitHub (Recommended)

1. Push your project to a GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "feat: initial student fee management system"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git push -u origin main
   ```
2. Go to [vercel.com](https://vercel.com) and click **"Add New Project"**.
3. Import your GitHub repository.
4. In the **Environment Variables** section, copy the variables from `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `RESEND_API_KEY`
   - `RESEND_FROM_EMAIL`
   - `NEXT_PUBLIC_INSTITUTE_NAME`
   - `NEXT_PUBLIC_CURRENCY_SYMBOL`
5. Click **Deploy**. Vercel will build and assign a production URL (e.g., `https://sfms.vercel.app`).

### Option B: Connect a Custom Domain on Vercel

1. In your Vercel project dashboard, navigate to **Settings -> Domains**.
2. Enter your custom domain (e.g. `fees.apex-institute.edu` or `apexfees.com`).
3. Add the DNS records shown by Vercel in your domain registrar (GoDaddy, Namecheap, Cloudflare, Google Domains):
   - **Type A**: `76.76.21.21` (for apex domain)
   - **Type CNAME**: `cname.vercel-dns.com` (for subdomain like `fees.apex-institute.edu`)
4. Vercel automatically issues and renews an SSL certificate.

---

## 🔒 Security & Best Practices

- **Row Level Security (RLS)**: Enforced on all Supabase tables so data cannot be tampered with directly.
- **Environment Isolation**: Private API keys (`SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`) are kept on the server and never exposed to the client.
- **Accurate Calculations**: Balances and statuses are strictly calculated and clamped against negative numbers (`Math.max(net_fee - paid, 0)`).
- **Client-Side PDF Generation**: Does not require heavy serverless headless chromium instances, ensuring zero memory timeouts and 100% reliable receipt downloads.

