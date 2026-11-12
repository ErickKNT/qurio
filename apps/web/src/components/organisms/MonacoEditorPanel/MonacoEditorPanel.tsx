import React, { useRef, useEffect } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import { Play, RotateCcw, Wand2, Terminal } from 'lucide-react';
import { format as formatSql } from 'sql-formatter';
import { Button } from '@/components/atoms/Button/Button';
import { useTheme } from '@/hooks/useTheme';
import { registerSqlCompletionProvider } from './sqlCompleter';
import { cn } from '@/lib/utils';

export interface MonacoEditorPanelProps {
  value: string;
  onChange: (val: string) => void;
  onExecute: () => void;
  onReset?: () => void;
  isLoading?: boolean;
  isSubmitMode?: boolean;
  className?: string;
}

export const MonacoEditorPanel: React.FC<MonacoEditorPanelProps> = ({
  value,
  onChange,
  onExecute,
  onReset,
  isLoading = false,
  isSubmitMode = true,
  className,
}) => {
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<any>(null);
  const { isDark } = useTheme();

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // 1. Definir tema visual oficial 'qurio-dark'
    monaco.editor.defineTheme('qurio-dark', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: '', background: '0B1020', foreground: 'F8FAFC' },
        { token: 'keyword', foreground: '38BDF8', fontStyle: 'bold' },
        { token: 'string', foreground: '4AE176' },
        { token: 'number', foreground: 'F59E0B' },
        { token: 'comment', foreground: '64748B', fontStyle: 'italic' },
        { token: 'operator', foreground: 'C0C1FF' },
        { token: 'delimiter', foreground: '94A3B8' },
        { token: 'type', foreground: '818CF8' },
      ],
      colors: {
        'editor.background': '#0B1020',
        'editor.foreground': '#F8FAFC',
        'editorCursor.foreground': '#38BDF8',
        'editor.lineHighlightBackground': '#17203380',
        'editorLineNumber.foreground': '#94A3B850',
        'editorLineNumber.activeForeground': '#38BDF8',
        'editor.selectionBackground': '#6366F140',
        'editor.inactiveSelectionBackground': '#6366F120',
        'editorIndentGuide.background': '#1E293B60',
        'editorIndentGuide.activeBackground': '#1E293B',
      },
    });

    // 2. Definir tema visual oficial 'qurio-light'
    monaco.editor.defineTheme('qurio-light', {
      base: 'vs',
      inherit: true,
      rules: [
        { token: '', background: 'F8FAFC', foreground: '0F172A' },
        { token: 'keyword', foreground: '4F46E5', fontStyle: 'bold' },
        { token: 'string', foreground: '15803D' },
        { token: 'number', foreground: 'D97706' },
        { token: 'comment', foreground: '94A3B8', fontStyle: 'italic' },
        { token: 'operator', foreground: '4F46E5' },
        { token: 'delimiter', foreground: '64748B' },
        { token: 'type', foreground: '6366F1' },
      ],
      colors: {
        'editor.background': '#F8FAFC',
        'editor.foreground': '#0F172A',
        'editorCursor.foreground': '#4F46E5',
        'editor.lineHighlightBackground': '#F1F5F980',
        'editorLineNumber.foreground': '#94A3B880',
        'editorLineNumber.activeForeground': '#4F46E5',
        'editor.selectionBackground': '#C7D2FE80',
        'editor.inactiveSelectionBackground': '#E0E7FF80',
        'editorIndentGuide.background': '#E2E8F0',
        'editorIndentGuide.activeBackground': '#CBD5E1',
      },
    });

    monaco.editor.setTheme(isDark ? 'qurio-dark' : 'qurio-light');

    // 3. Registrar motor de autocompletado inteligente SQL (Keywords, Tablas, Columnas y Alias)
    registerSqlCompletionProvider(monaco);

    // 4. Vincular atajos de teclado:
    // Cmd/Ctrl + Enter -> onExecute
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      onExecute();
    });

    // Shift + Alt + F -> handleFormatSql (Atajo estándar de formateo en VS Code / Monaco)
    editor.addCommand(monaco.KeyMod.Shift | monaco.KeyMod.Alt | monaco.KeyCode.KeyF, () => {
      handleFormatSql();
    });

    // 5. Exponer helper seguro para automatización y pruebas de navegador
    if (typeof window !== 'undefined') {
      (window as any).__setEditorSql = (val: string) => {
        editor.setValue(val);
        onChange(val);
      };
    }

    editor.focus();
  };

  useEffect(() => {
    if (monacoRef.current) {
      monacoRef.current.editor.setTheme(isDark ? 'qurio-dark' : 'qurio-light');
    }
  }, [isDark]);

  // Formateador jerárquico profesional de SQL con PostgreSQL Style Guide
  const handleFormatSql = () => {
    if (!editorRef.current) return;
    const currentVal = editorRef.current.getValue();
    if (!currentVal || !currentVal.trim()) return;

    try {
      const formatted = formatSql(currentVal, {
        language: 'postgresql',
        keywordCase: 'upper',
        tabWidth: 2,
        linesBetweenQueries: 2,
      });
      editorRef.current.setValue(formatted);
      onChange(formatted);
    } catch (err) {
      console.warn('No se pudo formatear la consulta SQL:', err);
    }
  };

  return (
    <div className={cn('flex flex-col h-full w-full bg-canvas select-none', className)}>
      {/* Barra de Herramientas del Editor */}
      <div className="h-10 px-4 bg-surface-dim border-b border-border-subtle flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-cyan-accent">
            <Terminal className="w-3.5 h-3.5 text-cyan-accent" />
            <span>query.sql</span>
          </div>
          <span className="text-[11px] font-mono text-content-muted">• PostgreSQL 16</span>
        </div>

        <div className="flex items-center gap-2">
          {onReset && (
            <button
              onClick={onReset}
              className="p-1.5 rounded text-content-muted hover:text-content-primary hover:bg-surface-card transition-colors text-xs flex items-center gap-1"
              title="Restablecer consulta inicial"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px]">Restablecer</span>
            </button>
          )}

          <button
            onClick={handleFormatSql}
            className="p-1.5 rounded text-content-muted hover:text-cyan-accent hover:bg-surface-card transition-colors text-xs flex items-center gap-1"
            title="Formatear consulta SQL con jerarquía e indentación (Shift + Alt + F)"
          >
            <Wand2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline text-[11px]">Formatear</span>
          </button>

          <Button
            variant={isSubmitMode ? 'emerald' : 'primary'}
            size="sm"
            kbdShortcut="⌘↵"
            isLoading={isLoading}
            onClick={onExecute}
            leftIcon={<Play className="w-3.5 h-3.5 fill-current" />}
          >
            {isSubmitMode ? 'Enviar Solución' : 'Ejecutar Query'}
          </Button>
        </div>
      </div>

      {/* Contenedor Monaco Editor */}
      <div className="flex-1 w-full relative">
        <Editor
          height="100%"
          language="sql"
          theme="qurio-dark"
          value={value}
          onChange={(val) => onChange(val || '')}
          onMount={handleEditorDidMount}
          options={{
            fontFamily: '"JetBrains Mono", Menlo, Monaco, Consolas, monospace',
            fontSize: 13,
            lineHeight: 22,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            lineNumbers: 'on',
            lineNumbersMinChars: 3,
            automaticLayout: true,
            tabSize: 2,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            padding: { top: 12, bottom: 12 },
            renderLineHighlight: 'all',
            overviewRulerBorder: false,
            hideCursorInOverviewRuler: true,
            quickSuggestions: {
              other: true,
              comments: false,
              strings: false,
            },
            suggestOnTriggerCharacters: true,
            acceptSuggestionOnEnter: 'smart',
            tabCompletion: 'on',
            suggest: {
              showKeywords: true,
              showFields: true,
              showStructs: true,
              showSnippets: true,
              insertMode: 'insert',
              filterGraceful: true,
            },
          }}
        />
      </div>
    </div>
  );
};
