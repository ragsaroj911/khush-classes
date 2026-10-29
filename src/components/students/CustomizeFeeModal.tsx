'use client';

import * as React from 'react';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Student, FeeItem } from '@/types';
import { DataService } from '@/lib/storage';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  IndianRupee,
  Plus,
  Trash2,
  CheckCircle2,
  Sparkles,
  Calculator,
  Sliders,
  Award,
} from 'lucide-react';

interface CustomizeFeeModalProps {
  student: Student | null;
  isOpen: boolean;
  onClose: () => void;
  onFeeUpdated?: (updatedStudent: Student) => void;
}

const DEFAULT_FEE_HEADS: Omit<FeeItem, 'id'>[] = [
  { name: 'Tuition & Coaching Fee', amount: 60000, category: 'tuition' },
  { name: 'Admission & Registration', amount: 10000, category: 'admission' },
  { name: 'Study Modules, Books & Notes', amount: 8000, category: 'material' },
  { name: 'Test Series, DPPs & Mock Exams', amount: 7000, category: 'exam' },
];

export function CustomizeFeeModal({
  student,
  isOpen,
  onClose,
  onFeeUpdated,
}: CustomizeFeeModalProps) {
  const [feeMode, setFeeMode] = React.useState<'itemized' | 'direct'>('itemized');
  const [feeItems, setFeeItems] = React.useState<FeeItem[]>([]);
  const [directGrossFee, setDirectGrossFee] = React.useState<number>(0);
  const [discountAmount, setDiscountAmount] = React.useState<number>(0);
  const [discountReason, setDiscountReason] = React.useState('');
  const [dueDate, setDueDate] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  // New custom item fields
  const [newHeadName, setNewHeadName] = React.useState('');
  const [newHeadAmount, setNewHeadAmount] = React.useState<number>(0);
  const [isAddingHead, setIsAddingHead] = React.useState(false);

  React.useEffect(() => {
    if (student) {
      if (student.custom_fee_items && student.custom_fee_items.length > 0) {
        setFeeItems(student.custom_fee_items);
        setFeeMode('itemized');
      } else {
        // Initialize from student gross fee
        const total = student.gross_fee || 50000;
        setFeeItems([
          { id: '1', name: 'Tuition & Coaching Fee', amount: Math.round(total * 0.7), category: 'tuition' },
          { id: '2', name: 'Admission & Registration', amount: Math.round(total * 0.12), category: 'admission' },
          { id: '3', name: 'Study Modules & Material', amount: Math.round(total * 0.1), category: 'material' },
          { id: '4', name: 'Test Series & Lab Charges', amount: Math.round(total * 0.08), category: 'exam' },
        ]);
        setFeeMode('itemized');
      }
      setDirectGrossFee(student.gross_fee);
      setDiscountAmount(student.discount_amount || 0);
      setDiscountReason(student.discount_reason || '');
      setDueDate(student.due_date || '');
      setNotes(student.notes || '');
    }
  }, [student, isOpen]);

  if (!student) return null;

  // Calculate gross fee based on active mode
  const calculatedGrossFee =
    feeMode === 'itemized'
      ? feeItems.reduce((acc, item) => acc + (Number(item.amount) || 0), 0)
      : Number(directGrossFee) || 0;

  const netFee = Math.max(calculatedGrossFee - (Number(discountAmount) || 0), 0);
  const newBalance = Math.max(netFee - Number(student.paid_amount || 0), 0);

  const handleUpdateItemAmount = (id: string, amount: number) => {
    setFeeItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, amount: Number(amount) || 0 } : item))
    );
  };

  const handleUpdateItemName = (id: string, name: string) => {
    setFeeItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, name } : item))
    );
  };

  const handleRemoveItem = (id: string) => {
    setFeeItems((prev) => prev.filter((item) => item.id !== id));
  };

  const handleAddCustomHead = () => {
    if (!newHeadName.trim()) {
      alert('Please enter a name for the custom fee head');
      return;
    }
    const newItem: FeeItem = {
      id: crypto.randomUUID(),
      name: newHeadName.trim(),
      amount: Number(newHeadAmount) || 0,
      category: 'other',
    };
    setFeeItems((prev) => [...prev, newItem]);
    setNewHeadName('');
    setNewHeadAmount(0);
    setIsAddingHead(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const updated = await DataService.updateStudent(student.id, {
        gross_fee: calculatedGrossFee,
        discount_amount: Number(discountAmount),
        discount_reason: discountReason,
        due_date: dueDate || undefined,
        notes,
        custom_fee_items: feeMode === 'itemized' ? feeItems : undefined,
      });

      if (updated && onFeeUpdated) {
        onFeeUpdated(updated);
      }
      onClose();
    } catch (err) {
      console.error('Failed to customize fee:', err);
      alert('Failed to save customized fee structure.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Customize Student Fee Structure"
      description={`Customized fee assessment for ${student.first_name} ${student.last_name} (${student.roll_number}).`}
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Student Quick Header */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Student & Course</span>
            <span className="font-bold text-sm text-slate-900 dark:text-white">
              {student.first_name} {student.last_name}
            </span>
            <span className="text-slate-500 ml-2">
              ({student.course?.code || 'Course'} &bull; {student.batch?.name || 'Batch'})
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Already Paid</span>
              <span className="font-bold text-emerald-600 text-sm">
                {formatCurrency(student.paid_amount)}
              </span>
            </div>
          </div>
        </div>

        {/* Mode Switch Tabs */}
        <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
          <button
            type="button"
            onClick={() => setFeeMode('itemized')}
            className={`flex-1 py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-2 ${
              feeMode === 'itemized'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-bold'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Sliders className="h-3.5 w-3.5 text-emerald-600" />
            Itemized Custom Fee Heads
          </button>
          <button
            type="button"
            onClick={() => {
              setDirectGrossFee(calculatedGrossFee);
              setFeeMode('direct');
            }}
            className={`flex-1 py-2 px-3 rounded-lg transition-all flex items-center justify-center gap-2 ${
              feeMode === 'direct'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-bold'
                : 'text-slate-600 dark:text-slate-400'
            }`}
          >
            <Calculator className="h-3.5 w-3.5 text-primary" />
            Direct Negotiated Lumpsum (₹)
          </button>
        </div>

        {/* Itemized Builder Mode */}
        {feeMode === 'itemized' ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Itemized Fee Particulars (₹)
              </label>
              <button
                type="button"
                onClick={() => setIsAddingHead(true)}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Custom Fee Head
              </button>
            </div>

            <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
              {feeItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950"
                >
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => handleUpdateItemName(item.id, e.target.value)}
                    placeholder="Fee Head Description"
                    className="flex-1 text-xs font-medium bg-transparent border-0 focus:outline-none text-slate-900 dark:text-slate-100"
                  />
                  <div className="flex items-center gap-1 bg-slate-50 dark:bg-slate-900 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 w-32">
                    <span className="text-xs text-slate-400 font-semibold">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="50"
                      value={item.amount}
                      onChange={(e) => handleUpdateItemAmount(item.id, Number(e.target.value))}
                      className="w-full text-xs font-bold text-right bg-transparent border-0 focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(item.id)}
                    className="p-1 text-slate-400 hover:text-rose-500 rounded transition-colors"
                    title="Remove fee head"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>

            {/* Quick Add Custom Head Box */}
            {isAddingHead && (
              <div className="p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-2">
                <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                  New Custom Fee Particular
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="e.g. 1-on-1 Doubt Sessions"
                    value={newHeadName}
                    onChange={(e) => setNewHeadName(e.target.value)}
                    className="sm:col-span-2 text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                  />
                  <input
                    type="number"
                    placeholder="Amount (₹)"
                    min="0"
                    value={newHeadAmount || ''}
                    onChange={(e) => setNewHeadAmount(Number(e.target.value))}
                    className="text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-right"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setIsAddingHead(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                    onClick={handleAddCustomHead}
                  >
                    Add Head
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Direct Lumpsum Mode */
          <div className="space-y-3">
            <Input
              label="Direct Agreed Gross Fee (₹)"
              type="number"
              required
              min="0"
              step="100"
              value={directGrossFee}
              onChange={(e) => setDirectGrossFee(Number(e.target.value))}
              hint="Specify the agreed customized total package for this student."
            />
          </div>
        )}

        {/* Scholarship & Discount Waiver (in ₹) */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Award className="h-3.5 w-3.5 text-amber-500" />
              Scholarship / Concession Waiver
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Waiver Amount (₹)"
              type="number"
              min="0"
              step="50"
              value={discountAmount}
              onChange={(e) => setDiscountAmount(Number(e.target.value))}
            />
            <Input
              label="Waiver Reason"
              placeholder="e.g. Merit Concession, Special Approval"
              value={discountReason}
              onChange={(e) => setDiscountReason(e.target.value)}
            />
          </div>
        </div>

        {/* Due Date & Notes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Payment Due Date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
          <Input
            label="Custom Notes / Agreement"
            placeholder="e.g. Special 3-installment approval"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        {/* Financial Recalculation Preview Banner */}
        <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2 text-xs">
          <div className="flex justify-between text-slate-300">
            <span>Customized Gross Fee:</span>
            <span className="font-bold text-white">{formatCurrency(calculatedGrossFee)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-emerald-400">
              <span>Scholarship Deduction:</span>
              <span>-{formatCurrency(discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-slate-800 pt-2 text-sm font-bold">
            <span>Net Payable Fee:</span>
            <span className="text-emerald-400 text-base">{formatCurrency(netFee)}</span>
          </div>
          <div className="flex justify-between pt-1 border-t border-slate-800/60 text-xs">
            <span className="text-slate-400">Already Paid: {formatCurrency(student.paid_amount)}</span>
            <span className="font-bold text-rose-400">
              New Remaining Balance: {formatCurrency(newBalance)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold min-w-36"
          >
            {loading ? 'Saving...' : 'Update Student Fee'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

