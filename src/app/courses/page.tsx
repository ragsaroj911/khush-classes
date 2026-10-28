import { CourseBatchManager } from '@/components/courses/CourseBatchManager';

export const metadata = {
  title: 'Courses, Batches & Fee Structure | Student Fee Management System',
  description: 'Manage academic courses, batches, and configure fee structure schedules.',
};

export default function CoursesPage() {
  return <CourseBatchManager />;
}
