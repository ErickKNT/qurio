import React from 'react';
import { AlertOctagon, LayoutDashboard, GitBranch, Play } from 'lucide-react';
import { Button } from '@/components/atoms/Button/Button';
import { Badge } from '@/components/atoms/Badge/Badge';
import { cn } from '@/lib/utils';

export interface NotFoundViewProps {
  missingPath?: string;
  onNavigate: (path: string) => void;
  className?: string;
}

export const NotFoundView: React.FC<NotFoundViewProps> = ({
  missingPath = 'route',
  onNavigate,
  className,
}) => {
  return (
    <div
      className={cn(
        'min-h-[70vh] flex flex-col items-center justify-center px-4 py-12 select-none animate-fadeIn',
        className
      )}
    >
      <div className="max-w-2xl w-full flex flex-col gap-6">
        {/* Terminal Header Card */}
        <div className="flex flex-col rounded-2xl bg-surface/80 border border-border-subtle/70 shadow-2xl overflow-hidden backdrop-blur-md">
          {/* Window Chrome */}
          <div className="px-4 py-3 bg-surface-dim/80 border-b border-border-subtle/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-error/60 border border-error/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-accent/60 border border-amber-accent/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald/60 border border-emerald/80 inline-block" />
              <span className="text-xs font-mono text-content-muted ml-2">
                bash: postgresql-client — 404 Not Found
              </span>
            </div>

            <Badge variant="error" dot size="sm">
              SQLSTATE 42P01
            </Badge>
          </div>

          {/* Terminal Console Output */}
          <div className="p-6 font-mono text-xs sm:text-sm text-content-secondary leading-relaxed flex flex-col gap-3 bg-canvas/90">
            <div className="text-content-muted">
              <span className="text-emerald">readonly_student@qurio-sandbox</span>
              <span>:</span>
              <span className="text-cyan-accent">~</span>
              <span>$ psql -d ecommerce_sandbox</span>
            </div>

            <div className="text-content-muted">
              <span>ecommerce_sandbox=&gt; </span>
              <span className="text-content-primary font-bold">
                SELECT * FROM &quot;{missingPath}&quot;;
              </span>
            </div>

            <div className="p-3.5 rounded-lg bg-error/10 border border-error/30 text-error flex flex-col gap-1.5">
              <div className="flex items-center gap-2 font-bold">
                <AlertOctagon className="w-4 h-4 shrink-0" />
                <span>ERROR 404 (42P01): relation &quot;{missingPath}&quot; does not exist in schema &quot;public&quot;</span>
              </div>
              <span className="text-xs text-error/80 pl-6">
                LINE 1: SELECT * FROM &quot;{missingPath}&quot;;
              </span>
              <span className="text-xs text-error/80 pl-6">
                &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;^
              </span>
            </div>

            <div className="text-content-muted pt-1">
              <span className="text-cyan-accent font-semibold">HINT:</span>{' '}
              La tabla o ruta relacional solicitada no fue compilada. Quizá quisiste hacer consulta en alguna de las rutas oficiales de Qurio:
            </div>
          </div>
        </div>

        {/* Action Controls / Recovery Options */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            variant="primary"
            onClick={() => onNavigate('dashboard')}
            leftIcon={<LayoutDashboard className="w-4 h-4" />}
          >
            Volver al Dashboard
          </Button>

          <Button
            variant="secondary"
            onClick={() => onNavigate('tracks')}
            leftIcon={<GitBranch className="w-4 h-4" />}
          >
            Explorar Rutas
          </Button>

          <Button
            variant="ghost"
            onClick={() => onNavigate('playground')}
            leftIcon={<Play className="w-4 h-4" />}
          >
            Abrir SQL Playground
          </Button>
        </div>
      </div>
    </div>
  );
};
