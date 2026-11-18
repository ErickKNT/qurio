import React, { useEffect, useState } from 'react';
import { AlertOctagon, ArrowLeft } from 'lucide-react';
import { CertificateRecord } from '@/types';
import { api } from '@/lib/api';
import { Button } from '@/components/atoms';
import { mapCertificateRecordToData } from '@/components/organisms/CertificateModal/CertificateModal';
import { CertificateShowcase } from '@/components/organisms/CertificateModal/CertificateShowcase';

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
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3 text-[#908fa0]">
        <div className="w-7 h-7 border-2 border-[#7bd0ff] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs font-mono">Validando autenticidad de constancia {verificationCode}...</span>
      </div>
    );
  }

  if (error || !cert) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 rounded-2xl bg-[#161b2b] border border-[#ffb4ab]/40 flex flex-col items-center text-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-[#93000a]/30 border border-[#ffb4ab]/30 flex items-center justify-center">
          <AlertOctagon className="w-6 h-6 text-[#ffb4ab]" />
        </div>
        <h1 className="text-xl font-bold text-[#dee1f9]">Constancia no encontrada</h1>
        <p className="text-xs text-[#c7c4d7] font-mono">{error}</p>
        <Button variant="primary" size="sm" onClick={onNavigateDashboard} leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}>
          Volver a Qurio
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-4 sm:py-6 flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3 print:hidden">
        <Button
          variant="ghost"
          size="sm"
          onClick={onNavigateDashboard}
          leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
        >
          Explorar Qurio
        </Button>
      </div>

      <CertificateShowcase certificate={mapCertificateRecordToData(cert)} />
    </div>
  );
};
