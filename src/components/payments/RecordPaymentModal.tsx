'use client';

import * as React from 'react';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Student, PaymentMethod } from '@/types';
import { DataService } from '@/lib/storage';
import { formatCurrency, formatDate } from '@/lib/utils';
import { generateReceiptPdf } from '@/lib/receipt-generator';
import { CheckCircle2, Download, Mail, Sparkles } from 'lucide-react';

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedStudent?: Student | null;
  onPaymentRecorded?: () => void;
}

export function RecordPaymentModal({
  isOpen,
  onClose,
  preSelectedStudent,
  onPaymentRecorded,
}: RecordPaymentModalProps) {
  const [students, setStudents] = React.useState<Student[]>([]);
  const [selectedStudentId, setSelectedStudentId] = React.useState<string>('');
  const [amount, setAmount] = React.useState<number>(0);
  const [paymentMethod, setPaymentMethod] = React.useState<PaymentMethod>('upi');
  const [paymentDate, setPaymentDate] = React.useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [transactionId, setTransactionId] = React.useState('');
  const [remarks, setRemarks] = React.useState('');
  const [sendEmailReceipt, setSendEmailReceipt] = React.useState(true);
  const [loading, setLoading] = React.useState(false);

  // Success state for instant receipt download
  const [recordedSuccess, setRecordedSuccess] = React.useState<{
    payment: any;
    student: Student;
  } | null>(null);

  React.useEffect(() => {
    async function loadStudents() {
      const all = await DataService.getStudents();
      // Only students with balance > 0 or all students
      setStudents(all);

      if (preSelectedStudent) {
        setSelectedStudentId(preSelectedStudent.id);
        setAmount(preSelectedStudent.balance_amount);
      } else if (all.length > 0 && !selectedStudentId) {
        setSelectedStudentId(all[0].id);
        setAmount(all[0].balance_amount);
      }
    }

    if (isOpen) {
      setRecordedSuccess(null);
      loadStudents();
    }
  }, [isOpen, preSelectedStudent]);

  const currentStudent = students.find((s) => s.id === selectedStudentId);

  const handleStudentChange = (id: string) => {
    setSelectedStudentId(id);
    const s = students.find((x) => x.id === id);
    if (s) {
      setAmount(s.balance_amount);
    }
  };

  const handlePayFull = () => {
    if (currentStudent) {
      setAmount(currentStudent.balance_amount);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStudent) {
      alert('Please select a student');
      return;
    }
    if (!amount || amount <= 0) {
      alert('Please enter a valid payment amount greater than 0');
      return;
    }
    if (amount > currentStudent.balance_amount) {
      const confirmExcess = window.confirm(
        `Amount entered (${formatCurrency(amount)}) exceeds outstanding balance (${formatCurrency(currentStudent.balance_amount)}). Proceed?`
      );
      if (!confirmExcess) return;
    }

    setLoading(true);
    try {
      const result = await DataService.recordPayment({
        student_id: currentStudent.id,
        amount: Number(amount),
        payment_method: paymentMethod,
        payment_date: paymentDate,
        transaction_id: transactionId,
        remarks: remarks || `Fee installment payment`,
      });

      // Send email receipt via API if requested
      if (sendEmailReceipt && currentStudent.email) {
        try {
          await fetch('/api/payments/receipt-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              toEmail: currentStudent.email,
              studentName: `${currentStudent.first_name} ${currentStudent.last_name}`,
              rollNumber: currentStudent.roll_number,
              receiptNumber: result.payment.receipt_number,
              amountPaid: result.payment.amount,
              paymentMethod: result.payment.payment_method,
              paymentDate: result.payment.payment_date,
              transactionId: result.payment.transaction_id,
              balanceRemaining: result.student.balance_amount,
            }),
          });
        } catch (emailErr) {
          console.warn('Receipt email failed:', emailErr);
        }
      }

      setRecordedSuccess(result);
      if (onPaymentRecorded) onPaymentRecorded();
    } catch (err) {
      console.error('Payment record error:', err);
      alert('Failed to record payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={recordedSuccess ? 'Fee Payment Receipt Generated (₹)' : 'Record Fee Collection (₹) — Khush Classes'}
      description={
        recordedSuccess
          ? `Receipt ${recordedSuccess.payment.receipt_number} issued for Khush Classes.`
          : 'Record tuition fee installment in Indian Rupees (₹) with real-time balance adjustment.'
      }
      maxWidth="lg"
    >
      {recordedSuccess ? (
        <div className="space-y-6 text-center py-2">
          <div className="mx-auto h-16 w-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="h-10 w-10" />
          </div>

          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">
              {formatCurrency(recordedSuccess.payment.amount)} Received
            </h3>
            <p className="text-sm text-slate-500 font-mono mt-1">
              Receipt No: {recordedSuccess.payment.receipt_number}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Student: {recordedSuccess.student.first_name} {recordedSuccess.student.last_name} ({recordedSuccess.student.roll_number})
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs flex justify-between items-center text-left">
            <div>
              <span className="text-slate-400 block">Remaining Balance:</span>
              <span className="font-bold text-sm text-slate-800 dark:text-slate-200">
                {formatCurrency(recordedSuccess.student.balance_amount)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block">New Status:</span>
              <span className="font-bold uppercase tracking-wider text-xs text-emerald-600">
                {recordedSuccess.student.payment_status}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button
              className="w-full sm:w-auto gap-2 bg-slate-900 text-white"
              onClick={() => {
                generateReceiptPdf(
                  recordedSuccess.payment,
                  recordedSuccess.student,
                  recordedSuccess.student.course,
                  recordedSuccess.student.batch
                );
              }}
            >
              <Download className="h-4 w-4" />
              Download Official PDF Receipt
            </Button>
            <Button variant="outline" className="w-full sm:w-auto" onClick={onClose}>
              Close & View History
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Student Selection */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Select Student <span className="text-rose-500">*</span>
            </label>
            <select
              required
              className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
              value={selectedStudentId}
              onChange={(e) => handleStudentChange(e.target.value)}
            >
              <option value="">-- Choose Student --</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.roll_number} - {s.first_name} {s.last_name} (Balance: {formatCurrency(s.balance_amount)})
                </option>
              ))}
            </select>
          </div>

          {/* Student Balance Peek Card */}
          {currentStudent && (
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-500 block">Total Net Fee:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {formatCurrency(currentStudent.net_fee)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Already Paid:</span>
                <span className="font-semibold text-emerald-600">
                  {formatCurrency(currentStudent.paid_amount)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-500 block">Current Balance:</span>
                <span className="font-bold text-rose-600">
                  {formatCurrency(currentStudent.balance_amount)}
                </span>
              </div>
            </div>
          )}

          {/* Amount and Quick Pay Button */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Amount Received <span className="text-rose-500">*</span>
              </label>
              {currentStudent && currentStudent.balance_amount > 0 && (
                <button
                  type="button"
                  onClick={handlePayFull}
                  className="text-xs font-semibold text-primary hover:underline"
                >
                  Pay Full ({formatCurrency(currentStudent.balance_amount)})
                </button>
              )}
            </div>
            <Input
              type="number"
              required
              min="1"
              step="1"
              placeholder="0.00"
              value={amount || ''}
              onChange={(e) => setAmount(Number(e.target.value))}
            />
          </div>

          {/* Payment Method & Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Payment Mode <span className="text-rose-500">*</span>
              </label>
              <select
                required
                className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
              >
                <option value="upi">UPI / QR Code</option>
                <option value="cash">Cash</option>
                <option value="card">Credit / Debit Card</option>
                <option value="bank_transfer">Bank Transfer (NEFT/RTGS)</option>
                <option value="cheque">Cheque / Demand Draft</option>
              </select>
            </div>

            <Input
              label="Payment Date"
              type="date"
              required
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
            />
          </div>

          {/* Transaction Reference & Remarks */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Transaction ID / Cheque No"
              placeholder="e.g. UPI/99214 or NEFT-4029"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
            />
            <Input
              label="Remarks / Notes"
              placeholder="e.g. Semester 1 tuition fee"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
            />
          </div>

          {/* Email Confirmation Toggle */}
          <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800">
            <input
              type="checkbox"
              id="sendEmail"
              checked={sendEmailReceipt}
              onChange={(e) => setSendEmailReceipt(e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
            />
            <label htmlFor="sendEmail" className="text-xs text-slate-700 dark:text-slate-300 font-medium">
              Send instant official payment receipt to student&apos;s email ({currentStudent?.email || 'N/A'}) via Resend
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !currentStudent}
              className="bg-emerald-600 hover:bg-emerald-700 text-white min-w-36"
            >
              {loading ? 'Recording...' : 'Confirm Payment'}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}

