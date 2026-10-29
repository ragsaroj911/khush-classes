'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DataService } from '@/lib/storage';
import { Payment } from '@/types';
import { formatCurrency, formatDate, getPaymentMethodLabel } from '@/lib/utils';
import { generateReceiptPdf } from '@/lib/receipt-generator';
import { Button } from '@/components/ui/button';
import { Download, Printer, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ReceiptPrintPage() {
  const params = useParams();
  const router = useRouter();
  const paymentId = params?.id as string;

  const [payment, setPayment] = React.useState<Payment | null>(null);
  const [loading, setLoading] = React.useState(true);

  const instituteName = process.env.NEXT_PUBLIC_INSTITUTE_NAME || 'Khush Classes';
  const instituteAddress = process.env.NEXT_PUBLIC_INSTITUTE_ADDRESS || 'Main Market Road, Knowledge Park, Delhi NCR';
  const institutePhone = process.env.NEXT_PUBLIC_INSTITUTE_PHONE || '+91 98765 43210';
  const instituteEmail = process.env.NEXT_PUBLIC_INSTITUTE_EMAIL || 'fees@khushclasses.com';

  React.useEffect(() => {
    async function loadPayment() {
      const all = await DataService.getPayments();
      const found = all.find((p) => p.id === paymentId || p.receipt_number === paymentId);
      setPayment(found || null);
      setLoading(false);
    }
    if (paymentId) {
      loadPayment();
    }
  }, [paymentId]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center text-xs text-slate-500">
        Loading receipt voucher...
      </div>
    );
  }

  if (!payment || !payment.student) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-4">
        <h2 className="text-xl font-bold">Receipt Not Found</h2>
        <p className="text-xs text-slate-500">
          The requested payment receipt ID does not exist in the institutional record.
        </p>
        <Button onClick={() => router.push('/payments')} variant="outline" size="sm">
          Return to Payments
        </Button>
      </div>
    );
  }

  const { student } = payment;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Action Bar (Hidden on print) */}
      <div className="no-print flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.back()}
          className="gap-2 text-xs"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </Button>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.print()}
            className="gap-2 text-xs"
          >
            <Printer className="h-3.5 w-3.5" />
            Print Voucher
          </Button>

          <Button
            size="sm"
            onClick={() =>
              generateReceiptPdf(
                payment,
                student,
                student.course,
                student.batch
              )
            }
            className="gap-2 text-xs bg-slate-900 text-white"
          >
            <Download className="h-3.5 w-3.5" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Official Printable Voucher Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-md p-8 sm:p-12 space-y-8 print:border-none print:shadow-none print:p-0">
        {/* Header */}
        <div className="border-b border-slate-200 dark:border-slate-800 pb-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">
              Official Institutional Voucher
            </span>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {instituteName}
            </h1>
            <p className="text-xs text-slate-500 mt-1">{instituteAddress}</p>
            <p className="text-xs text-slate-400">
              Tel: {institutePhone} &bull; Email: {instituteEmail}
            </p>
          </div>

          <div className="sm:text-right">
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full border border-emerald-200 mb-2">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
              Payment Confirmed
            </span>
            <p className="font-mono text-sm font-bold text-slate-900 dark:text-white">
              {payment.receipt_number}
            </p>
            <p className="text-xs text-slate-500">Date: {formatDate(payment.payment_date)}</p>
          </div>
        </div>

        {/* Student & Course Details */}
        <div className="grid grid-cols-2 gap-6 text-xs">
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Student Details
            </span>
            <p className="font-bold text-slate-900 dark:text-white text-sm">
              {student.first_name} {student.last_name}
            </p>
            <p className="text-slate-600 dark:text-slate-400 font-mono">
              Roll No: <strong>{student.roll_number}</strong>
            </p>
            <p className="text-slate-500">Email: {student.email}</p>
            <p className="text-slate-500">Phone: {student.phone}</p>
          </div>

          <div className="space-y-1.5 sm:text-right">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Course & Cohort
            </span>
            <p className="font-bold text-slate-900 dark:text-white text-sm">
              {student.course?.name || 'Academic Degree'}
            </p>
            <p className="text-slate-600 dark:text-slate-400">
              Batch: {student.batch?.name || 'Standard'} ({student.batch?.academic_year || 'Current'})
            </p>
            <p className="text-slate-500">
              Payment Mode: <strong>{getPaymentMethodLabel(payment.payment_method)}</strong>
            </p>
            {payment.transaction_id && (
              <p className="text-slate-500 font-mono text-[11px]">
                Ref: {payment.transaction_id}
              </p>
            )}
          </div>
        </div>

        {/* Itemized Table */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3 pl-4">Description / Particulars</th>
                <th className="p-3">Category / Mode</th>
                <th className="p-3 pr-4 text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {student.custom_fee_items && student.custom_fee_items.length > 0 ? (
                <>
                  {student.custom_fee_items.map((head) => (
                    <tr key={head.id} className="bg-slate-50/40 dark:bg-slate-900/40">
                      <td className="p-3 pl-4">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {head.name}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500 capitalize">
                        {head.category || 'Tuition'} Head
                      </td>
                      <td className="p-3 pr-4 text-right font-medium text-slate-700 dark:text-slate-300">
                        {formatCurrency(head.amount)}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-emerald-50/60 dark:bg-emerald-950/30">
                    <td className="p-3 pl-4">
                      <p className="font-bold text-emerald-900 dark:text-emerald-200">
                        Payment Credited in this Receipt
                      </p>
                      <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                        {payment.remarks || 'Official fee installment settlement'}
                      </p>
                    </td>
                    <td className="p-3 text-emerald-800 dark:text-emerald-200 font-semibold">
                      {getPaymentMethodLabel(payment.payment_method)}
                    </td>
                    <td className="p-3 pr-4 text-right font-extrabold text-emerald-700 dark:text-emerald-300 text-sm">
                      +{formatCurrency(payment.amount)}
                    </td>
                  </tr>
                </>
              ) : (
                <tr>
                  <td className="p-3 pl-4">
                    <p className="font-bold text-slate-900 dark:text-white">
                      Academic Fee Collection
                    </p>
                    <p className="text-[11px] text-slate-500">
                      {payment.remarks || 'Standard tuition & institutional installment'}
                    </p>
                  </td>
                  <td className="p-3 text-slate-600 dark:text-slate-400">
                    {getPaymentMethodLabel(payment.payment_method)}
                  </td>
                  <td className="p-3 pr-4 text-right font-extrabold text-slate-900 dark:text-white text-sm">
                    {formatCurrency(payment.amount)}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Ledger Balance Summary */}
        <div className="flex justify-end">
          <div className="w-full sm:w-72 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Total Course Fee:</span>
              <span className="font-medium text-slate-900 dark:text-white">
                {formatCurrency(student.net_fee)}
              </span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Amount in this Receipt:</span>
              <span className="font-bold text-emerald-600">
                {formatCurrency(payment.amount)}
              </span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Cumulative Paid:</span>
              <span className="font-medium text-slate-900 dark:text-white">
                {formatCurrency(student.paid_amount)}
              </span>
            </div>
            <div className="flex justify-between border-t border-slate-200 dark:border-slate-800 pt-2 text-sm font-bold">
              <span>Balance Remaining:</span>
              <span className={student.balance_amount > 0 ? 'text-rose-600' : 'text-emerald-600'}>
                {formatCurrency(student.balance_amount)}
              </span>
            </div>
          </div>
        </div>

        {/* Footer & Signatures */}
        <div className="pt-12 border-t border-slate-200 dark:border-slate-800 flex justify-between items-end text-xs text-slate-500">
          <div>
            <p className="text-[11px] text-slate-400">
              Note: System verified official computer generated fee receipt.
            </p>
            <p className="text-[11px] text-slate-400">
              Preserve this document for semester registration and hall ticket issuance.
            </p>
          </div>

          <div className="text-center space-y-1">
            <div className="w-40 border-b border-slate-300 dark:border-slate-700 h-8 mb-1" />
            <span className="text-[10px] font-semibold uppercase text-slate-600 dark:text-slate-400 block">
              Authorized Cashier / Finance Desk
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

