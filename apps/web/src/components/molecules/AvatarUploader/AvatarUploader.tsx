import React, { useEffect, useRef, useState } from 'react';
import { Upload, Trash2, Image as ImageIcon, CloudOff } from 'lucide-react';
import { UserAvatar, Button } from '@/components/atoms';
import { validateAvatarFile } from '@/lib/avatar';
import { cn } from '@/lib/utils';

export interface AvatarUploaderProps {
  currentAvatarUrl?: string | null;
  fallbackAvatarUrl: string;
  hasProviderAvatar?: boolean;
  username?: string;
  isCloudAuth?: boolean;
  disabled?: boolean;
  selectedFile: File | null;
  markedForRemoval: boolean;
  onSelectFile: (file: File | null) => void;
  onMarkRemove: (remove: boolean) => void;
  onValidationError: (message: string | null) => void;
}

export const AvatarUploader: React.FC<AvatarUploaderProps> = ({
  currentAvatarUrl,
  fallbackAvatarUrl,
  hasProviderAvatar = false,
  username,
  isCloudAuth = false,
  disabled = false,
  selectedFile,
  markedForRemoval,
  onSelectFile,
  onMarkRemove,
  onValidationError,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!selectedFile) {
      setPreviewUrl(null);
      return;
    }
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [selectedFile]);

  const handleCandidateFile = (file: File | undefined | null) => {
    if (!file) return;
    const result = validateAvatarFile(file);
    if (!result.valid) {
      onValidationError(result.error);
      if (inputRef.current) inputRef.current.value = '';
      return;
    }
    onValidationError(null);
    onMarkRemove(false);
    onSelectFile(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleCandidateFile(e.target.files?.[0]);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (!isCloudAuth || disabled) return;
    handleCandidateFile(e.dataTransfer.files?.[0]);
  };

  const handleRemoveClick = () => {
    onValidationError(null);
    if (inputRef.current) inputRef.current.value = '';
    if (selectedFile) {
      onSelectFile(null);
      return;
    }
    onMarkRemove(true);
  };

  const effectivePreview = markedForRemoval
    ? fallbackAvatarUrl
    : previewUrl || currentAvatarUrl || fallbackAvatarUrl;

  const canRemove =
    Boolean(selectedFile) ||
    (!markedForRemoval && Boolean(currentAvatarUrl) && currentAvatarUrl !== fallbackAvatarUrl);

  const controlsDisabled = disabled || !isCloudAuth;

  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor="profile-avatar-file"
        className="text-xs font-mono uppercase tracking-wider text-content-secondary flex items-center gap-1.5"
      >
        <ImageIcon className="w-3.5 h-3.5 text-primary-light" />
        <span>Imagen de Perfil</span>
      </label>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          if (!controlsDisabled) setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={cn(
          'flex flex-col sm:flex-row sm:items-center gap-4 p-3.5 rounded-xl bg-surface-dim border transition-colors',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-border-subtle'
        )}
      >
        <UserAvatar
          src={effectivePreview}
          fallbackSeed={username}
          alt={`Vista previa de avatar de ${username || 'Usuario'}`}
          size="lg"
          className="border-2 border-primary/35 shadow-sm"
        />

        <div className="flex flex-col gap-2 min-w-0 flex-1">
          <input
            ref={inputRef}
            id="profile-avatar-file"
            type="file"
            accept="image/png,image/jpeg,image/webp"
            disabled={controlsDisabled}
            onChange={handleInputChange}
            className="sr-only"
          />

          {isCloudAuth ? (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={controlsDisabled}
                  onClick={() => inputRef.current?.click()}
                  leftIcon={<Upload className="w-3.5 h-3.5 text-cyan-accent" />}
                >
                  {selectedFile ? 'Elegir otra foto' : 'Subir imagen'}
                </Button>

                {canRemove && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={disabled}
                    onClick={handleRemoveClick}
                    leftIcon={<Trash2 className="w-3.5 h-3.5 text-error" />}
                    className="text-error hover:bg-error/10"
                  >
                    {selectedFile ? 'Descartar' : 'Quitar foto'}
                  </Button>
                )}
              </div>

              <p className="text-[11px] font-mono text-content-muted leading-snug">
                {selectedFile
                  ? `Listo para subir: ${selectedFile.name} (se recortará a 256×256 WebP).`
                  : markedForRemoval
                  ? hasProviderAvatar
                    ? 'Se restaurará tu avatar del proveedor al guardar.'
                    : 'Se restaurará el avatar por defecto al guardar.'
                  : 'JPG, PNG o WebP hasta 5 MB. Arrastra aquí o selecciona un archivo.'}
              </p>
            </>
          ) : (
            <div className="flex items-start gap-2 text-[11px] font-mono text-content-muted leading-snug">
              <CloudOff className="w-3.5 h-3.5 text-amber-streak shrink-0 mt-0.5" />
              <span>Inicia sesión en la nube para subir una foto de perfil personalizada.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
