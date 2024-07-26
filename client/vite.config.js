import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import socketConfig from '../config';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/bridge': `http://localhost:5000`
    }
  },
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.js$/, // Inclut tous les fichiers .js dans le répertoire src
    exclude: [],
  },
  build: {
    rollupOptions: {
      input: './src/index.js',
      output: {
        entryFileNames: 'js/[name].js',
        assetFileNames: 'assets/[name].[ext]',
      },
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
      },
    },
  },
});