import React, { useEffect, useMemo, useState } from 'react';
import { GitBranch, Play, Award } from 'lucide-react';
import { Track, Exercise } from '@/types';
import { TrackCard } from '@/components/molecules/TrackCard/TrackCard';
import { ModuleAccordion } from '@/components/molecules/ModuleAccordion/ModuleAccordion';
import { PedagogyPillarsCard } from '@/components/molecules/PedagogyPillarsCard/PedagogyPillarsCard';
import { ModuleCompletedModal } from '@/components/molecules/ModuleCompletedModal/ModuleCompletedModal';
import { LearningRoadmapMap } from '@/components/organisms/LearningRoadmapMap/LearningRoadmapMap';
import { ModuleGuideModal } from '@/components/organisms/ModuleGuideModal/ModuleGuideModal';
import { getModuleGuide } from '@/lib/moduleGuides';
import {
  buildAdminModuleCompletionPreview,
  ModuleCompletionSummary,
} from '@/lib/progress';
import { Button, Badge } from '@/components/atoms';

export interface TracksViewProps {
  tracks: Track[];
  exercises: Exercise[];
  completedExerciseIds?: Set<string>;
  selectedTrackId?: string;
  onSelectTrack?: (trackId: string) => void;
  onSelectExercise: (exercise: Exercise) => void;
  onOpenMethodology?: () => void;
  onIssueTrackCertificate?: (track: Track, qaPreview: boolean) => void;
  isAdmin?: boolean;
  isLoading?: boolean;
  className?: string;
}

export const TracksView: React.FC<TracksViewProps> = ({
  tracks,
  exercises,
  completedExerciseIds,
  selectedTrackId: controlledTrackId,
  onSelectTrack,
  onSelectExercise,
  onOpenMethodology,
  onIssueTrackCertificate,
  isAdmin = false,
  isLoading = false,
}) => {
  const isExerciseDone = (e: Exercise) => {
    if (completedExerciseIds) return completedExerciseIds.has(e.id);
    return Boolean(e.is_completed);
  };

  const inferredActiveTrackId = useMemo(() => {
    const firstPending = exercises.find((ex) => !isExerciseDone(ex));
    const target = firstPending || exercises[exercises.length - 1];
    if (target) {
      const matched = tracks.find((t) => t.modules?.some((m) => m.id === target.module_id));
      if (matched) return matched.id;
    }
    return tracks[0]?.id || 'sql-foundations';
  }, [tracks, exercises, completedExerciseIds]);

  const [internalTrackId, setInternalTrackId] = useState<string>(inferredActiveTrackId);
  const [hasInternalManualChoice, setHasInternalManualChoice] = useState(false);

  useEffect(() => {
    if (!controlledTrackId && !hasInternalManualChoice) {
      setInternalTrackId(inferredActiveTrackId);
    }
  }, [controlledTrackId, hasInternalManualChoice, inferredActiveTrackId]);

  const selectedTrackId = controlledTrackId || internalTrackId;
  const handleSelectTrackId = (trackId: string) => {
    if (onSelectTrack) {
      onSelectTrack(trackId);
    } else {
      setHasInternalManualChoice(true);
      setInternalTrackId(trackId);
    }
  };

  const [guideModuleId, setGuideModuleId] = useState<string | null>(null);
  const [previewModuleSummary, setPreviewModuleSummary] =
    useState<ModuleCompletionSummary | null>(null);

  const selectedTrack = tracks.find((t) => t.id === selectedTrackId) || tracks[0];

  const defaultOpenModuleId = useMemo(() => {
    const mods = selectedTrack?.modules || [];
    const firstIncompleteMod = mods.find((mod) => {
      const modExs = exercises.filter((e) => e.module_id === mod.id);
      if (modExs.length === 0) return false;
      return modExs.some((e) => !isExerciseDone(e));
    });
    return firstIncompleteMod?.id || mods[0]?.id;
  }, [selectedTrack, exercises, completedExerciseIds]);

  // Helper to get exercises belonging to a module
  const getExercisesForModule = (moduleId: string) => {
    return exercises.filter((e) => e.module_id === moduleId);
  };

  const handleStartTrackFirstAvailable = (track: Track) => {
    handleSelectTrackId(track.id);
    const firstUnfinished =
      exercises.find(
        (e) => !isExerciseDone(e) && track.modules?.some((m) => m.id === e.module_id)
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
            <span>Plan de estudios</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-content-primary">
            Rutas de aprendizaje y temario
          </h1>
          <p className="text-xs text-content-secondary mt-1">
            Avanza paso a paso desde consultas básicas hasta diseño de tablas, cambios transaccionales e índices.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {isLoading && (
            <Badge variant="cyan" dot className="animate-pulse">
              Sincronizando progreso...
            </Badge>
          )}
          <Badge variant="mono">
            {tracks.length} rutas
          </Badge>
          <Badge variant="emerald" dot>
            PostgreSQL activo
          </Badge>
          {onOpenMethodology && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onOpenMethodology}
              className="text-xs text-cyan-accent hover:text-content-primary"
            >
              Metodología
            </Button>
          )}
        </div>
      </div>

      {/* Track Cards Grid — 2x2 Balanced Bento Symmetry */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {tracks.map((track) => (
          <TrackCard
            key={track.id}
            track={track}
            isSelected={track.id === selectedTrackId}
            onSelect={(t) => handleSelectTrackId(t.id)}
            onStartTrack={handleStartTrackFirstAvailable}
            onPreviewModuleModal={
              isAdmin
                ? (t) =>
                    setPreviewModuleSummary(
                      buildAdminModuleCompletionPreview(t, exercises, tracks)
                    )
                : undefined
            }
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
                  Temario: {selectedTrack.title}
                </h2>
                <Badge variant="mono" size="sm">
                  {selectedTrack.badge_name}
                </Badge>
              </div>
              <p className="text-xs text-content-secondary max-w-2xl leading-relaxed">
                {selectedTrack.description}
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
              {onIssueTrackCertificate &&
                (() => {
                  const trTotal = selectedTrack.total_exercises || 1;
                  const trDone = selectedTrack.completed_exercises ?? 0;
                  const isTrackComplete = trDone >= trTotal && trTotal > 0;
                  if (!isTrackComplete && !isAdmin) return null;
                  return (
                    <Button
                      variant={isTrackComplete ? 'emerald' : 'outline'}
                      size="sm"
                      onClick={() => onIssueTrackCertificate(selectedTrack, !isTrackComplete)}
                      leftIcon={<Award className="w-3.5 h-3.5 shrink-0" />}
                      className="text-xs whitespace-nowrap shrink-0"
                    >
                      {isTrackComplete ? 'Ver constancia' : 'Probar constancia (QA)'}
                    </Button>
                  );
                })()}

              <Button
                variant="primary"
                onClick={() => handleStartTrackFirstAvailable(selectedTrack)}
                leftIcon={<Play className="w-3.5 h-3.5 fill-current shrink-0" />}
                className="text-xs whitespace-nowrap shrink-0"
              >
                Continuar Ruta
              </Button>
            </div>
          </div>

          {/* Modules Accordion List */}
          <div className="flex flex-col gap-3">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-content-muted">
              Módulos de la Ruta ({selectedTrack.modules?.length || 0})
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
                    completedExerciseIds={completedExerciseIds}
                    onSelectExercise={onSelectExercise}
                    onOpenGuide={(modId) => setGuideModuleId(modId)}
                    defaultOpen={mod.id === defaultOpenModuleId}
                  />
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Mapa Visual Dual (Camino por Etapas + Árbol de Habilidades) */}
      <LearningRoadmapMap
        tracks={tracks}
        exercises={exercises}
        completedExerciseIds={completedExerciseIds}
        selectedTrackId={selectedTrackId}
        onSelectTrack={(trackId) => handleSelectTrackId(trackId)}
        onSelectExercise={onSelectExercise}
      />

      {/* Respaldo Pedagógico y Técnico de la Currícula */}
      <PedagogyPillarsCard onOpenMethodology={onOpenMethodology} />

      <ModuleGuideModal
        guide={guideModuleId ? getModuleGuide(guideModuleId) || null : null}
        isOpen={Boolean(guideModuleId)}
        onClose={() => setGuideModuleId(null)}
      />

      {isAdmin && (
        <ModuleCompletedModal
          isOpen={Boolean(previewModuleSummary)}
          summary={previewModuleSummary}
          lastXpAwarded={35}
          onClose={() => setPreviewModuleSummary(null)}
          onContinueNextModule={() => {
            const nextEx = previewModuleSummary?.nextExercise;
            setPreviewModuleSummary(null);
            if (nextEx) {
              onSelectExercise(nextEx);
            }
          }}
          onViewTracks={() => setPreviewModuleSummary(null)}
        />
      )}
    </div>
  );
};
