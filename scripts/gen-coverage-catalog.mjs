/**
 * 由覆盖语料生成人类可读的维度清单。
 *
 * 用法：node scripts/gen-coverage-catalog.mjs
 * 产物：docs/coverage-catalog.md
 *
 * 清单罗列四个静态维度（行业 / 判定类型 / tag / 载体 / 环节）的全量取值，
 * 以及它们交叉后的规模与用法，方便人核对覆盖面、按维度筛语料开跑。
 */

import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { INDUSTRIES, DIMENSIONS, TAGS, SCENES, STAGES } from './lib/coverage-taxonomy.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const total = INDUSTRIES.length * DIMENSIONS.length * 8;

const lines = [];
lines.push('# JEV 覆盖清单');
lines.push('');
lines.push(`由 \`scripts/gen-coverage-catalog.mjs\` 生成，请勿手改。改维度请改 \`scripts/lib/coverage-taxonomy.mjs\` 后重跑 \`npm run coverage:gen\`。`);
lines.push('');
lines.push('## 规模');
lines.push('');
lines.push(`- 语料总量：**${total}** 条（\`data/coverage-cases.json\`）`);
lines.push(`- 行业 ${INDUSTRIES.length} × 判定类型 ${DIMENSIONS.length} × 模板 8 = ${total}`);
lines.push(`- 附加轴：tag ${TAGS.length}、载体 ${SCENES.length}、环节 ${STAGES.length}，轮转铺满`);
lines.push('');
lines.push('## 用法');
lines.push('');
lines.push('```bash');
lines.push('# 重新生成全量语料 + 本清单');
lines.push('npm run coverage:gen');
lines.push('');
lines.push('# 抽样 200 条（可复现，用于真实评测，控制耗时与额度）');
lines.push('node scripts/gen-coverage-cases.mjs --sample 200   # -> data/coverage-sample.json');
lines.push('```');
lines.push('');
lines.push('每条用例字段：`id / industry / dimension / tag / scene / stage / context / question / choices / accept`。');
lines.push('`accept` 是正确选项，可直接作为判分依据（JEV 的 `/api/compare` 与 `/v1/judge` 都用同一契约）。');
lines.push('');

const table = (title, rows, note) => {
  lines.push(`## ${title}`);
  lines.push('');
  if (note) { lines.push(note); lines.push(''); }
  lines.push('| # | id | 名称 |');
  lines.push('| --- | --- | --- |');
  rows.forEach(([id, label], i) => lines.push(`| ${i + 1} | \`${id}\` | ${label} |`));
  lines.push('');
};

table('行业（industry）', INDUSTRIES, '共 40 个行业，横跨电商、金融、医疗、制造、公共部门等。');
table('判定类型（dimension）', DIMENSIONS.map((d) => [d.id, d.question]), '每种类型有固定问句与候选集，8 条模板。');
table('横切关切（tag）', TAGS, '与行业正交，用于筛出「同一类风险在各行业的表现」。');
table('载体形态（scene）', SCENES, '题面被包进对应形态的壳里，模拟真实入口。');
table('环节（stage）', STAGES, '模拟 JEV 在一次业务流转中的介入位置。');

const outPath = path.join(ROOT, 'docs/coverage-catalog.md');
if (!existsSync(path.dirname(outPath))) mkdirSync(path.dirname(outPath), { recursive: true });
writeFileSync(outPath, lines.join('\n'));
console.log(`已写出 docs/coverage-catalog.md（${total} 条语料的维度清单）`);
