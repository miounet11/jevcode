export const languages = {
  zh: { label: '简体中文', short: '中' },
  en: { label: 'English', short: 'EN' },
} as const;

export type Lang = keyof typeof languages;
export const defaultLang: Lang = 'zh';

export const ui = {
  zh: {
    'site.name': 'JevCode',
    'site.tagline': 'Jev 技术解决方案与最佳实践',
    'site.description':
      'JevCode 聚合 Jev（TypeSafe System One 模型）的官方文档要点、架构模式、SDK 用法与真实生产案例，是中文世界最专业的 Jev 技术解决方案站点。',

    'nav.docs': '文档',
    'nav.patterns': '模式',
    'nav.ecosystem': '生态',
    'nav.demos': '示例',
    'nav.start': '快速开始',

    'home.hero.eyebrow': 'System One · 类型化决策层',
    'home.hero.title': '让软件获得确定性的 AI 决策能力',
    'home.hero.lead':
      'Jev 不是聊天模型。它接收非结构化状态和一个类型化问题，返回类型化决策——选择、评分或布尔值，每个都附带置信度。这使它可以作为软件中的决策层直接调用。',
    'home.hero.cta': '开始阅读',
    'home.hero.cta2': '查看架构模式',

    'home.stats.models': '官方模型',
    'home.stats.primitives': '问题原语',
    'home.stats.patterns': '架构模式',
    'home.stats.cases': '生态案例',

    'home.section.primitives.title': '三种问题原语',
    'home.section.primitives.lead':
      '所有决策都归结为三类类型化问题。选对原语，是构建可靠决策系统的第一步。',
    'home.section.patterns.title': '架构模式',
    'home.section.patterns.lead':
      '从单点调用到多级流水线，这些模式覆盖了生产环境中最常见的决策架构。',
    'home.section.ecosystem.title': '生态与真实案例',
    'home.section.ecosystem.lead':
      '已经有人在生产环境用 Jev 做分类路由、内容校验、评分排序和智能体护栏。',

    'docs.toc': '本页目录',
    'docs.updated': '最后更新',
    'docs.prev': '上一篇',
    'docs.next': '下一篇',
    'docs.readMore': '阅读全文',
    'docs.source': '内容来源',
    'docs.empty': '该文档的当前语言版本尚未完成，以下为默认语言内容。',

    'lang.switch': '切换语言',
    'footer.legal': '本站为社区维护的技术资料站，与 TypeSafe AI 无隶属关系。',
    'footer.builtWith': '基于 Astro 构建',
    'footer.rights': '保留所有权利',
  },
  en: {
    'site.name': 'JevCode',
    'site.tagline': 'Jev technical solutions and best practices',
    'site.description':
      'JevCode aggregates the essentials of Jev (TypeSafe System One models): official docs, architecture patterns, SDK usage, and real production cases — the most practical Jev engineering resource.',

    'nav.docs': 'Docs',
    'nav.patterns': 'Patterns',
    'nav.ecosystem': 'Ecosystem',
    'nav.demos': 'Demos',
    'nav.start': 'Get started',

    'home.hero.eyebrow': 'System One · A typed decision layer',
    'home.hero.title': 'Give your software deterministic AI decisions',
    'home.hero.lead':
      'Jev is not a chat model. It takes unstructured state plus a typed question and returns a typed decision — a choice, a score, or a boolean, each with a confidence. That makes it a drop-in decision layer for software.',
    'home.hero.cta': 'Start reading',
    'home.hero.cta2': 'Browse patterns',

    'home.stats.models': 'Official models',
    'home.stats.primitives': 'Question primitives',
    'home.stats.patterns': 'Architecture patterns',
    'home.stats.cases': 'Ecosystem cases',

    'home.section.primitives.title': 'Three question primitives',
    'home.section.primitives.lead':
      'Every decision reduces to one of three typed questions. Choosing the right primitive is the first step toward a reliable decision system.',
    'home.section.patterns.title': 'Architecture patterns',
    'home.section.patterns.lead':
      'From single calls to multi-stage pipelines, these patterns cover the decision architectures that show up most in production.',
    'home.section.ecosystem.title': 'Ecosystem and real cases',
    'home.section.ecosystem.lead':
      'Teams are already using Jev in production for classification and routing, verification, scoring and ranking, and agent guardrails.',

    'docs.toc': 'On this page',
    'docs.updated': 'Last updated',
    'docs.prev': 'Previous',
    'docs.next': 'Next',
    'docs.readMore': 'Read more',
    'docs.source': 'Source',
    'docs.empty': 'This page is not yet available in your language. Showing the default language.',

    'lang.switch': 'Switch language',
    'footer.legal': 'Community-maintained technical resource. Not affiliated with TypeSafe AI.',
    'footer.builtWith': 'Built with Astro',
    'footer.rights': 'All rights reserved',
  },
} as const;

export type UIKey = keyof (typeof ui)[typeof defaultLang];

export function useTranslations(lang: Lang) {
  return function t(key: UIKey): string {
    return ui[lang][key] ?? ui[defaultLang][key];
  };
}

/** 为当前路径生成另一种语言的等价路径 */
export function switchLangPath(pathname: string, target: Lang): string {
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length === 0) return `/${target}/`;
  parts[0] = target;
  return '/' + parts.join('/') + '/';
}
