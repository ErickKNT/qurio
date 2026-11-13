import { describe, it, expect } from 'vitest';
import { ACHIEVEMENTS_CATALOG, evaluateUserAchievements } from '@/lib/api';
import { UserProfile } from '@/types';

describe('evaluateUserAchievements', () => {
  const baseProfile: UserProfile = {
    id: 'user-123',
    username: 'test_student',
    total_xp: 0,
    current_level: 1,
    current_streak_days: 0,
    max_streak_days: 0,
    preferred_theme: 'dark',
    created_at: new Date().toISOString(),
  };

  it('un usuario recién registrado debe tener 0 logros desbloqueados y 0% de progreso', () => {
    const evaluated = evaluateUserAchievements(
      ACHIEVEMENTS_CATALOG,
      baseProfile,
      new Set<string>(),
      0
    );

    const unlocked = evaluated.filter((a) => !!a.unlocked_at || a.progress >= 100);
    expect(unlocked.length).toBe(0);

    const firstQuery = evaluated.find((a) => a.id === 'first-query');
    expect(firstQuery?.progress).toBe(0);
    expect(firstQuery?.unlocked_at).toBeNull();
  });

  it('desbloquea "first-query" tras realizar el primer intento de consulta', () => {
    const evaluated = evaluateUserAchievements(
      ACHIEVEMENTS_CATALOG,
      baseProfile,
      new Set<string>(),
      1 // 1 intento realizado
    );

    const firstQuery = evaluated.find((a) => a.id === 'first-query');
    expect(firstQuery?.progress).toBe(100);
    expect(firstQuery?.unlocked_at).not.toBeNull();
  });

  it('desbloquea "join-apprentice" al completar un ejercicio de INNER JOIN (m05)', () => {
    const completed = new Set<string>(['ex-m05-01']);
    const evaluated = evaluateUserAchievements(
      ACHIEVEMENTS_CATALOG,
      baseProfile,
      completed,
      1
    );

    const joinAch = evaluated.find((a) => a.id === 'join-apprentice');
    expect(joinAch?.progress).toBe(100);
    expect(joinAch?.unlocked_at).not.toBeNull();
  });

  it('calcula correctamente el progreso y desbloqueo de rachas (streak-3 y streak-7)', () => {
    const profileWithStreak: UserProfile = {
      ...baseProfile,
      current_streak_days: 2,
      max_streak_days: 2,
    };

    const evaluated2d = evaluateUserAchievements(
      ACHIEVEMENTS_CATALOG,
      profileWithStreak,
      new Set<string>(),
      5
    );

    const streak3 = evaluated2d.find((a) => a.id === 'streak-3');
    expect(streak3?.progress).toBe(67); // 2/3 = 66.67% -> 67%
    expect(streak3?.unlocked_at).toBeNull();

    // Con racha de 3 días
    const profile3d: UserProfile = {
      ...baseProfile,
      current_streak_days: 3,
      max_streak_days: 3,
    };
    const evaluated3d = evaluateUserAchievements(
      ACHIEVEMENTS_CATALOG,
      profile3d,
      new Set<string>(),
      5
    );
    const streak3Unlocked = evaluated3d.find((a) => a.id === 'streak-3');
    expect(streak3Unlocked?.progress).toBe(100);
    expect(streak3Unlocked?.unlocked_at).not.toBeNull();
  });
});
