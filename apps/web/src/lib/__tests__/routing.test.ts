import { describe, it, expect } from 'vitest';
import { pathToUrl, parseLocation } from '../routing';

describe('routing — HTML5 History API & Enrutamiento Bidireccional (C-05)', () => {
  describe('pathToUrl', () => {
    it('convierte rutas base a sus URLs canónicas', () => {
      expect(pathToUrl('dashboard')).toBe('/');
      expect(pathToUrl('tracks')).toBe('/tracks');
      expect(pathToUrl('playground')).toBe('/playground');
      expect(pathToUrl('achievements')).toBe('/achievements');
      expect(pathToUrl('profile')).toBe('/profile');
      expect(pathToUrl('exercise')).toBe('/exercises');
      expect(pathToUrl('auth-confirm')).toBe('/auth/confirm');
      expect(pathToUrl('reset-password')).toBe('/reset-password');
      expect(pathToUrl('not-found')).toBe('/404');
    });

    it('construye deep links con parámetros dinámicos', () => {
      expect(pathToUrl('exercise', { exerciseId: 'ex-01-select' })).toBe('/exercises/ex-01-select');
      expect(pathToUrl('tracks', { trackSlug: 'sql-foundations' })).toBe('/tracks/sql-foundations');
    });
  });

  describe('parseLocation', () => {
    it('resuelve rutas principales e ignora trailing slashes', () => {
      expect(parseLocation('/')).toEqual({ path: 'dashboard' });
      expect(parseLocation('')).toEqual({ path: 'dashboard' });
      expect(parseLocation('/tracks')).toEqual({ path: 'tracks' });
      expect(parseLocation('/tracks/')).toEqual({ path: 'tracks' });
      expect(parseLocation('/playground')).toEqual({ path: 'playground' });
      expect(parseLocation('/achievements')).toEqual({ path: 'achievements' });
      expect(parseLocation('/profile')).toEqual({ path: 'profile' });
      expect(parseLocation('/exercises')).toEqual({ path: 'exercise' });
      expect(parseLocation('/auth/confirm')).toEqual({ path: 'auth-confirm' });
      expect(parseLocation('/reset-password')).toEqual({ path: 'reset-password' });
    });

    it('extrae parámetros de enlaces profundos (deep links)', () => {
      expect(parseLocation('/exercises/e0000000-0000-0000-0000-000000000001')).toEqual({
        path: 'exercise',
        exerciseId: 'e0000000-0000-0000-0000-000000000001',
      });
      expect(parseLocation('/tracks/advanced-analytics')).toEqual({
        path: 'tracks',
        trackSlug: 'advanced-analytics',
      });
    });

    it('deriva a 404 ante rutas desconocidas o inexistentes', () => {
      expect(parseLocation('/ruta-inexistente')).toEqual({ path: 'not-found' });
      expect(parseLocation('/api/unknown/endpoint')).toEqual({ path: 'not-found' });
    });
  });
});
