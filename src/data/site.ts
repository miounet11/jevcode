/** 文档侧边栏分组定义。key 与 frontmatter 的 section 字段对应。 */
export const sections = [
  { key: 'start', order: 10 },
  { key: 'concepts', order: 20 },
  { key: 'primitives', order: 30 },
  { key: 'patterns', order: 40 },
  { key: 'sdk', order: 50 },
  { key: 'cases', order: 60 },
] as const;

export type SectionKey = (typeof sections)[number]['key'];

export const sectionTitles: Record<SectionKey, { zh: string; en: string }> = {
  start: { zh: '快速开始', en: 'Getting started' },
  concepts: { zh: '核心概念', en: 'Core concepts' },
  primitives: { zh: '问题原语', en: 'Primitives' },
  patterns: { zh: '架构模式', en: 'Patterns' },
  sdk: { zh: 'SDK 与集成', en: 'SDKs & integration' },
  cases: { zh: '生态案例', en: 'Ecosystem cases' },
};

export function sectionTitle(key: string, lang: 'zh' | 'en'): string {
  const s = sectionTitles[key as SectionKey];
  return s ? s[lang] : key;
}

/** 三种问题原语的展示卡片数据 */
export const primitiveCards = [
  {
    slug: 'choice',
    label: 'Choice',
    tagline: { zh: '在候选集中选一个', en: 'Pick one from a set' },
    desc: {
      zh: '给定一组互斥选项，模型返回选中的选项及置信度。适用于意图分类、工单路由、动作选择。',
      en: 'Given a set of mutually exclusive options, the model returns the selected option with a confidence. Used for intent classification, ticket routing, action selection.',
    },
  },
  {
    slug: 'score',
    label: 'Score',
    tagline: { zh: '在量纲上打分', en: 'Rate along a scale' },
    desc: {
      zh: '按定义好的量纲或评分标准打分，返回数值与置信度。适用于相关性排序、质量评估、风险分级。',
      en: 'Rate along a defined scale or rubric, returning a numeric value with confidence. Used for relevance ranking, quality assessment, risk grading.',
    },
  },
  {
    slug: 'noul',
    label: 'Noul',
    tagline: { zh: '回答一个是/否概率', en: 'Probability of yes/no' },
    desc: {
      zh: '提出一个是/否问题，返回答案为「是」的概率。适用于内容校验、断言核查、智能体护栏。',
      en: 'Ask a yes/no question and get the probability the answer is yes. Used for verification, claim checking, agent guardrails.',
    },
  },
] as const;

/** 首页展示的架构模式 */
export const patternCards = [
  {
    slug: 'intent-routing',
    title: { zh: '意图路由', en: 'Intent routing' },
    desc: {
      zh: '用一次 Choice 调用把请求分派到下游处理链路，替代脆弱的正则与关键词匹配。',
      en: 'Dispatch requests to downstream handlers with a single Choice call, replacing brittle regex and keyword matching.',
    },
  },
  {
    slug: 'confidence-routing',
    title: { zh: '置信度路由', en: 'Confidence routing' },
    desc: {
      zh: '按置信度高低分流：高置信度自动执行，低置信度转人工或升级到更强模型。',
      en: 'Route by confidence: auto-execute when high, escalate to a human or a stronger model when low.',
    },
  },
  {
    slug: 'composite-scoring',
    title: { zh: '组合评分', en: 'Composite scoring' },
    desc: {
      zh: '把多个 Score 维度加权合成为单一排序指标，让排序逻辑可解释、可调参。',
      en: 'Combine several Score dimensions into a single ranking metric, making ranking logic explainable and tunable.',
    },
  },
  {
    slug: 'fan-out',
    title: { zh: '扇出并行', en: 'Fan-out' },
    desc: {
      zh: '并行发起多个独立判断再汇总，降低总延迟并提升吞吐。',
      en: 'Issue many independent judgements in parallel and aggregate, cutting total latency and raising throughput.',
    },
  },
] as const;

export const site = {
  domain: 'www.jevcode.ai',
  serverIp: '155.94.154.13',
  repo: 'https://github.com/Anil-matcha/awesome-jev-by-typesafe',
  official: 'https://typesafe.ai/',
  docs: 'https://docs.typesafe.ai/',
};
