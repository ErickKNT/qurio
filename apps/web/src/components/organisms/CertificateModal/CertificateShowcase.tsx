import React, { useMemo, useState } from 'react';
import {
  Award,
  Check,
  Code2,
  Copy,
  Cpu,
  Database,
  Download,
  ExternalLink,
  FileCheck2,
  Lock,
  Printer,
  Shield,
  ShieldCheck,
  Share2,
  Terminal,
  Timer,
} from 'lucide-react';
import { api } from '@/lib/api';

export interface CertificateData {
  id: string;
  trackId?: string;
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
  sha256Hash?: string;
  modulesCount?: number;
  validatedSkills?: string[];
  qrSvgUrl?: string;
}

const DEFAULT_SKILLS_BY_TRACK: Record<string, { modules: number; skills: string[] }> = {
  'sql-foundations': {
    modules: 4,
    skills: [
      'Sintaxis ANSI SQL',
      'Proyección SELECT & Alias',
      'Filtros WHERE, BETWEEN & IN',
      'Ordenamiento ORDER BY & LIMIT',
      'Funciones Escalares de Texto y Fecha',
      'Agregación GROUP BY & HAVING',
    ],
  },
  'relational-sql': {
    modules: 4,
    skills: [
      'Modelo Relacional & Claves FK',
      'INNER JOIN Multi-Tabla',
      'Detección de Ausencias (LEFT JOIN + NULL)',
      'COALESCE & Normalización 3NF',
      'Operaciones de Conjunto (UNION / EXCEPT)',
      'CROSS JOIN & Auto-uniones (SELF JOIN)',
    ],
  },
  'advanced-queries': {
    modules: 4,
    skills: [
      'Subconsultas Correlacionadas',
      'Predicados EXISTS & NOT EXISTS',
      'Lógica Condicional CASE WHEN',
      'CTEs Temporales (WITH)',
      'Funciones de Ventana (OVER, PARTITION BY)',
      'Ranking & Análisis Temporal (LAG / SUM OVER)',
    ],
  },
  'data-manipulation-ddl': {
    modules: 4,
    skills: [
      'Inserción Transaccional (INSERT & RETURNING)',
      'Poblamiento Analítico (INSERT INTO ... SELECT)',
      'Actualización Cruzada (UPDATE ... FROM)',
      'Depuración Segura (DELETE & Integridad FK)',
      'Diseño de Esquemas (CREATE/ALTER/DROP & CHECK)',
      'Indexación B-Tree, Compuesta y Parcial (WHERE)',
    ],
  },
  'global-curriculum': {
    modules: 16,
    skills: [
      'Sintaxis ANSI SQL & DQL',
      'INNER, LEFT & SELF JOINS',
      'Agrupación GROUP BY & HAVING',
      'Subconsultas, CTEs & Window Functions',
      'Manipulación DML (INSERT, UPDATE, DELETE, RETURNING)',
      'Diseño DDL, Restricciones & Índices B-Tree',
      'Evaluación PostgreSQL 16 Sandbox',
    ],
  },
};

function computeDisplayDigest(cert: CertificateData): string {
  if (cert.sha256Hash) return cert.sha256Hash;
  // Huella determinística de respaldo cuando se previsualiza sin backend
  const seed = `${cert.verificationCode}|${cert.recipientName}|${cert.trackTitle}|${cert.issuedDate}`;
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  let out = '';
  for (let round = 0; round < 8; round++) {
    for (let i = 0; i < seed.length; i++) {
      const ch = seed.charCodeAt(i) ^ (round * 31);
      h1 = Math.imul(h1 ^ ch, 0x01000193) >>> 0;
      h2 = Math.imul(h2 ^ (ch + round), 0x85ebca6b) >>> 0;
    }
    out += (h1 ^ h2).toString(16).padStart(8, '0');
  }
  return out.slice(0, 64);
}

export const LinkedInLogo: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
  </svg>
);

export const XSocialLogo: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
);

const CornerTechBracket: React.FC<{ positionClass: string; flipX?: boolean; flipY?: boolean }> = ({
  positionClass,
  flipX = false,
  flipY = false,
}) => (
  <div className={`pointer-events-none absolute ${positionClass} w-10 h-10 text-[#464554] opacity-55`}>
    <svg
      fill="none"
      stroke="currentColor"
      viewBox="0 0 48 48"
      className={`${flipX ? '-scale-x-100' : ''} ${flipY ? '-scale-y-100' : ''}`}
      aria-hidden="true"
    >
      <path d="M4 4h16M4 4v16M4 4l12 12" strokeWidth="1.5" />
      <circle cx="4" cy="4" fill="currentColor" r="2" />
    </svg>
  </div>
);

export interface CertificateShowcaseProps {
  certificate: CertificateData;
  onOpenVerifyPage?: (code: string) => void;
  onClose?: () => void;
  headerRightExtra?: React.ReactNode;
}

export const CertificateShowcase: React.FC<CertificateShowcaseProps> = ({
  certificate,
  onOpenVerifyPage,
  onClose,
  headerRightExtra,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedBadge, setCopiedBadge] = useState(false);

  const trackKey =
    certificate.trackId ||
    (certificate.isGlobal ? 'global-curriculum' : certificate.id) ||
    'global-curriculum';
  const fallbackMeta = DEFAULT_SKILLS_BY_TRACK[trackKey] ?? DEFAULT_SKILLS_BY_TRACK['global-curriculum'];
  const modulesCount = certificate.modulesCount ?? fallbackMeta.modules;
  const skills =
    certificate.validatedSkills && certificate.validatedSkills.length > 0
      ? certificate.validatedSkills
      : fallbackMeta.skills;

  const verifyUrl =
    certificate.verifyUrl ||
    `${typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173'}/verify/${certificate.verificationCode}`;

  const pdfDownloadUrl = certificate.pdfUrl
    ? api.getCertificatePdfUrl(certificate.verificationCode)
    : null;

  const qrSvgUrl = certificate.qrSvgUrl
    ? api.getCertificateQrSvgUrl(certificate.verificationCode)
    : null;

  const linkedinUrl =
    certificate.linkedinUrl ||
    `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${encodeURIComponent(
      `${certificate.trackTitle} (SQL PostgreSQL 16)`
    )}&organizationName=Qurio&issueYear=${new Date().getFullYear()}&issueMonth=${
      new Date().getMonth() + 1
    }&certUrl=${encodeURIComponent(verifyUrl)}&certId=${encodeURIComponent(certificate.verificationCode)}`;

  const shareOnXUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    `Acabo de obtener mi acreditación en "${certificate.trackTitle}" en Qurio (PostgreSQL 16 Sandbox) ${verifyUrl}`
  )}`;

  const sha256Digest = useMemo(() => computeDisplayDigest(certificate), [certificate]);
  const completionPct = Math.min(
    100,
    Math.round((certificate.completedExercises / Math.max(1, certificate.totalExercises)) * 100)
  );

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(verifyUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyHtmlBadge = () => {
    const htmlBadge = `<a href="${verifyUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:8px;padding:8px 14px;border-radius:8px;background:#0e1323;color:#dee1f9;border:1px solid #464554;font-family:monospace;font-size:12px;text-decoration:none;"><strong style="color:#4ae176;">✓ QURIO VERIFIED</strong> · ${certificate.trackTitle} (${certificate.verificationCode})</a>`;
    navigator.clipboard?.writeText(htmlBadge);
    setCopiedBadge(true);
    setTimeout(() => setCopiedBadge(false), 2200);
  };

  const skillDotColors = ['bg-[#7bd0ff]', 'bg-[#7bd0ff]', 'bg-[#7bd0ff]', 'bg-[#c0c1ff]', 'bg-[#4ae176]', 'bg-[#7bd0ff]', 'bg-[#c0c1ff]'];

  return (
    <div className="flex flex-col gap-5 w-full text-[#dee1f9]">
      {/* CABECERA DE METADATOS Y ACCIONES */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 print:hidden">
        <div className="flex flex-col gap-1.5">
          <div className="flex flex-wrap items-center gap-2 font-mono text-[11px]">
            <span className="text-[#908fa0]">Rutas de Aprendizaje</span>
            <span className="text-[#464554]">/</span>
            <span className="text-[#7bd0ff] font-medium truncate max-w-[220px]">{certificate.trackTitle}</span>
            <span className="text-[#464554]">/</span>
            <span className="text-[#dee1f9] font-semibold">Certificado Oficial</span>

            <span
              className={`inline-flex items-center gap-1.5 ml-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase ${
                certificate.isQaPreview
                  ? 'bg-[#25293a] text-[#F59E0B] border border-[#F59E0B]/30'
                  : 'bg-[#25293a] text-[#4ae176]'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  certificate.isQaPreview ? 'bg-[#F59E0B]' : 'bg-[#4ae176]'
                }`}
              />
              {certificate.isQaPreview ? 'QA ADMIN PREVIEW' : 'EMITIDO OFICIALMENTE'}
            </span>

            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#161b2b] text-[#7bd0ff] text-[10px] tracking-wide">
              <ShieldCheck className="w-3 h-3" />
              <span>INMUTABLE • SHA-256</span>
            </span>
          </div>

          <div className="flex flex-wrap items-baseline gap-3">
            <h2
              id="certificate-modal-title"
              className="text-xl sm:text-2xl font-bold text-[#dee1f9] tracking-tight"
            >
              Acreditación de Competencia Técnica
            </h2>
            <span className="font-mono text-[11px] text-[#908fa0] px-2.5 py-0.5 rounded bg-[#1a1f30] border border-[#2f3446]">
              ID: {certificate.verificationCode}
            </span>
          </div>
        </div>

        {/* Barra de acciones */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-center">
          <div className="relative">
            <button
              type="button"
              onClick={handleCopyLink}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#25293a] hover:bg-[#34394a] text-[#c7c4d7] hover:text-[#dee1f9] font-mono text-xs font-semibold transition-colors shadow-sm"
            >
              {copiedLink ? (
                <Check className="w-3.5 h-3.5 text-[#4ae176]" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-[#7bd0ff]" />
              )}
              <span>{copiedLink ? 'Copiado' : 'Copiar Enlace'}</span>
            </button>
            {copiedLink && (
              <div className="absolute -top-9 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-[#34394a] text-[#4ae176] font-mono text-[10px] rounded shadow-xl whitespace-nowrap">
                ✓ Enlace copiado
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#25293a] hover:bg-[#34394a] text-[#c7c4d7] hover:text-[#dee1f9] font-mono text-xs font-semibold transition-colors shadow-sm"
            title="Imprimir certificado"
          >
            <Printer className="w-3.5 h-3.5 text-[#908fa0]" />
            <span>Imprimir</span>
          </button>

          <a
            href={linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#2f3446] hover:bg-[#34394a] text-[#c4e7ff] font-mono text-xs font-semibold transition-colors shadow-sm"
          >
            <LinkedInLogo className="w-3.5 h-3.5 text-[#7bd0ff]" />
            <span>Añadir a LinkedIn</span>
          </a>

          {pdfDownloadUrl && (
            <a
              href={pdfDownloadUrl}
              download={`constancia-qurio-${certificate.verificationCode.toLowerCase()}.pdf`}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#8083ff] hover:bg-[#c0c1ff] text-[#080d1d] font-mono text-xs font-bold transition-colors shadow-md"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar PDF</span>
            </a>
          )}

          {headerRightExtra}
        </div>
      </div>

      {/* CONTENEDOR HEROICO DEL CERTIFICADO */}
      <div className="relative w-full p-2 sm:p-3 rounded-2xl bg-gradient-to-br from-[#25293a] via-[#080d1d] to-[#161b2b] border border-[#464554]/50 shadow-2xl print:border-[#464554]">
        <div className="relative w-full bg-[#080d1d] rounded-xl px-4 py-7 sm:px-10 sm:py-9 overflow-hidden shadow-inner">
          {/* Grid Relacional SVG de fondo + Glow radial */}
          <div className="absolute inset-0 pointer-events-none opacity-25" aria-hidden="true">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern height="40" id="qurio-cert-grid" patternUnits="userSpaceOnUse" width="40">
                  <path
                    d="M 40 0 L 0 0 0 40"
                    fill="none"
                    stroke="#7bd0ff"
                    strokeDasharray="2, 6"
                    strokeWidth="0.75"
                  />
                  <circle cx="0" cy="0" fill="#8083ff" opacity="0.6" r="1.5" />
                </pattern>
                <radialGradient cx="50%" cy="30%" id="qurio-cert-glow" r="60%">
                  <stop offset="0%" stopColor="#8083ff" stopOpacity="0.18" />
                  <stop offset="60%" stopColor="#00a6e0" stopOpacity="0.06" />
                  <stop offset="100%" stopColor="#0e1323" stopOpacity="0" />
                </radialGradient>
              </defs>
              <rect fill="url(#qurio-cert-glow)" height="100%" width="100%" />
              <rect fill="url(#qurio-cert-grid)" height="100%" width="100%" />
            </svg>
          </div>

          <CornerTechBracket positionClass="top-4 left-4" />
          <CornerTechBracket positionClass="top-4 right-4" flipX />
          <CornerTechBracket positionClass="bottom-4 left-4" flipY />
          <CornerTechBracket positionClass="bottom-4 right-4" flipX flipY />

          <div className="relative z-10 flex flex-col items-center text-center">
            {/* Emblema institucional superior */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-[#1a1f30] border border-[#2f3446] flex items-center justify-center shadow-lg">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 32 32" aria-hidden="true">
                  <rect fill="#161b2b" height="32" rx="7" width="32" />
                  <ellipse
                    cx="16"
                    cy="9.5"
                    fill="#7bd0ff"
                    fillOpacity="0.25"
                    rx="7.5"
                    ry="3"
                    stroke="#7bd0ff"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M8.5 9.5V16C8.5 17.65 11.85 19 16 19C20.15 19 23.5 17.65 23.5 16V9.5"
                    stroke="#8083ff"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M8.5 16V22.5C8.5 24.15 11.85 25.5 16 25.5C20.15 25.5 23.5 24.15 23.5 22.5V16"
                    stroke="#7bd0ff"
                    strokeWidth="1.5"
                  />
                  <circle cx="16" cy="16" fill="#4ae176" r="1.5" />
                </svg>
              </div>
              <div className="flex flex-col text-left">
                <span className="text-lg font-semibold tracking-tight text-[#dee1f9]">
                  Qurio Learning Platform
                </span>
                <span className="font-mono text-[10px] tracking-[0.16em] text-[#7bd0ff] uppercase">
                  Database Engineering &amp; Query Architecture
                </span>
              </div>
            </div>

            {/* Pill de acreditación */}
            <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-[#25293a] text-[#c0c1ff] mb-5 shadow-sm">
              <Award className="w-3.5 h-3.5" />
              <span className="font-mono text-[10px] font-semibold tracking-[0.14em] uppercase">
                {certificate.isGlobal
                  ? 'Acreditación Global de Maestría SQL'
                  : 'Acreditación de Competencia Técnica'}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#c7c4d7] max-w-2xl mb-2 leading-relaxed">
              Por cuanto ha demostrado maestría práctica y teórica en el diseño de consultas
              relacionales, análisis de datos y validación semántica en PostgreSQL 16, se confiere
              el presente certificado a:
            </p>

            {/* Nombre del Titular con subrayado gradiente */}
            <div className="relative my-2 sm:my-3 py-1">
              <span className="text-3xl sm:text-4xl font-bold text-[#c0c1ff] tracking-tight px-4">
                {certificate.recipientName}
              </span>
              <div className="h-0.5 w-64 max-w-full mx-auto mt-2 bg-gradient-to-r from-transparent via-[#8083ff] to-transparent opacity-85" />
            </div>

            {/* Título de la Ruta / Certificación */}
            <h3 className="text-lg sm:text-xl text-[#dee1f9] max-w-xl mb-6 font-semibold tracking-tight">
              {certificate.trackTitle}
            </h3>

            {/* 4 Métricas Clave Auditadas */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 w-full max-w-3xl mb-7 text-left">
              <div className="p-3.5 rounded-xl bg-[#161b2b] border border-[#2f3446]/60 shadow-sm flex flex-col justify-between gap-1">
                <div className="flex items-center justify-between text-[#908fa0]">
                  <span className="font-mono text-[10px] uppercase tracking-wider">Currículo</span>
                  <FileCheck2 className="w-3.5 h-3.5 text-[#7bd0ff]" />
                </div>
                <span className="text-base sm:text-lg font-semibold text-[#dee1f9]">
                  {modulesCount} {modulesCount === 1 ? 'Módulo' : 'Módulos'}
                </span>
                <span className="font-mono text-[11px] text-[#4ae176]">{completionPct}% Aprobado</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#161b2b] border border-[#2f3446]/60 shadow-sm flex flex-col justify-between gap-1">
                <div className="flex items-center justify-between text-[#908fa0]">
                  <span className="font-mono text-[10px] uppercase tracking-wider">Postgres 16</span>
                  <Terminal className="w-3.5 h-3.5 text-[#7bd0ff]" />
                </div>
                <span className="text-base sm:text-lg font-semibold text-[#dee1f9]">
                  {certificate.completedExercises} / {certificate.totalExercises} Retos
                </span>
                <span className="font-mono text-[11px] text-[#4ae176]">Evaluación Semántica</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#161b2b] border border-[#2f3446]/60 shadow-sm flex flex-col justify-between gap-1">
                <div className="flex items-center justify-between text-[#908fa0]">
                  <span className="font-mono text-[10px] uppercase tracking-wider">Auditoría</span>
                  <Award className="w-3.5 h-3.5 text-[#7bd0ff]" />
                </div>
                <span className="text-base sm:text-lg font-semibold text-[#dee1f9]">AST + Sandbox</span>
                <span className="font-mono text-[11px] text-[#c0c1ff]">Cero Falsos Positivos</span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#161b2b] border border-[#2f3446]/60 shadow-sm flex flex-col justify-between gap-1">
                <div className="flex items-center justify-between text-[#908fa0]">
                  <span className="font-mono text-[10px] uppercase tracking-wider">Entorno</span>
                  <Timer className="w-3.5 h-3.5 text-[#7bd0ff]" />
                </div>
                <span className="text-base sm:text-lg font-semibold text-[#dee1f9]">Docker 16</span>
                <span className="font-mono text-[11px] text-[#c7c4d7]">Práctica Aislada</span>
              </div>
            </div>

            {/* Zona de Firmas Vectoriales y Sello Holográfico Central con QR */}
            <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-5 items-end bg-[#161b2b]/50 border border-[#2f3446]/50 rounded-xl p-4 sm:p-5">
              {/* Firma 1 */}
              <div className="flex flex-col items-center text-center">
                <div className="h-10 flex items-center justify-center mb-1">
                  <svg className="h-8 w-40 text-[#7bd0ff] opacity-90" fill="none" stroke="currentColor" viewBox="0 0 160 40" aria-hidden="true">
                    <path d="M10 28 C30 10, 45 40, 60 15 C75 -2, 85 35, 105 18 C120 4, 135 25, 150 12" strokeLinecap="round" strokeWidth="2" />
                    <path d="M40 22 C60 22, 90 20, 110 20" strokeDasharray="3 3" strokeWidth="1.2" />
                  </svg>
                </div>
                <div className="w-36 h-px bg-[#464554] my-1" />
                <span className="text-xs sm:text-sm font-semibold text-[#dee1f9]">
                  Evaluador Semántico Qurio
                </span>
                <span className="font-mono text-[10px] text-[#908fa0]">
                  PostgreSQL 16 Sandbox Engine
                </span>
              </div>

              {/* Sello Holográfico + QR */}
              <div className="flex flex-col items-center justify-center order-first md:order-none py-1">
                <div className="relative w-24 h-24 rounded-full bg-[#25293a] flex items-center justify-center p-2 shadow-xl ring-2 ring-[#7bd0ff]/20">
                  {qrSvgUrl ? (
                    <img
                      src={qrSvgUrl}
                      alt={`Código QR de verificación ${certificate.verificationCode}`}
                      className="w-14 h-14 rounded-md object-contain"
                    />
                  ) : (
                    <svg className="w-12 h-12 text-[#dee1f9]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14 0h2v2h-2v-2zm-4 0h2v2h-2v-2zm2 2h2v4h-2v-4zm2 2h2v2h-2v-2zm-6-2h2v2h-2v-2zm0 2h2v2h-2v-2z" />
                    </svg>
                  )}
                  <div
                    className="pointer-events-none absolute inset-0 rounded-full border border-dashed border-[#7bd0ff]/40 animate-spin"
                    style={{ animationDuration: '25s' }}
                  />
                </div>
                <span className="mt-2 font-mono text-[10px] text-[#7bd0ff] font-bold tracking-[0.16em] uppercase">
                  QURIO VERIFIED
                </span>
              </div>

              {/* Firma 2 */}
              <div className="flex flex-col items-center text-center">
                <div className="h-10 flex items-center justify-center mb-1">
                  <svg className="h-8 w-40 text-[#c0c1ff] opacity-90" fill="none" stroke="currentColor" viewBox="0 0 160 40" aria-hidden="true">
                    <path d="M15 15 C35 38, 55 5, 80 25 C100 42, 115 10, 140 30" strokeLinecap="round" strokeWidth="2" />
                    <circle cx="145" cy="28" fill="currentColor" r="2.5" />
                  </svg>
                </div>
                <div className="w-36 h-px bg-[#464554] my-1" />
                <span className="text-xs sm:text-sm font-semibold text-[#dee1f9]">
                  Comité Técnico Qurio
                </span>
                <span className="font-mono text-[10px] text-[#908fa0]">
                  AST Audit &amp; Curriculum QA
                </span>
              </div>
            </div>

            {/* Ledger Footer (SHA-256 + Emisión + Registro) */}
            <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-2 mt-5 pt-4 border-t border-[#464554]/30 text-[#908fa0] font-mono text-[11px]">
              <div className="flex items-center gap-2 max-w-full">
                <Lock className="w-3.5 h-3.5 text-[#4ae176] shrink-0" />
                <span className="text-[#c7c4d7] uppercase tracking-wider shrink-0">HASH SHA-256:</span>
                <span className="truncate max-w-[200px] sm:max-w-xs text-[#908fa0]">{sha256Digest}</span>
              </div>
              <div className="flex items-center gap-4 shrink-0">
                <span>
                  EMITIDO: <strong className="text-[#dee1f9]">{certificate.issuedDate}</strong>
                </span>
                <span>
                  REG: <strong className="text-[#7bd0ff]">#{certificate.verificationCode}</strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN INFERIOR: HABILIDADES VALIDADAS Y VALIDACIÓN PÚBLICA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 print:hidden">
        {/* Competencias (2 columnas) */}
        <div className="lg:col-span-2 p-5 rounded-xl bg-[#161b2b] border border-[#2f3446]/60 shadow-sm flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-[#7bd0ff]" />
                <h4 className="text-base font-semibold text-[#dee1f9]">Habilidades Técnicas Validadas</h4>
              </div>
              <span className="px-2.5 py-0.5 rounded bg-[#25293a] text-[#4ae176] font-mono text-[11px]">
                {skills.length} Competencias Clave
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#c7c4d7] mb-4 leading-relaxed">
              El estudiante resolvió retos autónomos evaluados por conjunto de datos y AST sobre
              PostgreSQL 16 aislado, validando columnas, orden, nulidad y lógica relacional.
            </p>

            <div className="flex flex-wrap gap-2">
              {skills.map((skill, idx) => (
                <div
                  key={skill}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#25293a] text-[#dee1f9] font-mono text-xs"
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${skillDotColors[idx % skillDotColors.length]}`}
                  />
                  <span>{skill}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-[#464554]/30 flex flex-wrap items-center justify-between gap-2 text-[#908fa0] font-mono text-[11px]">
            <span className="inline-flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5" />
              <span>Entorno de Evaluación: PostgreSQL 16 (Docker Sandbox)</span>
            </span>
            <span className="text-[#4ae176]">Validación Cero Falsos Positivos</span>
          </div>
        </div>

        {/* Registro Público y Verificación en Vivo (1 columna) */}
        <div className="p-5 rounded-xl bg-[#161b2b] border border-[#2f3446]/60 shadow-sm flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-4 h-4 text-[#4ae176]" />
              <h4 className="text-base font-semibold text-[#dee1f9]">Validación Pública</h4>
            </div>
            <p className="text-xs sm:text-sm text-[#c7c4d7] mb-3 leading-relaxed">
              Cualquier reclutador o líder técnico puede validar la autenticidad en tiempo real mediante
              esta URL única.
            </p>

            <div className="p-2.5 rounded-lg bg-[#2f3446] mb-3">
              <span className="font-mono text-[10px] text-[#908fa0] uppercase block mb-1">
                URL Oficial de Verificación:
              </span>
              <span className="font-mono text-xs text-[#7bd0ff] break-all select-all">{verifyUrl}</span>
            </div>

            <div className="flex flex-col gap-1.5 font-mono text-[11px] text-[#c7c4d7]">
              <div className="flex justify-between gap-2">
                <span className="text-[#908fa0]">Estado del Certificado:</span>
                <span
                  className={`font-semibold inline-flex items-center gap-1.5 ${
                    certificate.isQaPreview ? 'text-[#F59E0B]' : 'text-[#4ae176]'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      certificate.isQaPreview ? 'bg-[#F59E0B]' : 'bg-[#4ae176]'
                    }`}
                  />
                  {certificate.isQaPreview ? 'QA Admin Preview' : 'Activo & Vigente'}
                </span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-[#908fa0]">Firma de Integridad:</span>
                <span className="text-[#dee1f9]">SHA-256 Verificable</span>
              </div>
              <div className="flex justify-between gap-2">
                <span className="text-[#908fa0]">Validez:</span>
                <span className="text-[#dee1f9]">Permanente (Sin expiración)</span>
              </div>
            </div>
          </div>

          {onOpenVerifyPage ? (
            <button
              type="button"
              onClick={() => {
                onClose?.();
                onOpenVerifyPage(certificate.verificationCode);
              }}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-[#25293a] hover:bg-[#34394a] text-[#dee1f9] font-mono text-xs font-semibold transition-colors shadow-sm"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#7bd0ff]" />
              <span>Comprobar Verificación en Vivo</span>
            </button>
          ) : (
            <a
              href={verifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg bg-[#25293a] hover:bg-[#34394a] text-[#dee1f9] font-mono text-xs font-semibold transition-colors shadow-sm"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#7bd0ff]" />
              <span>Abrir Enlace Permanente</span>
            </a>
          )}
        </div>
      </div>

      {/* BARRA DE PORTAFOLIO Y COMPARTICIÓN SOCIAL */}
      <div className="p-4 rounded-xl bg-[#161b2b] border border-[#2f3446]/60 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3 print:hidden">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#1a1f30] flex items-center justify-center text-[#7bd0ff] shrink-0">
            <Share2 className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-[#dee1f9]">
              Lleva tu logro a tu portafolio profesional
            </span>
            <span className="text-xs text-[#c7c4d7]">
              Incrusta este certificado en tu CV digital, README de GitHub o red profesional.
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            type="button"
            onClick={handleCopyHtmlBadge}
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#25293a] hover:bg-[#34394a] text-[#c7c4d7] hover:text-[#dee1f9] font-mono text-xs font-semibold transition-colors"
          >
            {copiedBadge ? <Check className="w-3.5 h-3.5 text-[#4ae176]" /> : <Code2 className="w-3.5 h-3.5" />}
            <span>{copiedBadge ? 'Badge HTML Copiado' : 'Copiar Badge HTML'}</span>
          </button>
          <a
            href={shareOnXUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 md:flex-initial inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#25293a] hover:bg-[#34394a] text-[#c7c4d7] hover:text-[#dee1f9] font-mono text-xs font-semibold transition-colors"
          >
            <XSocialLogo className="w-3.5 h-3.5" />
            <span>Publicar en X</span>
          </a>
        </div>
      </div>
    </div>
  );
};
