'use client';

import * as React from 'react';
import { Payment, Student, Course } from '@/types';
import { DataService } from '@/lib/storage';
import { formatCurrency, formatDate, getPaymentMethodLabel } from '@/lib/utils';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  Download,
  CreditCard,
  PieChart,
  Calendar,
  Layers,
  DollarSign,
  ArrowUpRight,
} from 'lucide-react';

export function FinancialReports() {
  const [payments, setPayments] = React.useState<Payment[]>([]);
  const [students, setStudents] = React.useState<Student[]>([]);
  const [courses, setCourses] = React.useState<Course[]>([]);
  const [selectedYear, setSelectedYear] = React.useState<number>(new Date().getFullYear());

  React.useEffect(() => {
    async function loadData() {
      const p = await DataService.getPayments();
      const s = await DataService.getStudents();
      const c = await DataService.getCourses();
      setPayments(p);
      setStudents(s);
      setCourses(c);
    }
    loadData();
  }, []);

  // Aggregations
  const totalBilled = students.reduce((acc, s) => acc + Number(s.net_fee || 0), 0);
  const totalCollected = payments.reduce((acc, p) => acc + Number(p.amount || 0), 0);
  const totalOutstanding = students.reduce((acc, s) => acc + Number(s.balance_amount || 0), 0);
  const collectionRate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0;

  // Monthly breakdown for selected year
  const monthlyData = React.useMemo(() => {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];

    const totals = new Array(12).fill(0);
    const counts = new Array(12).fill(0);

    payments.forEach((p) => {
      const d = new Date(p.payment_date);
      if (d.getFullYear() === selectedYear) {
        const m = d.getMonth();
        totals[m] += Number(p.amount || 0);
        counts[m] += 1;
      }
    });

    const maxVal = Math.max(...totals, 1);

    return months.map((month, idx) => ({
      month,
      amount: totals[idx],
      count: counts[idx],
      percent: Math.round((totals[idx] / maxVal) * 100),
    }));
  }, [payments, selectedYear]);

  // Breakdown by payment method
  const methodBreakdown = React.useMemo(() => {
    const map: Record<string, number> = {};
    payments.forEach((p) => {
      map[p.payment_method] = (map[p.payment_method] || 0) + Number(p.amount || 0);
    });
    return Object.entries(map).map(([method, amount]) => ({
      method,
      label: getPaymentMethodLabel(method),
      amount,
      percentage: totalCollected > 0 ? Math.round((amount / totalCollected) * 100) : 0,
    }));
  }, [payments, totalCollected]);

  // Breakdown by course
  const courseBreakdown = React.useMemo(() => {
    return courses.map((course) => {
      const courseStudents = students.filter((s) => s.course_id === course.id);
      const studentIds = new Set(courseStudents.map((s) => s.id));
      const coursePayments = payments.filter((p) => studentIds.has(p.student_id));
      const collected = coursePayments.reduce((acc, p) => acc + Number(p.amount || 0), 0);
      const expected = courseStudents.reduce((acc, s) => acc + Number(s.net_fee || 0), 0);
      const outstanding = courseStudents.reduce((acc, s) => acc + Number(s.balance_amount || 0), 0);

      return {
        course,
        studentCount: courseStudents.length,
        collected,
        expected,
        outstanding,
      };
    });
  }, [courses, students, payments]);

  // Export to CSV
  const handleExportCsv = () => {
    if (payments.length === 0) {
      alert('No payment records to export');
      return;
    }

    const headers = [
      'Receipt Number',
      'Payment Date',
      'Student Roll',
      'Student Name',
      'Course',
      'Payment Mode',
      'Transaction ID',
      'Amount',
      'Remarks',
    ];

    const rows = payments.map((p) => [
      p.receipt_number,
      p.payment_date,
      p.student?.roll_number || '',
      `"${p.student?.first_name || ''} ${p.student?.last_name || ''}"`,
      `"${p.student?.course?.code || ''}"`,
      p.payment_method,
      p.transaction_id || '',
      p.amount,
      `"${p.remarks || ''}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `fee_collection_report_${selectedYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8">
      {/* Top Banner & Export */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200">
              Khush Classes
            </span>
            <span className="text-xs text-slate-400 font-medium">Financial Analytics</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            Collection Analytics & Revenue Reports (₹)
          </h2>
          <p className="text-sm text-slate-500">
            Monthly cash flows in Indian Rupees (₹), collection efficiency, and multi-channel revenue distribution.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            className="h-9 px-3 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900"
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
          >
            <option value={2026}>Academic Year 2026</option>
            <option value={2025}>Academic Year 2025</option>
            <option value={2024}>Academic Year 2024</option>
          </select>

          <Button
            size="sm"
            variant="outline"
            onClick={handleExportCsv}
            className="gap-2 text-xs"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Total Net Billed
            </span>
            <DollarSign className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
            {formatCurrency(totalBilled)}
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            Across {students.length} enrolled students
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Total Collected
            </span>
            <TrendingUp className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">
            {formatCurrency(totalCollected)}
          </div>
          <p className="text-[11px] text-emerald-700 dark:text-emerald-500 font-medium mt-1">
            {payments.length} verified transactions
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              Outstanding Dues
            </span>
            <ArrowUpRight className="h-4 w-4 text-rose-500" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-rose-600 dark:text-rose-400">
            {formatCurrency(totalOutstanding)}
          </div>
          <p className="text-[11px] text-rose-700 dark:text-rose-500 font-medium mt-1">
            Active receivables backlog
          </p>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Collection Ratio
            </span>
            <PieChart className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
            {collectionRate}%
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-emerald-500 h-1.5 rounded-full"
              style={{ width: `${Math.min(collectionRate, 100)}%` }}
            />
          </div>
        </Card>
      </div>

      {/* Visual Monthly Revenue Chart / Bar Columns */}
      <Card>
        <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">
              Monthly Fee Collection Trend ({selectedYear})
            </CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">
              Cash flow trajectory and volume of receipts per calendar month.
            </p>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="grid grid-cols-12 gap-2 sm:gap-4 items-end h-48 sm:h-56 pt-4 pb-2">
            {monthlyData.map((item) => (
              <div key={item.month} className="flex flex-col items-center h-full justify-end group">
                <div className="text-[10px] font-mono font-semibold text-slate-600 dark:text-slate-400 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.amount > 0 ? `${(item.amount / 1000).toFixed(0)}k` : '0'}
                </div>
                <div
                  className="w-full max-w-[32px] bg-slate-900 dark:bg-slate-100 rounded-t-md transition-all group-hover:bg-emerald-600 dark:group-hover:bg-emerald-400"
                  style={{
                    height: `${Math.max(item.percent, 4)}%`,
                  }}
                  title={`${item.month} ${selectedYear}: ${formatCurrency(item.amount)} (${item.count} receipts)`}
                />
                <span className="text-[11px] font-semibold text-slate-500 mt-2 block">
                  {item.month}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Channel Distribution & Course Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payment Methods */}
        <Card>
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-slate-400" />
              Collections by Payment Method
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {methodBreakdown.map((m) => (
              <div key={m.method} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {m.label}
                  </span>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 dark:text-white">
                      {formatCurrency(m.amount)}
                    </span>
                    <span className="text-slate-400 ml-1.5 font-mono">({m.percentage}%)</span>
                  </div>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-slate-900 dark:bg-slate-100 h-2 rounded-full"
                    style={{ width: `${m.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Program / Course Collections */}
        <Card>
          <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-base flex items-center gap-2">
              <Layers className="h-4 w-4 text-slate-400" />
              Collections by Academic Degree
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-100 dark:border-slate-800">
                  <tr>
                    <th className="p-3 pl-4">Degree</th>
                    <th className="p-3 text-right">Students</th>
                    <th className="p-3 text-right">Collected</th>
                    <th className="p-3 pr-4 text-right">Outstanding</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {courseBreakdown.map((c) => (
                    <tr key={c.course.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                      <td className="p-3 pl-4 font-semibold text-slate-900 dark:text-slate-100">
                        {c.course.code}
                      </td>
                      <td className="p-3 text-right text-slate-500">{c.studentCount}</td>
                      <td className="p-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                        {formatCurrency(c.collected)}
                      </td>
                      <td className="p-3 pr-4 text-right font-bold text-rose-600 dark:text-rose-400">
                        {formatCurrency(c.outstanding)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

