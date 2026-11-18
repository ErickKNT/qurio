import { useState, useRef, useCallback, useEffect } from 'react';

export interface UseResizableSplitOptions {
  storageKey: string;
  defaultPct?: number;
  minPct?: number;
  maxPct?: number;
  expandedPct?: number;
  isResultsExpanded?: boolean;
  onToggleResultsExpanded?: (expanded: boolean) => void;
}

export function useResizableSplit({
  storageKey,
  defaultPct = 48,
  minPct = 28,
  maxPct = 78,
  expandedPct = 76,
  isResultsExpanded = false,
  onToggleResultsExpanded,
}: UseResizableSplitOptions) {
  const [resultsPct, setResultsPct] = useState<number>(() => {
    if (typeof window === 'undefined') return defaultPct;
    const saved = Number(window.localStorage.getItem(storageKey));
    if (!Number.isNaN(saved) && saved >= minPct && saved <= maxPct) {
      return saved;
    }
    return defaultPct;
  });

  const [isDraggingSplit, setIsDraggingSplit] = useState(false);
  const splitContainerRef = useRef<HTMLDivElement>(null);

  const handleMouseDownSplit = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      if (isResultsExpanded && onToggleResultsExpanded) {
        onToggleResultsExpanded(false);
      }
      setIsDraggingSplit(true);
    },
    [isResultsExpanded, onToggleResultsExpanded]
  );

  const handleResetSplit = useCallback(() => {
    setResultsPct(defaultPct);
    onToggleResultsExpanded?.(false);
  }, [defaultPct, onToggleResultsExpanded]);

  useEffect(() => {
    if (!isDraggingSplit) return;

    const handleMouseMove = (e: MouseEvent) => {
      const container = splitContainerRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      if (rect.height <= 0) return;
      const fromBottom = rect.bottom - e.clientY;
      const pct = Math.round((fromBottom / rect.height) * 100);
      const clamped = Math.max(minPct, Math.min(maxPct, pct));
      setResultsPct(clamped);
    };

    const handleMouseUp = () => {
      setIsDraggingSplit(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDraggingSplit, minPct, maxPct]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(storageKey, String(resultsPct));
    }
  }, [storageKey, resultsPct]);

  const effectiveResultsPct = isResultsExpanded ? expandedPct : resultsPct;

  return {
    splitContainerRef,
    isDraggingSplit,
    effectiveResultsPct,
    handleMouseDownSplit,
    handleResetSplit,
  };
}
