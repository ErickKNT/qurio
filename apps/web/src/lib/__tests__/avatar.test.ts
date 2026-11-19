import { describe, it, expect } from 'vitest';
import {
  validateAvatarFile,
  resolveFallbackAvatarUrl,
  isStorageAvatarUrl,
  MAX_AVATAR_INPUT_BYTES,
} from '../avatar';

describe('avatar utilities', () => {
  it('acepta archivos JPG, PNG y WebP dentro del límite de peso', () => {
    const pngFile = new File([new Uint8Array(1024)], 'avatar.png', { type: 'image/png' });
    const jpgFile = new File([new Uint8Array(1024)], 'avatar.jpg', { type: 'image/jpeg' });
    const webpFile = new File([new Uint8Array(1024)], 'avatar.webp', { type: 'image/webp' });

    expect(validateAvatarFile(pngFile)).toEqual({ valid: true });
    expect(validateAvatarFile(jpgFile)).toEqual({ valid: true });
    expect(validateAvatarFile(webpFile)).toEqual({ valid: true });
  });

  it('rechaza SVG y otros formatos no raster por seguridad XSS', () => {
    const svgFile = new File(['<svg><script>alert(1)</script></svg>'], 'xss.svg', {
      type: 'image/svg+xml',
    });
    const pdfFile = new File([new Uint8Array(512)], 'doc.pdf', { type: 'application/pdf' });

    const svgResult = validateAvatarFile(svgFile);
    expect(svgResult.valid).toBe(false);
    if (!svgResult.valid) {
      expect(svgResult.error).toMatch(/JPG, PNG o WebP/i);
    }

    expect(validateAvatarFile(pdfFile).valid).toBe(false);
  });

  it('rechaza archivos vacíos o que exceden 5 MB', () => {
    const emptyFile = new File([], 'empty.png', { type: 'image/png' });
    expect(validateAvatarFile(emptyFile).valid).toBe(false);

    const oversized = new File([new Uint8Array(10)], 'huge.png', { type: 'image/png' });
    Object.defineProperty(oversized, 'size', { value: MAX_AVATAR_INPUT_BYTES + 1 });
    const result = validateAvatarFile(oversized);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.error).toMatch(/5 MB/i);
    }
  });

  it('resuelve el avatar del proveedor OAuth antes que DiceBear cuando avatar_url se limpia', () => {
    expect(
      resolveFallbackAvatarUrl('erick', { avatar_url: 'https://lh3.googleusercontent.com/photo.jpg' })
    ).toBe('https://lh3.googleusercontent.com/photo.jpg');

    expect(
      resolveFallbackAvatarUrl('erick', { picture: 'https://avatars.githubusercontent.com/u/1?v=4' })
    ).toBe('https://avatars.githubusercontent.com/u/1?v=4');

    expect(resolveFallbackAvatarUrl('erick', {})).toContain('api.dicebear.com');
  });

  it('detecta correctamente URLs pertenecientes al bucket avatars de Supabase Storage', () => {
    expect(
      isStorageAvatarUrl(
        'https://xyz.supabase.co/storage/v1/object/public/avatars/user-123/avatar.webp?v=1234'
      )
    ).toBe(true);
    expect(isStorageAvatarUrl('https://lh3.googleusercontent.com/a/photo')).toBe(false);
    expect(isStorageAvatarUrl(null)).toBe(false);
  });
});
