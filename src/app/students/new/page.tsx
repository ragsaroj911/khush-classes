'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { StudentRegistrationWizard } from '@/components/students/StudentRegistrationWizard';
import { Button } from '@/components/ui/button';
import { ArrowLeft, GraduationCap } from 'lucide-react';
import Link from 'next/link';

export default function NewStudentPage() {
  const router = useRouter();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Top Breadcrumb & Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Link href="/students">
            <Button variant="outline" size="sm" className="h-9 px-3 gap-1.5 text-xs">
              <ArrowLeft className="h-4 w-4" />
              Back to Students
            </Button>
          </Link>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
              Khush Classes Admissions
            </span>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Student Admission & Fee Assessment Wizard
            </h1>
          </div>
        </div>
      </div>

      {/* Guided Wizard */}
      <StudentRegistrationWizard
        onCancel={() => router.push('/students')}
        onSuccess={() => {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('sfms_data_updated'));
          }
        }}
      />
    </div>
  );
}

