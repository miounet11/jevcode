/**
 * 内容聚合与流量入口生成。
 *
 * 站内已有覆盖条目（/jev）、生态项目（/ecosystem）与每日案例（/briefs）
 * 各自有一套数据形状，新增内容时很难被统一索引、分发与复用。本模块把它们
 * 收敛成同一个 ContentItem，再按主题批量产出稳定的「流量入口」描述，
 * 供页面生成落地页、内链与 SEO 元数据。
 *
 * 约束：所有函数都是纯函数——不读文件、不发起请求、不写盘、不依赖构建时环境。
 * 输入由调用方从 src/data 与 src/lib/content/registry 传入，因此静态构建可以
 * 提前算好结果；输出是纯数据（无函数、无 Date、无 Map），可直接 JSON 序列化。
 *
 * canonical / path 一律经 routing/domains 的常量派生，避免这里出现第二份
 * origin 字面量。
 */

import {
  DEFAULT_LOCALE,
  absoluteUrl,
  entryPath,
  localePath,
  normalizeLocale,
  type Locale,
} from './routing/domains.ts';
import { projectSlug } from './slug.ts';
import type { CoverageEntry } from './content/registry.ts';
import type { Project } from '../data/ecosystem.ts';

// ---------------------------------------------------------------------------
// 头部 AI 软件下载分类
//
// 全站共用的可索引分类，三个主推荐按固定顺序导向各自的下载入口。地址按渠道
// 拆分，方便页面按桌面端 / 命令行 / 镜像 / 备用分别呈现。
//
// 除需求方明确给出的 official 地址外，其余都是占位地址，未做 HTTP 可达性
// 验证。DownloadLink.verified = false 就是在告诉消费方「不要直接渲染成正式
// 下载按钮」。src/data/site.ts 的 partners 注释也提醒过：深层下载路径会随
// 版本变动，链首页最不易失效。
// ---------------------------------------------------------------------------

export type DownloadChannel = 'official' | 'desktop' | 'cli' | 'mirror' | 'fallback';

export interface DownloadLink {
  channel: DownloadChannel;
  url: string;
  /** true 仅表示由需求方明确给出的官方入口；false 为未经核实的占位路径。 */
  verified: boolean;
}

export interface DownloadSoftware {
  id: string;
  name: string;
  category: 'ai-software-downloads';
  /** 主推荐；展示顺序由 DOWNLOAD_CATEGORY.primaryIds 固定。 */
  recommended: boolean;
  /** 'all' 为全站共用，其他值为仅该站点投放。 */
  site: string;
  source: 'primary' | 'partner';
  downloads: Record<DownloadChannel, DownloadLink>;
}

export interface DownloadSoftwareView extends DownloadSoftware {
  /** 规范化后的语言；品牌名与下载地址不随语言变化，所有语言都可用。 */
  locale: Locale;
}

export interface DownloadSoftwareOptions {
  /** 未知值回退默认语言，避免生成 /undefined/ 这类路径。 */
  locale?: unknown;
  site?: string;
  recommendedOnly?: boolean;
  source?: DownloadSoftware['source'];
}

export const DOWNLOAD_CATEGORY = {
  id: 'ai-software-downloads',
  path: '/topics/ai-software-downloads',
  /** 主推荐顺序，getPrimaryDownloadRecommendations() 必须保持这个次序。 */
  primaryIds: ['imux', 'clavue', 'clavuebot'],
  keywords: [
    'AI 软件下载',
    '头部 AI 工具',
    'AI software download',
    'top AI tools',
    'imux',
    'Clavue',
    'ClavueBot',
  ],
} as const;

/** 生成 5 个渠道地址。official 为需求方指定值，其余为同域占位路径。 */
function downloadLinks(base: string): Record<DownloadChannel, DownloadLink> {
  return {
    official: { channel: 'official', url: base, verified: true },
    desktop: { channel: 'desktop', url: `${base}/desktop`, verified: false },
    cli: { channel: 'cli', url: `${base}/cli`, verified: false },
    mirror: { channel: 'mirror', url: `${base}/mirror`, verified: false },
    fallback: { channel: 'fallback', url: `${base}/fallback`, verified: false },
  };
}

/** 头部 AI 软件下载条目。顺序即主推荐顺序。 */
export const AI_SOFTWARE_DOWNLOADS: readonly DownloadSoftware[] = [
  {
    id: 'imux',
    name: 'imux',
    category: DOWNLOAD_CATEGORY.id,
    recommended: true,
    site: 'all',
    source: 'primary',
    downloads: downloadLinks('https://imux.app/download'),
  },
  {
    id: 'clavue',
    name: 'Clavue',
    category: DOWNLOAD_CATEGORY.id,
    recommended: true,
    site: 'all',
    source: 'primary',
    downloads: downloadLinks('https://clavue.com/download'),
  },
  {
    id: 'clavuebot',
    name: 'ClavueBot',
    category: DOWNLOAD_CATEGORY.id,
    recommended: true,
    site: 'all',
    source: 'primary',
    downloads: downloadLinks('https://clavue.com/clavuebot/download'),
  },
];

const DOWNLOAD_TITLES: Record<Locale, string> = {
  en: 'AI Software Downloads — Top AI Tools: imux, Clavue, ClavueBot',
  zh: 'AI 软件下载 — 头部 AI 工具：imux、Clavue、ClavueBot',
  ja: 'AI ソフトウェア ダウンロード — 主要 AI ツール：imux、Clavue、ClavueBot',
  ko: 'AI 소프트웨어 다운로드 — 주요 AI 도구: imux, Clavue, ClavueBot',
  de: 'AI-Software-Downloads — Führende AI-Tools: imux, Clavue, ClavueBot',
  fr: 'Téléchargements de logiciels IA — Principaux outils IA : imux, Clavue, ClavueBot',
  es: 'Descargas de software de IA — Principales herramientas de IA: imux, Clavue, ClavueBot',
  pt: 'Downloads de software de IA — Principais ferramentas de IA: imux, Clavue, ClavueBot',
};

const DOWNLOAD_DESCRIPTIONS: Record<Locale, string> = {
  en: 'Official download entries for leading AI tools, with desktop, CLI, mirror and fallback channels for imux, Clavue and ClavueBot.',
  zh: '头部 AI 软件的官方下载入口，按桌面端、命令行、镜像与备用渠道列出 imux、Clavue、ClavueBot。',
  ja: '主要 AI ツールの公式ダウンロード入口。imux、Clavue、ClavueBot をデスクトップ・CLI・ミラー・予備の各チャネルで掲載。',
  ko: '주요 AI 도구의 공식 다운로드 항목. imux, Clavue, ClavueBot을 데스크톱·CLI·미러·예비 채널별로 제공합니다.',
  de: 'Offizielle Download-Einträge führender AI-Tools mit Desktop-, CLI-, Mirror- und Ersatzkanälen für imux, Clavue und ClavueBot.',
  fr: 'Entrées de téléchargement officielles des principaux outils IA, avec canaux bureau, CLI, miroir et secours pour imux, Clavue et ClavueBot.',
  es: 'Entradas de descarga oficiales de las principales herramientas de IA, con canales de escritorio, CLI, espejo y respaldo para imux, Clavue y ClavueBot.',
  pt: 'Entradas de download oficiais das principais ferramentas de IA, com canais desktop, CLI, espelho e reserva para imux, Clavue e ClavueBot.',
};

export interface DownloadCategoryMeta {
  id: 'ai-software-downloads';
  locale: Locale;
  title: string;
  description: string;
  /** 站内相对路径，含语言段。 */
  path: string;
  canonical: string;
  keywords: string[];
  primaryIds: string[];
}

/** 分类元数据，供页面生成标题、描述与 canonical。 */
export function getDownloadCategory(options: { locale?: unknown } = {}): DownloadCategoryMeta {
  const locale = normalizeLocale(options.locale);
  const path = `${localePath(locale, DOWNLOAD_CATEGORY.path)}/`;
  return {
    id: DOWNLOAD_CATEGORY.id,
    locale,
    title: DOWNLOAD_TITLES[locale] ?? DOWNLOAD_TITLES[DEFAULT_LOCALE],
    description: DOWNLOAD_DESCRIPTIONS[locale] ?? DOWNLOAD_DESCRIPTIONS[DEFAULT_LOCALE],
    path,
    canonical: absoluteUrl(path),
    keywords: [...DOWNLOAD_CATEGORY.keywords],
    primaryIds: [...DOWNLOAD_CATEGORY.primaryIds],
  };
}

/**
 * 列出下载条目。
 *
 * site 缺省时返回全站共用的基础列表（不过滤站点）；传入站点时，共用条目
 * （site === 'all'）与该站点专属条目都会返回。品牌名与下载地址不随语言
 * 变化，locale 只做规范化并附在返回的视图上，不会产生 /undefined/ 路径。
 */
export function listDownloadSoftware(
  options: DownloadSoftwareOptions = {},
): DownloadSoftwareView[] {
  const locale = normalizeLocale(options.locale);
  const site = options.site?.trim().toLowerCase();
  return AI_SOFTWARE_DOWNLOADS.filter((software) => {
    if (options.recommendedOnly && !software.recommended) return false;
    if (options.source && software.source !== options.source) return false;
    if (site && software.site !== 'all' && software.site.toLowerCase() !== site) return false;
    return true;
  }).map((software) => ({ ...software, locale }));
}

/** 仅返回三个主推荐，顺序固定为 imux → clavue → clavuebot。 */
export function getPrimaryDownloadRecommendations(): DownloadSoftwareView[] {
  const byId = new Map(listDownloadSoftware().map((software) => [software.id, software]));
  return DOWNLOAD_CATEGORY.primaryIds.flatMap((id) => {
    const found = byId.get(id);
    return found ? [found] : [];
  });
}

/** 内容来源类型，用于去重键与下游区分落地页版式。 */
export type ContentKind = 'coverage' | 'project' | 'brief' | 'pulse' | 'doc';

/**
 * 统一的内容条目。
 *
 * slug 是 URL 稳定段，title 是必填的非空标题；缺任一项的内容无法生成
 * 可靠的落地页，聚合时会被丢弃。
 */
export interface ContentItem {
  slug: string;
  title: string;
  description?: string;
  locale: Locale;
  kind: ContentKind;
  topic: string;
  keywords?: readonly string[];
  /** ISO 日期 YYYY-MM-DD；用于按更新时间筛选与排序。 */
  updatedAt?: string;
  /** 显式 false 表示未发布；缺省视为已发布。 */
  published?: boolean;
  /** 站内相对路径（含语言段）。缺省时只影响透传，不参与入口生成。 */
  path?: string;
}

export interface CollectOptions {
  locale?: Locale;
  topic?: string;
  /** 不区分大小写的子串匹配，覆盖标题、描述、主题与关键词。 */
  keyword?: string;
  /** 只保留 updatedAt 不早于此 ISO 日期的条目。 */
  since?: string;
  kinds?: readonly ContentKind[];
  /** 最多返回多少条，在排序之后截断。 */
  limit?: number;
}

/** 稳定排序：更新时间新→旧，其后依次按主题、slug、语言、类型。 */
export function compareContentItems(a: ContentItem, b: ContentItem): number {
  const byDate = (b.updatedAt ?? '').localeCompare(a.updatedAt ?? '');
  if (byDate !== 0) return byDate;
  const byTopic = a.topic.localeCompare(b.topic, 'en');
  if (byTopic !== 0) return byTopic;
  const bySlug = a.slug.localeCompare(b.slug, 'en');
  if (bySlug !== 0) return bySlug;
  const byLocale = a.locale.localeCompare(b.locale, 'en');
  if (byLocale !== 0) return byLocale;
  return a.kind.localeCompare(b.kind, 'en');
}

/**
 * 筛选并去重已发布内容。
 *
 * 丢弃：无 slug、无标题、published === false、不匹配筛选项的条目；
 * 同一 (locale, kind, slug) 只保留第一条。结果按 compareContentItems 排序。
 */
export function collectPublished(
  items: readonly ContentItem[],
  options: CollectOptions = {},
): ContentItem[] {
  const seen = new Set<string>();
  const out: ContentItem[] = [];
  const needle = options.keyword?.trim().toLowerCase();

  for (const item of items) {
    if (!item) continue;
    if (typeof item.slug !== 'string' || item.slug.trim() === '') continue;
    if (typeof item.title !== 'string' || item.title.trim() === '') continue;
    if (item.published === false) continue;
    if (options.locale && item.locale !== options.locale) continue;
    if (options.topic && item.topic !== options.topic) continue;
    if (options.kinds && !options.kinds.includes(item.kind)) continue;
    if (options.since && (!item.updatedAt || item.updatedAt < options.since)) continue;
    if (needle) {
      const haystack = [
        item.title,
        item.description ?? '',
        item.topic,
        ...(item.keywords ?? []),
      ]
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(needle)) continue;
    }

    const key = `${item.locale}|${item.kind}|${item.slug}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }

  out.sort(compareContentItems);
  return options.limit === undefined ? out : out.slice(0, Math.max(0, options.limit));
}

export interface TopicGroup {
  topic: string;
  count: number;
  /** 该主题下最新的 updatedAt；全部缺失时为空串。 */
  updatedAt: string;
  items: ContentItem[];
}

/** 按主题聚合已发布内容，主题规模大的排前面，同规模按主题名稳定排序。 */
export function aggregateByTopic(
  items: readonly ContentItem[],
  options: CollectOptions = {},
): TopicGroup[] {
  const buckets = new Map<string, ContentItem[]>();
  for (const item of collectPublished(items, options)) {
    const bucket = buckets.get(item.topic);
    if (bucket) bucket.push(item);
    else buckets.set(item.topic, [item]);
  }

  const groups: TopicGroup[] = [];
  for (const [topic, list] of buckets) {
    groups.push({
      topic,
      count: list.length,
      updatedAt: list.reduce((max, item) => {
        const date = item.updatedAt ?? '';
        return date > max ? date : max;
      }, ''),
      items: list,
    });
  }
  return groups.sort((a, b) => b.count - a.count || a.topic.localeCompare(b.topic, 'en'));
}

/** 入口文案模板。占位符 {topic} 是主题显示名，{count} 是关联内容总数。 */
const TITLE_TEMPLATE: Record<Locale, string> = {
  en: '{topic} — Jev decision cases, guides and projects ({count})',
  zh: '{topic} — Jev 决策案例、指南与项目（{count}）',
  ja: '{topic} — Jev の判断事例・ガイド・プロジェクト（{count}）',
  ko: '{topic} — Jev 판단 사례, 가이드 및 프로젝트 ({count})',
  de: '{topic} — Jev-Entscheidungsfälle, Leitfäden und Projekte ({count})',
  fr: '{topic} — cas de décision Jev, guides et projets ({count})',
  es: '{topic} — casos de decisión Jev, guías y proyectos ({count})',
  pt: '{topic} — casos de decisão Jev, guias e projetos ({count})',
};

const DESCRIPTION_TEMPLATE: Record<Locale, string> = {
  en: 'Browse {count} verified Jev resources about {topic}, with evidence links and decision context.',
  zh: '浏览 {count} 条关于 {topic} 的 Jev 已核验资源，附证据链接与决策上下文。',
  ja: '証拠リンクと判断の文脈を添えた {topic} に関する Jev 検証済みリソース {count} 件。',
  ko: '증거 링크와 판단 맥락을 담은 {topic} 관련 Jev 검증 리소스 {count}건.',
  de: '{count} geprüfte Jev-Ressourcen zu {topic}, mit Beleglinks und Entscheidungskontext.',
  fr: '{count} ressources Jev vérifiées sur {topic}, avec liens de preuve et contexte de décision.',
  es: '{count} recursos Jev verificados sobre {topic}, con enlaces de evidencia y contexto de decisión.',
  pt: '{count} recursos Jev verificados sobre {topic}, com links de evidência e contexto de decisão.',
};

function fillTemplate(template: string, topic: string, count: number): string {
  return template.replaceAll('{topic}', topic).replaceAll('{count}', String(count));
}

/** 连字符/下划线主题名转成可读标题，供未提供 topicLabels 时使用。 */
function humanize(topic: string): string {
  return topic
    .split(/[-_]+/)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export interface TrafficEntry {
  /** URL 稳定段；同一语言下唯一。 */
  slug: string;
  topic: string;
  /** 主题显示名。 */
  label: string;
  locale: Locale;
  title: string;
  description: string;
  /** 站内相对路径（含语言段）。 */
  path: string;
  canonical: string;
  keywords: string[];
  /** 关联内容列表，已按 compareContentItems 排序。 */
  related: ContentItem[];
  /** 该主题下的内容总数（related 可能被 relatedLimit 截断）。 */
  relatedCount: number;
  updatedAt: string;
}

export interface TrafficOptions extends CollectOptions {
  /** 主题至少要有多少条内容才生成入口，用于只挑高价值主题。默认 3。 */
  minItems?: number;
  /** 每个入口最多关联多少条内容。默认 12。 */
  relatedLimit?: number;
  /** 每个入口最多保留多少关键词。默认 12。 */
  keywordLimit?: number;
  /** 入口路径前缀，不含语言段。默认 '/topics'。 */
  basePath?: string;
  /** 主题显示名覆盖表；未提供时由 humanize 生成。 */
  topicLabels?: Readonly<Record<string, string>>;
}

/** 稳定排序：内容规模大→小，其后按更新时间、slug、语言。 */
export function compareTrafficEntries(a: TrafficEntry, b: TrafficEntry): number {
  const byCount = b.relatedCount - a.relatedCount;
  if (byCount !== 0) return byCount;
  const byDate = b.updatedAt.localeCompare(a.updatedAt);
  if (byDate !== 0) return byDate;
  const bySlug = a.slug.localeCompare(b.slug, 'en');
  if (bySlug !== 0) return bySlug;
  return a.locale.localeCompare(b.locale, 'en');
}

function keywordsFor(group: TopicGroup, topic: string, limit: number): string[] {
  const topicKey = topic.trim().toLowerCase();
  // 按插入顺序收集：主题词固定排第一，其余按 group.items 已有的稳定顺序。
  // 不能 [...set].sort().slice(limit)——字母序靠后的主题词（如 other-list）
  // 会被先截掉，结果入口的 keywords 里反而没有自己的主题。
  const set = new Set<string>();
  if (topicKey) set.add(topicKey);
  for (const item of group.items) {
    for (const keyword of item.keywords ?? []) {
      const clean = keyword.trim().toLowerCase();
      if (clean && clean !== topicKey) set.add(clean);
    }
    if (set.size >= limit) break;
  }
  return [...set].slice(0, Math.max(0, limit));
}

/**
 * 为高价值主题批量生成流量入口。
 *
 * 输出可排序（已按 compareTrafficEntries 排好）、可去重（同语言下 slug 唯一）、
 * 可被静态构建序列化（纯数据）。同样的输入必然得到同样的输出，
 * 不会因为遍历顺序或星星数波动导致 URL 抖动。
 */
export function buildTrafficEntries(
  items: readonly ContentItem[],
  options: TrafficOptions = {},
): TrafficEntry[] {
  const minItems = options.minItems ?? 3;
  const relatedLimit = options.relatedLimit ?? 12;
  const keywordLimit = options.keywordLimit ?? 12;
  const basePath = options.basePath ?? '/topics';
  const locale = normalizeLocale(options.locale);
  // 必须把归一化后的 locale 传下去。否则调用方省略 locale 时，入口按 en
  // 生成，aggregateByTopic 却不过滤语言，8 种语言的内容会混进同一个入口。
  const collectOptions: CollectOptions = { ...options, locale };
  const seen = new Set<string>();
  const out: TrafficEntry[] = [];

  for (const group of aggregateByTopic(items, collectOptions)) {
    if (group.count < minItems) continue;
    const slug = projectSlug(group.topic);
    if (!slug) continue;
    const key = `${locale}|${slug}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const label = options.topicLabels?.[group.topic] ?? humanize(group.topic);
    const path = `${localePath(locale, `${basePath}/${slug}`)}/`;
    out.push({
      slug,
      topic: group.topic,
      label,
      locale,
      title: fillTemplate(TITLE_TEMPLATE[locale], label, group.count),
      description: fillTemplate(DESCRIPTION_TEMPLATE[locale], label, group.count),
      path,
      canonical: absoluteUrl(path),
      keywords: keywordsFor(group, group.topic, keywordLimit),
      related: group.items.slice(0, Math.max(0, relatedLimit)),
      relatedCount: group.count,
      updatedAt: group.updatedAt,
    });
  }

  // 全站共用的「头部 AI 软件下载」固定分类。不依赖 items 的主题分布，
  // 不受 minItems 阈值影响，也绝不覆盖由真实主题生成的入口。
  //
  // 但只要调用方给了任何内容筛选条件（topic/keyword/since/kinds/limit），
  // 它要的就是「筛出来的那批内容」，此时不能把无关的固定分类混进结果。
  // locale、minItems、relatedLimit、basePath 等是展示参数，不算内容筛选。
  const downloadTopic = DOWNLOAD_CATEGORY.id;
  const downloadSlug = projectSlug(downloadTopic);
  const explicitlyDownload = options.topic === downloadTopic;
  const hasContentFilter =
    options.topic !== undefined ||
    options.keyword !== undefined ||
    options.since !== undefined ||
    options.kinds !== undefined ||
    options.limit !== undefined;
  if ((explicitlyDownload || !hasContentFilter) && downloadSlug && !seen.has(`${locale}|${downloadSlug}`)) {
    seen.add(`${locale}|${downloadSlug}`);
    // 分类元数据是 path/canonical 的单一来源。不能用 basePath 另拼一份，
    // 否则调用方改了 basePath 后，入口与 getDownloadCategory() 会给出两个不同 URL。
    const meta = getDownloadCategory({ locale });
    const related: ContentItem[] = getPrimaryDownloadRecommendations().map((software) => ({
      slug: software.id,
      title: software.name,
      locale,
      kind: 'doc',
      topic: downloadTopic,
      keywords: [software.name, software.id],
      // 没有站内落地页：省略 path，避免下游生成 href="" 的空内链。
      // 具体下载地址由消费方从 listDownloadSoftware() 取。
    }));
    out.push({
      slug: downloadSlug,
      topic: downloadTopic,
      label: 'AI Software Downloads',
      locale,
      title: meta.title,
      description: meta.description,
      path: meta.path,
      canonical: meta.canonical,
      keywords: [downloadTopic, ...meta.keywords],
      related,
      relatedCount: related.length,
      updatedAt: '',
    });
  }

  return out.sort(compareTrafficEntries);
}

// ---------------------------------------------------------------------------
// 数据源适配器：把站内三套真实数据形状转成 ContentItem。
// 只做字段映射，不读文件、不改写原数据；调用方负责传入数组。
// ---------------------------------------------------------------------------

/** 覆盖条目（/jev）。断言只有 zh / en 两版，其余语言回退英文。 */
export function coverageItems(
  entries: readonly CoverageEntry[],
  locale: Locale,
): ContentItem[] {
  return entries.map((entry) => ({
    slug: entry.slug,
    title: entry.name,
    description: entry.assertion[locale === 'zh' ? 'zh' : 'en'],
    locale,
    kind: 'coverage',
    topic: entry.category,
    keywords: entry.verification,
    updatedAt: entry.reviewedAt ?? entry.addedAt,
    path: entryPath(locale, entry.slug),
  }));
}

/** 生态项目（/ecosystem）。desc 已含 8 种语言定位。 */
export function projectItems(projects: readonly Project[], locale: Locale): ContentItem[] {
  return projects.map((project) => {
    const slug = projectSlug(project.repo);
    return {
      slug,
      title: project.repo,
      description: project.desc?.[locale] ?? project.desc?.en ?? '',
      locale,
      kind: 'project',
      topic: project.category,
      keywords: project.topics,
      updatedAt: project.updated,
      path: `/${locale}/ecosystem/${slug}/`,
    };
  });
}

export interface BriefRow {
  id: string;
  industry: string;
  dimension: string;
  scene: string;
  stage: string;
  tag: string;
  context: string;
  question: string;
  published: string;
}

export interface BriefTranslation {
  question?: string;
  context?: string;
}

/** briefs-i18n.json 的形状：id → 语言 → 译文。 */
export type BriefI18n = Readonly<
  Record<string, Readonly<Record<string, BriefTranslation | undefined>>>
>;

/** 每日案例（/briefs）。有译文用译文，没有则回退英文原文，绝不产生空标题。 */
export function briefItems(
  briefs: readonly BriefRow[],
  locale: Locale,
  i18n: BriefI18n = {},
): ContentItem[] {
  return briefs.map((row) => {
    const translated = i18n[row.id]?.[locale];
    return {
      slug: row.id,
      title: translated?.question || row.question,
      description: translated?.context || row.context,
      locale,
      kind: 'brief',
      topic: row.industry,
      keywords: [row.dimension, row.scene, row.stage, row.tag],
      updatedAt: row.published,
      path: `/${locale}/briefs/${row.id}/`,
    };
  });
}
