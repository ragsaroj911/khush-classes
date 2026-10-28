'use client';

import * as React from 'react';
import { Payment } from '@/types';
import { formatCurrency, formatDate, getPaymentMethodLabel } from '@/lib/utils';
import { generateReceiptPdf } from '@/lib/receipt-generator';
import { Button } from '@/components/ui/button';
import { Download, Search, FileText } from 'lucide-react';
import Link from 'next/link';

interface PaymentHistoryTableProps {
  payments: Payment[];
}

export function PaymentHistoryTable({ payments }: PaymentHistoryTableProps) {
  const [search, setSearch] = React.useState('');
  const [methodFilter, setMethodFilter] = React.useState('all');

  const filtered = React.useMemo(() => {
    return payments.filter((p) => {
      const q = search.toLowerCase();
      const matchesSearch =
        p.receipt_number.toLowerCase().includes(q) ||
        (p.transaction_id && p.transaction_id.toLowerCase().includes(q)) ||
        (p.student &&
          (p.student.first_name.toLowerCase().includes(q) ||
            p.student.last_name.toLowerCase().includes(q) ||
            p.student.roll_number.toLowerCase().includes(q)));

      const matchesMethod = methodFilter === 'all' || p.payment_method === methodFilter;

      return matchesSearch && matchesMethod;
    });
  }, [payments, search, methodFilter]);

  const totalAmountFiltered = filtered.reduce((acc, p) => acc + Number(p.amount || 0), 0);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="sm:col-span-2 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search receipt no, transaction reference, student..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div>
          <select
            className="w-full py-2 px-3 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
          >
            <option value="all">All Payment Methods</option>
            <option value="upi">UPI / QR Code</option>
            <option value="cash">Cash</option>
            <option value="card">Cards</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="cheque">Cheque</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing <strong>{filtered.length}</strong> receipts &bull; Total Filtered:{' '}
          <strong className="text-emerald-600 dark:text-emerald-400">
            {formatCurrency(totalAmountFiltered)}
          </strong>
        </span>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3.5 pl-4">Receipt No</th>
                <th className="p-3.5">Student Details</th>
                <th className="p-3.5">Date</th>
                <th className="p-3.5">Mode</th>
                <th className="p-3.5">Reference / Notes</th>
                <th className="p-3.5 text-right">Amount</th>
                <th className="p-3.5 pr-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No payment receipts match your criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((payment) => (
                  <tr
                    key={payment.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="p-3.5 pl-4">
                      <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                        {payment.receipt_number}
                      </span>
                    </td>

                    <td className="p-3.5">
                      {payment.student ? (
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-slate-100">
                            {payment.student.first_name} {payment.student.last_name}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {payment.student.roll_number}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400">Unknown Student</span>
                      )}
                    </td>

                    <td className="p-3.5 text-slate-600 dark:text-slate-400">
                      {formatDate(payment.payment_date)}
                    </td>

                    <td className="p-3.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {getPaymentMethodLabel(payment.payment_method)}
                      </span>
                    </td>

                    <td className="p-3.5 text-slate-500 text-[11px]">
                      {payment.transaction_id && (
                        <span className="font-mono block">{payment.transaction_id}</span>
                      )}
                      {payment.remarks && (
                        <span className="text-slate-400 block truncate max-w-[160px]">
                          {payment.remarks}
                        </span>
                      )}
                    </td>

                    <td className="p-3.5 text-right font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                      {formatCurrency(payment.amount)}
                    </td>

                    <td className="p-3.5 pr-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {payment.student && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-2.5 text-xs gap-1.5"
                            onClick={() =>
                              generateReceiptPdf(
                                payment,
                                payment.student!,
                                payment.student?.course,
                                payment.student?.batch
                              )
                            }
                            title="Download PDF Receipt"
                          >
                            <Download className="h-3.5 w-3.5" />
                            PDF
                          </Button>
                        )}
                        <Link href={`/receipt/${payment.id}`}>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-xs"
                            title="Open Printable View"
                          >
                            <FileText className="h-3.5 w-3.5" />
                          </Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

