import { NextResponse } from 'next/server';
import { sendPaymentReceiptEmail } from '@/lib/resend';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      toEmail,
      studentName,
      rollNumber,
      receiptNumber,
      amountPaid,
      paymentMethod,
      paymentDate,
      transactionId,
      balanceRemaining,
    } = body;

    if (!toEmail || !studentName || !receiptNumber || amountPaid === undefined) {
      return NextResponse.json(
        { success: false, error: 'Missing required receipt payment details' },
        { status: 400 }
      );
    }

    const emailResult = await sendPaymentReceiptEmail({
      toEmail,
      studentName,
      rollNumber,
      receiptNumber,
      amountPaid,
      paymentMethod,
      paymentDate,
      transactionId,
      balanceRemaining,
    });

    return NextResponse.json(emailResult);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

