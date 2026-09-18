// @ts-check
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://www.jevcode.ai',
  trailingSlash: 'ignore',

  build: {
    format: 'directory',
  },

  i18n: {
    defaultLocale: 'zh',
    locales: ['zh', 'en', 'ja', 'ko', 'de', 'fr', 'es', 'pt'],
    routing: {
      prefixDefaultLocale: true,
      redirectToDefaultLocale: false,
    },
    fallback: {
      en: 'zh',
      ja: 'en',
      ko: 'en',
      de: 'en',
      fr: 'en',
      es: 'en',
      pt: 'en',
    },
  },

  markdown: {
    shikiConfig: {
      theme: 'github-dark-default',
      wrap: true,
    },
  },

  devToolbar: { enabled: false },
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'zh',
        locales: {
          zh: 'zh-CN',
          en: 'en',
          ja: 'ja',
          ko: 'ko',
          de: 'de',
          fr: 'fr',
          es: 'es',
          pt: 'pt',
        },
      },
    }),
  ],
});