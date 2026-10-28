import { Course, Batch, FeeStructure, Student, Payment, ReminderLog, DashboardMetrics } from '@/types';
import { supabase, isSupabaseConfigured } from './supabase/client';
import { calculatePaymentStatus, generateReceiptNumber } from './utils';

// =====================================================================
// DEFAULT INITIAL SEED DATA FOR IMMEDIATE PREVIEW & LOCAL MODE
// =====================================================================

export const INITIAL_COURSES: Course[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    code: 'CS101',
    name: 'B.Tech Computer Science & Engineering',
    description: 'Comprehensive 4-year degree in software engineering, AI, systems and cloud architecture.',
    duration: '4 Years',
    default_total_fee: 120000,
    is_active: true,
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    code: 'BBA201',
    name: 'Bachelor of Business Administration',
    description: '3-year program covering management, marketing, financial planning, and enterprise strategy.',
    duration: '3 Years',
    default_total_fee: 85000,
    is_active: true,
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    code: 'DS301',
    name: 'M.Sc Data Science & Analytics',
    description: '2-year master curriculum covering machine learning, big data pipelines, and predictive analytics.',
    duration: '2 Years',
    default_total_fee: 95000,
    is_active: true,
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    code: 'UI401',
    name: 'Diploma in UI/UX Design & HCI',
    description: '1-year specialized design curriculum focusing on design systems, Figma, and usability testing.',
    duration: '1 Year',
    default_total_fee: 50000,
    is_active: true,
  },
];

export const INITIAL_BATCHES: Batch[] = [
  {
    id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    course_id: '11111111-1111-1111-1111-111111111111',
    name: 'CSE Batch 2024-A',
    academic_year: '2024-2025',
    start_date: '2024-08-01',
    end_date: '2028-06-30',
    max_capacity: 60,
    is_active: true,
  },
  {
    id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    course_id: '11111111-1111-1111-1111-111111111111',
    name: 'CSE Batch 2024-B',
    academic_year: '2024-2025',
    start_date: '2024-08-01',
    end_date: '2028-06-30',
    max_capacity: 60,
    is_active: true,
  },
  {
    id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
    course_id: '22222222-2222-2222-2222-222222222222',
    name: 'BBA Batch 2024-Morning',
    academic_year: '2024-2025',
    start_date: '2024-08-15',
    end_date: '2027-05-30',
    max_capacity: 50,
    is_active: true,
  },
  {
    id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
    course_id: '33333333-3333-3333-3333-333333333333',
    name: 'Data Science Cohort 2024',
    academic_year: '2024-2025',
    start_date: '2024-09-01',
    end_date: '2026-06-30',
    max_capacity: 40,
    is_active: true,
  },
  {
    id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    course_id: '44444444-4444-4444-4444-444444444444',
    name: 'UX Design Fall 2024',
    academic_year: '2024-2025',
    start_date: '2024-09-15',
    end_date: '2025-08-31',
    max_capacity: 30,
    is_active: true,
  },
];

export const INITIAL_FEE_STRUCTURES: FeeStructure[] = [
  {
    id: 'f1',
    course_id: '11111111-1111-1111-1111-111111111111',
    title: 'CSE Standard Annual Fee 2024',
    tuition_fee: 80000,
    admission_fee: 15000,
    exam_fee: 8000,
    lab_library_fee: 12000,
    other_fee: 5000,
    total_fee: 120000,
  },
  {
    id: 'f2',
    course_id: '22222222-2222-2222-2222-222222222222',
    title: 'BBA Standard Annual Fee 2024',
    tuition_fee: 55000,
    admission_fee: 12000,
    exam_fee: 6000,
    lab_library_fee: 8000,
    other_fee: 4000,
    total_fee: 85000,
  },
  {
    id: 'f3',
    course_id: '33333333-3333-3333-3333-333333333333',
    title: 'Data Science Master Fee 2024',
    tuition_fee: 65000,
    admission_fee: 10000,
    exam_fee: 7000,
    lab_library_fee: 10000,
    other_fee: 3000,
    total_fee: 95000,
  },
  {
    id: 'f4',
    course_id: '44444444-4444-4444-4444-444444444444',
    title: 'Diploma UI/UX Tuition 2024',
    tuition_fee: 35000,
    admission_fee: 5000,
    exam_fee: 3000,
    lab_library_fee: 5000,
    other_fee: 2000,
    total_fee: 50000,
  },
];

export const INITIAL_STUDENTS: Student[] = [
  {
    id: '00000001-0000-0000-0000-000000000001',
    roll_number: 'STU-2024-001',
    first_name: 'Aarav',
    last_name: 'Sharma',
    email: 'aarav.sharma@example.com',
    phone: '+91 98765 43210',
    parent_name: 'Rajesh Sharma',
    parent_phone: '+91 98765 43211',
    parent_email: 'rajesh.sharma@example.com',
    course_id: '11111111-1111-1111-1111-111111111111',
    batch_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    admission_date: '2024-08-01',
    gross_fee: 120000,
    discount_amount: 10000,
    discount_reason: 'Merit Scholarship (95%+)',
    net_fee: 110000,
    paid_amount: 110000,
    balance_amount: 0,
    payment_status: 'paid',
    due_date: '2024-11-15',
    student_status: 'active',
    notes: 'Exemplary academic record. First semester topper.',
  },
  {
    id: '00000002-0000-0000-0000-000000000002',
    roll_number: 'STU-2024-002',
    first_name: 'Diya',
    last_name: 'Patel',
    email: 'diya.patel@example.com',
    phone: '+91 98765 43212',
    parent_name: 'Suresh Patel',
    parent_phone: '+91 98765 43213',
    parent_email: 'suresh.patel@example.com',
    course_id: '11111111-1111-1111-1111-111111111111',
    batch_id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    admission_date: '2024-08-05',
    gross_fee: 120000,
    discount_amount: 0,
    discount_reason: '',
    net_fee: 120000,
    paid_amount: 60000,
    balance_amount: 60000,
    payment_status: 'partial',
    due_date: '2024-12-15',
    student_status: 'active',
    notes: 'Requested two installments. Installment 1 completed.',
  },
  {
    id: '00000003-0000-0000-0000-000000000003',
    roll_number: 'STU-2024-003',
    first_name: 'Rohan',
    last_name: 'Verma',
    email: 'rohan.verma@example.com',
    phone: '+91 98765 43214',
    parent_name: 'Vikram Verma',
    parent_phone: '+91 98765 43215',
    parent_email: 'vikram.verma@example.com',
    course_id: '22222222-2222-2222-2222-222222222222',
    batch_id: 'cccccccc-cccc-cccc-cccc-cccccccccccc',
    admission_date: '2024-08-10',
    gross_fee: 85000,
    discount_amount: 5000,
    discount_reason: 'Early Bird Admission Waiver',
    net_fee: 80000,
    paid_amount: 0,
    balance_amount: 80000,
    payment_status: 'overdue',
    due_date: '2024-10-15',
    student_status: 'active',
    notes: 'Due date passed. Urgent fee reminder required.',
  },
  {
    id: '00000004-0000-0000-0000-000000000004',
    roll_number: 'STU-2024-004',
    first_name: 'Ananya',
    last_name: 'Iyer',
    email: 'ananya.iyer@example.com',
    phone: '+91 98765 43216',
    parent_name: 'Raman Iyer',
    parent_phone: '+91 98765 43217',
    parent_email: 'raman.iyer@example.com',
    course_id: '33333333-3333-3333-3333-333333333333',
    batch_id: 'dddddddd-dddd-dddd-dddd-dddddddddddd',
    admission_date: '2024-08-12',
    gross_fee: 95000,
    discount_amount: 0,
    discount_reason: '',
    net_fee: 95000,
    paid_amount: 50000,
    balance_amount: 45000,
    payment_status: 'partial',
    due_date: '2024-12-05',
    student_status: 'active',
  },
  {
    id: '00000005-0000-0000-0000-000000000005',
    roll_number: 'STU-2024-005',
    first_name: 'Kabir',
    last_name: 'Khan',
    email: 'kabir.khan@example.com',
    phone: '+91 98765 43218',
    parent_name: 'Tariq Khan',
    parent_phone: '+91 98765 43219',
    parent_email: 'tariq.khan@example.com',
    course_id: '44444444-4444-4444-4444-444444444444',
    batch_id: 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee',
    admission_date: '2024-09-01',
    gross_fee: 50000,
    discount_amount: 0,
    discount_reason: '',
    net_fee: 50000,
    paid_amount: 0,
    balance_amount: 50000,
    payment_status: 'pending',
    due_date: '2024-12-20',
    student_status: 'active',
  },
];

export const INITIAL_PAYMENTS: Payment[] = [
  {
    id: 'p1',
    receipt_number: 'REC-2024-1001',
    student_id: '00000001-0000-0000-0000-000000000001',
    amount: 50000,
    payment_method: 'upi',
    payment_date: '2024-08-01',
    transaction_id: 'UPI/4238129031/OKBI',
    remarks: 'First installment - Admission & Tuition',
    recorded_by: 'Finance Officer',
  },
  {
    id: 'p2',
    receipt_number: 'REC-2024-1002',
    student_id: '00000001-0000-0000-0000-000000000001',
    amount: 60000,
    payment_method: 'bank_transfer',
    payment_date: '2024-10-05',
    transaction_id: 'NEFT-HDFC-9912042',
    remarks: 'Final fee clearance payment',
    recorded_by: 'Finance Officer',
  },
  {
    id: 'p3',
    receipt_number: 'REC-2024-1003',
    student_id: '00000002-0000-0000-0000-000000000002',
    amount: 60000,
    payment_method: 'card',
    payment_date: '2024-08-06',
    transaction_id: 'POS-CARD-440188',
    remarks: 'Semester 1 fee payment',
    recorded_by: 'Cashier Desk',
  },
  {
    id: 'p4',
    receipt_number: 'REC-2024-1004',
    student_id: '00000004-0000-0000-0000-000000000004',
    amount: 50000,
    payment_method: 'upi',
    payment_date: '2024-08-15',
    transaction_id: 'UPI/882190334/HDFC',
    remarks: 'Term 1 advance fee',
    recorded_by: 'Finance Officer',
  },
];

export const INITIAL_REMINDERS: ReminderLog[] = [
  {
    id: 'rem-1',
    student_id: '00000003-0000-0000-0000-000000000003',
    recipient_email: 'rohan.verma@example.com',
    amount_due: 80000,
    due_date: '2024-10-15',
    subject: 'Urgent: Pending Fee Due Reminder (STU-2024-003) - Apex International Institute',
    status: 'sent',
    resend_email_id: 'resend_demo_9824',
    sent_at: '2024-10-16T10:30:00Z',
  },
];

// Helper to interact with local storage in browser
const STORAGE_KEYS = {
  COURSES: 'sfms_courses',
  BATCHES: 'sfms_batches',
  FEE_STRUCTURES: 'sfms_fee_structures',
  STUDENTS: 'sfms_students',
  PAYMENTS: 'sfms_payments',
  REMINDERS: 'sfms_reminders',
};

function getLocalData<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setLocalData<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn('LocalStorage error:', err);
  }
}

// =====================================================================
// DATA ACCESS LAYER (HYBRID SUPABASE + LOCAL DEMO ENGINE)
// =====================================================================

export const DataService = {
  // COURSES
  async getCourses(): Promise<Course[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('courses').select('*').order('name');
        if (!error && data && data.length > 0) return data;
      } catch (e) {
        console.warn('Supabase fetch courses failed, falling back to local store:', e);
      }
    }
    return getLocalData<Course[]>(STORAGE_KEYS.COURSES, INITIAL_COURSES);
  },

  async addCourse(course: Omit<Course, 'id'>): Promise<Course> {
    const newCourse: Course = {
      ...course,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('courses').insert(newCourse).select().single();
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase insert course failed, falling back:', e);
      }
    }

    const current = getLocalData<Course[]>(STORAGE_KEYS.COURSES, INITIAL_COURSES);
    const updated = [newCourse, ...current];
    setLocalData(STORAGE_KEYS.COURSES, updated);
    return newCourse;
  },

  // BATCHES
  async getBatches(): Promise<Batch[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('batches').select('*, course:courses(*)').order('name');
        if (!error && data && data.length > 0) return data;
      } catch (e) {
        console.warn('Supabase fetch batches failed:', e);
      }
    }
    const courses = await this.getCourses();
    const batches = getLocalData<Batch[]>(STORAGE_KEYS.BATCHES, INITIAL_BATCHES);
    return batches.map(b => ({
      ...b,
      course: courses.find(c => c.id === b.course_id),
    }));
  },

  async addBatch(batch: Omit<Batch, 'id'>): Promise<Batch> {
    const newBatch: Batch = {
      ...batch,
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('batches').insert(newBatch).select().single();
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase insert batch failed:', e);
      }
    }

    const current = getLocalData<Batch[]>(STORAGE_KEYS.BATCHES, INITIAL_BATCHES);
    const updated = [newBatch, ...current];
    setLocalData(STORAGE_KEYS.BATCHES, updated);
    return newBatch;
  },

  // FEE STRUCTURES
  async getFeeStructures(): Promise<FeeStructure[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('fee_structures').select('*');
        if (!error && data && data.length > 0) return data;
      } catch (e) {
        console.warn('Supabase fetch fee structures failed:', e);
      }
    }
    return getLocalData<FeeStructure[]>(STORAGE_KEYS.FEE_STRUCTURES, INITIAL_FEE_STRUCTURES);
  },

  async saveFeeStructure(feeStruct: Omit<FeeStructure, 'id'>): Promise<FeeStructure> {
    const total_fee =
      Number(feeStruct.tuition_fee || 0) +
      Number(feeStruct.admission_fee || 0) +
      Number(feeStruct.exam_fee || 0) +
      Number(feeStruct.lab_library_fee || 0) +
      Number(feeStruct.other_fee || 0);

    const newStruct: FeeStructure = {
      ...feeStruct,
      id: crypto.randomUUID(),
      total_fee,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('fee_structures').insert(newStruct).select().single();
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase insert fee structure failed:', e);
      }
    }

    const current = getLocalData<FeeStructure[]>(STORAGE_KEYS.FEE_STRUCTURES, INITIAL_FEE_STRUCTURES);
    const updated = [newStruct, ...current];
    setLocalData(STORAGE_KEYS.FEE_STRUCTURES, updated);
    return newStruct;
  },

  // STUDENTS
  async getStudents(): Promise<Student[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('students')
          .select('*, course:courses(*), batch:batches(*)')
          .order('created_at', { ascending: false });
        if (!error && data && data.length > 0) return data;
      } catch (e) {
        console.warn('Supabase fetch students failed:', e);
      }
    }

    const courses = await this.getCourses();
    const batches = await this.getBatches();
    const students = getLocalData<Student[]>(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);

    return students.map(s => ({
      ...s,
      course: courses.find(c => c.id === s.course_id),
      batch: batches.find(b => b.id === s.batch_id),
    }));
  },

  async getStudentById(id: string): Promise<Student | null> {
    const students = await this.getStudents();
    return students.find(s => s.id === id) || null;
  },

  async addStudent(studentData: Omit<Student, 'id' | 'paid_amount' | 'balance_amount' | 'payment_status'>): Promise<Student> {
    const gross_fee = Number(studentData.gross_fee) || 0;
    const discount_amount = Number(studentData.discount_amount) || 0;
    const net_fee = Math.max(gross_fee - discount_amount, 0);
    const paid_amount = 0;
    const balance_amount = net_fee;
    const payment_status = calculatePaymentStatus(paid_amount, net_fee, studentData.due_date);

    const newStudent: Student = {
      ...studentData,
      id: crypto.randomUUID(),
      gross_fee,
      discount_amount,
      net_fee,
      paid_amount,
      balance_amount,
      payment_status,
      created_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.from('students').insert(newStudent).select().single();
        if (!error && data) return data;
      } catch (e) {
        console.warn('Supabase insert student failed:', e);
      }
    }

    const current = getLocalData<Student[]>(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
    const updated = [newStudent, ...current];
    setLocalData(STORAGE_KEYS.STUDENTS, updated);
    return newStudent;
  },

  async updateStudent(id: string, updates: Partial<Student>): Promise<Student | null> {
    const currentStudents = getLocalData<Student[]>(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
    const index = currentStudents.findIndex(s => s.id === id);
    if (index === -1) return null;

    const existing = currentStudents[index];
    const gross_fee = updates.gross_fee !== undefined ? Number(updates.gross_fee) : existing.gross_fee;
    const discount_amount = updates.discount_amount !== undefined ? Number(updates.discount_amount) : existing.discount_amount;
    const net_fee = Math.max(gross_fee - discount_amount, 0);
    const paid_amount = updates.paid_amount !== undefined ? Number(updates.paid_amount) : existing.paid_amount;
    const balance_amount = Math.max(net_fee - paid_amount, 0);
    const due_date = updates.due_date !== undefined ? updates.due_date : existing.due_date;
    const payment_status = calculatePaymentStatus(paid_amount, net_fee, due_date);

    const updatedStudent: Student = {
      ...existing,
      ...updates,
      gross_fee,
      discount_amount,
      net_fee,
      paid_amount,
      balance_amount,
      payment_status,
    };

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('students').update(updatedStudent).eq('id', id);
      } catch (e) {
        console.warn('Supabase update student failed:', e);
      }
    }

    currentStudents[index] = updatedStudent;
    setLocalData(STORAGE_KEYS.STUDENTS, currentStudents);
    return updatedStudent;
  },

  // PAYMENTS
  async getPayments(): Promise<Payment[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('payments')
          .select('*, student:students(*, course:courses(*), batch:batches(*))')
          .order('payment_date', { ascending: false });
        if (!error && data && data.length > 0) return data;
      } catch (e) {
        console.warn('Supabase fetch payments failed:', e);
      }
    }

    const students = await this.getStudents();
    const payments = getLocalData<Payment[]>(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS);

    return payments.map(p => ({
      ...p,
      student: students.find(s => s.id === p.student_id),
    }));
  },

  async recordPayment(paymentData: {
    student_id: string;
    amount: number;
    payment_method: Payment['payment_method'];
    payment_date: string;
    transaction_id?: string;
    remarks?: string;
    recorded_by?: string;
  }): Promise<{ payment: Payment; student: Student }> {
    const receipt_number = generateReceiptNumber();
    const newPayment: Payment = {
      ...paymentData,
      id: crypto.randomUUID(),
      receipt_number,
      created_at: new Date().toISOString(),
    };

    // Recalculate student balance
    const currentStudents = getLocalData<Student[]>(STORAGE_KEYS.STUDENTS, INITIAL_STUDENTS);
    const studentIndex = currentStudents.findIndex(s => s.id === paymentData.student_id);

    if (studentIndex === -1) {
      throw new Error('Student not found');
    }

    const student = currentStudents[studentIndex];
    const newPaidAmount = Number(student.paid_amount) + Number(paymentData.amount);
    const newBalanceAmount = Math.max(Number(student.net_fee) - newPaidAmount, 0);
    const newStatus = calculatePaymentStatus(newPaidAmount, student.net_fee, student.due_date);

    const updatedStudent: Student = {
      ...student,
      paid_amount: newPaidAmount,
      balance_amount: newBalanceAmount,
      payment_status: newStatus,
    };

    currentStudents[studentIndex] = updatedStudent;
    setLocalData(STORAGE_KEYS.STUDENTS, currentStudents);

    const currentPayments = getLocalData<Payment[]>(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS);
    const updatedPayments = [newPayment, ...currentPayments];
    setLocalData(STORAGE_KEYS.PAYMENTS, updatedPayments);

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('payments').insert(newPayment);
        await supabase.from('students').update({
          paid_amount: newPaidAmount,
          balance_amount: newBalanceAmount,
          payment_status: newStatus,
        }).eq('id', student.id);
      } catch (e) {
        console.warn('Supabase record payment sync failed:', e);
      }
    }

    newPayment.student = updatedStudent;
    return { payment: newPayment, student: updatedStudent };
  },

  // REMINDERS
  async getReminders(): Promise<ReminderLog[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase
          .from('reminders')
          .select('*, student:students(*)')
          .order('sent_at', { ascending: false });
        if (!error && data && data.length > 0) return data;
      } catch (e) {
        console.warn('Supabase fetch reminders failed:', e);
      }
    }
    const students = await this.getStudents();
    const reminders = getLocalData<ReminderLog[]>(STORAGE_KEYS.REMINDERS, INITIAL_REMINDERS);
    return reminders.map(r => ({
      ...r,
      student: students.find(s => s.id === r.student_id),
    }));
  },

  async logReminder(reminder: Omit<ReminderLog, 'id' | 'sent_at'>): Promise<ReminderLog> {
    const newReminder: ReminderLog = {
      ...reminder,
      id: crypto.randomUUID(),
      sent_at: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('reminders').insert(newReminder);
      } catch (e) {
        console.warn('Supabase log reminder failed:', e);
      }
    }

    const current = getLocalData<ReminderLog[]>(STORAGE_KEYS.REMINDERS, INITIAL_REMINDERS);
    const updated = [newReminder, ...current];
    setLocalData(STORAGE_KEYS.REMINDERS, updated);
    return newReminder;
  },

  // DASHBOARD METRICS
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const students = await this.getStudents();
    const payments = await this.getPayments();

    const totalStudents = students.length;
    const totalCollected = payments.reduce((acc, p) => acc + Number(p.amount || 0), 0);
    const totalPending = students.reduce((acc, s) => acc + Number(s.balance_amount || 0), 0);

    const overdueStudents = students.filter(s => s.payment_status === 'overdue');
    const totalOverdue = overdueStudents.reduce((acc, s) => acc + Number(s.balance_amount || 0), 0);

    // This month's collection
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const collectedThisMonth = payments
      .filter(p => {
        const pDate = new Date(p.payment_date);
        return pDate.getMonth() === currentMonth && pDate.getFullYear() === currentYear;
      })
      .reduce((acc, p) => acc + Number(p.amount || 0), 0);

    const paidStudentsCount = students.filter(s => s.payment_status === 'paid').length;
    const partialStudentsCount = students.filter(s => s.payment_status === 'partial').length;
    const pendingStudentsCount = students.filter(s => s.payment_status === 'pending').length;
    const overdueStudentsCount = overdueStudents.length;

    const urgentDueStudents = students
      .filter(s => s.payment_status === 'overdue' || (s.balance_amount > 0 && s.due_date))
      .sort((a, b) => (new Date(a.due_date || '2099-01-01').getTime() - new Date(b.due_date || '2099-01-01').getTime()))
      .slice(0, 5);

    const recentPayments = payments.slice(0, 6);

    return {
      totalStudents,
      totalCollected,
      totalPending,
      totalOverdue,
      collectedThisMonth,
      paidStudentsCount,
      partialStudentsCount,
      pendingStudentsCount,
      overdueStudentsCount,
      recentPayments,
      urgentDueStudents,
    };
  },

  // Reset to initial demo data
  resetDemoData(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEYS.COURSES);
      localStorage.removeItem(STORAGE_KEYS.BATCHES);
      localStorage.removeItem(STORAGE_KEYS.FEE_STRUCTURES);
      localStorage.removeItem(STORAGE_KEYS.STUDENTS);
      localStorage.removeItem(STORAGE_KEYS.PAYMENTS);
      localStorage.removeItem(STORAGE_KEYS.REMINDERS);
      window.location.reload();
    }
  },
};
