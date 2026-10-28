'use client';

import * as React from 'react';
import { Student } from '@/types';
import { DataService } from '@/lib/storage';
import { formatCurrency, formatDate, getStatusBadgeClass } from '@/lib/utils';
import { RecordPaymentModal } from '@/components/payments/RecordPaymentModal';
import { SendReminderModal } from '@/components/reminders/SendReminderModal';
import { StudentDetailModal } from '@/components/students/StudentDetailModal';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Clock, Receipt, Mail, Eye, Calendar } from 'lucide-react';
import { differenceInDays, parseISO } from 'date-fns';

export default function PendingFeesPage() {
  const [students, setStudents] = React.useState<Student[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [filterType, setFilterType] = React.useState<'all' | 'overdue' | 'partial'>('all');

  // Modals
  const [selectedStudentForDetail, setSelectedStudentForDetail] = React.useState<Student | null>(null);
  const [selectedStudentForPayment, setSelectedStudentForPayment] = React.useState<Student | null>(null);
  const [selectedStudentForReminder, setSelectedStudentForReminder] = React.useState<Student | null>(null);
  const [isPaymentOpen, setIsPaymentOpen] = React.useState(false);
  const [isReminderOpen, setIsReminderOpen] = React.useState(false);

  const loadStudents = React.useCallback(async () => {
    try {
      const all = await DataService.getStudents();
      setStudents(all.filter((s) => s.balance_amount > 0));
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadStudents();
    const handleUpdate = () => loadStudents();
    window.addEventListener('sfms_data_updated', handleUpdate);
    return () => window.removeEventListener('sfms_data_updated', handleUpdate);
  }, [loadStudents]);

  const overdueList = students.filter((s) => s.payment_status === 'overdue');
  const partialList = students.filter((s) => s.payment_status === 'partial');

  const filtered = React.useMemo(() => {
    if (filterType === 'overdue') return overdueList;
    if (filterType === 'partial') return partialList;
    return students;
  }, [students, filterType, overdueList, partialList]);

  const totalOutstanding = filtered.reduce((acc, s) => acc + Number(s.balance_amount || 0), 0);
  const totalOverdue = overdueList.reduce((acc, s) => acc + Number(s.balance_amount || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Pending Fee Records & Aging
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track unpaid balances, overdue aging periods, and dispatch automated recovery notices.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              filterType === 'all'
                ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            All Pending ({students.length})
          </button>
          <button
            onClick={() => setFilterType('overdue')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              filterType === 'overdue'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'text-rose-600 dark:text-rose-400'
            }`}
          >
            Overdue Only ({overdueList.length})
          </button>
          <button
            onClick={() => setFilterType('partial')}
            className={`px-3 py-1.5 rounded-md font-medium transition-all ${
              filterType === 'partial'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-amber-600 dark:text-amber-400'
            }`}
          >
            Partial Paid ({partialList.length})
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Total Pending Filtered
          </span>
          <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
            {formatCurrency(totalOutstanding)}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">{filtered.length} student ledgers</p>
        </Card>

        <Card className="p-4 border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20">
          <span className="text-[11px] font-semibold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
            Total Overdue Backlog
          </span>
          <p className="text-xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">
            {formatCurrency(totalOverdue)}
          </p>
          <p className="text-[11px] text-rose-700 dark:text-rose-500 mt-0.5">
            {overdueList.length} past statutory deadline
          </p>
        </Card>

        <Card className="p-4">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Average Outstanding per Student
          </span>
          <p className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
            {formatCurrency(filtered.length > 0 ? totalOutstanding / filtered.length : 0)}
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">Weighted average</p>
        </Card>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3.5 pl-4">Student & Roll No</th>
                <th className="p-3.5">Course / Batch</th>
                <th className="p-3.5 text-right">Net Fee</th>
                <th className="p-3.5 text-right">Paid</th>
                <th className="p-3.5 text-right">Balance Due</th>
                <th className="p-3.5 text-center">Status</th>
                <th className="p-3.5">Due Date & Aging</th>
                <th className="p-3.5 pr-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    No pending fees recorded under this filter.
                  </td>
                </tr>
              ) : (
                filtered.map((student) => {
                  const badge = getStatusBadgeClass(student.payment_status);
                  let overdueDays = 0;
                  if (student.due_date) {
                    try {
                      overdueDays = differenceInDays(new Date(), parseISO(student.due_date));
                    } catch {}
                  }

                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="p-3.5 pl-4">
                        <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                          {student.first_name} {student.last_name}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {student.roll_number}
                        </div>
                      </td>

                      <td className="p-3.5">
                        <div className="text-slate-800 dark:text-slate-200">
                          {student.course?.code}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[130px]">
                          {student.batch?.name}
                        </div>
                      </td>

                      <td className="p-3.5 text-right text-slate-600 dark:text-slate-400">
                        {formatCurrency(student.net_fee)}
                      </td>

                      <td className="p-3.5 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(student.paid_amount)}
                      </td>

                      <td className="p-3.5 text-right font-extrabold text-rose-600 dark:text-rose-400 text-sm">
                        {formatCurrency(student.balance_amount)}
                      </td>

                      <td className="p-3.5 text-center">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${badge.bg} ${badge.border}`}
                        >
                          {student.payment_status}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <div className="text-slate-700 dark:text-slate-300">
                          {formatDate(student.due_date)}
                        </div>
                        {overdueDays > 0 ? (
                          <span className="text-[10px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/60 px-1.5 py-0.5 rounded">
                            {overdueDays} days overdue
                          </span>
                        ) : student.due_date ? (
                          <span className="text-[10px] text-slate-400">
                            {Math.abs(overdueDays)} days left
                          </span>
                        ) : null}
                      </td>

                      <td className="p-3.5 pr-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-xs"
                            onClick={() => setSelectedStudentForDetail(student)}
                            title="View Student"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>

                          <Button
                            size="sm"
                            className="h-8 px-2.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
                            onClick={() => {
                              setSelectedStudentForPayment(student);
                              setIsPaymentOpen(true);
                            }}
                          >
                            <Receipt className="h-3 w-3 mr-1" />
                            Collect
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-2 text-xs border-amber-300 text-amber-700 hover:bg-amber-50"
                            onClick={() => {
                              setSelectedStudentForReminder(student);
                              setIsReminderOpen(true);
                            }}
                            title="Send Resend Email Reminder"
                          >
                            <Mail className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <StudentDetailModal
        student={selectedStudentForDetail}
        isOpen={Boolean(selectedStudentForDetail)}
        onClose={() => setSelectedStudentForDetail(null)}
        onRecordPaymentClick={(s) => {
          setSelectedStudentForPayment(s);
          setIsPaymentOpen(true);
        }}
        onSendReminderClick={(s) => {
          setSelectedStudentForReminder(s);
          setIsReminderOpen(true);
        }}
      />

      <RecordPaymentModal
        isOpen={isPaymentOpen}
        onClose={() => {
          setIsPaymentOpen(false);
          setSelectedStudentForPayment(null);
        }}
        preSelectedStudent={selectedStudentForPayment}
        onPaymentRecorded={() => loadStudents()}
      />

      <SendReminderModal
        student={selectedStudentForReminder}
        isOpen={isReminderOpen}
        onClose={() => {
          setIsReminderOpen(false);
          setSelectedStudentForReminder(null);
        }}
        onReminderSent={() => loadStudents()}
      />
    </div>
  );
}
