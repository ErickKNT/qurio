import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    host: true,
  },
  build: {
    chunkSizeWarningLimit: 500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = id.replace(/\\/g, '/');
          if (
            normalizedId.includes('/AdminDashboardView/') ||
            normalizedId.includes('/AdminBadge/') ||
            normalizedId.includes('/AdminMetricTile/') ||
            normalizedId.includes('/KillswitchToggle/') ||
            normalizedId.includes('/ConnectionGauge/') ||
            normalizedId.includes('/SqlDiffViewer/') ||
            normalizedId.includes('/lib/adminApi') ||
            normalizedId.includes('/types/admin')
          ) {
            return 'vendor-admin';
          }
          if (normalizedId.includes('node_modules')) {
            if (normalizedId.includes('@monaco-editor') || normalizedId.includes('monaco-editor')) {
              return 'vendor-monaco';
            }
            if (normalizedId.includes('sql-formatter')) {
              return 'vendor-sql-formatter';
            }
            if (normalizedId.includes('@supabase')) {
              return 'vendor-supabase';
            }
            if (normalizedId.includes('lucide-react')) {
              return 'vendor-lucide';
            }
            if (normalizedId.includes('react') || normalizedId.includes('react-dom')) {
              return 'vendor-react';
            }
          }
        },
      },
    },
  },
});
