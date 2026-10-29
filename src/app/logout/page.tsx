'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import {
  GraduationCap,
  LogOut,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Lock,
} from 'lucide-react';

export default function LogoutPage() {
  const { user, isAdmin, logout, loading } = useAuth();
  const router = useRouter();
  const [loggedOut, setLoggedOut] = React.useState(false);
  const [isSigningOut, setIsSigningOut] = React.useState(false);

  const instituteName = process.env.NEXT_PUBLIC_INSTITUTE_NAME || 'Khush Classes';

  const handleConfirmLogout = async () => {
    setIsSigningOut(true);
    try {
      await logout();
      setLoggedOut(true);
    } catch (err) {
      console.error('Logout failed:', err);
    } finally {
      setIsSigningOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden text-slate-100">
      {/* Background radial glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10 text-center px-4">
        {/* Brand Header */}
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-white text-slate-950 shadow-xl mb-4">
          <GraduationCap className="h-7 w-7 text-slate-900" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
          {instituteName}
        </h1>
        <p className="text-xs text-emerald-400 font-bold uppercase tracking-widest mt-1">
          Student Fee Management System
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
          {loggedOut || (!user && !loading) ? (
            /* Logged Out Confirmation Screen */
            <div className="text-center space-y-5">
              <div className="h-16 w-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-8 w-8" />
              </div>

              <div className="space-y-1.5">
                <h2 className="text-xl font-black text-white">
                  Successfully Signed Out
                </h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Your session on <strong className="text-slate-200">{instituteName}</strong> has been securely closed. All authentication tokens have been cleared.
                </p>
              </div>

              <div className="pt-2 space-y-3">
                <Link href="/login" className="block w-full">
                  <Button className="w-full h-11 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-600/20 gap-2">
                    <Lock className="h-4 w-4" />
                    Sign In to Portal Again
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>

                <Link href="/" className="block w-full">
                  <Button
                    variant="ghost"
                    className="w-full h-9 text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    Return to Portal Entrance
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            /* Active User Sign Out Confirmation */
            <div className="space-y-5">
              <div className="text-center space-y-1.5">
                <div className="h-12 w-12 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto mb-3">
                  <LogOut className="h-6 w-6" />
                </div>
                <h2 className="text-lg font-black text-white">
                  Sign Out of Your Account?
                </h2>
                <p className="text-xs text-slate-400">
                  Are you sure you want to log out of the fee management console?
                </p>
              </div>

              {/* Current user credential card */}
              {user && (
                <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3 text-emerald-400" />
                      Active Session
                    </span>
                    <span
                      className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        isAdmin
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}
                    >
                      {isAdmin ? 'ADMINISTRATOR' : 'STAFF'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">
                      {user.full_name || 'Khush Administrator'}
                    </p>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      {user.email}
                    </p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                <Button
                  onClick={handleConfirmLogout}
                  disabled={isSigningOut}
                  className="w-full h-11 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-rose-600/20 gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  {isSigningOut ? 'Ending Session...' : 'Confirm & Log Out'}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/')}
                  className="w-full h-10 border-slate-700 bg-slate-800/80 hover:bg-slate-800 text-slate-200 text-xs font-bold gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Cancel & Return to Dashboard
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="mt-6 text-center text-[11px] text-slate-500 space-y-1">
          <p>&copy; {new Date().getFullYear()} {instituteName}. All rights reserved.</p>
          <p>Standardized in Indian Rupees (₹) &bull; Supabase Auth Protected</p>
        </div>
      </div>
    </div>
  );
}
