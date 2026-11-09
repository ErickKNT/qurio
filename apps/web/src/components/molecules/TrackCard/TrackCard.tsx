import React from 'react';
import { BookOpen, Clock, ChevronRight } from 'lucide-react';
import { Track } from '@/types';
import { Badge, Button } from '@/components/atoms';
import { cn } from '@/lib/utils';

export interface TrackCardProps {
  track: Track;
  isSelected?: boolean;
  onSelect: (track: Track) => void;
  onStartTrack: (track: Track) => void;
  className?: string;
}

export const TrackCard: React.FC<TrackCardProps> = ({
  track,
  isSelected = false,
  onSelect,
  onStartTrack,
  className,
}) => {
  const total = track.total_exercises || 20;
  const completed = track.completed_exercises || 0;
  const progressPercent = Math.round((completed / total) * 100);
  const isCompleted = progressPercent === 100;

  return (
    <div
      onClick={() => onSelect(track)}
      className={cn(
        'group relative flex flex-col justify-between p-6 rounded-2xl cursor-pointer transition-all duration-200',
        'bg-surface/50 hover:bg-surface/80 border',
        isSelected
          ? 'border-cyan-accent/60 shadow-glow-cyan bg-surface/90'
          : 'border-border-subtle/50 hover:border-border-subtle/90',
        className
      )}
    >
      {/* Top Header */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center font-mono text-xs font-bold shrink-0"
              style={{
                backgroundColor: `${track.color_accent}15`,
                color: track.color_accent,
                border: `1px solid ${track.color_accent}40`,
              }}
            >
              #{track.sort_order}
            </div>
            <Badge variant="mono" size="sm">
              {track.badge_name}
            </Badge>
          </div>

          {isCompleted ? (
            <Badge variant="emerald" dot size="sm">
              Completado
            </Badge>
          ) : completed > 0 ? (
            <span className="text-[11px] font-mono text-cyan-accent font-medium">
              En progreso
            </span>
          ) : (
            <span className="text-[11px] font-mono text-content-muted">
              Por iniciar
            </span>
          )}
        </div>

        {/* Title & Description */}
        <div>
          <h3 className="text-lg font-bold text-content-primary group-hover:text-cyan-accent transition-colors">
            {track.title}
          </h3>
          <p className="text-xs text-content-secondary line-clamp-2 mt-1.5 leading-relaxed">
            {track.description}
          </p>
        </div>
      </div>

      {/* Progress & Bottom Bar */}
      <div className="mt-6 flex flex-col gap-4">
        {/* Progress Bar */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="text-content-muted">Progreso del currículum</span>
            <span className="text-content-primary font-semibold">
              {completed}/{total} ({progressPercent}%)
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-surface-dim overflow-hidden border border-border-subtle/30">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-500',
                isCompleted ? 'bg-emerald' : 'bg-cyan-accent'
              )}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Meta Stats */}
        <div className="flex items-center justify-between pt-3 border-t border-border-subtle/40 text-xs font-mono text-content-muted">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5" />
              {track.modules?.length || 4} módulos
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              ~{track.sort_order === 1 ? '6h' : track.sort_order === 2 ? '8h' : '10h'}
            </span>
          </div>

          <Button
            size="sm"
            variant={isSelected ? 'primary' : 'ghost'}
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation();
              onStartTrack(track);
            }}
            className="text-xs"
          >
            <span>{completed > 0 ? 'Continuar' : 'Explorar'}</span>
            <ChevronRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
};
