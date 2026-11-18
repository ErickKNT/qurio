/**
 * Resuelve la URL base de la API FastAPI.
 * En desarrollo con Vite (`vite dev`), si no hay un dominio remoto configurado,
 * utiliza `/api/v1` para enrutar mediante el proxy de Vite y evitar errores
 * de `localhost` o CORS al acceder desde IPs de red (LAN / WSL / móvil).
 */
export function resolveApiBaseUrl(): string {
  const configured = import.meta.env.VITE_API_BASE_URL as string | undefined;
  const isLocalConfigured =
    !configured ||
    configured.startsWith('http://localhost:8000') ||
    configured.startsWith('http://127.0.0.1:8000');

  if (import.meta.env.DEV && import.meta.env.MODE !== 'test' && isLocalConfigured) {
    return '/api/v1';
  }

  return configured || 'http://localhost:8000/api/v1';
}
