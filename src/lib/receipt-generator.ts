import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Payment, Student, Course, Batch } from '@/types';
import { formatDate, getPaymentMethodLabel } from './utils';

export function generateReceiptPdf(
  payment: Payment,
  student: Student,
  course?: Course,
  batch?: Batch
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const instituteName = process.env.NEXT_PUBLIC_INSTITUTE_NAME || 'Khush Classes';
  const instituteAddress = process.env.NEXT_PUBLIC_INSTITUTE_ADDRESS || 'Main Market Road, Knowledge Park, Delhi NCR';
  const institutePhone = process.env.NEXT_PUBLIC_INSTITUTE_PHONE || '+91 98765 43210';
  const instituteEmail = process.env.NEXT_PUBLIC_INSTITUTE_EMAIL || 'fees@khushclasses.com';
  const currencySymbol = 'Rs.';

  // Header background banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 40, 'F');

  // Institution title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(instituteName, 15, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text(`${instituteAddress} | Phone: ${institutePhone} | Email: ${instituteEmail}`, 15, 26);

  // Document Title / Receipt badge
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(15, 48, 180, 22, 3, 3, 'F');

  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('OFFICIAL FEE PAYMENT RECEIPT', 22, 60);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text(`Receipt No: ${payment.receipt_number}`, 140, 57);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139);
  doc.text(`Date: ${formatDate(payment.payment_date)}`, 140, 64);

  // Student Details Block
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('Student Information', 15, 80);

  autoTable(doc, {
    startY: 84,
    theme: 'plain',
    styles: { fontSize: 9, cellPadding: 2.5, textColor: [51, 65, 85] },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 35, textColor: [100, 116, 139] },
      1: { cellWidth: 55 },
      2: { fontStyle: 'bold', cellWidth: 35, textColor: [100, 116, 139] },
      3: { cellWidth: 55 },
    },
    body: [
      ['Student Name:', `${student.first_name} ${student.last_name}`, 'Roll Number:', student.roll_number],
      ['Course:', course?.name || 'N/A', 'Batch:', batch?.name || 'N/A'],
      ['Email:', student.email, 'Phone:', student.phone],
      ['Parent/Guardian:', student.parent_name || 'N/A', 'Parent Contact:', student.parent_phone || 'N/A'],
    ],
  });

  // Payment Breakdown Table
  // @ts-expect-error autoTable adds lastAutoTable on doc
  const currentY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 10 : 130;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text('Payment Particulars', 15, currentY);

  const tableRows = (student.custom_fee_items && student.custom_fee_items.length > 0)
    ? [
        ...student.custom_fee_items.map((item, idx) => [
          String(idx + 1).padStart(2, '0'),
          item.name,
          'Fee Head',
          `${currencySymbol} ${Number(item.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
        ]),
        [
          'REC',
          `Payment Received towards Student Account`,
          getPaymentMethodLabel(payment.payment_method),
          `${currencySymbol} ${Number(payment.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
        ],
      ]
    : [
        [
          '01',
          `Tuition & Academic Fees (${course?.code || 'Term Fee'})`,
          getPaymentMethodLabel(payment.payment_method),
          `${currencySymbol} ${Number(payment.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
        ],
      ];

  autoTable(doc, {
    startY: currentY + 4,
    theme: 'striped',
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
    },
    styles: { fontSize: 9, cellPadding: 3.5 },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 90 },
      2: { cellWidth: 35 },
      3: { cellWidth: 35, halign: 'right' },
    },
    head: [['Sr No.', 'Description', 'Particular / Mode', 'Amount']],
    body: tableRows,
  });

  // Financial summary
  // @ts-expect-error autoTable adds lastAutoTable on doc
  const tableEndY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 8 : 170;

  autoTable(doc, {
    startY: tableEndY,
    theme: 'plain',
    styles: { fontSize: 9, cellPadding: 2 },
    columnStyles: {
      0: { cellWidth: 100 },
      1: { cellWidth: 45, textColor: [100, 116, 139] },
      2: { cellWidth: 35, halign: 'right', fontStyle: 'bold' },
    },
    body: [
      [
        payment.transaction_id ? `Transaction Reference: ${payment.transaction_id}` : '',
        'Total Course Fee:',
        `${currencySymbol} ${Number(student.net_fee).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      ],
      [
        payment.remarks ? `Remarks: ${payment.remarks}` : '',
        'Amount Paid in this Receipt:',
        `${currencySymbol} ${Number(payment.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      ],
      [
        '',
        'Total Cumulative Paid:',
        `${currencySymbol} ${Number(student.paid_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      ],
      [
        '',
        'Remaining Balance:',
        `${currencySymbol} ${Number(student.balance_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      ],
    ],
  });

  // Terms and signatures
  // @ts-expect-error autoTable adds lastAutoTable on doc
  const finalSummaryY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 16 : 220;

  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text('Note: This is a computer generated official payment receipt. No physical signature is required.', 15, finalSummaryY);
  doc.text('Fees once paid are non-refundable as per institutional admissions policy.', 15, finalSummaryY + 5);

  // Signature lines
  const sigY = finalSummaryY + 22;
  doc.setDrawColor(203, 213, 225);
  doc.line(15, sigY, 65, sigY);
  doc.line(140, sigY, 190, sigY);

  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Student / Depositor', 15, sigY + 5);
  doc.text('Authorized Accounts Officer', 140, sigY + 5);

  // Save the PDF
  doc.save(`${payment.receipt_number}_${student.roll_number}.pdf`);
}

