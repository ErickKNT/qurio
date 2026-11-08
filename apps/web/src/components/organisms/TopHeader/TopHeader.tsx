import React, { useState } from 'react';
import { Bell, Zap, Terminal } from 'lucide-react';
import { SearchInput } from '@/components/molecules/SearchInput/SearchInput';
import { StreakPill } from '@/components/molecules/StreakPill/StreakPill';
import { useAuth } from '@/hooks/useAuth';
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

  return (
    <header
      className={cn(
        'fixed top-0 right-0 h-16 z-40 transition-all duration-300',
        'bg-canvas/80 backdrop-blur-xl border-b border-border-subtle/80 px-6',
        'flex items-center justify-between',
        isSidebarCollapsed ? 'left-20' : 'left-64',
        className
      )}
    >
      {/* Left: Section Title or Context Breadcrumb */}
      <div className="flex items-center gap-4">
        <h2 className="text-sm font-semibold tracking-tight text-content-primary">
          {title}
        </h2>
        {onOpenPlayground && (
          <button
            onClick={onOpenPlayground}
            className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-mono font-medium rounded-md bg-surface-card hover:bg-surface-hover text-content-secondary hover:text-content-primary border border-border-subtle transition-colors"
          >
            <Terminal className="w-3.5 h-3.5 text-cyan-accent" />
            <span>Playground</span>
          </button>
        )}
      </div>

      {/* Center: Search Bar */}
      <div className="hidden lg:block w-80">
        <SearchInput
          value={searchVal}
          onChange={setSearchVal}
          placeholder="Buscar consultas, lecciones..."
        />
      </div>

      {/* Right: Gamification Badges & User Status */}
      <div className="flex items-center gap-3">
        {/* Streak Pill */}
        <StreakPill days={profile?.current_streak_days || 0} />

        {/* XP Total Badge */}
        <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-card border border-border-subtle shadow-sm">
          <Zap className="w-3.5 h-3.5 text-cyan-accent fill-cyan-accent/30" />
          <span className="font-mono text-xs font-bold text-content-primary">
            {profile?.total_xp || 0} XP
          </span>
        </div>

        {/* Notification Bell */}
        <button
          className="relative p-2 rounded-lg text-content-secondary hover:text-content-primary hover:bg-surface-card transition-colors"
          title="Notificaciones"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-accent shadow-glow-cyan" />
        </button>

        {/* User Avatar */}
        <div className="flex items-center gap-2 pl-1 border-l border-border-subtle/60">
          <img
            src={profile?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop'}
            alt={`Avatar de ${profile?.username || 'Usuario'}`}
            className="w-8 h-8 rounded-full object-cover border border-primary/50 shadow-sm"
          />
        </div>
      </div>
    </header>
  );
};
