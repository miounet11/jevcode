/**
 * 生成 public/llms.txt。
 *
 * 借 yyds-bot 的 AI 可用性支柱：让 agent 直接读到站点结构与内容规模，
 * 不必先爬 HTML 再猜。这里只写「可索引」的东西——简报条目必须该语言
 * 真有译文才列，否则等于把 noindex 页面推荐给模型。
 *
 * 用法：node scripts/generate-llms-txt.mjs
 * 产物：public/llms.txt（构建时随 public/ 原样进 dist/）
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync } from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(import.meta.dirname, '..');
const SITE = 'https://www.jevcode.ai';

/** 语言与自述文案。顺序即 llms.txt 里的区块顺序。 */
export const LANGS = [
  { code: 'en', label: 'English', intro: 'The home of Jev. Concepts, patterns, SDKs, the coverage lab and daily cases.' },
  { code: 'zh', label: '简体中文', intro: 'Jev 的主场：概念、模式、SDK、覆盖实验与每日案例。' },
  { code: 'ja', label: '日本語', intro: 'Jev の本拠。概念、パターン、SDK、カバレッジ実験、毎日の事例。' },
  { code: 'ko', label: '한국어', intro: 'Jev의 본거지. 개념, 패턴, SDK, 커버리지 실험, 매일의 사례.' },
  { code: 'de', label: 'Deutsch', intro: 'Das Zuhause von Jev. Konzepte, Muster, SDKs, Abdeckungslabor und tägliche Fälle.' },
  { code: 'fr', label: 'Français', intro: 'Le foyer de Jev. Concepts, motifs, SDK, laboratoire de couverture et cas quotidiens.' },
  { code: 'es', label: 'Español', intro: 'El hogar de Jev. Conceptos, patrones, SDK, laboratorio de cobertura y casos diarios.' },
  { code: 'pt', label: 'Português', intro: 'A casa do Jev. Conceitos, padrões, SDKs, laboratório de cobertura e casos diários.' },
];

/** 每语言都会提供的固定入口页，名称按语言。 */
const SECTIONS = {
  docs: { en: 'Docs', zh: '文档', ja: 'ドキュメント', ko: '문서', de: 'Dokumentation', fr: 'Documentation', es: 'Documentación', pt: 'Documentação' },
  briefs: { en: 'Daily cases', zh: '每日案例', ja: '毎日の事例', ko: '매일의 사례', de: 'Tägliche Fälle', fr: 'Cas du jour', es: 'Casos diarios', pt: 'Casos diários' },
  concepts: { en: 'Concepts', zh: '概念', ja: '概念', ko: '개념', de: 'Konzepte', fr: 'Concepts', es: 'Conceptos', pt: 'Conceitos' },
  patterns: { en: 'Patterns', zh: '模式', ja: 'パターン', ko: '패턴', de: 'Muster', fr: 'Motifs', es: 'Patrones', pt: 'Padrões' },
  sdk: { en: 'SDK', zh: 'SDK', ja: 'SDK', ko: 'SDK', de: 'SDK', fr: 'SDK', es: 'SDK', pt: 'SDK' },
  lab: { en: 'Coverage lab', zh: '覆盖实验', ja: 'カバレッジ実験', ko: '커버리지 실험', de: 'Abdeckungslabor', fr: 'Laboratoire de couverture', es: 'Laboratorio de cobertura', pt: 'Laboratório de cobertura' },
  compare: { en: 'Compare with jev-1.13.0', zh: '与 jev-1.13.0 对照', ja: 'jev-1.13.0 との比較', ko: 'jev-1.13.0과 비교', de: 'Vergleich mit jev-1.13.0', fr: 'Comparer avec jev-1.13.0', es: 'Comparar con jev-1.13.0', pt: 'Comparar com jev-1.13.0' },
};

const pick = (field, lang) => SECTIONS[field][lang] ?? SECTIONS[field].en;

function readJson(rel, fallback) {
  try {
    return JSON.parse(readFileSync(path.join(repoRoot, rel), 'utf8'));
  } catch {
    return fallback;
  }
}

/**
 * 纯函数：根据数据算出 llms.txt 正文。
 * @param {object} input
 * @param {Array<{id:string,published:string,dimension:string,question:string,industry:string}>} input.briefs
 * @param {Record<string, Record<string, {context?:string, question?:string}>>} input.briefMap
 * @param {Record<string, Record<string, Record<string,string>>>} input.terms
 * @param {number} [input.perLang] 每语言列出的代表性案例数
 */
export function buildLlmsTxt({ briefs, briefMap, terms, docsByLang = {}, perLang = 6, docsPerLang = 12 }) {
  const localizedLangs = new Set(
    Object.values(terms.industry ?? {}).flatMap((slugs) => Object.keys(slugs)),
  );
  const newest = [...briefs].sort((a, b) => String(b.published).localeCompare(String(a.published)));

  const lines = [
    '# JevCode',
    '',
    '> JevCode is the home of Jev — the model is `clavue-jev`. The site publishes concepts,',
    '> patterns, SDK references, a coverage lab and at least 50 new daily cases every day.',
    '> Every page exists in up to 8 languages; a translated page is indexable only when its',
    '> body is actually translated, and the sitemap follows the same rule.',
    '',
    'Canonical host: https://www.jevcode.ai — one host only, no aliases are indexed.',
    'Machine-readable: /sitemap-index.xml, /robots.txt, /llms.txt (this file).',
    '',
  ];

  for (const { code, label, intro } of LANGS) {
    const localized = code === 'en' || code === 'zh' || localizedLangs.has(code);
    const translated = code === 'en' || code === 'zh'
      ? briefs.length
      : newest.filter((row) => briefMap[row?.id]?.[code]?.context).length;

    lines.push(`## ${label} (/${code}/)`, '', intro, '');
    lines.push(`- Cases in this language: ${translated} of ${briefs.length}`);
    lines.push('');

    lines.push(`### ${pick('docs', code)}`, '');
    // 只列真实存在列表页的章节：concepts/ 与 cases/ 是纯目录，没有 index.md，
    // 指向它们会得到 404。这类断链由 check-seo 的 llms.txt 校验兜住。
    for (const section of ['patterns', 'sdk', 'lab', 'compare']) {
      lines.push(`- [${pick(section, code)}](${SITE}/${code}/${section}/)`);
    }
    lines.push('');

    lines.push(`### ${pick('briefs', code)}`, '');
    lines.push(`- [${pick('briefs', code)}](${SITE}/${code}/briefs/): all ${translated} published cases`);
    // 只列真的有译文的条目；没译文的页面是 noindex，推荐给模型等于自相矛盾。
    const sample = localized
      ? newest.filter((row) => code === 'en' || code === 'zh' || briefMap[row?.id]?.[code]?.context).slice(0, perLang)
      : newest.slice(0, perLang);
    for (const row of sample) {
      const heading = [row.industry, row.dimension].filter(Boolean).join(' · ');
      lines.push(`- [${heading}](${SITE}/${code}/briefs/${row.id}/): ${String(row.published)}`);
    }
    lines.push('');

    // 文档（cases/concepts/patterns/primitives/sdk）。只列该语言自己有的条目：
    // 缺内容时会回退渲染英文原文并标 canonical 到 /en/，那类页面是 noindex。
    const docs = (docsByLang[code] ?? []).slice(0, docsPerLang);
    if (docs.length) {
      lines.push(`### ${pick('docs', code)} (${code === 'en' ? docsByLang[code]?.length ?? 0 : docs.length} of ${docsByLang.en?.length ?? 0})`, '');
      for (const doc of docs) lines.push(`- [${doc.title}](${SITE}/${code}/${doc.slug}/)`);
      lines.push('');
    }
  }

  return `${lines.join('\n').trimEnd()}\n`;
}

/**
 * 扫描 src/content/docs 下各语言的文档条目。
 * 正文里出现 `title: "..."` 就足够——这里只给人/模型看的清单，不做完整 frontmatter 解析。
 * @returns {Record<string, Array<{slug:string,title:string,section:string}>>}
 */
export function loadDocs(root = repoRoot) {
  const docsRoot = path.join(root, 'src/content/docs');
  const out = {};
  let langs = [];
  try {
    langs = readdirSync(docsRoot, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name);
  } catch {
    return out;
  }
  for (const lang of langs) {
    const found = [];
    const walk = (dir, prefix = '') => {
      for (const ent of readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, ent.name);
        if (ent.isDirectory()) {
          walk(full, `${prefix}${ent.name}/`);
          continue;
        }
        if (!ent.name.endsWith('.md')) continue;
        const raw = readFileSync(full, 'utf8');
        // draft 条目不会生成页面
        if (/^draft:\s*true\s*$/m.test(raw)) continue;
        const title = raw.match(/^title:\s*"([^"]*)"/m)?.[1] ?? raw.match(/^title:\s*(.+)$/m)?.[1]?.trim();
        if (!title) continue;
        const fileSlug = ent.name.replace(/\.md$/, '');
        const dirSlug = prefix.replace(/\/$/, '');
        // /{lang}/introduction/ 这类顶层文档没有目录前缀
        const slug = dirSlug ? `${dirSlug}/${fileSlug}` : fileSlug;
        found.push({ slug, title, section: dirSlug || 'root' });
      }
    };
    walk(path.join(docsRoot, lang));
    found.sort((a, b) => a.slug.localeCompare(b.slug));
    out[lang] = found;
  }
  return out;
}

/** 组装页面数据。 */
export function loadInputs() {
  const briefs = readJson('src/data/daily-briefs.json', []);
  const briefMap = readJson('src/data/briefs-i18n.json', {});
  const terms = readJson('src/data/brief-terms.json', {});
  const docsByLang = loadDocs();
  return { briefs, briefMap, terms, docsByLang };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const text = buildLlmsTxt(loadInputs());
  const out = path.join(repoRoot, 'public/llms.txt');
  mkdirSync(path.dirname(out), { recursive: true });
  writeFileSync(out, text, 'utf8');
  console.log(`llms.txt: ${text.split('\n').length} lines -> public/llms.txt`);
}
