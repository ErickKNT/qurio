import React, { useState } from 'react';
import { Button, Badge } from '@/components/atoms';
import { FormField } from '@/components/molecules';
import { AppPath } from '@/types';

export interface DesignSystemShowcaseProps {
  onNavigate: (path: AppPath) => void;
}

export const DesignSystemShowcase: React.FC<DesignSystemShowcaseProps> = ({ onNavigate }) => {
  const [formEmail, setFormEmail] = useState('');
  const [formError, setFormError] = useState('');

  const handleValidateEmail = (val: string) => {
    setFormEmail(val);
    if (!val) {
      setFormError('El correo electrónico es obligatorio para guardar tu progreso.');
    } else if (!val.includes('@') || !val.includes('.')) {
      setFormError('Introduce un formato de correo electrónico válido (ej. usuario@dominio.com).');
    } else {
      setFormError('');
    }
  };

  return (
    <section className="flex flex-col gap-6 p-6 rounded-2xl bg-surface border border-border-subtle">
      <div>
        <h3 className="text-base font-bold text-content-primary">
          Verificación del Sistema de Diseño (Atomic Design Pragmático)
        </h3>
        <p className="text-xs text-content-secondary mt-1">
          Todos los componentes pertenecen estrictamente a Átomos, Moléculas u Organismos bajo la especificación Terminal Glow Minimal.
        </p>
      </div>

      {/* Átomos: Botones */}
      <div className="flex flex-col gap-3">
        <span className="text-xs font-mono font-semibold text-cyan-accent uppercase tracking-wider">
          1. Átomos — Variantes de Button
        </span>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary" kbdShortcut="⌘↵">Primario (Ejecutar)</Button>
          <Button variant="secondary">Secundario (Formatear)</Button>
          <Button variant="emerald">Éxito Semántico</Button>
          <Button variant="ghost">Ghost (Copiar)</Button>
          <Button variant="outline">Contorno</Button>
          <Button variant="danger">Peligro</Button>
          <Button variant="primary" isLoading>Cargando</Button>
        </div>
      </div>

      {/* Átomos: Badges */}
      <div className="flex flex-col gap-3">
        <span className="text-xs font-mono font-semibold text-cyan-accent uppercase tracking-wider">
          2. Átomos — Badges con Opacidad 10% y Borde
        </span>
        <div className="flex flex-wrap items-center gap-3">
          <Badge variant="default">DEFAULT</Badge>
          <Badge variant="cyan" dot>CYAN ACCENT</Badge>
          <Badge variant="emerald" dot>TEST PASSED</Badge>
          <Badge variant="amber" dot>STREAK x2</Badge>
          <Badge variant="error" dot>ERROR 404</Badge>
          <Badge variant="mono">VARCHAR(255)</Badge>
        </div>
      </div>

      {/* Molécula: Manejo Riguroso de Errores Inline (Anti-AI Slop) */}
      <div className="flex flex-col gap-3 max-w-md">
        <span className="text-xs font-mono font-semibold text-cyan-accent uppercase tracking-wider">
          3. Molécula — FormField con Error Inline Riguroso (Anti-AI Slop)
        </span>
        <FormField
          label="Correo Electrónico de Registro"
          placeholder="tu_correo@ejemplo.com"
          value={formEmail}
          onChange={(e) => handleValidateEmail(e.target.value)}
          errorMessage={formError}
          helperText="Escribe un correo inválido para probar la validación inline estricta."
          required
        />
      </div>

      {/* Organismo: Error 404 Tematizado SQL (Anti-AI Slop Regla 1.1) */}
      <div className="flex flex-col gap-3 max-w-md pt-2 border-t border-border-subtle/40">
        <span className="text-xs font-mono font-semibold text-cyan-accent uppercase tracking-wider">
          4. Organismo — 404 Temática SQL (Anti-AI Slop Regla 1.1)
        </span>
        <p className="text-xs text-content-secondary">
          Metáfora técnica relacional: captura rutas inexistentes con mensaje de error SQLSTATE 42P01.
        </p>
        <div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate('not-found')}
          >
            Simular Error 404 (Relation Not Found)
          </Button>
        </div>
      </div>
    </section>
  );
};
