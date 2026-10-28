'use client';

import * as React from 'react';
import Link from 'next/link';
import { StudentTable } from '@/components/students/StudentTable';
import { StudentDetailModal } from '@/components/students/StudentDetailModal';
import { StudentFormModal } from '@/components/students/StudentFormModal';
import { RecordPaymentModal } from '@/components/payments/RecordPaymentModal';
import { SendReminderModal } from '@/components/reminders/SendReminderModal';
import { Button } from '@/components/ui/button';
import { PlusCircle, Download } from 'lucide-react';
import { Student, Course, Batch } from '@/types';
import { DataService } from '@/lib/storage';

export default function StudentsPage() {
  const [students, setStudents] = React.useState<Student[]>([]);
  const [courses, setCourses] = React.useState<Course[]>([]);
  const [batches, setBatches] = React.useState<Batch[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Modals state
  const [selectedStudentForDetail, setSelectedStudentForDetail] =
    React.useState<Student | null>(null);
  const [studentToEdit, setStudentToEdit] = React.useState<Student | null>(null);
  const [isFormOpen, setIsFormOpen] = React.useState(false);
  const [studentForPayment, setStudentForPayment] = React.useState<Student | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = React.useState(false);
  const [studentForReminder, setStudentForReminder] = React.useState<Student | null>(null);
  const [isReminderOpen, setIsReminderOpen] = React.useState(false);

  const loadData = React.useCallback(async () => {
    try {
      const s = await DataService.getStudents();
      const c = await DataService.getCourses();
      const b = await DataService.getBatches();
      setStudents(s);
      setCourses(c);
      setBatches(b);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
    const handleUpdate = () => loadData();
    window.addEventListener('sfms_data_updated', handleUpdate);
    return () => window.removeEventListener('sfms_data_updated', handleUpdate);
  }, [loadData]);

  const handleExportStudentsCsv = () => {
    if (students.length === 0) return;
    const headers = [
      'Roll Number',
      'First Name',
      'Last Name',
      'Email',
      'Phone',
      'Course',
      'Batch',
      'Net Fee',
      'Paid Amount',
      'Balance',
      'Status',
      'Due Date',
    ];

    const rows = students.map((s) => [
      s.roll_number,
      `"${s.first_name}"`,
      `"${s.last_name}"`,
      s.email,
      s.phone,
      `"${s.course?.code || ''}"`,
      `"${s.batch?.name || ''}"`,
      s.net_fee,
      s.paid_amount,
      s.balance_amount,
      s.payment_status,
      s.due_date || '',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const link = document.createElement('a');
    link.href = encodeURI(csvContent);
    link.download = `students_fee_roster_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200">
              Khush Classes
            </span>
            <span className="text-xs text-slate-400 font-medium">Students Directory</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Student Fee Registry & Admissions (₹)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Search student profiles, track Indian Rupee fee ledger balances, and record payments.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportStudentsCsv}
            className="gap-2 text-xs font-semibold"
          >
            <Download className="h-3.5 w-3.5" />
            Export Roster
          </Button>

          <Link href="/students/new">
            <Button
              size="sm"
              className="gap-2 text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md shadow-emerald-600/20"
            >
              <PlusCircle className="h-4 w-4" />
              Add Student (Process Wizard)
            </Button>
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 text-xs">Loading students roster...</div>
      ) : (
        <StudentTable
          students={students}
          courses={courses}
          batches={batches}
          onSelectStudent={(s) => setSelectedStudentForDetail(s)}
          onRecordPayment={(s) => {
            setStudentForPayment(s);
            setIsPaymentOpen(true);
          }}
          onSendReminder={(s) => {
            setStudentForReminder(s);
            setIsReminderOpen(true);
          }}
          onEditStudent={(s) => {
            setStudentToEdit(s);
            setIsFormOpen(true);
          }}
        />
      )}

      {/* Modals */}
      <StudentDetailModal
        student={selectedStudentForDetail}
        isOpen={Boolean(selectedStudentForDetail)}
        onClose={() => setSelectedStudentForDetail(null)}
        onRecordPaymentClick={(s) => {
          setStudentForPayment(s);
          setIsPaymentOpen(true);
        }}
        onSendReminderClick={(s) => {
          setStudentForReminder(s);
          setIsReminderOpen(true);
        }}
      />

      <StudentFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setStudentToEdit(null);
        }}
        editStudent={studentToEdit}
        onStudentSaved={() => loadData()}
      />

      <RecordPaymentModal
        isOpen={isPaymentOpen}
        onClose={() => {
          setIsPaymentOpen(false);
          setStudentForPayment(null);
        }}
        preSelectedStudent={studentForPayment}
        onPaymentRecorded={() => loadData()}
      />

      <SendReminderModal
        student={studentForReminder}
        isOpen={isReminderOpen}
        onClose={() => {
          setIsReminderOpen(false);
          setStudentForReminder(null);
        }}
        onReminderSent={() => loadData()}
      />
    </div>
  );
}

