import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://joemaserati-lab.github.io',
  base: '/portfolio-final',
  output: 'static',
  trailingSlash: 'always',
  build: {
    format: 'directory'
  }
});
