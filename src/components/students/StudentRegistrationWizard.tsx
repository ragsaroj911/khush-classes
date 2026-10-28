'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Course, Batch, Student } from '@/types';
import { DataService } from '@/lib/storage';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  User,
  BookOpen,
  IndianRupee,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Award,
  Phone,
  Mail,
  Calendar,
  Layers,
  GraduationCap,
  ShieldCheck,
  RefreshCw,
  Receipt,
} from 'lucide-react';

interface StudentRegistrationWizardProps {
  onSuccess?: (student: Student) => void;
  onCancel?: () => void;
  editStudent?: Student | null;
  isModal?: boolean;
}

const SCHOLARSHIP_PRESETS = [
  { label: 'None', amount: 0, reason: '' },
  { label: 'Merit 90%+ (₹10,000)', amount: 10000, reason: 'Merit Academic Scholarship (90%+ marks)' },
  { label: 'Early Bird (₹5,000)', amount: 5000, reason: 'Early Bird Admission Waiver' },
  { label: 'Sibling Discount (₹7,500)', amount: 7500, reason: 'Sibling Concession' },
  { label: 'EWS Support (₹15,000)', amount: 15000, reason: 'EWS Educational Support Waiver' },
];

export function StudentRegistrationWizard({
  onSuccess,
  onCancel,
  editStudent,
  isModal = false,
}: StudentRegistrationWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = React.useState<number>(1);
  const [loading, setLoading] = React.useState(false);
  const [courses, setCourses] = React.useState<Course[]>([]);
  const [batches, setBatches] = React.useState<Batch[]>([]);

  // Step 1: Personal & Contact Details
  const [firstName, setFirstName] = React.useState('');
  const [lastName, setLastName] = React.useState('');
  const [rollNumber, setRollNumber] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [parentName, setParentName] = React.useState('');
  const [parentPhone, setParentPhone] = React.useState('');
  const [parentEmail, setParentEmail] = React.useState('');

  // Step 2: Course & Batch Details
  const [courseId, setCourseId] = React.useState('');
  const [batchId, setBatchId] = React.useState('');

  // Step 3: Fee & Scholarship Details (in Indian Rupees ₹)
  const [grossFee, setGrossFee] = React.useState<number>(0);
  const [discountAmount, setDiscountAmount] = React.useState<number>(0);
  const [discountReason, setDiscountReason] = React.useState('');
  const [dueDate, setDueDate] = React.useState('');
  const [notes, setNotes] = React.useState('');

  // Success state
  const [createdStudent, setCreatedStudent] = React.useState<Student | null>(null);

  const generateRoll = () => {
    const yr = new Date().getFullYear();
    const rand = Math.floor(100 + Math.random() * 900);
    setRollNumber(`KC-${yr}-${rand}`);
  };

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
        setParentEmail(editStudent.parent_email || '');
        setCourseId(editStudent.course_id);
        setBatchId(editStudent.batch_id);
        setGrossFee(editStudent.gross_fee);
        setDiscountAmount(editStudent.discount_amount);
        setDiscountReason(editStudent.discount_reason || '');
        setDueDate(editStudent.due_date || '');
        setNotes(editStudent.notes || '');
      } else {
        generateRoll();
        if (c.length > 0) {
          setCourseId(c[0].id);
          setGrossFee(c[0].default_total_fee);
          const firstCourseBatches = b.filter((item) => item.course_id === c[0].id);
          if (firstCourseBatches.length > 0) {
            setBatchId(firstCourseBatches[0].id);
          }
        }
        const d = new Date();
        d.setDate(d.getDate() + 30);
        setDueDate(d.toISOString().split('T')[0]);
      }
    }
    loadMetadata();
  }, [editStudent]);

  const selectedCourse = courses.find((c) => c.id === courseId);
  const filteredBatches = batches.filter((b) => b.course_id === courseId);
  const selectedBatch = batches.find((b) => b.id === batchId);

  const handleCourseSelect = (id: string) => {
    setCourseId(id);
    const crs = courses.find((c) => c.id === id);
    if (crs && !editStudent) {
      setGrossFee(crs.default_total_fee);
    }
    const matchBatches = batches.filter((b) => b.course_id === id);
    if (matchBatches.length > 0) {
      setBatchId(matchBatches[0].id);
    } else {
      setBatchId('');
    }
  };

  const netFee = Math.max((Number(grossFee) || 0) - (Number(discountAmount) || 0), 0);

  const applyScholarship = (amount: number, reason: string) => {
    setDiscountAmount(amount);
    setDiscountReason(reason);
  };

  const handleNextStep = () => {
    if (currentStep === 1) {
      if (!firstName.trim() || !lastName.trim() || !rollNumber.trim()) {
        alert('Please provide student first name, last name, and roll number.');
        return;
      }
      if (!email.trim() || !phone.trim()) {
        alert('Please enter student contact email and phone number.');
        return;
      }
    }
    if (currentStep === 2) {
      if (!courseId) {
        alert('Please select an academic course program.');
        return;
      }
      if (!batchId) {
        alert('Please choose a class batch/cohort.');
        return;
      }
    }
    if (currentStep === 3) {
      if (grossFee < 0) {
        alert('Course fee cannot be negative.');
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, 4));
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleFinalSubmit = async () => {
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
          parent_email: parentEmail,
          course_id: courseId,
          batch_id: batchId,
          gross_fee: Number(grossFee),
          discount_amount: Number(discountAmount),
          discount_reason: discountReason,
          due_date: dueDate || undefined,
          notes,
        });
        if (updated) {
          setCreatedStudent(updated);
          if (onSuccess) onSuccess(updated);
        }
      } else {
        const created = await DataService.addStudent({
          first_name: firstName,
          last_name: lastName,
          roll_number: rollNumber,
          email,
          phone,
          parent_name: parentName,
          parent_phone: parentPhone,
          parent_email: parentEmail,
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
        setCreatedStudent(created);
        if (onSuccess) onSuccess(created);
      }
    } catch (err) {
      console.error('Registration failed:', err);
      alert('Failed to register student. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // SUCCESS COMPLETION SCREEN
  if (createdStudent) {
    return (
      <div className="py-8 px-4 text-center max-w-lg mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="relative mx-auto h-20 w-20 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25">
          <CheckCircle2 className="h-10 w-10" />
          <div className="absolute -top-1 -right-1 bg-amber-400 text-slate-900 rounded-full p-1 shadow">
            <Sparkles className="h-4 w-4" />
          </div>
        </div>

        <div className="space-y-1">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200">
            Admission Confirmed
          </span>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white pt-2">
            {createdStudent.first_name} {createdStudent.last_name} Registered!
          </h2>
          <p className="text-xs text-slate-500 font-mono">
            Official Roll Number: <strong>{createdStudent.roll_number}</strong>
          </p>
        </div>

        {/* Student Admission Card */}
        <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 text-left text-xs shadow-sm space-y-3">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Enrolled Course</span>
              <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">
                {selectedCourse?.name || 'Khush Classes Academic Batch'}
              </span>
            </div>
            <span className="font-mono bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded text-slate-700 dark:text-slate-300 font-semibold">
              {selectedCourse?.code || 'KC-101'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Net Course Fee</span>
              <span className="font-extrabold text-base text-slate-900 dark:text-white">
                {formatCurrency(createdStudent.net_fee)}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Fee Due Date</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {formatDate(createdStudent.due_date)}
              </span>
            </div>
          </div>

          {createdStudent.discount_amount > 0 && (
            <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1.5 font-medium">
                <Award className="h-3.5 w-3.5 text-emerald-600" />
                Scholarship Applied ({createdStudent.discount_reason || 'Merit'})
              </span>
              <span className="font-bold">-{formatCurrency(createdStudent.discount_amount)}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white gap-2 text-xs h-10 px-6 font-bold shadow-md shadow-emerald-600/20"
            onClick={() => {
              if (onCancel) onCancel();
              router.push('/payments');
            }}
          >
            <Receipt className="h-4 w-4" />
            Collect First Fee Installment
          </Button>

          <Button
            variant="outline"
            className="w-full sm:w-auto text-xs h-10 px-5"
            onClick={() => {
              if (onCancel) onCancel();
              router.push('/students');
            }}
          >
            View Student Roster
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Visual Stepper Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-5 shadow-sm">
        <div className="flex items-center justify-between relative">
          {/* Step 1 */}
          <div
            onClick={() => setCurrentStep(1)}
            className={`flex items-center gap-3 cursor-pointer group transition-all ${
              currentStep === 1
                ? 'text-slate-900 dark:text-white font-bold'
                : currentStep > 1
                ? 'text-emerald-600 font-semibold'
                : 'text-slate-400'
            }`}
          >
            <div
              className={`h-9 w-9 rounded-xl flex items-center justify-center font-bold text-xs transition-all shadow-sm ${
                currentStep === 1
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 ring-4 ring-slate-100 dark:ring-slate-800'
                  : currentStep > 1
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
              }`}
            >
              {currentStep > 1 ? <CheckCircle2 className="h-4 w-4" /> : <User className="h-4 w-4" />}
            </div>
            <div className="hidden md:block text-left">
              <span className="text-[10px] uppercase font-bold text-slate-400 block leading-tight">
                Step 1
              </span>
              <span className="text-xs">Student Profile</span>
            </div>
          </div>

          <div
            className={`flex-1 h-0.5 mx-3 transition-colors ${
              currentStep > 1 ? 'bg-emerald-500' : 'bg-slate-100 dark:bg-slate-800'
            }`}
          />

          {/* Step 2 */}
          <div
            onClick={() => {
              if (firstName && lastName) setCurrentStep(2);
            }}
            className={`flex items-center gap-3 cursor-pointer group transition-all ${
              currentStep === 2
                ? 'text-slate-900 dark:text-white font-bold'
                : currentStep > 2
                ? 'text-emerald-600 font-semibold'
                : 'text-slate-400'
            }`}
          >
            <div
              className={`h-9 w-9 rounded-xl flex items-center justify-center font-bold text-xs transition-all shadow-sm ${
                currentStep === 2
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 ring-4 ring-slate-100 dark:ring-slate-800'
                  : currentStep > 2
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
              }`}
            >
              {currentStep > 2 ? <CheckCircle2 className="h-4 w-4" /> : <BookOpen className="h-4 w-4" />}
            </div>
            <div className="hidden md:block text-left">
              <span className="text-[10px] uppercase font-bold text-slate-400 block leading-tight">
                Step 2
              </span>
              <span className="text-xs">Course & Batch</span>
            </div>
          </div>

          <div
            className={`flex-1 h-0.5 mx-3 transition-colors ${
              currentStep > 2 ? 'bg-emerald-500' : 'bg-slate-100 dark:bg-slate-800'
            }`}
          />

          {/* Step 3 */}
          <div
            onClick={() => {
              if (firstName && lastName && courseId) setCurrentStep(3);
            }}
            className={`flex items-center gap-3 cursor-pointer group transition-all ${
              currentStep === 3
                ? 'text-slate-900 dark:text-white font-bold'
                : currentStep > 3
                ? 'text-emerald-600 font-semibold'
                : 'text-slate-400'
            }`}
          >
            <div
              className={`h-9 w-9 rounded-xl flex items-center justify-center font-bold text-xs transition-all shadow-sm ${
                currentStep === 3
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 ring-4 ring-slate-100 dark:ring-slate-800'
                  : currentStep > 3
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
              }`}
            >
              {currentStep > 3 ? <CheckCircle2 className="h-4 w-4" /> : <IndianRupee className="h-4 w-4" />}
            </div>
            <div className="hidden md:block text-left">
              <span className="text-[10px] uppercase font-bold text-slate-400 block leading-tight">
                Step 3
              </span>
              <span className="text-xs">Fee & Scholarships</span>
            </div>
          </div>

          <div
            className={`flex-1 h-0.5 mx-3 transition-colors ${
              currentStep > 3 ? 'bg-emerald-500' : 'bg-slate-100 dark:bg-slate-800'
            }`}
          />

          {/* Step 4 */}
          <div
            onClick={() => {
              if (firstName && lastName && courseId) setCurrentStep(4);
            }}
            className={`flex items-center gap-3 cursor-pointer group transition-all ${
              currentStep === 4 ? 'text-slate-900 dark:text-white font-bold' : 'text-slate-400'
            }`}
          >
            <div
              className={`h-9 w-9 rounded-xl flex items-center justify-center font-bold text-xs transition-all shadow-sm ${
                currentStep === 4
                  ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 ring-4 ring-slate-100 dark:ring-slate-800'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
              }`}
            >
              <ShieldCheck className="h-4 w-4" />
            </div>
            <div className="hidden md:block text-left">
              <span className="text-[10px] uppercase font-bold text-slate-400 block leading-tight">
                Step 4
              </span>
              <span className="text-xs">Confirmation</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Form Body with Side Live Fee Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Form View (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* STEP 1: Student Identity & Contact */}
          {currentStep === 1 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-6 shadow-sm animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    Personal & Contact Information
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Enter the student official identification and communication coordinates.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={generateRoll}
                  className="gap-1.5 text-xs h-8"
                  title="Generate new roll number"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Regen Roll ID
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  required
                  placeholder="e.g. Aryan"
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
                  label="Student Roll ID"
                  required
                  placeholder="KC-2024-101"
                  value={rollNumber}
                  onChange={(e) => setRollNumber(e.target.value)}
                />
                <Input
                  label="Student Email Address"
                  type="email"
                  required
                  placeholder="student@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <Input
                  label="Student Contact / WhatsApp Phone"
                  required
                  placeholder="+91 98765 43210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                <Input
                  label="Parent / Guardian Name"
                  placeholder="e.g. Mr. R.K. Sharma"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                />
                <Input
                  label="Parent / Guardian Phone"
                  placeholder="+91 98765 43211"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                />
                <Input
                  label="Parent Email (Optional)"
                  type="email"
                  placeholder="parent@example.com"
                  value={parentEmail}
                  onChange={(e) => setParentEmail(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* STEP 2: Course & Batch Selection */}
          {currentStep === 2 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-6 shadow-sm animate-in fade-in duration-150">
              <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-primary" />
                  Select Academic Course & Batch
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Choose the degree, coaching program or cohort for Khush Classes.
                </p>
              </div>

              {/* Course Selector Grid */}
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Choose Academic Course <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {courses.map((c) => {
                    const isSelected = c.id === courseId;
                    return (
                      <div
                        key={c.id}
                        onClick={() => handleCourseSelect(c.id)}
                        className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-slate-900 dark:border-white bg-slate-50/80 dark:bg-slate-800/80 shadow-md ring-2 ring-slate-900/10'
                            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-900'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                            {c.code}
                          </span>
                          <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                            {formatCurrency(c.default_total_fee)}
                          </span>
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 dark:text-white mt-2 leading-tight">
                          {c.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">
                          Duration: {c.duration}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Batch Selector */}
              <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Select Cohort / Class Section <span className="text-rose-500">*</span>
                </label>
                {filteredBatches.length === 0 ? (
                  <p className="text-xs text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
                    No active batches found for this course. Please configure a batch under Courses & Batches.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {filteredBatches.map((b) => {
                      const isSelected = b.id === batchId;
                      return (
                        <div
                          key={b.id}
                          onClick={() => setBatchId(b.id)}
                          className={`p-3.5 rounded-xl border-2 transition-all cursor-pointer ${
                            isSelected
                              ? 'border-emerald-600 bg-emerald-50/50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
                              : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 bg-white dark:bg-slate-900'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-xs">{b.name}</span>
                            <span className="text-[10px] font-mono text-slate-500">
                              {b.academic_year}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-1">
                            Max Intake: {b.max_capacity} Seats
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: Fee Breakdown & Scholarships (in Indian Rupees ₹) */}
          {currentStep === 3 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-6 shadow-sm animate-in fade-in duration-150">
              <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <IndianRupee className="h-4 w-4 text-emerald-600" />
                  Fee Structure & Scholarship Assessment
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Configure tuition fees in Indian Rupees (₹) and apply official scholarship waivers.
                </p>
              </div>

              {/* Base Fee Input */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Standard Course Base Fee (₹)"
                  type="number"
                  required
                  min="0"
                  step="100"
                  value={grossFee}
                  onChange={(e) => setGrossFee(Number(e.target.value))}
                />
                <Input
                  label="Payment Due Date"
                  type="date"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>

              {/* Scholarship Presets */}
              <div className="space-y-2.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Award className="h-3.5 w-3.5 text-amber-500" />
                  Quick Scholarship & Fee Waiver Presets
                </label>
                <div className="flex flex-wrap gap-2">
                  {SCHOLARSHIP_PRESETS.map((preset) => {
                    const isSelected = discountAmount === preset.amount;
                    return (
                      <button
                        key={preset.label}
                        type="button"
                        onClick={() => applyScholarship(preset.amount, preset.reason)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                        }`}
                      >
                        {preset.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Discount Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <Input
                  label="Scholarship / Waiver Amount (₹)"
                  type="number"
                  min="0"
                  step="100"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(Number(e.target.value))}
                />
                <Input
                  label="Waiver / Scholarship Reason"
                  placeholder="e.g. Merit 95%+ marks in 10th / 12th"
                  value={discountReason}
                  onChange={(e) => setDiscountReason(e.target.value)}
                />
              </div>

              {/* Special Notes */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Admission / Accounts Remarks
                </label>
                <textarea
                  className="w-full rounded-lg border border-slate-200 bg-white p-3 text-xs focus:outline-none focus:ring-2 focus:ring-slate-900 dark:border-slate-800 dark:bg-slate-950"
                  rows={2}
                  placeholder="Special installment arrangements, scholarship verification document note..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* STEP 4: Review & Admission Confirmation */}
          {currentStep === 4 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 space-y-6 shadow-sm animate-in fade-in duration-150">
              <div className="pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-emerald-600" />
                    Review & Confirm Student Admission
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Verify all enrollment particulars before finalizing the registration.
                  </p>
                </div>
                <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                  {rollNumber}
                </span>
              </div>

              {/* Review particulars card */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 space-y-2">
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider text-[10px] text-slate-400">
                    Student Details
                  </h4>
                  <p className="font-bold text-sm text-slate-900 dark:text-white">
                    {firstName} {lastName}
                  </p>
                  <p className="text-slate-600 dark:text-slate-400">Email: {email}</p>
                  <p className="text-slate-600 dark:text-slate-400">Phone: {phone}</p>
                  {parentName && (
                    <p className="text-slate-500">
                      Parent: {parentName} ({parentPhone || 'No Phone'})
                    </p>
                  )}
                </div>

                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 space-y-2">
                  <h4 className="font-bold text-slate-800 dark:text-slate-200 text-xs uppercase tracking-wider text-[10px] text-slate-400">
                    Course & Section
                  </h4>
                  <p className="font-bold text-sm text-slate-900 dark:text-white">
                    {selectedCourse?.name} ({selectedCourse?.code})
                  </p>
                  <p className="text-slate-600 dark:text-slate-400">
                    Batch: {selectedBatch?.name} ({selectedBatch?.academic_year})
                  </p>
                  <p className="text-slate-500">Due Date: {formatDate(dueDate)}</p>
                </div>
              </div>

              {/* Financial summary banner */}
              <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2">
                <div className="flex justify-between text-xs text-slate-300">
                  <span>Gross Tuition & Coaching Fee:</span>
                  <span>{formatCurrency(grossFee)}</span>
                </div>
                {discountAmount > 0 && (
                  <div className="flex justify-between text-xs text-emerald-400">
                    <span>Scholarship / Concession ({discountReason}):</span>
                    <span>-{formatCurrency(discountAmount)}</span>
                  </div>
                )}
                <div className="border-t border-slate-800 pt-2 flex justify-between text-sm font-bold">
                  <span>Net Payable Course Fee:</span>
                  <span className="text-base text-emerald-400">{formatCurrency(netFee)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Stepper Navigation Buttons */}
          <div className="flex items-center justify-between pt-2">
            <div>
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevStep}
                  className="gap-2 text-xs font-semibold"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Previous Step
                </Button>
              )}
            </div>

            <div className="flex items-center gap-3">
              {onCancel && (
                <Button type="button" variant="ghost" onClick={onCancel} className="text-xs">
                  Cancel
                </Button>
              )}

              {currentStep < 4 ? (
                <Button
                  type="button"
                  onClick={handleNextStep}
                  className="bg-slate-900 hover:bg-slate-800 text-white gap-2 text-xs font-bold px-6 shadow-md"
                >
                  Continue to Next Step
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleFinalSubmit}
                  disabled={loading}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 text-xs font-bold px-8 h-10 shadow-lg shadow-emerald-600/25"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {loading ? 'Registering...' : editStudent ? 'Save Changes' : 'Confirm & Complete Registration'}
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Right Sticky Summary Card (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="sticky top-20 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Fee Estimate (₹)
              </span>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Indian Rupee
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Standard Fee:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {formatCurrency(grossFee)}
                </span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Scholarship Waiver:</span>
                <span className="font-semibold text-emerald-600">
                  -{formatCurrency(discountAmount)}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-between items-baseline">
                <span className="font-bold text-slate-900 dark:text-white text-sm">Net Fee:</span>
                <span className="font-extrabold text-xl text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(netFee)}
                </span>
              </div>
            </div>

            {/* Quick Insights */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-950/60 border border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 space-y-1.5">
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                Khush Classes Student Ledger
              </p>
              <p>
                Upon completion, student is immediately enrolled in <strong>{selectedCourse?.code || 'KC'}</strong> with an auto-generated roll number.
              </p>
              <p>Installments can be tracked and recorded directly from the dashboard.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
