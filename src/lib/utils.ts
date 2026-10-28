import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, parseISO } from "date-fns";
import { PaymentStatus } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string | undefined | null): string {
  const num = typeof amount === "number" ? amount : Number(amount) || 0;
  const symbol = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || "₹";
  return `${symbol} ${num.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDate(dateStr: string | undefined | null, formatPattern: string = "dd MMM yyyy"): string {
  if (!dateStr) return "-";
  try {
    const parsed = typeof dateStr === "string" ? parseISO(dateStr) : new Date(dateStr);
    return format(parsed, formatPattern);
  } catch {
    return dateStr;
  }
}

export function generateReceiptNumber(): string {
  const year = new Date().getFullYear();
  const random = Math.floor(1000 + Math.random() * 9000);
  return `REC-${year}-${random}`;
}

export function calculatePaymentStatus(
  paidAmount: number,
  netFee: number,
  dueDateStr?: string
): PaymentStatus {
  if (paidAmount >= netFee && netFee > 0) {
    return "paid";
  }
  
  const isOverdue = dueDateStr ? new Date(dueDateStr) < new Date() : false;
  
  if (paidAmount > 0) {
    return isOverdue ? "overdue" : "partial";
  }
  
  return isOverdue ? "overdue" : "pending";
}

export function getStatusBadgeClass(status: PaymentStatus): { bg: string; text: string; border: string } {
  switch (status) {
    case "paid":
      return {
        bg: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400",
        text: "text-emerald-700 dark:text-emerald-400",
        border: "border-emerald-200 dark:border-emerald-800",
      };
    case "partial":
      return {
        bg: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400",
        text: "text-amber-700 dark:text-amber-400",
        border: "border-amber-200 dark:border-amber-800",
      };
    case "overdue":
      return {
        bg: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400",
        text: "text-rose-700 dark:text-rose-400",
        border: "border-rose-200 dark:border-rose-800",
      };
    case "pending":
    default:
      return {
        bg: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
        text: "text-slate-700 dark:text-slate-300",
        border: "border-slate-200 dark:border-slate-700",
      };
  }
}

export function getPaymentMethodLabel(method: string): string {
  switch (method?.toLowerCase()) {
    case "upi":
      return "UPI / QR Code";
    case "cash":
      return "Cash";
    case "card":
      return "Credit / Debit Card";
    case "bank_transfer":
      return "Bank Transfer (NEFT/RTGS/IMPS)";
    case "cheque":
      return "Cheque / DD";
    default:
      return method || "Other";
  }
}

