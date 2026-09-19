/**
 * Jev / TypeSafe 社区生态项目清单。
 * 数据由 scripts/fetch-ecosystem.mjs 定时从 GitHub API 刷新，stars 为采集时快照，会随时间变化。
 */

import type { Lang } from '../i18n/ui';

/** 数据快照日期（fetch-ecosystem.mjs 自动维护） */
export const dataAsOf = '2026-09-20';

export interface Project {
  /** owner/repo */
  repo: string;
  url: string;
  /** 一句话定位，8 种语言各一 */
  desc: Record<Lang, string>;
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
  title: Record<Lang, string>;
  lead: Record<Lang, string>;
}

export const categories: Category[] = [
  {
    key: 'curated',
    title: { zh: '精选清单', en: 'Curated lists', ja: '厳選リスト', ko: '선별된 목록', de: 'Kuratierte Listen', fr: 'Listes curatées', es: 'Listas curadas', pt: 'Listas curadas' },
    lead: {
      zh: '由社区维护的资源索引，适合作为进入 Jev 生态的第一站。',
      en: 'Community-maintained indexes — the best first stop when entering the Jev ecosystem.',
      ja: 'コミュニティが維持するインデックス — Jevエコシステムに入る際の最適な第一歩。',
      ko: '커뮤니티가 유지 관리하는 인덱스 — Jev 생태계에 진입할 때 가장 먼저 찾게 되는 곳입니다.',
      de: 'Von der Community gepflegte Indexe — der beste erste Anlaufpunkt beim Einstieg in die Jev-Ökosystem.',
      fr: 'Index maintenus par la communauté — le meilleur point de départ pour entrer dans l\'écosystème Jev.',
      es: 'Índices mantenidos por la comunidad: el mejor punto de partida para entrar en el ecosistema Jev.',
      pt: 'Índices mantidos pela comunidade — o melhor ponto de partida ao entrar no ecossistema Jev.',
    },
  },
  {
    key: 'agent',
    title: { zh: 'Agent 与工作流', en: 'Agents & workflows', ja: 'エージェントとワークフロー', ko: '에이전트 및 워크플로우', de: 'Agenten & Workflows', fr: 'Agents et workflows', es: 'Agentes y flujos de trabajo', pt: 'Agentes e fluxos de trabalho' },
    lead: {
      zh: '把 Jev 的置信度决策嵌入真实 agent 循环，用于游戏、代码审查与软件工厂。',
      en: 'Embedding Jev confidence decisions into real agent loops — games, code review, and software factories.',
      ja: 'ゲーム、コードレビュー、ソフトウェアファクトリーなど、実際のエージェントループにJevの信頼性判断を組み込む。',
      ko: '게임, 코드 리뷰, 소프트웨어 팩토리 등 실제 에이전트 루프에 Jev의 신뢰도 결정을 임베딩합니다.',
      de: 'Integration von Jev-Vertrauensentscheidungen in echte Agenten-Schleifen — Spiele, Code-Reviews und Software-Fabriken.',
      fr: 'Intégration des décisions de confiance Jev dans les boucles d\'agents réelles — jeux, revue de code et usines logicielles.',
      es: 'Integración de decisiones de confianza Jev en bucles reales de agentes: juegos, revisión de código y fábricas de software.',
      pt: 'Integrar decisões de confiança Jev em loops reais de agentes — jogos, revisão de código e fábricas de software.',
    },
  },
  {
    key: 'integration',
    title: { zh: '集成与桥接', en: 'Integrations & bridges', ja: 'インテグレーションとブリッジ', ko: '통합 및 브리지', de: 'Integrationen & Brücken', fr: 'Intégrations & ponts', es: 'Integraciones y puentes', pt: 'Integrações e pontes' },
    lead: {
      zh: '把 Jev 接入既有数据源与协议栈，例如 Postgres 与 ACP/MCP。',
      en: 'Wiring Jev into existing data sources and protocol stacks such as Postgres and ACP/MCP.',
      ja: 'PostgresやACP/MCPなどの既存データソースやプロトコルスタックにJevを接続する。',
      ko: 'Postgres 및 ACP/MCP와 같은 기존 데이터 소스 및 프로토콜 스택에 Jev를 연결합니다.',
      de: 'Anbindung von Jev an bestehende Datenquellen und Protokoll-Stacks wie Postgres und ACP/MCP.',
      fr: 'Connexion de Jev aux sources de données et piles de protocoles existantes telles que Postgres et ACP/MCP.',
      es: 'Conexión de Jev con fuentes de datos y pilas de protocolos existentes como Postgres y ACP/MCP.',
      pt: 'Conectar Jev a fontes de dados e pilhas de protocolos existentes, como Postgres e ACP/MCP.',
    },
  },
  {
    key: 'research',
    title: { zh: '复现与研究', en: 'Research & reimplementation', ja: '研究と再実装', ko: '연구 및 재구현', de: 'Forschung & Neimplementierung', fr: 'Recherche & réimplémentation', es: 'Investigación y reimplantación', pt: 'Pesquisa e reimplementação' },
    lead: {
      zh: '关于 System One 决策模型本身的开放复现与实验。',
      en: 'Open reimplementations and experiments on the System One decision model itself.',
      ja: 'System One意思決定モデル自体に関するオープンな再実装と実験。',
      ko: 'System One 의사결정 모델 자체에 대한 오픈 리구현 및 실험.',
      de: 'Offene Neimplementierungen und Experimente zum System-One-Entscheidungsmodell selbst.',
      fr: 'Réimplémentations open source et expérimentations sur le modèle de décision System One lui-même.',
      es: 'Reimplantaciones y experimentos de código abierto sobre el propio modelo de decisión System One.',
      pt: 'Reimplementações e experimentos de código aberto no próprio modelo de decisão System One.',
    },
  },
  {
    key: 'tooling',
    title: { zh: '工具链', en: 'Tooling', ja: 'ツール', ko: '도구', de: 'Werkzeuge', fr: 'Outils', es: 'Herramientas', pt: 'Ferramentas' },
    lead: {
      zh: '把 Jev 的快速打分能力接到开发工具链里，直接改善日常编码体验。',
      en: 'Plugging Jev scoring into developer tooling to improve everyday coding.',
      ja: 'Jevのスコアリングを開発者ツールに組み込み、日常のコーディングを改善する。',
      ko: '일상적인 코딩을 개선하기 위해 Jev 점수를 개발자 도구에 연결합니다.',
      de: 'Einbindung der Jev-Bewertung in Entwickler-Tools zur Verbesserung der täglichen Codierung.',
      fr: 'Intégration du scoring Jev dans les outils de développement pour améliorer la programmation quotidienne.',
      es: 'Integración de la puntuación Jev en herramientas de desarrollo para mejorar la programación diaria.',
      pt: 'Integrar a pontuação Jev nas ferramentas de desenvolvimento para melhorar a programação do dia a dia.',
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
      ja: 'エビデンスに基づくユースケース、パターン、プロンプト、スターターコード — 最も広範なJevリソースコレクション。',
      ko: '증거 기반 사용 사례, 패턴, 프롬프트 및 시작 코드 — 가장 광범위한 Jev 리소스 컬렉션입니다.',
      de: 'Evidenzbasierte Anwendungsfälle, Muster, Prompts und Starter-Code — die umfassendste Jev-Ressourcensammlung.',
      fr: 'Cas d\'usage étayés par des preuves, modèles, invites et code de démarrage — la collection de ressources Jev la plus vaste.',
      es: 'Casos de uso, patrones, prompts y código de inicio respaldados por evidencia: la colección de recursos Jev más amplia.',
      pt: 'Casos de uso, padrões, prompts e código inicial respaldados por evidências — a coleção mais ampla de recursos Jev.',
    },
    stars: 603,
    forks: 113,
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
      ja: 'TypeSafe、System Oneモデル、およびJevの公式リソースとコミュニティプロジェクトの厳選リスト。',
      ko: 'TypeSafe, System One 모델 및 Jev를 위한 공식 리소스와 커뮤니티 프로젝트의 선별 목록입니다.',
      de: 'Kuratierte Liste offizieller Ressourcen und Community-Projekte für TypeSafe, System-One-Modelle und Jev.',
      fr: 'Liste curatée des ressources officielles et projets communautaires pour TypeSafe, les modèles System One et Jev.',
      es: 'Lista curada de recursos oficiales y proyectos comunitarios para TypeSafe, modelos System One y Jev.',
      pt: 'Lista curada de recursos oficiais e projetos da comunidade para TypeSafe, modelos System One e Jev.',
    },
    stars: 321,
    forks: 50,
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
      ja: 'Jevを基盤とした公開プロジェクト、インテグレーション、ディスカッションの厳選リスト。',
      ko: 'Jev를 기반으로 구축된 공개 프로젝트, 통합 및 토론의 선별 목록입니다.',
      de: 'Eine kuratierte Liste öffentlicher Projekte, Integrationen und Diskussionen, die auf Jev aufbauen.',
      fr: 'Une liste curatée de projets publics, intégrations et discussions construits sur Jev.',
      es: 'Una lista curada de proyectos públicos, integraciones y discusiones construidas sobre Jev.',
      pt: 'Uma lista curada de projetos públicos, integrações e discussões construídos sobre Jev.',
    },
    stars: 330,
    forks: 52,
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
      ja: '構造化されたエミュレータ状態からSuper Mario Bros.をプレイするTypeSafe/Jevエージェント。',
      ko: '구조화된 에뮬레이터 상태에서 Super Mario Bros.를 플레이하는 TypeSafe/Jev 에이전트입니다.',
      de: 'Ein TypeSafe/Jev-Agent, der Super Mario Bros. aus strukturiertem Emulator-Status spielt.',
      fr: 'Un agent TypeSafe/Jev qui joue à Super Mario Bros. à partir de l\'état de l\'émulateur structuré.',
      es: 'Un agente TypeSafe/Jev que juega Super Mario Bros. a partir del estado estructurado del emulador.',
      pt: 'Um agente TypeSafe/Jev que joga Super Mario Bros. a partir do estado estruturado do emulador.',
    },
    stars: 278,
    forks: 27,
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
      ja: 'TypeSafe Jevモデルに基づくソフトウェアファクトリーフォアマン。',
      ko: 'TypeSafe Jev 모델을 기반으로 한 소프트웨어 팩토리 포어맨입니다.',
      de: 'Software-Factory-Foreman basierend auf dem TypeSafe Jev-Modell.',
      fr: 'Foreman d\'usine logicielle basé sur le modèle Jev TypeSafe.',
      es: 'Foreman de Fábrica de Software basado en el modelo Jev TypeSafe.',
      pt: 'Foreman de Fábrica de Software baseado no modelo Jev TypeSafe.',
    },
    stars: 362,
    forks: 24,
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
      ja: 'TypeSafe Jevを使用して構築された段階的なコードレビューワークフローとローカルダッシュボード。',
      ko: 'TypeSafe Jev로 구축된 단계별 코드 리뷰 워크플로우 및 로컬 대시보드입니다.',
      de: 'Ein gestaffelter Code-Review-Workflow und lokales Dashboard, erstellt mit TypeSafe Jev.',
      fr: 'Un workflow de revue de code par étapes et un tableau de bord local construits avec Jev TypeSafe.',
      es: 'Un flujo de trabajo de revisión de código por etapas y un panel local construidos con TypeSafe Jev.',
      pt: 'Um fluxo de trabalho de revisão de código em etapas e um painel local construídos com TypeSafe Jev.',
    },
    stars: 326,
    forks: 19,
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
      ja: '自然言語でPostgresテーブルに質問する — Jevによって駆動されるPostgreSQL拡張機能。',
      ko: 'Plain language로 Postgres 테이블에 질문하세요 — Jev가 구동하는 PostgreSQL 확장 기능입니다.',
      de: 'Stellen Sie Ihren Postgres-Tabellen Fragen in natürlicher Sprache — eine PostgreSQL-Erweiterung, angetrieben von Jev.',
      fr: 'Posez des questions à vos tables Postgres en langage naturel — une extension PostgreSQL alimentée par Jev.',
      es: 'Haz preguntas a tus tablas de Postgres en lenguaje natural: una extensión de PostgreSQL impulsada por Jev.',
      pt: 'Faça perguntas às suas tabelas Postgres em linguagem natural — uma extensão PostgreSQL alimentada por Jev.',
    },
    stars: 205,
    forks: 11,
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
      ja: 'データについてAIに質問するための小型の型安全クライアント。',
      ko: '데이터에 대한 AI 질문에 답하기 위한 작은 타입 안전 클라이언트입니다.',
      de: 'Ein kleiner, typsicherer Client zum Stellen von KI-Fragen zu Ihren Daten.',
      fr: 'Un petit client type-safe pour poser des questions à l\'IA sur vos données.',
      es: 'Un cliente pequeño y seguro en tipos para hacer preguntas a la IA sobre tus datos.',
      pt: 'Um cliente pequeno e type-safe para fazer perguntas à IA sobre seus dados.',
    },
    stars: 84,
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
      ja: 'JevをあらゆるLLMとブリッジするACPおよびMCPアダプター — Codex、Claude、Grok、OpenCodeとともに型付き判断を提供。',
      ko: 'Jev를 모든 LLM과 연결하는 ACP 및 MCP 어댑터 — Codex, Claude, Grok, OpenCode와 함께 타입 안전한 결정을 제공합니다.',
      de: 'ACP- und MCP-Adapter, der Jev mit beliebigen LLMs verbindet — typisierte Entscheidungen neben Codex, Claude, Grok und OpenCode.',
      fr: 'Adaptateur ACP et MCP faisant le pont entre Jev et tout LLM — décisions typées aux côtés de Codex, Claude, Grok et OpenCode.',
      es: 'Adaptador ACP y MCP que conecta Jev con cualquier LLM: decisiones tipadas junto a Codex, Claude, Grok y OpenCode.',
      pt: 'Adaptador ACP e MCP que conecta Jev a qualquer LLM — decisões tipadas ao lado de Codex, Claude, Grok e OpenCode.',
    },
    stars: 23,
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
      ja: '小型のオープンな意思決定モデル：状態＋型付き質問 → 較正された確率、Qwen3.5で再実装。',
      ko: '작은 오픈 의사결정 모델: 상태 + 타입 안전한 질문 → 보정된 확률, Qwen3.5에서 재구현.',
      de: 'Ein kleines offenes Entscheidungsmodell: Zustand + typisierte Fragen → kalibrierte Wahrscheinlichkeiten, neu erstellt auf Qwen3.5.',
      fr: 'Un petit modèle de décision open source : état + questions typées → probabilités calibrées, recréé sur Qwen3.5.',
      es: 'Un modelo de decisión pequeño y de código abierto: estado + preguntas tipadas → probabilidades calibradas, recreado en Qwen3.5.',
      pt: 'Um pequeno modelo de decisão de código aberto: estado + perguntas tipadas → probabilidades calibradas, recriado no Qwen3.5.',
    },
    stars: 74,
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
      ja: '自宅で3090を使ってJevのようなものを動かすことは可能か？',
      ko: '집에서 3090으로 Jev와 유사한 것을 실행할 수 있을까요?',
      de: 'Können wir etwas wie Jev auf einer 3090 zu Hause ausführen?',
      fr: 'Peut-on faire tourner quelque chose comme Jev sur une 3090 à la maison ?',
      es: '¿Podemos ejecutar algo como Jev en una 3090 en casa?',
      pt: 'É possível rodar algo como Jev em uma 3090 em casa?',
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
      ja: 'Jev判断にコンパクション要約を置き換えるClaude Codeプラグイン — 各ツール呼び出しを1回の高速リクエストでスコアリングし、古いものをドロップし、保持コンテンツはそのまま維持。',
      ko: 'Jev 결정으로 컴팩션 요약문을 대체하는 Claude Code 플러그인 — 각 도구 호출은 한 번의 빠른 요청으로 점수를 받고, 오래된 것은 삭제되며, 유지된 콘텐츠는 원문 그대로 유지됩니다.',
      de: 'Claude-Code-Plugin, das Komprimierungs-Zusammenfassungen durch Jev-Entscheidungen ersetzt — jeder Tool-Aufruf wird in einer schnellen Anfrage bewertet, veraltete werden verworfen, der erhaltene Inhalt bleibt unverändert.',
      fr: 'Plugin Claude Code remplaçant les résumés de compaction par des décisions Jev — chaque appel d\'outil est noté en une seule requête rapide, les obsolètes sont supprimés, le contenu conservé est identique.',
      es: 'Plugin de Claude Code que reemplaza los resúmenes de compresión con decisiones Jev: cada llamada a herramienta se puntúa en una sola solicitud rápida, las obsoletas se descartan y el contenido se mantiene intacto.',
      pt: 'Plugin Claude Code que substitui resumos de compactação por decisões Jev — cada chamada de ferramenta pontuada em uma única solicitação rápida, as obsoletas descartadas, o conteúdo mantido integralmente.',
    },
    stars: 4039,
    forks: 213,
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
