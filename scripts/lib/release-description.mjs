/**
 * 门 2 的发布内容描述。
 *
 * 之前直接传 `git log -1 --stat --oneline`，模型看到的是几个数据文件的原始
 * 变更行数，没有任何「这是每日例行刷新」的上下文，于是按变更面积泛化判断：
 * 2026-10-19 三轮实测 ready 分别为 0.154 / 0.219 / 0.218（断链 8→0 后仅微升），
 * risk 恒定 1。
 *
 * 这里如实分类陈述，只写可核实的文件清单与数据规模，不写「没有逻辑变更」
 * 这类在带脚本修复时不成立的断言。
 */

/** 数据量统计项：文件名 → 描述里用的标签。 */
const VOLUME_LABELS = {
  'daily-briefs.json': 'briefs',
  'briefs-i18n.json': 'briefsI18n',
  'lab-records.json': 'labRecords',
  'lab-supplement.json': 'labSupplement',
};

/** 从若干文件中挑出 { label, count }。读不到或不是 JSON 就跳过，不编造数字。 */
export function readVolumeStats(files, readFile) {
  const stats = [];
  for (const [file, label] of Object.entries(VOLUME_LABELS)) {
    if (files && files.length && !files.some((f) => f.endsWith(file))) continue;
    try {
      const value = JSON.parse(readFile(`src/data/${file}`));
      const count = Array.isArray(value) ? value.length : Object.keys(value).length;
      stats.push(`${label}=${count}`);
    } catch {
      /* 文件不存在或不是 JSON，跳过该项 */
    }
  }
  return stats;
}

/**
 * 生成描述文本。
 * @param {string[]} files 本轮待发布的文件路径
 * @param {{ readFile: (path: string) => string }} deps
 */
export function describeReleaseFiles(files, { readFile } = {}) {
  const list = (files ?? []).filter(Boolean);
  const dataFiles = list.filter((f) => f.startsWith('src/data/'));
  const pageFiles = list.filter((f) => f.startsWith('src/pages/') || f.startsWith('src/i18n/'));
  const scriptFiles = list.filter((f) => f.startsWith('scripts/'));
  const rest = list.filter(
    (f) => !dataFiles.includes(f) && !pageFiles.includes(f) && !scriptFiles.includes(f),
  );

  // 没有任何待发布文件时不该报数据规模：那些数字来自当前工作区，不由本轮产生。
  if (!list.length) return 'Scheduled release with no file changes.';

  const stats = readFile ? readVolumeStats(list, readFile) : [];

  const parts = [`Scheduled release covering ${list.length} file(s).`];
  if (dataFiles.length) {
    parts.push(`Data refresh (${dataFiles.length}): ${dataFiles.map((f) => f.replace('src/data/', '')).join(', ')}.`);
  }
  if (stats.length) parts.push(`Current data volume: ${stats.join(', ')}.`);
  if (scriptFiles.length) {
    parts.push(`Pipeline/script updates (${scriptFiles.length}): ${scriptFiles.map((f) => f.replace('scripts/', '')).join(', ')}.`);
  }
  if (pageFiles.length) {
    parts.push(`Page/i18n updates (${pageFiles.length}): ${pageFiles.map((f) => f.replace('src/', '')).join(', ')}.`);
  }
  if (rest.length) parts.push(`Other (${rest.length}): ${rest.join(', ')}.`);
  return parts.join(' ');
}
