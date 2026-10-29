/**
 * /jev 的结构化数据。
 *
 * ItemList 的每一项都带 evidenceUrl，使生成式引擎在读 JSON-LD 时
 * 就能拿到可核对的来源，而不是只拿到一段自述。
 */
import type { Lang } from '../../i18n/ui';
import { hubUrl, entryUrl, hubPath, categoryUrl } from '../routing/domains';
import {
  categoryLabel,
  COVERAGE_ENTRIES,
  REGISTRY_REVIEWED_AT,
  VERIFICATION_MEANING,
  type Category,
  type CoverageEntry,
} from '../content/registry';
import { categoryDescription, hubDescription, hubTitle } from './metadata';

const htmlLang = (lang: Lang): string => (lang === 'zh' ? 'zh-CN' : lang);

function assertionFor(lang: Lang, entry: CoverageEntry): string {
  return entry.assertion[lang === 'zh' ? 'zh' : 'en'];
}

export function hubSchema(lang: Lang): Record<string, unknown>[] {
  const url = hubUrl(lang);
  const title = hubTitle(lang);

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
      numberOfItems: COVERAGE_ENTRIES.length,
      itemListOrder: 'https://schema.org/ItemListOrderAscending',
      itemListElement: COVERAGE_ENTRIES.map((entry, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        name: entry.name,
        url: entryUrl(lang, entry.slug),
        ...(entry.lang ? { additionalType: entry.lang } : {}),
        description: assertionFor(lang, entry),
        sameAs: entry.repoUrl,
        subjectOf: { '@type': 'CreativeWork', url: entry.evidenceUrl },
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
): Record<string, unknown>[] {
  const url = categoryUrl(lang, category);
  const label = categoryLabel(category, lang);

  return [
    {
      '@type': 'CollectionPage',
      '@id': `${url}#page`,
      name: `${label} · ${hubTitle(lang)}`,
      description: categoryDescription(lang, category, entries.length),
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
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'JevCode', item: new URL('/', 'https://www.jevcode.ai').href },
        { '@type': 'ListItem', position: 2, name: 'Jev coverage', item: hubUrl(lang) },
        { '@type': 'ListItem', position: 3, name: label, item: url },
      ],
    },
  ];
}

export { hubPath };
