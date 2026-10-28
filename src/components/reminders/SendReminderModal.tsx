'use client';

import * as React from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Student } from '@/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { DataService } from '@/lib/storage';
import { Mail, CheckCircle2, AlertTriangle, Send } from 'lucide-react';

interface SendReminderModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onReminderSent?: () => void;
}

export function SendReminderModal({
  student,
  isOpen,
  onClose,
  onReminderSent,
}: SendReminderModalProps) {
  const [recipientEmail, setRecipientEmail] = React.useState('');
  const [customMessage, setCustomMessage] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [resultStatus, setResultStatus] = React.useState<{
    success: boolean;
    message: string;
  } | null>(null);

  React.useEffect(() => {
    if (student) {
      setRecipientEmail(student.email);
      setCustomMessage(
        `Please ensure clearance of pending balance of ${formatCurrency(student.balance_amount)} on or before ${formatDate(student.due_date)} to avoid registration hold.`
      );
      setResultStatus(null);
    }
  }, [student, isOpen]);

  if (!student) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recipientEmail) return;

    setLoading(true);
    try {
      const response = await fetch('/api/reminders/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: student.id,
          toEmail: recipientEmail,
          studentName: `${student.first_name} ${student.last_name}`,
          rollNumber: student.roll_number,
          courseName: student.course?.name || 'Academic Degree',
          amountDue: student.balance_amount,
          dueDate: student.due_date,
          customMessage,
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Also log locally
        await DataService.logReminder({
          student_id: student.id,
          recipient_email: recipientEmail,
          amount_due: student.balance_amount,
          due_date: student.due_date,
          subject: `Pending Fee Due Reminder (${student.roll_number})`,
          status: 'sent',
          resend_email_id: data.id,
        });

        setResultStatus({
          success: true,
          message: `Official Fee Due Reminder successfully dispatched to ${recipientEmail}`,
        });

        if (onReminderSent) onReminderSent();
      } else {
        setResultStatus({
          success: false,
          message: data.error || 'Failed to send reminder email.',
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Network error';
      setResultStatus({
        success: false,
        message: msg,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Send Fee Due Reminder"
      description={`Dispatches an official notification via Resend to ${student.first_name} ${student.last_name}.`}
      maxWidth="md"
    >
      {resultStatus ? (
        <div className="space-y-5 text-center py-4">
          <div
            className={`mx-auto h-14 w-14 rounded-full flex items-center justify-center ${
              resultStatus.success
                ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/60'
                : 'bg-rose-100 text-rose-600 dark:bg-rose-950/60'
            }`}
          >
            {resultStatus.success ? (
              <CheckCircle2 className="h-8 w-8" />
            ) : (
              <AlertTriangle className="h-8 w-8" />
            )}
          </div>

          <div>
            <h4 className="text-base font-bold text-slate-900 dark:text-white">
              {resultStatus.success ? 'Email Dispatched' : 'Notification Failed'}
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {resultStatus.message}
            </p>
          </div>

          <Button onClick={onClose} className="w-full">
            Done
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSend} className="space-y-4">
          {/* Due Info Card */}
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 flex items-center justify-between text-xs">
            <div>
              <span className="text-rose-600 dark:text-rose-400 font-semibold uppercase tracking-wider block text-[10px]">
                Pending Due
              </span>
              <span className="text-lg font-extrabold text-rose-700 dark:text-rose-300">
                {formatCurrency(student.balance_amount)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-rose-600 dark:text-rose-400 font-semibold uppercase tracking-wider block text-[10px]">
                Due Date
              </span>
              <span className="font-semibold text-rose-800 dark:text-rose-200">
                {formatDate(student.due_date)}
              </span>
            </div>
          </div>

          <Input
            label="Recipient Email"
            type="email"
            required
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Personalized Accounts Note
            </label>
            <textarea
              className="w-full rounded-lg border border-slate-200 bg-white p-3 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 dark:border-slate-800 dark:bg-slate-950"
              rows={3}
              value={customMessage}
              onChange={(e) => setCustomMessage(e.target.value)}
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-rose-600 hover:bg-rose-700 text-white gap-2"
            >
              <Send className="h-3.5 w-3.5" />
              {loading ? 'Sending...' : 'Send Reminder'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}

