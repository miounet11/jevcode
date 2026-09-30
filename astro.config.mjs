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
    defaultLocale: 'en',
    locales: ['en', 'zh', 'ja', 'ko', 'de', 'fr', 'es', 'pt'],
    routing: {
      prefixDefaultLocale: true,
      redirectToDefaultLocale: false,
    },
    fallback: {
      zh: 'en',
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

  // 本地开发：页面与账号 API 同源，才能调试登录/账户页。
  // 生产不走这里——生产由 nginx 把 /api/* 反代到同一个 8790 进程，天然同源。
  // 会话 Cookie 是 SameSite=Lax，跨源联调会被浏览器直接拦掉，所以必须代理。
  vite: {
    server: {
      proxy: {
        '/api': {
          target: process.env.JEVCODE_API_TARGET || 'http://127.0.0.1:8790',
          changeOrigin: false,
        },
      },
    },
  },

  devToolbar: { enabled: false },
  integrations: [
    sitemap({
      filter: (page) =>
        !page.includes('/login') &&
        !page.includes('/account') &&
        !page.includes('/404'),
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