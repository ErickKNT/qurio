import React, { useState } from 'react';
import { X, Lock, Mail, User, AlertOctagon, CheckCircle2, ShieldCheck } from 'lucide-react';
import { FormField } from '@/components/molecules/FormField/FormField';
import { Button } from '@/components/atoms/Button/Button';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signin' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin',
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { signIn, signUp, isCloudAuth, isDemoMode } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    if (!email || !password) {
      setFormError('Por favor completa todos los campos requeridos.');
      return;
    }

    if (password.length < 6) {
      setFormError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (mode === 'signup' && !username.trim()) {
      setFormError('El nombre de usuario es obligatorio para el registro.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'signin') {
        const res = await signIn(email, password);
        if (!res.success) {
          setFormError(res.error || 'Credenciales inválidas. Verifica tu correo y contraseña.');
        } else {
          onClose();
        }
      } else {
        const res = await signUp(email, password, username);
        if (!res.success) {
          setFormError(res.error || 'Error al crear la cuenta. Intenta de nuevo.');
        } else if (res.message) {
          setSuccessMessage(res.message);
        } else {
          onClose();
        }
      }
    } catch (err: any) {
      setFormError(err.message || 'Error inesperado durante la autenticación.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-canvas/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md p-6 sm:p-7 rounded-2xl bg-surface border border-border-subtle/80 shadow-2xl overflow-hidden">
        {/* Glow de ambientación superior */}
        <div className="absolute -top-24 -right-24 w-48 h-48 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 rounded-full bg-cyan-accent/10 blur-3xl pointer-events-none" />

        {/* Botón de Cierre */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-content-muted hover:text-content-primary hover:bg-surface-card transition-colors"
          title="Cerrar ventana"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header con Isotipo Oficial */}
        <div className="flex flex-col items-center text-center gap-2 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/15 via-cyan-accent/10 to-emerald/15 border border-primary/25 flex items-center justify-center shadow-sm">
            <svg className="w-7 h-7" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="16" cy="9.5" rx="7.5" ry="3" fill="#7bd0ff" fillOpacity="0.25" stroke="#7bd0ff" strokeWidth="1.5" />
              <path d="M8.5 9.5V16C8.5 17.65 11.85 19 16 19C20.15 19 23.5 17.65 23.5 16V9.5" stroke="#8083ff" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M8.5 16V22.5C8.5 24.15 11.85 25.5 16 25.5C20.15 25.5 23.5 24.15 23.5 22.5V16" stroke="#7bd0ff" strokeWidth="1.5" strokeLinecap="round" />
              <circle cx="16" cy="16" r="1.5" fill="#22C55E" />
            </svg>
          </div>

          <h2 className="text-lg font-bold text-content-primary tracking-tight">
            {mode === 'signin' ? 'Accede a tu Estación de Trabajo SQL' : 'Crea tu Cuenta de Ingeniero'}
          </h2>
          <p className="text-xs text-content-secondary max-w-xs leading-relaxed">
            {mode === 'signin'
              ? 'Conecta tu cuenta para sincronizar tus avances, XP y medallas en Supabase Cloud.'
              : 'Empieza a resolver retos relacionales y construye tu historial de práctica auditado.'}
          </p>
        </div>

        {/* Segmented Switcher (Tabs) */}
        <div className="flex rounded-xl bg-surface-dim p-1 border border-border-subtle/50 mb-5 font-mono text-xs">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setFormError(null);
            }}
            className={cn(
              'flex-1 py-1.5 px-3 rounded-lg font-semibold transition-all duration-150',
              mode === 'signin'
                ? 'bg-surface text-content-primary shadow-sm border border-border-subtle'
                : 'text-content-muted hover:text-content-primary'
            )}
          >
            Iniciar Sesión
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setFormError(null);
            }}
            className={cn(
              'flex-1 py-1.5 px-3 rounded-lg font-semibold transition-all duration-150',
              mode === 'signup'
                ? 'bg-surface text-content-primary shadow-sm border border-border-subtle'
                : 'text-content-muted hover:text-content-primary'
            )}
          >
            Registrarse
          </button>
        </div>

        {/* Mensaje de Error Inline Riguroso (Anti-AI Slop Regla 1.1) */}
        {formError && (
          <div
            role="alert"
            className="mb-4 p-3 rounded-xl bg-error/10 border border-error/30 text-error flex items-start gap-2 text-xs font-mono animate-fadeIn"
          >
            <AlertOctagon className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{formError}</span>
          </div>
        )}

        {/* Mensaje de Éxito Inline */}
        {successMessage && (
          <div
            role="status"
            className="mb-4 p-3 rounded-xl bg-emerald/10 border border-emerald/30 text-emerald-600 dark:text-emerald flex items-start gap-2 text-xs font-mono animate-fadeIn"
          >
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{successMessage}</span>
          </div>
        )}

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === 'signup' && (
            <FormField
              label="Nombre de Usuario"
              type="text"
              placeholder="tu_usuario_sql"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              leftIcon={<User className="w-4 h-4" />}
            />
          )}

          <FormField
            label="Correo Electrónico"
            type="email"
            placeholder="ingeniero@ejemplo.dev"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            leftIcon={<Mail className="w-4 h-4" />}
          />

          <FormField
            label="Contraseña"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            leftIcon={<Lock className="w-4 h-4" />}
            helperText={mode === 'signup' ? 'Mínimo 6 caracteres' : undefined}
          />

          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSubmitting}
            className="w-full mt-2 shadow-glow-primary"
          >
            {mode === 'signin' ? 'Entrar a Qurio' : 'Crear Cuenta y Comenzar'}
          </Button>
        </form>

        {/* Footer Informativo */}
        <div className="mt-5 pt-4 border-t border-border-subtle/40 flex items-center justify-between text-[11px] font-mono text-content-muted">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald" />
            <span>{isCloudAuth ? 'Supabase Auth JWT Conectado' : isDemoMode ? 'Modo Local / Demo' : 'Supabase Auth'}</span>
          </div>
          <span>PostgreSQL Sandbox</span>
        </div>
      </div>
    </div>
  );
};
