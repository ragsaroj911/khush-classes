-- ====================================================================
-- STUDENT FEE MANAGEMENT SYSTEM - DATABASE SCHEMA (SUPABASE / POSTGRESQL)
-- ====================================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. COURSES TABLE
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(30) UNIQUE NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    duration VARCHAR(50) NOT NULL, -- e.g. "4 Years", "2 Years", "6 Months"
    default_total_fee NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. BATCHES TABLE
CREATE TABLE IF NOT EXISTS public.batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE RESTRICT,
    name VARCHAR(100) NOT NULL, -- e.g. "Batch 2024-2028 (A)"
    academic_year VARCHAR(20) NOT NULL, -- e.g. "2024-2025"
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    max_capacity INTEGER DEFAULT 60,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. FEE STRUCTURE TEMPLATES TABLE
CREATE TABLE IF NOT EXISTS public.fee_structures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    title VARCHAR(120) NOT NULL,
    tuition_fee NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    admission_fee NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    exam_fee NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    lab_library_fee NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    other_fee NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    total_fee NUMERIC(12, 2) GENERATED ALWAYS AS (
        tuition_fee + admission_fee + exam_fee + lab_library_fee + other_fee
    ) STORED,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. STUDENTS TABLE
CREATE TABLE IF NOT EXISTS public.students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    roll_number VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(30) NOT NULL,
    parent_name VARCHAR(120),
    parent_phone VARCHAR(30),
    parent_email VARCHAR(150),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE RESTRICT,
    batch_id UUID NOT NULL REFERENCES public.batches(id) ON DELETE RESTRICT,
    admission_date DATE NOT NULL DEFAULT CURRENT_DATE,
    
    -- Fee Calculations
    gross_fee NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    discount_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    discount_reason VARCHAR(200),
    net_fee NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    paid_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    balance_amount NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    
    -- Statuses: 'paid', 'partial', 'pending', 'overdue'
    payment_status VARCHAR(20) NOT NULL DEFAULT 'pending',
    due_date DATE,
    student_status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active', 'graduated', 'suspended'
    
    -- Customizable itemized fee breakdown
    custom_fee_items JSONB DEFAULT '[]'::jsonb,
    
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    receipt_number VARCHAR(50) UNIQUE NOT NULL,
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    payment_method VARCHAR(30) NOT NULL, -- 'upi', 'cash', 'card', 'bank_transfer', 'cheque'
    payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
    transaction_id VARCHAR(100), -- UPI ref, bank UTR, cheque no.
    remarks TEXT,
    recorded_by VARCHAR(100) DEFAULT 'Admin',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. REMINDERS LOG TABLE
CREATE TABLE IF NOT EXISTS public.reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
    recipient_email VARCHAR(150) NOT NULL,
    amount_due NUMERIC(12, 2) NOT NULL,
    due_date DATE,
    subject VARCHAR(200) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'sent', -- 'sent', 'failed'
    resend_email_id VARCHAR(100),
    sent_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ====================================================================
-- INDEXES FOR FAST SEARCH & REPORTING
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_students_roll ON public.students(roll_number);
CREATE INDEX IF NOT EXISTS idx_students_email ON public.students(email);
CREATE INDEX IF NOT EXISTS idx_students_course ON public.students(course_id);
CREATE INDEX IF NOT EXISTS idx_students_batch ON public.students(batch_id);
CREATE INDEX IF NOT EXISTS idx_students_status ON public.students(payment_status);
CREATE INDEX IF NOT EXISTS idx_payments_student ON public.payments(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON public.payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_payments_receipt ON public.payments(receipt_number);

-- ====================================================================
-- AUTOMATIC BALANCE & STATUS CALCULATION TRIGGER
-- ====================================================================
CREATE OR REPLACE FUNCTION public.recalculate_student_fees()
RETURNS TRIGGER AS $$
DECLARE
    target_student_id UUID;
    total_paid NUMERIC(12, 2);
    student_record RECORD;
    new_status VARCHAR(20);
BEGIN
    IF TG_OP = 'DELETE' THEN
        target_student_id := OLD.student_id;
    ELSE
        target_student_id := NEW.student_id;
    END IF;

    -- Calculate total payments received for this student
    SELECT COALESCE(SUM(amount), 0.00) INTO total_paid
    FROM public.payments
    WHERE student_id = target_student_id;

    -- Get student net fee and due date
    SELECT net_fee, due_date INTO student_record
    FROM public.students
    WHERE id = target_student_id;

    -- Determine status
    IF total_paid >= student_record.net_fee AND student_record.net_fee > 0 THEN
        new_status := 'paid';
    ELSIF total_paid > 0 THEN
        IF student_record.due_date IS NOT NULL AND student_record.due_date < CURRENT_DATE THEN
            new_status := 'overdue';
        ELSE
            new_status := 'partial';
        END IF;
    ELSE
        IF student_record.due_date IS NOT NULL AND student_record.due_date < CURRENT_DATE THEN
            new_status := 'overdue';
        ELSE
            new_status := 'pending';
        END IF;
    END IF;

    -- Update student row
    UPDATE public.students
    SET paid_amount = total_paid,
        balance_amount = GREATEST(net_fee - total_paid, 0.00),
        payment_status = new_status,
        updated_at = timezone('utc'::text, now())
    WHERE id = target_student_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_recalculate_fees ON public.payments;
CREATE TRIGGER trg_recalculate_fees
AFTER INSERT OR UPDATE OR DELETE ON public.payments
FOR EACH ROW
EXECUTE FUNCTION public.recalculate_student_fees();

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_structures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reminders ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users / service roles full access to manage records
CREATE POLICY "Allow authenticated read/write courses"
ON public.courses FOR ALL
TO authenticated, anon
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated read/write batches"
ON public.batches FOR ALL
TO authenticated, anon
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated read/write fee_structures"
ON public.fee_structures FOR ALL
TO authenticated, anon
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated read/write students"
ON public.students FOR ALL
TO authenticated, anon
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated read/write payments"
ON public.payments FOR ALL
TO authenticated, anon
USING (true)
WITH CHECK (true);

CREATE POLICY "Allow authenticated read/write reminders"
ON public.reminders FOR ALL
TO authenticated, anon
USING (true)
WITH CHECK (true);

-- ====================================================================
-- SEED DATA (SAMPLE COURSES, BATCHES, STUDENTS, PAYMENTS)
-- ====================================================================
INSERT INTO public.courses (id, code, name, description, duration, default_total_fee)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'CS101', 'B.Tech Computer Science & Engineering', 'Comprehensive 4-year degree in software engineering, AI, systems and cloud architecture.', '4 Years', 120000.00),
    ('22222222-2222-2222-2222-222222222222', 'BBA201', 'Bachelor of Business Administration', '3-year program covering management, marketing, financial planning, and enterprise strategy.', '3 Years', 85000.00),
    ('33333333-3333-3333-3333-333333333333', 'DS301', 'M.Sc Data Science & Analytics', '2-year master curriculum covering machine learning, big data pipelines, and predictive analytics.', '2 Years', 95000.00),
    ('44444444-4444-4444-4444-444444444444', 'UI401', 'Diploma in UI/UX Design & HCI', '1-year specialized design curriculum focusing on design systems, Figma, and usability testing.', '1 Year', 50000.00)
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.batches (id, course_id, name, academic_year, start_date, end_date, max_capacity)
VALUES
    ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '11111111-1111-1111-1111-111111111111', 'CSE Batch 2024-A', '2024-2025', '2024-08-01', '2028-06-30', 60),
    ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '11111111-1111-1111-1111-111111111111', 'CSE Batch 2024-B', '2024-2025', '2024-08-01', '2028-06-30', 60),
    ('cccccccc-cccc-cccc-cccc-cccccccccccc', '22222222-2222-2222-2222-222222222222', 'BBA Batch 2024-Morning', '2024-2025', '2024-08-15', '2027-05-30', 50),
    ('dddddddd-dddd-dddd-dddd-dddddddddddd', '33333333-3333-3333-3333-333333333333', 'Data Science Cohort 2024', '2024-2025', '2024-09-01', '2026-06-30', 40),
    ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '44444444-4444-4444-4444-444444444444', 'UX Design Fall 2024', '2024-2025', '2024-09-15', '2025-08-31', 30)
ON CONFLICT DO NOTHING;

INSERT INTO public.fee_structures (course_id, title, tuition_fee, admission_fee, exam_fee, lab_library_fee, other_fee)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'CSE Standard Annual Fee 2024', 80000.00, 15000.00, 8000.00, 12000.00, 5000.00),
    ('22222222-2222-2222-2222-222222222222', 'BBA Standard Annual Fee 2024', 55000.00, 12000.00, 6000.00, 8000.00, 4000.00),
    ('33333333-3333-3333-3333-333333333333', 'Data Science Master Fee 2024', 65000.00, 10000.00, 7000.00, 10000.00, 3000.00),
    ('44444444-4444-4444-4444-444444444444', 'Diploma UI/UX Tuition 2024', 35000.00, 5000.00, 3000.00, 5000.00, 2000.00)
ON CONFLICT DO NOTHING;

-- Seed Sample Students
INSERT INTO public.students (
    id, roll_number, first_name, last_name, email, phone, parent_name, parent_phone, course_id, batch_id, 
    admission_date, gross_fee, discount_amount, discount_reason, net_fee, paid_amount, balance_amount, payment_status, due_date
) VALUES
    ('00000001-0000-0000-0000-000000000001', 'STU-2024-001', 'Aarav', 'Sharma', 'aarav.sharma@example.com', '+91 98765 43210', 'Rajesh Sharma', '+91 98765 43211', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2024-08-01', 120000.00, 10000.00, 'Merit Scholarship', 110000.00, 110000.00, 0.00, 'paid', '2024-11-15'),
    ('00000002-0000-0000-0000-000000000002', 'STU-2024-002', 'Diya', 'Patel', 'diya.patel@example.com', '+91 98765 43212', 'Suresh Patel', '+91 98765 43213', '11111111-1111-1111-1111-111111111111', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '2024-08-05', 120000.00, 0.00, NULL, 120000.00, 60000.00, 60000.00, 'partial', '2024-11-30'),
    ('00000003-0000-0000-0000-000000000003', 'STU-2024-003', 'Rohan', 'Verma', 'rohan.verma@example.com', '+91 98765 43214', 'Vikram Verma', '+91 98765 43215', '22222222-2222-2222-2222-222222222222', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '2024-08-10', 85000.00, 5000.00, 'Early Bird Discount', 80000.00, 0.00, 80000.00, 'overdue', '2024-10-15'),
    ('00000004-0000-0000-0000-000000000004', 'STU-2024-004', 'Ananya', 'Iyer', 'ananya.iyer@example.com', '+91 98765 43216', 'Raman Iyer', '+91 98765 43217', '33333333-3333-3333-3333-333333333333', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '2024-08-12', 95000.00, 0.00, NULL, 95000.00, 50000.00, 45000.00, 'partial', '2024-12-05'),
    ('00000005-0000-0000-0000-000000000005', 'STU-2024-005', 'Kabir', 'Khan', 'kabir.khan@example.com', '+91 98765 43218', 'Tariq Khan', '+91 98765 43219', '44444444-4444-4444-4444-444444444444', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '2024-09-01', 50000.00, 0.00, NULL, 50000.00, 0.00, 50000.00, 'pending', '2024-12-20')
ON CONFLICT (roll_number) DO NOTHING;

-- Seed Sample Payments
INSERT INTO public.payments (receipt_number, student_id, amount, payment_method, payment_date, transaction_id, remarks)
VALUES
    ('REC-2024-0001', '00000001-0000-0000-0000-000000000001', 50000.00, 'upi', '2024-08-01', 'UPI/4238129031', 'First installment - Admission & Tuition'),
    ('REC-2024-0002', '00000001-0000-0000-0000-000000000001', 60000.00, 'bank_transfer', '2024-10-05', 'NEFT-HDFC-99120', 'Final clearance payment'),
    ('REC-2024-0003', '00000002-0000-0000-0000-000000000002', 60000.00, 'card', '2024-08-06', 'TXN-CARD-4401', 'Semester 1 fee payment'),
    ('REC-2024-0004', '00000004-0000-0000-0000-000000000004', 50000.00, 'upi', '2024-08-15', 'UPI/882190334', 'Term 1 advance fee')
ON CONFLICT (receipt_number) DO NOTHING;

