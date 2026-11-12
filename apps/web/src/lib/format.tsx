import React from 'react';

/**
 * Renderiza texto interpretando sintaxis de código (`código`) como badges interactivos
 * con tipografía JetBrains Mono y resplandor sutil, eliminando los caracteres literales de acento/backtick.
 */
export function formatInlineCode(text?: string | null): React.ReactNode {
  if (!text) return null;
  const parts = text.split(/(`[^`]+`)/g);
  if (parts.length === 1) return text;

  return parts.map((part, i) => {
    if (part.startsWith('`') && part.endsWith('`') && part.length > 2) {
      const code = part.slice(1, -1);
      return (
        <code
          key={i}
          className="px-1.5 py-0.5 mx-0.5 rounded bg-surface-card border border-border-subtle font-mono text-[11px] text-cyan-accent font-medium inline-block align-baseline shadow-xs [font-variant-ligatures:none]"
        >
          {code}
        </code>
      );
    }
    return part;
  });
}
