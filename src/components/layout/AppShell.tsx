'use client';

import * as React from 'react';
import { Sidebar, MobileNavbar } from './Navbar';
import { RecordPaymentModal } from '@/components/payments/RecordPaymentModal';
import { StudentFormModal } from '@/components/students/StudentFormModal';
import { PlusCircle, Receipt, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { isResendConfigured } from '@/lib/resend';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [isPaymentOpen, setIsPaymentOpen] = React.useState(false);
  const [isStudentOpen, setIsStudentOpen] = React.useState(false);
  const [showConfigNotice, setShowConfigNotice] = React.useState(true);

  const isDemoMode = !isSupabaseConfigured || !isResendConfigured;

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 flex flex-col lg:flex-row">
      {/* Sidebar for Desktop */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <MobileNavbar />

        {/* Top Header bar with quick actions */}
        <header className="hidden lg:flex items-center justify-between px-8 py-4 border-b border-slate-200/80 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md sticky top-0 z-30">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Institution Portal
            </span>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
              Student Fee Management & Billing Console
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsStudentOpen(true)}
              className="gap-2 text-xs"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              Register Student
            </Button>

            <Button
              size="sm"
              onClick={() => setIsPaymentOpen(true)}
              className="gap-2 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              <Receipt className="h-3.5 w-3.5" />
              Record Payment
            </Button>
          </div>
        </header>

        {/* Demo Mode / Environment Notice Banner (Dismissible) */}
        {isDemoMode && showConfigNotice && (
          <div className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/50 px-4 sm:px-8 py-2.5 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
              <span>
                <strong>Demo / Local Mode Active:</strong> Running with local reactive dataset. To sync live with PostgreSQL & Resend, add your keys in <code className="bg-amber-100 dark:bg-amber-900/60 px-1.5 py-0.5 rounded font-mono text-[11px]">.env.local</code>.
              </span>
            </div>
            <button
              onClick={() => setShowConfigNotice(false)}
              className="text-amber-700 hover:text-amber-950 font-semibold underline ml-4 text-[11px]"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Main Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Global Quick Action Modals */}
      <RecordPaymentModal
        isOpen={isPaymentOpen}
        onClose={() => setIsPaymentOpen(false)}
        onPaymentRecorded={() => {
          setIsPaymentOpen(false);
          // dispatch custom event to refresh views
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('sfms_data_updated'));
          }
        }}
      />

      <StudentFormModal
        isOpen={isStudentOpen}
        onClose={() => setIsStudentOpen(false)}
        onStudentSaved={() => {
          setIsStudentOpen(false);
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('sfms_data_updated'));
          }
        }}
      />
    </div>
  );
}
