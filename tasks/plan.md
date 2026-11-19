# Implementation Plan: Actualización de Imagen de Perfil (Supabase Storage)

**Fecha:** 2026-11-19  
**Rama Activa:** `feat/profile-avatar-upload`  
**Metodología:** [`planning-and-task-breakdown`](../.agents/skills/planning-and-task-breakdown/SKILL.md)

---

## Overview

Habilitar la subida, recorte/normalización raster en cliente, previsualización y eliminación de imagen de perfil en **Qurio** usando **Supabase Storage** (`avatars`), eliminando el campo de URL externa arbitraria en `EditProfileModal` y restaurando el avatar del proveedor OAuth (o DiceBear cuando no exista proveedor) al quitar la foto personalizada.

---

## Architecture Decisions

1. **Subida Directa Cliente → Supabase Storage (`avatars`) sin Proxy en FastAPI:**
   * `apps/api` permanece dedicado al evaluador SQL y constancias PDF sin añadir dependencias de procesamiento binario ni tráfico multimedia.
2. **Allowlist Estricto Sin SVG + Normalización en `<canvas>`:**
   * Se bloquea `image/svg+xml` (prevención de Stored XSS) tanto en cliente como en el bucket (`allowed_mime_types = ['image/jpeg', 'image/png', 'image/webp']`, `file_size_limit = 2097152`).
   * Antes de subir, `<canvas>` recorta al centro a `256×256` y re-codifica a `image/webp` (fallback `image/png`), eliminando metadatos EXIF y manteniendo archivos ligeros.
3. **Ruta Determinista (`${userId}/avatar.webp`) + Cache-Busting:**
   * Se sobrescribe el objeto con `upsert: true` y se almacena en `user_profiles.avatar_url` la URL pública con `?v=${Date.now()}`, evitando archivos huérfanos y caché obsoleto en navegador/CDN.
4. **Restauración al Avatar del Proveedor OAuth:**
   * Al pulsar *"Quitar foto"*, se elimina el archivo en Storage, se guarda `avatar_url = null` en `user_profiles` y `useAuth` resuelve dinámicamente el avatar de `user_metadata` (Google/GitHub) o DiceBear como último recurso.
5. **Atomic Design Pragmático:**
   * Átomo `UserAvatar` en `src/components/atoms/UserAvatar/` para unificar la renderización con `onError` fallback en `TopHeader`, `SidebarNav`, `ExerciseHeaderBar`, `UserProfileView` y `UserModerationDrawer`.
   * Molécula `AvatarUploader` en `src/components/molecules/AvatarUploader/` integrada dentro de `EditProfileModal`.

---

## Task List

### Phase 1: Supabase Storage & Seguridad SQL
- [x] **Task 1:** Crear `database/supabase/07_avatar_storage.sql` con bucket `avatars`, límites de MIME/tamaño y políticas RLS por carpeta `auth.uid()`.

### Phase 2: Utilidades de Imagen, Persistencia & Auth State
- [x] **Task 2:** Crear `apps/web/src/lib/avatar.ts` (`validateAvatarFile`, `processAvatarImage`, `resolveFallbackAvatarUrl`) con pruebas unitarias.
- [x] **Task 3:** Actualizar `apps/web/src/types/index.ts`, `apps/web/src/lib/persistence.ts` (`uploadUserAvatar`, `removeUserAvatar`, fix de `localStorage` en `updateProfile`) y `apps/web/src/hooks/useAuth.tsx` (soporte de `avatar_url: null` con fallback al proveedor OAuth).

### Phase 3: UI Atomic Design Pragmático
- [x] **Task 4:** Crear Átomo `UserAvatar` y Molécula `AvatarUploader` con manejo de errores inline (`role="alert"`), estado deshabilitado para modo local y limpieza de Object URLs.
- [x] **Task 5:** Integrar `AvatarUploader` en `EditProfileModal.tsx` (eliminando el campo URL externo) y `UserAvatar` en `UserProfileView`, `TopHeader`, `SidebarNav` y `ExerciseHeaderBar`.

### Phase 4: Verificación, Documentación y Cierre
- [x] **Task 6:** Actualizar/ampliar tests en `persistence.test.ts` y `uxUpgrade.test.tsx`, verificar `vitest` y `tsc && vite build`.
- [x] **Task 7:** Actualizar `docs/BITACORA.md`, ejecutar `python -m graphify update .`, merge a `main` y `git push`.
