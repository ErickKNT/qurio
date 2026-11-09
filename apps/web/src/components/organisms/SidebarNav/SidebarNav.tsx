import React from 'react';
import {
  LayoutDashboard,
  GitBranch,
  Terminal,
  Award,
  User,
  Flame,
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
    { id: 'playground', label: 'SQL Playground', icon: Terminal },
    { id: 'achievements', label: 'Logros & Rangos', icon: Award },
    { id: 'profile', label: 'Mi Perfil', icon: User },
  ];

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen z-50 flex flex-col justify-between transition-all duration-300',
        'bg-surface-dim border-r border-border-subtle/60 select-none',
        isCollapsed ? 'w-20' : 'w-64',
        className
      )}
    >
      {/* Top Header & Brand */}
      <div className="flex flex-col">
        <div className="p-4 flex items-center justify-between border-b border-border-subtle/40">
          <div className="flex items-center gap-2.5 overflow-hidden">
            {/* Isotipo Oficial SVG de Qurio */}
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary/15 via-cyan-accent/10 to-emerald/15 border border-primary/25 flex items-center justify-center shrink-0 shadow-sm">
              <svg className="w-5 h-5" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <ellipse cx="16" cy="9.5" rx="7.5" ry="3" fill="#7bd0ff" fillOpacity="0.25" stroke="#7bd0ff" strokeWidth="1.5" />
                <path d="M8.5 9.5V16C8.5 17.65 11.85 19 16 19C20.15 19 23.5 17.65 23.5 16V9.5" stroke="#8083ff" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M8.5 16V22.5C8.5 24.15 11.85 25.5 16 25.5C20.15 25.5 23.5 24.15 23.5 22.5V16" stroke="#7bd0ff" strokeWidth="1.5" strokeLinecap="round" />
                <circle cx="16" cy="16" r="1.5" fill="#22C55E" />
              </svg>
            </div>

            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="font-sans font-bold text-sm tracking-tight text-content-primary">
                  Qurio
                </span>
                <span className="text-[10px] font-mono flex items-center gap-1.5 px-1.5 py-0.2 rounded-full bg-emerald/10 text-emerald-600 dark:text-emerald border border-emerald/20 w-fit">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald shrink-0 animate-pulse" />
                  pg:16 sandbox
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
              {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="p-2.5 flex flex-col gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.id;

            const iconColors: Record<string, string> = {
              dashboard: isActive ? 'text-primary' : 'text-content-muted group-hover:text-primary',
              tracks: isActive ? 'text-primary' : 'text-content-muted group-hover:text-primary',
              playground: isActive ? 'text-cyan-accent' : 'text-content-muted group-hover:text-cyan-accent',
              achievements: isActive ? 'text-amber-streak' : 'text-content-muted group-hover:text-amber-streak',
              profile: isActive ? 'text-purple-500' : 'text-content-muted group-hover:text-purple-500',
            };

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={cn(
                  'group relative flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-150',
                  isActive
                    ? 'bg-primary/10 text-primary dark:text-primary-light font-semibold shadow-sm border border-primary/25 pl-3.5'
                    : 'text-content-secondary hover:text-content-primary hover:bg-surface-card/60 border border-transparent'
                )}
                title={isCollapsed ? item.label : undefined}
              >
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-primary" />
                )}
                <Icon
                  className={cn(
                    'w-4 h-4 shrink-0 transition-colors',
                    iconColors[item.id] || (isActive ? 'text-primary' : 'text-content-muted')
                  )}
                />
                {!isCollapsed && <span className="flex-1 text-left truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer User Profile & Level/XP Card */}
      <div className="p-3 border-t border-border-subtle/40">
        {!isCollapsed ? (
          <div className="flex flex-col gap-2 p-2.5 rounded-xl bg-surface/60 border border-border-subtle/60 shadow-sm">
            <div className="flex items-center gap-2">
              <img
                src={profile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'}
                alt={`Avatar de ${profile?.username || 'Estudiante'}`}
                className="w-7 h-7 rounded-full object-cover border border-border-subtle shrink-0"
              />
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-xs font-medium text-content-primary truncate">
                  {profile?.username || 'Estudiante'}
                </span>
                <span className="text-[10px] font-mono text-content-muted truncate">
                  Nivel {profile?.current_level || 1} • Explorer
                </span>
              </div>
              <div className="flex items-center gap-1 text-[11px] font-mono font-medium text-amber-streak bg-amber-streak/10 px-1.5 py-0.5 rounded border border-amber-streak/20" title="Racha activa">
                <Flame className="w-3 h-3 fill-amber-streak" />
                <span>{profile?.current_streak_days || 0}d</span>
              </div>
            </div>

            {/* XP Bar minimal */}
            <div className="flex flex-col gap-1 pt-1 border-t border-border-subtle/30">
              <div className="flex justify-between text-[10px] font-mono text-content-muted">
                <span className="text-primary font-medium">{profile?.total_xp || 0} XP</span>
                <span>72%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-surface-dim overflow-hidden border border-border-subtle/40">
                <div
                  className="h-full bg-gradient-to-r from-primary via-indigo-500 to-cyan-accent rounded-full"
                  style={{ width: '72%' }}
                />
              </div>
            </div>

            <button
              onClick={signOut}
              className="mt-0.5 flex items-center justify-center gap-1.5 text-[10px] text-content-muted hover:text-error transition-colors pt-1 border-t border-border-subtle/30"
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
              className="w-7 h-7 rounded-full object-cover border border-border-subtle"
            />
            <button
              onClick={signOut}
              className="p-1 rounded text-content-muted hover:text-error hover:bg-surface-card transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
