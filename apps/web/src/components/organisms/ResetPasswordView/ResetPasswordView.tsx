import React, { useState } from 'react';
import { KeyRound, Lock, Eye, EyeOff, AlertOctagon, CheckCircle2, ArrowRight, RefreshCw } from 'lucide-react';
import { FormField } from '@/components/molecules/FormField/FormField';
import { Button } from '@/components/atoms/Button/Button';
import { Badge } from '@/components/atoms/Badge/Badge';
import { useAuth } from '@/hooks/useAuth';
import { getInitialAuthCallbackError, isSupabaseConfigured } from '@/lib/supabase';

export interface ResetPasswordViewProps {
  onNavigate: (path: string) => void;
  onRequestNewLink?: () => void;
}

export const ResetPasswordView: React.FC<ResetPasswordViewProps> = ({
  onNavigate,
  onRequestNewLink,
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const { updatePassword, session, loading, error: authError } = useAuth();
  const callbackError = getInitialAuthCallbackError();

  const missingSessionMessage = React.useMemo(() => {
    if (callbackError?.errorCode === 'otp_expired') {
      return 'El enlace de recuperación ha expirado o ya fue utilizado. Solicita un nuevo correo de recuperación para continuar.';
    }
    if (callbackError?.errorDescription) {
      return `El enlace de recuperación no es válido (${callbackError.errorDescription}). Solicita uno nuevo para continuar.`;
    }
    if (authError) {
      return `No se pudo validar tu sesión de recuperación (${authError}). Solicita un nuevo enlace para continuar.`;
    }
    return 'No se detectó una sesión de recuperación activa. Abre el enlace directamente desde tu correo o solicita un nuevo enlace de recuperación.';
  }, [callbackError, authError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (newPassword.length < 6) {
      setFormError('La nueva contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setFormError('Las contraseñas no coinciden. Por favor verifícalas.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await updatePassword(newPassword);
      if (!res.success) {
        setFormError(res.error || 'Error al actualizar la contraseña en Supabase.');
      } else {
        setSuccess(true);
      }
    } catch (err: any) {
      setFormError(err.message || 'Error inesperado al actualizar la contraseña.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 animate-fadeIn">
      <div className="relative w-full max-w-md p-7 sm:p-8 rounded-3xl bg-surface/80 border border-border-subtle/80 shadow-2xl backdrop-blur-md overflow-hidden flex flex-col gap-6">
        {/* Glows ambientales */}
        <div className="absolute -top-24 -right-24 w-60 h-60 rounded-full bg-primary/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-60 h-60 rounded-full bg-cyan-accent/15 blur-3xl pointer-events-none" />

        {/* Header con Icono */}
        <div className="flex flex-col items-center text-center gap-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 via-cyan-accent/10 to-indigo-500/20 border border-primary/30 flex items-center justify-center shadow-sm">
            <KeyRound className="w-7 h-7 text-primary" />
          </div>

          <Badge variant="cyan" dot size="sm">
            RECUPERACIÓN SEGURA DE ACCESO
          </Badge>

          <h1 className="text-xl sm:text-2xl font-bold text-content-primary tracking-tight">
            Restablecer Contraseña
          </h1>

          <p className="text-xs text-content-secondary leading-relaxed font-sans">
            Introduce y confirma tu nueva clave de acceso para actualizar tus credenciales en Supabase Cloud.
          </p>
        </div>

        {/* Estado de Éxito */}
        {success ? (
          <div className="flex flex-col items-center text-center gap-4 py-4 animate-fadeIn">
            <div className="w-12 h-12 rounded-full bg-emerald/15 border border-emerald/30 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-emerald" />
            </div>

            <div className="flex flex-col gap-1">
              <h3 className="text-sm font-bold text-content-primary">
                ¡Contraseña Actualizada con Éxito!
              </h3>
              <p className="text-xs text-content-secondary">
                Tu clave ha sido reconfigurada. Ahora puedes acceder con tus nuevas credenciales.
              </p>
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={() => onNavigate('dashboard')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
              className="w-full mt-2 shadow-glow-primary"
            >
              Continuar al Dashboard
            </Button>
          </div>
        ) : isSupabaseConfigured && loading ? (
          <div className="flex flex-col items-center text-center gap-3 py-6 animate-fadeIn">
            <div className="w-7 h-7 border-2 border-cyan-accent border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-mono text-content-secondary">
              Validando token de recuperación en Supabase Cloud...
            </p>
          </div>
        ) : isSupabaseConfigured && !session ? (
          <div className="flex flex-col gap-4 py-2 animate-fadeIn">
            <div
              role="alert"
              className="p-3.5 rounded-xl bg-error/10 border border-error/30 text-error flex items-start gap-2.5 text-xs font-mono"
            >
              <AlertOctagon className="w-4 h-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{missingSessionMessage}</span>
            </div>

            <div className="flex flex-col gap-2.5 pt-1">
              {onRequestNewLink && (
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={onRequestNewLink}
                  leftIcon={<RefreshCw className="w-4 h-4" />}
                  className="w-full shadow-glow-primary"
                >
                  Solicitar Nuevo Enlace
                </Button>
              )}

              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => onNavigate('dashboard')}
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="w-full"
              >
                Volver al Dashboard
              </Button>
            </div>
          </div>
        ) : (
          /* Formulario de Cambio de Contraseña */
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {formError && (
              <div
                role="alert"
                className="p-3 rounded-xl bg-error/10 border border-error/30 text-error flex items-start gap-2 text-xs font-mono animate-fadeIn"
              >
                <AlertOctagon className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{formError}</span>
              </div>
            )}

            <FormField
              label="Nueva Contraseña"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              leftIcon={<Lock className="w-4 h-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="p-1 rounded text-content-muted hover:text-content-primary transition-colors focus:outline-none"
                  title={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-cyan-accent" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              }
              helperText="Mínimo 6 caracteres"
            />

            <FormField
              label="Confirmar Nueva Contraseña"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              leftIcon={<Lock className="w-4 h-4" />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="p-1 rounded text-content-muted hover:text-content-primary transition-colors focus:outline-none"
                  title={showConfirmPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  aria-label={showConfirmPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4 text-cyan-accent" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              }
            />

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSubmitting}
              className="w-full mt-2 shadow-glow-primary"
            >
              Guardar Nueva Contraseña y Entrar
            </Button>
          </form>
        )}
      </div>
    </div>
  );
};
