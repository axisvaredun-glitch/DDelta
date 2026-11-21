import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// GitHub Pages project site: https://<user>.github.io/DDelta/
const repoBase = '/DDelta/';

export default defineConfig(({ command }) => ({
  plugins: [react(), tailwindcss()],
  // Dev: /.  Production: /DDelta/ so JS/CSS resolve under the repo path.
  base: command === 'build' ? repoBase : '/',
}));