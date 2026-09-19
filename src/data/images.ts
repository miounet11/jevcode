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
  'concepts/system-one': {
    src: 'img/docs/system-one',
    width: 1344,
    height: 768,
    alt: { zh: '三层同心结构输出类型化判断', en: 'Three concentric layers producing typed judgements' },
  },
  'primitives': {
    src: 'img/docs/primitives',
    width: 1344,
    height: 768,
    alt: { zh: '三种问题原语示意图', en: 'The three question primitives' },
  },
  'primitives/choice': {
    src: 'img/docs/primitive-choice',
    width: 1344,
    height: 768,
    alt: { zh: '从四个选项中选出一个，附各选项概率', en: 'Picking one of four options, with per-option probabilities' },
  },
  'primitives/noul': {
    src: 'img/docs/primitive-noul',
    width: 1344,
    height: 768,
    alt: { zh: '单次是非判断，附接近满值的概率弧', en: 'A single yes/no judgement with a near-full probability gauge' },
  },
  'primitives/score': {
    src: 'img/docs/primitive-score',
    width: 1344,
    height: 768,
    alt: { zh: '在分级刻度上给出连续评分', en: 'A continuous score placed on a graded ladder' },
  },
  'primitives/advanced': {
    src: 'img/docs/primitives-advanced',
    width: 1344,
    height: 768,
    alt: { zh: '进阶问题的三种结构化组合', en: 'Three structured shapes for advanced questions' },
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
  'sdk/python': {
    src: 'img/docs/sdk-python',
    width: 1344,
    height: 768,
    alt: { zh: 'Python 客户端调用类型化判断接口', en: 'Python client calling the typed judgement endpoint' },
  },
  'sdk/javascript': {
    src: 'img/docs/sdk-javascript',
    width: 1344,
    height: 768,
    alt: { zh: 'JavaScript / TypeScript 客户端调用判断接口', en: 'JavaScript / TypeScript client calling the judgement endpoint' },
  },
  'sdk/http-api': {
    src: 'img/docs/sdk-http-api',
    width: 1344,
    height: 768,
    alt: { zh: '直接向 HTTP 端点发送 JSON 请求', en: 'Posting JSON straight to the HTTP endpoint' },
  },
  'sdk/agent-skill': {
    src: 'img/docs/sdk-agent-skill',
    width: 1344,
    height: 768,
    alt: { zh: 'Agent Skill 徽标向外连接多个工具', en: 'An agent skill badge reaching out to several tools' },
  },

  // 案例配图：与 src/content/docs/*/cases/*.md 一一对应
  'cases/use-case-map': {
    src: 'img/cases/use-case-map',
    width: 1344,
    height: 768,
    alt: { zh: '按场景聚成五组的能力地图', en: 'A capability map clustering into five scenario groups' },
  },
  'cases/autoformat': {
    src: 'img/cases/autoformat',
    width: 1344,
    height: 768,
    alt: { zh: '散乱文本被重排为结构块', en: 'Jumbled text reorganised into distinct blocks' },
  },
  'cases/autoresearch-feature-discovery': {
    src: 'img/cases/autoresearch-feature-discovery',
    width: 1344,
    height: 768,
    alt: { zh: '四个环节构成的闭环研究回路', en: 'A four-stage closed research loop' },
  },
  'cases/citation-check': {
    src: 'img/cases/citation-check',
    width: 1344,
    height: 768,
    alt: { zh: '引用与原文逐条比对', en: 'Matching quotations against the source document' },
  },
  'cases/classification-using-confidence': {
    src: 'img/cases/classification-using-confidence',
    width: 1344,
    height: 768,
    alt: { zh: '众多候选中唯一高置信度选项被选中', en: 'One confident pick among many candidates' },
  },
  'cases/classifying-rag-passages': {
    src: 'img/cases/classifying-rag-passages',
    width: 1344,
    height: 768,
    alt: { zh: '检索段落逐条归入类别', en: 'Retrieved passages funnelled into categories' },
  },
  'cases/consistency-choice-cookbook': {
    src: 'img/cases/consistency-choice-cookbook',
    width: 1344,
    height: 768,
    alt: { zh: '多次采样收敛到同一选项', en: 'Repeated samples converging on one option' },
  },
  'cases/consistency-noul-cookbook': {
    src: 'img/cases/consistency-noul-cookbook',
    width: 1344,
    height: 768,
    alt: { zh: '同一判断在多次采样下保持一致', en: 'A judgement staying consistent across samples' },
  },
  'cases/date-extraction-cookbook': {
    src: 'img/cases/date-extraction-cookbook',
    width: 1344,
    height: 768,
    alt: { zh: '从日历网格中抽取三个日期', en: 'Extracting three dates from a calendar grid' },
  },
  'cases/entity-alignment': {
    src: 'img/cases/entity-alignment',
    width: 1344,
    height: 768,
    alt: { zh: '两列实体逐项配对', en: 'Pairing entities across two columns' },
  },
  'cases/function-calling': {
    src: 'img/cases/function-calling',
    width: 1344,
    height: 768,
    alt: { zh: '自然语言转为函数调用与参数', en: 'Natural language turned into a function call with arguments' },
  },
  'cases/hierarchical-classification': {
    src: 'img/cases/hierarchical-classification',
    width: 1344,
    height: 768,
    alt: { zh: '从根节点逐层向下走到叶子分支', en: 'Walking from root down to a leaf branch' },
  },
  'cases/llm-guardrails': {
    src: 'img/cases/llm-guardrails',
    width: 1344,
    height: 768,
    alt: { zh: '令牌流经过三道护栏，部分被拦下', en: 'A token stream passing three guardrails, some blocked' },
  },
  'cases/parallel-questions': {
    src: 'img/cases/parallel-questions',
    width: 1344,
    height: 768,
    alt: { zh: '一次请求扇出为四个问题', en: 'One request fanning out into four questions' },
  },
  'cases/pre-parsed-value-extraction-cookbook': {
    src: 'img/cases/pre-parsed-value-extraction-cookbook',
    width: 1344,
    height: 768,
    alt: { zh: '按字符偏移定位待抽取的值', en: 'Locating values by character offsets' },
  },
  'cases/rerank-typesafe': {
    src: 'img/cases/rerank-typesafe',
    width: 1344,
    height: 768,
    alt: { zh: '排序前后的候选列表对比', en: 'Candidate rankings before and after reranking' },
  },
  'cases/sde-cascade': {
    src: 'img/cases/sde-cascade',
    width: 1344,
    height: 768,
    alt: { zh: '逐级放大、按需下钻的级联判断', en: 'A cascade that narrows down in successive stages' },
  },
  'cases/semantic-find': {
    src: 'img/cases/semantic-find',
    width: 1344,
    height: 768,
    alt: { zh: '长文档中定位回答问题的行', en: 'Locating the lines that answer a query in a long document' },
  },
  'cases/skill-suggestion': {
    src: 'img/cases/skill-suggestion',
    width: 1344,
    height: 768,
    alt: { zh: '从大量技能中挑出唯一匹配', en: 'Picking the single matching skill from many' },
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
