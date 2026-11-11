import { describe, it, expect } from 'vitest';
import { computeOfficialTracksProgress, computeGuestTrialTracksProgress } from '../progress';
import { FALLBACK_TRACKS, FALLBACK_EXERCISES } from '../api';
import { Track, Exercise } from '@/types';

const mockTracks: Track[] = [
  {
    id: 'track-1',
    title: 'SQL Foundations',
    slug: 'sql-foundations',
    description: 'Foundations',
    badge_name: 'Foundations',
    color_accent: '#38BDF8',
    sort_order: 1,
    total_exercises: 3,
    modules: [
      {
        id: 'mod-1',
        track_id: 'track-1',
        title: 'Módulo 1',
        slug: 'mod-1',
        description: 'Desc 1',
        sort_order: 1,
        exercises_count: 3,
      },
    ],
  },
  {
    id: 'track-2',
    title: 'Advanced SQL',
    slug: 'advanced-sql',
    description: 'Advanced',
    badge_name: 'Advanced',
    color_accent: '#818CF8',
    sort_order: 2,
    total_exercises: 2,
    modules: [
      {
        id: 'mod-2',
        track_id: 'track-2',
        title: 'Módulo 2',
        slug: 'mod-2',
        description: 'Desc 2',
        sort_order: 2,
        exercises_count: 2,
      },
    ],
  },
];

const mockExercises: Exercise[] = [
  {
    id: 'ex-1',
    module_id: 'mod-1',
    title: 'Reto 1',
    prompt: 'Prompt 1',
    initial_code: 'SELECT 1;',
    xp_reward: 30,
    difficulty: 'Principiante',
    check_order: false,
    sort_order: 1,
    is_completed: true, // NOTA C-03: Marcado localmente pero NO en authoritativeCompletedIds
  },
  {
    id: 'ex-2',
    module_id: 'mod-1',
    title: 'Reto 2',
    prompt: 'Prompt 2',
    initial_code: 'SELECT 2;',
    xp_reward: 30,
    difficulty: 'Principiante',
    check_order: false,
    sort_order: 2,
    is_completed: true,
  },
  {
    id: 'ex-3',
    module_id: 'mod-1',
    title: 'Reto 3',
    prompt: 'Prompt 3',
    initial_code: 'SELECT 3;',
    xp_reward: 30,
    difficulty: 'Principiante',
    check_order: false,
    sort_order: 3,
    is_completed: false,
  },
  {
    id: 'ex-4',
    module_id: 'mod-2',
    title: 'Reto 4',
    prompt: 'Prompt 4',
    initial_code: 'SELECT 4;',
    xp_reward: 50,
    difficulty: 'Intermedio',
    check_order: false,
    sort_order: 1,
    is_completed: false,
  },
  {
    id: 'ex-5',
    module_id: 'mod-2',
    title: 'Reto 5',
    prompt: 'Prompt 5',
    initial_code: 'SELECT 5;',
    xp_reward: 50,
    difficulty: 'Intermedio',
    check_order: false,
    sort_order: 2,
    is_completed: false,
  },
];

describe('computeOfficialTracksProgress (C-03)', () => {
  it('debe devolver estado de carga estricto con completed_exercises=null cuando isLoading=true', () => {
    const result = computeOfficialTracksProgress(mockTracks, mockExercises, new Set(['ex-1']), true);
    expect(result[0].is_progress_loading).toBe(true);
    expect(result[0].completed_exercises).toBeNull();
    expect(result[0].progress_percent).toBeNull();
  });

  it('NO debe incrementar progreso por ex.is_completed si el ID no está en authoritativeCompletedIds', () => {
    // ex-1 y ex-2 tienen is_completed=true, pero authoritativeCompletedIds está vacío
    const emptyCloud = new Set<string>();
    const result = computeOfficialTracksProgress(mockTracks, mockExercises, emptyCloud, false);

    expect(result[0].completed_exercises).toBe(0);
    expect(result[0].progress_percent).toBe(0);
    expect(result[0].is_progress_loading).toBe(false);
  });

  it('debe computar únicamente los IDs verificados en authoritativeCompletedIds', () => {
    const cloudIds = new Set(['ex-1']);
    const result = computeOfficialTracksProgress(mockTracks, mockExercises, cloudIds, false);

    expect(result[0].completed_exercises).toBe(1);
    expect(result[0].total_exercises).toBe(3);
    expect(result[0].progress_percent).toBe(33); // 1 / 3 = 33%
  });

  it('debe aislar estrictamente el progreso por ruta (no duplicar en otras rutas)', () => {
    const cloudIds = new Set(['ex-1', 'ex-2']);
    const result = computeOfficialTracksProgress(mockTracks, mockExercises, cloudIds, false);

    // Track 1 tiene ex-1 y ex-2 (2 de 3 completados)
    expect(result[0].id).toBe('track-1');
    expect(result[0].completed_exercises).toBe(2);
    expect(result[0].progress_percent).toBe(67);

    // Track 2 NO debe tener ejercicios completados (0 de 2)
    expect(result[1].id).toBe('track-2');
    expect(result[1].completed_exercises).toBe(0);
    expect(result[1].progress_percent).toBe(0);
  });
});

describe('computeGuestTrialTracksProgress', () => {
  it('debe computar el progreso temporal de invitados de forma aislada', () => {
    const guestIds = new Set(['ex-1']);
    const result = computeGuestTrialTracksProgress(mockTracks, mockExercises, guestIds);

    expect(result[0].completed_exercises).toBe(1);
    expect(result[1].completed_exercises).toBe(0);
  });
});

describe('Production Fallback Consistency', () => {
  it('FALLBACK_TRACKS y FALLBACK_EXERCISES suman exactamente 50 ejercicios con conceptos y objetivos pedagógicos', () => {
    expect(FALLBACK_EXERCISES.length).toBe(50);
    const missingConcept = FALLBACK_EXERCISES.filter((e) => !e.concept);
    const missingObjectives = FALLBACK_EXERCISES.filter((e) => !e.objectives || e.objectives.length === 0);
    expect(missingConcept.map(e => e.id)).toEqual([]);
    expect(missingObjectives.map(e => e.id)).toEqual([]);

    const res = computeOfficialTracksProgress(FALLBACK_TRACKS, FALLBACK_EXERCISES, new Set(), false);
    expect(res[0].total_exercises).toBe(22);
    expect(res[1].total_exercises).toBe(18);
    expect(res[2].total_exercises).toBe(10);
    const totalExercisesInTracks = res.reduce((acc, t) => acc + (t.total_exercises || 0), 0);
    expect(totalExercisesInTracks).toBe(50);
  });
});
