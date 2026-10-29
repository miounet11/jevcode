/**
 * 校验 Jev 覆盖登记表。
 *
 * 登记表的每条记录都声称「有公开证据」，这个脚本负责让那句声称
 * 可以被机器复核，而不是靠人眼相信：
 *   1. 字段完整性：slug 唯一、断言双语非空、标签与分类都在枚举内；
 *   2. 时间自洽：addedAt 不晚于 reviewedAt，且不得是未来日期；
 *   3. 证据可达：evidenceUrl 与 repoUrl 返回 2xx；
 *   4. 行号可定位：GitHub blob 链接带 #Lnn 时，转成 raw 后确认文件确有那么多行。
 *
 * 用法：node scripts/check-jev-coverage.mjs
 * 退出码 0 表示全部通过；任何一条不合规即非 0，用于拦住未经核验的收录。
 */

import {
  CATEGORIES,
  COVERAGE_ENTRIES,
  REGISTRY_REVIEWED_AT,
  VERIFICATION_LABELS,
} from '../src/lib/content/registry.ts';

const errors = [];
const fail = (slug, message) => errors.push(`${slug}: ${message}`);

/** GitHub blob → raw，便于按行取回文本。非 GitHub 链接原样返回。 */
function toRaw(url) {
  const m = url.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+?)(?:#L(\d+))?$/);
  if (!m) return null;
  const [, owner, repo, ref, path, line] = m;
  return {
    raw: `https://raw.githubusercontent.com/${owner}/${repo}/${ref}/${path}`,
    line: line ? Number(line) : null,
  };
}

async function head(url, method = 'HEAD') {
  try {
    const res = await fetch(url, { method, redirect: 'follow' });
    // 某些托管对 HEAD 返回 405/403，退回 GET 再确认一次。
    if (!res.ok && method === 'HEAD') return head(url, 'GET');
    return { ok: res.ok, status: res.status };
  } catch (err) {
    return { ok: false, status: 0, error: String(err?.message ?? err) };
  }
}

function checkShape(entry, seenSlugs) {
  const { slug, name, repoUrl, evidenceUrl, assertion, verification, category, addedAt, reviewedAt } = entry;

  if (!slug || !/^[a-z0-9][a-z0-9-]*$/.test(slug)) fail(slug, 'slug 必须是 kebab-case');
  if (seenSlugs.has(slug)) fail(slug, 'slug 重复');
  seenSlugs.add(slug);

  if (!name) fail(slug, '缺少 name');
  if (!repoUrl?.startsWith('https://')) fail(slug, 'repoUrl 必须是 https 链接');
  if (!evidenceUrl?.startsWith('https://')) fail(slug, 'evidenceUrl 必须是 https 链接');
  if (!assertion?.zh?.trim()) fail(slug, '缺少中文断言');
  if (!assertion?.en?.trim()) fail(slug, '缺少英文断言');
  if (/^\s*$/.test(assertion?.zh ?? '')) fail(slug, '中文断言为空白');

  if (!Array.isArray(verification) || verification.length === 0) {
    fail(slug, 'verification 不能为空');
  } else {
    for (const v of verification) {
      if (!VERIFICATION_LABELS.includes(v)) fail(slug, `未知验证标签 ${v}`);
    }
  }

  if (!CATEGORIES.includes(category)) fail(slug, `未知分类 ${category}`);

  for (const [key, value] of [['addedAt', addedAt], ['reviewedAt', reviewedAt]]) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value ?? '')) fail(slug, `${key} 必须是 YYYY-MM-DD`);
  }
  if (addedAt > reviewedAt) fail(slug, 'addedAt 晚于 reviewedAt');
  const today = new Date().toISOString().slice(0, 10);
  if (reviewedAt > today) fail(slug, `reviewedAt 是未来日期 (${reviewedAt} > ${today})`);
  if (reviewedAt > REGISTRY_REVIEWED_AT) fail(slug, 'reviewedAt 晚于整体复核日期');
}

async function checkEvidence(entry) {
  const { slug, evidenceUrl, repoUrl } = entry;

  const repo = await head(repoUrl);
  if (!repo.ok) fail(slug, `repoUrl 不可达 (${repo.status})`);

  const raw = toRaw(evidenceUrl);
  if (raw) {
    const res = await fetch(raw.raw, { redirect: 'follow' });
    if (!res.ok) {
      fail(slug, `证据文件不可达 (${res.status})`);
      return;
    }
    const text = await res.text();
    if (raw.line) {
      const total = text.split('\n').length;
      if (total < raw.line) {
        fail(slug, `证据行 #L${raw.line} 超出文件长度 ${total}`);
      }
    }
    return;
  }

  const ev = await head(evidenceUrl);
  if (!ev.ok) fail(slug, `evidenceUrl 不可达 (${ev.status})`);
}

const seen = new Set();

for (const entry of COVERAGE_ENTRIES) checkShape(entry, seen);

// 并发受限，避免一次性打出上百个请求。
const CONCURRENCY = 6;
const queue = [...COVERAGE_ENTRIES];
await Promise.all(
  Array.from({ length: CONCURRENCY }, async () => {
    while (queue.length) {
      const entry = queue.shift();
      if (entry) await checkEvidence(entry);
    }
  }),
);

if (errors.length) {
  console.error(`jev-coverage: ${errors.length} 处不合规`);
  for (const line of errors) console.error(`  - ${line}`);
  process.exit(1);
}

console.log(`jev-coverage: ${COVERAGE_ENTRIES.length} 条全部通过（证据可达、字段完整、日期自洽）`);
