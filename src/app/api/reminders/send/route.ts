import { NextResponse } from 'next/server';
import { sendFeeDueReminder } from '@/lib/resend';
import { getServerSupabase, isServerSupabaseConfigured } from '@/lib/supabase/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      studentId,
      toEmail,
      studentName,
      rollNumber,
      courseName,
      amountDue,
      dueDate,
      customMessage,
    } = body;

    if (!toEmail || !studentName || amountDue === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required recipient details' },
        { status: 400 }
      );
    }

    const emailResult = await sendFeeDueReminder({
      toEmail,
      studentName,
      rollNumber,
      courseName,
      amountDue,
      dueDate,
      customMessage,
    });

    if (emailResult.success && isServerSupabaseConfigured && studentId) {
      try {
        const supabase = getServerSupabase();
        if (supabase) {
          await supabase.from('reminders').insert({
            student_id: studentId,
            recipient_email: toEmail,
            amount_due: amountDue,
            due_date: dueDate || null,
            subject: `Pending Fee Due Reminder (${rollNumber})`,
            status: 'sent',
            resend_email_id: emailResult.id || null,
          });
        }
      } catch (logErr) {
        console.warn('Failed to log reminder in database:', logErr);
      }
    }

    return NextResponse.json(emailResult);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

