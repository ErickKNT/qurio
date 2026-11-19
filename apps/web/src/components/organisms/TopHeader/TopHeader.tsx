import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  Terminal,
  Sun,
  Moon,
  LogIn,
  LogOut,
  ChevronDown,
  ShieldCheck,
  Zap,
  Menu,
  Search,
} from 'lucide-react';
import { KbdShortcut } from '@/components/atoms/KbdShortcut/KbdShortcut';
import { Button } from '@/components/atoms/Button/Button';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';

export interface TopHeaderProps {
  title?: string;
  isSidebarCollapsed?: boolean;
  onOpenMobileMenu?: () => void;
  onOpenPlayground?: () => void;
  onOpenSearch?: () => void;
  onOpenAuth?: () => void;
  className?: string;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  title = 'Inicio',
  isSidebarCollapsed = false,
  onOpenMobileMenu,
  onOpenPlayground,
  onOpenSearch,
  onOpenAuth,
  className,
}) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const { user, profile, isAuthenticated, isCloudAuth, signOut } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    if (userMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [userMenuOpen]);

  const handleSignOut = async () => {
    setUserMenuOpen(false);
    await signOut();
  };

  const defaultAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${profile?.username || 'student'}`;

  return (
    <header
      className={cn(
        'fixed top-0 right-0 left-0 h-14 z-40 transition-all duration-300',
        'bg-canvas/90 backdrop-blur-md border-b border-border-subtle/50 px-4 sm:px-6',
        'flex items-center justify-between gap-2',
        isSidebarCollapsed ? 'lg:left-20' : 'lg:left-64',
        className
      )}
    >
      {/* Left: Mobile Menu Button + Section Title or Context Breadcrumb */}
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        {onOpenMobileMenu && (
          <button
            type="button"
            onClick={onOpenMobileMenu}
            className="lg:hidden p-1.5 -ml-1 rounded-lg text-content-muted hover:text-content-primary hover:bg-surface-card/60 transition-colors shrink-0"
            aria-label="Abrir menú de navegación"
            title="Menú"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <h2 className="text-xs font-semibold tracking-tight text-content-primary uppercase font-mono flex items-center gap-1.5 truncate">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          <span>{title}</span>
        </h2>
        {onOpenPlayground && title !== 'Laboratorio SQL' && (
          <button
            type="button"
            onClick={onOpenPlayground}
            className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-mono rounded-full bg-cyan-accent/10 hover:bg-cyan-accent/20 text-cyan-600 dark:text-cyan-accent border border-cyan-accent/25 transition-all shadow-sm"
          >
            <Terminal className="w-3 h-3 text-cyan-accent" />
            <span>Laboratorio SQL</span>
          </button>
        )}
      </div>

      {/* Center: Quick Command Search Trigger (⌘K) */}
      {onOpenSearch && (
        <div className="hidden lg:block w-72">
          <button
            type="button"
            onClick={onOpenSearch}
            className="w-full flex items-center justify-between gap-2 px-3 py-1.5 rounded-lg bg-surface-card/70 hover:bg-surface-card border border-border-subtle hover:border-primary/40 text-xs text-content-muted transition-colors"
            title="Abrir búsqueda rápida (⌘K)"
          >
            <span className="flex items-center gap-2 truncate">
              <Search className="w-3.5 h-3.5 text-content-muted shrink-0" />
              <span className="truncate">Buscar retos, guías, SQL...</span>
            </span>
            <KbdShortcut keys={['⌘', 'K']} />
          </button>
        </div>
      )}

      {/* Right: Mobile Search + Theme + Notifications & Auth */}
      <div className="flex items-center gap-2 sm:gap-3">
        {onOpenSearch && (
          <button
            type="button"
            onClick={onOpenSearch}
            className="lg:hidden p-1.5 rounded-lg text-content-muted hover:text-content-primary hover:bg-surface-card/60 transition-colors"
            title="Búsqueda rápida (⌘K)"
            aria-label="Abrir búsqueda rápida"
          >
            <Search className="w-4 h-4" />
          </button>
        )}
        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-1.5 rounded-lg text-content-muted hover:text-content-primary hover:bg-surface-card/60 transition-colors"
          title={isDark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro'}
          aria-label="Alternar tema claro y oscuro"
        >
          {isDark ? (
            <Sun className="w-4 h-4 text-amber-streak drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
          ) : (
            <Moon className="w-4 h-4 text-primary drop-shadow-[0_0_8px_rgba(99,102,241,0.4)]" />
          )}
        </button>

        {/* Notification Bell */}
        <button
          className="relative p-1.5 rounded-lg text-content-muted hover:text-content-primary hover:bg-surface-card/60 transition-colors"
          title="Notificaciones"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-cyan-accent" />
        </button>

        {/* GESTIÓN DE SESIÓN: INVITADO VS AUTENTICADO */}
        {!isAuthenticated ? (
          <div className="flex items-center gap-2 pl-3 border-l border-border-subtle/50">
            <Button
              variant="primary"
              size="sm"
              onClick={onOpenAuth}
              leftIcon={<LogIn className="w-3.5 h-3.5" />}
              className="text-xs py-1 px-3 shadow-glow-primary"
            >
              Iniciar sesión
            </Button>
          </div>
        ) : (
          <div className="relative pl-3 border-l border-border-subtle/50" ref={menuRef}>
            <button
              type="button"
              onClick={() => setUserMenuOpen((prev) => !prev)}
              className="flex items-center gap-2 hover:opacity-90 transition-opacity p-1 rounded-xl hover:bg-surface-card/50"
              title="Opciones de cuenta"
              aria-expanded={userMenuOpen}
            >
              <div className="relative">
                <img
                  src={profile?.avatar_url || defaultAvatar}
                  alt={`Avatar de ${profile?.username || user?.email || 'Usuario'}`}
                  className="w-7 h-7 rounded-full object-cover border border-emerald/60 shadow-sm"
                />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald border-2 border-surface animate-pulse" />
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-content-primary leading-tight font-mono">
                  {profile?.username || user?.email?.split('@')[0]}
                </span>
                <span className="text-[10px] text-content-muted leading-none">
                  {user?.email || 'Sesión activa'}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-content-muted ml-0.5" />
            </button>

            {/* Menú Desplegable de Usuario (Dropdown) */}
            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-surface border border-border-subtle/80 shadow-2xl p-3 z-50 animate-scaleUp font-sans">
                {/* Cabecera del usuario */}
                <div className="flex items-center gap-2.5 p-2 rounded-xl bg-surface-dim border border-border-subtle/50 mb-2">
                  <img
                    src={profile?.avatar_url || defaultAvatar}
                    alt="Avatar de usuario"
                    className="w-9 h-9 rounded-full object-cover border border-emerald/50 shrink-0"
                  />
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-xs font-bold text-content-primary truncate font-mono">
                      {profile?.username || user?.email?.split('@')[0]}
                    </span>
                    <span className="text-[10px] text-content-muted truncate font-sans">
                      {user?.email}
                    </span>
                  </div>
                </div>

                {/* Insignia de estado */}
                <div className="flex items-center justify-between px-2 py-1.5 text-[11px] font-mono text-content-secondary border-b border-border-subtle/40 mb-2">
                  <span className="flex items-center gap-1.5 text-emerald">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{isCloudAuth ? 'Supabase Cloud' : 'Sesión local'}</span>
                  </span>
                  <div className="flex items-center gap-1 text-amber-streak">
                    <Zap className="w-3 h-3 fill-amber-streak" />
                    <span className="font-bold">{profile?.total_xp ?? 0} XP</span>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex flex-col gap-1">
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs font-mono text-error hover:bg-error/10 transition-colors text-left"
                  >
                    <LogOut className="w-3.5 h-3.5 shrink-0" />
                    <span>Cerrar sesión</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
