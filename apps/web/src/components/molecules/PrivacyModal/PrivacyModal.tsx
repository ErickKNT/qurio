import React from 'react';
import { Shield, CheckCircle2, Lock, X } from 'lucide-react';
import { Button } from '@/components/atoms/Button/Button';

const GithubIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

export interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-2xl bg-surface border border-border-subtle shadow-2xl overflow-hidden p-6 sm:p-7 flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-subtle/50 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald/10 border border-emerald/30 flex items-center justify-center text-emerald">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-content-primary">
                Privacidad & Términos Transparentes
              </h3>
              <p className="text-xs text-content-secondary">
                Directrices claras, humanas y sin letra pequeña.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-content-muted hover:text-content-primary hover:bg-surface-dim transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-4 text-xs text-content-secondary leading-relaxed font-sans">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-dim/70 border border-border-subtle/40">
            <CheckCircle2 className="w-4 h-4 text-emerald shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-content-primary block mb-0.5">
                Cero Cookies de Rastreo Publicitario
              </span>
              Qurio no utiliza cookies de terceros ni herramientas de tracking invasivo. Solo se emplean tokens de sesión JWT estrictamente necesarios para tu autenticación.
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-dim/70 border border-border-subtle/40">
            <Lock className="w-4 h-4 text-cyan-accent shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-content-primary block mb-0.5">
                Aislamiento Seguro en Sandbox
              </span>
              Todas las consultas SQL que escribes se ejecutan exclusivamente en un contenedor PostgreSQL aislado bajo el rol restringido <code className="font-mono text-[11px] text-cyan-accent">readonly_student</code>. Tus datos jamás tocan bases de datos de producción.
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-dim/70 border border-border-subtle/40">
            <GithubIcon className="w-4 h-4 text-content-primary shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-content-primary block mb-0.5">
                Código Abierto y Contacto Real
              </span>
              Este proyecto es desarrollado por Erick KNT. El código fuente es público y verificable en GitHub. No hay domicilios postales falsos ni empresas fantasma.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-border-subtle/40">
          <a
            href="https://github.com/ErickKNT/qurio"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-mono text-content-muted hover:text-cyan-accent transition-colors"
          >
            <GithubIcon className="w-3.5 h-3.5" />
            <span>github.com/ErickKNT/qurio</span>
          </a>

          <Button variant="primary" size="sm" onClick={onClose}>
            Entendido
          </Button>
        </div>
      </div>
    </div>
  );
};
