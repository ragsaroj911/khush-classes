'use client';

import * as React from 'react';
import { Modal } from '@/components/ui/modal';
import { Student } from '@/types';
import { StudentRegistrationWizard } from './StudentRegistrationWizard';

interface StudentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStudentSaved?: (student: Student) => void;
  editStudent?: Student | null;
}

export function StudentFormModal({
  isOpen,
  onClose,
  onStudentSaved,
  editStudent,
}: StudentFormModalProps) {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editStudent ? 'Edit Student Admission Profile' : 'Student Admission & Enrollment Wizard'}
      description="Register a student at Khush Classes with customized fee structure and scholarships."
      maxWidth="3xl"
    >
      <StudentRegistrationWizard
        isModal={true}
        editStudent={editStudent}
        onCancel={onClose}
        onSuccess={(student) => {
          if (onStudentSaved) onStudentSaved(student);
          // dispatch global update
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('sfms_data_updated'));
          }
        }}
      />
    </Modal>
  );
}
