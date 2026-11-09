import React from 'react';
import { CheckCircle2, Terminal, ArrowRight, ShieldCheck, Database, Award } from 'lucide-react';
import { Button } from '@/components/atoms/Button/Button';
import { Badge } from '@/components/atoms/Badge/Badge';

export interface AuthConfirmViewProps {
  onNavigate: (path: string) => void;
  userEmail?: string;
}

export const AuthConfirmView: React.FC<AuthConfirmViewProps> = ({
  onNavigate,
  userEmail,
}) => {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 animate-fadeIn">
      <div className="relative w-full max-w-lg p-7 sm:p-9 rounded-3xl bg-surface/80 border border-emerald/30 shadow-2xl backdrop-blur-md overflow-hidden text-center flex flex-col items-center gap-6">
        {/* Glows ambientales de éxito esmeralda */}
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-emerald/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 rounded-full bg-cyan-accent/15 blur-3xl pointer-events-none" />

        {/* Isotipo Oficial con Pulso Esmeralda */}
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald/20 via-primary/10 to-cyan-accent/20 border border-emerald/40 flex items-center justify-center shadow-glow-emerald">
            <CheckCircle2 className="w-9 h-9 text-emerald" />
          </div>
          <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald border-2 border-surface animate-ping" />
        </div>

        {/* Título y Mensaje */}
        <div className="flex flex-col gap-2 items-center">
          <Badge variant="emerald" dot size="sm">
            CUENTA ACTIVADA EN SUPABASE CLOUD
          </Badge>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-content-primary tracking-tight">
            ¡Correo Verificado con Éxito!
          </h1>

          <p className="text-xs sm:text-sm text-content-secondary max-w-md leading-relaxed font-sans">
            Tu dirección de correo{' '}
            {userEmail && <span className="font-mono text-cyan-accent font-semibold">{userEmail} </span>}
            ha sido autenticada criptográficamente. Tu perfil en Qurio ha sido activado y vinculado a tu Sandbox de PostgreSQL.
          </p>
        </div>

        {/* Ficha Técnica de Auditoría (Metáfora Relacional) */}
        <div className="w-full p-3.5 rounded-xl bg-surface-dim/80 border border-border-subtle/70 font-mono text-xs flex flex-col gap-2 text-left">
          <div className="flex items-center justify-between text-content-muted border-b border-border-subtle/40 pb-1.5 text-[11px]">
            <span className="flex items-center gap-1.5 text-content-primary font-bold">
              <Terminal className="w-3.5 h-3.5 text-emerald" />
              <span>pg_stat • Supabase Auth</span>
            </span>
            <span className="text-emerald">HTTP 200 OK</span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] text-content-secondary">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-primary" />
              <span>JWT: Sesión Firmada</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-cyan-accent" />
              <span>Sandbox: readonly_student</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-streak" />
              <span>XP Inicial: 0 XP (Nivel 1)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald" />
              <span>email_confirmed: TRUE</span>
            </div>
          </div>
        </div>

        {/* Botones de Acción */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
          <Button
            variant="primary"
            size="md"
            onClick={() => onNavigate('dashboard')}
            rightIcon={<ArrowRight className="w-4 h-4" />}
            className="w-full sm:flex-1 shadow-glow-primary"
          >
            Entrar al Dashboard
          </Button>

          <Button
            variant="outline"
            size="md"
            onClick={() => onNavigate('exercise')}
            className="w-full sm:flex-1 text-xs"
          >
            Ir Directo a Resolver SQL
          </Button>
        </div>
      </div>
    </div>
  );
};
