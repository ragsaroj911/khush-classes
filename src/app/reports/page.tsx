import { FinancialReports } from '@/components/reports/FinancialReports';

export const metadata = {
  title: 'Collection Reports & Financial Analytics | Student Fee Management System',
  description: 'Monthly collection reports, channel breakdown, and CSV audit exports.',
};

export default function ReportsPage() {
  return <FinancialReports />;
}
