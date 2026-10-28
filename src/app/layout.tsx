import type { Metadata } from 'next';
import './globals.css';
import { AppShell } from '@/components/layout/AppShell';

export const metadata: Metadata = {
  title: 'Khush Classes | Student Fee Management System',
  description:
    'Modern, minimalist, responsive Student Fee Management System for Khush Classes with Supabase, Resend, and Next.js.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-slate-50 dark:bg-slate-950 font-sans antialiased text-slate-900 dark:text-slate-100">
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}

