/**
 * /jev 的结构化数据。
 *
 * 枢纽页的 ItemList 只列非空分类集合。每个分类页自己的 categorySchema
 * 才展开该分类的全部条目，并且每一项都带 evidenceUrl，使生成式引擎在读
 * JSON-LD 时就能拿到可核对的来源，而不是只拿到一段自述。
 */
import type { Lang } from '../../i18n/ui';
import { hubUrl, entryUrl, hubPath, categoryUrl, absoluteUrl } from '../routing/domains';
import {
  categoryLabel,
  entriesByCategory,
  REGISTRY_REVIEWED_AT,
  VERIFICATION_MEANING,
  type Category,
  type CoverageEntry,
} from '../content/registry';
import { CATEGORY_PAGE_SIZE, categoryDescription, categoryTitle, hubDescription, hubTitle } from './metadata';
import { jevCopy } from '../content/jev-copy';

const htmlLang = (lang: Lang): string => (lang === 'zh' ? 'zh-CN' : lang);

function assertionFor(lang: Lang, entry: CoverageEntry): string {
  return entry.assertion[lang === 'zh' ? 'zh' : 'en'];
}

export function hubSchema(lang: Lang): Record<string, unknown>[] {
  const url = hubUrl(lang);
  const title = hubTitle(lang);
  // entriesByCategory() 已按 CATEGORIES 顺序滤掉空分类。
  const groups = entriesByCategory().filter((group) => group.entries.length > 0);

  return [
    {
      '@type': 'CollectionPage',
      '@id': `${url}#page`,
      name: title,
      description: hubDescription(lang),
      url,
      inLanguage: htmlLang(lang),
      dateModified: REGISTRY_REVIEWED_AT,
      isPartOf: { '@type': 'WebSite', url: new URL('/', 'https://www.jevcode.ai').href },
      mainEntity: { '@id': `${url}#list` },
    },
    {
      '@type': 'ItemList',
      '@id': `${url}#list`,
      name: title,
      numberOfItems: groups.length,
      itemListOrder: 'https://schema.org/ItemListOrderAscending',
      itemListElement: groups.map((group, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: categoryLabel(group.category, lang),
        url: categoryUrl(lang, group.category),
        description: categoryDescription(lang, group.category, group.entries.length),
      })),
    },
  ];
}

export function entrySchema(lang: Lang, entry: CoverageEntry): Record<string, unknown>[] {
  const url = entryUrl(lang, entry.slug);
  const hub = hubUrl(lang);

  return [
    {
      '@type': 'TechArticle',
      '@id': `${url}#article`,
      headline: entry.name,
      abstract: assertionFor(lang, entry),
      url,
      inLanguage: htmlLang(lang),
      dateModified: entry.reviewedAt,
      datePublished: entry.addedAt,
      articleSection: categoryLabel(entry.category, lang),
      citation: entry.evidenceUrl,
      isPartOf: { '@id': `${hub}#page` },
      about: {
        '@type': 'SoftwareSourceCode',
        name: entry.name,
        codeRepository: entry.repoUrl,
        ...(entry.lang ? { programmingLanguage: entry.lang } : {}),
      },
      keywords: [
        'Jev',
        entry.name,
        categoryLabel(entry.category, 'en'),
        ...entry.verification.map((v) => VERIFICATION_MEANING[v].en),
      ].join(', '),
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'JevCode', item: new URL('/', 'https://www.jevcode.ai').href },
        { '@type': 'ListItem', position: 2, name: 'Jev coverage', item: hub },
        { '@type': 'ListItem', position: 3, name: entry.name, item: url },
      ],
    },
  ];
}

export function categorySchema(
  lang: Lang,
  category: Category,
  entries: CoverageEntry[],
  pagePath?: string,
  totalItems?: number,
): Record<string, unknown>[] {
  const url = pagePath ? absoluteUrl(pagePath) : categoryUrl(lang, category);
  const label = categoryLabel(category, lang);
  const pageNum = pagePath ? Number(pagePath.match(/\/page\/(\d+)\/$/)?.[1] ?? 1) : 1;
  const described = totalItems ?? entries.length;
  const totalPages = Math.max(1, Math.ceil(described / CATEGORY_PAGE_SIZE));
  const name = categoryTitle(
    lang,
    category,
    pageNum > 1 ? pageNum : undefined,
    pageNum > 1 ? totalPages : undefined,
  );
  const crumbs: Record<string, unknown>[] = [
    { '@type': 'ListItem', position: 1, name: 'JevCode', item: absoluteUrl('/') },
    { '@type': 'ListItem', position: 2, name: 'Jev coverage', item: hubUrl(lang) },
    { '@type': 'ListItem', position: 3, name: label, item: categoryUrl(lang, category) },
  ];
  if (pageNum > 1) {
    crumbs.push({
      '@type': 'ListItem',
      position: 4,
      name: jevCopy(lang).category.pageOf(pageNum, totalPages),
      item: url,
    });
  }

  return [
    {
      '@type': 'CollectionPage',
      '@id': `${url}#page`,
      name,
      description: categoryDescription(lang, category, described),
      url,
      inLanguage: htmlLang(lang),
      dateModified: REGISTRY_REVIEWED_AT,
      isPartOf: { '@id': `${hubUrl(lang)}#page` },
      mainEntity: { '@id': `${url}#list` },
    },
    {
      '@type': 'ItemList',
      '@id': `${url}#list`,
      numberOfItems: entries.length,
      itemListElement: entries.map((entry, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: entry.name,
        url: entryUrl(lang, entry.slug),
        description: assertionFor(lang, entry),
        sameAs: entry.repoUrl,
        subjectOf: { '@type': 'CreativeWork', url: entry.evidenceUrl },
      })),
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: crumbs,
    },
  ];
}

export { hubPath };
