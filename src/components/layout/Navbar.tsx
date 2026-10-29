'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Receipt,
  AlertCircle,
  Mail,
  BarChart3,
  Menu,
  X,
  GraduationCap,
  Sparkles,
  Database,
  Send,
  UserCheck,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { isSupabaseConfigured } from '@/lib/supabase/client';
import { isResendConfigured } from '@/lib/resend';
import { useAuth } from '@/lib/auth-context';

const BASE_NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/students', label: 'Students', icon: Users },
  { href: '/courses', label: 'Courses & Batches', icon: BookOpen },
  { href: '/payments', label: 'Payments & Receipts', icon: Receipt },
  { href: '/pending', label: 'Pending Dues', icon: AlertCircle, badge: 'Due' },
  { href: '/reminders', label: 'Email Reminders', icon: Mail },
  { href: '/reports', label: 'Collection Reports', icon: BarChart3 },
];

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname();
  const { user, isAdmin, logout } = useAuth();
  const instituteName = process.env.NEXT_PUBLIC_INSTITUTE_NAME || 'Khush Classes';

  const navItems = React.useMemo(() => {
    if (isAdmin) {
      return [
        ...BASE_NAV_ITEMS,
        { href: '/users', label: 'Staff & Logins', icon: UserCheck, badge: 'Admin' },
      ];
    }
    return BASE_NAV_ITEMS;
  }, [isAdmin]);

  return (
    <aside
      className={cn(
        'hidden lg:flex flex-col w-64 border-r border-slate-200/80 bg-white dark:bg-slate-950 dark:border-slate-800 min-h-screen p-4 justify-between',
        className
      )}
    >
      <div>
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 px-3 py-4 mb-3 group">
          <div className="h-10 w-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold shadow-md dark:bg-white dark:text-slate-900 group-hover:scale-105 transition-transform">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-tight text-slate-900 dark:text-white leading-tight">
              {instituteName}
            </h1>
            <p className="text-[11px] text-slate-500 font-medium tracking-wide uppercase">
              Fee Portal
            </p>
          </div>
        </Link>

        {/* Navigation links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all group',
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-100 dark:hover:bg-slate-800/60'
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={cn(
                      'h-4 w-4 transition-transform group-hover:scale-110',
                      isActive ? 'text-white dark:text-slate-900' : 'text-slate-400 dark:text-slate-500'
                    )}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={cn(
                      'text-[10px] font-semibold px-1.5 py-0.5 rounded-full',
                      item.badge === 'Admin'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : isActive
                        ? 'bg-white/20 text-white dark:bg-slate-900/20 dark:text-slate-900'
                        : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Session & Status Card */}
      <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        {user && (
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                <ShieldCheck className="h-3 w-3 text-emerald-500" />
                Active Session
              </span>
              <span
                className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                  isAdmin
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                }`}
              >
                {isAdmin ? 'ADMIN' : 'STAFF'}
              </span>
            </div>

            <div className="text-xs">
              <p className="font-bold text-slate-900 dark:text-white truncate">
                {user.full_name || 'Khush Admin'}
              </p>
              <p className="text-[11px] text-slate-500 truncate font-mono mt-0.5">
                {user.email}
              </p>
            </div>

            <button
              type="button"
              onClick={() => logout()}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign Out
            </button>
          </div>
        )}

        {/* Integration Status Indicators */}
        <div className="rounded-xl bg-slate-50 dark:bg-slate-900/40 p-2.5 border border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Database className="h-3 w-3 text-emerald-600" />
            Supabase DB
          </span>
          <span className="h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-emerald-200" title="Connected" />
        </div>
      </div>
    </aside>
  );
}

export function MobileNavbar({
  onBack,
  isHome,
}: {
  onBack?: () => void;
  isHome?: boolean;
}) {
  const [isOpen, setIsOpen] = React.useState(false);
  const pathname = usePathname();
  const { user, isAdmin, logout } = useAuth();
  const instituteName = process.env.NEXT_PUBLIC_INSTITUTE_NAME || 'Khush Classes';

  const navItems = React.useMemo(() => {
    if (isAdmin) {
      return [
        ...BASE_NAV_ITEMS,
        { href: '/users', label: 'Staff & Logins', icon: UserCheck, badge: 'Admin' },
      ];
    }
    return BASE_NAV_ITEMS;
  }, [isAdmin]);

  React.useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between px-4 py-2.5 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <Link href="/" className="flex items-center gap-2">
        <div className="h-8 w-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold shadow">
          <GraduationCap className="h-4 w-4" />
        </div>
        <div>
          <span className="font-extrabold text-sm text-slate-900 dark:text-white block leading-tight">
            {instituteName}
          </span>
          <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider block">
            Fee Portal
          </span>
        </div>
      </Link>

      <div className="flex items-center gap-2">
        {!isHome && onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-rose-600 to-amber-600 text-white font-black text-xs uppercase tracking-wider shadow-md hover:scale-105 active:scale-95 transition-all"
            title="Go back"
          >
            ← BACK
          </button>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 top-[53px] z-50 bg-white dark:bg-slate-950 p-6 flex flex-col justify-between overflow-y-auto">
          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium transition-colors',
                    isActive
                      ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900'
                      : 'text-slate-700 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={cn(
                        'text-xs font-semibold px-2 py-0.5 rounded-full',
                        item.badge === 'Admin'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-700'
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {user && (
            <div className="pt-6 border-t border-slate-200 dark:border-slate-800 space-y-3">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs">
                <span className="text-[10px] uppercase font-bold text-emerald-600 block mb-0.5">
                  Signed in as {isAdmin ? 'Administrator' : 'Staff'}
                </span>
                <p className="font-bold text-slate-900 dark:text-white">{user.full_name}</p>
                <p className="font-mono text-slate-500">{user.email}</p>
              </div>

              <button
                type="button"
                onClick={() => logout()}
                className="w-full py-2.5 rounded-xl bg-rose-50 text-rose-700 font-bold text-sm flex items-center justify-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
