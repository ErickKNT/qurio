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
} from 'lucide-react';
import { SearchInput } from '@/components/molecules/SearchInput/SearchInput';
import { Button } from '@/components/atoms/Button/Button';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';

export interface TopHeaderProps {
  title?: string;
  isSidebarCollapsed?: boolean;
  onOpenPlayground?: () => void;
  onOpenAuth?: () => void;
  className?: string;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  title = 'Dashboard',
  isSidebarCollapsed = false,
  onOpenPlayground,
  onOpenAuth,
  className,
}) => {
  const [searchVal, setSearchVal] = useState('');
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
        'fixed top-0 right-0 h-14 z-40 transition-all duration-300',
        'bg-canvas/90 backdrop-blur-md border-b border-border-subtle/50 px-6',
        'flex items-center justify-between',
        isSidebarCollapsed ? 'left-20' : 'left-64',
        className
      )}
    >
      {/* Left: Section Title or Context Breadcrumb */}
      <div className="flex items-center gap-3">
        <h2 className="text-xs font-semibold tracking-tight text-content-primary uppercase font-mono flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          <span>{title}</span>
        </h2>
        {onOpenPlayground && title !== 'SQL Playground' && (
          <button
            type="button"
            onClick={onOpenPlayground}
            className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 text-[11px] font-mono rounded-full bg-cyan-accent/10 hover:bg-cyan-accent/20 text-cyan-600 dark:text-cyan-accent border border-cyan-accent/25 transition-all shadow-sm"
          >
            <Terminal className="w-3 h-3 text-cyan-accent" />
            <span>Playground</span>
          </button>
        )}
      </div>

      {/* Center: Search Bar */}
      <div className="hidden lg:block w-72">
        <SearchInput
          value={searchVal}
          onChange={setSearchVal}
          placeholder="Buscar consultas, lecciones..."
        />
      </div>

      {/* Right: Notifications & User Avatar / Auth Buttons */}
      <div className="flex items-center gap-3">
        {/* Theme Toggle Button */}
        <button
          type="button"
          onClick={toggleTheme}
          className="p-1.5 rounded-lg text-content-muted hover:text-content-primary hover:bg-surface-card/60 transition-colors"
          title={isDark ? 'Cambiar a Tema Claro' : 'Cambiar a Tema Oscuro'}
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
              Iniciar Sesión
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
                  {user?.email || 'Sesión Activa'}
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
                    <span>{isCloudAuth ? 'Supabase Cloud' : 'Sesión Local'}</span>
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
                    <span>Cerrar Sesión</span>
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
