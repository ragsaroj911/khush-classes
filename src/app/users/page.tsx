'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { AuthUser, UserRole } from '@/types';
import { formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import {
  ShieldAlert,
  ShieldCheck,
  UserPlus,
  Users,
  Lock,
  Mail,
  User,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Sparkles,
} from 'lucide-react';

const STAFF_STORAGE_KEY = 'sfms_registered_staff';

export default function UsersManagementPage() {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading } = useAuth();

  const [users, setUsers] = React.useState<AuthUser[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);

  // New user form state
  const [newName, setNewName] = React.useState('');
  const [newEmail, setNewEmail] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [newRole, setNewRole] = React.useState<UserRole>('staff');
  const [submitting, setSubmitting] = React.useState(false);
  const [formError, setFormError] = React.useState<string | null>(null);
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null);

  const loadUsers = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/users');
      if (res.ok) {
        const data = await res.json();
        if (data.users && data.users.length > 0) {
          setUsers(data.users);
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn('Failed to load users from API, checking local storage:', err);
    }

    // Fallback: load local staff list + primary admin
    const fallbackList: AuthUser[] = [
      {
        id: 'primary-admin-01',
        email: 'khushmain8777@gmail.com',
        full_name: 'Khush (Admin)',
        role: 'admin',
        created_at: new Date().toISOString(),
      },
    ];

    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(STAFF_STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          parsed.forEach((s: { id: string; email: string; name: string; role: UserRole; created_at?: string }) => {
            if (!fallbackList.some((u) => u.email.toLowerCase() === s.email.toLowerCase())) {
              fallbackList.push({
                id: s.id,
                email: s.email,
                full_name: s.name,
                role: s.role,
                created_at: s.created_at || new Date().toISOString(),
              });
            }
          });
        }
      } catch (e) {
        console.error('Error parsing local staff:', e);
      }
    }

    setUsers(fallbackList);
    setLoading(false);
  }, []);

  React.useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/login');
      } else if (isAdmin) {
        loadUsers();
      }
    }
  }, [user, isAdmin, authLoading, router, loadUsers]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);
    setSubmitting(true);

    try {
      const payload = {
        email: newEmail.trim().toLowerCase(),
        password: newPassword.trim(),
        full_name: newName.trim(),
        role: newRole,
      };

      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to create user in Supabase');
      }

      // Also cache in local storage for seamless offline/fallback support
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(STAFF_STORAGE_KEY);
        const list = stored ? JSON.parse(stored) : [];
        list.push({
          id: data.user?.id || crypto.randomUUID(),
          email: payload.email,
          pass: payload.password,
          name: payload.full_name,
          role: payload.role,
          created_at: new Date().toISOString(),
        });
        localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(list));
      }

      setSuccessMessage(`New ${newRole.toUpperCase()} login for ${payload.email} has been created successfully!`);
      setNewName('');
      setNewEmail('');
      setNewPassword('');
      setNewRole('staff');
      setIsCreateModalOpen(false);
      await loadUsers();
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : 'Error creating user account');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex h-96 items-center justify-center text-xs text-slate-500">
        Verifying administrator credentials...
      </div>
    );
  }

  // Access Denied guard for non-admin users
  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-4">
        <div className="h-16 w-16 mx-auto rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center border border-rose-200 dark:border-rose-800">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
          Administrator Authority Required
        </h2>
        <p className="text-xs text-slate-500 leading-relaxed">
          Only the Primary Administrator (<strong>khushmain8777@gmail.com</strong>) has permissions to manage institutional user logins and issue staff credentials.
        </p>
        <Button onClick={() => router.push('/')} variant="outline" size="sm">
          Return to Dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200">
              Admin Control Panel
            </span>
            <span className="text-xs text-slate-400 font-medium">Khush Classes Security</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <ShieldCheck className="h-6 w-6 text-emerald-600" />
            Staff & User Login Access Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Issue and manage authorized staff and cashier credentials with role-based access control.
          </p>
        </div>

        <div>
          <Button
            size="sm"
            onClick={() => {
              setFormError(null);
              setIsCreateModalOpen(true);
            }}
            className="gap-2 text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md shadow-emerald-600/20"
          >
            <UserPlus className="h-4 w-4" />
            Add New User Login
          </Button>
        </div>
      </div>

      {/* Success Banner */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button
            onClick={() => setSuccessMessage(null)}
            className="text-emerald-700 font-bold underline text-[11px]"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Info Card */}
      <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-emerald-400" />
            <span className="font-bold text-sm">Role-Based Access Control (RBAC)</span>
          </div>
          <p className="text-slate-300 text-[11px]">
            <strong>Admin:</strong> Full system access, configuration, and user creation. &bull;{' '}
            <strong>Staff:</strong> Student fee ledger, payment recording, fee receipts, and reminder dispatches.
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-[11px] font-mono shrink-0">
          Supabase Auth Synchronized
        </span>
      </div>

      {/* Users Table */}
      <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-slate-500" />
            <span className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Active Authorized Accounts ({users.length})
            </span>
          </div>
        </div>

        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">Loading user credentials...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950/60 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3.5 pl-4">User & Name</th>
                  <th className="p-3.5">Email Address</th>
                  <th className="p-3.5 text-center">Assigned Role</th>
                  <th className="p-3.5">Created Date</th>
                  <th className="p-3.5 pr-4 text-right">Account Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {users.map((u) => {
                  const isSuperAdmin = u.email?.toLowerCase() === 'khushmain8777@gmail.com';
                  return (
                    <tr
                      key={u.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      <td className="p-3.5 pl-4">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300 text-xs">
                            {u.full_name ? u.full_name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 dark:text-white block">
                              {u.full_name || 'Staff Member'}
                            </span>
                            {isSuperAdmin && (
                              <span className="text-[10px] text-emerald-600 font-semibold">
                                Primary Institutional Admin
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="p-3.5 font-mono text-slate-700 dark:text-slate-300">
                        {u.email}
                      </td>

                      <td className="p-3.5 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                            u.role === 'admin'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300'
                              : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300'
                          }`}
                        >
                          {u.role === 'admin' ? 'Administrator' : 'Staff / Cashier'}
                        </span>
                      </td>

                      <td className="p-3.5 text-slate-500">
                        {u.created_at ? formatDate(u.created_at) : 'Active'}
                      </td>

                      <td className="p-3.5 pr-4 text-right">
                        <span className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-semibold">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Active
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create New User Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Authorized Portal User Login"
        description="Add a new staff, cashier, or administrator login to Khush Classes Supabase Auth."
      >
        <form onSubmit={handleCreateUser} className="space-y-4 pt-2">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{formError}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Full Name
            </label>
            <div className="relative">
              <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                required
                placeholder="e.g. Rajesh Kumar"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Email Address (Login Username)
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="email"
                required
                placeholder="staff@khushclasses.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Password (Minimum 6 characters)
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                required
                minLength={6}
                placeholder="Assign secure password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Authority Role
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div
                onClick={() => setNewRole('staff')}
                className={`p-3 rounded-xl border-2 transition-all cursor-pointer ${
                  newRole === 'staff'
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <span className="font-bold text-xs block">Staff / Cashier</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  Fee collection, student records, and receipts
                </span>
              </div>

              <div
                onClick={() => setNewRole('admin')}
                className={`p-3 rounded-xl border-2 transition-all cursor-pointer ${
                  newRole === 'admin'
                    ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                <span className="font-bold text-xs block">Administrator</span>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  Full control + user creation authority
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={submitting}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
            >
              {submitting ? 'Creating in Supabase...' : 'Confirm & Create User'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

