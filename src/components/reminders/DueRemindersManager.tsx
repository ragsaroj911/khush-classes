'use client';

import * as React from 'react';
import { Student, ReminderLog } from '@/types';
import { DataService } from '@/lib/storage';
import { formatCurrency, formatDate, getStatusBadgeClass } from '@/lib/utils';
import { SendReminderModal } from './SendReminderModal';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Mail, Send, CheckCircle2, AlertCircle, History, Sparkles, Clock } from 'lucide-react';

export function DueRemindersManager() {
  const [students, setStudents] = React.useState<Student[]>([]);
  const [reminders, setReminders] = React.useState<ReminderLog[]>([]);
  const [selectedStudentForReminder, setSelectedStudentForReminder] =
    React.useState<Student | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [bulkSending, setBulkSending] = React.useState(false);
  const [bulkProgress, setBulkProgress] = React.useState('');

  const loadData = React.useCallback(async () => {
    const s = await DataService.getStudents();
    const r = await DataService.getReminders();
    setStudents(s);
    setReminders(r);
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  // Students with pending or overdue fees
  const pendingStudents = students.filter(
    (s) => s.balance_amount > 0 && (s.payment_status === 'overdue' || s.payment_status === 'partial' || s.payment_status === 'pending')
  );

  const overdueOnly = students.filter((s) => s.payment_status === 'overdue');

  const handleBulkSend = async () => {
    if (overdueOnly.length === 0) {
      alert('No students currently flagged as overdue.');
      return;
    }

    const confirmBulk = window.confirm(
      `Send automated fee due reminders to all ${overdueOnly.length} overdue students via Resend?`
    );
    if (!confirmBulk) return;

    setBulkSending(true);
    let successCount = 0;

    for (let i = 0; i < overdueOnly.length; i++) {
      const student = overdueOnly[i];
      setBulkProgress(`Sending reminder ${i + 1} of ${overdueOnly.length} (${student.roll_number})...`);

      try {
        const response = await fetch('/api/reminders/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            studentId: student.id,
            toEmail: student.email,
            studentName: `${student.first_name} ${student.last_name}`,
            rollNumber: student.roll_number,
            courseName: student.course?.name || 'Academic Course',
            amountDue: student.balance_amount,
            dueDate: student.due_date,
            customMessage: `Automated urgent reminder: Academic fee balance of ${formatCurrency(student.balance_amount)} was due on ${formatDate(student.due_date)}.`,
          }),
        });

        const data = await response.json();
        if (data.success) {
          successCount++;
          await DataService.logReminder({
            student_id: student.id,
            recipient_email: student.email,
            amount_due: student.balance_amount,
            due_date: student.due_date,
            subject: `Automated Overdue Notice (${student.roll_number})`,
            status: 'sent',
            resend_email_id: data.id,
          });
        }
      } catch (err) {
        console.error('Bulk error for student', student.roll_number, err);
      }
    }

    setBulkSending(false);
    setBulkProgress('');
    alert(`Bulk reminder operation completed. Successfully notified ${successCount} students.`);
    loadData();
  };

  return (
    <div className="space-y-8">
      {/* Top Banner and Bulk Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200">
              Khush Classes
            </span>
            <span className="text-xs text-slate-400 font-medium">Email Dispatcher</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            Fee Due Reminders & Automated Notices (₹)
          </h2>
          <p className="text-sm text-slate-500">
            Dispatch personalized Indian Rupee fee notices and payment links powered by Resend.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            size="sm"
            onClick={handleBulkSend}
            disabled={bulkSending || overdueOnly.length === 0}
            className="gap-2 bg-rose-600 hover:bg-rose-700 text-white"
          >
            <Send className="h-4 w-4" />
            {bulkSending
              ? bulkProgress
              : `Send All Overdue Reminders (${overdueOnly.length})`}
          </Button>
        </div>
      </div>

      {/* Due Students Queue */}
      <Card>
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4 text-rose-500" />
              Pending & Overdue Receivables ({pendingStudents.length})
            </CardTitle>
            <p className="text-xs text-slate-500 mt-1">
              Students requiring fee settlement. Trigger one-click notification below.
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3.5 pl-4">Student & ID</th>
                  <th className="p-3.5">Course / Batch</th>
                  <th className="p-3.5 text-right">Balance Due</th>
                  <th className="p-3.5 text-center">Status</th>
                  <th className="p-3.5">Due Date</th>
                  <th className="p-3.5">Email Address</th>
                  <th className="p-3.5 pr-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {pendingStudents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      No students with outstanding fee balances! All accounts settled.
                    </td>
                  </tr>
                ) : (
                  pendingStudents.map((student) => {
                    const badge = getStatusBadgeClass(student.payment_status);
                    return (
                      <tr
                        key={student.id}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40"
                      >
                        <td className="p-3.5 pl-4">
                          <div className="font-semibold text-slate-900 dark:text-slate-100">
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
                          <div className="text-[11px] text-slate-500 truncate max-w-[140px]">
                            {student.batch?.name}
                          </div>
                        </td>

                        <td className="p-3.5 text-right font-bold text-rose-600 dark:text-rose-400 text-sm">
                          {formatCurrency(student.balance_amount)}
                        </td>

                        <td className="p-3.5 text-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${badge.bg} ${badge.border}`}
                          >
                            {student.payment_status}
                          </span>
                        </td>

                        <td className="p-3.5 text-slate-600 dark:text-slate-400">
                          {formatDate(student.due_date)}
                        </td>

                        <td className="p-3.5 text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                          {student.email}
                        </td>

                        <td className="p-3.5 pr-4 text-right">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-2.5 text-xs gap-1.5 border-rose-200 text-rose-700 hover:bg-rose-50 dark:border-rose-900/60 dark:text-rose-400"
                            onClick={() => {
                              setSelectedStudentForReminder(student);
                              setIsModalOpen(true);
                            }}
                          >
                            <Mail className="h-3.5 w-3.5" />
                            Send Notice
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Dispatched Reminders History Ledger */}
      <Card>
        <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <History className="h-4 w-4 text-slate-400" />
              Sent Reminders Audit Trail ({reminders.length})
            </CardTitle>
            <p className="text-xs text-slate-500 mt-1">
              Log of dispatched email notices with timestamps and Resend IDs.
            </p>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3.5 pl-4">Timestamp</th>
                  <th className="p-3.5">Recipient Email</th>
                  <th className="p-3.5">Subject</th>
                  <th className="p-3.5 text-right">Amount Due</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 pr-4">Resend Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {reminders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      No reminder emails sent yet.
                    </td>
                  </tr>
                ) : (
                  reminders.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                      <td className="p-3.5 pl-4 text-slate-600 dark:text-slate-400">
                        {formatDate(log.sent_at, 'dd MMM yyyy, hh:mm a')}
                      </td>
                      <td className="p-3.5 font-mono text-slate-900 dark:text-slate-200">
                        {log.recipient_email}
                      </td>
                      <td className="p-3.5 text-slate-700 dark:text-slate-300 max-w-[240px] truncate">
                        {log.subject}
                      </td>
                      <td className="p-3.5 text-right font-bold text-rose-600 dark:text-rose-400">
                        {formatCurrency(log.amount_due)}
                      </td>
                      <td className="p-3.5">
                        <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold uppercase text-[10px] bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                          <CheckCircle2 className="h-3 w-3" />
                          Delivered
                        </span>
                      </td>
                      <td className="p-3.5 pr-4 text-slate-400 font-mono text-[11px]">
                        {log.resend_email_id || 're_mock_id'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Reminder Modal */}
      <SendReminderModal
        student={selectedStudentForReminder}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedStudentForReminder(null);
        }}
        onReminderSent={() => {
          loadData();
        }}
      />
    </div>
  );
}

