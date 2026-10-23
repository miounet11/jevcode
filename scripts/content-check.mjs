#!/usr/bin/env node
/**
 * 日更内容质量校验：巡检只报「几天没更新」是不够的，还要能报
 * 「更新了但内容不合格」——空标题、标题重复、译文缺失/静默回退成英文、
 * 术语缺译名、发布时间异常。
 *
 * 用法：
 *   node scripts/content-check.mjs                 读基线，新增问题即 exit 1
 *   node scripts/content-check.mjs --json          JSON 输出（供巡检/调试）
 *   node scripts/content-check.mjs --update-baseline  收紧基线（人工确认后跑）
 *   node scripts/content-check.mjs --baseline=path    指定基线文件
 *
 * 两类问题：
 *   硬问题  数据本身坏了（空字段、重复 id/标题、译文缺失、choices 数量对不上、
 *           正文超长、日期非法或晚于今天）。任何一条都 exit 1。
 *   软问题  已知的存量缺口，用基线棘轮（ratchet）管：基线里没有的新 key 才失败，
 *           消失的 key 只提示可以把基线收紧。这样既能抓住回归，又不会因为
 *           「38 条历史术语缺译名」这种存量把门永久判红。
 *
 * 设计约束：
 *   - 只读 src/data/*.json，不写内容数据；唯一写盘是 --update-baseline。
 *   - 正文长度阈值按语言分别校准（见 BODY_LIMITS）：中文 11 字符能说完的句子，
 *     德文要 33 个字符，共用阈值必然一边误报一边漏报。数值取自 2026-10-23 的
 *     实测分布，详见常量上的注释。
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { briefHeading, hasLocalizedBrief, localizedBrief } from './lib/daily-briefs.mjs';

/** 术语表的字段维度，与 briefHeading 拼接顺序一致（stage 不参与标题但参与校验）。 */
export const TERM_FIELDS = ['industry', 'scene', 'tag', 'dimension', 'stage'];

/**
 * 各语言的正文长度阈值（按 Unicode 字符计）。
 *
 * 不能用一个全局阈值：同一句话，中文 11 个字符就说完，德文要 33 个。全局下界
 * 要么对中文太松（放过「嗯」「TODO」），要么对德文太紧（正常短句被误报）。
 *
 * 数值来自 2026-10-23 实测的 250 篇 × 8 语言分布：
 *
 *   语言   question 实测 min~max   context 实测 min~max
 *   en     29~70                   23~115
 *   zh     11~39                   10~104
 *   ja     16~39                   13~116
 *   ko     17~36                   15~134
 *   de     33~88                   30~174
 *   fr     27~85                   38~161
 *   es     33~82                   36~143
 *   pt     29~74                   34~142
 *
 * 上界取实测最大值 ×3 向上取整到十位：只拦「整段原文/整篇文档被灌进摘要」这类
 * 事故，正常写作到不了这个量级。下界取实测最小值 ×0.6 向下取整：存量一条都不会
 * 误报，但占位符必被抓住。
 *
 * 加新语言时必须同时补一行——没有阈值的语言会作为硬问题报出来，而不是悄悄套用
 * 别国阈值（那样等于没有校准）。
 */
export const BODY_LIMITS = {
  en: { question: { min: 17, max: 210 }, context: { min: 13, max: 350 } },
  zh: { question: { min: 6, max: 120 }, context: { min: 6, max: 320 } },
  ja: { question: { min: 9, max: 120 }, context: { min: 7, max: 350 } },
  ko: { question: { min: 10, max: 110 }, context: { min: 9, max: 410 } },
  de: { question: { min: 19, max: 270 }, context: { min: 18, max: 530 } },
  fr: { question: { min: 16, max: 260 }, context: { min: 22, max: 490 } },
  es: { question: { min: 19, max: 250 }, context: { min: 21, max: 430 } },
  pt: { question: { min: 17, max: 230 }, context: { min: 20, max: 430 } },
};

/** 取某语言某字段的长度阈值；语言未校准返回 null（由调用方报硬问题）。 */
export function bodyLimits(lang, field) {
  return BODY_LIMITS?.[lang]?.[field] ?? null;
}

const DEFAULT_BASELINE = fileURLToPath(new URL('./content-check-baseline.json', import.meta.url));

/**
 * 站点上「有本地化正文」的语言集合。与 [lang]/briefs.astro 的判据保持一致：
 * 该语言在术语表 industry 里有译名，才把案例列表页设为可索引。
 * zh 在表内，en 是原文，两者都算可索引。
 */
export function indexableLangs(terms) {
  const langs = new Set(Object.values(terms?.industry ?? {}).flatMap((v) => Object.keys(v)));
  return [...langs].sort();
}

const len = (s) => [...String(s ?? '')].length;

/**
 * 收集全部问题。纯函数，便于测试直接喂构造数据。
 * 返回 { hard, soft }，每项是 { kind, key, detail }。
 * key 是稳定标识：软问题靠它做棘轮，硬问题靠它去重/阅读。
 */
export function collectFindings({ briefs, i18n, terms, today = new Date() }) {
  const hard = [];
  const soft = [];
  const pushHard = (kind, key, detail) => hard.push({ kind, key, detail });
  const pushSoft = (kind, key, detail) => soft.push({ kind, key, detail });

  const seenIds = new Set();
  const usedByField = Object.fromEntries(TERM_FIELDS.map((f) => [f, new Set()]));

  for (const [index, row] of briefs.entries()) {
    const id = typeof row?.id === 'string' ? row.id.trim() : '';
    if (!id) {
      pushHard('missing-id', `row:${index}`, '条目的 id 为空');
    } else if (seenIds.has(id)) {
      pushHard('duplicate-id', `id:${id}`, `id 重复：${id}`);
    } else {
      seenIds.add(id);
    }
    const label = id || `<row ${index}>`;

    for (const field of TERM_FIELDS) {
      const slug = typeof row?.[field] === 'string' ? row[field].trim() : '';
      if (!slug) {
        pushHard('empty-field', `${label}:${field}`, `${label} 缺少 ${field}`);
        continue;
      }
      usedByField[field].add(slug);
    }

    const enLimits = bodyLimits('en', 'context');
    if (!String(row?.context ?? '').trim()) {
      pushHard('empty-source', `${label}:context`, `${label} 的英文 context 为空`);
    } else if (len(row.context) > enLimits.max) {
      pushHard(
        'source-too-long',
        `${label}:context`,
        `${label} 的英文 context 有 ${len(row.context)} 字符，超过 en 阈值 ${enLimits.max}`,
      );
    }
    const enQLimits = bodyLimits('en', 'question');
    if (!String(row?.question ?? '').trim()) {
      pushHard('empty-source', `${label}:question`, `${label} 的英文 question 为空`);
    } else if (len(row.question) > enQLimits.max) {
      pushHard(
        'source-too-long',
        `${label}:question`,
        `${label} 的英文 question 有 ${len(row.question)} 字符，超过 en 阈值 ${enQLimits.max}`,
      );
    }

    if (!Array.isArray(row?.choices) || row.choices.length < 2) {
      pushHard('bad-choices', `${label}:choices`, `${label} 的选项少于 2 个`);
    } else if (row.choices.some((c) => !String(c ?? '').trim())) {
      pushHard('bad-choices', `${label}:choices`, `${label} 的选项里有空值`);
    }

    const published = typeof row?.published === 'string' ? row.published : '';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(published)) {
      pushHard('bad-published', `${label}:published`, `${label} 的发布日期不是 YYYY-MM-DD：${published || '(空)'}`);
    } else if (Date.parse(`${published}T00:00:00Z`) > today.getTime()) {
      pushHard('future-published', `${label}:published`, `${label} 的发布日期 ${published} 晚于今天`);
    }
  }

  // ---- 术语表：用到的 slug 必须有条目（缺条目 = 硬，标题会露出裸 slug）----
  for (const field of TERM_FIELDS) {
    for (const slug of usedByField[field]) {
      if (!terms?.[field]?.[slug]) {
        pushHard('term-missing-entry', `${field}:${slug}`, `术语表 ${field} 缺少条目 ${slug}`);
      }
    }
  }

  // ---- 逐语言：标题 + 译文 ----
  const langs = ['en', ...indexableLangs(terms)];
  // 新增语言但没补阈值时必须报出来：静默跳过等于这道门对新语言完全失效。
  for (const lang of langs) {
    if (!bodyLimits(lang, 'question') || !bodyLimits(lang, 'context')) {
      pushHard('missing-limits', `lang:${lang}`, `语言 ${lang} 没有配置正文长度阈值（BODY_LIMITS）`);
    }
  }
  for (const lang of langs) {
    const titleOwner = new Map();
    for (const row of briefs) {
      const id = String(row?.id ?? '');
      const title = briefHeading(row, lang, terms).trim();
      if (!title) {
        pushHard('empty-title', `${lang}:${id}`, `${lang} 的 ${id} 标题为空`);
        continue;
      }
      if (titleOwner.has(title)) {
        pushHard(
          'duplicate-title',
          `${lang}:${title}`,
          `${lang} 的标题重复：「${title}」（${titleOwner.get(title)} 与 ${id}）`,
        );
      } else {
        titleOwner.set(title, id);
      }
    }

    if (lang === 'en') continue;

    for (const row of briefs) {
      const id = String(row?.id ?? '');
      const entry = i18n?.[id]?.[lang];
      if (!hasLocalizedBrief(id, lang, i18n)) {
        // 缺 context/question 任一项都算缺译文；页面会静默回退成英文并 noindex。
        const kind = entry ? 'partial-i18n' : 'missing-i18n';
        pushHard(kind, `${lang}:${id}`, `${lang} 的 ${id} 缺少${entry ? '完整的' : ''}译文（页面会回退英文并 noindex）`);
        continue;
      }

      if (!Array.isArray(entry.choices) || entry.choices.length !== row.choices.length) {
        pushHard(
          'choice-count',
          `${lang}:${id}`,
          `${lang} 的 ${id} 选项数 ${Array.isArray(entry.choices) ? entry.choices.length : '非数组'}，英文是 ${row.choices.length}`,
        );
      } else if (entry.choices.some((c) => !String(c ?? '').trim())) {
        pushHard('bad-choices', `${lang}:${id}:choices`, `${lang} 的 ${id} 选项里有空值`);
      }

      const view = localizedBrief(row, lang, i18n);
      // 译文与英文逐字相同 = 翻译没生效（静默回退），软问题：存量已知，靠基线管。
      if (entry.question === row.question) {
        pushSoft('identical-translation', `${lang}:${id}:question`, `${lang} 的 ${id} question 与英文完全相同`);
      }
      if (entry.context === row.context) {
        pushSoft('identical-translation', `${lang}:${id}:context`, `${lang} 的 ${id} context 与英文完全相同`);
      }

      // 长度按该语言自己的阈值判：各语言字符密度差一倍以上，共用阈值必然误判。
      for (const field of ['question', 'context']) {
        const limits = bodyLimits(lang, field);
        const chars = len(view[field]);
        if (chars < limits.min) {
          pushSoft(
            'body-too-short',
            `${lang}:${id}:${field}`,
            `${lang} 的 ${id} ${field} 只有 ${chars} 字符，低于 ${lang} 阈值 ${limits.min}`,
          );
        } else if (chars > limits.max) {
          pushSoft(
            'body-too-long',
            `${lang}:${id}:${field}`,
            `${lang} 的 ${id} ${field} 有 ${chars} 字符，超过 ${lang} 阈值 ${limits.max}`,
          );
        }
      }
    }

    // 术语有条目但缺该语译名：标题/列表会露出英文 slug。软问题，按基线棘轮。
    for (const field of TERM_FIELDS) {
      for (const slug of usedByField[field]) {
        if (!terms?.[field]?.[slug]) continue; // 缺条目已是硬问题
        const word = terms[field][slug][lang];
        if (typeof word !== 'string' || !word.trim()) {
          pushSoft('term-missing-lang', `${lang}:${field}:${slug}`, `术语 ${field}:${slug} 缺 ${lang} 译名`);
        }
      }
    }
  }

  return { hard, soft };
}

/** 读基线；不存在时返回 null（首次运行只报告，不失败）。 */
export function loadBaseline(path) {
  if (!existsSync(path)) return null;
  const raw = JSON.parse(readFileSync(path, 'utf8'));
  const keys = Array.isArray(raw?.keys) ? raw.keys : [];
  return { keys: new Set(keys.filter((k) => typeof k === 'string')), updated: raw?.updated ?? null };
}

export function writeBaseline(path, { keys, updated }) {
  const body = {
    // 软问题基线：已知的存量缺口。新增 key 即失败；修掉后可重新生成本文件收紧。
    $comment: '内容质量软问题基线，由 node scripts/content-check.mjs --update-baseline 生成',
    version: 1,
    updated,
    keys: [...new Set(keys)].sort(),
  };
  writeFileSync(path, `${JSON.stringify(body, null, 2)}\n`);
}

/** 对比基线，返回 { added, fixed }（都是 key 数组）。 */
export function diffBaseline(softKeys, baseline) {
  if (!baseline) return { added: [], fixed: [], firstRun: true };
  const now = new Set(softKeys);
  return {
    added: [...now].filter((k) => !baseline.keys.has(k)).sort(),
    fixed: [...baseline.keys].filter((k) => !now.has(k)).sort(),
    firstRun: false,
  };
}

/**
 * 汇总一次运行，返回 { ok, hard, soft, added, fixed, ... }。
 * 抽成函数是为了让测试不碰文件系统也能断言判定语义。
 */
export function evaluate({ briefs, i18n, terms, baseline, today = new Date() }) {
  const { hard, soft } = collectFindings({ briefs, i18n, terms, today });
  const softKeys = soft.map((s) => s.key);
  const { added, fixed, firstRun } = diffBaseline(softKeys, baseline);
  return {
    ok: hard.length === 0 && added.length === 0,
    hard,
    soft,
    softKeys,
    added,
    fixed,
    firstRun,
  };
}

// ---------------- CLI ----------------

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];

if (isMain) {
  const argv = process.argv.slice(2);
  const json = argv.includes('--json');
  const updateBaseline = argv.includes('--update-baseline');
  const baselinePath = argv.find((a) => a.startsWith('--baseline='))?.slice('--baseline='.length) || DEFAULT_BASELINE;

  const readJson = (rel) => JSON.parse(readFileSync(new URL(`../src/data/${rel}`, import.meta.url), 'utf8'));
  const briefs = readJson('daily-briefs.json');
  const i18n = readJson('briefs-i18n.json');
  const terms = readJson('brief-terms.json');

  const baseline = updateBaseline ? null : loadBaseline(baselinePath);
  const result = evaluate({ briefs, i18n, terms, baseline });

  if (updateBaseline) {
    const stamp = new Date().toISOString().slice(0, 10);
    writeBaseline(baselinePath, { keys: result.softKeys, updated: stamp });
    console.error(`content-check: 已写入基线 ${baselinePath}（${new Set(result.softKeys).size} 条软问题）`);
  }

  if (json) {
    console.log(
      JSON.stringify(
        {
          ok: result.ok,
          briefs: briefs.length,
          langs: ['en', ...indexableLangs(terms)],
          hard: result.hard,
          soft: result.soft,
          added: result.added,
          fixed: result.fixed,
        },
        null,
        2,
      ),
    );
  } else {
    const langs = ['en', ...indexableLangs(terms)];
    console.log(
      `content-check: ${briefs.length} 篇 × ${langs.length} 语言 | 硬问题 ${result.hard.length}，` +
        `软问题 ${new Set(result.softKeys).size}` +
        (result.firstRun ? '（未找到基线，仅报告）' : `（基线 ${baseline.keys.size}）`),
    );

    // 同类问题只展示前若干条，避免一次翻译全挂时刷屏上万个 id。
    const printGrouped = (items, prefix) => {
      const byKind = new Map();
      for (const item of items) {
        if (!byKind.has(item.kind)) byKind.set(item.kind, []);
        byKind.get(item.kind).push(item);
      }
      for (const [kind, list] of byKind) {
        console.log(`${prefix} ${kind}: ${list.length} 条`);
        for (const item of list.slice(0, 5)) console.log(`  - ${item.detail}`);
        if (list.length > 5) console.log(`  - …另有 ${list.length - 5} 条`);
      }
    };

    if (result.hard.length) printGrouped(result.hard, 'FAIL');
    if (result.added.length) {
      console.log(`FAIL soft-regression: ${result.added.length} 条新增于基线之外`);
      for (const key of result.added.slice(0, 10)) console.log(`  - ${key}`);
      if (result.added.length > 10) console.log(`  - …另有 ${result.added.length - 10} 条`);
    }
    if (result.fixed.length) {
      console.log(`NOTE 基线里有 ${result.fixed.length} 条已修复，可跑 --update-baseline 收紧`);
    }
  }

  // 必须用 exitCode 而不是 process.exit(1)：后者立即终止进程，未刷出的 stdout
  // 会连同管道一起被丢弃。硬问题成批时 --json 的输出远超 64KB 的管道缓冲，
  // 调用方（preflight）只能读到截断的半个 JSON，把「内容坏了」误报成「无法解析」
  // （实测：750 条硬问题 173KB，读到 65536 字节处中断）。
  if (!result.ok) process.exitCode = 1;
  // --json 时 stdout 必须是纯 JSON（巡检会直接 JSON.parse），成功提示走 stderr。
  if (json) console.error('content-check: OK');
  else console.log('content-check: OK');
}
