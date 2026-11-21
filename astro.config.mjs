// @ts-check
import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';
import { lastmodSerialize, sitemapInclude } from './scripts/sitemap-lastmod.mjs';

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
    // 不启用 Astro 内置 i18n.fallback：本站全部页面均在 src/pages/[lang]/ 下
    // 显式生成（文档缺译在 [lang]/[...slug].astro 手动回退到 en 并标 noindex）。
    // 开启内置 fallback 会在 Astro 7 额外合成 ~12.7 万条冲突路由，每次构建打印
    // 十余万行 Could not render 告警（把 cron.log 撑到 500MB+）且不产生任何实际页面。
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
      serialize: lastmodSerialize,
      filter: sitemapInclude,
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