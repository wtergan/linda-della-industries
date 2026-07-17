// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const repository = 'linda-della-industries';
const isGitHubPages = process.env.GITHUB_ACTIONS === 'true';

export default defineConfig({
  site: 'https://wtergan.github.io',
  base: isGitHubPages ? `/${repository}` : '/',
  output: 'static',
  trailingSlash: 'always',
  security: {
    csp: {
      directives: [
        "default-src 'self'",
        "font-src 'self'",
        "img-src 'self' data:",
        "connect-src 'self' https://formsubmit.co",
        'form-action https://formsubmit.co',
        "base-uri 'self'",
        "object-src 'none'",
      ],
    },
  },
  integrations: [sitemap()],
});
