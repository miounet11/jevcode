/**
 * 配图清单与页面映射。
 *
 * 图片由 .pipeline/gen_batch.py 经本地集群生成，.pipeline/optimize_img.mjs 转 WebP。
 * 每张图同时提供 PNG（回退）与 WebP（首选），尺寸见 width/height。
 */

export interface Figure {
  /** public/img 下的相对路径（不含扩展名） */
  src: string;
  width: number;
  height: number;
  /** alt 文案，中英各一，其余语言回退 en */
  alt: { zh: string; en: string };
}

/** 首页 hero 主图 */
export const heroFigure: Figure = {
  src: 'img/hero/pareto',
  width: 1344,
  height: 768,
  alt: {
    zh: '帕累托前沿示意图：在成本与质量之间权衡的决策点分布',
    en: 'Pareto frontier illustration: decision points trading off cost against quality',
  },
};

/** 文档 slug -> 配图 */
export const docFigures: Record<string, Figure> = {
  'introduction': {
    src: 'img/docs/architecture',
    width: 1344,
    height: 768,
    alt: {
      zh: 'Jev 三层架构总览示意图',
      en: 'Overview of the three-layer Jev architecture',
    },
  },
  'quickstart': {
    src: 'img/docs/quickstart',
    width: 1344,
    height: 768,
    alt: { zh: '快速上手：终端中的首次调用', en: 'Quick start: your first call in the terminal' },
  },
  'concepts/state': {
    src: 'img/docs/state',
    width: 1344,
    height: 768,
    alt: { zh: '状态分层结构示意图', en: 'Layered representation of state' },
  },
  'concepts/confidence': {
    src: 'img/docs/confidence',
    width: 1344,
    height: 768,
    alt: { zh: '置信度阈值与分流示意图', en: 'Confidence threshold and routing' },
  },
  'primitives': {
    src: 'img/docs/primitives',
    width: 1344,
    height: 768,
    alt: { zh: '三种问题原语示意图', en: 'The three question primitives' },
  },
  'patterns': {
    src: 'img/docs/architecture',
    width: 1344,
    height: 768,
    alt: {
      zh: '架构模式总览示意图',
      en: 'Overview of architecture patterns',
    },
  },
  'patterns/intent-routing': {
    src: 'img/docs/intent-routing',
    width: 1344,
    height: 768,
    alt: { zh: '意图路由：一次调用分发到多条链路', en: 'Intent routing: one call dispatching to many handlers' },
  },
  'patterns/confidence-routing': {
    src: 'img/docs/confidence',
    width: 1344,
    height: 768,
    alt: { zh: '置信度路由示意图', en: 'Confidence routing' },
  },
  'patterns/composite-scoring': {
    src: 'img/docs/composite-scoring',
    width: 1344,
    height: 768,
    alt: { zh: '多个评分维度加权合成为单一指标', en: 'Weighted aggregation of several score dimensions' },
  },
  'patterns/fan-out': {
    src: 'img/docs/fan-out',
    width: 1344,
    height: 768,
    alt: { zh: '扇出并行：多个独立判断并行汇总', en: 'Fan-out: parallel judgements merged together' },
  },
  'sdk': {
    src: 'img/docs/sdk',
    width: 1344,
    height: 768,
    alt: { zh: 'SDK 语言绑定示意图', en: 'SDK language bindings' },
  },
};

/**
 * 取某篇文档的配图；查不到返回 undefined。
 * 调用方传入的 slug 已去掉语言前缀，index 页会被规范化为目录名
 * （如 `primitives/index` 与 `primitives` 等价）。
 */
export function figureForDoc(slug: string): Figure | undefined {
  const normalized = slug.replace(/\/index$/, '');
  return docFigures[slug] ?? docFigures[normalized];
}

/** alt 文案按语言取值，缺失回退 en。 */
export function figureAlt(fig: Figure, lang: string): string {
  return (fig.alt as Record<string, string>)[lang] ?? fig.alt.en;
}
