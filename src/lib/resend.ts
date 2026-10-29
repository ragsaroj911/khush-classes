import { Resend } from 'resend';
import { formatCurrency, formatDate, getPaymentMethodLabel } from './utils';

const resendApiKey = process.env.RESEND_API_KEY || '';
export const isResendConfigured = Boolean(
  (resendApiKey && !resendApiKey.includes('your_resend')) ||
  process.env.NEXT_PUBLIC_RESEND_CONFIGURED === 'true'
);

// Safe helper to obtain Resend client strictly on server-side with a valid key
export function getResendClient(): Resend | null {
  if (typeof window !== 'undefined') return null;
  const key = process.env.RESEND_API_KEY;
  if (!key || !key.trim() || key.includes('your_resend')) {
    return null;
  }
  try {
    return new Resend(key.trim());
  } catch (err) {
    console.error('Failed to initialize Resend client:', err);
    return null;
  }
}

const defaultFrom = process.env.RESEND_FROM_EMAIL || 'Khush Classes <onboarding@resend.dev>';
const instituteName = process.env.NEXT_PUBLIC_INSTITUTE_NAME || 'Khush Classes';
const institutePhone = process.env.NEXT_PUBLIC_INSTITUTE_PHONE || '+91 98765 43210';
const instituteEmail = process.env.NEXT_PUBLIC_INSTITUTE_EMAIL || 'fees@khushclasses.com';

export interface SendReminderParams {
  toEmail: string;
  studentName: string;
  rollNumber: string;
  courseName: string;
  amountDue: number;
  dueDate: string;
  customMessage?: string;
}

export interface SendReceiptParams {
  toEmail: string;
  studentName: string;
  rollNumber: string;
  receiptNumber: string;
  amountPaid: number;
  paymentMethod: string;
  paymentDate: string;
  transactionId?: string;
  balanceRemaining: number;
}

export async function sendFeeDueReminder(params: SendReminderParams): Promise<{ success: boolean; id?: string; error?: string }> {
  const { toEmail, studentName, rollNumber, courseName, amountDue, dueDate, customMessage } = params;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; }
          .header { background: #0f172a; color: #ffffff; padding: 32px 24px; text-align: center; }
          .header h1 { margin: 0 0 8px 0; font-size: 22px; font-weight: 700; letter-spacing: -0.02em; }
          .header p { margin: 0; color: #94a3b8; font-size: 14px; }
          .content { padding: 32px 24px; }
          .greeting { font-size: 16px; margin-bottom: 16px; }
          .due-card { background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 20px; text-align: center; margin: 24px 0; }
          .due-label { font-size: 13px; text-transform: uppercase; letter-spacing: 0.05em; color: #991b1b; font-weight: 600; }
          .due-amount { font-size: 32px; font-weight: 800; color: #b91c1c; margin: 6px 0; }
          .due-date { font-size: 14px; color: #7f1d1d; }
          .details-table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 14px; }
          .details-table td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; }
          .details-table td.label { color: #64748b; width: 40%; }
          .details-table td.value { font-weight: 600; color: #0f172a; }
          .instructions { background: #f8fafc; border-radius: 8px; padding: 16px; margin: 24px 0; font-size: 13px; color: #475569; }
          .footer { background: #f1f5f9; padding: 20px 24px; text-align: center; font-size: 12px; color: #64748b; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${instituteName}</h1>
            <p>Official Fee Accounts & Billing Notice</p>
          </div>
          <div class="content">
            <p class="greeting">Dear <strong>${studentName}</strong> (or Parent/Guardian),</p>
            <p>This is a gentle notification regarding your pending academic fees for <strong>${courseName}</strong>.</p>
            
            <div class="due-card">
              <div class="due-label">Outstanding Balance</div>
              <div class="due-amount">${formatCurrency(amountDue)}</div>
              <div class="due-date">Due Date: <strong>${formatDate(dueDate)}</strong></div>
            </div>

            <table class="details-table">
              <tr>
                <td class="label">Student Name</td>
                <td class="value">${studentName}</td>
              </tr>
              <tr>
                <td class="label">Roll Number</td>
                <td class="value">${rollNumber}</td>
              </tr>
              <tr>
                <td class="label">Course</td>
                <td class="value">${courseName}</td>
              </tr>
              <tr>
                <td class="label">Amount Payable</td>
                <td class="value">${formatCurrency(amountDue)}</td>
              </tr>
            </table>

            ${customMessage ? `<div class="instructions"><p style="margin: 0; font-weight: 500;"><strong>Note from Accounts Desk:</strong><br>${customMessage}</p></div>` : ''}

            <p style="font-size: 14px; margin-top: 24px;">Please ensure payment is completed on or before the due date to avoid late clearance charges or exam registration holds.</p>
          </div>
          <div class="footer">
            <p style="margin: 0 0 6px 0;"><strong>${instituteName}</strong> &bull; Accounts Office</p>
            <p style="margin: 0;">Phone: ${institutePhone} | Email: ${instituteEmail}</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const client = getResendClient();
  if (!client) {
    console.info(`[Resend Mock Mode] Simulated fee reminder email sent to: ${toEmail} for ${formatCurrency(amountDue)}`);
    return { success: true, id: `mock-${Date.now()}` };
  }

  try {
    const { data, error } = await client.emails.send({
      from: defaultFrom,
      to: toEmail,
      subject: `Urgent: Pending Fee Due Reminder (${rollNumber}) - ${instituteName}`,
      html: htmlContent,
    });

    if (error) {
      console.error('Resend API Error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to send email';
    return { success: false, error: message };
  }
}

export async function sendPaymentReceiptEmail(params: SendReceiptParams): Promise<{ success: boolean; id?: string; error?: string }> {
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
  } = params;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 24px; color: #1e293b; }
          .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; overflow: hidden; }
          .header { background: #047857; color: #ffffff; padding: 32px 24px; text-align: center; }
          .header h1 { margin: 0 0 8px 0; font-size: 22px; font-weight: 700; }
          .header p { margin: 0; color: #a7f3d0; font-size: 14px; }
          .content { padding: 32px 24px; }
          .success-box { background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 24px; }
          .amount { font-size: 32px; font-weight: 800; color: #047857; margin: 6px 0; }
          .receipt-tag { font-size: 13px; font-family: monospace; background: #d1fae5; padding: 4px 8px; border-radius: 4px; color: #065f46; display: inline-block; }
          .table { width: 100%; border-collapse: collapse; margin-top: 16px; font-size: 14px; }
          .table td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; }
          .table td.label { color: #64748b; width: 45%; }
          .table td.value { font-weight: 600; color: #0f172a; text-align: right; }
          .footer { background: #f8fafc; padding: 20px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${instituteName}</h1>
            <p>Fee Payment Confirmation & Official E-Receipt</p>
          </div>
          <div class="content">
            <div class="success-box">
              <span class="receipt-tag">${receiptNumber}</span>
              <div class="amount">${formatCurrency(amountPaid)}</div>
              <p style="margin: 0; color: #065f46; font-size: 14px;">Payment Received Successfully</p>
            </div>

            <table class="table">
              <tr>
                <td class="label">Student Name</td>
                <td class="value">${studentName}</td>
              </tr>
              <tr>
                <td class="label">Roll Number</td>
                <td class="value">${rollNumber}</td>
              </tr>
              <tr>
                <td class="label">Date of Payment</td>
                <td class="value">${formatDate(paymentDate)}</td>
              </tr>
              <tr>
                <td class="label">Payment Mode</td>
                <td class="value">${getPaymentMethodLabel(paymentMethod)}</td>
              </tr>
              ${transactionId ? `<tr><td class="label">Transaction Reference</td><td class="value">${transactionId}</td></tr>` : ''}
              <tr>
                <td class="label">Remaining Balance</td>
                <td class="value" style="color: ${balanceRemaining > 0 ? '#b91c1c' : '#047857'}">
                  ${formatCurrency(balanceRemaining)}
                </td>
              </tr>
            </table>

            <p style="font-size: 13px; color: #64748b; margin-top: 24px; line-height: 1.5;">
              This is an electronically generated official receipt. Please preserve this email for your financial and institutional records.
            </p>
          </div>
          <div class="footer">
            <p style="margin: 0 0 6px 0;"><strong>${instituteName}</strong> &bull; Accounts & Fee Section</p>
            <p style="margin: 0;">Inquiries: ${instituteEmail} | ${institutePhone}</p>
          </div>
        </div>
      </body>
    </html>
  `;

  const client = getResendClient();
  if (!client) {
    console.info(`[Resend Mock Mode] Simulated payment receipt email sent to: ${toEmail} for ${formatCurrency(amountPaid)}`);
    return { success: true, id: `mock-${Date.now()}` };
  }

  try {
    const { data, error } = await client.emails.send({
      from: defaultFrom,
      to: toEmail,
      subject: `Payment Receipt ${receiptNumber} - ${instituteName}`,
      html: htmlContent,
    });

    if (error) {
      console.error('Resend API Error:', error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to send receipt email';
    return { success: false, error: message };
  }
}

