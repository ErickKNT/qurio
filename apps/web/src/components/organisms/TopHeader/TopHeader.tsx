import React, { useState } from 'react';
import { Bell, Terminal, Sun, Moon } from 'lucide-react';
import { SearchInput } from '@/components/molecules/SearchInput/SearchInput';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { cn } from '@/lib/utils';

export interface TopHeaderProps {
  title?: string;
  isSidebarCollapsed?: boolean;
  onOpenPlayground?: () => void;
  className?: string;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  title = 'Dashboard',
  isSidebarCollapsed = false,
  onOpenPlayground,
  className,
}) => {
  const [searchVal, setSearchVal] = useState('');
  const { profile } = useAuth();
  const { isDark, toggleTheme } = useTheme();

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

      {/* Right: Notifications & User Avatar */}
      <div className="flex items-center gap-2">
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

        {/* User Avatar */}
        <div className="flex items-center gap-2 pl-2 border-l border-border-subtle/40">
          <img
            src={profile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'}
            alt={`Avatar de ${profile?.username || 'Usuario'}`}
            className="w-7 h-7 rounded-full object-cover border border-border-subtle"
          />
          <span className="hidden sm:inline text-xs font-medium text-content-secondary">
            {profile?.username || 'Estudiante'}
          </span>
        </div>
      </div>
    </header>
  );
};
