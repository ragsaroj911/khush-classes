'use client';

import * as React from 'react';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Student, Payment } from '@/types';
import { DataService } from '@/lib/storage';
import { formatCurrency, formatDate, getStatusBadgeClass, getPaymentMethodLabel } from '@/lib/utils';
import { generateReceiptPdf } from '@/lib/receipt-generator';
import { Receipt, Mail, Download, Phone, Calendar, BookOpen, AlertCircle, CheckCircle2 } from 'lucide-react';

interface StudentDetailModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onRecordPaymentClick?: (student: Student) => void;
  onSendReminderClick?: (student: Student) => void;
}

export function StudentDetailModal({
  student,
  isOpen,
  onClose,
  onRecordPaymentClick,
  onSendReminderClick,
}: StudentDetailModalProps) {
  const [payments, setPayments] = React.useState<Payment[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    async function loadPayments() {
      if (!student) return;
      setLoading(true);
      const allPayments = await DataService.getPayments();
      setPayments(allPayments.filter((p) => p.student_id === student.id));
      setLoading(false);
    }

    if (isOpen && student) {
      loadPayments();
    }
  }, [isOpen, student]);

  if (!student) return null;

  const badgeTheme = getStatusBadgeClass(student.payment_status);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${student.first_name} ${student.last_name}`}
      description={`Roll No: ${student.roll_number} • ${student.course?.name || 'Academic Course'}`}
      maxWidth="3xl"
    >
      <div className="space-y-6">
        {/* Top Summary Banner */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Total Course Fee
            </p>
            <p className="text-base font-bold text-slate-900 dark:text-white mt-1">
              {formatCurrency(student.net_fee)}
            </p>
            {student.discount_amount > 0 && (
              <p className="text-[11px] text-emerald-600 font-medium">
                Discount: {formatCurrency(student.discount_amount)}
              </p>
            )}
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Total Paid
            </p>
            <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {formatCurrency(student.paid_amount)}
            </p>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Balance Remaining
            </p>
            <p className="text-base font-bold text-rose-600 dark:text-rose-400 mt-1">
              {formatCurrency(student.balance_amount)}
            </p>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              Payment Status
            </p>
            <div className="mt-1">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border ${badgeTheme.bg} ${badgeTheme.border}`}
              >
                {student.payment_status}
              </span>
            </div>
            {student.due_date && (
              <p className="text-[11px] text-slate-500 mt-1">Due: {formatDate(student.due_date)}</p>
            )}
          </div>
        </div>

        {/* Action Buttons Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <div className="flex items-center gap-2">
            {student.balance_amount > 0 && onRecordPaymentClick && (
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                onClick={() => {
                  onClose();
                  onRecordPaymentClick(student);
                }}
              >
                <Receipt className="h-3.5 w-3.5" />
                Record Payment
              </Button>
            )}

            {student.balance_amount > 0 && onSendReminderClick && (
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 border-amber-300 text-amber-800 hover:bg-amber-50 dark:border-amber-700 dark:text-amber-400"
                onClick={() => {
                  onClose();
                  onSendReminderClick(student);
                }}
              >
                <Mail className="h-3.5 w-3.5" />
                Send Due Reminder
              </Button>
            )}
          </div>
        </div>

        {/* Detailed Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="rounded-xl border border-slate-100 dark:border-slate-800 p-4 space-y-2">
            <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm mb-2 flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-slate-400" />
              Enrollment Details
            </h4>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Course:</span>
              <span className="font-medium text-slate-900 dark:text-slate-100">
                {student.course?.name} ({student.course?.code})
              </span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Batch:</span>
              <span className="font-medium text-slate-900 dark:text-slate-100">
                {student.batch?.name} ({student.batch?.academic_year})
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Admission Date:</span>
              <span className="font-medium text-slate-900 dark:text-slate-100">
                {formatDate(student.admission_date)}
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-slate-100 dark:border-slate-800 p-4 space-y-2">
            <h4 className="font-semibold text-slate-800 dark:text-slate-200 text-sm mb-2 flex items-center gap-2">
              <Phone className="h-4 w-4 text-slate-400" />
              Contact Information
            </h4>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Student Email:</span>
              <span className="font-medium text-slate-900 dark:text-slate-100">{student.email}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Student Phone:</span>
              <span className="font-medium text-slate-900 dark:text-slate-100">{student.phone}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500">Parent / Guardian:</span>
              <span className="font-medium text-slate-900 dark:text-slate-100">
                {student.parent_name || 'N/A'}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Parent Phone:</span>
              <span className="font-medium text-slate-900 dark:text-slate-100">
                {student.parent_phone || 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Payment History Table */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
              Payment Receipts History ({payments.length})
            </h4>
          </div>

          {loading ? (
            <div className="py-8 text-center text-slate-400 text-xs">Loading payment records...</div>
          ) : payments.length === 0 ? (
            <div className="py-8 text-center rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
              No payments recorded yet for this student.
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900/60 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="p-3">Receipt No</th>
                    <th className="p-3">Date</th>
                    <th className="p-3">Mode</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3">Reference</th>
                    <th className="p-3 text-right">PDF</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                      <td className="p-3 font-mono text-slate-900 dark:text-slate-100">
                        {p.receipt_number}
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-400">
                        {formatDate(p.payment_date)}
                      </td>
                      <td className="p-3 text-slate-700 dark:text-slate-300">
                        {getPaymentMethodLabel(p.payment_method)}
                      </td>
                      <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(p.amount)}
                      </td>
                      <td className="p-3 text-slate-500 font-mono text-[11px]">
                        {p.transaction_id || '-'}
                      </td>
                      <td className="p-3 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 gap-1 text-[11px] hover:text-slate-900"
                          onClick={() =>
                            generateReceiptPdf(p, student, student.course, student.batch)
                          }
                          title="Download PDF Receipt"
                        >
                          <Download className="h-3 w-3" />
                          PDF
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

