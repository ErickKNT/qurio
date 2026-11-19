export const ALLOWED_AVATAR_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const;

export const MAX_AVATAR_INPUT_BYTES = 5 * 1024 * 1024; // 5 MiB antes de compresión en cliente
export const AVATAR_TARGET_SIZE = 256;
export const AVATAR_BUCKET_NAME = 'avatars';

export type AvatarValidationResult =
  | { valid: true }
  | { valid: false; error: string };

/**
 * Valida que el archivo sea una imagen raster permitida (sin SVG) y dentro del límite de peso.
 */
export function validateAvatarFile(file: File): AvatarValidationResult {
  if (!file || file.size <= 0) {
    return { valid: false, error: 'El archivo seleccionado está vacío o es inválido.' };
  }

  const normalizedType = (file.type || '').toLowerCase();
  if (!ALLOWED_AVATAR_MIME_TYPES.includes(normalizedType as (typeof ALLOWED_AVATAR_MIME_TYPES)[number])) {
    return {
      valid: false,
      error: 'Formato no compatible. Selecciona una imagen JPG, PNG o WebP.',
    };
  }

  if (file.size > MAX_AVATAR_INPUT_BYTES) {
    return {
      valid: false,
      error: 'La imagen supera el límite máximo de 5 MB.',
    };
  }

  return { valid: true };
}

/**
 * Genera el avatar determinista DiceBear cuando el usuario no tiene foto personalizada ni de proveedor OAuth.
 */
export function buildDicebearAvatarUrl(seed?: string | null): string {
  const safeSeed = (seed || 'student').trim() || 'student';
  return `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(safeSeed)}`;
}

/**
 * Resuelve la URL de respaldo oficial: prioriza el avatar del proveedor OAuth (Google/GitHub)
 * y usa DiceBear únicamente cuando no existe metadata de proveedor.
 */
export function resolveFallbackAvatarUrl(
  username?: string | null,
  userMetadata?: Record<string, unknown> | null
): string {
  const providerUrl =
    (typeof userMetadata?.avatar_url === 'string' && userMetadata.avatar_url.trim()) ||
    (typeof userMetadata?.picture === 'string' && userMetadata.picture.trim()) ||
    '';

  if (providerUrl) {
    return providerUrl;
  }

  return buildDicebearAvatarUrl(username);
}

/**
 * Indica si la URL actual corresponde a una foto personalizada alojada en el bucket de Qurio.
 */
export function isStorageAvatarUrl(url?: string | null): boolean {
  if (!url) return false;
  return url.includes(`/storage/v1/object/public/${AVATAR_BUCKET_NAME}/`);
}

async function loadImageSource(file: File): Promise<{
  source: CanvasImageSource;
  width: number;
  height: number;
  cleanup: () => void;
}> {
  if (typeof createImageBitmap === 'function') {
    const bitmap = await createImageBitmap(file);
    return {
      source: bitmap,
      width: bitmap.width,
      height: bitmap.height,
      cleanup: () => bitmap.close(),
    };
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error('No se pudo decodificar la imagen seleccionada.'));
      element.src = objectUrl;
    });
    return {
      source: img,
      width: img.naturalWidth || img.width,
      height: img.naturalHeight || img.height,
      cleanup: () => URL.revokeObjectURL(objectUrl),
    };
  } catch (err) {
    URL.revokeObjectURL(objectUrl);
    throw err;
  }
}

function canvasToBlob(canvas: HTMLCanvasElement, mimeType: string, quality?: number): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob), mimeType, quality);
  });
}

/**
 * Recorta al centro en proporción 1:1 y re-codifica la imagen a 256x256 WebP (con fallback PNG).
 * Elimina metadatos EXIF y garantiza un archivo raster liviano antes de subir a Storage.
 */
export async function processAvatarImage(file: File): Promise<Blob> {
  const validation = validateAvatarFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const loaded = await loadImageSource(file);
  try {
    const { source, width, height } = loaded;
    if (!width || !height) {
      throw new Error('La imagen seleccionada no tiene dimensiones válidas.');
    }

    const canvas = document.createElement('canvas');
    canvas.width = AVATAR_TARGET_SIZE;
    canvas.height = AVATAR_TARGET_SIZE;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Tu navegador no permite procesar imágenes en lienzo 2D.');
    }

    // Recorte cuadrado centrado para evitar deformación en avatares circulares
    const cropSize = Math.min(width, height);
    const sx = Math.floor((width - cropSize) / 2);
    const sy = Math.floor((height - cropSize) / 2);

    ctx.drawImage(source, sx, sy, cropSize, cropSize, 0, 0, AVATAR_TARGET_SIZE, AVATAR_TARGET_SIZE);

    const webpBlob = await canvasToBlob(canvas, 'image/webp', 0.88);
    if (webpBlob && webpBlob.type === 'image/webp' && webpBlob.size > 0) {
      return webpBlob;
    }

    const pngBlob = await canvasToBlob(canvas, 'image/png');
    if (pngBlob && pngBlob.size > 0) {
      return pngBlob;
    }

    throw new Error('No se pudo exportar la imagen procesada.');
  } finally {
    loaded.cleanup();
  }
}
