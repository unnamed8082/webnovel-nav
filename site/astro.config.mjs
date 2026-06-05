import { defineConfig } from 'astro/config';

export default defineConfig({
  base: '/webnovel-nav/',
  root: '.',
  srcDir: './src',
  outDir: '../dist',
  publicDir: './public',
});
