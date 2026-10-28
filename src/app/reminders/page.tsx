import { DueRemindersManager } from '@/components/reminders/DueRemindersManager';

export const metadata = {
  title: 'Fee Due Reminders & Email Notifications | Student Fee Management System',
  description: 'Automated email notices and payment reminders powered by Resend.',
};

export default function RemindersPage() {
  return <DueRemindersManager />;
}

