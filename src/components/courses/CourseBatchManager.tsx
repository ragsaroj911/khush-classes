'use client';

import * as React from 'react';
import { Course, Batch, FeeStructure } from '@/types';
import { DataService } from '@/lib/storage';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { BookOpen, Users, Plus, Layers, Calendar, CheckCircle2 } from 'lucide-react';

export function CourseBatchManager() {
  const [courses, setCourses] = React.useState<Course[]>([]);
  const [batches, setBatches] = React.useState<Batch[]>([]);
  const [feeStructures, setFeeStructures] = React.useState<FeeStructure[]>([]);

  // Modals
  const [isCourseModalOpen, setIsCourseModalOpen] = React.useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = React.useState(false);
  const [isFeeModalOpen, setIsFeeModalOpen] = React.useState(false);
  const [selectedCourseForFee, setSelectedCourseForFee] = React.useState<Course | null>(null);

  // New Course fields
  const [code, setCode] = React.useState('');
  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [duration, setDuration] = React.useState('4 Years');
  const [defaultTotalFee, setDefaultTotalFee] = React.useState<number>(100000);

  // New Batch fields
  const [batchCourseId, setBatchCourseId] = React.useState('');
  const [batchName, setBatchName] = React.useState('');
  const [academicYear, setAcademicYear] = React.useState('2024-2025');
  const [startDate, setStartDate] = React.useState('2024-08-01');
  const [endDate, setEndDate] = React.useState('2028-06-30');
  const [maxCapacity, setMaxCapacity] = React.useState<number>(60);

  // Fee Breakdown fields
  const [feeTitle, setFeeTitle] = React.useState('Standard Annual Fee');
  const [tuitionFee, setTuitionFee] = React.useState<number>(0);
  const [admissionFee, setAdmissionFee] = React.useState<number>(0);
  const [examFee, setExamFee] = React.useState<number>(0);
  const [labFee, setLabFee] = React.useState<number>(0);
  const [otherFee, setOtherFee] = React.useState<number>(0);

  const loadData = React.useCallback(async () => {
    const c = await DataService.getCourses();
    const b = await DataService.getBatches();
    const f = await DataService.getFeeStructures();
    setCourses(c);
    setBatches(b);
    setFeeStructures(f);
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !name) return;
    await DataService.addCourse({
      code,
      name,
      description,
      duration,
      default_total_fee: Number(defaultTotalFee),
      is_active: true,
    });
    setIsCourseModalOpen(false);
    setCode('');
    setName('');
    setDescription('');
    loadData();
  };

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchCourseId || !batchName) return;
    await DataService.addBatch({
      course_id: batchCourseId,
      name: batchName,
      academic_year: academicYear,
      start_date: startDate,
      end_date: endDate,
      max_capacity: Number(maxCapacity),
      is_active: true,
    });
    setIsBatchModalOpen(false);
    setBatchName('');
    loadData();
  };

  const handleOpenFeeModal = (course: Course) => {
    setSelectedCourseForFee(course);
    const existing = feeStructures.find((f) => f.course_id === course.id);
    if (existing) {
      setFeeTitle(existing.title);
      setTuitionFee(existing.tuition_fee);
      setAdmissionFee(existing.admission_fee);
      setExamFee(existing.exam_fee);
      setLabFee(existing.lab_library_fee);
      setOtherFee(existing.other_fee);
    } else {
      setFeeTitle(`${course.code} Standard Fee Structure`);
      // default breakdown proportional to total
      const total = course.default_total_fee;
      setTuitionFee(Math.round(total * 0.65));
      setAdmissionFee(Math.round(total * 0.12));
      setExamFee(Math.round(total * 0.08));
      setLabFee(Math.round(total * 0.1));
      setOtherFee(Math.round(total * 0.05));
    }
    setIsFeeModalOpen(true);
  };

  const handleSaveFeeStructure = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseForFee) return;

    await DataService.saveFeeStructure({
      course_id: selectedCourseForFee.id,
      title: feeTitle,
      tuition_fee: Number(tuitionFee),
      admission_fee: Number(admissionFee),
      exam_fee: Number(examFee),
      lab_library_fee: Number(labFee),
      other_fee: Number(otherFee),
    });

    setIsFeeModalOpen(false);
    loadData();
  };

  const feeSum =
    Number(tuitionFee) +
    Number(admissionFee) +
    Number(examFee) +
    Number(labFee) +
    Number(otherFee);

  return (
    <div className="space-y-8">
      {/* Top Banner and Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            Academic Courses & Batches
          </h2>
          <p className="text-sm text-slate-500">
            Define degree programs, cohorts, and itemized fee structure schedules.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => {
              if (courses.length > 0) setBatchCourseId(courses[0].id);
              setIsBatchModalOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Add New Batch
          </Button>

          <Button
            size="sm"
            className="gap-2 bg-slate-900 text-white"
            onClick={() => setIsCourseModalOpen(true)}
          >
            <Plus className="h-4 w-4" />
            Add Course
          </Button>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {courses.map((course) => {
          const courseBatches = batches.filter((b) => b.course_id === course.id);
          const feeStructure = feeStructures.find((f) => f.course_id === course.id);

          return (
            <Card
              key={course.id}
              className="hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {course.code}
                      </span>
                      <CardTitle className="text-base mt-2">{course.name}</CardTitle>
                      {course.description && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                          {course.description}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-semibold text-slate-400 uppercase block">
                        Annual Fee
                      </span>
                      <span className="text-base font-bold text-slate-900 dark:text-white">
                        {formatCurrency(course.default_total_fee)}
                      </span>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-4 space-y-4">
                  {/* Fee Heads summary pill */}
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        Fee Breakdown Heads:
                      </span>
                      <button
                        onClick={() => handleOpenFeeModal(course)}
                        className="text-primary font-medium hover:underline text-[11px]"
                      >
                        {feeStructure ? 'Configure Heads' : '+ Define Heads'}
                      </button>
                    </div>

                    {feeStructure ? (
                      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                        <div className="flex justify-between">
                          <span>Tuition:</span>
                          <span className="font-medium text-slate-900 dark:text-slate-200">
                            {formatCurrency(feeStructure.tuition_fee)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Admission:</span>
                          <span className="font-medium text-slate-900 dark:text-slate-200">
                            {formatCurrency(feeStructure.admission_fee)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Exam:</span>
                          <span className="font-medium text-slate-900 dark:text-slate-200">
                            {formatCurrency(feeStructure.exam_fee)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Lab/Library:</span>
                          <span className="font-medium text-slate-900 dark:text-slate-200">
                            {formatCurrency(feeStructure.lab_library_fee)}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400 italic">
                        No custom breakdown defined. Click Configure to specify heads.
                      </p>
                    )}
                  </div>

                  {/* Batches under this course */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      <span className="flex items-center gap-1.5">
                        <Layers className="h-3.5 w-3.5 text-slate-400" />
                        Active Batches ({courseBatches.length})
                      </span>
                    </div>

                    {courseBatches.length === 0 ? (
                      <p className="text-xs text-slate-400 italic py-2">
                        No batches created for this course yet.
                      </p>
                    ) : (
                      <div className="space-y-1.5">
                        {courseBatches.map((b) => (
                          <div
                            key={b.id}
                            className="flex items-center justify-between p-2 rounded-lg bg-slate-50/70 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 text-xs"
                          >
                            <div>
                              <span className="font-semibold text-slate-800 dark:text-slate-200">
                                {b.name}
                              </span>
                              <span className="text-[11px] text-slate-400 ml-2 font-mono">
                                ({b.academic_year})
                              </span>
                            </div>
                            <span className="text-[11px] text-slate-500">
                              Cap: <strong>{b.max_capacity}</strong> students
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </div>

              <div className="p-4 pt-0 border-t border-slate-100 dark:border-slate-800 mt-4 flex items-center justify-between text-xs text-slate-500">
                <span>Duration: {course.duration}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs text-primary"
                  onClick={() => {
                    setBatchCourseId(course.id);
                    setIsBatchModalOpen(true);
                  }}
                >
                  + Add Batch
                </Button>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Modal: Create Course */}
      <Modal
        isOpen={isCourseModalOpen}
        onClose={() => setIsCourseModalOpen(false)}
        title="Add Academic Course"
        description="Register a new academic program or degree curriculum."
      >
        <form onSubmit={handleCreateCourse} className="space-y-4">
          <Input
            label="Course Code"
            required
            placeholder="e.g. CS101, MBA202"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <Input
            label="Course Name"
            required
            placeholder="e.g. B.Tech Computer Science"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            label="Duration"
            placeholder="e.g. 4 Years, 2 Years"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
          />
          <Input
            label="Default Total Fee"
            type="number"
            required
            min="0"
            value={defaultTotalFee}
            onChange={(e) => setDefaultTotalFee(Number(e.target.value))}
          />
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Description
            </label>
            <textarea
              className="w-full rounded-lg border border-slate-200 bg-white p-3 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 dark:border-slate-800 dark:bg-slate-950"
              rows={2}
              placeholder="Program overview and objective..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCourseModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Create Course</Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Create Batch */}
      <Modal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        title="Add New Batch / Section"
        description="Assign a cohort under a specific course program."
      >
        <form onSubmit={handleCreateBatch} className="space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Select Course <span className="text-rose-500">*</span>
            </label>
            <select
              required
              className="flex h-10 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 dark:border-slate-800 dark:bg-slate-950"
              value={batchCourseId}
              onChange={(e) => setBatchCourseId(e.target.value)}
            >
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.code} - {c.name}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Batch Name"
            required
            placeholder="e.g. Section 2024-A or Cohort 1"
            value={batchName}
            onChange={(e) => setBatchName(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Academic Year"
              required
              placeholder="2024-2025"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
            />
            <Input
              label="Max Capacity"
              type="number"
              min="1"
              value={maxCapacity}
              onChange={(e) => setMaxCapacity(Number(e.target.value))}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Start Date"
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <Input
              label="End Date"
              type="date"
              required
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsBatchModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Create Batch</Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Configure Fee Structure Breakdown */}
      <Modal
        isOpen={isFeeModalOpen}
        onClose={() => setIsFeeModalOpen(false)}
        title={`Fee Structure - ${selectedCourseForFee?.name || ''}`}
        description="Specify itemized fee categories and charges."
        maxWidth="lg"
      >
        <form onSubmit={handleSaveFeeStructure} className="space-y-4">
          <Input
            label="Fee Structure Title"
            required
            value={feeTitle}
            onChange={(e) => setFeeTitle(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Tuition Fee"
              type="number"
              min="0"
              value={tuitionFee}
              onChange={(e) => setTuitionFee(Number(e.target.value))}
            />
            <Input
              label="Admission / Registration"
              type="number"
              min="0"
              value={admissionFee}
              onChange={(e) => setAdmissionFee(Number(e.target.value))}
            />
            <Input
              label="Examination Fee"
              type="number"
              min="0"
              value={examFee}
              onChange={(e) => setExamFee(Number(e.target.value))}
            />
            <Input
              label="Lab & Library Fee"
              type="number"
              min="0"
              value={labFee}
              onChange={(e) => setLabFee(Number(e.target.value))}
            />
            <Input
              label="Other / Facility Charges"
              type="number"
              min="0"
              value={otherFee}
              onChange={(e) => setOtherFee(Number(e.target.value))}
            />
          </div>

          {/* Sum preview */}
          <div className="p-3 bg-slate-900 text-white rounded-xl flex items-center justify-between text-xs">
            <span>Calculated Total Fee:</span>
            <span className="text-base font-bold text-emerald-400">
              {formatCurrency(feeSum)}
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsFeeModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">Save Fee Heads</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
