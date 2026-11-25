/**
 * 滤掉 Astro 构建时的逐页路由树。
 *
 * `npm run build` 会给每个页面打一行 `16:55:16   ├─ /pt/.../index.html (+1ms)`，
 * 日更写进 cron.log 大约两万行。错误、警告和阶段摘要必须留下。
 */

const ROUTE_TREE = /^\d{2}:\d{2}:\d{2}\s+[├└│]/;

/** 逐页路由树，或纯回车进度行。其余（含错误与摘要）返回 false。 */
export function isNoisyBuildLine(line) {
  const raw = String(line ?? '');
  if (raw.includes('\r') && raw.replace(/\r/g, '').trim() === '') return true;
  return ROUTE_TREE.test(raw.replace(/\r/g, ''));
}

/**
 * 丢掉噪声行。有省略时在末尾加一行计数，方便确认过滤器确实生效。
 * @param {string} text
 * @returns {string}
 */
export function filterBuildOutput(text) {
  const kept = [];
  let omitted = 0;
  for (const line of String(text ?? '').split('\n')) {
    if (isNoisyBuildLine(line)) omitted += 1;
    else kept.push(line);
  }
  let out = kept.join('\n');
  if (omitted > 0) {
    if (out.length && !out.endsWith('\n')) out += '\n';
    out += `[build-log] omitted ${omitted} per-page route lines`;
  }
  return out;
}
