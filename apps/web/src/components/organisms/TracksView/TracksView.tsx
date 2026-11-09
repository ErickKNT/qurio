import React, { useState } from 'react';
import { GitBranch, Play } from 'lucide-react';
import { Track, Exercise } from '@/types';
import { TrackCard } from '@/components/molecules/TrackCard/TrackCard';
import { ModuleAccordion } from '@/components/molecules/ModuleAccordion/ModuleAccordion';
import { Button, Badge } from '@/components/atoms';

export interface TracksViewProps {
  tracks: Track[];
  exercises: Exercise[];
  onSelectExercise: (exercise: Exercise) => void;
  className?: string;
}

export const TracksView: React.FC<TracksViewProps> = ({
  tracks,
  exercises,
  onSelectExercise,
}) => {
  const [selectedTrackId, setSelectedTrackId] = useState<string>(tracks[0]?.id || 'sql-foundations');

  const selectedTrack = tracks.find((t) => t.id === selectedTrackId) || tracks[0];

  // Helper to get exercises belonging to a module
  const getExercisesForModule = (moduleId: string) => {
    return exercises.filter((e) => e.module_id === moduleId);
  };

  const handleStartTrackFirstAvailable = (track: Track) => {
    setSelectedTrackId(track.id);
    const firstUnfinished = exercises.find(
      (e) => !e.is_completed && track.modules?.some((m) => m.id === e.module_id)
    ) || exercises.find((e) => track.modules?.some((m) => m.id === e.module_id));

    if (firstUnfinished) {
      onSelectExercise(firstUnfinished);
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-surface-card border border-border-subtle/50 text-[11px] font-mono text-cyan-accent mb-2">
            <GitBranch className="w-3 h-3" />
            <span>Currículum Relacional de Qurio</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-content-primary">
            Rutas Formativas & Syllabus
          </h1>
          <p className="text-xs text-content-secondary mt-1">
            Progresa desde consultas básicas hasta funciones de ventana complejas con evaluación semántica en cada paso.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Badge variant="mono">
            {tracks.length} Rutas
          </Badge>
          <Badge variant="emerald" dot>
            3 Sandbox Activos
          </Badge>
        </div>
      </div>

      {/* Track Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {tracks.map((track) => (
          <TrackCard
            key={track.id}
            track={track}
            isSelected={track.id === selectedTrackId}
            onSelect={(t) => setSelectedTrackId(t.id)}
            onStartTrack={handleStartTrackFirstAvailable}
          />
        ))}
      </div>

      {/* Selected Track Detailed Syllabus */}
      {selectedTrack && (
        <section className="flex flex-col gap-6 p-6 sm:p-7 rounded-2xl bg-surface/60 border border-border-subtle/60 shadow-lg">
          {/* Syllabus Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border-subtle/40">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-3">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: selectedTrack.color_accent }}
                />
                <h2 className="text-lg font-bold text-content-primary">
                  Syllabus Detallado — {selectedTrack.title}
                </h2>
                <Badge variant="mono" size="sm">
                  {selectedTrack.badge_name}
                </Badge>
              </div>
              <p className="text-xs text-content-secondary max-w-2xl leading-relaxed">
                {selectedTrack.description}
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <Button
                variant="primary"
                onClick={() => handleStartTrackFirstAvailable(selectedTrack)}
                className="text-xs"
              >
                <Play className="w-3.5 h-3.5 mr-1.5 fill-current" />
                <span>Continuar Ruta</span>
              </Button>
            </div>
          </div>

          {/* Modules Accordion List */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-content-muted">
              Módulos del Programa ({selectedTrack.modules?.length || 0})
            </span>

            <div className="flex flex-col gap-3">
              {selectedTrack.modules?.map((mod, idx) => {
                const moduleExercises = getExercisesForModule(mod.id);
                return (
                  <ModuleAccordion
                    key={mod.id}
                    module={mod}
                    moduleIndex={idx}
                    exercises={moduleExercises}
                    onSelectExercise={onSelectExercise}
                    defaultOpen={idx === 0}
                  />
                );
              })}
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
