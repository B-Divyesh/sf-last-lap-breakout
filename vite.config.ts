import { defineConfig } from 'vitest/config';

export default defineConfig({
  build: {
    target: 'es2022',
    assetsDir: 'build',
    rollupOptions: {
      input: {
        main: 'index.html',
        demo: 'demo/index.html',
        play: 'play/index.html',
        privacy: 'privacy/index.html',
        terms: 'terms/index.html',
        notFound: '404.html'
      }
    }
  },
  test: { exclude: ['tests/e2e/**', 'node_modules/**', 'dist/**'] },
  server: { port: 4173 },
  preview: { port: 4173 }
});
