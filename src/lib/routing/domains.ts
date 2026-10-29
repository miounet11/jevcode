/**
 * 主域路由登记表。
 *
 * Jev 覆盖枢纽只挂主域二级目录 `/jev`，不注册任何新主机名。
 * 所有 SEO 产物（canonical、hreflang、sitemap、JSON-LD）都必须从
 * 这里的常量派生，避免出现第二份 origin 字面量。
 */

export const SITE_ORIGIN = 'https://www.jevcode.ai';

/** 覆盖枢纽的路径前缀，不含语言段。 */
export const JEV_HUB_PATH = '/jev';

/** 覆盖条目详情页的路径前缀，不含语言段；须与 src/pages/[lang]/jev/[slug].astro 的路由一致。 */
export const JEV_ENTRY_PATH = '/jev';

/** 分类落地页路径前缀；须与 src/pages/[lang]/jev/category/[category].astro 一致。 */
export const JEV_CATEGORY_PATH = '/jev/category';

/** 主站支持的语言段，与 src/i18n 的目录保持一致。 */
export const LOCALES = ['en', 'zh', 'ja', 'ko', 'de', 'fr', 'es', 'pt'] as const;

export type Locale = (typeof LOCALES)[number];

/** 与 astro.config.mjs 的 i18n.defaultLocale 保持一致。 */
export const DEFAULT_LOCALE: Locale = 'en';

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

/** 规范化语言段：未知值一律落回默认语言，避免生成 /undefined/ 这类 URL。 */
export function normalizeLocale(value: unknown): Locale {
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export function localePath(locale: Locale, path: string): string {
  const clean = path === '/' ? '' : path.startsWith('/') ? path : `/${path}`;
  return `/${locale}${clean}`;
}

export function absoluteUrl(path: string): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_ORIGIN}${clean}`;
}

export function hubPath(locale: Locale): string {
  return `${localePath(locale, JEV_HUB_PATH)}/`;
}

export function hubUrl(locale: Locale): string {
  return absoluteUrl(hubPath(locale));
}

export function entryPath(locale: Locale, slug: string): string {
  return `${localePath(locale, `${JEV_ENTRY_PATH}/${slug}`)}/`;
}

export function entryUrl(locale: Locale, slug: string): string {
  return absoluteUrl(entryPath(locale, slug));
}

export function categoryPath(locale: Locale, category: string): string {
  return `${localePath(locale, `${JEV_CATEGORY_PATH}/${category}`)}/`;
}

export function categoryUrl(locale: Locale, category: string): string {
  return absoluteUrl(categoryPath(locale, category));
}
