import React, { useEffect, useState } from 'react';
import { X, Save, User, FileText } from 'lucide-react';
import { UserProfile } from '@/types';
import { Button } from '@/components/atoms';
import { AvatarUploader } from '@/components/molecules/AvatarUploader/AvatarUploader';
import { processAvatarImage, resolveFallbackAvatarUrl } from '@/lib/avatar';
import { persistence } from '@/lib/persistence';

export interface EditProfileModalProps {
  profile: UserProfile | null;
  isOpen: boolean;
  isCloudAuth?: boolean;
  providerAvatarUrl?: string | null;
  onClose: () => void;
  onSave: (updates: Partial<UserProfile>) => Promise<{ success?: boolean; error?: string } | void>;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({
  profile,
  isOpen,
  isCloudAuth = false,
  providerAvatarUrl = null,
  onClose,
  onSave,
}) => {
  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [markedForRemoval, setMarkedForRemoval] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && profile) {
      setFullName(profile.full_name || profile.username || '');
      setBio(profile.bio || '');
      setSelectedFile(null);
      setMarkedForRemoval(false);
      setErrorMsg(null);
    }
  }, [isOpen, profile]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen || !profile) return null;

  const fallbackAvatarUrl =
    providerAvatarUrl || resolveFallbackAvatarUrl(profile.username, null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = fullName.trim();
    const cleanBio = bio.trim();

    if (cleanName.length < 2) {
      setErrorMsg('El nombre visible debe tener al menos 2 caracteres.');
      return;
    }
    if (cleanName.length > 100) {
      setErrorMsg('El nombre visible no puede exceder 100 caracteres.');
      return;
    }
    if (cleanBio.length > 220) {
      setErrorMsg('La bio profesional no puede exceder 220 caracteres.');
      return;
    }

    setErrorMsg(null);
    setSaving(true);
    try {
      let avatarUpdate: string | null | undefined = undefined;

      if (selectedFile) {
        const processedBlob = await processAvatarImage(selectedFile);
        const uploadResult = await persistence.uploadUserAvatar(profile.id, processedBlob);
        if (uploadResult.error || !uploadResult.publicUrl) {
          setErrorMsg(uploadResult.error || 'No se pudo subir la imagen de perfil.');
          return;
        }
        avatarUpdate = uploadResult.publicUrl;
      } else if (markedForRemoval) {
        const removeResult = await persistence.removeUserAvatar(profile.id);
        if (!removeResult.success) {
          setErrorMsg(removeResult.error || 'No se pudo eliminar la imagen anterior.');
          return;
        }
        avatarUpdate = null;
      }

      const payload: Partial<UserProfile> = {
        full_name: cleanName,
        bio: cleanBio,
        ...(avatarUpdate !== undefined ? { avatar_url: avatarUpdate } : {}),
      };

      const result = await onSave(payload);
      if (result && result.success === false) {
        setErrorMsg(result.error || 'No se pudo actualizar el perfil.');
        return;
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err?.message || 'No se pudo actualizar el perfil.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-profile-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-canvas/80 backdrop-blur-md animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg rounded-2xl bg-surface border border-border-subtle shadow-2xl overflow-hidden">
        <div className="px-6 py-4 bg-surface-dim border-b border-border-subtle flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <User className="w-4 h-4 text-cyan-accent" />
            <h2 id="edit-profile-modal-title" className="text-base font-bold text-content-primary">
              Editar Perfil Técnico
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar edición de perfil"
            className="p-1.5 rounded-lg text-content-muted hover:text-content-primary hover:bg-surface-card transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          {errorMsg && (
            <div
              role="alert"
              className="p-3 rounded-xl bg-error/10 border border-error/35 text-xs font-mono text-error"
            >
              {errorMsg}
            </div>
          )}

          <AvatarUploader
            currentAvatarUrl={profile.avatar_url}
            fallbackAvatarUrl={fallbackAvatarUrl}
            hasProviderAvatar={Boolean(providerAvatarUrl)}
            username={profile.username}
            isCloudAuth={isCloudAuth}
            disabled={saving}
            selectedFile={selectedFile}
            markedForRemoval={markedForRemoval}
            onSelectFile={setSelectedFile}
            onMarkRemove={setMarkedForRemoval}
            onValidationError={setErrorMsg}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono uppercase tracking-wider text-content-muted">
              Identificador (@username)
            </label>
            <input
              type="text"
              value={`@${profile.username}`}
              disabled
              className="px-3.5 py-2 rounded-xl bg-surface-dim/70 border border-border-subtle/60 text-xs font-mono text-content-muted cursor-not-allowed"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="profile-full-name" className="text-xs font-mono uppercase tracking-wider text-content-secondary">
              Nombre completo (para constancias)
            </label>
            <input
              id="profile-full-name"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ej. Erick Bonilla"
              maxLength={100}
              className="px-3.5 py-2 rounded-xl bg-surface-dim border border-border-subtle focus:border-primary focus:outline-none text-sm text-content-primary transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="profile-bio"
                className="text-xs font-mono uppercase tracking-wider text-content-secondary flex items-center gap-1.5"
              >
                <FileText className="w-3.5 h-3.5 text-cyan-accent" />
                <span>Biografía</span>
              </label>
              <span className="text-[11px] font-mono text-content-muted">{bio.length}/220</span>
            </div>
            <textarea
              id="profile-bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={3}
              maxLength={220}
              placeholder="Ej. Backend & Data Engineer enfocado en PostgreSQL 16 y modelado relacional."
              className="px-3.5 py-2.5 rounded-xl bg-surface-dim border border-border-subtle focus:border-primary focus:outline-none text-sm text-content-primary resize-none transition-colors"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border-subtle/50">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={saving}
              leftIcon={<Save className="w-3.5 h-3.5" />}
            >
              Guardar Cambios
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
