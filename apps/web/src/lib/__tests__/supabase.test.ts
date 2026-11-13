import { describe, it, expect } from 'vitest';
import { extractNormalizedCallbackPathAndHash } from '../supabase';

describe('supabase — Normalización de callbacks de Auth', () => {
  it('normaliza doble hash legacy de recuperación (#reset-password#access_token=...)', () => {
    const result = extractNormalizedCallbackPathAndHash(
      '/',
      '#reset-password#access_token=abc123&refresh_token=def456&type=recovery'
    );
    expect(result).toEqual({
      pathname: '/reset-password',
      hash: '#access_token=abc123&refresh_token=def456&type=recovery',
    });
  });

  it('normaliza hash legacy de confirmación (#auth-confirm#access_token=...)', () => {
    const result = extractNormalizedCallbackPathAndHash(
      '/',
      '#auth-confirm#access_token=abc123&type=signup'
    );
    expect(result).toEqual({
      pathname: '/auth/confirm',
      hash: '#access_token=abc123&type=signup',
    });
  });

  it('normaliza errores concatenados al hash (#reset-password#error=...)', () => {
    const result = extractNormalizedCallbackPathAndHash(
      '/',
      '#reset-password#error=access_denied&error_code=otp_expired'
    );
    expect(result).toEqual({
      pathname: '/reset-password',
      hash: '#error=access_denied&error_code=otp_expired',
    });
  });

  it('no modifica hashes estándar válidos de Supabase', () => {
    expect(
      extractNormalizedCallbackPathAndHash('/reset-password', '#access_token=abc&type=recovery')
    ).toBeNull();
    expect(extractNormalizedCallbackPathAndHash('/', '#reset-password')).toBeNull();
    expect(extractNormalizedCallbackPathAndHash('/', '')).toBeNull();
  });
});
