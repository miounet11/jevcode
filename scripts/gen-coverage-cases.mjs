/**
 * 生成 JEV 覆盖语料：把「JEV 可能被用到的场景」按五个维度铺满。
 *
 * 用法：
 *   node scripts/gen-coverage-cases.mjs            # 生成全量
 *   node scripts/gen-coverage-cases.mjs --sample 200   # 只随机抽样 N 条（跑真实评测用）
 *
 * 维度（见 scripts/lib/coverage-taxonomy.mjs）：
 *   industry 40 × dimension 24 × template 8 = 7,680 条
 *   tag 16、scene 12、stage 8 作为附加标签轮流铺满，保证每个取值都被覆盖。
 *
 * 产物：
 *   data/coverage-cases.json     全量语料
 *   data/coverage-manifest.json  各维度计数与总量
 *
 * 注意：这份语料是**独立测试集**，不接入站点与线上判定的公共题库
 * （server/case-index.json 保持人工维护，避免评测集污染产品表现）。
 */

import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { INDUSTRIES, DIMENSIONS, TAGS, SCENES, STAGES, fillTemplate } from './lib/coverage-taxonomy.mjs';
import { cleanCompareItems } from '../server/compare.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

/** 载体形态的题面前缀，让 context 更接近真实入口 */
const SCENE_PREFIX = {
  'support-ticket': 'Ticket:',
  chat: 'Chat message:',
  email: 'Email received:',
  review: 'Review posted:',
  alert: 'Alert fired:',
  log: 'Log line:',
  transcript: 'Call transcript:',
  form: 'Form submission:',
  sms: 'SMS:',
  'api-payload': 'API payload field:',
  note: 'Internal note:',
  social: 'Social post:',
};

function build() {
  const cases = [];
  let seq = 0;
  // 用双重循环的序号决定 scene/stage，保证每个取值都被均匀铺到
  for (let ii = 0; ii < INDUSTRIES.length; ii++) {
    const industry = INDUSTRIES[ii];
    for (let di = 0; di < DIMENSIONS.length; di++) {
      const dim = DIMENSIONS[di];
      for (let ti = 0; ti < dim.templates.length; ti++) {
        const [tpl, correctIdx] = dim.templates[ti];
        // tag 用质数步长错开，避免与 scene/stage 的取模同相位，保证 16 个 tag 都被铺到
        const tag = TAGS[(ii * 7 + di * 3 + ti) % TAGS.length];
        const scene = SCENES[(ii + di + ti) % SCENES.length];
        const stage = STAGES[(ii * 3 + di + ti) % STAGES.length];
        const body = fillTemplate(tpl, industry);

        cases.push({
          id: `cov-${industry[0]}-${dim.id}-${String(ti + 1).padStart(2, '0')}`,
          industry: industry[0],
          dimension: dim.id,
          tag: tag[0],
          scene: scene[0],
          stage: stage[0],
          context: `${SCENE_PREFIX[scene[0]]} ${body}`,
          question: dim.question,
          choices: dim.choices,
          accept: [dim.choices[correctIdx]],
        });
        seq++;
      }
    }
  }
  return cases;
}

const args = process.argv.slice(2);
const sampleArg = args.indexOf('--sample');
const sampleN = sampleArg >= 0 ? Number(args[sampleArg + 1]) : 0;

let cases = build();

// 用 JEV 自己的契约校验器过滤，确保语料真的能被 cleanCompareItems 接受
const rejected = [];
const accepted = [];
for (const c of cases) {
  const ok = cleanCompareItems([{
    id: c.id, context: c.context, question: c.question, choices: c.choices,
  }]);
  if (ok) accepted.push(c);
  else rejected.push(c.id);
}
if (rejected.length) {
  console.error(`有 ${rejected.length} 条不符合 JEV 契约，前几条：${rejected.slice(0, 5).join(', ')}`);
  process.exit(1);
}
cases = accepted;

let out = cases;
if (sampleN > 0) {
  // 确定性抽样：按 id 排序后等距取，保证可复现
  const step = cases.length / sampleN;
  out = Array.from({ length: sampleN }, (_, i) => cases[Math.floor(i * step)]);
}

const countBy = (key) => {
  const m = {};
  for (const c of cases) m[c[key]] = (m[c[key]] || 0) + 1;
  return m;
};

const manifest = {
  generatedAt: new Date().toISOString(),
  total: cases.length,
  sampled: sampleN > 0 ? out.length : null,
  axes: {
    industry: countBy('industry'),
    dimension: countBy('dimension'),
    tag: countBy('tag'),
    scene: countBy('scene'),
    stage: countBy('stage'),
  },
  sources: {
    industries: INDUSTRIES.length,
    dimensions: DIMENSIONS.length,
    tags: TAGS.length,
    scenes: SCENES.length,
    stages: STAGES.length,
  },
};

writeFileSync(path.join(ROOT, 'data/coverage-cases.json'), JSON.stringify(cases, null, 2) + '\n');
writeFileSync(path.join(ROOT, 'data/coverage-manifest.json'), JSON.stringify(manifest, null, 2) + '\n');

if (sampleN > 0) {
  writeFileSync(path.join(ROOT, 'data/coverage-sample.json'), JSON.stringify(out, null, 2) + '\n');
}

console.log(`已生成 ${cases.length} 条覆盖用例`);
console.log(`  industry=${Object.keys(manifest.axes.industry).length}/${INDUSTRIES.length}` +
  ` dimension=${Object.keys(manifest.axes.dimension).length}/${DIMENSIONS.length}` +
  ` tag=${Object.keys(manifest.axes.tag).length}/${TAGS.length}` +
  ` scene=${Object.keys(manifest.axes.scene).length}/${SCENES.length}` +
  ` stage=${Object.keys(manifest.axes.stage).length}/${STAGES.length}`);
if (sampleN > 0) console.log(`  并抽样 ${out.length} 条到 data/coverage-sample.json`);
