'use client';

import * as React from 'react';
import { Student, Course, Batch, PaymentStatus } from '@/types';
import { formatCurrency, formatDate, getStatusBadgeClass } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Filter, Receipt, Eye, Mail, MoreHorizontal, UserCheck, AlertCircle } from 'lucide-react';

interface StudentTableProps {
  students: Student[];
  courses: Course[];
  batches: Batch[];
  onSelectStudent: (student: Student) => void;
  onRecordPayment: (student: Student) => void;
  onSendReminder: (student: Student) => void;
  onEditStudent: (student: Student) => void;
}

export function StudentTable({
  students,
  courses,
  batches,
  onSelectStudent,
  onRecordPayment,
  onSendReminder,
  onEditStudent,
}: StudentTableProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [selectedCourse, setSelectedCourse] = React.useState<string>('all');
  const [selectedBatch, setSelectedBatch] = React.useState<string>('all');
  const [selectedStatus, setSelectedStatus] = React.useState<string>('all');

  const filteredStudents = React.useMemo(() => {
    return students.filter((s) => {
      // Search match
      const query = searchTerm.toLowerCase();
      const matchesSearch =
        s.first_name.toLowerCase().includes(query) ||
        s.last_name.toLowerCase().includes(query) ||
        s.roll_number.toLowerCase().includes(query) ||
        s.email.toLowerCase().includes(query) ||
        s.phone.includes(query);

      // Course match
      const matchesCourse = selectedCourse === 'all' || s.course_id === selectedCourse;

      // Batch match
      const matchesBatch = selectedBatch === 'all' || s.batch_id === selectedBatch;

      // Status match
      const matchesStatus = selectedStatus === 'all' || s.payment_status === selectedStatus;

      return matchesSearch && matchesCourse && matchesBatch && matchesStatus;
    });
  }, [students, searchTerm, selectedCourse, selectedBatch, selectedStatus]);

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-sm">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search name, roll no, email..."
            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-300"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Course Filter */}
        <div>
          <select
            className="w-full py-2 px-3 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-300"
            value={selectedCourse}
            onChange={(e) => {
              setSelectedCourse(e.target.value);
              setSelectedBatch('all');
            }}
          >
            <option value="all">All Courses ({courses.length})</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} - {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Batch Filter */}
        <div>
          <select
            className="w-full py-2 px-3 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-300"
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
          >
            <option value="all">All Batches</option>
            {batches
              .filter((b) => selectedCourse === 'all' || b.course_id === selectedCourse)
              .map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
          </select>
        </div>

        {/* Payment Status Filter */}
        <div>
          <select
            className="w-full py-2 px-3 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 dark:focus:ring-slate-300"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">All Fee Statuses</option>
            <option value="paid">Paid in Full</option>
            <option value="partial">Partial Payment</option>
            <option value="overdue">Overdue</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Results Header count */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Showing <strong>{filteredStudents.length}</strong> of <strong>{students.length}</strong> students
        </span>
        {(searchTerm || selectedCourse !== 'all' || selectedStatus !== 'all' || selectedBatch !== 'all') && (
          <button
            onClick={() => {
              setSearchTerm('');
              setSelectedCourse('all');
              setSelectedBatch('all');
              setSelectedStatus('all');
            }}
            className="text-slate-800 dark:text-slate-200 underline font-medium"
          >
            Clear Filters
          </button>
        )}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="p-3.5 pl-4">Student & ID</th>
              <th className="p-3.5">Course / Batch</th>
              <th className="p-3.5 text-right">Net Fee</th>
              <th className="p-3.5 text-right">Paid</th>
              <th className="p-3.5 text-right">Balance</th>
              <th className="p-3.5 text-center">Status</th>
              <th className="p-3.5">Due Date</th>
              <th className="p-3.5 pr-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 font-medium">
            {filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-400">
                  No students found matching your search criteria.
                </td>
              </tr>
            ) : (
              filteredStudents.map((student) => {
                const badge = getStatusBadgeClass(student.payment_status);
                return (
                  <tr
                    key={student.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="p-3.5 pl-4">
                      <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                        {student.first_name} {student.last_name}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {student.roll_number}
                      </div>
                    </td>

                    <td className="p-3.5">
                      <div className="text-slate-900 dark:text-slate-200 font-medium">
                        {student.course?.code}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate max-w-[140px]">
                        {student.batch?.name}
                      </div>
                    </td>

                    <td className="p-3.5 text-right text-slate-700 dark:text-slate-300">
                      {formatCurrency(student.net_fee)}
                    </td>

                    <td className="p-3.5 text-right font-semibold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(student.paid_amount)}
                    </td>

                    <td className="p-3.5 text-right font-bold text-rose-600 dark:text-rose-400">
                      {formatCurrency(student.balance_amount)}
                    </td>

                    <td className="p-3.5 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${badge.bg} ${badge.border}`}
                      >
                        {student.payment_status}
                      </span>
                    </td>

                    <td className="p-3.5 text-slate-500 text-[11px]">
                      {student.due_date ? formatDate(student.due_date) : '-'}
                    </td>

                    <td className="p-3.5 pr-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2 text-xs"
                          onClick={() => onSelectStudent(student)}
                          title="View Ledger & Receipts"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </Button>

                        {student.balance_amount > 0 && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 px-2.5 text-xs text-emerald-700 hover:bg-emerald-50 border-emerald-200 dark:border-emerald-800 dark:text-emerald-400"
                            onClick={() => onRecordPayment(student)}
                            title="Record Payment"
                          >
                            <Receipt className="h-3.5 w-3.5 mr-1" />
                            Pay
                          </Button>
                        )}

                        {student.balance_amount > 0 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 text-xs text-amber-600 hover:bg-amber-50"
                            onClick={() => onSendReminder(student)}
                            title="Send Fee Reminder Email"
                          >
                            <Mail className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="grid grid-cols-1 gap-3 md:hidden">
        {filteredStudents.map((student) => {
          const badge = getStatusBadgeClass(student.payment_status);
          return (
            <div
              key={student.id}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white text-base">
                    {student.first_name} {student.last_name}
                  </h4>
                  <p className="text-xs font-mono text-slate-500 mt-0.5">{student.roll_number}</p>
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border ${badge.bg} ${badge.border}`}
                >
                  {student.payment_status}
                </span>
              </div>

              <div className="text-xs text-slate-600 dark:text-slate-400">
                <p>
                  <strong>Course:</strong> {student.course?.name} ({student.course?.code})
                </p>
                <p>
                  <strong>Batch:</strong> {student.batch?.name}
                </p>
                {student.due_date && (
                  <p>
                    <strong>Due Date:</strong> {formatDate(student.due_date)}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase">Net Fee</span>
                  <p className="font-bold text-slate-800 dark:text-slate-200">
                    {formatCurrency(student.net_fee)}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase">Paid</span>
                  <p className="font-bold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(student.paid_amount)}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase">Balance</span>
                  <p className="font-bold text-rose-600 dark:text-rose-400">
                    {formatCurrency(student.balance_amount)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs h-8"
                  onClick={() => onSelectStudent(student)}
                >
                  <Eye className="h-3 w-3 mr-1" />
                  View
                </Button>
                {student.balance_amount > 0 && (
                  <Button
                    size="sm"
                    className="text-xs h-8 bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => onRecordPayment(student)}
                  >
                    <Receipt className="h-3 w-3 mr-1" />
                    Pay
                  </Button>
                )}
                {student.balance_amount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs h-8 text-amber-600"
                    onClick={() => onSendReminder(student)}
                  >
                    <Mail className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
