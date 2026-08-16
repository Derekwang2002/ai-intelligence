import { defineConfig } from 'astro/config';

// GitHub Pages project sites serve under /<repo-name>/, so CI sets ASTRO_BASE
// (e.g. /ai-intelligence). Locally the site builds and previews at /.
const base = process.env.ASTRO_BASE?.replace(/\/+$/, '') || '/';

export default defineConfig({
  site: 'https://derekwang2002.github.io',
  base,
});
