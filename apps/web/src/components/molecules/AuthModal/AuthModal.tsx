import React, { useState } from 'react';
import {
  X,
  Lock,
  Mail,
  User,
  AlertOctagon,
  CheckCircle2,
  ShieldCheck,
  Eye,
  EyeOff,
  ArrowLeft,
  KeyRound,
  Info,
} from 'lucide-react';
import { FormField } from '@/components/molecules/FormField/FormField';
import { Button } from '@/components/atoms/Button/Button';
import { Badge } from '@/components/atoms/Badge/Badge';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export type AuthMode = 'signin' | 'signup' | 'forgot';

export interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: AuthMode;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'signin',
}) => {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [signupSuccess, setSignupSuccess] = useState<{
    email: string;
    username: string;
    isDemo: boolean;
    requiresEmail: boolean;
  } | null>(null);

  const [forgotSuccess, setForgotSuccess] = useState<{
    email: string;
    isDemo: boolean;
  } | null>(null);

  const { signIn, signUp, resetPassword, isCloudAuth, isDemoMode } = useAuth();

  React.useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setSignupSuccess(null);
      setForgotSuccess(null);
      setFormError(null);
      setSuccessMessage(null);
      setShowPassword(false);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleClose = () => {
    setSignupSuccess(null);
    setForgotSuccess(null);
    setFormError(null);
    setSuccessMessage(null);
    onClose();
  };

  const handleModeSwitch = (newMode: AuthMode) => {
    setMode(newMode);
    setSignupSuccess(null);
    setForgotSuccess(null);
    setFormError(null);
    setSuccessMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMessage(null);

    // MODO RECUPERACIÓN DE CONTRASEÑA
    if (mode === 'forgot') {
      if (!email.trim()) {
        setFormError('Por favor introduce tu correo electrónico para enviarte el enlace.');
        return;
      }

      setIsSubmitting(true);
      try {
        const res = await resetPassword(email);
        if (!res.success) {
          setFormError(res.error || 'No se pudo enviar el enlace de recuperación.');
        } else {
          setForgotSuccess({
            email,
            isDemo: Boolean(res.isDemo),
          });
        }
      } catch (err: any) {
        setFormError(err.message || 'Error al solicitar recuperación de contraseña.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // MODO LOGIN
    if (mode === 'signin') {
      if (!email || !password) {
        setFormError('Por favor completa todos los campos requeridos.');
        return;
      }

      setIsSubmitting(true);
      try {
        const res = await signIn(email, password);
        if (!res.success) {
          setFormError(res.error || 'Credenciales inválidas. Verifica tu correo y contraseña.');
        } else {
          handleClose();
        }
      } catch (err: any) {
        setFormError(err.message || 'Error inesperado durante la autenticación.');
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    // MODO REGISTRO
    if (mode === 'signup') {
      if (!email || !password || !username.trim()) {
        setFormError('Por favor completa todos los campos requeridos para crear tu cuenta.');
        return;
      }

      if (password.length < 6) {
        setFormError('La contraseña debe tener al menos 6 caracteres.');
        return;
      }

      setIsSubmitting(true);
      try {
        const res = await signUp(email, password, username);
        if (!res.success) {
          setFormError(res.error || 'Error al crear la cuenta. Intenta de nuevo.');
        } else {
          // Éxito: NO cerramos silenciosamente, mostramos pantalla interactiva de confirmación
          setSignupSuccess({
            email,
            username: username.trim(),
            isDemo: Boolean(res.isDemo),
            requiresEmail: !res.emailConfirmed,
          });
        }
      } catch (err: any) {
        setFormError(err.message || 'Error inesperado durante la autenticación.');
      } finally {
        setIsSubmitting(false);
      }
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
          onClick={handleClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-content-muted hover:text-content-primary hover:bg-surface-card transition-colors"
          title="Cerrar ventana"
        >
          <X className="w-4 h-4" />
        </button>

        {/* ========================================================= */}
        {/* CASO 1: PANTALLA DE ÉXITO EN REGISTRO (CON INFORMACIÓN DE CORREO) */}
        {/* ========================================================= */}
        {signupSuccess ? (
          <div className="flex flex-col items-center text-center gap-4 py-2 animate-fadeIn">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-emerald/15 border border-emerald/40 flex items-center justify-center shadow-glow-emerald">
                {signupSuccess.isDemo ? (
                  <CheckCircle2 className="w-9 h-9 text-emerald" />
                ) : (
                  <Mail className="w-9 h-9 text-emerald animate-pulse" />
                )}
              </div>
              <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald border-2 border-surface animate-ping" />
            </div>

            <div className="flex flex-col gap-1.5 items-center">
              <Badge variant={signupSuccess.isDemo ? 'amber' : 'emerald'} dot size="sm">
                {signupSuccess.isDemo ? 'MODO DEMO LOCAL (SUPABASE NO CONFIGURADO)' : 'CORREO DE ACTIVACIÓN ENVIADO'}
              </Badge>

              <h3 className="text-xl font-extrabold text-content-primary tracking-tight">
                {signupSuccess.isDemo ? '¡Cuenta Local Creada!' : '¡Revisa tu Bandeja de Entrada!'}
              </h3>

              <p className="text-xs text-content-secondary max-w-sm leading-relaxed">
                {signupSuccess.isDemo ? (
                  <>
                    Tu perfil local ha sido creado como{' '}
                    <strong className="text-content-primary font-mono font-bold">@{signupSuccess.username}</strong>.
                    Tus retos y XP se guardarán localmente en este navegador.
                  </>
                ) : (
                  <>
                    Hemos enviado un enlace de confirmación a{' '}
                    <strong className="text-cyan-accent font-mono font-bold">{signupSuccess.email}</strong>.
                    Abre el correo y pulsa el enlace para verificar tu cuenta y activar tu sesión en Qurio.
                  </>
                )}
              </p>
            </div>

            {signupSuccess.isDemo ? (
              <div className="w-full p-3.5 rounded-xl bg-surface-dim border border-border-subtle text-left font-mono text-xs flex flex-col gap-2">
                <div className="flex items-center gap-2 text-amber-500 font-bold text-[11px]">
                  <AlertOctagon className="w-4 h-4 shrink-0" />
                  <span>¿Por qué no llegó correo?</span>
                </div>
                <p className="text-[11px] text-content-secondary leading-relaxed font-sans">
                  El frontend está en <strong>Modo Local</strong> porque aún no se han configurado las claves en <code className="text-primary font-mono text-[11px] bg-surface-card px-1 py-0.5 rounded">apps/web/.env</code>:
                </p>
                <pre className="p-2.5 rounded-lg bg-canvas text-[11px] text-content-muted overflow-x-auto border border-border-subtle/50">
{`VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key`}
                </pre>
              </div>
            ) : (
              <div className="w-full p-3.5 rounded-xl bg-surface-dim border border-border-subtle/80 text-left font-sans text-xs flex flex-col gap-2 text-content-secondary">
                <div className="flex items-start gap-2">
                  <span className="text-emerald font-bold">•</span>
                  <span>Si no encuentras el correo en unos segundos, revisa tu carpeta de <strong>Spam o Correo no deseado</strong>.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-emerald font-bold">•</span>
                  <span>Al hacer clic en el enlace, volverás automáticamente a la <strong>pantalla temática de verificación</strong> de Qurio.</span>
                </div>
              </div>
            )}

            <Button
              variant={signupSuccess.isDemo ? 'primary' : 'emerald'}
              size="md"
              onClick={handleClose}
              className="w-full mt-2"
            >
              {signupSuccess.isDemo ? 'Comenzar a Practicar' : 'Entendido, esperaré el correo'}
            </Button>
          </div>
        ) : forgotSuccess ? (
          /* ========================================================= */
          /* CASO 2: PANTALLA DE ÉXITO EN RECUPERACIÓN */
          /* ========================================================= */
          <div className="flex flex-col items-center text-center gap-4 py-2 animate-fadeIn">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-cyan-accent/15 border border-cyan-accent/40 flex items-center justify-center shadow-glow-cyan">
                <Mail className="w-9 h-9 text-cyan-accent animate-pulse" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5 items-center">
              <Badge variant="cyan" dot size="sm">
                ENLACE DE RECUPERACIÓN ENVIADO
              </Badge>

              <h3 className="text-xl font-extrabold text-content-primary tracking-tight">
                {forgotSuccess.isDemo ? 'Modo Local (Simulación)' : '¡Revisa tu Correo!'}
              </h3>

              <p className="text-xs text-content-secondary max-w-sm leading-relaxed">
                {forgotSuccess.isDemo ? (
                  <>
                    En modo local sin Supabase no se envía correo real. Cuando configures las claves en <code className="text-primary font-mono text-[11px]">apps/web/.env</code>, el correo llegará a <strong className="text-cyan-accent font-mono">{forgotSuccess.email}</strong>.
                  </>
                ) : (
                  <>
                    Hemos enviado las instrucciones para restablecer tu contraseña a{' '}
                    <strong className="text-cyan-accent font-mono font-bold">{forgotSuccess.email}</strong>.
                    Haz clic en el enlace del mensaje para definir tu nueva clave en el sistema.
                  </>
                )}
              </p>
            </div>

            <Button
              variant="primary"
              size="md"
              onClick={() => handleModeSwitch('signin')}
              className="w-full mt-2"
            >
              Volver a Iniciar Sesión
            </Button>
          </div>
        ) : (
          /* ========================================================= */
          /* CASO 3: FORMULARIO PRINCIPAL (LOGIN / REGISTRO / FORGOT) */
          /* ========================================================= */
          <>
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
                {mode === 'signin'
                  ? 'Accede a tu Estación de Trabajo SQL'
                  : mode === 'signup'
                  ? 'Crea tu Cuenta de Ingeniero'
                  : 'Recuperar Contraseña'}
              </h2>
              <p className="text-xs text-content-secondary max-w-xs leading-relaxed">
                {mode === 'signin'
                  ? 'Conecta tu cuenta para sincronizar tus avances, XP y medallas en Supabase Cloud.'
                  : mode === 'signup'
                  ? 'Empieza a resolver retos relacionales y construye tu historial de práctica auditado.'
                  : 'Introduce tu correo electrónico registrado y te enviaremos un enlace de recuperación seguro.'}
              </p>
            </div>

            {/* Aviso informativo de Modo Demo si Supabase no está configurado */}
            {isDemoMode && (
              <div className="mb-4 p-3 rounded-xl bg-amber-streak/10 border border-amber-streak/30 text-amber-500 flex items-start gap-2.5 text-xs animate-fadeIn">
                <Info className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                <div className="flex flex-col gap-0.5 text-left">
                  <span className="font-bold text-amber-400 font-mono text-[11px]">Modo Local Activo</span>
                  <span className="text-[11px] text-content-secondary leading-relaxed font-sans">
                    Supabase no está conectado todavía (<code className="text-amber-300 font-mono">apps/web/.env</code> no configurado). Para recibir correos reales de verificación, agrega tus credenciales.
                  </span>
                </div>
              </div>
            )}

            {/* Segmented Switcher (Tabs) o Botón Volver */}
            {mode !== 'forgot' ? (
              <div className="flex rounded-xl bg-surface-dim p-1 border border-border-subtle/50 mb-5 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => handleModeSwitch('signin')}
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
                  onClick={() => handleModeSwitch('signup')}
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
            ) : (
              <div className="flex items-center justify-between mb-5 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => handleModeSwitch('signin')}
                  className="flex items-center gap-1.5 text-content-muted hover:text-content-primary transition-colors text-xs"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Volver a Iniciar Sesión</span>
                </button>
                <span className="text-[11px] text-cyan-accent flex items-center gap-1">
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Supabase Reset</span>
                </span>
              </div>
            )}

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

              {mode !== 'forgot' && (
                <div className="flex flex-col gap-1.5">
                  <FormField
                    label="Contraseña"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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
                    helperText={mode === 'signup' ? 'Mínimo 6 caracteres' : undefined}
                  />

                  {/* Botón ¿Olvidaste tu contraseña? en modo Login */}
                  {mode === 'signin' && (
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleModeSwitch('forgot')}
                        className="text-[11px] font-mono text-cyan-accent hover:underline transition-colors"
                      >
                        ¿Olvidaste tu contraseña?
                      </button>
                    </div>
                  )}
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="md"
                isLoading={isSubmitting}
                className="w-full mt-2 shadow-glow-primary"
              >
                {mode === 'signin'
                  ? 'Entrar a Qurio'
                  : mode === 'signup'
                  ? (isDemoMode ? 'Crear Cuenta (Modo Local)' : 'Crear Cuenta y Comenzar')
                  : 'Enviar Enlace de Recuperación'}
              </Button>
            </form>

            {/* Footer Informativo */}
            <div className="mt-5 pt-4 border-t border-border-subtle/40 flex items-center justify-between text-[11px] font-mono text-content-muted">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className={cn('w-3.5 h-3.5', isCloudAuth ? 'text-emerald' : 'text-amber-500')} />
                <span>
                  {isCloudAuth
                    ? 'Supabase Auth JWT Conectado'
                    : isDemoMode
                    ? 'Modo Local / Demo'
                    : 'Supabase Auth'}
                </span>
              </div>
              <span>PostgreSQL Sandbox</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
