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
  ecosystem: { en: 'Ecosystem projects', zh: '生态项目', ja: 'エコシステムのプロジェクト', ko: '생태계 프로젝트', de: 'Ökosystem-Projekte', fr: 'Projets de l\u2019écosystème', es: 'Proyectos del ecosistema', pt: 'Projetos do ecossistema' },
  categories: { en: 'Ecosystem categories', zh: '生态分类', ja: 'エコシステムのカテゴリ', ko: '생태계 카테고리', de: 'Ökosystem-Kategorien', fr: 'Catégories de l\u2019écosystème', es: 'Categorías del ecosistema', pt: 'Categorias do ecossistema' },
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
export function buildLlmsTxt({ briefs, briefMap, terms, docsByLang = {}, ecosystem = null, perLang = 6, docsPerLang = 12, ecosystemPerLang = 12 }) {
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
    'Machine-readable: /sitemap-index.xml, /robots.txt, /llms.txt (this file), /llms-full.txt (complete text corpus), /rss.xml (daily cases feed).',
    '',
    '## Key facts',
    '',
    '- Product: JevCode, a hosted API and web console for the `clavue-jev` model.',
    '- Model served: `clavue-jev` only. The comparison pages query `jev-1.13.0` as a peer baseline.',
    '- Pricing: $0.042 per 1 million input tokens; output tokens are free. Billing is usage-based, no subscription.',
    '- Signup credit: $5 in API credit, drawn at the same token rate, granted only after a successful call.',
    '- Anonymous use: the browser playground allows 20 anonymous requests per IP per hour, not billed.',
    `- Daily cases: ${briefs.length} published case pages, each a single structured-judgment task.`,
    `- Documentation: ${docsByLang.en?.length ?? 0} English docs across concepts, patterns, primitives, SDK and cases.`,
    ecosystem ? `- Ecosystem: ${ecosystem.projects.length} tracked open-source projects in ${ecosystem.categories.length} categories.` : null,
    `- Languages: ${LANGS.length} locales (${LANGS.map((l) => l.code).join(', ')}), each under /{locale}/.`,
    '- Content policy: a translated page is indexable only when its body is actually translated; the sitemap follows the same rule.',
    '',
    '## Product pages (English)',
    '',
    '- [Try it](https://www.jevcode.ai/en/try/): run a judgment in the browser.',
    '- [Playground](https://www.jevcode.ai/en/playground/): live console with the anonymous quota.',
    '- [Pricing](https://www.jevcode.ai/en/pricing/): token pricing, signup credit and billing rules.',
    '- [API](https://www.jevcode.ai/en/api/): HTTP reference for the judgment endpoint.',
    '- [Coverage lab](https://www.jevcode.ai/en/lab/): accuracy measurements over the case corpus.',
    '- [Compare](https://www.jevcode.ai/en/compare/): side-by-side `clavue-jev` vs `jev-1.13.0`.',
    '- [Daily cases](https://www.jevcode.ai/en/briefs/): the full case index.',
    '- [Ecosystem](https://www.jevcode.ai/en/ecosystem/): tracked projects and categories.',
    '- [Community](https://www.jevcode.ai/en/community/): public build log and discussions.',
    '- [Scenes](https://www.jevcode.ai/en/scenes/): worked examples of judgment tasks.',
    '- [Builds](https://www.jevcode.ai/en/builds/): release notes and build history.',
    '- [Map](https://www.jevcode.ai/en/map/): site directory of every indexable section.',
    '',
    'Every product page above also exists at /zh/, /ja/, /ko/, /de/, /fr/, /es/ and /pt/.',
    '',
  ].filter((line) => line !== null);

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

    // 生态实体页：每个项目 8 语言都有，无需按语言门控。
    if (ecosystem) {
      lines.push(`### ${pick('categories', code)}`, '');
      for (const c of ecosystem.categories) {
        lines.push(`- [${c.title[code] ?? c.title.en}](${SITE}/${code}/ecosystem/category/${c.key}/): ${c.count} projects`);
      }
      lines.push('');

      lines.push(`### ${pick('ecosystem', code)} (${ecosystem.projects.length})`, '');
      for (const p of ecosystem.projects.slice(0, ecosystemPerLang)) {
        const desc = p.desc[code] ?? p.desc.en;
        lines.push(`- [${p.repo}](${SITE}/${code}/ecosystem/${p.slug}/): ${desc}`);
      }
      lines.push(`- All ${ecosystem.projects.length} projects: ${SITE}/${code}/ecosystem/`);
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
        // 去掉 frontmatter，只留正文供 llms-full.txt 使用
        const body = raw.replace(/^---\n[\s\S]*?\n---\n/, '');
        found.push({ slug, title, section: dirSlug || 'root', body });
      }
    };
    walk(path.join(docsRoot, lang));
    found.sort((a, b) => a.slug.localeCompare(b.slug));
    out[lang] = found;
  }
  return out;
}

/** 组装页面数据。 */
/** 生态清单。src/data/ecosystem.ts 是唯一真源，避免 llms.txt 与页面不一致。 */
export async function loadEcosystem() {
  const { projects, categories } = await import('../src/data/ecosystem.ts');
  const { projectSlug } = await import('../src/lib/slug.ts');
  const counts = new Map();
  for (const p of projects) counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
  return {
    categories: categories.map((c) => ({ ...c, count: counts.get(c.key) ?? 0 })),
    projects: [...projects]
      .sort((a, b) => b.stars - a.stars)
      .map((p) => ({ ...p, slug: projectSlug(p.repo) })),
  };
}

export async function loadInputs() {
  const briefs = readJson('src/data/daily-briefs.json', []);
  const briefMap = readJson('src/data/briefs-i18n.json', {});
  const terms = readJson('src/data/brief-terms.json', {});
  const docsByLang = loadDocs();
  const ecosystem = await loadEcosystem();
  return { briefs, briefMap, terms, docsByLang, ecosystem };
}

/**
 * 生成 llms-full.txt：把站点全部可检索正文拼成单个纯文本。
 *
 * 与 llms.txt 的分工：llms.txt 是索引（只给链接，控制在几十 KB），
 * llms-full.txt 是全量正文，供 AI 一次性抓取，不必逐页爬 6000+ 个 URL。
 * 内容全部取自与页面同一份数据源，所以不会与站点漂移。
 */
export function buildLlmsFullTxt(inputs, { maxBriefs = 500, maxDocs = 60, maxCodeLines = 12 } = {}) {
  const { briefs, briefMap, docsByLang = {}, ecosystem = null } = inputs;
  const out = [];
  const push = (...lines) => out.push(...lines);

  /**
   * 压缩代码块：只留前若干行 + 省略标记。
   * 文档正文 677 KB 里有 628 个代码块，是全量文本的主要膨胀源，
   * 而 AI 检索需要的是论断与结论，不是完整示例代码。
   */
  const trimCode = (body) =>
    body.replace(/```([^\n]*)\n([\s\S]*?)```/g, (_, info, code) => {
      const lines = code.replace(/\n$/, '').split('\n');
      if (lines.length <= maxCodeLines) return `\`\`\`${info}\n${code}\`\`\``;
      return `\`\`\`${info}\n${lines.slice(0, maxCodeLines).join('\n')}\n… (${lines.length - maxCodeLines} more lines)\n\`\`\``;
    });

  push(
    '# JevCode — full text',
    '',
    '> Complete text corpus of https://www.jevcode.ai, for retrieval by AI assistants.',
    '> Every section below mirrors a live page. Generated from the same data files that build the site.',
    '',
    `Generated: ${new Date().toISOString().slice(0, 10)}`,
    '',
  );

  // ---- 文档正文（仅英文）----
  // 8 种语言全并入会到 5.9 MB，超出 AI 一次性读取的实用体积。
  // 译文页在 llms.txt 里各有索引，需要时按 URL 取；这里只放英文全集。
  const enDocs = docsByLang.en ?? [];
  if (enDocs.length) {
    push('# Docs (en)', '');
    for (const doc of enDocs.slice(0, maxDocs)) {
      const body = trimCode((doc.body ?? '').trim());
      if (!body) continue;
      push(
        `## ${doc.title}`,
        `URL: ${SITE}/en/${doc.slug}/`,
        '',
        body,
        '',
      );
    }
  }

  // ---- 生态实体 ----
  if (ecosystem) {
    push('# Ecosystem projects (en summaries)', '');
    for (const p of ecosystem.projects) {
      const desc = p.desc.en ?? '';
      push(
        `## ${p.repo}`,
        `URL: ${SITE}/en/ecosystem/${p.slug}/`,
        `Category: ${p.category} | Language: ${p.language ?? 'unknown'} | License: ${p.license ?? 'unknown'} | Stars: ${p.stars} | Forks: ${p.forks}`,
        '',
        desc,
        '',
      );
    }
    push('# Ecosystem categories', '');
    for (const c of ecosystem.categories) {
      push(`## ${c.title.en}`, `URL: ${SITE}/en/ecosystem/category/${c.key}/`, `${c.count} projects.`, '', c.lead?.en ?? '', '');
    }
  }

  // ---- 每日案例 ----
  push('# Daily judgment cases', '');
  for (const b of briefs.slice(0, maxBriefs)) {
    const tr = briefMap[b.id]?.en ?? {};
    const question = tr.question ?? b.question;
    const context = tr.context ?? b.context;
    push(
      `## ${question}`,
      `URL: ${SITE}/en/briefs/${b.id}/`,
      `Industry: ${b.industry} | Dimension: ${b.dimension} | Scene: ${b.scene} | Published: ${b.published}`,
      '',
      `Context: ${context}`,
      `Choices: ${(b.choices ?? []).join(' / ')}`,
      `Accepted: ${(b.accept ?? []).join(' / ')}`,
      '',
    );
  }

  return `${out.join('\n').replace(/\n{3,}/g, '\n\n').trim()}\n`;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const inputs = await loadInputs();
  const text = buildLlmsTxt(inputs);
  const out = path.join(repoRoot, 'public/llms.txt');
  mkdirSync(path.dirname(out), { recursive: true });
  writeFileSync(out, text, 'utf8');
  console.log(`llms.txt: ${text.split('\n').length} lines -> public/llms.txt`);

  const full = buildLlmsFullTxt(inputs);
  const fullOut = path.join(repoRoot, 'public/llms-full.txt');
  writeFileSync(fullOut, full, 'utf8');
  console.log(`llms-full.txt: ${(full.length / 1024).toFixed(0)} KB -> public/llms-full.txt`);
}
