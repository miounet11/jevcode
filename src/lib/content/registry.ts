/**
 * Jev 覆盖登记表 —— 站内唯一文案源。
 *
 * 每条记录必须回答三件事：
 *   1. Jev 在这条项目里做的**具体决策**（一句话断言，可被判真伪）；
 *   2. 该断言的**最强公开证据链接**；
 *   3. 证据强度标签（只描述事实，不参与排序或评分）。
 *
 * 这里的断言由本站撰写，不复制上游目录原文。标签是多值的：一个条目
 * 可以同时是 `public-source` 与 `readme-claim`。
 */

import { CLAIM_ENTRIES } from './registry-claims.ts';
import { CALL_SITES } from './registry-callsites.ts';

/** 从 https://github.com/<owner>/<repo> 取出归属与默认分支占位（main）。 */
function repoRef(url: string): { owner: string; repo: string; ref: string } {
  const m = url.match(/^https:\/\/github\.com\/([^/]+)\/([^/#?]+)/);
  return m ? { owner: m[1], repo: m[2], ref: 'main' } : { owner: '', repo: '', ref: 'main' };
}

export const VERIFICATION_LABELS = [
  'public-source',
  'call-site-verified',
  'demo-only',
  'readme-claim',
  'maintainer-runbook',
  'reviewer-reproduced',
  'author-reported-metric',
  'third-party-reproduced',
] as const;

export type VerificationLabel = (typeof VERIFICATION_LABELS)[number];

export const VERIFICATION_MEANING: Record<VerificationLabel, { zh: string; en: string }> = {
  'public-source': {
    zh: '仓库公开，README 描述了可识别的 Jev 工作流。',
    en: 'The repository is public and its README describes an identifiable Jev workflow.',
  },
  'call-site-verified': {
    zh: '已定位到公开代码中调用 Jev 并消费其答案的位置。',
    en: 'Public code that calls Jev and consumes its answer was located.',
  },
  'demo-only': {
    zh: '有公开演示可观察行为，但未找到可检视的调用点。',
    en: 'A public demo shows the behavior, but no inspectable call site was found.',
  },
  'readme-claim': {
    zh: '上游自述使用 Jev，调用点尚未核实。',
    en: 'The upstream project states it uses Jev; the call site has not been verified.',
  },
  'maintainer-runbook': {
    zh: '上游提供了可执行的安装与运行说明。',
    en: 'The upstream project provides setup and execution instructions.',
  },
  'reviewer-reproduced': {
    zh: '独立评审者按文档跑通了流程，并记录了日期。',
    en: 'An independent reviewer ran the documented workflow and recorded the date.',
  },
  'author-reported-metric': {
    zh: '数字来自项目作者，未经独立复现。',
    en: 'The number comes from the project author and has not been independently reproduced.',
  },
  'third-party-reproduced': {
    zh: '有第三方公开来源按可查方法重复了该测量。',
    en: 'A separate public source repeated the measurement with a documented method.',
  },
};

export const CATEGORIES = [
  'official',
  'sdk-client',
  'jev-like-model',
  'framework-integration',
  'agent-tooling',
  'browser-computer-use',
  'application',
  'game-simulation',
  'demo-playground',
  'benchmark-research',
  'other-list',
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABEL: Record<Category, { zh: string; en: string }> = {
  official: { zh: '官方资源', en: 'Official' },
  'sdk-client': { zh: 'SDK 与客户端', en: 'SDKs & clients' },
  'jev-like-model': { zh: 'Jev 类模型', en: 'Jev-like models' },
  'framework-integration': { zh: '框架与集成', en: 'Frameworks & integrations' },
  'agent-tooling': { zh: 'Agent 工具', en: 'Agent tooling' },
  'browser-computer-use': { zh: '浏览器与计算机操作', en: 'Browser & computer use' },
  application: { zh: '应用', en: 'Applications' },
  'game-simulation': { zh: '游戏与模拟', en: 'Games & simulations' },
  'demo-playground': { zh: '演示与 Playground', en: 'Demos & playgrounds' },
  'benchmark-research': { zh: '基准与研究', en: 'Benchmarks & research' },
  'other-list': { zh: '其它清单', en: 'Other lists' },
};

/**
 * 分类名的其余 6 种语言。
 *
 * 这些是界面词，不是断言，因此可以直接翻译；断言本身仍只有中英两版。
 * 缺项回退到英文，绝不返回空串——空 h1 比英文 h1 更糟。
 */
const CATEGORY_LABEL_EXTRA: Record<Category, Record<string, string>> = {
  official: { ja: '公式リソース', ko: '공식 리소스', de: 'Offiziell', fr: 'Ressources officielles', es: 'Recursos oficiales', pt: 'Recursos oficiais' },
  'sdk-client': { ja: 'SDK とクライアント', ko: 'SDK 및 클라이언트', de: 'SDKs & Clients', fr: 'SDK et clients', es: 'SDK y clientes', pt: 'SDKs e clientes' },
  'jev-like-model': { ja: 'Jev 系モデル', ko: 'Jev 유사 모델', de: 'Jev-ähnliche Modelle', fr: 'Modèles de type Jev', es: 'Modelos de tipo Jev', pt: 'Modelos do tipo Jev' },
  'framework-integration': { ja: 'フレームワーク統合', ko: '프레임워크 통합', de: 'Framework-Integrationen', fr: 'Intégrations de frameworks', es: 'Integraciones de frameworks', pt: 'Integrações de frameworks' },
  'agent-tooling': { ja: 'エージェントツール', ko: '에이전트 도구', de: 'Agent-Werkzeuge', fr: 'Outils d\u2019agents', es: 'Herramientas de agentes', pt: 'Ferramentas de agentes' },
  'browser-computer-use': { ja: 'ブラウザとコンピュータ操作', ko: '브라우저 및 컴퓨터 사용', de: 'Browser & Computer-Nutzung', fr: 'Navigateur et usage ordinateur', es: 'Navegador y uso del equipo', pt: 'Navegador e uso do computador' },
  application: { ja: 'アプリケーション', ko: '애플리케이션', de: 'Anwendungen', fr: 'Applications concrètes', es: 'Aplicaciones', pt: 'Aplicações' },
  'game-simulation': { ja: 'ゲームとシミュレーション', ko: '게임 및 시뮬레이션', de: 'Spiele & Simulationen', fr: 'Jeux et simulations', es: 'Juegos y simulaciones', pt: 'Jogos e simulações' },
  'demo-playground': { ja: 'デモと Playground', ko: '데모 및 플레이그라운드', de: 'Demos & Playgrounds', fr: 'Démos et playgrounds', es: 'Demos y playgrounds', pt: 'Demos e playgrounds' },
  'benchmark-research': { ja: 'ベンチマークと研究', ko: '벤치마크 및 연구', de: 'Benchmarks & Forschung', fr: 'Benchmarks et recherche', es: 'Benchmarks e investigación', pt: 'Benchmarks e pesquisa' },
  'other-list': { ja: 'その他のリスト', ko: '기타 목록', de: 'Weitere Listen', fr: 'Autres listes', es: 'Otras listas', pt: 'Outras listas' },
};

/** 统一的分类名取值入口：中英走主表，其余走扩展表，缺项回退英文。 */
export function categoryLabel(category: Category, lang: string): string {
  const base = CATEGORY_LABEL[category];
  if (lang === 'zh') return base.zh;
  if (lang === 'en') return base.en;
  return CATEGORY_LABEL_EXTRA[category]?.[lang] ?? base.en;
}

export interface CoverageEntry {
  /** URL 稳定段，发布后不得修改。 */
  slug: string;
  name: string;
  repoUrl: string;
  /** 一句话断言：Jev 在这里做的具体决策。中文为撰写原文，英文为等义译文。 */
  assertion: { zh: string; en: string };
  /** 最强公开证据链接；至少指向被检视的文件或说明。 */
  evidenceUrl: string;
  verification: VerificationLabel[];
  category: Category;
  /** 主要实现语言，未知留空。 */
  lang?: string;
  /** 收录时的快照，仅用于标注时间，不参与排序。 */
  stars?: number;
  addedAt: string;
  reviewedAt: string;
}

const REVIEWED_AT = '2026-10-29';

/** 人工核对过证据上下文的条目（断言由本站撰写）。 */
export const CURATED_ENTRIES: CoverageEntry[] = [
  {
    slug: 'typesafe-skills',
    name: 'TypeSafe agent skills',
    repoUrl: 'https://github.com/typesafe-ai/skills',
    assertion: {
      zh: '把 Jev 的原语、模式与评估写法打包成 agent 可加载的技能包，让代码 agent 在生成调用时先确定答案类型。',
      en: 'Packages Jev primitives, patterns and evaluation habits into agent-loadable skills so a coding agent fixes the answer type before writing the call.',
    },
    evidenceUrl: 'https://github.com/typesafe-ai/skills',
    verification: ['public-source', 'maintainer-runbook'],
    category: 'official',
    stars: 765,
    addedAt: '2026-09-19',
    reviewedAt: REVIEWED_AT,
  },
  {
    slug: 'typesafe-sdk-js',
    name: 'TypeSafe JavaScript SDK',
    repoUrl: 'https://github.com/typesafe-ai/typesafe-sdk-js',
    assertion: {
      zh: '在 TypeScript 侧把调用返回收窄成声明的答案类型，使决策结果不需要再做运行时解析。',
      en: 'Narrows a call result to the declared answer type on the TypeScript side, so the decision outcome needs no runtime parsing.',
    },
    evidenceUrl: 'https://github.com/typesafe-ai/typesafe-sdk-js',
    verification: ['public-source', 'maintainer-runbook'],
    category: 'sdk-client',
    lang: 'TypeScript',
    stars: 168,
    addedAt: '2026-09-19',
    reviewedAt: REVIEWED_AT,
  },
  {
    slug: 'system-one-adapter-python',
    name: 'System One adapter (Python)',
    repoUrl: 'https://github.com/typesafe-ai/system-one-adapter-python',
    assertion: {
      zh: '以同一套客户端接口换到底层 LLM 上比较 Jev 与聊天模型的决策质量，客户端代码不改。',
      en: 'Swaps the underlying LLM behind one client interface to compare Jev against chat models on decision quality, without touching client code.',
    },
    evidenceUrl: 'https://github.com/typesafe-ai/system-one-adapter-python',
    verification: ['public-source', 'maintainer-runbook'],
    category: 'official',
    lang: 'Python',
    stars: 171,
    addedAt: '2026-09-19',
    reviewedAt: REVIEWED_AT,
  },
  {
    slug: 'jev-rag',
    name: 'Jev RAG',
    repoUrl: 'https://github.com/aifabrice/jev-rag',
    assertion: {
      zh: '在检索后由 Jev 判定段落是否足以支撑答案，再决定是否放行生成。',
      en: 'After retrieval, Jev decides whether the passages actually support an answer, and only then is generation allowed to run.',
    },
    evidenceUrl: 'https://github.com/aifabrice/jev-rag',
    verification: ['public-source', 'readme-claim'],
    category: 'application',
    lang: 'Python',
    addedAt: '2026-10-29',
    reviewedAt: REVIEWED_AT,
  },
  {
    slug: 'jev-research-pipeline',
    name: 'jev-research-pipeline',
    repoUrl: 'https://github.com/shimo4228/jev-research-pipeline',
    assertion: {
      zh: '把研究流程的每一步收敛判定交给 Jev，避免开放式文本在多步之间漂移。',
      en: "Hands each convergence check in the research pipeline to Jev so open-ended text cannot drift between steps.",
    },
    evidenceUrl: 'https://github.com/shimo4228/jev-research-pipeline',
    verification: ['public-source', 'readme-claim'],
    category: 'application',
    lang: 'Python',
    addedAt: '2026-10-29',
    reviewedAt: REVIEWED_AT,
  },
  {
    slug: 'deciflow',
    name: 'DeciFlow',
    repoUrl: 'https://github.com/call518/DeciFlow',
    assertion: {
      zh: '以类型化决策节点编排流程，分支条件由 Jev 返回的枚举值直接决定。',
      en: 'Orchestrates flow with typed decision nodes, where branch conditions are decided directly by the enum value Jev returns.',
    },
    evidenceUrl: 'https://github.com/call518/DeciFlow',
    verification: ['public-source', 'demo-only'],
    category: 'framework-integration',
    lang: 'TypeScript',
    addedAt: '2026-10-29',
    reviewedAt: REVIEWED_AT,
  },
  {
    slug: 'jev4pg',
    name: 'jev4pg',
    repoUrl: 'https://github.com/Sheltercosmo/jev4pg',
    assertion: {
      zh: '在 PostgreSQL 里把文本谓词交给 Jev 判定，保留概率与来源证据，精确的连接与聚合仍由 SQL 完成。',
      en: 'Pushes textual predicates down to Jev inside PostgreSQL while keeping probabilities and source evidence; exact joins and aggregates stay in SQL.',
    },
    evidenceUrl: 'https://github.com/Sheltercosmo/jev4pg',
    verification: ['public-source', 'readme-claim'],
    category: 'framework-integration',
    lang: 'Python',
    stars: 95,
    addedAt: '2026-10-29',
    reviewedAt: REVIEWED_AT,
  },
  {
    slug: 'cribrix',
    name: 'Cribrix',
    repoUrl: 'https://github.com/david96182/cribrix',
    assertion: {
      zh: '由 Jev 先路由查询、再筛检索段落、最后核验断言，之后才放出答案。',
      en: 'Jev routes the query, filters retrieved passages and verifies claims before any answer is released.',
    },
    evidenceUrl: 'https://github.com/david96182/cribrix',
    verification: ['public-source', 'readme-claim'],
    category: 'application',
    lang: 'Python',
    addedAt: '2026-10-29',
    reviewedAt: REVIEWED_AT,
  },
  {
    slug: 'laya-php',
    name: 'laya-php',
    repoUrl: 'https://github.com/marcreichel/laya-php',
    assertion: {
      zh: '在 PHP 侧把 Jev 兼容的类型化决策映射进原生类型，接管 Laravel 的判定点。',
      en: 'Maps Jev-compatible typed decisions into native PHP types and takes over the decision points inside Laravel.',
    },
    evidenceUrl: 'https://github.com/marcreichel/laya-php',
    verification: ['public-source', 'readme-claim'],
    category: 'sdk-client',
    lang: 'PHP',
    stars: 35,
    addedAt: '2026-10-29',
    reviewedAt: REVIEWED_AT,
  },
  {
    slug: 'gut-check',
    name: 'Gut Check',
    repoUrl: 'https://github.com/funkadelic/ha-gutcheck',
    assertion: {
      zh: '由 Jev 评估 Home Assistant 实体的健康度与升级风险，低置信度时不允许自动改动。',
      en: 'Jev scores Home Assistant entity health and upgrade risk, and blocks automatic changes whenever confidence is low.',
    },
    evidenceUrl: 'https://github.com/funkadelic/ha-gutcheck',
    verification: ['public-source', 'readme-claim'],
    category: 'framework-integration',
    lang: 'Python',
    stars: 2,
    addedAt: '2026-10-29',
    reviewedAt: REVIEWED_AT,
  },
  {
    slug: 'jev-book-tags',
    name: 'JEV Book Tags',
    repoUrl: 'https://github.com/iamjonatha/jev-book-tags',
    assertion: {
      zh: '由 Jev 判定书籍的题材与证据充分度，越过阈值才写入 Calibre 标签。',
      en: 'Jev decides a book genre and how well the evidence supports it; tags are written into Calibre only above the threshold.',
    },
    evidenceUrl: 'https://github.com/iamjonatha/jev-book-tags',
    verification: ['public-source', 'readme-claim'],
    category: 'application',
    lang: 'Python',
    stars: 0,
    addedAt: '2026-10-29',
    reviewedAt: REVIEWED_AT,
  },
  {
    slug: 'ollaya',
    name: 'ollaya',
    repoUrl: 'https://github.com/ollaya-dev/ollaya',
    assertion: {
      zh: '用 Rust 实现与 Jev 同形的判定服务，让服务端不依赖托管模型也能拿到类型化答案。',
      en: 'Implements a Jev-shaped decision service in Rust so a backend can get typed answers without depending on the hosted model.',
    },
    evidenceUrl: 'https://github.com/ollaya-dev/ollaya/blob/main/crates/ollaya-server/src/http.rs',
    verification: ['public-source', 'call-site-verified'],
    category: 'jev-like-model',
    lang: 'Rust',
    stars: 17,
    addedAt: '2026-10-29',
    reviewedAt: REVIEWED_AT,
  },
  {
    slug: 'jevany',
    name: 'JevAny',
    repoUrl: 'https://github.com/weitianxin/JevAny',
    assertion: {
      zh: '以模型层复刻 Jev 的判定接口，供无法直连托管服务的环境使用。',
      en: 'Reproduces the Jev decision interface at the model layer for environments that cannot reach the hosted service directly.',
    },
    evidenceUrl: 'https://github.com/weitianxin/JevAny/blob/main/jevany/model.py',
    verification: ['public-source', 'call-site-verified'],
    category: 'jev-like-model',
    lang: 'Python',
    stars: 13,
    addedAt: '2026-10-29',
    reviewedAt: REVIEWED_AT,
  },
  {
    slug: 'eikos',
    name: 'eikos',
    repoUrl: 'https://github.com/caiovicentino/eikos',
    assertion: {
      zh: '把判定步骤从生成链路里拆出来，交给类型化模型单独返回结论。',
      en: 'Pulls the decision step out of the generation chain and lets a typed model return the conclusion on its own.',
    },
    evidenceUrl: 'https://github.com/caiovicentino/eikos',
    verification: ['public-source', 'readme-claim'],
    category: 'jev-like-model',
    lang: 'Python',
    stars: 16,
    addedAt: '2026-10-29',
    reviewedAt: REVIEWED_AT,
  },
  {
    slug: 'trio-spark',
    name: 'Trio-Spark demos',
    repoUrl: 'https://github.com/machinefi/trio-spark',
    assertion: {
      zh: '用演示场景展示类型化判定在交互流程里的落点，而非以生成文本作为结果。',
      en: 'Shows where a typed decision lands inside an interactive flow, instead of treating generated text as the result.',
    },
    evidenceUrl: 'https://github.com/machinefi/trio-spark',
    verification: ['public-source', 'demo-only'],
    category: 'demo-playground',
    addedAt: '2026-10-29',
    reviewedAt: REVIEWED_AT,
  },
  {
    slug: 'decision-models-as-guardrails',
    name: 'Decision Models as Guardrails',
    repoUrl: 'https://github.com/raxITlabs/decision-models-as-guardrails',
    assertion: {
      zh: '把类型化判定当作护栏而非评分器，用固定选项约束下游可执行的动作集合。',
      en: 'Treats typed decisions as guardrails rather than scores, using fixed options to constrain the action set downstream can execute.',
    },
    evidenceUrl: 'https://github.com/raxITlabs/decision-models-as-guardrails',
    verification: ['public-source', 'readme-claim', 'author-reported-metric'],
    category: 'benchmark-research',
    addedAt: '2026-10-29',
    reviewedAt: REVIEWED_AT,
  },
  {
    slug: 'go-jev',
    name: 'go-jev',
    repoUrl: 'https://github.com/mattn/go-jev',
    assertion: {
      zh: 'Go 客户端把 Jev 的类型化答案封装成库，并附带 jev-cli 供 UNIX 管道直接调用。',
      en: 'A Go client that wraps Jev typed answers as a library and ships jev-cli for direct use in UNIX pipelines.',
    },
    evidenceUrl: 'https://github.com/mattn/go-jev/blob/main/README.md#L5',
    verification: ['public-source', 'readme-claim', 'maintainer-runbook'],
    category: 'sdk-client',
    lang: 'Go',
    addedAt: '2026-10-29',
    reviewedAt: REVIEWED_AT,
  },
  {
    slug: 'zod-jev',
    name: 'zod-jev',
    repoUrl: 'https://github.com/jomatsu/zod-jev',
    assertion: {
      zh: '用一次 parseAsync 把整个 Zod schema 的规则合成单个 Jev 请求，再把概率转成 Zod issue，调用方仍用原生 Zod API。',
      en: 'One parseAsync call sends an entire Zod schema ruleset to Jev as a single request, then turns the probabilities into Zod issues while callers keep using native Zod APIs.',
    },
    evidenceUrl: 'https://github.com/jomatsu/zod-jev/blob/main/README.md#L13',
    verification: ['public-source', 'readme-claim'],
    category: 'framework-integration',
    lang: 'TypeScript',
    addedAt: '2026-10-29',
    reviewedAt: REVIEWED_AT,
  },
  {
    slug: 'zio-typesafe-ai',
    name: 'zio-typesafe-ai',
    repoUrl: 'https://github.com/jamesward/zio-typesafe-ai',
    assertion: {
      zh: 'Scala 3 / ZIO 库对 Jev 做端到端类型化封装，避免调用方直接处理原始 JSON。',
      en: 'A Scala 3 / ZIO library that types the Jev System One API end-to-end, so callers never handle raw JSON.',
    },
    evidenceUrl: 'https://github.com/jamesward/zio-typesafe-ai/blob/main/README.md#L6',
    verification: ['public-source', 'readme-claim'],
    category: 'sdk-client',
    lang: 'Scala',
    addedAt: '2026-10-29',
    reviewedAt: REVIEWED_AT,
  },
  {
    slug: 'jev-java',
    name: 'jev-java',
    repoUrl: 'https://github.com/Olti1947/jev-java',
    assertion: {
      zh: 'Java 17+ 客户端库，把 Jev System One 决策引擎包成惯用 Java 接口。',
      en: 'An idiomatic Java 17+ client library for the Jev System One decision engine.',
    },
    evidenceUrl: 'https://github.com/Olti1947/jev-java/blob/main/README.md#L3',
    verification: ['public-source', 'readme-claim'],
    category: 'sdk-client',
    lang: 'Java',
    addedAt: '2026-10-29',
    reviewedAt: REVIEWED_AT,
  },
  {
    slug: 'jev-sdk-java',
    name: 'jev-sdk-java',
    repoUrl: 'https://github.com/luigivis/jev-sdk-java',
    assertion: {
      zh: '面向 Java 21 的类型安全客户端，请求 TypeSafe AI 的 Jev 决策 API。',
      en: 'A small type-safe Java 21 client for the TypeSafe AI Jev decision API.',
    },
    evidenceUrl: 'https://github.com/luigivis/jev-sdk-java/blob/main/README.md#L3',
    verification: ['public-source', 'readme-claim'],
    category: 'sdk-client',
    lang: 'Java',
    addedAt: '2026-10-29',
    reviewedAt: REVIEWED_AT,
  },
  {
    slug: 'typesafe-sdk-rust',
    name: 'typesafe-sdk (Rust)',
    repoUrl: 'https://github.com/codeitlikemiley/typesafe-sdk-rust',
    assertion: {
      zh: 'Rust 客户端库，除默认异步用法外还提供 blocking 特性供同步调用。',
      en: 'A Rust client that ships a blocking feature alongside the default async usage.',
    },
    evidenceUrl: 'https://github.com/codeitlikemiley/typesafe-sdk-rust/blob/main/README.md#L27',
    verification: ['public-source', 'readme-claim', 'maintainer-runbook'],
    category: 'sdk-client',
    lang: 'Rust',
    addedAt: '2026-10-29',
    reviewedAt: REVIEWED_AT,
  },
  {
    slug: 'kunobi-jev',
    name: 'kunobi-jev',
    repoUrl: 'https://github.com/kunobi-ninja/kunobi-jev',
    assertion: {
      zh: 'Rust 客户端在 Jev 之外还接入其他托管决策模型，用同一套类型化调用切换提供方。',
      en: 'A Rust client for typed decision models that covers Jev alongside other hosted providers behind one typed call.',
    },
    evidenceUrl: 'https://github.com/kunobi-ninja/kunobi-jev/blob/main/README.md#L9',
    verification: ['public-source', 'readme-claim'],
    category: 'sdk-client',
    lang: 'Rust',
    addedAt: '2026-10-29',
    reviewedAt: REVIEWED_AT,
  },
  {
    slug: 'tinyjevclient',
    name: 'tinyjevclient',
    repoUrl: 'https://github.com/tinyhumansai/tinyjevclient',
    assertion: {
      zh: '轻量 Rust 客户端，只覆盖 System One API 的类型化调用面。',
      en: 'A compact typed Rust client scoped to the System One API call surface.',
    },
    evidenceUrl: 'https://github.com/tinyhumansai/tinyjevclient/blob/main/README.md#L3',
    verification: ['public-source', 'readme-claim'],
    category: 'sdk-client',
    lang: 'Rust',
    addedAt: '2026-10-29',
    reviewedAt: REVIEWED_AT,
  },
  {
    slug: 'jev-cli',
    name: 'jev-cli',
    repoUrl: 'https://github.com/lhotwll217/jev-cli',
    assertion: {
      zh: '极薄命令行封装：输入 JSON，输出类型化决策，不做额外抽象。',
      en: 'A thin CLI wrapper over the System One API: JSON in, typed decisions out, with no extra abstraction.',
    },
    evidenceUrl: 'https://github.com/lhotwll217/jev-cli/blob/main/README.md#L3',
    verification: ['public-source', 'readme-claim'],
    category: 'agent-tooling',
    addedAt: '2026-10-29',
    reviewedAt: REVIEWED_AT,
  },
  {
    slug: 'typesafe-zig',
    name: 'typesafe.zig',
    repoUrl: 'https://github.com/mattneel/typesafe.zig',
    assertion: {
      zh: 'Zig 绑定把 Choice、Noul、Score 三类问题合成一次调用，直接返回类型化答案。',
      en: 'Zig bindings ask typed Choice, Noul and Score questions about application state in one call.',
    },
    evidenceUrl: 'https://github.com/mattneel/typesafe.zig/blob/master/README.md#L4',
    verification: ['public-source', 'readme-claim'],
    category: 'sdk-client',
    lang: 'Zig',
    addedAt: '2026-10-29',
    reviewedAt: REVIEWED_AT,
  },
  {
    slug: 'spring-ai-typesafe',
    name: 'spring-ai-typesafe',
    repoUrl: 'https://github.com/spring-ai-community/spring-ai-typesafe',
    assertion: {
      zh: '基于 Spring RestClient 与 Jackson 3 实现 Jev API，并提供 Spring AI 集成。',
      en: 'Implements the Jev API on Spring RestClient and Jackson 3, plus Spring AI integrations.',
    },
    evidenceUrl: 'https://github.com/spring-ai-community/spring-ai-typesafe/blob/main/README.md#L9',
    verification: ['public-source', 'readme-claim'],
    category: 'framework-integration',
    lang: 'Java',
    addedAt: '2026-10-29',
    reviewedAt: REVIEWED_AT,
  },
  {
    slug: 'pi-typesafe',
    name: 'pi-typesafe',
    repoUrl: 'https://github.com/DevMortimer/pi-typesafe',
    assertion: {
      zh: '把 classify、triage、compare、score 等小判断批量交给 Jev，一次调用返回校准过的数值供 agent 使用。',
      en: 'Hands small structured judgments such as classify, triage, compare and score to Jev, returning calibrated numbers to the agent in one batched call.',
    },
    evidenceUrl: 'https://github.com/DevMortimer/pi-typesafe/blob/main/README.md#L7',
    verification: ['public-source', 'readme-claim'],
    category: 'agent-tooling',
    addedAt: '2026-10-29',
    reviewedAt: REVIEWED_AT,
  },
  {
    slug: 'agent-reflex',
    name: 'agent-reflex',
    repoUrl: 'https://github.com/psygreg/agent-reflex',
    assertion: {
      zh: '编码 agent 的前置守卫插件，把危险 shell 命令判定交给可替换的决策模型，Jev 是其中之一。',
      en: 'A guard plugin for coding agents that routes dangerous shell commands to a swappable decision model, Jev included.',
    },
    evidenceUrl: 'https://github.com/psygreg/agent-reflex/blob/main/README.md#L2',
    verification: ['public-source', 'readme-claim'],
    category: 'agent-tooling',
    addedAt: '2026-10-29',
    reviewedAt: REVIEWED_AT,
  },
  {
    slug: 'advocaat',
    name: 'advocaat',
    repoUrl: 'https://github.com/pithings/advocaat',
    assertion: {
      zh: '通过网关以 typesafe-ai/jev 作为模型标识发请求，把 Jev 当作可插拔的判定后端。',
      en: 'Requests the gateway with typesafe-ai/jev as the model id, treating Jev as a pluggable judgment backend.',
    },
    evidenceUrl: 'https://github.com/pithings/advocaat/blob/main/README.md#L315',
    verification: ['public-source', 'readme-claim'],
    category: 'application',
    addedAt: '2026-10-29',
    reviewedAt: REVIEWED_AT,
  },
  {
    slug: 'openai-scala-client',
    name: 'openai-scala-client',
    repoUrl: 'https://github.com/cequence-io/openai-scala-client',
    assertion: {
      zh: '通用 LLM 客户端把决策模型作为并列的一类 API，Jev 的 System One 与 OpenAI 的 Decisions 同层接入。',
      en: 'A general LLM client that treats decision models as a peer API class, placing Jev System One alongside OpenAI Decisions.',
    },
    evidenceUrl: 'https://github.com/cequence-io/openai-scala-client/blob/master/README.md#L78',
    verification: ['public-source', 'readme-claim'],
    category: 'sdk-client',
    lang: 'Scala',
    addedAt: '2026-10-29',
    reviewedAt: REVIEWED_AT,
  },
  {
    slug: 'decisionkit-dotnet',
    name: 'decisionkit-dotnet',
    repoUrl: 'https://github.com/iamjonatha/decisionkit-dotnet',
    assertion: {
      zh: '.NET 决策引擎把提供方做成可替换层，Jev 是其受支持后端之一。',
      en: 'A provider-independent .NET decision engine with Jev support as one of its backends.',
    },
    evidenceUrl: 'https://github.com/iamjonatha/decisionkit-dotnet/blob/main/README.md#L3',
    verification: ['public-source', 'readme-claim'],
    category: 'sdk-client',
    lang: 'C#',
    addedAt: '2026-10-29',
    reviewedAt: REVIEWED_AT,
  },
  {
    slug: 'typesafeai-dotnet-sdk',
    name: 'typesafeai-dotnet-sdk',
    repoUrl: 'https://github.com/saibimajdi/typesafeai-dotnet-sdk',
    assertion: {
      zh: '社区维护的 .NET 独立客户端，直接对接 System One HTTP API，README 明示非官方身份。',
      en: 'A community-maintained, explicitly independent .NET client for the System One HTTP API.',
    },
    evidenceUrl: 'https://github.com/saibimajdi/typesafeai-dotnet-sdk/blob/main/README.md#L13',
    verification: ['public-source', 'readme-claim'],
    category: 'sdk-client',
    lang: 'C#',
    addedAt: '2026-10-29',
    reviewedAt: REVIEWED_AT,
  },
];

/**
 * 公开列表 = 人工核验条目 + README 自述条目。
 *
 * README 自述条目的断言只复述证据行原文，并一律带 `readme-claim` 标签，
 * 表示调用点尚未核实。若 verify-jev-callsites.mjs 在该仓库源码里找到
 * 真实的 Jev 调用点，则该条升级为 `call-site-verified`，证据链接改指源码行。
 * 未找到不等于不存在，因此不降级、不删除。
 */
export const COVERAGE_ENTRIES: CoverageEntry[] = [...CURATED_ENTRIES, ...CLAIM_ENTRIES].map(
  (entry) => {
    const site = CALL_SITES[entry.slug];
    if (!site) return entry;
    const { owner, repo } = repoRef(entry.repoUrl);
    if (!owner) return entry;
    return {
      ...entry,
      evidenceUrl: `https://github.com/${owner}/${repo}/blob/${site.ref}/${site.file}#L${site.line}`,
      verification: entry.verification.includes('call-site-verified')
        ? entry.verification
        : [...entry.verification.filter((v) => v !== 'readme-claim'), 'call-site-verified'],
    };
  },
);

/** HOLD：证据不足，保留原因码与复查条件，不进入公开列表。 */
export interface HeldEntry {
  repoUrl: string;
  reason: 'missing-project-license' | 'insufficient-evidence' | 'not-a-decision-model';
  note: string;
  recheckWhen: string;
}

export const HELD_ENTRIES: HeldEntry[] = [
  {
    repoUrl: 'https://github.com/jlowin/vibecheck',
    reason: 'missing-project-license',
    note: '集成可用，但未找到项目级开源许可。',
    recheckWhen: '上游补上项目级 LICENSE 时复查',
  },
  {
    repoUrl: 'https://github.com/bespokelabsai/nimble',
    reason: 'missing-project-license',
    note: '捆绑的 agent skill 内有许可，不等于整个项目已授权。',
    recheckWhen: '根目录出现项目级 LICENSE 时复查',
  },
  {
    repoUrl: 'https://github.com/wangmingxuan666/Tiersense',
    reason: 'insufficient-evidence',
    note: '缺少可复用的实现证据，现有材料仅为请求示例与研究声明。',
    recheckWhen: '出现可检视的调用点或运行说明时复查',
  },
  {
    repoUrl: 'https://github.com/Changroro/code-video',
    reason: 'not-a-decision-model',
    note: 'Jev 只是示例视频的主题，不承载工具自身的决策。',
    recheckWhen: '不复查：已判定不符合「承载决策」条件',
  },
];

export function getEntry(slug: string): CoverageEntry | undefined {
  return COVERAGE_ENTRIES.find((entry) => entry.slug === slug);
}

export function entriesByCategory(): Array<{ category: Category; entries: CoverageEntry[] }> {
  return CATEGORIES.map((category) => ({
    category,
    entries: COVERAGE_ENTRIES.filter((entry) => entry.category === category),
  })).filter((group) => group.entries.length > 0);
}

export function allSlugs(): string[] {
  return COVERAGE_ENTRIES.map((entry) => entry.slug);
}

/** 覆盖条目的稳定排序：先分类顺序，再按收录名，避免星星数波动导致 URL 顺序抖动。 */
export function sortedEntries(): CoverageEntry[] {
  const order = new Map<Category, number>(CATEGORIES.map((c, i) => [c, i]));
  return [...COVERAGE_ENTRIES].sort((a, b) => {
    const byCategory = (order.get(a.category) ?? 99) - (order.get(b.category) ?? 99);
    if (byCategory !== 0) return byCategory;
    return a.name.localeCompare(b.name, 'en');
  });
}

export const REGISTRY_REVIEWED_AT = REVIEWED_AT;
