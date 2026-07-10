import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(async () => {
  const isElectron = process.env.ELECTRON === 'true';
  const plugins = [react(), tailwindcss()];

  if (isElectron) {
    try {
      const electronPlugin = (await import('vite-plugin-electron')).default;
      plugins.push(
        electronPlugin([
          {
            // Main process entry
            entry: 'src/main/index.ts',
            onstart(options) {
              options.startup();
            },
            vite: {
              build: {
                outDir: 'dist/main',
                minify: false,
                sourcemap: true,
                rollupOptions: {
                  external: ['electron', 'better-sqlite3', 'bcryptjs'],
                }
              }
            }
          },
          {
            // Preload entry
            entry: 'src/main/preload.ts',
            onstart(options) {
              options.reload();
            },
            vite: {
              build: {
                outDir: 'dist/main',
                minify: false,
                sourcemap: true,
                rollupOptions: {
                  external: ['electron'],
                }
              }
            }
          }
        ])
      );
    } catch (err) {
      console.warn('Failed to load vite-plugin-electron:', err);
    }
  }

  return {
    plugins,
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // Configure Hot Module Replacement (HMR) dynamically based on the environment to optimize system resources.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Adjust file watch queries for efficient CPU utilization under rapid builds.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
