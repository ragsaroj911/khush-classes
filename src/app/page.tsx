'use client';

import * as React from 'react';
import Link from 'next/link';
import { DataService } from '@/lib/storage';
import { DashboardMetrics, Student, Payment } from '@/types';
import { formatCurrency, formatDate, getStatusBadgeClass, getPaymentMethodLabel } from '@/lib/utils';
import { generateReceiptPdf } from '@/lib/receipt-generator';
import { RecordPaymentModal } from '@/components/payments/RecordPaymentModal';
import { StudentDetailModal } from '@/components/students/StudentDetailModal';
import { SendReminderModal } from '@/components/reminders/SendReminderModal';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import {
  Users,
  CreditCard,
  AlertCircle,
  TrendingUp,
  Receipt,
  Download,
  Mail,
  ArrowRight,
  PlusCircle,
  Eye,
  CheckCircle2,
  Clock,
  Sparkles,
  LogOut,
  ShieldCheck,
  UserCheck,
} from 'lucide-react';

export default function DashboardPage() {
  const { user, isAdmin, logout } = useAuth();
  const [metrics, setMetrics] = React.useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = React.useState(true);

  // Modals
  const [selectedStudentForDetail, setSelectedStudentForDetail] =
    React.useState<Student | null>(null);
  const [selectedStudentForPayment, setSelectedStudentForPayment] =
    React.useState<Student | null>(null);
  const [selectedStudentForReminder, setSelectedStudentForReminder] =
    React.useState<Student | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = React.useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = React.useState(false);

  const fetchMetrics = React.useCallback(async () => {
    try {
      const data = await DataService.getDashboardMetrics();
      setMetrics(data);
    } catch (err) {
      console.error('Failed to load metrics:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchMetrics();
    const handleUpdate = () => fetchMetrics();
    window.addEventListener('sfms_data_updated', handleUpdate);
    return () => window.removeEventListener('sfms_data_updated', handleUpdate);
  }, [fetchMetrics]);

  if (loading || !metrics) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-900 border-t-transparent mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Loading institutional fee records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200">
              Khush Classes
            </span>
            <span className="text-xs text-slate-400 font-medium">Fee Management Hub</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
            Finance & Fee Collection Overview (₹)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time student billing monitor, Indian Rupee collections, and overdue recovery.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/students/new">
            <Button size="sm" className="gap-2 text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white shadow-md">
              <PlusCircle className="h-4 w-4 text-emerald-400" />
              Add Student (Wizard)
            </Button>
          </Link>

          <Button
            size="sm"
            className="gap-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20"
            onClick={() => {
              setSelectedStudentForPayment(null);
              setIsPaymentModalOpen(true);
            }}
          >
            <Receipt className="h-3.5 w-3.5" />
            Collect Fee (₹)
          </Button>
        </div>
      </div>

      {/* Active User Session & Logout Action Banner on Home Page */}
      {user && (
        <div className="flex flex-col md:flex-row md:items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-md border border-slate-700/60 gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">
                  {user.full_name || 'Khush Administrator'}
                </span>
                <span
                  className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                    isAdmin
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                  }`}
                >
                  {isAdmin ? 'ADMINISTRATOR' : 'STAFF'}
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Logged in as <span className="text-slate-200 font-medium">{user.email}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-auto">
            {isAdmin && (
              <Link href="/users">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border-white/20"
                >
                  <UserCheck className="h-3.5 w-3.5 mr-1 text-emerald-400" />
                  Manage Logins
                </Button>
              </Link>
            )}

            <Link href="/logout">
              <Button
                size="sm"
                className="h-8 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-600/30 gap-1.5"
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign Out / Log Out
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Fee Collected
            </span>
            <div className="h-8 w-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-extrabold text-slate-900 dark:text-white">
            {formatCurrency(metrics.totalCollected)}
          </div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">
            {formatCurrency(metrics.collectedThisMonth)} collected this month
          </p>
        </Card>

        <Card className="p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Pending Receivables
            </span>
            <div className="h-8 w-8 rounded-lg bg-amber-50 dark:bg-amber-950/50 text-amber-600 flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-extrabold text-amber-600 dark:text-amber-400">
            {formatCurrency(metrics.totalPending)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {metrics.partialStudentsCount + metrics.pendingStudentsCount} students with balance
          </p>
        </Card>

        <Card className="p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Overdue Receivables
            </span>
            <div className="h-8 w-8 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 flex items-center justify-center">
              <AlertCircle className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-extrabold text-rose-600 dark:text-rose-400">
            {formatCurrency(metrics.totalOverdue)}
          </div>
          <p className="text-[11px] text-rose-600 font-medium mt-1">
            {metrics.overdueStudentsCount} accounts past due date
          </p>
        </Card>

        <Card className="p-5 hover:border-slate-300 dark:hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Student Enrollment
            </span>
            <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl font-extrabold text-slate-900 dark:text-white">
            {metrics.totalStudents}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {metrics.paidStudentsCount} cleared &bull; {metrics.partialStudentsCount} partial
          </p>
        </Card>
      </div>

      {/* Eye-Catching Add Student Process Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-7 shadow-xl border border-indigo-900/40">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <Sparkles className="h-3 w-3" />
                Khush Classes Admissions
              </span>
              <span className="text-xs text-slate-400 font-semibold">• 4-Step Guided Flow</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Student Registration & Fee Assessment Process
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Interactive 4-step guided wizard: Student profile, coaching batch, itemized fee breakdown in Indian Rupees (₹), scholarship waiver calculator, and instant admission confirmation.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link href="/students/new">
              <Button size="lg" className="bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-600 hover:to-teal-500 text-slate-950 font-black text-sm px-6 h-12 shadow-lg shadow-emerald-500/25 gap-2 rounded-xl">
                <PlusCircle className="h-5 w-5" />
                Start Student Registration
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Two-Column Section: Urgent Dues & Recent Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Urgent Dues Queue */}
        <Card className="flex flex-col justify-between">
          <div>
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-rose-500" />
                  Urgent & Overdue Fee Accounts
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Priority students requiring immediate payment clearance.
                </p>
              </div>
              <Link href="/pending">
                <Button variant="ghost" size="sm" className="h-8 text-xs gap-1">
                  View All ({metrics.overdueStudentsCount})
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </CardHeader>

            <CardContent className="p-0">
              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {metrics.urgentDueStudents.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">
                    No urgent pending dues found.
                  </div>
                ) : (
                  metrics.urgentDueStudents.map((student) => {
                    const badge = getStatusBadgeClass(student.payment_status);
                    return (
                      <div
                        key={student.id}
                        className="p-4 flex items-center justify-between hover:bg-slate-50/70 dark:hover:bg-slate-900/50 transition-colors"
                      >
                        <div className="space-y-0.5">
                          <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                            {student.first_name} {student.last_name}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {student.roll_number} &bull; {student.course?.code}
                          </div>
                          <div className="text-[11px] text-rose-600 font-medium">
                            Due: {formatDate(student.due_date)}
                          </div>
                        </div>

                        <div className="text-right space-y-1">
                          <div className="font-bold text-rose-600 dark:text-rose-400 text-sm">
                            {formatCurrency(student.balance_amount)}
                          </div>
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-7 px-2 text-[11px] gap-1 text-emerald-700 border-emerald-200 hover:bg-emerald-50"
                              onClick={() => {
                                setSelectedStudentForPayment(student);
                                setIsPaymentModalOpen(true);
                              }}
                            >
                              <Receipt className="h-3 w-3" />
                              Pay
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 px-2 text-[11px] text-amber-600 hover:bg-amber-50"
                              onClick={() => {
                                setSelectedStudentForReminder(student);
                                setIsReminderModalOpen(true);
                              }}
                              title="Send Email Reminder"
                            >
                              <Mail className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </div>

          <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-center text-xs">
            <Link
              href="/reminders"
              className="text-slate-700 dark:text-slate-300 hover:underline font-medium inline-flex items-center gap-1"
            >
              Trigger bulk fee due reminder emails via Resend
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </Card>

        {/* Recent Payment Receipts Feed */}
        <Card className="flex flex-col justify-between">
          <div>
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  Recent Fee Receipts
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  Latest validated collections across all courses.
                </p>
              </div>
              <Link href="/payments">
                <Button variant="ghost" size="sm" className="h-8 text-xs gap-1">
                  All ({metrics.recentPayments.length})
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </CardHeader>

            <CardContent className="p-0">
              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {metrics.recentPayments.length === 0 ? (
                  <div className="p-8 text-center text-slate-400">
                    No payment receipts generated yet.
                  </div>
                ) : (
                  metrics.recentPayments.map((payment) => (
                    <div
                      key={payment.id}
                      className="p-4 flex items-center justify-between hover:bg-slate-50/70 dark:hover:bg-slate-900/50 transition-colors"
                    >
                      <div className="space-y-0.5">
                        <div className="font-semibold text-slate-900 dark:text-slate-100 text-sm">
                          {payment.student
                            ? `${payment.student.first_name} ${payment.student.last_name}`
                            : 'Unknown Student'}
                        </div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {payment.receipt_number} &bull; {formatDate(payment.payment_date)}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {getPaymentMethodLabel(payment.payment_method)}
                        </div>
                      </div>

                      <div className="text-right space-y-1">
                        <div className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                          {formatCurrency(payment.amount)}
                        </div>
                        {payment.student && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 px-2 text-[11px] gap-1 text-slate-600 hover:text-slate-900"
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
                            <Download className="h-3 w-3" />
                            PDF
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </div>

          <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-center text-xs">
            <Link
              href="/reports"
              className="text-slate-700 dark:text-slate-300 hover:underline font-medium inline-flex items-center gap-1"
            >
              View monthly financial audit and revenue analytics
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </Card>
      </div>

      {/* Modals */}
      <RecordPaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setSelectedStudentForPayment(null);
        }}
        preSelectedStudent={selectedStudentForPayment}
        onPaymentRecorded={() => fetchMetrics()}
      />

      <StudentDetailModal
        student={selectedStudentForDetail}
        isOpen={Boolean(selectedStudentForDetail)}
        onClose={() => setSelectedStudentForDetail(null)}
        onRecordPaymentClick={(student) => {
          setSelectedStudentForPayment(student);
          setIsPaymentModalOpen(true);
        }}
        onSendReminderClick={(student) => {
          setSelectedStudentForReminder(student);
          setIsReminderModalOpen(true);
        }}
      />

      <SendReminderModal
        student={selectedStudentForReminder}
        isOpen={isReminderModalOpen}
        onClose={() => {
          setIsReminderModalOpen(false);
          setSelectedStudentForReminder(null);
        }}
        onReminderSent={() => fetchMetrics()}
      />
    </div>
  );
}

