import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

function getAdminClient() {
  if (!supabaseUrl || !serviceRoleKey) return null;
  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

// GET /api/admin/users - List users
export async function GET() {
  const adminClient = getAdminClient();
  if (!adminClient) {
    return NextResponse.json(
      { error: 'Supabase admin credentials are not configured.' },
      { status: 503 }
    );
  }

  try {
    const { data, error } = await adminClient.auth.admin.listUsers({
      perPage: 50,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const sanitizedUsers = (data.users || []).map((u) => ({
      id: u.id,
      email: u.email,
      full_name: u.user_metadata?.full_name || 'Staff Member',
      role: u.user_metadata?.role || (u.email?.toLowerCase() === 'khushmain8777@gmail.com' ? 'admin' : 'staff'),
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at,
    }));

    return NextResponse.json({ users: sanitizedUsers });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to list users';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/admin/users - Create new user
export async function POST(request: Request) {
  const adminClient = getAdminClient();
  if (!adminClient) {
    return NextResponse.json(
      { error: 'Supabase admin credentials are not configured.' },
      { status: 503 }
    );
  }

  try {
    const body = await request.json();
    const { email, password, full_name, role = 'staff' } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    const { data, error } = await adminClient.auth.admin.createUser({
      email: email.trim().toLowerCase(),
      password: password.trim(),
      email_confirm: true,
      user_metadata: {
        role: role === 'admin' ? 'admin' : 'staff',
        full_name: full_name?.trim() || (role === 'admin' ? 'Administrator' : 'Staff Member'),
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: data.user.id,
        email: data.user.email,
        full_name: data.user.user_metadata?.full_name,
        role: data.user.user_metadata?.role,
        created_at: data.user.created_at,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to create user';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

