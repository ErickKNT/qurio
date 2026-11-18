import React, { useEffect, useState } from 'react';
import { X, Award, ShieldCheck, Printer, Download, Copy, Check, ExternalLink } from 'lucide-react';
import { Button, Badge } from '@/components/atoms';
import { api } from '@/lib/api';
import type { CertificateRecord } from '@/types';

export function mapCertificateRecordToData(record: CertificateRecord): CertificateData {
  return {
    id: record.id,
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
  };
}

const LinkedInLogo: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
  </svg>
);

export interface CertificateData {
  id: string;
  recipientName: string;
  trackTitle: string;
  completedExercises: number;
  totalExercises: number;
  issuedDate: string;
  verificationCode: string;
  isGlobal?: boolean;
  isQaPreview?: boolean;
  verifyUrl?: string;
  pdfUrl?: string;
  linkedinUrl?: string;
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
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen || !certificate) return null;

  const verifyUrl =
    certificate.verifyUrl ||
    `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173'}/verify/${certificate.verificationCode}`;

  const pdfDownloadUrl = certificate.pdfUrl
    ? api.getCertificatePdfUrl(certificate.verificationCode)
    : null;

  const linkedinUrl =
    certificate.linkedinUrl ||
    `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(
      `${certificate.trackTitle} (SQL PostgreSQL 16)`
    )}&organizationName=Qurio&issueYear=${new Date().getFullYear()}&issueMonth=${
      new Date().getMonth() + 1
    }&certUrl=${encodeURIComponent(verifyUrl)}&certId=${encodeURIComponent(certificate.verificationCode)}`;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(verifyUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 1800);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="certificate-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-canvas/85 backdrop-blur-md animate-fadeIn print:bg-white print:p-0"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-2xl rounded-2xl bg-surface border border-border-subtle shadow-2xl overflow-hidden flex flex-col print:shadow-none print:border-2 print:border-slate-300">
        {/* Barra superior (oculta al imprimir) */}
        <div className="px-4 sm:px-5 py-3 bg-surface-dim border-b border-border-subtle flex flex-wrap items-center justify-between gap-2 print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold text-cyan-accent flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-streak" />
              <span>Constancia Oficial de Ruta SQL</span>
            </span>
            {certificate.isQaPreview && (
              <Badge variant="amber" size="sm">
                QA Admin Preview
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {pdfDownloadUrl && (
              <a
                href={pdfDownloadUrl}
                download={`constancia-qurio-${certificate.verificationCode.toLowerCase()}.pdf`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-colors shadow-glow-primary"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar PDF</span>
              </a>
            )}
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0A66C2] hover:bg-[#004182] text-white text-xs font-semibold transition-colors"
            >
              <LinkedInLogo className="w-3.5 h-3.5" />
              <span>Añadir a LinkedIn</span>
            </a>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              leftIcon={<Printer className="w-3.5 h-3.5" />}
              title="Imprimir vista previa"
            >
              Imprimir
            </Button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-content-muted hover:text-content-primary hover:bg-surface-card transition-colors"
              aria-label="Cerrar constancia"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Cuerpo de la Constancia */}
        <div className="relative p-8 sm:p-10 bg-gradient-to-br from-canvas via-surface to-primary/[0.06] flex flex-col gap-6 text-center items-center overflow-hidden">
          <div className="pointer-events-none absolute -top-24 -left-24 w-56 h-56 rounded-full bg-primary/10 blur-3xl print:hidden" />
          <div className="pointer-events-none absolute -bottom-24 -right-24 w-56 h-56 rounded-full bg-emerald/10 blur-3xl print:hidden" />

          {/* Emblema Qurio */}
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 via-cyan-accent/15 to-emerald/20 border border-primary/35 flex items-center justify-center shadow-sm">
            <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="16" cy="9.5" rx="7.5" ry="3" fill="#7bd0ff" fillOpacity="0.25" stroke="#7bd0ff" strokeWidth="1.5" />
              <path d="M8.5 9.5V16C8.5 17.65 11.85 19 16 19C20.15 19 23.5 17.65 23.5 16V9.5" stroke="#8083ff" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M8.5 16V22.5C8.5 24.15 11.85 25.5 16 25.5C20.15 25.5 23.5 24.15 23.5 22.5V16" stroke="#7bd0ff" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="16" cy="16" r="1.75" fill="#22C55E" />
            </svg>
          </div>

          <div className="flex flex-col gap-1.5 items-center">
            <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-cyan-accent font-semibold">
              Qurio • PostgreSQL 16 Engineering Platform
            </span>
            <h2 id="certificate-modal-title" className="text-2xl sm:text-3xl font-extrabold text-content-primary tracking-tight">
              {certificate.isGlobal ? 'Certificado de Maestría SQL' : 'Constancia de Finalización'}
            </h2>
          </div>

          <p className="text-xs sm:text-sm text-content-secondary">
            Se otorga el presente reconocimiento técnico a:
          </p>

          <div className="px-6 py-2.5 rounded-xl bg-surface-card/80 border border-border-subtle/80">
            <span className="text-xl sm:text-2xl font-bold font-mono text-primary-light">
              {certificate.recipientName}
            </span>
          </div>

          <div className="flex flex-col gap-2 max-w-lg">
            <p className="text-xs sm:text-sm text-content-secondary leading-relaxed">
              Por haber completado y aprobado satisfactoriamente el 100% de los retos prácticos evaluados semánticamente en PostgreSQL 16 correspondientes a:
            </p>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <Badge variant="emerald" dot size="md">
                {certificate.trackTitle}
              </Badge>
              <Badge variant="mono" size="md">
                {certificate.completedExercises} / {certificate.totalExercises} retos aprobados
              </Badge>
            </div>
          </div>

          {/* Barra de verificación pública */}
          <div className="w-full pt-5 mt-2 border-t border-border-subtle/50 flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono text-content-muted">
              <span className="flex items-center gap-1.5 text-emerald">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>{certificate.isQaPreview ? 'Emitido en Modo QA Admin' : 'Progreso Auditado en Servidor'}</span>
              </span>
              <span>Emitido: {certificate.issuedDate}</span>
              <span>ID: {certificate.verificationCode}</span>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 rounded-xl bg-surface-dim/80 border border-border-subtle/60 text-[11px] font-mono print:hidden">
              <span className="text-content-muted truncate max-w-sm">{verifyUrl}</span>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded bg-surface-card border border-border-subtle hover:border-cyan-accent/50 text-content-primary transition-colors"
                >
                  {copiedLink ? (
                    <>
                      <Check className="w-3 h-3 text-emerald" />
                      <span className="text-emerald">Copiado</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copiar enlace</span>
                    </>
                  )}
                </button>
                {onOpenVerifyPage && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenVerifyPage(certificate.verificationCode);
                    }}
                    className="inline-flex items-center gap-1 px-2 py-1 rounded bg-surface-card border border-border-subtle hover:border-primary/50 text-cyan-accent transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>Abrir verificación</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
