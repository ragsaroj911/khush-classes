'use client';

import * as React from 'react';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Course, Batch, Student } from '@/types';
import { DataService } from '@/lib/storage';
import { formatCurrency } from '@/lib/utils';

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStudentSaved?: (student: Student) => void;
  editStudent?: Student | null;
}

export function StudentFormModal({
  isOpen,
  onClose,
  onStudentSaved,
  editStudent,
}: StudentFormModalProps) {
  const [courses, setCourses] = React.useState<Course[]>([]);
  const [batches, setBatches] = React.useState<Batch[]>([]);
  const [loading, setLoading] = React.useState(false);

  // Form fields
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [rollNumber, setRollNumber] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [parentName, setParentName] = React.useState('');
  const [parentPhone, setParentPhone] = React.useState('');
  const [courseId, setCourseId] = React.useState('');
  const [batchId, setBatchId] = React.useState('');
  const [grossFee, setGrossFee] = React.useState<number>(0);
  const [discountAmount, setDiscountAmount] = React.useState<number>(0);
  const [discountReason, setDiscountReason] = React.useState('');
  const [dueDate, setDueDate] = React.useState('');
  const [notes, setNotes] = React.useState('');

  // Net fee computation
  const netFee = Math.max((Number(grossFee) || 0) - (Number(discountAmount) || 0), 0);

  // Load courses & batches
  React.useEffect(() => {
    async function loadMetadata() {
      const c = await DataService.getCourses();
      const b = await DataService.getBatches();
      setCourses(c);
      setBatches(b);

      if (editStudent) {
        setFirstName(editStudent.first_name);
        setLastName(editStudent.last_name);
        setRollNumber(editStudent.roll_number);
        setEmail(editStudent.email);
        setPhone(editStudent.phone);
        setParentName(editStudent.parent_name || '');
        setParentPhone(editStudent.parent_phone || '');
        setCourseId(editStudent.course_id);
        setBatchId(editStudent.batch_id);
        setGrossFee(editStudent.gross_fee);
        setDiscountAmount(editStudent.discount_amount);
        setDiscountReason(editStudent.discount_reason || '');
        setDueDate(editStudent.due_date || '');
        setNotes(editStudent.notes || '');
      } else {
        // Reset form for fresh entry
        const defaultCourse = c[0];
        setFirstName('');
        setLastName('');
        setRollNumber(`STU-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
        setEmail('');
        setPhone('');
        setParentName('');
        setParentPhone('');
        if (defaultCourse) {
          setCourseId(defaultCourse.id);
          setGrossFee(defaultCourse.default_total_fee);
        }
        setDiscountAmount(0);
        setDiscountReason('');
        // default due date: 30 days from now
        const d = new Date();
        d.setDate(d.getDate() + 30);
        setDueDate(d.toISOString().split('T')[0]);
        setNotes('');
      }
    }

    if (isOpen) {
      loadMetadata();
    }
  }, [isOpen, editStudent]);

  // When course changes, update default fee and filter batches
  const handleCourseChange = (id: string) => {
    setCourseId(id);
    const selectedCourse = courses.find((c) => c.id === id);
    if (selectedCourse && !editStudent) {
      setGrossFee(selectedCourse.default_total_fee);
    }
    const matchingBatches = batches.filter((b) => b.course_id === id);
    if (matchingBatches.length > 0) {
      setBatchId(matchingBatches[0].id);
    }
  };

  const filteredBatches = batches.filter((b) => b.course_id === courseId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !lastName || !rollNumber || !email || !courseId || !batchId) {
      alert('Please fill all mandatory fields marked with *');
      return;
    }

    setLoading(true);
    try {
      if (editStudent) {
        const updated = await DataService.updateStudent(editStudent.id, {
          first_name: firstName,
          last_name: lastName,
          roll_number: rollNumber,
          email,
          phone,
          parent_name: parentName,
          parent_phone: parentPhone,
          course_id: courseId,
          batch_id: batchId,
          gross_fee: Number(grossFee),
          discount_amount: Number(discountAmount),
          discount_reason: discountReason,
          due_date: dueDate || undefined,
          notes,
        });
        if (updated && onStudentSaved) onStudentSaved(updated);
      } else {
        const created = await DataService.addStudent({
          first_name: firstName,
          last_name: lastName,
          roll_number: rollNumber,
          email,
          phone,
          parent_name: parentName,
          parent_phone: parentPhone,
          course_id: courseId,
          batch_id: batchId,
          admission_date: new Date().toISOString().split('T')[0],
          gross_fee: Number(grossFee),
          discount_amount: Number(discountAmount),
          discount_reason: discountReason,
          net_fee: netFee,
          due_date: dueDate || undefined,
          student_status: 'active',
          notes,
        });
        if (created && onStudentSaved) onStudentSaved(created);
      }
      onClose();
    } catch (err) {
      console.error('Failed to save student:', err);
      alert('Error saving student profile. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editStudent ? 'Edit Student Profile' : 'New Student Registration'}
      description="Register a new student, assign course and batch, and configure custom fee structure & scholarships."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Personal Details */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            1. Personal & Contact Information
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="First Name"
              required
              placeholder="e.g. Aarav"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            <Input
              label="Last Name"
              required
              placeholder="e.g. Sharma"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
            <Input
              label="Roll Number / Student ID"
              required
              placeholder="STU-2024-001"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
            />
            <Input
              label="Student Email"
              type="email"
              required
              placeholder="aarav.sharma@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              label="Student Phone"
              required
              placeholder="+91 98765 43210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <Input
              label="Fee Due Date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>

        {/* Section 2: Parent / Guardian Info */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            2. Parent / Guardian Details
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Parent / Guardian Name"
              placeholder="e.g. Rajesh Sharma"
              value={parentName}
              onChange={(e) => setParentName(e.target.value)}
            />
            <Input
              label="Parent Phone"
              placeholder="+91 98765 43211"
              value={parentPhone}
              onChange={(e) => setParentPhone(e.target.value)}
            />
          </div>
        </div>

        {/* Section 3: Academic Enrollment */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            3. Academic Enrollment
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Course <span className="text-rose-500">*</span>
              </label>
              <select
                required
                className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                value={courseId}
                onChange={(e) => handleCourseChange(e.target.value)}
              >
                <option value="">-- Select Course --</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.code} - {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Batch <span className="text-rose-500">*</span>
              </label>
              <select
                required
                className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100"
                value={batchId}
                onChange={(e) => setBatchId(e.target.value)}
              >
                <option value="">-- Select Batch --</option>
                {filteredBatches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.academic_year})
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 4: Fee Structure & Scholarship */}
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            4. Fee Assessment & Scholarship
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Standard Course Fee"
              type="number"
              required
              min="0"
              step="100"
              value={grossFee}
              onChange={(e) => setGrossFee(Number(e.target.value))}
            />
            <Input
              label="Discount / Scholarship"
              type="number"
              min="0"
              step="100"
              value={discountAmount}
              onChange={(e) => setDiscountAmount(Number(e.target.value))}
            />
            <Input
              label="Scholarship / Waiver Reason"
              placeholder="e.g. Merit 90%+, Sibling waiver"
              value={discountReason}
              onChange={(e) => setDiscountReason(e.target.value)}
            />
          </div>

          {/* Net fee calculation banner */}
          <div className="mt-3 p-3.5 rounded-xl bg-slate-900 text-white flex items-center justify-between">
            <span className="text-xs font-medium text-slate-300">Net Payable Academic Fee:</span>
            <span className="text-lg font-bold text-emerald-400">{formatCurrency(netFee)}</span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading} className="min-w-28">
            {loading ? 'Saving...' : editStudent ? 'Update Student' : 'Register Student'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
