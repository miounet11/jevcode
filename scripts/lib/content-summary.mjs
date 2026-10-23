#!/usr/bin/env node
/**
 * 把 content-check --json 的结果压成一段能直接塞进飞书告警的文字。
 *
 * 单独成文件而不是内联在 healthcheck-cron.sh 里：内联的 node -e 脚本带反引号
 * 和 ${} 时会被 shell 展开，且没法单独跑测试。
 *
 * 用法：node scripts/content-check.mjs --json | node scripts/lib/content-summary.mjs
 */

/** 结果对象 → 告警正文；通过时返回 'OK'。 */
export function summarize(result) {
  if (result?.ok) return 'OK';
  const hard = Array.isArray(result?.hard) ? result.hard : [];
  const added = Array.isArray(result?.added) ? result.added : [];
  const kinds = {};
  for (const item of hard) kinds[item.kind] = (kinds[item.kind] ?? 0) + 1;

  return [
    `硬问题 ${hard.length} 条，新增软问题 ${added.length} 条`,
    ...Object.entries(kinds).map(([kind, n]) => `- ${kind}: ${n}`),
    ...hard.slice(0, 5).map((item) => `  · ${item.detail}`),
    added.length ? '新增软问题（前 5 条）：' : '',
    ...added.slice(0, 5).map((key) => `  · ${key}`),
  ]
    .filter(Boolean)
    .join('\n');
}

const isMain = process.argv[1] && new URL(import.meta.url).pathname === process.argv[1];

if (isMain) {
  let raw = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', (chunk) => {
    raw += chunk;
  });
  process.stdin.on('end', () => {
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      // 解析不了要显式说出来：静默返回 OK 会让巡检把脚本故障当成内容合格。
      console.log('PARSE_ERROR：content-check --json 输出无法解析');
      process.exitCode = 1;
      return;
    }
    console.log(summarize(parsed));
    if (!parsed.ok) process.exitCode = 1;
  });
}
