import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import type { CertificateRecord } from '@/types';
import {
  CertificateShowcase,
  type CertificateData,
} from './CertificateShowcase';

export type { CertificateData };

export function mapCertificateRecordToData(record: CertificateRecord): CertificateData {
  return {
    id: record.id,
    trackId: record.track_id,
    recipientName: record.recipient_name,
    trackTitle: record.track_title,
    completedExercises: record.completed_exercises,
    totalExercises: record.total_exercises,
    issuedDate: new Date(record.issued_at).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
    verificationCode: record.verification_code,
    isGlobal: record.track_id === 'global-curriculum',
    isQaPreview: record.is_qa_preview,
    verifyUrl: record.verify_url,
    pdfUrl: record.pdf_url,
    linkedinUrl: record.linkedin_url,
    sha256Hash: record.sha256_hash,
    modulesCount: record.modules_count,
    validatedSkills: record.validated_skills,
    qrSvgUrl: record.qr_svg_url,
  };
}

export interface CertificateModalProps {
  certificate: CertificateData | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenVerifyPage?: (code: string) => void;
}

export const CertificateModal: React.FC<CertificateModalProps> = ({
  certificate,
  isOpen,
  onClose,
  onOpenVerifyPage,
}) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen || !certificate) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="certificate-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#080d1d]/85 backdrop-blur-md animate-fadeIn print:bg-[#0e1323] print:p-0"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-2xl bg-[#0e1323] border border-[#2f3446] shadow-2xl p-4 sm:p-7 print:max-h-none print:border-none print:shadow-none print:p-0">
        <CertificateShowcase
          certificate={certificate}
          onOpenVerifyPage={onOpenVerifyPage}
          onClose={onClose}
          headerRightExtra={
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-lg text-[#908fa0] hover:text-[#dee1f9] hover:bg-[#25293a] transition-colors"
              aria-label="Cerrar constancia"
            >
              <X className="w-4 h-4" />
            </button>
          }
        />
      </div>
    </div>
  );
};
