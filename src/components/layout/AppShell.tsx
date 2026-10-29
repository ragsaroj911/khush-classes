'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sidebar, MobileNavbar } from './Navbar';
import { RecordPaymentModal } from '@/components/payments/RecordPaymentModal';
import { StudentFormModal } from '@/components/students/StudentFormModal';
import {
  PlusCircle,
  Receipt,
  AlertTriangle,
  ArrowLeft,
  Home,
  GraduationCap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { isResendConfigured } from '@/lib/resend';

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [isPaymentOpen, setIsPaymentOpen] = React.useState(false);
  const [isStudentOpen, setIsStudentOpen] = React.useState(false);
  const [showConfigNotice, setShowConfigNotice] = React.useState(true);

  const isDemoMode = !isSupabaseConfigured;
  const isHomePage = pathname === '/';

  // Smart back navigation: goes back in history, or pushes to '/' if at top level or history ends
  const handleHugeBack = () => {
    if (isHomePage) return;

    // If on a sub-route like /receipt/123 or /students/new, go back or to home
    if (typeof window !== 'undefined' && window.history.length > 2) {
      window.history.back();
    } else {
      router.push('/');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/60 dark:bg-slate-950 flex flex-col lg:flex-row">
      {/* Sidebar for Desktop */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header with Back Button */}
        <MobileNavbar onBack={handleHugeBack} isHome={isHomePage} />

        {/* Top Header bar with HUGE BACK BUTTON on top right */}
        <header className="hidden lg:flex items-center justify-between px-8 py-3.5 border-b border-slate-200/80 bg-white/90 dark:bg-slate-950/90 backdrop-blur-md sticky top-0 z-30">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200">
                Official Portal
              </span>
              <span className="text-xs font-bold text-slate-400">
                Khush Classes
              </span>
            </div>
            <p className="text-sm font-bold text-slate-900 dark:text-slate-100 mt-0.5">
              Student Fee Management & Billing Console
            </p>
          </div>

          <div className="flex items-center gap-3.5">
            {/* Quick Action: Register Student */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsStudentOpen(true)}
              className="gap-2 text-xs font-semibold h-9"
            >
              <PlusCircle className="h-3.5 w-3.5 text-primary" />
              Add Student
            </Button>

            {/* Quick Action: Collect Payment */}
            <Button
              size="sm"
              onClick={() => setIsPaymentOpen(true)}
              className="gap-2 text-xs font-semibold h-9 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
            >
              <Receipt className="h-3.5 w-3.5" />
              Collect Fee (₹)
            </Button>

            {/* ============================================================== */}
            {/* HUGE BACK BUTTON ON TOP RIGHT (WORKS UNTIL HOME COMES) */}
            {/* ============================================================== */}
            {!isHomePage ? (
              <button
                type="button"
                onClick={handleHugeBack}
                title="Go back to previous page / Home"
                className="group relative flex items-center gap-2.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-rose-500 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white font-extrabold text-sm tracking-wide shadow-lg shadow-rose-600/30 hover:shadow-rose-600/50 hover:scale-105 active:scale-95 transition-all ring-2 ring-rose-300/40 cursor-pointer"
              >
                <ArrowLeft className="h-5 w-5 stroke-[3] group-hover:-translate-x-1 transition-transform" />
                <span className="font-black text-sm uppercase tracking-wider">
                  ← BACK TO HOME
                </span>
              </button>
            ) : (
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs uppercase tracking-wider border border-slate-200 dark:border-slate-700">
                <Home className="h-4 w-4 text-emerald-600" />
                <span>Khush Classes Home</span>
              </div>
            )}
          </div>
        </header>

        {/* Demo Mode / Environment Notice Banner (Dismissible) */}
        {isDemoMode && showConfigNotice && (
          <div className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/50 px-4 sm:px-8 py-2 text-xs text-amber-900 dark:text-amber-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
              <span>
                <strong>Khush Classes Local Mode:</strong> All fees are in Indian Rupees (₹). Connect live Supabase & Resend via <code className="bg-amber-100 dark:bg-amber-900/60 px-1.5 py-0.5 rounded font-mono text-[11px]">.env.local</code>.
              </span>
            </div>
            <button
              onClick={() => setShowConfigNotice(false)}
              className="text-amber-700 hover:text-amber-950 font-bold underline ml-4 text-[11px]"
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
