import React, { useState } from 'react';
import { ChevronDown, ChevronRight, CheckCircle2, Circle, ArrowRight } from 'lucide-react';
import { Module, Exercise } from '@/types';
import { Badge, Button } from '@/components/atoms';
import { cn } from '@/lib/utils';
import { formatInlineCode } from '@/lib/format';

export interface ModuleAccordionProps {
  module: Module;
  moduleIndex: number;
  exercises: Exercise[];
  onSelectExercise: (exercise: Exercise) => void;
  defaultOpen?: boolean;
  className?: string;
}

export const ModuleAccordion: React.FC<ModuleAccordionProps> = ({
  module,
  moduleIndex,
  exercises,
  onSelectExercise,
  defaultOpen = false,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const totalExercises = exercises.length;
  const completedExercises = exercises.filter((e) => e.is_completed).length;
  const isModuleFinished = totalExercises > 0 && completedExercises === totalExercises;

  return (
    <div
      className={cn(
        'flex flex-col rounded-xl border transition-all duration-200 overflow-hidden',
        isOpen
          ? 'bg-surface/80 border-border-subtle/80 shadow-md'
          : 'bg-surface/40 hover:bg-surface/60 border-border-subtle/40',
        className
      )}
    >
      {/* Header */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between p-4 cursor-pointer select-none gap-4"
      >
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-bold shrink-0 transition-colors',
              isModuleFinished
                ? 'bg-emerald/15 text-emerald border border-emerald/30'
                : 'bg-surface-dim text-content-secondary border border-border-subtle/50'
            )}
          >
            {moduleIndex + 1}
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-content-primary">
                {module.title}
              </h4>
              {isModuleFinished && (
                <Badge variant="emerald" dot size="sm">
                  Listo
                </Badge>
              )}
            </div>
            <p className="text-xs text-content-secondary line-clamp-1 mt-0.5">
              {module.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 shrink-0 font-mono text-xs text-content-muted">
          <span>
            {completedExercises}/{totalExercises} retos
          </span>
          <button className="p-1 text-content-muted hover:text-content-primary transition-colors">
            {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Exercises List */}
      {isOpen && (
        <div className="flex flex-col border-t border-border-subtle/40 bg-surface-dim/40 divide-y divide-border-subtle/30">
          {exercises.length === 0 ? (
            <div className="p-4 text-xs font-mono text-content-muted text-center">
              No hay ejercicios disponibles en este módulo aún.
            </div>
          ) : (
            exercises.map((exercise, idx) => {
              const isDone = exercise.is_completed;
              return (
                <div
                  key={exercise.id}
                  onClick={() => onSelectExercise(exercise)}
                  className="flex items-center justify-between py-3 px-5 hover:bg-surface/50 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="shrink-0">
                      {isDone ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald" />
                      ) : (
                        <Circle className="w-4 h-4 text-content-muted group-hover:text-cyan-accent transition-colors" />
                      )}
                    </div>

                    <div className="flex flex-col">
                      <span className="text-xs font-medium text-content-primary group-hover:text-cyan-accent transition-colors">
                        {idx + 1}. {exercise.title}
                      </span>
                      <span className="text-[11px] font-sans text-content-muted line-clamp-1">
                        {formatInlineCode(exercise.prompt)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <Badge variant="mono" size="sm">
                      {exercise.difficulty}
                    </Badge>
                    <span className="text-xs font-mono font-bold text-cyan-accent">
                      +{exercise.xp_reward} XP
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-xs py-1 px-2.5 opacity-80 group-hover:opacity-100"
                    >
                      <span>{isDone ? 'Repasar' : 'Resolver'}</span>
                      <ArrowRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
