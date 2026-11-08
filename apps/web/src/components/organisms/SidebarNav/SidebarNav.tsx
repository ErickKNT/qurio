import React from 'react';
import {
  LayoutDashboard,
  GitBranch,
  Terminal,
  Award,
  User,
  Flame,
  Database,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export interface SidebarNavProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  className?: string;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  currentPath,
  onNavigate,
  isCollapsed = false,
  onToggleCollapse,
  className,
}) => {
  const { profile, signOut } = useAuth();

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tracks', label: 'Rutas de Aprendizaje', icon: GitBranch },
    { id: 'playground', label: 'SQL Playground', icon: Terminal, badge: 'Live' },
    { id: 'achievements', label: 'Logros & Rangos', icon: Award },
    { id: 'profile', label: 'Mi Perfil', icon: User },
  ];

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen z-50 flex flex-col justify-between transition-all duration-300',
        'bg-surface-dim border-r border-border-subtle select-none',
        isCollapsed ? 'w-20' : 'w-64',
        className
      )}
    >
      {/* Top Header & Brand */}
      <div className="flex flex-col">
        <div className="p-4 flex items-center justify-between border-b border-border-subtle/50">
          <div className="flex items-center gap-3 overflow-hidden">
            {/* Isotipo Oficial SVG de Qurio */}
            <div className="w-8 h-8 rounded-lg bg-surface border border-primary/40 flex items-center justify-center shrink-0 shadow-sm">
              <svg className="w-6 h-6" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="16" cy="9.5" rx="7.5" ry="3" fill="#7bd0ff" fillOpacity="0.2" stroke="#7bd0ff" strokeWidth="1.5" />
                <path d="M8.5 9.5V16C8.5 17.65 11.85 19 16 19C20.15 19 23.5 17.65 23.5 16V9.5" stroke="#8083ff" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M8.5 16V22.5C8.5 24.15 11.85 25.5 16 25.5C20.15 25.5 23.5 24.15 23.5 22.5V16" stroke="#7bd0ff" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="16" cy="16" r="1.8" fill="#22C55E" className="animate-pulse" />
              </svg>
            </div>

            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="font-sans font-bold text-base tracking-tight text-content-primary">
                  Qurio
                </span>
                <span className="text-[10px] text-content-muted truncate">
                  Aprende SQL. Piensa en queries.
                </span>
              </div>
            )}
          </div>

          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-1 rounded text-content-muted hover:text-content-primary hover:bg-surface-card transition-colors"
              title={isCollapsed ? 'Expandir barra lateral' : 'Colapsar barra lateral'}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Status Pill: PostgreSQL Sandbox Status */}
        {!isCollapsed && (
          <div className="px-4 py-2">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-surface-card/60 border border-border-subtle text-[11px] font-mono text-content-secondary">
              <span className="w-2 h-2 rounded-full bg-emerald shadow-glow-emerald" />
              <Database className="w-3 h-3 text-cyan-accent" />
              <span className="truncate">PostgreSQL 16 • Online</span>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="p-3 flex flex-col gap-1">
          {!isCollapsed && (
            <span className="px-3 py-1.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-content-muted">
              Navegación
            </span>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150',
                  isActive
                    ? 'bg-surface-card text-content-primary border border-primary/30 shadow-sm font-semibold'
                    : 'text-content-secondary hover:text-content-primary hover:bg-surface-card/50 border border-transparent'
                )}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon
                  className={cn(
                    'w-4 h-4 shrink-0 transition-colors',
                    isActive ? 'text-primary-light' : 'text-content-muted'
                  )}
                />
                {!isCollapsed && <span className="flex-1 text-left truncate">{item.label}</span>}
                {!isCollapsed && item.badge && (
                  <span className="px-1.5 py-0.2 text-[9px] font-mono font-bold rounded bg-cyan-accent/10 text-cyan-accent border border-cyan-accent/20">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer User Profile & Level/XP Card */}
      <div className="p-3 border-t border-border-subtle/50">
        {!isCollapsed ? (
          <div className="flex flex-col gap-2.5 p-3 rounded-xl bg-surface-card/70 border border-border-subtle shadow-sm">
            <div className="flex items-center gap-2.5">
              <img
                src={profile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'}
                alt={`Avatar de ${profile?.username || 'Estudiante'}`}
                className="w-8 h-8 rounded-full object-cover border border-primary/40 shrink-0"
              />
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs font-semibold text-content-primary truncate">
                  {profile?.username || 'Estudiante'}
                </span>
                <span className="text-[10px] font-mono text-cyan-accent truncate">
                  Nivel {profile?.current_level || 1} • SQL Apprentice
                </span>
              </div>
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-surface-hover text-amber-streak text-[11px] font-mono font-bold">
                <Flame className="w-3 h-3 fill-amber-streak" />
                <span>{profile?.current_streak_days || 0}d</span>
              </div>
            </div>

            {/* XP Bar */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-[10px] font-mono text-content-muted">
                <span>{profile?.total_xp || 0} / 2,000 XP</span>
                <span className="text-content-secondary">72%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-surface-dim overflow-hidden border border-border-subtle/30">
                <div
                  className="h-full bg-gradient-to-r from-primary to-cyan-accent rounded-full transition-all duration-500"
                  style={{ width: '72%' }}
                />
              </div>
            </div>

            <button
              onClick={signOut}
              className="mt-1 flex items-center justify-center gap-1.5 text-[11px] text-content-muted hover:text-error transition-colors pt-1 border-t border-border-subtle/40"
              title="Cerrar sesión"
            >
              <LogOut className="w-3 h-3" />
              <span>Cerrar sesión</span>
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <img
              src={profile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'}
              alt={`Avatar de ${profile?.username || 'Estudiante'}`}
              className="w-8 h-8 rounded-full object-cover border border-primary/40"
            />
            <button
              onClick={signOut}
              className="p-1.5 rounded text-content-muted hover:text-error hover:bg-surface-card transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
