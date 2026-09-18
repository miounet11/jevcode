/**
 * Jev / TypeSafe 社区生态项目清单。
 * 数据来自 GitHub 公开仓库采集（2026-09-18），stars 为采集时快照，会随时间变化。
 */

export interface Project {
  /** owner/repo */
  repo: string;
  url: string;
  /** 一句话定位，中英各一 */
  desc: { zh: string; en: string };
  stars: number;
  forks: number;
  language: string | null;
  license: string | null;
  topics: string[];
  /** 归类 key，对应 categories */
  category: string;
}

export interface Category {
  key: string;
  title: { zh: string; en: string };
  lead: { zh: string; en: string };
}

export const categories: Category[] = [
  {
    key: 'curated',
    title: { zh: '精选清单', en: 'Curated lists' },
    lead: {
      zh: '由社区维护的资源索引，适合作为进入 Jev 生态的第一站。',
      en: 'Community-maintained indexes — the best first stop when entering the Jev ecosystem.',
    },
  },
  {
    key: 'agent',
    title: { zh: 'Agent 与工作流', en: 'Agents & workflows' },
    lead: {
      zh: '把 Jev 的置信度决策嵌入真实 agent 循环，用于游戏、代码审查与软件工厂。',
      en: 'Embedding Jev confidence decisions into real agent loops — games, code review, and software factories.',
    },
  },
  {
    key: 'integration',
    title: { zh: '集成与桥接', en: 'Integrations & bridges' },
    lead: {
      zh: '把 Jev 接入既有数据源与协议栈，例如 Postgres 与 ACP/MCP。',
      en: 'Wiring Jev into existing data sources and protocol stacks such as Postgres and ACP/MCP.',
    },
  },
  {
    key: 'research',
    title: { zh: '复现与研究', en: 'Research & reimplementation' },
    lead: {
      zh: '关于 System One 决策模型本身的开放复现与实验。',
      en: 'Open reimplementations and experiments on the System One decision model itself.',
    },
  },
  {
    key: 'tooling',
    title: { zh: '工具链', en: 'Tooling' },
    lead: {
      zh: '把 Jev 的快速打分能力接到开发工具链里，直接改善日常编码体验。',
      en: 'Plugging Jev scoring into developer tooling to improve everyday coding.',
    },
  },
];

export const projects: Project[] = [
  {
    repo: 'Anil-matcha/awesome-jev-by-typesafe',
    url: 'https://github.com/Anil-matcha/awesome-jev-by-typesafe',
    desc: {
      zh: '有证据支撑的用例、模式、提示词与起步代码，覆盖面最广的一份 Jev 资源合集。',
      en: 'Evidence-backed use cases, patterns, prompts, and starter code — the broadest Jev resource collection.',
    },
    stars: 446,
    forks: 90,
    language: 'Python',
    license: 'MIT',
    topics: ['agent-workflows', 'classification', 'confidence-aware-ai', 'decision-intelligence'],
    category: 'curated',
  },
  {
    repo: 'AbdelStark/awesome-typesafe',
    url: 'https://github.com/AbdelStark/awesome-typesafe',
    desc: {
      zh: 'TypeSafe、System One 模型与 Jev 的官方资源和社区项目索引。',
      en: 'Curated list of official resources and community projects for TypeSafe, System One models, and Jev.',
    },
    stars: 135,
    forks: 19,
    language: 'CSS',
    license: 'MIT',
    topics: ['ai-agents', 'awesome-list', 'structured-output'],
    category: 'curated',
  },
  {
    repo: 'yibie/awesome-jev',
    url: 'https://github.com/yibie/awesome-jev',
    desc: {
      zh: '收录基于 Jev 构建的公开项目、集成方式与社区讨论。',
      en: 'A curated list of public projects, integrations, and discussions built on Jev.',
    },
    stars: 74,
    forks: 6,
    language: 'Python',
    license: null,
    topics: ['awesome-list', 'llm'],
    category: 'curated',
  },
  {
    repo: 'fhshaik/typesafe-mario',
    url: 'https://github.com/fhshaik/typesafe-mario',
    desc: {
      zh: '从结构化模拟器状态出发、由 Jev 驱动决策的《超级马里奥兄弟》agent。',
      en: 'A TypeSafe/Jev agent that plays Super Mario Bros. from structured emulator state.',
    },
    stars: 245,
    forks: 26,
    language: 'Python',
    license: null,
    topics: [],
    category: 'agent',
  },
  {
    repo: 'thruwire/foreman',
    url: 'https://github.com/thruwire/foreman',
    desc: {
      zh: '基于 Jev 模型构建的软件工厂调度器，把任务分派建模为类型化决策。',
      en: 'Software Factory Foreman based on the TypeSafe Jev model.',
    },
    stars: 244,
    forks: 16,
    language: 'Python',
    license: 'MIT',
    topics: [],
    category: 'agent',
  },
  {
    repo: 'devagrawal09/jev-review',
    url: 'https://github.com/devagrawal09/jev-review',
    desc: {
      zh: '分阶段的代码审查工作流与本地看板，用 Jev 决定每一步的审查深度。',
      en: 'A staged code-review workflow and local dashboard built with TypeSafe Jev.',
    },
    stars: 211,
    forks: 11,
    language: 'TypeScript',
    license: 'MIT',
    topics: ['code-review', 'typesafe-ai'],
    category: 'agent',
  },
  {
    repo: 'realZachi/pg-jev',
    url: 'https://github.com/realZachi/pg-jev',
    desc: {
      zh: 'PostgreSQL 扩展：用自然语言直接向数据表提问，由 Jev 负责把问题编译成查询。',
      en: "Ask your Postgres tables questions in plain language — a PostgreSQL extension powered by Jev.",
    },
    stars: 91,
    forks: 4,
    language: 'Python',
    license: null,
    topics: [],
    category: 'integration',
  },
  {
    repo: 'pithings/advocaat',
    url: 'https://github.com/pithings/advocaat',
    desc: {
      zh: '一个小而类型安全的客户端，用于向自己的数据提问。',
      en: 'A small, type-safe client for asking AI questions about your data.',
    },
    stars: 59,
    forks: 1,
    language: 'TypeScript',
    license: 'MIT',
    topics: [],
    category: 'integration',
  },
  {
    repo: 'gamesonrblx/Jevbridge',
    url: 'https://github.com/gamesonrblx/Jevbridge',
    desc: {
      zh: 'ACP 与 MCP 适配器，让 Jev 与任意 LLM 协作，在 Codex、Claude、Grok、OpenCode 之间共享类型化决策。',
      en: 'ACP and MCP adapter bridging Jev with any LLM — typed decisions alongside Codex, Claude, Grok, and OpenCode.',
    },
    stars: 10,
    forks: 0,
    language: 'TypeScript',
    license: 'MIT',
    topics: ['acp', 'agent', 'computer-use'],
    category: 'integration',
  },
  {
    repo: 'kshetrajna12/reflex',
    url: 'https://github.com/kshetrajna12/reflex',
    desc: {
      zh: '一个小型开放决策模型：状态 + 类型化问题 → 校准概率，基于 Qwen3.5 复现 Jev / System One。',
      en: 'A small open decision model: state + typed questions → calibrated probabilities, re-created on Qwen3.5.',
    },
    stars: 42,
    forks: 4,
    language: 'Python',
    license: 'MIT',
    topics: [],
    category: 'research',
  },
  {
    repo: 'miounet11/openjev',
    url: 'https://github.com/miounet11/openjev',
    desc: {
      zh: '一次可行性探索：能否在单张 3090 上本地跑起类似 Jev 的模型。',
      en: 'Can we run something like Jev on a 3090 at home?',
    },
    stars: 0,
    forks: 0,
    language: null,
    license: 'MIT',
    topics: [],
    category: 'research',
  },
  {
    repo: 'tamaratran/fast-jev-compaction',
    url: 'https://github.com/tamaratran/fast-jev-compaction',
    desc: {
      zh: 'Claude Code 插件：用 Jev 决策替代上下文压缩摘要，在一次请求内为每个工具调用打分，丢弃过时结果、保留原文。',
      en: 'Claude Code plugin replacing compaction summaries with Jev decisions — each tool call scored in one fast request, stale ones dropped, kept content verbatim.',
    },
    stars: 1979,
    forks: 92,
    language: 'TypeScript',
    license: 'MIT',
    topics: ['claude-code', 'context-management'],
    category: 'tooling',
  },
];

/** 按分类分组，组内按 stars 降序 */
export function projectsByCategory(): Array<{ category: Category; items: Project[] }> {
  return categories
    .map((category) => ({
      category,
      items: projects
        .filter((p) => p.category === category.key)
        .sort((a, b) => b.stars - a.stars),
    }))
    .filter((group) => group.items.length > 0);
}
