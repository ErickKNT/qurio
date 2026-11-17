// @vitest-environment jsdom
import React from 'react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

import { PedagogyPillarsCard } from '@/components/molecules/PedagogyPillarsCard/PedagogyPillarsCard';
import { MethodologyModal } from '@/components/molecules/MethodologyModal/MethodologyModal';
import { ExerciseSpecPanel } from '@/components/organisms/ExerciseSpecPanel/ExerciseSpecPanel';
import { LearningRoadmapMap } from '@/components/organisms/LearningRoadmapMap/LearningRoadmapMap';
import { FALLBACK_EXERCISES, FALLBACK_TRACKS } from '@/lib/fallbackCurriculum';

afterEach(() => {
  cleanup();
});

describe('Visualización Pedagógica, Psicológica y Técnica en Qurio', () => {
  it('PedagogyPillarsCard muestra los 3 pilares basados en evidencia y dispara onOpenMethodology', () => {
    const handleOpen = vi.fn();
    render(React.createElement(PedagogyPillarsCard, { onOpenMethodology: handleOpen }));

    expect(screen.getByText('Carga Cognitiva Gradual')).toBeInTheDocument();
    expect(screen.getByText('Andamiaje en 3 Capas')).toBeInTheDocument();
    expect(screen.getByText('Motor Real PostgreSQL 16')).toBeInTheDocument();

    const trigger = screen.getByRole('button', { name: /Ver Metodología y Respaldo/i });
    fireEvent.click(trigger);
    expect(handleOpen).toHaveBeenCalledTimes(1);
  });

  it('MethodologyModal despliega capas de andamiaje, 5 trampas semánticas, pipeline PostgreSQL 16 y citas DOI', () => {
    const handleClose = vi.fn();
    render(React.createElement(MethodologyModal, { isOpen: true, onClose: handleClose }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Metodología Pedagógica y Rigor Técnico')).toBeInTheDocument();
    expect(screen.getByText(/PostgreSQL 16 Sandbox/i)).toBeInTheDocument();
    expect(screen.getByText(/Inspección AST \(SQLGlot\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Brass, S\. & Goldberg, C\. \(2006\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Taipalus, T\. \(2020\)/i)).toBeInTheDocument();
    expect(screen.getByText('5. Orden y Determinismo')).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(handleClose).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Entendido' }));
    expect(handleClose).toHaveBeenCalledTimes(2);
  });

  it('ExerciseSpecPanel muestra sello PostgreSQL 16 en orden de ejecución y niveles progresivos en pistas', () => {
    const sampleExercise = FALLBACK_EXERCISES[0];
    render(
      React.createElement(ExerciseSpecPanel, {
        exercise: sampleExercise,
        unlockedHintsCount: 3,
        onUnlockHint: vi.fn(),
      })
    );

    expect(screen.getByText('PostgreSQL 16 Sandbox')).toBeInTheDocument();
    expect(screen.getByText('Evaluación Semántica de Conjuntos')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Pistas \(3\/3\)/i }));
    expect(screen.getByText(/Nivel 1 • Enfoque Conceptual/i)).toBeInTheDocument();
    expect(screen.getByText(/Nivel 2 • Estructura SQL/i)).toBeInTheDocument();
    expect(screen.getByText(/Nivel 3 • Plantilla Guiada/i)).toBeInTheDocument();
  });

  it('LearningRoadmapMap inicia en Árbol de Habilidades, alterna a Camino por Etapas y navega al reto', () => {
    const onSelectTrack = vi.fn();
    const onSelectExercise = vi.fn();

    render(
      React.createElement(LearningRoadmapMap, {
        tracks: FALLBACK_TRACKS,
        exercises: FALLBACK_EXERCISES,
        selectedTrackId: 'sql-foundations',
        onSelectTrack,
        onSelectExercise,
      })
    );

    expect(screen.getByText('Recorrido Visual y Dependencias SQL')).toBeInTheDocument();
    expect(screen.getByText('CTEs Modulares')).toBeInTheDocument();

    fireEvent.click(screen.getByTitle(/Uniones Fundamentales \(INNER JOIN\)/i));
    expect(onSelectTrack).toHaveBeenCalledWith('relational-sql');

    fireEvent.click(screen.getByRole('button', { name: /Camino por Etapas/i }));
    expect(screen.getByText(/Etapa 1: Fundamentos de SQL/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Catálogo Básico de Productos/i }));
    expect(onSelectExercise).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'e0000000-0000-0000-0000-000000000001' })
    );
  });
});
