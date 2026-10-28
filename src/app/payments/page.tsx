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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Payment Receipts & Collections
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Search payment history, verify transactions, and download official PDF receipts.
          </p>
        </div>

        <Button
          size="sm"
          className="gap-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
          onClick={() => setIsRecordOpen(true)}
        >
          <Receipt className="h-3.5 w-3.5" />
          Record New Payment
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
