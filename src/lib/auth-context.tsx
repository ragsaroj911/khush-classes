'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { AuthUser, UserRole } from '@/types';
import { supabase, isSupabaseConfigured } from './supabase/client';

interface AuthContextType {
  user: AuthUser | null;
  role: UserRole | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'sfms_auth_user';
const STAFF_STORAGE_KEY = 'sfms_registered_staff';

const PRIMARY_ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@khushclasses.com';
const PRIMARY_ADMIN_PASS = process.env.NEXT_PUBLIC_ADMIN_DEFAULT_PASS || 'Admin@Khush123';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [loading, setLoading] = React.useState(true);

  // Restore session on mount
  React.useEffect(() => {
    async function initSession() {
      try {
        if (isSupabaseConfigured && supabase) {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const role: UserRole =
              session.user.user_metadata?.role ||
              (session.user.email?.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase()
                ? 'admin'
                : 'staff');

            const authUser: AuthUser = {
              id: session.user.id,
              email: session.user.email || '',
              full_name: session.user.user_metadata?.full_name || (role === 'admin' ? 'Khush (Admin)' : 'Staff Member'),
              role,
              created_at: session.user.created_at,
            };
            setUser(authUser);
            if (typeof window !== 'undefined') {
              localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
            }
            setLoading(false);
            return;
          }
        }

        // Fallback local storage check
        if (typeof window !== 'undefined') {
          const cached = localStorage.getItem(AUTH_STORAGE_KEY);
          if (cached) {
            setUser(JSON.parse(cached));
          }
        }
      } catch (err) {
        console.warn('Auth session check error:', err);
      } finally {
        setLoading(false);
      }
    }

    initSession();

    if (isSupabaseConfigured && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          const role: UserRole =
            session.user.user_metadata?.role ||
            (session.user.email?.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase()
              ? 'admin'
              : 'staff');

          const authUser: AuthUser = {
            id: session.user.id,
            email: session.user.email || '',
            full_name: session.user.user_metadata?.full_name || (role === 'admin' ? 'Khush (Admin)' : 'Staff Member'),
            role,
            created_at: session.user.created_at,
          };
          setUser(authUser);
          if (typeof window !== 'undefined') {
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
          }
        } else if (_event === 'SIGNED_OUT') {
          setUser(null);
          if (typeof window !== 'undefined') {
            localStorage.removeItem(AUTH_STORAGE_KEY);
          }
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  // Protected route enforcement
  React.useEffect(() => {
    if (loading) return;

    const isAuthPage = pathname === '/login' || pathname === '/logout';

    if (!user && !isAuthPage) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
    } else if (user && pathname === '/login') {
      router.push('/');
    }
  }, [user, loading, pathname, router]);

  const login = async (
    emailInput: string,
    passwordInput: string
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = emailInput.trim().toLowerCase();
    const cleanPass = passwordInput.trim();

    if (!cleanEmail || !cleanPass) {
      return { success: false, error: 'Please enter both email and password.' };
    }

    // 1. Try Supabase Auth first
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: cleanEmail,
          password: cleanPass,
        });

        if (!error && data.user) {
          const role: UserRole =
            data.user.user_metadata?.role ||
            (cleanEmail === PRIMARY_ADMIN_EMAIL.toLowerCase() ? 'admin' : 'staff');

          const authUser: AuthUser = {
            id: data.user.id,
            email: data.user.email || cleanEmail,
            full_name:
              data.user.user_metadata?.full_name ||
              (role === 'admin' ? 'Khush (Admin)' : 'Staff Member'),
            role,
            created_at: data.user.created_at,
          };

          setUser(authUser);
          if (typeof window !== 'undefined') {
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(authUser));
          }
          return { success: true };
        } else if (error && !error.message.includes('Invalid login credentials')) {
          console.warn('Supabase auth warning:', error.message);
        }
      } catch (e) {
        console.warn('Supabase signInWithPassword exception:', e);
      }
    }

    // 2. Fallback check for Primary Admin credentials
    if (
      cleanEmail === PRIMARY_ADMIN_EMAIL.toLowerCase() &&
      cleanPass === PRIMARY_ADMIN_PASS
    ) {
      const adminUser: AuthUser = {
        id: 'admin-super-id-001',
        email: PRIMARY_ADMIN_EMAIL,
        full_name: 'Khush (Admin)',
        role: 'admin',
        created_at: new Date().toISOString(),
      };
      setUser(adminUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(adminUser));
      }
      return { success: true };
    }

    // 3. Fallback check for local staff logins added by admin
    if (typeof window !== 'undefined') {
      try {
        const savedStaffJson = localStorage.getItem(STAFF_STORAGE_KEY);
        if (savedStaffJson) {
          const staffList: Array<{ email: string; pass: string; name: string; role: UserRole; id: string }> =
            JSON.parse(savedStaffJson);
          const match = staffList.find(
            (s) => s.email.toLowerCase() === cleanEmail && s.pass === cleanPass
          );
          if (match) {
            const staffUser: AuthUser = {
              id: match.id,
              email: match.email,
              full_name: match.name,
              role: match.role,
              created_at: new Date().toISOString(),
            };
            setUser(staffUser);
            localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(staffUser));
            return { success: true };
          }
        }
      } catch (err) {
        console.error('Error verifying local staff list:', err);
      }
    }

    return {
      success: false,
      error: 'Invalid email or password. Please verify your login credentials.',
    };
  };

  const logout = async () => {
    try {
      if (isSupabaseConfigured && supabase) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.warn('Sign out error:', err);
    } finally {
      setUser(null);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
      router.push('/login');
    }
  };

  const isAdmin = user?.role === 'admin' || user?.email?.toLowerCase() === PRIMARY_ADMIN_EMAIL.toLowerCase();

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAdmin,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

