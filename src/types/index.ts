export type PaymentStatus = 'paid' | 'partial' | 'pending' | 'overdue';
export type PaymentMethod = 'upi' | 'cash' | 'card' | 'bank_transfer' | 'cheque';
export type StudentStatus = 'active' | 'graduated' | 'suspended';

export interface Course {
  id: string;
  code: string;
  name: string;
  description?: string;
  duration: string;
  default_total_fee: number;
  is_active: boolean;
  created_at?: string;
}

export interface Batch {
  id: string;
  course_id: string;
  name: string;
  academic_year: string;
  start_date: string;
  end_date: string;
  max_capacity: number;
  is_active: boolean;
  created_at?: string;
  course?: Course;
}

export interface FeeStructure {
  id: string;
  course_id: string;
  title: string;
  tuition_fee: number;
  admission_fee: number;
  exam_fee: number;
  lab_library_fee: number;
  other_fee: number;
  total_fee?: number;
  created_at?: string;
}

export interface Student {
  id: string;
  roll_number: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  parent_name?: string;
  parent_phone?: string;
  parent_email?: string;
  course_id: string;
  batch_id: string;
  admission_date: string;
  gross_fee: number;
  discount_amount: number;
  discount_reason?: string;
  net_fee: number;
  paid_amount: number;
  balance_amount: number;
  payment_status: PaymentStatus;
  due_date?: string;
  student_status: StudentStatus;
  notes?: string;
  created_at?: string;
  course?: Course;
  batch?: Batch;
}

export interface Payment {
  id: string;
  receipt_number: string;
  student_id: string;
  amount: number;
  payment_method: PaymentMethod;
  payment_date: string;
  transaction_id?: string;
  remarks?: string;
  recorded_by?: string;
  created_at?: string;
  student?: Student;
}

export interface ReminderLog {
  id: string;
  student_id: string;
  recipient_email: string;
  amount_due: number;
  due_date?: string;
  subject: string;
  status: 'sent' | 'failed';
  resend_email_id?: string;
  sent_at: string;
  student?: Student;
}

export interface DashboardMetrics {
  totalStudents: number;
  totalCollected: number;
  totalPending: number;
  totalOverdue: number;
  collectedThisMonth: number;
  paidStudentsCount: number;
  partialStudentsCount: number;
  pendingStudentsCount: number;
  overdueStudentsCount: number;
  recentPayments: Payment[];
  urgentDueStudents: Student[];
}
