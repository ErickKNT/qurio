/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: 'rgb(var(--color-canvas) / <alpha-value>)',
        canvas: 'rgb(var(--color-canvas) / <alpha-value>)',
        surface: {
          DEFAULT: 'rgb(var(--color-surface) / <alpha-value>)',
          dim: 'rgb(var(--color-surface-dim) / <alpha-value>)',
          card: 'rgb(var(--color-surface-card) / <alpha-value>)',
          hover: 'rgb(var(--color-surface-hover) / <alpha-value>)',
          elevated: 'rgb(var(--color-surface-elevated) / <alpha-value>)',
        },
        border: {
          DEFAULT: 'rgb(var(--color-border) / <alpha-value>)',
          subtle: 'rgb(var(--color-border-subtle) / <alpha-value>)',
          glow: 'rgba(99, 102, 241, 0.4)',
          emerald: 'rgba(34, 197, 94, 0.5)',
        },
        primary: {
          DEFAULT: '#6366F1',
          hover: '#4f46e5',
          light: '#818cf8',
          tint: '#c0c1ff',
          glow: 'rgba(99, 102, 241, 0.25)',
        },
        cyan: {
          accent: '#0284c7',
          glow: 'rgba(56, 189, 248, 0.25)',
        },
        emerald: {
          DEFAULT: '#22C55E',
          glow: 'rgba(34, 197, 94, 0.25)',
        },
        amber: {
          streak: '#F59E0B',
          glow: 'rgba(245, 158, 11, 0.25)',
        },
        error: {
          DEFAULT: '#ef4444',
          solid: '#EF4444',
          container: '#93000a',
        },
        content: {
          primary: 'rgb(var(--color-content-primary) / <alpha-value>)',
          secondary: 'rgb(var(--color-content-secondary) / <alpha-value>)',
          muted: 'rgb(var(--color-content-muted) / <alpha-value>)',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      boxShadow: {
        'glow-primary': '0 0 0 1px rgba(99, 102, 241, 0.4), 0 0 16px -4px rgba(99, 102, 241, 0.25)',
        'glow-emerald': '0 0 0 1px rgba(34, 197, 94, 0.5), 0 0 20px -6px rgba(34, 197, 94, 0.25)',
        'glow-cyan': '0 0 0 1px rgba(56, 189, 248, 0.4), 0 0 16px -4px rgba(56, 189, 248, 0.25)',
        'glow-amber': '0 0 0 1px rgba(245, 158, 11, 0.4), 0 0 16px -4px rgba(245, 158, 11, 0.25)',
      },
      borderRadius: {
        sm: '0.25rem',
        DEFAULT: '0.5rem',
        md: '0.625rem',
        lg: '0.75rem',
        xl: '0.875rem',
        '2xl': '1rem',
      },
    },
  },
  plugins: [],
};
