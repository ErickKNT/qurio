import React, { useEffect, useState } from 'react';
import { buildDicebearAvatarUrl } from '@/lib/avatar';
import { cn } from '@/lib/utils';

export type UserAvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface UserAvatarProps {
  src?: string | null;
  fallbackSeed?: string | null;
  alt: string;
  size?: UserAvatarSize;
  className?: string;
}

const SIZE_CLASSES: Record<UserAvatarSize, string> = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-7 h-7 text-[11px]',
  md: 'w-9 h-9 text-xs',
  lg: 'w-16 h-16 text-base',
  xl: 'w-24 h-24 text-xl',
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  src,
  fallbackSeed,
  alt,
  size = 'sm',
  className,
}) => {
  const [primaryFailed, setPrimaryFailed] = useState(false);
  const [fallbackFailed, setFallbackFailed] = useState(false);

  useEffect(() => {
    setPrimaryFailed(false);
    setFallbackFailed(false);
  }, [src, fallbackSeed]);

  const trimmedSrc = typeof src === 'string' ? src.trim() : '';
  const fallbackUrl = buildDicebearAvatarUrl(fallbackSeed);
  const activeSrc = !primaryFailed && trimmedSrc ? trimmedSrc : fallbackUrl;

  if (fallbackFailed) {
    const initials = (fallbackSeed || alt || 'Q').replace(/^Avatar de\s+/i, '').slice(0, 2).toUpperCase();
    return (
      <div
        role="img"
        aria-label={alt}
        className={cn(
          'rounded-full bg-primary/15 border border-primary/40 flex items-center justify-center font-mono font-bold text-primary-light shrink-0 select-none',
          SIZE_CLASSES[size],
          className
        )}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={activeSrc}
      alt={alt}
      onError={() => {
        if (!primaryFailed && trimmedSrc && activeSrc === trimmedSrc) {
          setPrimaryFailed(true);
        } else {
          setFallbackFailed(true);
        }
      }}
      className={cn('rounded-full object-cover shrink-0 bg-surface-card', SIZE_CLASSES[size], className)}
    />
  );
};
