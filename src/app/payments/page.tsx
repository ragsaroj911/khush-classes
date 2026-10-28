'use client';

import * as React from 'react';
import { PaymentHistoryTable } from '@/components/payments/PaymentHistoryTable';
import { RecordPaymentModal } from '@/components/payments/RecordPaymentModal';
import { Payment } from '@/types';
import { DataService } from '@/lib/storage';
import { Button } from '@/components/ui/button';
import { PlusCircle, Receipt } from 'lucide-react';

export default function PaymentsPage() {
  const [payments, setPayments] = React.useState<Payment[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isRecordOpen, setIsRecordOpen] = React.useState(false);

  const loadPayments = React.useCallback(async () => {
    try {
      const data = await DataService.getPayments();
      setPayments(data);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadPayments();
    const handleUpdate = () => loadPayments();
    window.addEventListener('sfms_data_updated', handleUpdate);
    return () => window.removeEventListener('sfms_data_updated', handleUpdate);
  }, [loadPayments]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200">
              Khush Classes
            </span>
            <span className="text-xs text-slate-400 font-medium">Collections Register</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
            Fee Receipts & Collections Ledger (₹)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Search payment history in Indian Rupees (₹), verify transactions, and download official PDF receipts.
          </p>
        </div>

        <Button
          size="sm"
          className="gap-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20"
          onClick={() => setIsRecordOpen(true)}
        >
          <Receipt className="h-4 w-4" />
          Collect New Fee (₹)
        </Button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-400 text-xs">Loading payment records...</div>
      ) : (
        <PaymentHistoryTable payments={payments} />
      )}

      <RecordPaymentModal
        isOpen={isRecordOpen}
        onClose={() => setIsRecordOpen(false)}
        onPaymentRecorded={() => loadPayments()}
      />
    </div>
  );
}

