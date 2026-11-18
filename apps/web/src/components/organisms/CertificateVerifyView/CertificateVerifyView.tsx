import React, { useEffect, useState } from 'react';
import {
  ShieldCheck,
  Award,
  Download,
  AlertOctagon,
  ArrowLeft,
  Calendar,
  CheckCircle2,
} from 'lucide-react';
import { CertificateRecord } from '@/types';
import { api } from '@/lib/api';
import { Badge, Button } from '@/components/atoms';

export interface CertificateVerifyViewProps {
  verificationCode: string;
  onNavigateDashboard: () => void;
}

export const CertificateVerifyView: React.FC<CertificateVerifyViewProps> = ({
  verificationCode,
  onNavigateDashboard,
}) => {
  const [cert, setCert] = useState<CertificateRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    api
      .verifyCertificate(verificationCode)
      .then((res) => {
        if (active) setCert(res);
      })
      .catch((err: any) => {
        if (active) setError(err?.message || 'No se encontró una constancia válida para este código.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [verificationCode]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-content-muted">
        <div className="w-7 h-7 border-2 border-cyan-accent border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono">Validando autenticidad de constancia {verificationCode}...</span>
      </div>
    );
  }

  if (error || !cert) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 rounded-2xl bg-surface/80 border border-error/40 flex flex-col items-center text-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-error/15 border border-error/30 flex items-center justify-center">
          <AlertOctagon className="w-6 h-6 text-error" />
        </div>
        <h1 className="text-xl font-bold text-content-primary">Constancia no encontrada</h1>
        <p className="text-xs text-content-secondary font-mono">{error}</p>
        <Button variant="primary" size="sm" onClick={onNavigateDashboard} leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
          Volver a Qurio
        </Button>
      </div>
    );
  }

  const pdfUrl = api.getCertificatePdfUrl(cert.verification_code);
  const issuedDate = new Date(cert.issued_at).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="max-w-3xl mx-auto py-8 flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Button
          variant="ghost"
          size="sm"
          onClick={onNavigateDashboard}
          leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
        >
          Explorar Qurio
        </Button>
        <Badge variant={cert.is_qa_preview ? 'amber' : 'emerald'} dot size="sm">
          {cert.is_qa_preview ? 'PREVISUALIZACIÓN QA ADMIN' : 'CREDENCIAL AUTÉNTICA VERIFICADA'}
        </Badge>
      </div>

      <section className="rounded-3xl border border-emerald/35 bg-gradient-to-br from-surface via-surface to-primary/[0.06] p-7 sm:p-10 shadow-2xl flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border-subtle/50 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald/15 border border-emerald/35 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-emerald" />
            </div>
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-cyan-accent font-semibold">
                Registro Público de Verificación • Qurio
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold text-content-primary">
                {cert.track_title}
              </h1>
            </div>
          </div>

          <a
            href={pdfUrl}
            download={`constancia-qurio-${cert.verification_code.toLowerCase()}.pdf`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold transition-colors shadow-glow-primary"
          >
            <Download className="w-4 h-4" />
            <span>Descargar PDF Oficial</span>
          </a>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono text-xs">
          <div className="p-4 rounded-xl bg-surface-dim/80 border border-border-subtle/60 flex flex-col gap-1">
            <span className="text-[10px] uppercase text-content-muted">Titular</span>
            <span className="text-base font-bold text-primary-light">{cert.recipient_name}</span>
          </div>
          <div className="p-4 rounded-xl bg-surface-dim/80 border border-border-subtle/60 flex flex-col gap-1">
            <span className="text-[10px] uppercase text-content-muted">Código de Verificación</span>
            <span className="text-base font-bold text-cyan-accent">{cert.verification_code}</span>
          </div>
          <div className="p-4 rounded-xl bg-surface-dim/80 border border-border-subtle/60 flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald shrink-0" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase text-content-muted">Evaluación Semántica</span>
              <span className="font-semibold text-content-primary">
                {cert.completed_exercises} / {cert.total_exercises} retos PostgreSQL 16 aprobados
              </span>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-surface-dim/80 border border-border-subtle/60 flex items-center gap-2.5">
            <Calendar className="w-4 h-4 text-amber-streak shrink-0" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase text-content-muted">Fecha de Emisión</span>
              <span className="font-semibold text-content-primary">{issuedDate}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 pt-2 flex-wrap">
          <span className="text-xs text-content-muted flex items-center gap-1.5 font-mono">
            <Award className="w-4 h-4 text-amber-streak" />
            Emitido por Qurio • Evaluación SQL en Sandbox Docker PostgreSQL 16
          </span>
          <a
            href={cert.linkedin_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0A66C2] hover:bg-[#004182] text-white text-xs font-semibold transition-colors"
          >
            <span>Añadir a LinkedIn</span>
          </a>
        </div>
      </section>
    </div>
  );
};
