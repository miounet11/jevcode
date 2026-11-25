import type { Localized } from '../i18n/ui';

export type VibeTrack = 'foundations' | 'workflows' | 'blueprints' | 'operations' | 'roadmap';
export type VibeLevel = 'beginner' | 'intermediate' | 'advanced';

export interface VibeTutorial {
  slug: string;
  track: VibeTrack;
  level: VibeLevel;
  completionPct: number;
  estimatedMinutes: number;
  heroImage: string;
  relatedConfigSlug: string;
  title: Localized<string>;
  tagline: Localized<string>;
  overview: Localized<string>;
  readinessNote: Localized<string>;
  steps: Localized<string>[];
  vibePrompt: string;
  configFilename: string;
  configLang: string;
  configCode: string;
  programFilename: string;
  programLang: string;
  programCode: string;
}

export const VIBE_TUTORIALS: VibeTutorial[] = [
  {
    "slug": "vibe-coding-foundations",
    "track": "foundations",
    "level": "beginner",
    "completionPct": 96,
    "estimatedMinutes": 15,
    "heroImage": "/img/guides/vibecoding-hero.webp",
    "relatedConfigSlug": "cicd-release-quality-gate",
    "title": {
      "en": "Production AI Vibe Coding Foundations (From Fuzzy Prompt to Verified Release)",
      "zh": "生产级 AI Vibe Coding 基础：从模糊提示词到可验收上线",
      "ja": "本番 AI Vibe コーディングの基礎 (曖昧なプロンプトから検証済みリリースへ)",
      "ko": "프로덕션 AI Vibe 코딩의 기초 (모호한 프롬프트에서 검증된 릴리스까지)",
      "de": "Produktionsreife AI Vibe Coding Grundlagen (Von vagen Prompts zu verifizierten Releases)",
      "fr": "Fondations du Vibe Coding en production (Du prompt flou au release vérifié)",
      "es": "Fundamentos de AI Vibe Coding en producción (Desde prompts vagos hasta lanzamientos verificados)",
      "pt": "Fundamentos de AI Vibe Coding em produção (De prompts vagos a lançamentos verificados)"
    },
    "tagline": {
      "en": "Why naive vibe coding breaks in production—and how spec contracts, automated tests, and Jev gates fix it",
      "zh": "为什么盲目 Vibe Coding 上线必翻车？用契约规范、自动测试与 Jev 门控构建高可靠闭环",
      "ja": "なぜ直感的な Vibe コーディングが本番環境で失敗するのか、そして仕様契約、自動テスト、および Jev ゲートがそれを解決する方法",
      "ko": "왜 직관적인 Vibe 코딩이 프로덕션 환경에서 실패하는지, 그리고 사양 계약, 자동 테스트, 및 Jev 게이트가 이를 해결하는 방법",
      "de": "Warum naives Vibe Coding in der Produktion versagt – und wie Spezifikationsverträge, automatisierte Tests und Jev-Gates es beheben",
      "fr": "Pourquoi le Vibe coding naïf échoue en production – et comment les contrats de spécification, les tests automatisés et les portes Jev le corrigent",
      "es": "Por qué el Vibe coding ingenuo falla en producción y cómo los contratos de especificación, las pruebas automatizadas y las puertas Jev lo solucionan",
      "pt": "Por que o Vibe coding ingênuo falha em produção e como contratos de especificação, testes automatizados e portões Jev o corrigem"
    },
    "overview": {
      "en": "AI Vibe Coding is not blindly accepting generated diffs. Production-grade Vibe Coding splits work into four repeatable beats: concise architectural spec, bounded AI coding wave, automated test + typecheck verification, and objective Jev acceptance gating.",
      "zh": "真正的工程级 AI Vibe Coding 绝不是盲目接受代码补全，而是四步可复现闭环：精炼契约规划 → 限定作用域 AI 编码 → 全量单测与类型检查 → 客观 Jev 终验放行。",
      "ja": "AI Vibe コーディングは生成された差分を盲目的に受け入れるものではありません。本番グレードの Vibe コーディングは、作業を 4 つの反復可能なステップに分割します：簡潔なアーキテクチャ仕様、境界付き AI コーディングウェーブ、自動テストおよび型チェックによる検証、そして客観的な Jev 受入ゲート。",
      "ko": "AI Vibe 코딩은 생성된 디퍼를 맹목적으로 수용하는 것이 아닙니다. 프로덕션급 Vibe 코딩은 작업을 네 가지 반복 가능한 단계로 나눕니다: 간결한 아키텍처 사양, 범주화된 AI 코딩 웨이브, 자동 테스트 및 타입체크 검증, 그리고 객관적인 Jev 수용 게이트.",
      "de": "AI Vibe Coding bedeutet nicht, generierte Diffs blind zu akzeptieren. Produktionsreifes Vibe Coding teilt die Arbeit in vier wiederholbare Schritte auf: prägnante Architektur-Spezifikation, begrenzter AI-Coding-Wave, automatisierte Test- und Typüberprüfung sowie objektives Jev-Akzeptanz-Gating.",
      "fr": "Le Vibe Coding IA ne consiste pas à accepter aveuglément les diffs générés. Le Vibe Coding de niveau production divise le travail en quatre étapes répétables : spécification architecturale concise, vague de codage IA bornée, vérification par tests automatisés et typechecking, et gating d'acceptation objectif Jev.",
      "es": "El Vibe Coding de IA no consiste en aceptar ciegamente los diffs generados. El Vibe Coding de grado de producción divide el trabajo en cuatro ritmos repetibles: especificación arquitectónica concisa, ola de codificación de IA acotada, verificación con pruebas automatizadas y typecheck, y puerta de aceptación objetiva Jev.",
      "pt": "AI Vibe Coding não é aceitar cegamente diffs gerados. O Vibe Coding de nível de produção divide o trabalho em quatro ritmos repetíveis: especificação arquitetônica concisa, onda de codificação de IA delimitada, verificação com testes automatizados e typecheck, e portão de aceitação objetiva Jev."
    },
    "readinessNote": {
      "en": "96% completable end-to-end today across web apps, APIs, CLIs, and automation scripts.",
      "zh": "当前可完成度 96%：完整覆盖 Web 应用、后端 API、CLI 工具与运维脚本。",
      "ja": "今日、Web アプリ、API、CLI、および自動化スクリプトにおいて、エンドツーエンドで 96% のタスクを完了可能です。",
      "ko": "오늘날 웹 앱, API, CLI, 및 자동화 스크립트에서 엔드투엔드 96% 를 완료할 수 있습니다.",
      "de": "Heute können 96 % der Aufgaben end-to-end abgeschlossen werden, über Web-Apps, APIs, CLIs und Automatisierungsskripte hinweg.",
      "fr": "96 % des tâches peuvent être achevées de bout en bout aujourd'hui, pour les applications web, les API, les CLIs et les scripts d'automatisation.",
      "es": "Hoy es posible completar el 96 % de las tareas de extremo a extremo en aplicaciones web, APIs, CLIs y scripts de automatización.",
      "pt": "Hoje é possível completar 96 % das tarefas de ponta a ponta em aplicativos web, APIs, CLIs e scripts de automação."
    },
    "steps": [
      {
        "en": "Write a 15-line contract naming owned files, exact inputs/outputs, and failure modes before asking the AI to code.",
        "zh": "动笔写代码前先写 15 行契约：明确归属文件、输入输出接口与异常边界。",
        "ja": "AI にコーディングを依頼する前に、所有するファイル、正確な入出力、および失敗モードを指定した 15 行の契約を作成します。",
        "ko": "AI 에게 코딩을 요청하기 전에 소유한 파일, 정확한 입력/출력, 및 실패 모드를 명시한 15 줄의 계약을 작성합니다.",
        "de": "Bevor Sie den AI bitten zu coden, schreiben Sie einen 15-Zeilen-Vertrag, der die eigenen Dateien, exakte Eingaben/Ausgaben und Fehlermodi benennt.",
        "fr": "Écrivez un contrat de 15 lignes nommant les fichiers possédés, les entrées/sorties exactes et les modes d'échec avant de demander à l'IA de coder.",
        "es": "Escriba un contrato de 15 líneas que nombre los archivos propios, las entradas/salidas exactas y los modos de fallo antes de pedirle a la IA que code.",
        "pt": "Escreva um contrato de 15 linhas nomeando os arquivos de propriedade, entradas/saídas exatas e modos de falha antes de pedir à IA para codar."
      },
      {
        "en": "Run your coding CLI (Clavue CLI, Claude Code, Cursor, Codex, or Grok CLI) against that bounded scope.",
        "zh": "交给编码 CLI（Clavue CLI / Claude Code / Cursor / Codex）在严格作用域内执行实现。",
        "ja": "その境界付きスコープに対してコーディング CLI（Clavue CLI、Claude Code、Cursor、Codex、または Grok CLI）を実行します。",
        "ko": "그 범주화된 스코프에 대해 코딩 CLI(Clavue CLI, Claude Code, Cursor, Codex, 또는 Grok CLI) 를 실행합니다.",
        "de": "Führen Sie Ihre Coding-CLI (Clavue CLI, Claude Code, Cursor, Codex oder Grok CLI) gegen diesen begrenzten Umfang aus.",
        "fr": "Exécutez votre CLI de codage (Clavue CLI, Claude Code, Cursor, Codex ou Grok CLI) contre cette portée bornée.",
        "es": "Ejecute su CLI de codificación (Clavue CLI, Claude Code, Cursor, Codex o Grok CLI) contra ese alcance acotado.",
        "pt": "Execute sua CLI de codificação (Clavue CLI, Claude Code, Cursor, Codex ou Grok CLI) contra esse escopo delimitado."
      },
      {
        "en": "Verify with real unit tests, build gates, and clavue-jev acceptance scoring—never trust \"looks good to me\".",
        "zh": "用真实单测、构建门禁与 clavue-jev 验收裁决把关，拒绝口头「看起来没问题」。",
        "ja": "実際の単体テスト、ビルドゲート、および clavue-jev 受入スコアリングで検証し、「私には良さそう」という感覚に頼ることはありません。",
        "ko": "실제 단위 테스트, 빌드 게이트, 및 clavue-jev 수용 점수화로 검증하며, '나에게 괜찮아 보인다'는 믿음에 의존하지 않습니다.",
        "de": "Verifizieren Sie mit echten Unit-Tests, Build-Gates und clavue-jev-Akzeptanz-Bewertung – vertrauen Sie niemals auf 'sieht gut aus'.",
        "fr": "Vérifiez avec de vrais tests unitaires, des portes de build et une notation d'acceptation clavue-jev – ne faites jamais confiance à 'ça a l'air bon'.",
        "es": "Verifique con pruebas unitarias reales, puertas de compilación y puntuación de aceptación clavue-jev; nunca confíe en 'me parece bien'.",
        "pt": "Verifique com testes unitários reais, portões de build e pontuação de aceitação clavue-jev; nunca confie em 'parece bom para mim'."
      }
    ],
    "vibePrompt": "Build a minimal rate-limited Node.js HTTP endpoint POST /api/triage that calls https://api.jevcode.ai/v1/judge.\nOwned files: server/triage.mjs, test/triage.test.mjs.\nConstraints: zero third-party deps, 4s AbortSignal timeout, return 400 on missing text, 502 on upstream error.\nRun node --test before replying.",
    "configFilename": "AGENTS.md",
    "configLang": "markdown",
    "configCode": "# Project Vibe Coding Rules\n- Never fabricate credentials or silence failing tests.\n- Every new endpoint requires at least 1 happy-path and 2 error-path tests.\n- Run `npm run check && npm test` before declaring done.\n- Keep diffs surgical; do not reformat unrelated files.",
    "programFilename": "server/triage.mjs",
    "programLang": "javascript",
    "programCode": "import { createServer } from 'node:http';\n\nexport function createTriageServer(apiKey = process.env.JEVCODE_API_KEY) {\n  return createServer(async (req, res) => {\n    if (req.method !== 'POST' || req.url !== '/api/triage') {\n      res.writeHead(404); return res.end();\n    }\n    const chunks = [];\n    for await (const c of req) chunks.push(c);\n    const { text } = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}');\n    if (!text || typeof text !== 'string') {\n      res.writeHead(400, { 'content-type': 'application/json' });\n      return res.end(JSON.stringify({ error: 'text is required' }));\n    }\n    const r = await fetch('https://api.jevcode.ai/v1/judge', {\n      method: 'POST',\n      headers: { 'content-type': 'application/json', authorization: `Bearer ${apiKey}` },\n      body: JSON.stringify({ state: text.slice(0, 3500), questions: { urgent: { type: 'noul', instructions: 'Urgent production issue?' } } }),\n      signal: AbortSignal.timeout(4000),\n    });\n    res.writeHead(r.ok ? 200 : 502, { 'content-type': 'application/json' });\n    res.end(await r.text());\n  });\n}"
  },
  {
    "slug": "agents-md-cursorrules-blueprint",
    "track": "foundations",
    "level": "beginner",
    "completionPct": 97,
    "estimatedMinutes": 12,
    "heroImage": "/img/guides/vibecoding-hero.webp",
    "relatedConfigSlug": "mcp-zero-trust-ide-policy",
    "title": {
      "en": "Writing High-Signal AGENTS.md, CLAUDE.md & .cursorrules Files",
      "zh": "高信噪比 AGENTS.md / CLAUDE.md / .cursorrules 编写指南",
      "ja": "高品質な AGENTS.md、CLAUDE.md、.cursorrules ファイルの作成",
      "ko": "고신호 AGENTS.md, CLAUDE.md 및 .cursorrules 파일 작성",
      "de": "Erstellen von High-Signal AGENTS.md, CLAUDE.md & .cursorrules-Dateien",
      "fr": "Rédaction de fichiers AGENTS.md, CLAUDE.md et .cursorrules à haute valeur",
      "es": "Escribir archivos AGENTS.md, CLAUDE.md y .cursorrules de alta señal",
      "pt": "Escrever arquivos AGENTS.md, CLAUDE.md e .cursorrules de alta sinalização"
    },
    "tagline": {
      "en": "Stop repeating architecture rules in every chat—encode verification commands and red lines directly in repo config",
      "zh": "别在每次对话里重复架构约定——把校验命令、目录规范与安全红线固化进仓库配置",
      "ja": "すべてのチャットでアーキテクチャルールを繰り返すのをやめましょう。リポジトリ設定に直接検証コマンドとレッドラインをエンコードします。",
      "ko": "모든 채팅에서 아키텍처 규칙을 반복하는 것을 멈추세요. 리포지토리 설정에 직접 검증 명령어와 레드 라인을 인코딩하세요.",
      "de": "Hören Sie auf, Architekturregeln in jedem Chat zu wiederholen – kodieren Sie Verifikationsbefehle und rote Linien direkt in der Repo-Konfiguration.",
      "fr": "Arrêtez de répéter les règles d'architecture dans chaque chat – encodez les commandes de vérification et les lignes rouges directement dans la configuration du dépôt.",
      "es": "Deje de repetir reglas de arquitectura en cada chat – codifique comandos de verificación y líneas rojas directamente en la configuración del repositorio.",
      "pt": "Pare de repetir regras de arquitetura em cada chat – codifique comandos de verificação e linhas vermelhas diretamente na configuração do repositório."
    },
    "overview": {
      "en": "A crisp 60-line repo instruction file multiplies AI coding accuracy by 3×. Include build/test commands, directory ownership, security red lines, and exact formatting constraints.",
      "zh": "一份 60 行以内的精准仓库规则文件可让 AI 编码一次通过率翻三倍：顶部列出构建/测试命令，中段声明目录边界，底部锁死安全与格式红线。",
      "ja": "鋭い 60 行のリポジトリ指示ファイルは、AI コーディングの精度を 3 倍に高めます。ビルド/テストコマンド、ディレクトリ所有権、セキュリティレッドライン、および正確なフォーマット制約を含めてください。",
      "ko": "명확한 60 줄의 리포지토리 지침 파일은 AI 코딩 정확도를 3 배로 높입니다. 빌드/테스트 명령어, 디렉토리 소유권, 보안 레드 라인, 그리고 정확한 포맷팅 제약사항을 포함하세요.",
      "de": "Eine präzise 60-Zeilen-Repo-Anweisungsdatei vervielfacht die AI-Coding-Genauigkeit um das 3-fache. Beziehen Sie Build/Test-Befehle, Verzeichnisbesitz, Sicherheitsrote Linien und exakte Formatierungseinschränkungen ein.",
      "fr": "Un fichier d'instructions de dépôt concis de 60 lignes multiplie la précision du codage par IA par 3×. Incluez les commandes de build/test, la propriété des répertoires, les lignes rouges de sécurité et les contraintes de formatage exactes.",
      "es": "Un archivo de instrucciones de repositorio conciso de 60 líneas multiplica la precisión del codificación por IA por 3×. Incluya comandos de build/test, propiedad de directorios, líneas rojas de seguridad y restricciones de formato exactas.",
      "pt": "Um arquivo de instruções de repositório conciso de 60 linhas multiplica a precisão de codificação por IA em 3×. Inclua comandos de build/test, propriedade de diretórios, linhas vermelhas de segurança e restrições de formatação exatas."
    },
    "readinessNote": {
      "en": "97% completable immediately: drops into any Git repository in under 5 minutes.",
      "zh": "当前可完成度 97%：5 分钟内可落地到任意存量或新建 Git 仓库。",
      "ja": "97% はすぐに完了可能：5 分以内に任意の Git リポジトリにドロップできます。",
      "ko": "97% 즉시 완료 가능: 5 분 이내에 어떤 Git 리포지토리든 바로 적용할 수 있습니다.",
      "de": "97% sofort abschließbar: fällt in jede Git-Repository in unter 5 Minuten.",
      "fr": "97% terminables immédiatement : s'intègre dans n'importe quel dépôt Git en moins de 5 minutes.",
      "es": "97% completables inmediatamente: se integra en cualquier repositorio Git en menos de 5 minutos.",
      "pt": "97% completáveis imediatamente: cai em qualquer repositório Git em menos de 5 minutos."
    },
    "steps": [
      {
        "en": "Document exact verify commands (`npm run check`, `npm test`, `npm run build`) at the top of AGENTS.md.",
        "zh": "在 AGENTS.md 顶部写明唯一权威的校验与测试命令。",
        "ja": "AGENTS.md の上部に正確な検証コマンド（`npm run check`、`npm test`、`npm run build`）を文書化します。",
        "ko": "AGENTS.md 상단에 정확한 검증 명령어 (`npm run check`, `npm test`, `npm run build`) 를 문서화합니다.",
        "de": "Dokumentieren Sie exakte Verifikationsbefehle (`npm run check`, `npm test`, `npm run build`) am Anfang von AGENTS.md.",
        "fr": "Documentez les commandes de vérification exactes (`npm run check`, `npm test`, `npm run build`) en haut de AGENTS.md.",
        "es": "Documente los comandos de verificación exactos (`npm run check`, `npm test`, `npm run build`) en la parte superior de AGENTS.md.",
        "pt": "Documente os comandos de verificação exatos (`npm run check`, `npm test`, `npm run build`) no topo de AGENTS.md."
      },
      {
        "en": "List explicit red lines (no hardcoded secrets, no nested <main>, no duplicate dollar signs, clean working tree).",
        "zh": "清晰列举硬红线（禁止硬编码密钥、禁止跳过失败测试、保持工作区干净）。",
        "ja": "明示的なレッドラインをリストします（ハードコードされたシークレットなし、ネストされた <main> なし、二重の $ なし、クリーンなワーキングツリー）。",
        "ko": "명시적인 레드 라인을 나열합니다 (하드코딩된 시크릿 없음, 중첩된 <main> 없음, 이중 $ 없음, 깔끔한 워킹 트리).",
        "de": "Listen Sie explizite rote Linien auf (keine hartcodierten Geheimnisse, keine verschachtelten <main>, keine doppelten $, sauberer Arbeitsbaum).",
        "fr": "Listez les lignes rouges explicites (aucun secret codé en dur, aucun <main> imbriqué, aucun $ double, arbre de travail propre).",
        "es": "Liste las líneas rojas explícitas (sin secretos codificados en dur, sin <main> anidados, sin $ dobles, árbol de trabajo limpio).",
        "pt": "Liste as linhas vermelhas explícitas (sem segredos codificados em dur, sem <main> aninhados, sem $ duplos, árvore de trabalho limpa)."
      },
      {
        "en": "Point CLAUDE.md and .cursorrules to the same canonical rules so every AI tool behaves identically.",
        "zh": "让 CLAUDE.md、.cursorrules 与 Clavue CLI 共享同一套规则源文件。",
        "ja": "CLAUDE.md と .cursorrules を同じ規範ルールに指し示し、すべての AI ツールが同一の動作をするようにします。",
        "ko": "CLAUDE.md 와 .cursorrules 를 동일한 표준 규칙으로 지시하여 모든 AI 도구가 동일하게 작동하도록 합니다.",
        "de": "Verweisen Sie CLAUDE.md und .cursorrules auf dieselben kanonischen Regeln, damit jedes AI-Tool identisch verhält.",
        "fr": "Pointez CLAUDE.md et .cursorrules vers les mêmes règles canoniques afin que chaque outil IA se comporte identiquement.",
        "es": "Dirija CLAUDE.md y .cursorrules a las mismas reglas canónicas para que cada herramienta de IA se comporte idénticamente.",
        "pt": "Aponte CLAUDE.md e .cursorrules para as mesmas regras canônicas para que cada ferramenta de IA se comporte identicamente."
      }
    ],
    "vibePrompt": "Audit this repository's package.json, directory layout, and existing test scripts, then draft a concise (<70 lines) AGENTS.md covering architecture boundaries, verify commands, and security invariants.",
    "configFilename": "AGENTS.md",
    "configLang": "markdown",
    "configCode": "# Repository Operating Manual\n## Verify Commands\n- Typecheck: `npm run check`\n- Unit tests: `npm test`\n- Production build: `npm run build`\n\n## Hard Invariants\n1. Zero secrets in git; read credentials from environment variables only.\n2. All user-facing pages must support all 8 locales (en, zh, ja, ko, de, fr, es, pt).\n3. Never render double dollar signs (`$$`) or nested `<main>` landmarks.\n4. Leave `git status` clean before finishing.",
    "programFilename": ".cursorrules",
    "programLang": "text",
    "programCode": "Follow AGENTS.md as the single source of truth.\nPrefer small surgical edits over broad rewrites.\nAlways run the narrowest relevant test file after every code change."
  },
  {
    "slug": "prompt-to-spec-to-plan",
    "track": "foundations",
    "level": "beginner",
    "completionPct": 95,
    "estimatedMinutes": 20,
    "heroImage": "/img/guides/vibecoding-hero.webp",
    "relatedConfigSlug": "cicd-release-quality-gate",
    "title": {
      "en": "Spec-First Vibe Coding: Turning 3 Sentences into a Testable Program Plan",
      "zh": "契约先行 Vibe Coding：三句话拆成可测试的程序开发方案",
      "ja": "Spec-First Vibe Coding: 3 つの文からテスト可能なプログラム計画へ",
      "ko": "Spec-First Vibe Coding: 3 문장을 테스트 가능한 프로그램 계획으로 전환",
      "de": "Spec-First Vibe Coding: 3 Sätze in einen testbaren Programmplan verwandeln",
      "fr": "Spec-First Vibe Coding : Transformer 3 phrases en un plan de programme testable",
      "es": "Spec-First Vibe Coding: Convertir 3 oraciones en un plan de programa probable",
      "pt": "Spec-First Vibe Coding: Transformar 3 frases em um plano de programa testável"
    },
    "tagline": {
      "en": "Eliminate architectural drift by locking interfaces, data schemas, and acceptance criteria before generation",
      "zh": "先锁死数据结构、接口契约与验收清单，再让 AI 并行编码，彻底消除跨文件漂移",
      "ja": "生成前にインターフェース、データスキーマ、受入基準を固定し、アーキテクチャのドリフトを排除する",
      "ko": "생성 전에 인터페이스, 데이터 스키마, 수락 기준을 잠금하여 아키텍처 드리프트를 제거합니다",
      "de": "Beseitigen Sie Architekturdrift, indem Sie Schnittstellen, Datenschemata und Akzeptanzkriterien vor der Generierung festlegen",
      "fr": "Éliminez la dérive architecturale en verrouillant les interfaces, les schémas de données et les critères d'acceptation avant la génération",
      "es": "Elimine la deriva arquitectural bloqueando interfaces, esquemas de datos y criterios de aceptación antes de la generación",
      "pt": "Elimine a deriva arquitetural bloqueando interfaces, esquemas de dados e critérios de aceitação antes da geração"
    },
    "overview": {
      "en": "When you ask an AI to \"build an app\" directly, it invents inconsistent types across files. Generating a strict TypeScript schema + file-ownership checklist first lets coding agents implement in parallel with zero drift.",
      "zh": "直接让 AI「帮我做个应用」极易出现前后类型打架。先冻结 TypeScript 接口与文件清单，再分发编码任务，可将返工率降低 60–80%。",
      "ja": "AI に「アプリを構築する」と直接指示すると、ファイル間で不整合な型が作成されます。厳密な TypeScript スキーマとファイル所有権チェックリストを最初に生成することで、コーディングエージェントはドリフトゼロで並列に実装できます。",
      "ko": "AI 에게 \"앱을 구축하세요\"라고 직접 요청하면 파일 간 일관성이 없는 타입이 발명됩니다. 엄격한 TypeScript 스키마 + 파일 소유권 체크리스트를 먼저 생성하면 코딩 에이전트가 드리프트 없이 병렬로 구현할 수 있습니다.",
      "de": "Wenn Sie eine KI direkt bitten, \"eine App zu bauen\", erfindet sie inkonsistente Typen über Dateien hinweg. Das Generieren eines strengen TypeScript-Schemas + einer Datei-Besitz-Checkliste zuerst ermöglicht es Coding-Agenten, parallel mit null Drift zu implementieren.",
      "fr": "Lorsque vous demandez à une IA de \"construire une application\" directement, elle invente des types incohérents entre les fichiers. Générer un schéma TypeScript strict + une liste de contrôle de propriété de fichier en premier permet aux agents de codage d'implémenter en parallèle sans dérive.",
      "es": "Cuando le pide a una IA que \"construya una aplicación\" directamente, inventa tipos inconsistentes entre archivos. Generar un esquema TypeScript estricto + una lista de verificación de propiedad de archivo primero permite a los agentes de codificación implementar en paralelo con cero deriva.",
      "pt": "Quando você pede a uma IA para \"construir um aplicativo\" diretamente, ela inventa tipos inconsistentes entre arquivos. Gerar um esquema TypeScript estrito + uma lista de verificação de propriedade de arquivo primeiro permite que os agentes de codificação implementem em paralelo com zero deriva."
    },
    "readinessNote": {
      "en": "95% completable today: cuts rework cycles by 60–80% on multi-file features.",
      "zh": "当前可完成度 95%：适用于所有多文件功能迭代与新模块开发。",
      "ja": "今日で 95% 完了可能：マルチファイル機能での再作業サイクルを 60–80% 削減します。",
      "ko": "오늘 95% 완료 가능: 다 파일 기능의 재작업 사이클을 60–80% 줄입니다.",
      "de": "95% heute abschließbar: reduziert Nacharbeitszyklen bei Mehrdatei-Funktionen um 60–80%.",
      "fr": "95% réalisables aujourd'hui : réduit les cycles de refonte de 60 à 80 % pour les fonctionnalités multi-fichiers.",
      "es": "95% completables hoy: reduce los ciclos de retrabajo en un 60–80% en características de múltiples archivos.",
      "pt": "95% completáveis hoje: reduz ciclos de retrabalho em 60–80% em recursos de múltiplos arquivos."
    },
    "steps": [
      {
        "en": "Freeze TypeScript interfaces (`src/data/*.ts`, API request/response JSON) first.",
        "zh": "第一步冻结核心数据结构与 HTTP JSON 契约。",
        "ja": "TypeScript インターフェース（`src/data/*.ts`、API リクエスト/レスポンス JSON）を最初に固定する。",
        "ko": "TypeScript 인터페이스 (`src/data/*.ts`, API 요청/응답 JSON) 를 먼저 고정합니다.",
        "de": "TypeScript-Schnittstellen (`src/data/*.ts`, API-Anfrage/Antwort-JSON) zuerst einfrieren.",
        "fr": "Geler les interfaces TypeScript (`src/data/*.ts`, JSON de requête/réponse API) en premier.",
        "es": "Congelar las interfaces de TypeScript (`src/data/*.ts`, JSON de solicitud/respuesta de API) primero.",
        "pt": "Congelar interfaces TypeScript (`src/data/*.ts`, JSON de solicitação/resposta de API) primeiro."
      },
      {
        "en": "Write a numbered TodoList where every item names exact files and verification command.",
        "zh": "编写精确到具体文件路径与验收命令的波次 TodoList。",
        "ja": "各項目が正確なファイル名と検証コマンドを指定した番号付きの TodoList を作成する。",
        "ko": "각 항목이 정확한 파일명과 검증 명령을 명시하는 번호 매기기 TodoList 작성.",
        "de": "Eine nummerierte TodoList schreiben, bei der jeder Eintrag genaue Dateien und einen Verifizierungsbefehl benennt.",
        "fr": "Écrire une TodoList numérotée où chaque élément nomme les fichiers exacts et la commande de vérification.",
        "es": "Escriba una lista de tareas numerada donde cada elemento nombre archivos exactos y comando de verificación.",
        "pt": "Escreva uma lista de tarefas numerada onde cada item nomeia arquivos exatos e comando de verificação."
      },
      {
        "en": "Execute implementation against the frozen schema, then verify every checklist item empirically.",
        "zh": "按契约编码后逐项用实测命令核销清单。",
        "ja": "凍結されたスキーマに対して実装を実行し、すべてのチェックリスト項目を実証的に検証する。",
        "ko": "고정된 스키마에 따라 구현을 실행한 후 모든 체크리스트 항목을 경험적으로 검증합니다.",
        "de": "Implementierung gegen das eingefrorene Schema ausführen und jeden Checklistenpunkt empirisch verifizieren.",
        "fr": "Exécuter l'implémentation contre le schéma gelé, puis vérifier empiriquement chaque élément de la liste de contrôle.",
        "es": "Ejecutar la implementación contra el esquema congelado, luego verificar empíricamente cada elemento de la lista de verificación.",
        "pt": "Executar a implementação contra o esquema congelado, depois verificar empiricamente cada item da lista de verificação."
      }
    ],
    "vibePrompt": "Before editing any implementation file, design the TypeScript interfaces, HTTP endpoints, error codes, and a 3-wave file-disjoint plan for a prepaid credit voucher system with atomic SQLite redemption.",
    "configFilename": "spec-contract.json",
    "configLang": "json",
    "configCode": "{\n  \"feature\": \"prepaid-voucher-redemption\",\n  \"invariants\": [\n    \"store sha256(code) only, never plaintext\",\n    \"redeem inside SQLite BEGIN IMMEDIATE transaction\",\n    \"rate-limit POST /api/auth/redeem per IP\"\n  ],\n  \"verify\": [\"node --test scripts/test-accounts.mjs\", \"node --test scripts/test-playground-security.mjs\"]\n}",
    "programFilename": "types/voucher.ts",
    "programLang": "typescript",
    "programCode": "export interface RedeemRequest { code: string; }\nexport interface RedeemResponse {\n  ok: true;\n  creditedCents: number;\n  balanceUsd: string;\n}\nexport type RedeemErrorCode = 'invalid_code' | 'already_redeemed' | 'revoked' | 'expired';"
  },
  {
    "slug": "multi-agent-parallel-waves",
    "track": "workflows",
    "level": "intermediate",
    "completionPct": 92,
    "estimatedMinutes": 25,
    "heroImage": "/img/guides/vibecoding-agents.webp",
    "relatedConfigSlug": "future-2027-autonomous-agent-fleet",
    "title": {
      "en": "Parallel Multi-Agent Development with Clavue CLI (`--write-scope` Waves)",
      "zh": "Clavue CLI 多路并行开发实战（文件隔离波次工作流）",
      "ja": "Clavue CLI（`--write-scope` Waves）を使用した並列マルチエージェント開発",
      "ko": "Clavue CLI(`--write-scope` Waves) 를 사용한 병렬 멀티 에이전트 개발",
      "de": "Parallele Multi-Agenten-Entwicklung mit Clavue CLI (`--write-scope` Waves)",
      "fr": "Développement multi-agent parallèle avec Clavue CLI (`--write-scope` Waves)",
      "es": "Desarrollo multiagente paralelo con Clavue CLI (`--write-scope` Waves)",
      "pt": "Desenvolvimento multiagente paralelo com Clavue CLI (`--write-scope` Waves)"
    },
    "tagline": {
      "en": "Run 3–4 coding agents simultaneously with zero merge conflicts by enforcing file-disjoint write scopes",
      "zh": "用严格互不重叠的写范围拆分后端、前端与测试波次，实现 3–4 路 AI 零冲突并行交付",
      "ja": "ファイル非重なり書き込みスコープを強制することで、3〜4 つのコーディングエージェントを同時に実行し、マージ競合をゼロにします。",
      "ko": "파일 불교집합 쓰기 범위를 강제하여 3~4 개의 코딩 에이전트를 동시에 실행하고 병합 충돌을 0 으로 만듭니다.",
      "de": "Führen Sie 3–4 Coding-Agenten gleichzeitig aus, indem Sie file-disjoint write scopes erzwingen, um Merge-Konflikte auf Null zu reduzieren.",
      "fr": "Exécutez 3 à 4 agents de codage simultanément sans aucun conflit de fusion en imposant des domaines d'écriture disjointes par fichier.",
      "es": "Ejecuta 3–4 agentes de codificación simultáneamente sin conflictos de fusión al imponer ámbitos de escritura disjuntos por archivo.",
      "pt": "Execute 3–4 agentes de codificação simultaneamente sem conflitos de mesclagem ao impor escopos de escrita disjuntos por arquivo."
    },
    "overview": {
      "en": "Instead of running one slow sequential agent, split your sprint into 100% file-disjoint waves (Backend / UI Pages / Site Integration & Tests), launch parallel `clavue -p --always-approve --write-scope ...` workers, and review all diffs centrally.",
      "zh": "把复杂需求按文件归属彻底切分为零交集波次，并行启动多个 `clavue -p --always-approve --no-plan` 编码任务，由主控统筹审查 diff 与全量验收，交付效率提升 3 倍。",
      "ja": "1 つの遅い順次エージェントを実行する代わりに、スプリントを 100% ファイル非重なりウェーブ（バックエンド / UI ページ / サイト統合とテスト）に分割し、並列 `clavue -p --always-approve --write-scope ...` ワーカーを起動し、すべての差分を中央でレビューします。",
      "ko": "하나의 느린 순차 에이전트를 실행하는 대신, 스프린트를 100% 파일 불교집합 웨이브(백엔드/UI 페이지/사이트 통합 및 테스트)로 나누고 병렬 `clavue -p --always-approve --write-scope ...` 워커를 시작하여 모든 디프를 중앙에서 검토합니다.",
      "de": "Statt einen langsamen sequentiellen Agenten auszuführen, teilen Sie Ihr Sprint in 100% file-disjoint Waves (Backend / UI-Seiten / Site-Integration & Tests) auf, starten Sie parallele `clavue -p --always-approve --write-scope ...` Worker und überprüfen Sie alle Diffs zentral.",
      "fr": "Au lieu d'exécuter un seul agent séquentiel lent, divisez votre sprint en vagues à 100% disjointes par fichier (Backend / Pages UI / Intégration du site et Tests), lancez des workers `clavue -p --always-approve --write-scope ...` en parallèle et révisez tous les diffs centralement.",
      "es": "En lugar de ejecutar un único agente secuencial lento, divide tu sprint en oleadas 100% disjuntas por archivo (Backend / Páginas UI / Integración del sitio y Pruebas), lanza workers `clavue -p --always-approve --write-scope ...` en paralelo y revisa todos los diffs centralmente.",
      "pt": "Em vez de executar um único agente sequencial lento, divida seu sprint em ondas 100% disjuntas por arquivo (Backend / Páginas UI / Integração do site e Testes), lance workers `clavue -p --always-approve --write-scope ...` em paralelo e revise todos os diffs centralmente."
    },
    "readinessNote": {
      "en": "92% completable today: cuts multi-channel feature delivery time by 3× while keeping review discipline high.",
      "zh": "当前可完成度 92%：已在 JevCode 多轮跨 20+ 文件迭代中实战验证。",
      "ja": "今日完了可能率 92%：マルチチャネル機能デリバリー時間を 3 倍に短縮し、レビュー規律を維持します。",
      "ko": "오늘 완료 가능률 92%: 멀티 채널 기능 제공 시간을 3 배 단축하면서 검토 규율을 유지합니다.",
      "de": "92% heute abschließbar: Reduziert die Lieferzeit für Multi-Channel-Funktionen um das 3-fache bei hoher Review-Disziplin.",
      "fr": "92% réalisables aujourd'hui : réduit le temps de livraison des fonctionnalités multi-canaux de 3× tout en maintenant une discipline de revue élevée.",
      "es": "92% completables hoy: reduce el tiempo de entrega de características multi-canal en 3× manteniendo una alta disciplina de revisión.",
      "pt": "92% completáveis hoje: reduz o tempo de entrega de recursos multi-canal em 3× mantendo uma alta disciplina de revisão."
    },
    "steps": [
      {
        "en": "Partition modified/new files into strictly non-overlapping wave lists (zero shared files).",
        "zh": "列出全部涉及文件并确保各波次文件集合交集为空。",
        "ja": "変更/新規ファイルを厳密に非重なりウェーブリストに分割します（共有ファイルゼロ）。",
        "ko": "수정/새 파일을 엄격하게 겹치지 않는 웨이브 목록으로 분할합니다 (공유 파일 0 개).",
        "de": "Änderungs-/Neu-Dateien in strikt nicht überlappende Wellenlisten aufteilen (keine gemeinsamen Dateien).",
        "fr": "Partagez les fichiers modifiés/nouveaux en listes de vagues strictement non chevauchantes (aucun fichier partagé).",
        "es": "Particiona los archivos modificados/nuevos en listas de oleadas estrictamente no superpuestas (cero archivos compartidos).",
        "pt": "Particione os arquivos modificados/novos em listas de ondas estritamente não sobrepostas (zero arquivos compartilhados)."
      },
      {
        "en": "Launch parallel `clavue -p --always-approve --no-plan --max-wall-ms 240000` workers with explicit prompt files.",
        "zh": "并行拉起 `clavue -p --always-approve --no-plan --max-wall-ms 240000` 执波开发。",
        "ja": "明示的なプロンプトファイルとともに、並列 `clavue -p --always-approve --no-plan --max-wall-ms 240000` ワーカーを起動します。",
        "ko": "명시적인 프롬프트 파일과 함께 병렬 `clavue -p --always-approve --no-plan --max-wall-ms 240000` 워커를 시작합니다.",
        "de": "Starten Sie parallele `clavue -p --always-approve --no-plan --max-wall-ms 240000` Worker mit expliziten Prompt-Dateien.",
        "fr": "Lancez des workers `clavue -p --always-approve --no-plan --max-wall-ms 240000` en parallèle avec des fichiers de prompt explicites.",
        "es": "Lanza workers `clavue -p --always-approve --no-plan --max-wall-ms 240000` en paralelo con archivos de prompt explícitos.",
        "pt": "Lance workers `clavue -p --always-approve --no-plan --max-wall-ms 240000` em paralelo com arquivos de prompt explícitos."
      },
      {
        "en": "Audit `git diff` across all waves, run full build + unit + E2E suite, then commit atomically.",
        "zh": "全部完工后统一审阅 `git diff`、跑全套构建测试与线上探活。",
        "ja": "すべてのウェーブの `git diff` を監査し、フルビルド + ユニット + E2E スイートを実行し、その後原子コミットします。",
        "ko": "모든 웨이브의 `git diff` 를 감사하고 전체 빌드 + 단위 + E2Eスイートを 실행한 후 원자적으로 커밋합니다.",
        "de": "Auditieren Sie `git diff` über alle Waves, führen Sie vollständige Build + Unit + E2E-Suite aus und committen Sie dann atomar.",
        "fr": "Auditez `git diff` sur toutes les vagues, exécutez la suite complète build + unit + E2E, puis committez atomiquement.",
        "es": "Audita `git diff` en todas las oleadas, ejecuta el conjunto completo build + unit + E2E, y luego compromete atómicamente.",
        "pt": "Audite `git diff` em todas as ondas, execute o conjunto completo build + unit + E2E e, em seguida, comita atomicamente."
      }
    ],
    "vibePrompt": "Split this feature into 3 strictly file-disjoint waves: Wave 1 owns server/ + backend tests, Wave 2 owns src/pages/ + i18n/, Wave 3 owns navigation + SEO + matrix tests. Verify zero file overlap.",
    "configFilename": "run-waves.sh",
    "configLang": "bash",
    "configCode": "#!/usr/bin/env bash\nset -euo pipefail\nclavue -p --always-approve --no-plan --effort low --max-wall-ms 240000 \\\n  \"$(cat prompts/wave-1.txt)\" > /tmp/wave1.log 2>&1 &\nclavue -p --always-approve --no-plan --effort low --max-wall-ms 240000 \\\n  \"$(cat prompts/wave-2.txt)\" > /tmp/wave2.log 2>&1 &\nwait\nnpm run check && npm test",
    "programFilename": "scripts/check-disjoint.mjs",
    "programLang": "javascript",
    "programCode": "export function assertDisjoint(waves) {\n  const seen = new Map();\n  for (const [name, files] of Object.entries(waves)) {\n    for (const f of files) {\n      if (seen.has(f)) throw new Error(`Overlap on ${f}: ${seen.get(f)} vs ${name}`);\n      seen.set(f, name);\n    }\n  }\n  return true;\n}"
  },
  {
    "slug": "mcp-vibe-coding-stack",
    "track": "workflows",
    "level": "intermediate",
    "completionPct": 93,
    "estimatedMinutes": 20,
    "heroImage": "/img/guides/vibecoding-agents.webp",
    "relatedConfigSlug": "mcp-zero-trust-ide-policy",
    "title": {
      "en": "Wiring MCP Tools into Your Vibe Coding Stack (Jev Judge + Images + DB)",
      "zh": "为 Vibe Coding 接入 MCP 工具链（Jev 判定 + 生图 + 只读查库）",
      "ja": "MCP ツールを Vibe Coding スタックに統合 (Jev Judge + 画像 + DB)",
      "ko": "MCP 도구를 Vibe Coding 스택에 연결 (Jev Judge + 이미지 + DB)",
      "de": "MCP-Tools in Ihren Vibe-Coding-Stack integrieren (Jev Judge + Bilder + DB)",
      "fr": "Intégration des outils MCP dans votre pile Vibe Coding (Jev Judge + Images + DB)",
      "es": "Conexión de herramientas MCP en su pila Vibe Coding (Jev Judge + Imágenes + DB)",
      "pt": "Conectando Ferramentas MCP ao seu Stack de Vibe Coding (Jev Judge + Imagens + DB)"
    },
    "tagline": {
      "en": "Give coding agents deterministic verification, visual asset generation, and read-only DB inspection via MCP",
      "zh": "通过标准 MCP 协议赋予编码 Agent 确定性验收、WebP 素材生成与只读数据库观测能力",
      "ja": "コーディングエージェントに、MCP を介した決定論的な検証、ビジュアルアセット生成、および読み取り専用 DB 検査を提供します。",
      "ko": "MCP 를 통해 코딩 에이전트에 결정론적 검증, 시각 자산 생성, 및 읽기 전용 DB 검사 기능을 제공합니다.",
      "de": "Bieten Sie Coding-Agenten über MCP deterministische Verifikation, visuelle Asset-Generierung und read-only DB-Inspektion.",
      "fr": "Offrez aux agents de codage une vérification déterministe, la génération d'actifs visuels et l'inspection de base de données en lecture seule via MCP.",
      "es": "Proporcione a los agentes de codificación verificación determinista, generación de activos visuales e inspección de BD de solo lectura mediante MCP.",
      "pt": "Forneça aos agentes de codificação verificação determinística, geração de ativos visuais e inspeção de banco de dados somente leitura via MCP."
    },
    "overview": {
      "en": "Model Context Protocol turns your coding CLI from a blind text generator into a grounded engineer that can query schemas, generate WebP art, and call `jev_judge` directly.",
      "zh": "MCP 让 AI 编码工具不再盲写代码，而是直接查结构、生配图并调用 `jev_judge` 自我验收。",
      "ja": "Model Context Protocol (MCP) は、コーディング CLI を盲目的なテキスト生成器から、スキーマを照会し、WebP アートを生成し、`jev_judge` を直接呼び出せる実用的なエンジニアへと変えます。",
      "ko": "Model Context Protocol (MCP) 은 코딩 CLI 를 맹목적 텍스트 생성기에서 스키마를 쿼리하고, WebP 아트를 생성하며, `jev_judge` 를 직접 호출할 수 있는 현실적인 엔지니어로 전환합니다.",
      "de": "Das Model Context Protocol (MCP) verwandelt Ihre Coding-CLI von einem blinden Textgenerator in einen fundierten Ingenieur, der Schemas abfragen, WebP-Kunstwerke generieren und `jev_judge` direkt aufrufen kann.",
      "fr": "Le Model Context Protocol (MCP) transforme votre CLI de codage d'un générateur de texte aveugle en un ingénieur ancré capable d'interroger des schémas, de générer des œuvres WebP et d'appeler `jev_judge` directement.",
      "es": "El Protocolo de Contexto del Modelo (MCP) convierte su CLI de codificación de un generador de texto ciego en un ingeniero fundamentado que puede consultar esquemas, generar arte WebP y llamar a `jev_judge` directamente.",
      "pt": "O Protocolo de Contexto do Modelo (MCP) transforma sua CLI de codificação de um gerador de texto cego em um engenheiro fundamentado capaz de consultar esquemas, gerar arte WebP e chamar `jev_judge` diretamente."
    },
    "readinessNote": {
      "en": "93% completable today across Claude Code, Cursor, Codex, Antigravity, and Clavue CLI.",
      "zh": "当前可完成度 93%：全面兼容 Clavue CLI、Cursor、Claude Code、Codex 与 Antigravity。",
      "ja": "Claude Code、Cursor、Codex、Antigravity、Clavue CLI において、今日時点で 93% のタスクが完了可能です。",
      "ko": "Claude Code, Cursor, Codex, Antigravity, Clavue CLI 에서 오늘 현재 93% 의 작업이 완료 가능합니다.",
      "de": "93 % der Aufgaben sind heute mit Claude Code, Cursor, Codex, Antigravity und Clavue CLI abschließbar.",
      "fr": "93 % des tâches sont réalisables aujourd'hui avec Claude Code, Cursor, Codex, Antigravity et Clavue CLI.",
      "es": "93 % completables hoy en día con Claude Code, Cursor, Codex, Antigravity y Clavue CLI.",
      "pt": "93 % completáveis hoje com Claude Code, Cursor, Codex, Antigravity e Clavue CLI."
    },
    "steps": [
      {
        "en": "Configure minimal least-privilege MCP servers (keep write credentials scoped).",
        "zh": "按最小权限原则配置 MCP Server（敏感库仅给只读视图）。",
        "ja": "最小限の権限を持つ MCP サーバーを設定します（書き込み権限の範囲を制限します）。",
        "ko": "최소 권한 원칙에 따른 MCP 서버를 구성합니다 (쓰기 자격 증명을 범위로 제한합니다).",
        "de": "Konfigurieren Sie minimale MCP-Server mit Least-Privilege-Prinzip (Schreiben-Zugangsdaten im Scope halten).",
        "fr": "Configurez des serveurs MCP avec le principe du moindre privilège (gardez les identifiants d'écriture dans le périmètre).",
        "es": "Configure servidores MCP con privilegios mínimos (mantenga las credenciales de escritura en el ámbito).",
        "pt": "Configure servidores MCP com privilégio mínimo (mantenha credenciais de escrita escopadas)."
      },
      {
        "en": "Register the `jev_judge` MCP tool so agents can self-verify PR risk and copy quality.",
        "zh": "挂载 `jev_judge` MCP 工具供 Agent 在提交前做结构化门控自检。",
        "ja": "`jev_judge` MCP ツールを登録し、エージェントが PR リスクとコピー品質を自己検証できるようにします。",
        "ko": "`jev_judge` MCP 도구를 등록하여 에이전트가 PR 리스크 및 복사본 품질을 자체 검증할 수 있도록 합니다.",
        "de": "Registrieren Sie das `jev_judge` MCP-Tool, damit Agenten PR-Risiken und Copy-Qualität selbst verifizieren können.",
        "fr": "Enregistrez l'outil MCP `jev_judge` pour permettre aux agents de vérifier eux-mêmes les risques de PR et la qualité du copy.",
        "es": "Registre la herramienta MCP `jev_judge` para que los agentes puedan autoverificar el riesgo de PR y la calidad del copy.",
        "pt": "Registre a ferramenta MCP `jev_judge` para que os agentes possam autoverificar o risco de PR e a qualidade do copy."
      },
      {
        "en": "Test tool invocation end-to-end before handing complex tasks to the agent.",
        "zh": "先做一次轻量工具探活，确认超时与鉴权无误后再放量编排。",
        "ja": "エージェントに複雑なタスクを委譲する前に、ツールの呼び出しをエンドツーエンドでテストします。",
        "ko": "에이전트에 복잡한 작업을 위임하기 전에 도구의 호출을 엔드투엔드로 테스트합니다.",
        "de": "Testen Sie die Tool-Aufrufe End-to-End, bevor Sie komplexe Aufgaben an den Agenten übergeben.",
        "fr": "Testez l'appel de l'outil de bout en bout avant de confier des tâches complexes à l'agent.",
        "es": "Pruebe la invocación de la herramienta de extremo a extremo antes de asignar tareas complejas al agente.",
        "pt": "Teste a invocação da ferramenta de ponta a ponta antes de entregar tarefas complexas ao agente."
      }
    ],
    "vibePrompt": "Create an MCP stdio server exposing jev_judge (calling https://api.jevcode.ai/v1/judge) and add a minimal smoke test verifying list_tools and call_tool.",
    "configFilename": ".mcp.json",
    "configLang": "json",
    "configCode": "{\n  \"mcpServers\": {\n    \"jevcode\": {\n      \"command\": \"node\",\n      \"args\": [\"./scripts/mcp-jev-server.mjs\"],\n      \"env\": { \"JEVCODE_API_KEY\": \"${JEVCODE_API_KEY}\" }\n    }\n  }\n}",
    "programFilename": "scripts/mcp-smoke.mjs",
    "programLang": "javascript",
    "programCode": "const res = await fetch('https://api.jevcode.ai/v1/models');\nif (!res.ok) throw new Error(`HTTP ${res.status}`);\nconsole.log('Available Jev models:', await res.json());"
  },
  {
    "slug": "jev-automated-acceptance-gate",
    "track": "workflows",
    "level": "intermediate",
    "completionPct": 95,
    "estimatedMinutes": 18,
    "heroImage": "/img/guides/configs-readiness.webp",
    "relatedConfigSlug": "cicd-release-quality-gate",
    "title": {
      "en": "Automated Jev Acceptance Gates: Objective GO/NO-GO Scoring for Vibe Coding",
      "zh": "Jev 自动化验收门禁：用客观打分决定 Vibe Coding 能否上线",
      "ja": "自動化された Jev 受入ゲート：Vibe Coding 用の客観的 GO/NO-GO スコアリング",
      "ko": "자동화된 Jev 수용 게이트: Vibe Coding 을 위한 객관적 GO/NO-GO 점수 매기기",
      "de": "Automatisierte Jev-Akzeptanzgatter: Objektive GO/NO-GO-Bewertung für Vibe Coding",
      "fr": "Portes d'acceptation Jev automatisées : Notation GO/NO-GO objective pour le Vibe Coding",
      "es": "Puertas de aceptación Jev automatizadas: Puntuación GO/NO-GO objetiva para Vibe Coding",
      "pt": "Portas de aceitação Jev automatizadas: Pontuação GO/NO-GO objetiva para Vibe Coding"
    },
    "tagline": {
      "en": "Stop guessing whether an AI-built sprint is ready to ship—feed real test & probe metrics into clavue-jev",
      "zh": "不再凭感觉判断是否能发版——把真实测试与探活指标送入 clavue-jev 输出 GO / NO-GO 裁决",
      "ja": "AI 構築のスプリントがリリース準備ができているか推測するのをやめましょう。実際のテストおよびプローブ指標を clavue-jev に投入してください。",
      "ko": "AI 구축 스프린트가 출시 준비가 되었는지 추측하지 마세요. 실제 테스트 및 탐지 지표를 clavue-jev 에 입력하세요.",
      "de": "Hören Sie auf zu raten, ob ein von KI erstellter Sprint versandfertig ist – füttern Sie echte Test- und Abfrage-Metriken in clavue-jev ein.",
      "fr": "Arrêtez de deviner si un sprint construit par une IA est prêt à être déployé – alimentez clavue-jev avec de vraies métriques de test et de sondage.",
      "es": "Deje de adivinar si un sprint construido por IA está listo para enviarse – alimente clavue-jev con métricas reales de prueba y sondeo.",
      "pt": "Pare de adivinhar se um sprint construído por IA está pronto para envio – alimente clavue-jev com métricas reais de teste e sondagem."
    },
    "overview": {
      "en": "After tests pass, collect objective metrics (check errors, unit/E2E pass counts, HTML audit, live endpoint probes) and ask clavue-jev three structured questions (`acceptance_passed`, `blocking_severity`, `readiness_grade`). Only ship when `acceptance_passed.noul >= 0.90`.",
      "zh": "把类型检查、单测、E2E、HTML 审计与探活实测汇总为事实摘要，向 clavue-jev 发起结构化三问，仅在通过概率 ≥ 90% 且无阻断缺陷时自动放行。",
      "ja": "テストが完了した後、客観的指標（エラーチェック、ユニット/E2E 通過数、HTML 監査、ライブエンドポイントプローブ）を収集し、clavue-jev に 3 つの構造化質問（`acceptance_passed`, `blocking_severity`, `readiness_grade`）を投げます。`acceptance_passed.noul >= 0.90` になるまでリリースしないでください。",
      "ko": "테스트가 통과한 후 객관적 지표를 수집 (오류 확인, 단위/E2E 통과 수, HTML 감사, 라이브 엔드포인트 탐지) 하고 clavue-jev 에 세 가지 구조화된 질문 (`acceptance_passed`, `blocking_severity`, `readiness_grade`) 을 던집니다. `acceptance_passed.noul >= 0.90` 일 때만 출시하세요.",
      "de": "Nach bestandenen Tests sammeln Sie objektive Metriken (Fehler prüfen, Unit/E2E-Passanzahlen, HTML-Audit, Live-Endpoint-Abfragen) und stellen clavue-jev drei strukturierte Fragen (`acceptance_passed`, `blocking_severity`, `readiness_grade`). Senden Sie nur aus, wenn `acceptance_passed.noul >= 0.90`.",
      "fr": "Après le passage des tests, collectez des métriques objectives (vérification des erreurs, comptage des passages Unit/E2E, audit HTML, sondages d'endpoints en direct) et posez trois questions structurées à clavue-jev (`acceptance_passed`, `blocking_severity`, `readiness_grade`). Ne déployez que si `acceptance_passed.noul >= 0.90`.",
      "es": "Después de que pasen las pruebas, recopile métricas objetivas (verifique errores, conte de aprobaciones Unit/E2E, auditoría HTML, sondeos de endpoints en vivo) y haga tres preguntas estructuradas a clavue-jev (`acceptance_passed`, `blocking_severity`, `readiness_grade`). Solo envíe cuando `acceptance_passed.noul >= 0.90`.",
      "pt": "Após os testes passarem, colete métricas objetivas (verifique erros, conte aprovações Unit/E2E, auditoria HTML, sondagens de endpoints ao vivo) e faça três perguntas estruturadas ao clavue-jev (`acceptance_passed`, `blocking_severity`, `readiness_grade`). Envie apenas quando `acceptance_passed.noul >= 0.90`."
    },
    "readinessNote": {
      "en": "95% completable today: eliminates subjective bias and catches subtle release blockers before users do.",
      "zh": "当前可完成度 95%：已在 JevCode 四轮发布验收中连续验证。",
      "ja": "今日で 95% 完了可能：主観的なバイアスを排除し、ユーザーが気づく前に微妙なリリースブロックをキャッチします。",
      "ko": "오늘 95% 완료 가능: 주관적 편향을 제거하고 사용자가 발견하기 전에 미묘한 릴리스 블록을 포착합니다.",
      "de": "95% heute abschließbar: eliminiert subjektive Verzerrung und erfasst subtile Release-Blocker, bevor Nutzer sie bemerken.",
      "fr": "95% réalisables aujourd'hui : élimine les biais subjectifs et repère les blocages de release subtils avant les utilisateurs.",
      "es": "95% completables hoy: elimina el sesgo subjetivo y captura bloqueadores de lanzamiento sutiles antes de que lo hagan los usuarios.",
      "pt": "95% completáveis hoje: elimina viés subjetivo e captura bloqueadores de lançamento sutis antes dos usuários."
    },
    "steps": [
      {
        "en": "Gather factual JSON metrics from typecheck, tests, build, and staging probes.",
        "zh": "自动采集构建、单测、E2E 与探活的客观 JSON 证据。",
        "ja": "typecheck、テスト、ビルド、およびステージングプローブから事実ベースの JSON 指標を収集します。",
        "ko": "typecheck, 테스트, 빌드, 및 스테이지링 탐지로부터 사실 기반 JSON 지표를 수집합니다.",
        "de": "Sammeln Sie faktenbasierte JSON-Metriken aus typecheck, Tests, Build und Staging-Abfragen.",
        "fr": "Rassemblez des métriques JSON factuelles à partir de typecheck, tests, build et sondages de staging.",
        "es": "Recopile métricas JSON fácticas de typecheck, pruebas, compilación y sondeos de staging.",
        "pt": "Reúna métricas JSON factuais de typecheck, testes, build e sondagens de staging."
      },
      {
        "en": "Send the structured summary + explicit rubric questions to POST /v1/judge.",
        "zh": "调用 POST /v1/judge 判定 `acceptance_passed` 与 `blocking_severity`。",
        "ja": "構造化サマリーと明示的なルーブリック質問を POST /v1/judge に送信します。",
        "ko": "구조화된 요약 및 명시적 루블릭 질문을 POST /v1/judge 에 전송합니다.",
        "de": "Senden Sie die strukturierte Zusammenfassung + explizite Rubrik-Fragen an POST /v1/judge.",
        "fr": "Envoyez le résumé structuré + les questions de rubrique explicites à POST /v1/judge.",
        "es": "Envíe el resumen estructurado + preguntas de rúbrica explícitas a POST /v1/judge.",
        "pt": "Envie o resumo estruturado + perguntas de rubrica explícitas para POST /v1/judge."
      },
      {
        "en": "Block deployment automatically if `acceptance_passed.noul < 0.90` or `blocking_severity !== \"none\"`.",
        "zh": "未达阈值自动终止发布并输出待修项清单。",
        "ja": "`acceptance_passed.noul < 0.90` または `blocking_severity !== \"none\"` の場合、デプロイを自動的にブロックします。",
        "ko": "`acceptance_passed.noul < 0.90` 또는 `blocking_severity !== \"none\"` 인 경우 배포를 자동으로 차단합니다.",
        "de": "Blockieren Sie die Bereitstellung automatisch, wenn `acceptance_passed.noul < 0.90` oder `blocking_severity !== \"none\"`.",
        "fr": "Bloquez le déploiement automatiquement si `acceptance_passed.noul < 0.90` ou `blocking_severity !== \"none\"`.",
        "es": "Bloquee el despliegue automáticamente si `acceptance_passed.noul < 0.90` o `blocking_severity !== \"none\"`.",
        "pt": "Bloqueie o deploy automaticamente se `acceptance_passed.noul < 0.90` ou `blocking_severity !== \"none\"`."
      }
    ],
    "vibePrompt": "Write a Node.js acceptance script scripts/jev-accept.mjs that reads preflight JSON + test counts, calls https://api.jevcode.ai/v1/judge, prints the verdict, and exits non-zero if acceptance_passed.noul < 0.90.",
    "configFilename": "acceptance-rubric.json",
    "configLang": "json",
    "configCode": "{\n  \"acceptance_passed\": { \"type\": \"noul\", \"instructions\": \"Does this build pass production release acceptance based strictly on the metrics?\" },\n  \"blocking_severity\": { \"type\": \"choice\", \"instructions\": \"Highest remaining defect severity\", \"options\": [\"release_blocking\", \"significant\", \"minor\", \"none\"] }\n}",
    "programFilename": "scripts/jev-accept.mjs",
    "programLang": "javascript",
    "programCode": "const res = await fetch('https://api.jevcode.ai/v1/judge', {\n  method: 'POST',\n  headers: { 'content-type': 'application/json', authorization: `Bearer ${process.env.JEVCODE_API_KEY}` },\n  body: JSON.stringify({\n    state: `Tests: 334/334 pass; E2E: 64/64 pass; Typecheck: 0 errors; Live probes: 200 OK; 5xx: 0.`,\n    questions: {\n      acceptance_passed: { type: 'noul', instructions: 'Passes production acceptance?' },\n      blocking_severity: { type: 'choice', instructions: 'Defect severity', options: ['release_blocking', 'minor', 'none'] },\n    },\n  }),\n});\nconst { answers } = await res.json();\nconsole.log(answers);\nif (answers.acceptance_passed.noul < 0.9 || answers.blocking_severity.choice === 'release_blocking') process.exit(1);"
  },
  {
    "slug": "fullstack-saas-from-scratch",
    "track": "blueprints",
    "level": "intermediate",
    "completionPct": 91,
    "estimatedMinutes": 35,
    "heroImage": "/img/guides/vibecoding-deploy.webp",
    "relatedConfigSlug": "multi-tenant-quota-billing-guard",
    "title": {
      "en": "Zero-to-Live Full-Stack SaaS Program & Config Plan (Auth + Ledger + API)",
      "zh": "从零到上线全栈 SaaS 开发与配置方案（鉴权 + 账本 + API）",
      "ja": "ゼロから稼働するフルスタック SaaS プログラムと構成計画（認証 + 台帳 + API）",
      "ko": "제로부터 라이브 풀스택 SaaS 프로그램 및 구성 계획 (인증 + 장부 + API)",
      "de": "Zero-to-Live Full-Stack SaaS-Programm und Konfigurationsplan (Auth + Ledger + API)",
      "fr": "Programme et plan de configuration Full-Stack SaaS de zéro à la vie (Auth + Ledger + API)",
      "es": "Programa y plan de configuración Full-Stack SaaS de cero a en vivo (Auth + Ledger + API)",
      "pt": "Programa e plano de configuração Full-Stack SaaS de zero ao vivo (Auth + Ledger + API)"
    },
    "tagline": {
      "en": "Complete architecture for launching a monetizable AI SaaS on a single $10/mo VPS with SQLite WAL",
      "zh": "拒绝过度设计：单台 VPS + Astro 静态站 + Node.js + SQLite WAL 跑通可收费 AI SaaS",
      "ja": "SQLite WAL を使用した単一の $10/月 VPS で収益化可能な AI SaaS を立ち上げるための完全なアーキテクチャ",
      "ko": "SQLite WAL 을 사용한 단일 $10/월 VPS 에서 수익화 가능한 AI SaaS 를 출시하기 위한 완전한 아키텍처",
      "de": "Vollständige Architektur zum Starten eines monetarisierbaren AI-SaaS auf einem einzigen $10/Mo VPS mit SQLite WAL",
      "fr": "Architecture complète pour lancer un SaaS AI monétisable sur un seul VPS à 10 $/mois avec SQLite WAL",
      "es": "Arquitectura completa para lanzar un SaaS AI monetizable en un único VPS de $10/mes con SQLite WAL",
      "pt": "Arquitetura completa para lançar um SaaS AI monetizável em um único VPS de $10/mês com SQLite WAL"
    },
    "overview": {
      "en": "Skip premature microservices: combine Astro static frontend + Node.js HTTP API + built-in `node:sqlite` WAL ledger + async scrypt auth + prepaid credit vouchers + Nginx HTTPS + automated hourly VACUUM INTO backups.",
      "zh": "以最小复杂度打造高可靠商业架构：静态前台毫秒响应，后端采用异步 scrypt 鉴权、不可变微美元账本、预付充值码与每小时 VACUUM INTO 一致性备份。",
      "ja": "未熟なマイクロサービスはスキップ：Astro 静的フロントエンド + Node.js HTTP API + 組み込み `node:sqlite` WAL 台帳 + 非同期 scrypt 認証 + 前払いクレジットバウチャー + Nginx HTTPS + 自動化された毎時の VACUUM INTO バックアップを組み合わせます。",
      "ko": "미ature한 마이크로서비스를 건너뛰세요: Astro 정적 프론트엔드 + Node.js HTTP API + 내장 `node:sqlite` WAL 장부 + 비동기 scrypt 인증 + 선불 크레딧 바우처 + Nginx HTTPS + 자동화된 시별 VACUUM INTO 백업 결합.",
      "de": "Vermeiden Sie vorzeitige Microservices: Kombinieren Sie Astro-Static-Frontend + Node.js HTTP API + integriertes `node:sqlite` WAL-Ledger + asynchrones scrypt-Auth +_prepaid Credit-Vouchers + Nginx HTTPS + automatisierte stündliche VACUUM INTO-Backups.",
      "fr": "Évitez les microservices prématurés : combinez Astro frontend statique + API HTTP Node.js + `node:sqlite` WAL intégré + authentification scrypt asynchrone + bons de crédit prépayés + Nginx HTTPS + sauvegardes automatiques VACUUM INTO horaires.",
      "es": "Salte los microservicios prematuros: combine Astro frontend estático + API HTTP Node.js + `node:sqlite` WAL integrado + autenticación scrypt asíncrona + vouchers de crédito prepago + Nginx HTTPS + copias de seguridad automáticas VACUUM INTO horarias.",
      "pt": "Pule os microsserviços prematuros: combine Astro frontend estático + API HTTP Node.js + `node:sqlite` WAL integrado + autenticação scrypt assíncrona + vouchers de crédito pré-pago + Nginx HTTPS + backups automáticos VACUUM INTO horários."
    },
    "readinessNote": {
      "en": "91% completable today: handles tens of thousands of daily requests on 1 VPS with 0 external database bills; add Stripe webhook when ready.",
      "zh": "当前可完成度 91%：单机轻松支撑日均数万请求与零数据库月费；后续可随时加挂 Stripe/支付宝回调。",
      "ja": "今日で 91% 完了可能：1 つの VPS で 1 日に数万回のリクエストを処理し、外部データベース料金は 0；準備ができたら Stripe ウェブフックを追加。",
      "ko": "오늘 91% 완료 가능: 1 개의 VPS 에서 일간 수만 건의 요청 처리 및 외부 데이터베이스 비용 0; 준비되면 Stripe 웹훅 추가.",
      "de": "91% heute abschließbar: bewältigt zehntausende tägliche Anfragen auf 1 VPS mit 0 externen Datenbankkosten; Stripe-Webhook hinzufügen, wenn bereit.",
      "fr": "91% réalisables aujourd'hui : gère des dizaines de milliers de requêtes quotidiennes sur 1 VPS sans facturation de base de données externe ; ajoutez le webhook Stripe quand prêt.",
      "es": "91% completables hoy: maneja decenas de miles de solicitudes diarias en 1 VPS con 0 facturas de base de datos externas; agrega webhook de Stripe cuando esté listo.",
      "pt": "91% completáveis hoje: lida com dezenas de milhares de solicitações diárias em 1 VPS com 0 faturas de banco de dados externos; adicione webhook do Stripe quando pronto."
    },
    "steps": [
      {
        "en": "Model immutable ledger entries (`SUM(micro_usd)`) instead of mutable balance columns.",
        "zh": "用不可变流水表汇总计算余额，以 BEGIN IMMEDIATE 彻底消除并发超扣。",
        "ja": "変更可能な残高カラムではなく、不変の台帳エントリ（`SUM(micro_usd)`）をモデル化します。",
        "ko": "변경 가능한 잔고 열 대신 불변 장부 항목 (`SUM(micro_usd)`) 을 모델링합니다.",
        "de": "Modellieren Sie unveränderliche Ledger-Einträge (`SUM(micro_usd)`) anstelle von veränderlichen Saldo-Spalten.",
        "fr": "Modélisez des entrées de ledger immuables (`SUM(micro_usd)`) plutôt que des colonnes de solde mutables.",
        "es": "Modele entradas de ledger inmutables (`SUM(micro_usd)`) en lugar de columnas de saldo mutables.",
        "pt": "Modele entradas de ledger imutáveis (`SUM(micro_usd)`) em vez de colunas de saldo mutáveis."
      },
      {
        "en": "Use async scrypt + sha256 session tokens + HttpOnly Secure cookies.",
        "zh": "会话与 API Key 库内只存 sha256 散列，Cookie 强制 HttpOnly + Secure。",
        "ja": "非同期 scrypt + sha256 セッショントークン + HttpOnly Secure クッキーを使用します。",
        "ko": "비동기 scrypt + sha256 세션 토큰 + HttpOnly Secure 쿠키 사용.",
        "de": "Verwenden Sie asynchrones scrypt + sha256 Sitzungstoken + HttpOnly Secure-Cookies.",
        "fr": "Utilisez scrypt asynchrone + jetons de session sha256 + cookies HttpOnly Secure.",
        "es": "Use scrypt asíncrono + tokens de sesión sha256 + cookies HttpOnly Secure.",
        "pt": "Use scrypt assíncrono + tokens de sessão sha256 + cookies HttpOnly Secure."
      },
      {
        "en": "Deploy behind Nginx real-IP + Cloudflare + systemd non-root sandbox.",
        "zh": "以非 root systemd 沙箱 + Nginx + Cloudflare 零停机上线。",
        "ja": "Nginx リアル IP + Cloudflare + systemd 非ルートサンドボックスの背後にデプロイします。",
        "ko": "Nginx real-IP + Cloudflare + systemd 비루트 샌드박스 뒤에서 배포합니다.",
        "de": "Deploy hinter Nginx real-IP + Cloudflare + systemd non-root Sandbox.",
        "fr": "Déployez derrière Nginx real-IP + Cloudflare + sandbox systemd non-root.",
        "es": "Despliegue detrás de Nginx real-IP + Cloudflare + sandbox systemd sin root.",
        "pt": "Implante atrás de Nginx real-IP + Cloudflare + sandbox systemd sem root."
      }
    ],
    "vibePrompt": "Scaffold a zero-dependency Node.js 22 accounts module using node:sqlite WAL mode with users, sessions (sha256), api_keys (sha256), immutable micro-USD ledger, and atomic BEGIN IMMEDIATE reserve/refund.",
    "configFilename": "saas-stack.env.example",
    "configLang": "bash",
    "configCode": "NODE_ENV=production\nHOST=127.0.0.1\nPORT=8790\nACCOUNTS_DB=/var/lib/app/accounts.db\nJEVCODE_API_KEY=jev_live_...",
    "programFilename": "server/ledger.mjs",
    "programLang": "javascript",
    "programCode": "import { DatabaseSync } from 'node:sqlite';\n\nexport function openLedger(dbPath) {\n  const db = new DatabaseSync(dbPath);\n  db.exec('PRAGMA journal_mode = WAL; PRAGMA busy_timeout = 5000;');\n  db.exec(`CREATE TABLE IF NOT EXISTS ledger (\n    id INTEGER PRIMARY KEY AUTOINCREMENT,\n    user_id TEXT NOT NULL,\n    micro_usd INTEGER NOT NULL,\n    reason TEXT NOT NULL,\n    created_at TEXT NOT NULL\n  );`);\n  return {\n    balance(userId) {\n      return Number(db.prepare('SELECT COALESCE(SUM(micro_usd), 0) AS b FROM ledger WHERE user_id = ?').get(userId).b);\n    },\n    reserve(userId, cost) {\n      db.exec('BEGIN IMMEDIATE');\n      try {\n        if (this.balance(userId) < cost) { db.exec('ROLLBACK'); return null; }\n        const r = db.prepare('INSERT INTO ledger(user_id, micro_usd, reason, created_at) VALUES (?,?,?,?)')\n          .run(userId, -cost, 'api_call', new Date().toISOString());\n        db.exec('COMMIT');\n        return Number(r.lastInsertRowid);\n      } catch (e) { db.exec('ROLLBACK'); throw e; }\n    },\n  };\n}"
  },
  {
    "slug": "global-multilingual-seo-geo",
    "track": "blueprints",
    "level": "intermediate",
    "completionPct": 95,
    "estimatedMinutes": 25,
    "heroImage": "/img/guides/industries-hero.webp",
    "relatedConfigSlug": "global-multilingual-content-pipeline",
    "title": {
      "en": "Global 8-Language SEO + GEO (AI Search) Engineering Blueprint",
      "zh": "全球 8 语种 SEO + GEO（AI 搜索引擎）站点工程方案",
      "ja": "グローバル 8 言語 SEO + GEO（AI 検索）エンジニアリング・ブループリント",
      "ko": "글로벌 8 언어 SEO + GEO (AI 검색) 엔지니어링 블루프린트",
      "de": "Globales 8-Sprachen-SEO + GEO (KI-Suche) Engineering-Blueprint",
      "fr": "Blueprint d'ingénierie SEO + GEO (Recherche IA) en 8 langues mondiales",
      "es": "Plan de ingeniería SEO + GEO (búsqueda IA) en 8 idiomas globales",
      "pt": "Blueprint de engenharia SEO + GEO (busca IA) em 8 idiomas globais"
    },
    "tagline": {
      "en": "Reach English, Japanese, German, French, Spanish, Portuguese, Korean, and Chinese developers without thin-page penalties",
      "zh": "面向英/日/德/法/西/葡/韩/中全球开发者，彻底规避「机翻薄页降权」风险",
      "ja": "英語、日本語、ドイツ語、フランス語、スペイン語、ポルトガル語、韓国語、中国語の開発者にリーチし、スリムページペナルティを回避する",
      "ko": "영어, 일본어, 독일어, 프랑스어, 스페인어, 포르투갈어, 한국어, 중국어 개발자에게 도달하고 얇은 페이지 페널티를 피하세요",
      "de": "Erreichen Sie Entwickler auf Englisch, Japanisch, Deutsch, Französisch, Spanisch, Portugiesisch, Koreanisch und Chinesisch ohne Thin-Page-Strafen",
      "fr": "Atteignez les développeurs anglais, japonais, allemands, français, espagnols, portugais, coréens et chinois sans pénalités de pages maigres",
      "es": "Alcance a desarrolladores en inglés, japonés, alemán, francés, español, portugués, coreano y chino sin penalizaciones de páginas delgadas",
      "pt": "Alcance desenvolvedores em inglês, japonês, alemão, francês, espanhol, português, coreano e chinês sem penalidades de páginas finas"
    },
    "overview": {
      "en": "Global traffic comes heavily from non-Chinese markets (EN/JA/ES/FR/DE/PT/KO). Build clean `/[lang]/` static routes, bidirectional `hreflang`, sharded 3,000-URL sitemaps, `llms.txt` for AI engines, and strict zero-fallback translation tests.",
      "zh": "海外英文与其他小语种贡献了 90%+ 的全球自然抓取与点击。通过静态多语目录、双向 hreflang、3,000 条分片 Sitemap、`llms.txt` 与零回退自动化门禁实现稳定收录。",
      "ja": "グローバルトラフィックの大部分は中国語圏以外（EN/JA/ES/FR/DE/PT/KO）から発生します。クリーンな `/[lang]/` 静的ルート、双方向の `hreflang`、3,000 URL 分割のサイトマップ、AI エンジン向けの `llms.txt`、および厳格なゼロフォールバック翻訳テストを構築してください。",
      "ko": "글로벌 트래픽의 대부분은 중국어권 밖 (EN/JA/ES/FR/DE/PT/KO) 에서 발생합니다. 깔끔한 `/[lang]/` 정적 라우트, 양방향 `hreflang`, 3,000 URL 분할 사이트맵, AI 엔진을 위한 `llms.txt`, 그리고 엄격한 제로-폴백 번역 테스트를 구축하세요.",
      "de": "Der globale Verkehr stammt überwiegend aus nicht-chinesischen Märkten (EN/JA/ES/FR/DE/PT/KO). Erstellen Sie saubere `/[lang]/` statische Routen, bidirektionale `hreflang`, aufgeschnittene 3.000-URL-Sitemaps, `llms.txt` für KI-Maschinen und strenge Null-Fallback-Übersetzungstests.",
      "fr": "Le trafic mondial provient massivement de marchés non chinois (EN/JA/ES/FR/DE/PT/KO). Construisez des routes statiques `/[lang]/` propres, des `hreflang` bidirectionnels, des sitemaps de 3 000 URL fragmentés, un `llms.txt` pour les moteurs IA, et des tests de traduction sans fallback stricts.",
      "es": "El tráfico global proviene en gran medida de mercados no chinos (EN/JA/ES/FR/DE/PT/KO). Construya rutas estáticas `/[lang]/` limpias, `hreflang` bidireccionales, sitemap fragmentados de 3.000 URL, `llms.txt` para motores de IA y estrictas pruebas de traducción sin caída.",
      "pt": "O tráfego global vem pesadamente de mercados não chineses (EN/JA/ES/FR/DE/PT/KO). Construa rotas estáticas `/[lang]/` limpas, `hreflang` bidirecionais, sitemap fragmentados de 3.000 URLs, `llms.txt` para motores de IA e testes rigorosos de tradução sem fallback."
    },
    "readinessNote": {
      "en": "95% completable today: automated translation + SEO gate keeps 20,000+ pages 100% consistent.",
      "zh": "当前可完成度 95%：一套脚本即可稳定维护两万页多语站点零误差。",
      "ja": "今日で 95% 完了可能：自動化された翻訳と SEO ゲートにより、20,000 以上のページを 100% 一貫性のある状態に保ちます。",
      "ko": "오늘 95% 완료 가능: 자동 번역 + SEO 게이트로 20,000+ 페이지를 100% 일관성 있게 유지합니다.",
      "de": "95% heute abschließbar: automatisierte Übersetzung + SEO-Gate hält 20.000+ Seiten zu 100% konsistent.",
      "fr": "95% réalisables aujourd'hui : la traduction automatisée + le portail SEO maintient 20 000+ pages à 100% de cohérence.",
      "es": "95% completables hoy: traducción automatizada + portón SEO mantiene 20.000+ páginas 100% consistentes.",
      "pt": "95% completáveis hoje: tradução automatizada + portão SEO mantém 20.000+ páginas 100% consistentes."
    },
    "steps": [
      {
        "en": "Never index untranslated fallback pages—translate every field idiomatically via LLM JSON mode + validation.",
        "zh": "严禁把未翻译的英文回退页放进 Sitemap，所有语种用 JSON 模式批量翻译并做非空/防回显校验。",
        "ja": "翻訳されていないフォールバックページをインデックス化しない—LLM JSON モード + 検証を介して、すべてのフィールドを慣用的に翻訳する。",
        "ko": "번역되지 않은 폴백 페이지를 인덱싱하지 마세요—모든 필드를 LLM JSON 모드 + 검증을 통해 관용적으로 번역하세요.",
        "de": "Übersetzte Fallback-Seiten niemals indizieren—übersetzen Sie jedes Feld idiomatisch über LLM JSON-Modus + Validierung.",
        "fr": "N'indexez jamais les pages de repli non traduites—traduisez chaque field idiomatiquement via le mode JSON LLM + validation.",
        "es": "Nunca indexar páginas de respaldo no traducidas—traducir cada campo idiomáticamente mediante modo JSON LLM + validación.",
        "pt": "Nunca indexar páginas de fallback não traduzidas—traduzir cada campo idiomaticamente via modo JSON LLM + validação."
      },
      {
        "en": "Shard sitemaps (`entryLimit: 3000`) and enable `application/xml` gzip so Googlebot/Bingbot/PerplexityBot crawl fast.",
        "zh": "设置 `entryLimit: 3000` 拆分 Sitemap 并开启 `application/xml` Gzip，显著提速爬虫抓取。",
        "ja": "サイトマップをシャード（`entryLimit: 3000`）し、`application/xml` の gzip 圧縮を有効化して、Googlebot/Bingbot/PerplexityBot の高速クロールを実現する。",
        "ko": "사이트맵을 샤드 (`entryLimit: 3000`) 하고 `application/xml` gzip 을 활성화하여 Googlebot/Bingbot/PerplexityBot 의 빠른 크롤링을 가능하게 하세요.",
        "de": "Sitemaps aufschneiden (`entryLimit: 3000`) und `application/xml` gzip aktivieren, damit Googlebot/Bingbot/PerplexityBot schnell crawlen können.",
        "fr": "Fragmentez les sitemaps (`entryLimit: 3000`) et activez le gzip `application/xml` pour que Googlebot/Bingbot/PerplexityBot grimpent rapidement.",
        "es": "Fragmentar sitemap (`entryLimit: 3000`) y habilitar gzip `application/xml` para que Googlebot/Bingbot/PerplexityBot rastreen rápido.",
        "pt": "Fragmentar sitemap (`entryLimit: 3000`) e habilitar gzip `application/xml` para que Googlebot/Bingbot/PerplexityBot rastejem rápido."
      },
      {
        "en": "Generate `/llms.txt` and JSON-LD `CollectionPage` / `QAPage` schemas and guard them in CI.",
        "zh": "自动生成 `/llms.txt` 与结构化 Schema，纳入每次构建强门禁。",
        "ja": "`/llms.txt` と JSON-LD `CollectionPage` / `QAPage` スキーマを生成し、CI でガードする。",
        "ko": "`/llms.txt` 와 JSON-LD `CollectionPage` / `QAPage` 스키마를 생성하고 CI 에서 보호하세요.",
        "de": "`/llms.txt` und JSON-LD `CollectionPage` / `QAPage`-Schemata generieren und in CI schützen.",
        "fr": "Générez `/llms.txt` et les schémas JSON-LD `CollectionPage` / `QAPage` et protégez-les en CI.",
        "es": "Generar `/llms.txt` y esquemas JSON-LD `CollectionPage` / `QAPage` y protegerlos en CI.",
        "pt": "Gerar `/llms.txt` e esquemas JSON-LD `CollectionPage` / `QAPage` e protegê-los em CI."
      }
    ],
    "vibePrompt": "Add an automated test scripts/test-i18n-matrix.mjs that asserts all 8 locales (en, zh, ja, ko, de, fr, es, pt) are non-empty, distinct from English fallback, contain zero $$, and every image path resolves to a valid WebP file.",
    "configFilename": "astro.config.mjs",
    "configLang": "javascript",
    "configCode": "import sitemap from '@astrojs/sitemap';\nexport default {\n  site: 'https://www.example.com',\n  integrations: [\n    sitemap({\n      entryLimit: 3000,\n      i18n: { defaultLocale: 'en', locales: { en: 'en', zh: 'zh-CN', ja: 'ja', ko: 'ko', de: 'de', fr: 'fr', es: 'es', pt: 'pt' } },\n    }),\n  ],\n};",
    "programFilename": "scripts/check-locale-distinct.mjs",
    "programLang": "javascript",
    "programCode": "export function assertTranslated(record, fields) {\n  for (const lang of ['zh', 'ja', 'ko', 'de', 'fr', 'es', 'pt']) {\n    const identical = fields.every((f) => record[f][lang].trim() === record[f].en.trim());\n    if (identical) throw new Error(`Untranslated fallback detected for ${record.slug} [${lang}]`);\n  }\n}"
  },
  {
    "slug": "api-gateway-llm-router-app",
    "track": "blueprints",
    "level": "intermediate",
    "completionPct": 94,
    "estimatedMinutes": 25,
    "heroImage": "/img/guides/blueprint-cascade.webp",
    "relatedConfigSlug": "dual-system-llm-router",
    "title": {
      "en": "Program Dev & Config Plan: Smart Dual-System AI Gateway",
      "zh": "程序开发与配置方案：智能双系统 AI 路由网关",
      "ja": "プログラム開発および構成計画：スマートデュアルシステムAIゲートウェイ",
      "ko": "프로그램 개발 및 구성 계획: 스마트 듀얼 시스템 AI 게이트웨이",
      "de": "Programmentwicklung und Konfigurationsplan: Smart Dual-System AI Gateway",
      "fr": "Plan de développement et de configuration : Smart Dual-System AI Gateway",
      "es": "Plan de desarrollo y configuración: Smart Dual-System AI Gateway",
      "pt": "Plano de desenvolvimento e configuração: Smart Dual-System AI Gateway"
    },
    "tagline": {
      "en": "Vibe-code an OpenAI-compatible proxy that cuts LLM bills 75% by gating every request with clavue-jev",
      "zh": "用 Vibe Coding 快速构建 OpenAI 兼容代理，前置 clavue-jev 直降 75% 大模型账单",
      "ja": "clavue-jev ですべてのリクエストをゲートし、LLM 請求書を 75% 削減する OpenAI 互換プロキシを Vibe コードで構築",
      "ko": "clavue-jev 로 모든 요청을 게이트하여 LLM 청구서를 75% 절감하는 OpenAI 호환 프록시를 Vibe 코드로 구축",
      "de": "Vibe-Coden Sie einen OpenAI-kompatiblen Proxy, der LLM-Rechnungen um 75% senkt, indem jede Anfrage mit clavue-jev gesichert wird",
      "fr": "Vibe-codez un proxy compatible OpenAI qui réduit les factures LLM de 75 % en filtrant chaque requête avec clavue-jev",
      "es": "Vibe-codea un proxy compatible con OpenAI que reduce las facturas de LLM un 75 % filtrando cada solicitud con clavue-jev",
      "pt": "Vibe-code um proxy compatível com OpenAI que reduz as faturas de LLM em 75% filtrando cada solicitação com clavue-jev"
    },
    "overview": {
      "en": "Build a lightweight proxy sitting between your app and OpenAI/Anthropic/vLLM. Every chat turn passes a 75ms Jev check for safety and complexity, routing routine turns to cheap/local models automatically.",
      "zh": "在业务应用与上游大模型之间插入轻量级网关：每条请求先经 75ms Jev 评估安全与难度，常规问答走缓存或本地 32B，仅复杂任务放行旗舰模型。",
      "ja": "アプリと OpenAI/Anthropic/vLLM の間に軽量なプロキシを構築します。すべてのチャットターンは 75ms の Jev チェック（安全性と複雑性の判定）にかけられ、通常のターンは自動的に安価なローカルモデルにルーティングされます。",
      "ko": "앱과 OpenAI/Anthropic/vLLM 사이에 경량 프록시를 구축합니다. 모든 채팅 턴은 75ms 의 Jev 체크 (안전성 및 복잡성) 를 거치며, 일반 턴은 자동으로 저렴하거나 로컬 모델로 라우팅됩니다.",
      "de": "Bauen Sie einen leichten Proxy zwischen Ihrer App und OpenAI/Anthropic/vLLM. Jeder Chat-Turnus durchläuft eine 75ms Jev-Prüfung für Sicherheit und Komplexität und leitet routinemäßige Turns automatisch an kostengünstige/lokale Modelle weiter.",
      "fr": "Construisez un proxy léger situé entre votre application et OpenAI/Anthropic/vLLM. Chaque tour de conversation passe un contrôle Jev de 75 ms pour la sécurité et la complexité, redirigeant automatiquement les tours routiniers vers des modèles locaux bon marché.",
      "es": "Construya un proxy ligero situado entre su aplicación y OpenAI/Anthropic/vLLM. Cada turno de chat pasa una verificación Jev de 75 ms para seguridad y complejidad, enrutando automáticamente los turnos rutinarios a modelos locales económicos.",
      "pt": "Construa um proxy leve situado entre seu aplicativo e OpenAI/Anthropic/vLLM. Cada turno de chat passa uma verificação Jev de 75 ms para segurança e complexidade, roteando automaticamente os turnos rotineiros para modelos locais econômicos."
    },
    "readinessNote": {
      "en": "94% completable today: drop-in baseURL replacement for any existing OpenAI SDK app.",
      "zh": "当前可完成度 94%：现有 OpenAI SDK 业务只需改一行 baseURL 即可无痛接入。",
      "ja": "今日で 94% 完了可能：既存の OpenAI SDK アプリの baseURL 置換で導入可能。",
      "ko": "오늘 94% 완료 가능: 기존 OpenAI SDK 앱의 baseURL 대체로 바로 도입 가능.",
      "de": "Heute zu 94% umsetzbar: Drop-in-BaseURL-Ersatz für jede bestehende OpenAI SDK-Anwendung.",
      "fr": "94 % réalisables aujourd'hui : remplacement de baseURL plug-and-play pour toute application OpenAI SDK existante.",
      "es": "94 % completables hoy: reemplazo de baseURL plug-and-play para cualquier aplicación existente de SDK de OpenAI.",
      "pt": "94% completáveis hoje: substituição de baseURL plug-and-play para qualquer aplicativo existente de SDK do OpenAI."
    },
    "steps": [
      {
        "en": "Expose POST /v1/chat/completions matching OpenAI JSON schema.",
        "zh": "暴露标准 OpenAI 协议 `POST /v1/chat/completions` 接口。",
        "ja": "OpenAI JSON スキーマに一致する POST /v1/chat/completions を公開する。",
        "ko": "OpenAI JSON 스키마와 일치하는 POST /v1/chat/completions 을 노출합니다.",
        "de": "POST /v1/chat/completions bereitstellen, das dem OpenAI JSON-Schema entspricht.",
        "fr": "Exposer POST /v1/chat/completions correspondant au schéma JSON OpenAI.",
        "es": "Exponer POST /v1/chat/completions que coincida con el esquema JSON de OpenAI.",
        "pt": "Expor POST /v1/chat/completions correspondente ao esquema JSON do OpenAI."
      },
      {
        "en": "Insert a 75ms clavue-jev pre-classifier (`safe` + `tier: cache|fast|frontier`).",
        "zh": "前置 75ms clavue-jev 判定安全性与复杂度分档。",
        "ja": "75ms の clavue-jev 事前分類器（`safe` + `tier: cache|fast|frontier`）を挿入する。",
        "ko": "75ms 의 clavue-jev 사전 분류기 (`safe` + `tier: cache|fast|frontier`) 를 삽입합니다.",
        "de": "Ein 75ms clavue-jev-Vorklassifizierer (`safe` + `tier: cache|fast|frontier`) einfügen.",
        "fr": "Insérer un pré-classificateur clavue-jev de 75 ms (`safe` + `tier: cache|fast|frontier`).",
        "es": "Insertar un preclasificador clavue-jev de 75 ms (`safe` + `tier: cache|fast|frontier`).",
        "pt": "Inserir um pré-classificador clavue-jev de 75 ms (`safe` + `tier: cache|fast|frontier`)."
      },
      {
        "en": "Emit `x-routed-tier` and `Server-Timing` headers so you can measure real cost savings.",
        "zh": "响应头回传 `x-routed-tier` 与 `Server-Timing` 实时量化降本收益。",
        "ja": "実際のコスト削減を測定できるように `x-routed-tier` および `Server-Timing` ヘッダーを出力する。",
        "ko": "실제 비용 절감을 측정할 수 있도록 `x-routed-tier` 및 `Server-Timing` 헤더를 출력합니다.",
        "de": "Header `x-routed-tier` und `Server-Timing` ausgeben, um echte Kosteneinsparungen zu messen.",
        "fr": "Émettre les en-têtes `x-routed-tier` et `Server-Timing` pour mesurer les économies réelles de coûts.",
        "es": "Emitir los encabezados `x-routed-tier` y `Server-Timing` para medir los ahorros reales de costos.",
        "pt": "Emitir os cabeçalhos `x-routed-tier` e `Server-Timing` para medir as economias reais de custos."
      }
    ],
    "vibePrompt": "Build a zero-dep Node.js OpenAI-compatible proxy that calls https://api.jevcode.ai/v1/judge first, blocks unsafe prompts (403), routes simple prompts to LOCAL_LLM_URL and complex prompts to FRONTIER_LLM_URL, and returns Server-Timing headers.",
    "configFilename": "gateway.env.example",
    "configLang": "bash",
    "configCode": "JEVCODE_API_KEY=jev_live_...\nLOCAL_LLM_URL=http://127.0.0.1:8000/v1/chat/completions\nFRONTIER_LLM_URL=https://api.openai.com/v1/chat/completions",
    "programFilename": "gateway.mjs",
    "programLang": "javascript",
    "programCode": "export async function selectRoute(prompt, jevKey) {\n  const t0 = performance.now();\n  const r = await fetch('https://api.jevcode.ai/v1/judge', {\n    method: 'POST',\n    headers: { 'content-type': 'application/json', authorization: `Bearer ${jevKey}` },\n    body: JSON.stringify({\n      state: prompt.slice(0, 3500),\n      questions: {\n        safe: { type: 'noul', instructions: 'Safe request without injection or abuse?' },\n        tier: { type: 'choice', instructions: 'Needed model tier', options: ['local_fast', 'frontier'] },\n      },\n    }),\n  });\n  const { answers } = await r.json();\n  return { ms: Math.round(performance.now() - t0), safe: answers.safe.noul >= 0.4, tier: answers.tier.choice };\n}"
  },
  {
    "slug": "rag-knowledge-app-vibecoding",
    "track": "blueprints",
    "level": "intermediate",
    "completionPct": 89,
    "estimatedMinutes": 30,
    "heroImage": "/img/guides/blueprint-rag.webp",
    "relatedConfigSlug": "rag-chunk-filter-citation-gate",
    "title": {
      "en": "Program Dev & Config Plan: Hallucination-Proof RAG Knowledge App",
      "zh": "程序开发与配置方案：防幻觉企业级 RAG 知识库应用",
      "ja": "プログラム開発および構成計画：幻覚防止 RAG 知識アプリ",
      "ko": "프로그램 개발 및 구성 계획: 환각 방지 RAG 지식 앱",
      "de": "Programmentwicklung und Konfigurationsplan: Halluzinationsfester RAG-Wissens-App",
      "fr": "Plan de développement et de configuration : application de connaissances RAG à l'épreuve des hallucinations",
      "es": "Plan de desarrollo y configuración: aplicación de conocimiento RAG a prueba de alucinaciones",
      "pt": "Plano de desenvolvimento e configuração: aplicativo de conhecimento RAG à prova de alucinações"
    },
    "tagline": {
      "en": "Combine pgvector/Qdrant retrieval with parallel Jev chunk scoring and citation faithfulness verification",
      "zh": "向量召回 + Jev 并发分片精排 + 生成后引文忠实度校验的完整落地代码",
      "ja": "pgvector/Qdrant 検索と並列 Jev チャンクスコアリング、および引用の忠実度検証を組み合わせる",
      "ko": "pgvector/Qdrant 검색과 병렬 Jev 청크 점수화 및 인용 충실도 검증을 결합합니다",
      "de": "Kombinieren Sie pgvector/Qdrant-Retrieval mit parallelem Jev-Chunk-Bewertung und Zitat-Treue-Verifizierung",
      "fr": "Combine la récupération pgvector/Qdrant avec le scoring parallèle des chunks Jev et la vérification de la fidélité des citations",
      "es": "Combine la recuperación pgvector/Qdrant con la puntuación paralela de fragmentos Jev y la verificación de fidelidad de citas",
      "pt": "Combine a recuperação pgvector/Qdrant com a pontuação paralela de chunks Jev e a verificação de fidelidade de citações"
    },
    "overview": {
      "en": "Most vibe-coded RAG demos fail in production because noisy chunks poison the context window. Adding a two-stage Jev filter (pre-generation chunk scoring + post-generation grounding check) turns a demo into an auditable enterprise tool.",
      "zh": "普通 RAG Demo 常因召回噪声污染上下文而频发幻觉。加入生成前分片精排与生成后忠实度双门控后，即可达到企业级可审计水准。",
      "ja": "多くのバイブコーディングされた RAG デモは、ノイズの多いチャンクがコンテキストウィンドウを汚染するため、本番環境で失敗します。2 段階の Jev フィルター（生成前のチャンクスコアリングと生成後の根拠確認）を追加することで、デモを監査可能なエンタープライズツールに変えることができます。",
      "ko": "대부분의 바이브 코딩된 RAG 데모는 노이즈가 많은 청크가 컨텍스트 윈도우를 오염시켜 프로덕션 환경에서 실패합니다. 2 단계 Jev 필터 (생성 전 청크 점수화 + 생성 후 근거 확인) 를 추가하면 데모를 감사 가능한 엔터프라이즈 도구로 전환할 수 있습니다.",
      "de": "Die meisten vibe-codierten RAG-Demos scheitern in der Produktion, weil laute Chunks das Kontextfenster vergiften. Das Hinzufügen eines zweistufigen Jev-Filter (vor der Generierung Chunk-Bewertung + nach der Generierung Grounding-Check) verwandelt eine Demo in ein überprüfbares Enterprise-Tool.",
      "fr": "La plupart des démos RAG codées par vibe échouent en production car les chunks bruyants empoisonnent la fenêtre de contexte. L'ajout d'un filtre Jev à deux étapes (scoring des chunks avant génération + vérification de l'ancrage après génération) transforme une démo en un outil d'entreprise auditable.",
      "es": "La mayoría de las demostraciones RAG codadas por vibe fallan en producción porque los fragmentos ruidosos envenenan la ventana de contexto. Añadir un filtro Jev de dos etapas (puntuación de fragmentos pre-generación + verificación de anclaje post-generación) convierte una demostración en una herramienta empresarial auditable.",
      "pt": "A maioria das demonstrações RAG codadas por vibe falha na produção porque chunks ruidosos envenenam a janela de contexto. Adicionar um filtro Jev de duas etapas (pontuação de chunks pré-geração + verificação de ancoragem pós-geração) transforma uma demonstração em uma ferramenta empresarial auditável."
    },
    "readinessNote": {
      "en": "89% completable today: works over docs, PDFs, and support wikis with transparent citation scores.",
      "zh": "当前可完成度 89%：开箱适配技术文档、PDF 与客服知识库，附带透明可信分。",
      "ja": "今日で 89% 完了可能：ドキュメント、PDF、サポートウィキ上で動作し、透明な引用スコアを提供します。",
      "ko": "오늘 89% 완료 가능: 문서, PDF, 지원 위키에서 작동하며 투명한 인용 점수를 제공합니다.",
      "de": "89% heute abschließbar: funktioniert mit Dokumenten, PDFs und Support-Wikis mit transparenten Zitat-Scores.",
      "fr": "89% réalisables aujourd'hui : fonctionne sur des documents, PDF et wikis de support avec des scores de citation transparents.",
      "es": "89% completables hoy: funciona con documentos, PDFs y wikis de soporte con puntuaciones de citas transparentes.",
      "pt": "89% completáveis hoje: funciona com documentos, PDFs e wikis de suporte com pontuações de citação transparentes."
    },
    "steps": [
      {
        "en": "Chunk documents cleanly (500–800 tokens with section headings) and embed with BGE-M3.",
        "zh": "按章节标题切片（500–800 token）并用 BGE-M3 构建向量索引。",
        "ja": "ドキュメントをきれいにチャンク化（500〜800 トークン、セクション見出し付き）し、BGE-M3 で埋め込みを行います。",
        "ko": "문서를 깔끔하게 청크화 (500~800 토큰, 섹션 제목 포함) 하고 BGE-M3 로 임베딩합니다.",
        "de": "Dokumente sauber in Chunks aufteilen (500–800 Token mit Abschnittsüberschriften) und mit BGE-M3 einbetten.",
        "fr": "Divisez proprement les documents en chunks (500–800 tokens avec des titres de section) et intégrez-les avec BGE-M3.",
        "es": "Divida los documentos en fragmentos limpios (500–800 tokens con encabezados de sección) y embeba con BGE-M3.",
        "pt": "Divida os documentos em chunks limpos (500–800 tokens com títulos de seção) e embute com BGE-M3."
      },
      {
        "en": "Score top-20 vector candidates concurrently with clavue-jev and drop irrelevant chunks.",
        "zh": "对 Top-20 候选分片并发调用 clavue-jev 精排去噪。",
        "ja": "上位 20 のベクトル候補を clavue-jev で並列スコアリングし、関連性の低いチャンクを除外します。",
        "ko": "상위 20 벡터 후보를 clavue-jev 로 병렬 점수화하고 관련 없는 청크를 제거합니다.",
        "de": "Bewerten Sie die Top-20 Vektor-Kandidaten konsequent mit clavue-jev und entfernen Sie irrelevante Chunks.",
        "fr": "Évaluez les 20 meilleurs candidats vectoriels en parallèle avec clavue-jev et éliminez les chunks non pertinents.",
        "es": "Puntee los 20 candidatos vectoriales superiores concurrentemente con clavue-jev y elimine los fragmentos irrelevantes.",
        "pt": "Avalie os 20 candidatos vetoriais superiores concorrentemente com clavue-jev e descarte chunks irrelevantes."
      },
      {
        "en": "Verify final LLM output faithfulness (`grounded.noul >= 0.88`) before showing it to users.",
        "zh": "生成回答后核验引文忠实度（`grounded >= 0.88`），不达标则保守拒答。",
        "ja": "ユーザーに表示する前に、最終的な LLM 出力の忠実度（`grounded.noul >= 0.88`）を検証します。",
        "ko": "사용자에게 표시하기 전에 최종 LLM 출력의 충실도 (`grounded.noul >= 0.88`) 를 검증합니다.",
        "de": "Überprüfen Sie die Treue der finalen LLM-Ausgabe (`grounded.noul >= 0.88`), bevor Sie sie den Nutzern anzeigen.",
        "fr": "Vérifiez la fidélité de la sortie LLM finale (`grounded.noul >= 0.88`) avant de l'afficher aux utilisateurs.",
        "es": "Verifique la fidelidad de la salida final del LLM (`grounded.noul >= 0.88`) antes de mostrarla a los usuarios.",
        "pt": "Verifique a fidelidade da saída final do LLM (`grounded.noul >= 0.88`) antes de mostrá-la aos usuários."
      }
    ],
    "vibePrompt": "Implement a Python FastAPI RAG module with two Jev gates: async filter_chunks() using httpx.AsyncClient concurrency=8 and verify_citations() returning abstain if grounded < 0.88.",
    "configFilename": "rag.env.example",
    "configLang": "bash",
    "configCode": "JEVCODE_API_KEY=jev_live_...\nQDRANT_URL=http://127.0.0.1:6333\nMIN_CHUNK_RELEVANCE=0.65\nMIN_GROUNDING_SCORE=0.88",
    "programFilename": "rag_verify.py",
    "programLang": "python",
    "programCode": "async def safe_answer(client, query: str, chunks: list[str], draft: str) -> dict:\n    r = await client.post(\"https://api.jevcode.ai/v1/judge\", json={\n        \"state\": f\"Query: {query}\\nEvidence: {' '.join(chunks)[:2600]}\\nDraft: {draft[:900]}\",\n        \"questions\": {\"grounded\": {\"type\": \"noul\", \"instructions\": \"All claims strictly supported by Evidence?\"}},\n    })\n    score = r.json()[\"answers\"][\"grounded\"][\"noul\"]\n    return {\"answer\": draft if score >= 0.88 else \"Insufficient verified evidence.\", \"groundingScore\": score}"
  },
  {
    "slug": "autonomous-agent-safety-harness",
    "track": "blueprints",
    "level": "advanced",
    "completionPct": 87,
    "estimatedMinutes": 30,
    "heroImage": "/img/guides/vibecoding-agents.webp",
    "relatedConfigSlug": "agent-tool-execution-sandbox",
    "title": {
      "en": "Program Dev & Config Plan: Safe Tool-Calling Agent Harness",
      "zh": "程序开发与配置方案：高安全工具调用 Agent 护栏框架",
      "ja": "プログラム開発および構成計画：安全なツール呼び出しエージェントハルネス",
      "ko": "프로그램 개발 및 구성 계획: 안전한 도구 호출 에이전트 하르네스",
      "de": "Programmentwicklung und Konfigurationsplan: Sichere Tool-Aufruf-Agenten-Harness",
      "fr": "Plan de développement de programme et de configuration : Harness d'agent d'appel d'outils sécurisé",
      "es": "Plan de desarrollo de programa y configuración: Harness de agente de llamada de herramientas segura",
      "pt": "Plano de desenvolvimento de programa e configuração: Harness de agente de chamada de ferramentas segura"
    },
    "tagline": {
      "en": "Wrap every mutating agent tool with Jev intent-alignment checks and human escalation hooks",
      "zh": "为所有写操作工具套上独立 Jev 意图一致性审校中间件与人工挂起通道",
      "ja": "すべての変更を行うエージェントツールを Jev 意図整合チェックと人間によるエスカレーションフックでラップする",
      "ko": "모든 변경 에이전트 도구를 Jev 의도 정렬 체크와 인간 에스컬레이션 후크로 감싸세요",
      "de": "Umhüllen Sie jedes mutierende Agenten-Tool mit Jev-Intent-Alignment-Checks und menschlichen Eskalations-Hooks",
      "fr": "Enveloppez chaque outil d'agent mutateur avec des vérifications d'alignement d'intention Jev et des crochets d'escalade humaine",
      "es": "Envuelva cada herramienta de agente mutante con verificaciones de alineación de intención de Jev y ganchos de escalada humana",
      "pt": "Envolva cada ferramenta de agente mutante com verificações de alinhamento de intenção do Jev e ganchos de escalada humana"
    },
    "overview": {
      "en": "Giving an LLM direct database or payment tool access is dangerous without an independent arbiter. Wrap tool dispatch in a tiny middleware that sends `(userGoal, toolName, args)` to clavue-jev before executing.",
      "zh": "切忌让大模型直接裸调写库或资金接口。通过独立拦截层把 `(用户目标, 工具名, 参数)` 交由 clavue-jev 复核，即可在百毫秒内守住安全底线。",
      "ja": "LLM にデータベースや決済ツールの直接アクセスを与えることは、独立した仲裁人がいないと危険です。ツールディスパッチを、実行前に `(userGoal, toolName, args)` を clavue-jev に送信する小さなミドルウェアでラップします。",
      "ko": "LLM 에 데이터베이스나 결제 도구 직접 액세스를 허용하는 것은 독립적인 중재자가 없으면 위험합니다. 도구 디스패치를 실행하기 전에 `(userGoal, toolName, args)` 를 clavue-jev 로 보내는 작은 미들웨어로 감싸세요.",
      "de": "Es ist gefährlich, einem LLM direkten Zugriff auf Datenbanken oder Zahlungstools zu geben, ohne einen unabhängigen Schiedsrichter. Umhüllen Sie die Tool-Dispatch-Funktion in eine kleine Middleware, die `(userGoal, toolName, args)` an clavue-jev sendet, bevor die Ausführung erfolgt.",
      "fr": "Donner à un LLM un accès direct à une base de données ou à un outil de paiement est dangereux sans un arbitre indépendant. Enveloppez la distribution d'outils dans un petit middleware qui envoie `(userGoal, toolName, args)` à clavue-jev avant l'exécution.",
      "es": "Dar acceso directo a una base de datos o herramienta de pago a un LLM es peligroso sin un árbitro independiente. Envuelva el despacho de herramientas en un pequeño middleware que envía `(userGoal, toolName, args)` a clavue-jev antes de ejecutar.",
      "pt": "Dar acesso direto a um banco de dados ou ferramenta de pagamento a um LLM é perigoso sem um árbitro independente. Envolva o despacho de ferramentas em um pequeno middleware que envia `(userGoal, toolName, args)` para o clavue-jev antes de executar."
    },
    "readinessNote": {
      "en": "87% completable today: safely automates routine tool workflows while pausing ambiguous actions.",
      "zh": "当前可完成度 87%：常规工具流全自动运转，高危灰区自动暂停待人确认。",
      "ja": "今日完了可能率 87%：安全に常設のツールワークフローを自動化し、曖昧なアクションを一時停止します。",
      "ko": "오늘 완료 가능률 87%: 안전한 일상 도구 워크플로우 자동화 및 모호한 작업 일시 중지.",
      "de": "87% heute abschließbar: Automatisiert routinemäßige Tool-Arbeitsabläufe sicher und pausiert mehrdeutige Aktionen.",
      "fr": "87% réalisables aujourd'hui : automatise en toute sécurité les flux de travail d'outils routiniers tout en mettant en pause les actions ambiguës.",
      "es": "87% completables hoy: automatiza de forma segura los flujos de trabajo de herramientas rutinarias mientras pausa acciones ambiguas.",
      "pt": "87% completáveis hoje: automatiza com segurança fluxos de trabalho de ferramentas rotineiras enquanto pausa ações ambíguas."
    },
    "steps": [
      {
        "en": "Declare an explicit allowlist of read-only vs gated mutating tools.",
        "zh": "明确定义只读工具白名单与受控写工具清单。",
        "ja": "読み取り専用ツールとゲート付き変更ツールの明示的な許可リストを宣言する。",
        "ko": "읽기 전용 및 게이트 변경 도구에 대한 명시적 허용 목록을 선언합니다.",
        "de": "Erklären Sie eine explizite Whiteliste für read-only vs. gate-geschützte mutierende Tools.",
        "fr": "Déclarez une liste blanche explicite d'outils de lecture seule vs outils mutateurs sous verrouillage.",
        "es": "Declare una lista blanca explícita de herramientas de solo lectura vs herramientas mutantes con puerta de enlace.",
        "pt": "Declare uma lista branca explícita de ferramentas de leitura apenas vs ferramentas mutantes com portaria."
      },
      {
        "en": "Intercept gated tools with a 70ms Jev alignment check (`safe_to_run.noul >= 0.92`).",
        "zh": "受控工具执行前统一经由 70ms Jev 对齐检查（`noul >= 0.92`）。",
        "ja": "ゲート付きツールを 70ms の Jev 整合チェック（`safe_to_run.noul >= 0.92`）でインターセプトする。",
        "ko": "게이트 도구를 70ms Jev 정렬 체크(`safe_to_run.noul >= 0.92`) 로 인터셉트합니다.",
        "de": "Interceptieren Sie gate-geschützte Tools mit einem 70ms Jev-Alignment-Check (`safe_to_run.noul >= 0.92`).",
        "fr": "Interceptez les outils sous verrouillage avec une vérification d'alignement Jev de 70ms (`safe_to_run.noul >= 0.92`).",
        "es": "Intercepte herramientas con puerta de enlace con una verificación de alineación Jev de 70ms (`safe_to_run.noul >= 0.92`).",
        "pt": "Intercepte ferramentas com portaria com uma verificação de alinhamento Jev de 70ms (`safe_to_run.noul >= 0.92`)."
      },
      {
        "en": "Persist pending approvals to an audit queue when confidence lands in `[0.40, 0.92]`.",
        "zh": "灰区请求自动写入待审批表并通知负责人。",
        "ja": "信頼度が `[0.40, 0.92]` の範囲にある場合、承認を待機状態に保ち、監査キューに永続化する。",
        "ko": "신뢰도가 `[0.40, 0.92]` 범위에 있을 때 승인 대기 상태를 감사 큐에 영구 저장합니다.",
        "de": "Speichern Sie ausstehende Genehmigungen in einer Audit-Warteschlange, wenn das Vertrauen im Bereich `[0.40, 0.92]` liegt.",
        "fr": "Persévérez les approbations en attente dans une file d'attente d'audit lorsque la confiance se situe dans `[0.40, 0.92]`.",
        "es": "Persista las aprobaciones pendientes en una cola de auditoría cuando la confianza esté en `[0.40, 0.92]`.",
        "pt": "Persista aprovações pendentes em uma fila de auditoria quando a confiança estiver em `[0.40, 0.92]`."
      }
    ],
    "vibePrompt": "Write a TypeScript wrapToolExecutor() middleware that lets readOnly tools execute immediately, gates mutating tools via clavue-jev (threshold 0.92), and returns { status: 'needs_approval' } for borderline scores.",
    "configFilename": "tools-policy.json",
    "configLang": "json",
    "configCode": "{\n  \"readOnly\": [\"get_invoice\", \"list_orders\"],\n  \"gated\": [\"issue_refund\", \"delete_user\", \"update_dns\"],\n  \"autoApproveThreshold\": 0.92\n}",
    "programFilename": "tool-harness.ts",
    "programLang": "typescript",
    "programCode": "export async function executeGatedTool(goal: string, tool: string, args: unknown, run: () => Promise<unknown>) {\n  const r = await fetch('https://api.jevcode.ai/v1/judge', {\n    method: 'POST',\n    headers: { 'content-type': 'application/json', authorization: `Bearer ${process.env.JEVCODE_API_KEY}` },\n    body: JSON.stringify({\n      state: `Goal: ${goal}\\nTool: ${tool}\\nArgs: ${JSON.stringify(args)}`,\n      questions: { aligned: { type: 'noul', instructions: 'Strictly aligned with user goal and safe to run automatically?' } },\n    }),\n  });\n  const prob = (await r.json()).answers.aligned.noul;\n  if (prob >= 0.92) return { status: 'executed', result: await run(), prob };\n  return { status: prob < 0.4 ? 'denied' : 'needs_approval', prob };\n}"
  },
  {
    "slug": "vibe-testing-e2e-verification",
    "track": "operations",
    "level": "intermediate",
    "completionPct": 94,
    "estimatedMinutes": 20,
    "heroImage": "/img/guides/configs-readiness.webp",
    "relatedConfigSlug": "cicd-release-quality-gate",
    "title": {
      "en": "Vibe Testing: Anti-Regression Unit, Security & E2E Harnesses",
      "zh": "Vibe Testing：防回归单元、安全与 E2E 自动化测试体系",
      "ja": "Vibe テスト：回帰防止ユニット、セキュリティおよび E2E ハネス",
      "ko": "Vibe 테스트: 회귀 방지 단위, 보안 및 E2E 하네스",
      "de": "Vibe Testing: Anti-Regression Unit, Sicherheit & E2E Harnesses",
      "fr": "Vibe Testing : Anti-régression Unit, Sécurité et Harnais E2E",
      "es": "Vibe Testing: Anti-regresión Unit, Seguridad y Arneses E2E",
      "pt": "Vibe Testing: Anti-regressão Unit, Segurança e Harnesses E2E"
    },
    "tagline": {
      "en": "Force every AI coding wave to ship deterministic tests against real SQLite, HTTP servers, and HTML builds",
      "zh": "要求每轮 AI 开发同步交付覆盖并发竞态、XSS 转义与构建产物的零依赖 `node:test` 用例",
      "ja": "すべての AI コーディングの波を、実際の SQLite、HTTP サーバー、および HTML ビルドに対する決定論的なテストに shipping させます",
      "ko": "모든 AI 코딩 파동을 실제 SQLite, HTTP 서버, 및 HTML 빌드 대상 결정론적 테스트로 shipping 하도록 강제합니다",
      "de": "Zwingen Sie jede AI-Coding-Welle, deterministische Tests gegen echte SQLite-, HTTP-Server und HTML-Builds zu liefern",
      "fr": "Forcez chaque vague de codage IA à livrer des tests déterministes contre de vrais serveurs SQLite, HTTP et des builds HTML",
      "es": "Obliga a cada ola de codificación de IA a enviar pruebas deterministas contra servidores reales de SQLite, HTTP y construcciones HTML",
      "pt": "Force cada onda de codificação de IA a enviar testes determinísticos contra servidores reais de SQLite, HTTP e builds HTML"
    },
    "overview": {
      "en": "Speed without tests just produces bugs faster. Pair every AI-written feature with built-in `node:test` suites covering auth edge cases, concurrency races, XSS escaping, i18n completeness, and built HTML invariants.",
      "zh": "没有测试兜底的极速编码只会更快制造线上故障。用 Node 内置 `node:test` 在 10 秒内跑完 300+ 项单元、安全、E2E 与 HTML 产物校验，彻底锁死质量底线。",
      "ja": "テストなしでの高速化は、バグをより速く発生させます。AI によって記述された各機能に、認証のエッジケース、並行性レース、XSS エスケープ、i18n の完全性、および組み込み HTML 不変性をカバーする組み込み `node:test` スイートをペアリングしてください。",
      "ko": "테스트 없는 속도는 버그를 더 빠르게 생성합니다. AI 로 작성된 각 기능에 인증 에지 케이스, 동시성 레이스, XSS 이스케이프, i18n 완전성, 및 내장 HTML 불변성을 포함하는 내장 `node:test` 스위트와 페어링하세요.",
      "de": "Geschwindigkeit ohne Tests erzeugt schneller Bugs. Paaren Sie jede von AI geschriebene Funktion mit integrierten `node:test`-Suites, die Auth-Edge-Cases, Concurrency-Races, XSS-Escape, i18n-Vollständigkeit und integrierte HTML-Invarianten abdecken.",
      "fr": "La vitesse sans tests génère des bogues plus rapidement. Associez chaque fonctionnalité écrite par IA à des suites `node:test` intégrées couvrant les cas limites d'authentification, les courses de concurrence, l'échappement XSS, la complétude i18n et les invariants HTML intégrés.",
      "es": "La velocidad sin pruebas solo genera errores más rápido. Empareje cada función escrita por IA con suites `node:test` integradas que cubran casos límite de autenticación, carreras de concurrencia, escape XSS, completitud i18n y invariantes HTML integradas.",
      "pt": "Velocidade sem testes apenas produz bugs mais rápido. Pare cada recurso escrito por IA com suites `node:test` integradas cobrindo casos de borda de autenticação, corridas de concorrência, escape XSS, completude i18n e invariantes HTML integradas."
    },
    "readinessNote": {
      "en": "94% completable today: zero-dependency `node:test` runs 300+ assertions in ~10 seconds.",
      "zh": "当前可完成度 94%：零外部测试框架负担，CI 与本地一键复现。",
      "ja": "今日完了可能率 94%：依存関係ゼロの `node:test` が約 10 秒で 300 以上のアサーションを実行します。",
      "ko": "오늘 완료 가능률 94%: 종속성 없는 `node:test` 가 약 10 초 동안 300 개 이상의 어설션을 실행합니다.",
      "de": "94% heute abschließbar: Abhängigkeitsfreies `node:test` führt über 300 Assertions in ca. 10 Sekunden aus.",
      "fr": "94% réalisables aujourd'hui : `node:test` sans dépendance exécute 300+ assertions en ~10 secondes.",
      "es": "94% completables hoy: `node:test` sin dependencias ejecuta 300+ aserciones en ~10 segundos.",
      "pt": "94% completáveis hoje: `node:test` sem dependências executa 300+ assertões em ~10 segundos."
    },
    "steps": [
      {
        "en": "Ask the agent to write failing boundary tests (401 unauth, replay attack, XSS payload, missing locale) first.",
        "zh": "先补边界与攻击用例（未授权 401、重放核销、XSS 注入、多语缺漏）。",
        "ja": "エージェントに、まず失敗する境界テスト（401 未認証、リプレイ攻撃、XSS ペイロード、欠落したロケール）を記述させることを依頼します。",
        "ko": "에이전트에게 먼저 실패하는 경계 테스트 (401 인증 불가, 재플레이 공격, XSS 페이로드, 누락된 로케일) 를 작성하도록 요청합니다.",
        "de": "Bitten Sie den Agenten, zuerst fehlende Grenzwerttests (401 unauth, Replay-Angriff, XSS-Payload, fehlende Lokale) zu schreiben.",
        "fr": "Demandez à l'agent d'écrire d'abord des tests de bordure échouants (401 non authentifié, attaque de replay, charge XSS, localisation manquante).",
        "es": "Pida al agente que escriba primero pruebas de límite fallidas (401 no autenticado, ataque de reproducción, carga XSS, falta de localización).",
        "pt": "Peça ao agente para escrever primeiro testes de limite falhos (401 não autenticado, ataque de replay, carga XSS, falta de localização)."
      },
      {
        "en": "Spawn ephemeral local HTTP servers on random ports for real end-to-end API testing.",
        "zh": "测试内拉起随机端口临时服务做真实端到端 HTTP 联调。",
        "ja": "実際のエンドツーエンド API テストのために、ランダムなポート上の一時的なローカル HTTP サーバーを生成します。",
        "ko": "실제 엔드투엔드 API 테스트를 위해 랜덤 포트의 일시적인 로컬 HTTP 서버를 생성합니다.",
        "de": "Starten Sie temporäre lokale HTTP-Server auf zufälligen Ports für echte End-to-End-API-Tests.",
        "fr": "Déployez des serveurs HTTP locaux éphémères sur des ports aléatoires pour des tests API end-to-end réels.",
        "es": "Genere servidores HTTP locales efímeros en puertos aleatorios para pruebas API de extremo a extremo reales.",
        "pt": "Crie servidores HTTP locais efêmeros em portas aleatórias para testes de API de ponta a ponta reais."
      },
      {
        "en": "Scan built `dist/` HTML automatically for broken links, nested `<main>`, and formatting bugs.",
        "zh": "对 `dist/` 构建产物跑全量静态 HTML 规则扫描。",
        "ja": "ビルドされた `dist/` HTML を自動的にスキャンし、壊れたリンク、ネストされた `<main>`、およびフォーマットバグを検出します。",
        "ko": "빌드된 `dist/` HTML 을 자동으로 스캔하여 깨진 링크, 중첩 `<main>`, 및 포맷팅 버그를 찾습니다.",
        "de": "Scannen Sie den gebauten `dist/`-HTML automatisch auf defekte Links, verschachtelte `<main>` und Formatierungsfehler.",
        "fr": "Balayez automatiquement le HTML `dist/` construit pour les liens cassés, les `<main>` imbriqués et les bugs de formatage.",
        "es": "Escanee automáticamente el HTML `dist/` construido para enlaces rotos, `<main>` anidados y errores de formato.",
        "pt": "Varra automaticamente o HTML `dist/` construído para links quebrados, `<main>` aninhados e bugs de formatação."
      }
    ],
    "vibePrompt": "Add node:test security and regression tests covering unauthenticated 401 rejection, double-spend replay prevention, HTML XSS escaping, and zero $$ rendering across built pages.",
    "configFilename": "package.json",
    "configLang": "json",
    "configCode": "{\n  \"scripts\": {\n    \"test\": \"node --test scripts/test-*.mjs\",\n    \"test:e2e\": \"node scripts/test-api-v1.mjs\"\n  }\n}",
    "programFilename": "scripts/test-invariants.mjs",
    "programLang": "javascript",
    "programCode": "import { test } from 'node:test';\nimport assert from 'node:assert/strict';\n\ntest('no rendered double dollar sign', () => {\n  const sampleHtml = '<p>Includes $5.00 free API credit.</p>';\n  assert.equal(/\\$\\$\\d/.test(sampleHtml), false);\n});"
  },
  {
    "slug": "vps-hardening-zero-downtime-deploy",
    "track": "operations",
    "level": "advanced",
    "completionPct": 93,
    "estimatedMinutes": 25,
    "heroImage": "/img/guides/vibecoding-deploy.webp",
    "relatedConfigSlug": "multi-tenant-quota-billing-guard",
    "title": {
      "en": "Vibe DevOps: Non-Root Systemd Sandboxing & Atomic Symlink Deploys",
      "zh": "Vibe DevOps：非 root Systemd 内核沙箱与原子零停机发布",
      "ja": "Vibe DevOps: 非ルート Systemd サンボクシングと原子シmlink デプロイ",
      "ko": "Vibe DevOps: 비루트 Systemd 샌드박싱 및 원자적 심링크 배포",
      "de": "Vibe DevOps: Nicht-root Systemd Sandboxing und atomare Symlink-Bereitstellungen",
      "fr": "Vibe DevOps : Sandboxing Systemd non-root et déploiements atomiques par symlinks",
      "es": "Vibe DevOps: Sandboxing de Systemd sin root y despliegues atómicos mediante enlaces simbólicos",
      "pt": "Vibe DevOps: Sandboxing de Systemd sem root e implantações atômicas por links simbólicos"
    },
    "tagline": {
      "en": "Ship from AI coding session to hardened Linux VPS with zero downtime, read-only rootfs, and instant rollback",
      "zh": "从 AI 编码会话直达加固 Linux VPS：只读根文件系统、零停机切链与秒级回滚",
      "ja": "AI コーディングセッションから、ゼロダウンタイム、読み取り専用ルートfs、即時ロールバックを備えた強化された Linux VPS へデプロイ",
      "ko": "AI 코딩 세션에서 제로 다운타임, 읽기 전용 루트 fs, 즉시 롤백을 갖춘 강화된 Linux VPS 로 배포",
      "de": "Von der AI-Coding-Sitzung aus zu einer gehärteten Linux-VPS mit null Ausfallzeit, read-only rootfs und sofortigem Rollback",
      "fr": "Déployez depuis une session de codage IA vers une VPS Linux durcie avec zéro temps d'arrêt, rootfs en lecture seule et retour arrière instantané",
      "es": "Despliegue desde una sesión de codificación IA a una VPS Linux endurecida con cero tiempo de inactividad, rootfs de solo lectura y rollback instantáneo",
      "pt": "Implante de uma sessão de codificação IA para uma VPS Linux endurecida com zero tempo de inatividade, rootfs de leitura apenas e rollback instantâneo"
    },
    "overview": {
      "en": "Never leave production Node services running as root. Lock systemd units with `User=`, `ProtectSystem=strict`, `PrivateDevices=true`, `CapabilityBoundingSet=`, run atomic `ln -sfn` release switches, and verify with automated post-deploy probes.",
      "zh": "生产服务绝不以 root 裸奔。通过专用低权限系统用户、内核级 systemd 沙箱、同用户 SQLite WAL 备份以及时间戳目录 `ln -sfn` 原子切换，兼顾极致安全与发布效率。",
      "ja": "本番環境の Node サービスをルートとして実行しない。`User=`, `ProtectSystem=strict`, `PrivateDevices=true`, `CapabilityBoundingSet=` で systemd ユニットをロックし、原子 `ln -sfn` リリーススイッチを実行し、自動化されたデプロイ後プローブで検証する。",
      "ko": "프로덕션 Node 서비스를 루트로 실행하지 마십시오. `User=`, `ProtectSystem=strict`, `PrivateDevices=true`, `CapabilityBoundingSet=` 로 systemd 유닛을 잠그고, 원자적 `ln -sfn` 릴리스 스위치를 실행하며, 자동화된 배포 후 프로브로 확인합니다.",
      "de": "Lassen Sie keine Node-Dienste in der Produktion als root laufen. Sperren Sie systemd-Einheiten mit `User=`, `ProtectSystem=strict`, `PrivateDevices=true`, `CapabilityBoundingSet=`, führen Sie atomare `ln -sfn` Release-Switches aus und validieren Sie sie mit automatisierten Post-Deploy-Proben.",
      "fr": "Ne laissez jamais les services Node en production s'exécuter en root. Verrouillez les unités systemd avec `User=`, `ProtectSystem=strict`, `PrivateDevices=true`, `CapabilityBoundingSet=`, exécutez des commutateurs de libération atomiques `ln -sfn` et vérifiez avec des sondes automatisées post-déploiement.",
      "es": "Nunca deje que los servicios Node de producción corran como root. Bloquee las unidades systemd con `User=`, `ProtectSystem=strict`, `PrivateDevices=true`, `CapabilityBoundingSet=`, ejecute conmutadores de liberación atómicos `ln -sfn` y verifique con sondas automatizadas post-despliegue.",
      "pt": "Nunca deixe serviços Node de produção rodando como root. Trave unidades systemd com `User=`, `ProtectSystem=strict`, `PrivateDevices=true`, `CapabilityBoundingSet=`, execute comutadores de liberação atômicos `ln -sfn` e verifique com sondas automatizadas pós-implantação."
    },
    "readinessNote": {
      "en": "93% completable today: turnkey Linux VPS hardening + rollback in under 15 minutes.",
      "zh": "当前可完成度 93%：15 分钟即可完成单机生产级安全基线加固。",
      "ja": "今日完了可能率 93%: 15 分以内のターンキー Linux VPS 強化 + ロールバック。",
      "ko": "오늘 완료 가능률 93%: 15 분 이내의 턴키 Linux VPS 강화 + 롤백.",
      "de": "93% heute abschließbar: turnkey Linux-VPS-Härtung + Rollback in unter 15 Minuten.",
      "fr": "93% réalisables aujourd'hui : durcissement VPS Linux clé en main + retour arrière en moins de 15 minutes.",
      "es": "93% completables hoy: endurecimiento de VPS Linux llave en mano + rollback en menos de 15 minutos.",
      "pt": "93% completáveis hoje: endurecimento de VPS Linux turnkey + rollback em menos de 15 minutos."
    },
    "steps": [
      {
        "en": "Create a dedicated `nologin` system user and grant write access ONLY to DB and runtime state directories.",
        "zh": "创建专用 `nologin` 系统用户，仅向数据目录开放 `ReadWritePaths`。",
        "ja": "専用 `nologin` システムユーザーを作成し、DB とランタイム状態ディレクトリへの書き込みアクセスのみを付与する。",
        "ko": "전용 `nologin` 시스템 사용자를 생성하고 DB 및 런타임 상태 디렉토리에만 쓰기 액세스 권한을 부여합니다.",
        "de": "Erstellen Sie einen dedizierten `nologin`-Systembenutzer und gewähren Sie Schreibzugriff NUR auf DB- und Laufzeit-Zustandsverzeichnisse.",
        "fr": "Créez un utilisateur système dédié `nologin` et accordez l'accès en écriture UNIQUEMENT aux répertoires d'état de la base de données et du temps d'exécution.",
        "es": "Cree un usuario del sistema dedicado `nologin` y conceda acceso de escritura ÚNICAMENTE a los directorios de estado de la base de datos y de tiempo de ejecución.",
        "pt": "Crie um usuário do sistema dedicado `nologin` e conceda acesso de escrita APENAS aos diretórios de estado de DB e tempo de execução."
      },
      {
        "en": "Run hourly SQLite `VACUUM INTO` backups as the same non-root user so WAL/SHM ownership never drifts.",
        "zh": "定时备份与服务运行使用同一用户，杜绝 WAL/SHM 属主冲突。",
        "ja": "同じ非ルートユーザーとして毎時 SQLite `VACUUM INTO` バックアップを実行し、WAL/SHM の所有権がずれるのを防ぐ。",
        "ko": "동일한 비루트 사용자로 시계별 SQLite `VACUUM INTO` 백업을 실행하여 WAL/SHM 소유권이 벗어나지 않도록 합니다.",
        "de": "Führen Sie stündliche SQLite `VACUUM INTO`-Backups als denselben Nicht-root-Benutzer aus, damit WAL/SHM-Besitz nie driftet.",
        "fr": "Exécutez des sauvegardes SQLite `VACUUM INTO` horaires en tant que le même utilisateur non-root afin que la propriété WAL/SHM ne dérive jamais.",
        "es": "Ejecute copias de seguridad SQLite `VACUUM INTO` horarias como el mismo usuario no root para que la propiedad WAL/SHM nunca se desvíe.",
        "pt": "Execute backups SQLite `VACUUM INTO` horários como o mesmo usuário não root para que a propriedade WAL/SHM nunca se desvie."
      },
      {
        "en": "Deploy static assets to timestamped release directories and flip `current` symlink atomically.",
        "zh": "静态产物按时间戳解包后原子切换软链并立即跑公网探活。",
        "ja": "静的アセットをタイムスタンプ付きリリースディレクトリにデプロイし、`current` シmlink を原子的に切り替える。",
        "ko": "정적 자산을 타임스탬프付き 릴리스 디렉토리에 배포하고 `current` 심링크를 원자적으로 전환합니다.",
        "de": "Bereitstellen Sie statische Assets in zeitgestempelte Release-Verzeichnisse und wechseln Sie das `current`-Symlink atomar.",
        "fr": "Déployez les actifs statiques dans des répertoires de libération datés et basculez le symlinks `current` atomiquement.",
        "es": "Despliegue activos estáticos en directorios de liberación con marca de tiempo y cambie el enlace simbólico `current` de forma atómica.",
        "pt": "Implante ativos estáticos em diretórios de liberação com carimbo de data/hora e altere o link simbólico `current` atomicamente."
      }
    ],
    "vibePrompt": "Harden deploy/app.service to run as dedicated non-root user with ProtectSystem=strict, PrivateTmp=true, PrivateDevices=true, ProtectHome=true, CapabilityBoundingSet=, and minimal ReadWritePaths.",
    "configFilename": "deploy/app.service",
    "configLang": "ini",
    "configCode": "[Service]\nType=simple\nUser=appuser\nGroup=appuser\nExecStart=/usr/bin/node /opt/app/server.mjs\nNoNewPrivileges=true\nPrivateTmp=true\nPrivateDevices=true\nProtectSystem=strict\nProtectHome=true\nCapabilityBoundingSet=\nAmbientCapabilities=\nReadWritePaths=/var/lib/app-data",
    "programFilename": "deploy/atomic-switch.sh",
    "programLang": "bash",
    "programCode": "#!/usr/bin/env bash\nset -euo pipefail\nREL=\"/var/www/app/releases/$(date -u +%Y%m%d-%H%M%S)\"\nmkdir -p \"$REL\"\ntar -xzf /tmp/dist.tar.gz -C \"$REL\"\nreadlink -f /var/www/app/current > /var/www/app/shared/previous_release || true\nln -sfn \"$REL\" /var/www/app/current\nnginx -t && systemctl reload nginx"
  },
  {
    "slug": "vibe-visual-asset-pipeline",
    "track": "operations",
    "level": "beginner",
    "completionPct": 95,
    "estimatedMinutes": 15,
    "heroImage": "/img/guides/configs-hero.webp",
    "relatedConfigSlug": "global-multilingual-content-pipeline",
    "title": {
      "en": "Automated Visual Asset Pipeline for Vibe Coding (Zero-Text WebP via Clavue Image)",
      "zh": "Vibe Coding 自动化视觉素材管线（Clavue Image 无字 WebP 生成）",
      "ja": "Vibe Coding 用の自動化されたビジュアルアセットパイプライン（Clavue Image を介したテキストなし WebP）",
      "ko": "Vibe Coding 을 위한 자동화된 시각 자산 파이프라인 (Clavue Image 를 통한 텍스트 없는 WebP)",
      "de": "Automatisierte visuelle Asset-Pipeline für Vibe Coding (Textloser WebP über Clavue Image)",
      "fr": "Pipeline d'actifs visuels automatisé pour Vibe Coding (WebP sans texte via Clavue Image)",
      "es": "Pipeline de activos visuales automatizada para Vibe Coding (WebP sin texto vía Clavue Image)",
      "pt": "Pipeline de ativos visuais automatizado para Vibe Coding (WebP sem texto via Clavue Image)"
    },
    "tagline": {
      "en": "Generate cohesive dark-tech 16:9 WebP artwork programmatically inside your build workflow",
      "zh": "在开发流中一键生成风格统一的 16:9 出版级深色科技 WebP 配图（20–125 KB）",
      "ja": "ビルドワークフロー内で、一貫したダークテック 16:9 WebP アートをプログラム的に生成",
      "ko": "빌드 워크플로우 내에서 일관된 다크테크 16:9 WebP 아트를 프로그래밍 방식으로 생성",
      "de": "Generieren Sie programmatisch konsistente Dark-Tech 16:9 WebP-Kunstwerke direkt in Ihrem Build-Workflow",
      "fr": "Générez artistiquement des œuvres WebP 16:9 Dark-Tech cohérentes de manière programmable dans votre flux de construction",
      "es": "Genere artísticas WebP 16:9 Dark-Tech coherentes de manera programática dentro de su flujo de compilación",
      "pt": "Gere artisticamente obras WebP 16:9 Dark-Tech coerentes de forma programática dentro do seu fluxo de build"
    },
    "overview": {
      "en": "Text-only developer docs bounce users; stock photos look generic. Generate bespoke 16:9 WebP visuals via OpenAI-compatible `/v1/images/generations` (`clavue-img`), strictly enforcing `zero text, no labels, no watermark` and checking RIFF/WEBP headers in CI.",
      "zh": "纯文本站点留存低、网图同质化严重。通过 OpenAI 兼容 `/v1/images/generations`（`clavue-img`）按统一导演语法批量生成无字 WebP，并在 CI 校验魔数头与显式宽高避免 CLS 抖动。",
      "ja": "テキストだけのドキュメントはユーザーを離脱させ、ストック写真は陳腐に見えます。OpenAI 互換の `/v1/images/generations`（`clavue-img`）を介して、独自に作成された 16:9 WebP ビジュアルを生成し、CI で RIFF/WEBP ヘッダーを確認しながら、厳密に「テキストなし、ラベルなし、ウォーターマークなし」を強制します。",
      "ko": "텍스트만 있는 개발자 문서는 사용자를 이탈시키고, 스톡 사진은 일반적입니다. OpenAI 호환 `/v1/images/generations` (`clavue-img`) 를 통해 맞춤형 16:9 WebP 비주얼을 생성하고, CI 에서 RIFF/WEBP 헤더를 확인하면서 '텍스트 없음, 라벨 없음, 워터마크 없음'을 엄격히 강제합니다.",
      "de": "Dokumente mit nur Text treiben Nutzer davon; Stockfotos wirken generisch. Erzeugen Sie maßgeschneiderte 16:9 WebP-Bilder über OpenAI-kompatible `/v1/images/generations` (`clavue-img`), erzwingen Sie strikt 'kein Text, keine Beschriftungen, kein Wasserzeichen' und prüfen Sie RIFF/WEBP-Header in der CI.",
      "fr": "La documentation textuelle seule repousse les utilisateurs ; les photos de banque d'images semblent génériques. Générez des visuels WebP 16:9 sur mesure via `/v1/images/generations` compatible OpenAI (`clavue-img`), en imposant strictement 'aucun texte, aucune étiquette, aucun filigrane' et en vérifiant les en-têtes RIFF/WEBP en CI.",
      "es": "La documentación solo en texto aleja a los usuarios; las fotos de stock parecen genéricas. Genere visuales WebP 16:9 personalizados vía `/v1/images/generations` compatible con OpenAI (`clavue-img`), imponiendo estrictamente 'sin texto, sin etiquetas, sin marca de agua' y verificando encabezados RIFF/WEBP en CI.",
      "pt": "Documentação apenas em texto afasta os usuários; fotos de stock parecem genéricas. Gere visuais WebP 16:9 personalizados via `/v1/images/generations` compatível com OpenAI (`clavue-img`), impondo estritamente 'sem texto, sem rótulos, sem marca d'água' e verificando cabeçalhos RIFF/WEBP na CI."
    },
    "readinessNote": {
      "en": "95% completable today: produces 20–125 KB publication-grade WebP covers in ~10s per image.",
      "zh": "当前可完成度 95%：单张约 10 秒直出高质感轻量 WebP。",
      "ja": "今日で 95% 完了可能：1 枚あたり約 10 秒で、20–125 KB の出版グレードの WebP カバーを生成します。",
      "ko": "오늘 95% 완료 가능: 이미지당 약 10 초 내에 20–125 KB 의 출판 등급 WebP 커버를 생성합니다.",
      "de": "Heute zu 95% umsetzbar: Erzeugt publizierungsfertige WebP-Cover von 20–125 KB in ca. 10 Sekunden pro Bild.",
      "fr": "95% réalisable aujourd'hui : produit des couvertures WebP de qualité publication de 20–125 KB en ~10s par image.",
      "es": "95% completado hoy: produce portadas WebP de calidad de publicación de 20–125 KB en ~10s por imagen.",
      "pt": "95% realizável hoje: produz capas WebP de qualidade de publicação de 20–125 KB em ~10s por imagem."
    },
    "steps": [
      {
        "en": "Lock a unified visual art direction (dark obsidian surfaces, warm amber & cyan light accents, zero text).",
        "zh": "锁定全站统一美术基调（深曜石材质 + 暖琥珀/冰青光效 + 严格无文字）。",
        "ja": "統一されたビジュアルアートディレクションを固定します（ダークオプシディアン表面、暖かいアンバーとシアンライトのアクセント、テキストなし）。",
        "ko": "통합된 시각 아트 방향을 고정합니다 (다크 옵시디언 표면, 따뜻한 앰버 및 시안 라이트 액센트, 텍스트 없음).",
        "de": "Festlegen Sie eine einheitliche visuelle Kunstrichtung (dunkle Obsidian-Oberflächen, warme Amber- und Cyan-Lichtakzente, kein Text).",
        "fr": "Verrouillez une direction artistique visuelle unifiée (surfaces obsidiennes sombres, accents de lumière ambre et cyan chauds, aucun texte).",
        "es": "Bloquee una dirección artística visual unificada (superficies obsidianas oscuras, acentos de luz ámbar y cian cálidos, sin texto).",
        "pt": "Trave uma direção artística visual unificada (superfícies obsidianas escuras, acentos de luz âmbar e cian quentes, sem texto)."
      },
      {
        "en": "Generate native 1344×768 WebP assets via script and visually inspect every image before shipping.",
        "zh": "脚本批量生成 1344×768 原生 WebP 并逐张人工目视终审。",
        "ja": "スクリプトを使用してネイティブ 1344×768 WebP アセットを生成し、出荷前にすべての画像を視覚的に確認します。",
        "ko": "스크립트를 통해 네이티브 1344×768 WebP 자산을 생성하고, 출시 전 모든 이미지를 시각적으로 확인합니다.",
        "de": "Generieren Sie native 1344×768 WebP-Assets per Skript und prüfen Sie jedes Bild visuell vor dem Versand.",
        "fr": "Générez des actifs WebP natifs 1344×768 via script et inspectez visuellement chaque image avant diffusion.",
        "es": "Genere activos WebP nativos 1344×768 mediante script e inspeccione visualmente cada imagen antes de enviar.",
        "pt": "Gere ativos WebP nativos 1344×768 via script e inspecione visualmente cada imagem antes do envio."
      },
      {
        "en": "Assert RIFF/WEBP magic bytes and explicit `width`/`height` attributes to guarantee zero CLS.",
        "zh": "单测校验 RIFF/WEBP 文件头与 HTML 显式尺寸属性。",
        "ja": "RIFF/WEBP マジックバイトと明示的な `width`/`height` 属性をアサートし、ゼロ CLS を保証します。",
        "ko": "RIFF/WEBP 마법 바이트와 명시적인 `width`/`height` 속성을 주장하여 제로 CLS 를 보장합니다.",
        "de": "Assertieren Sie RIFF/WEBP-Magic-Bytes und explizite `width`/`height`-Attribute, um CLS=0 zu garantieren.",
        "fr": "Affirmez les octets magiques RIFF/WEBP et les attributs explicites `width`/`height` pour garantir un CLS nul.",
        "es": "Asegure los bytes mágicos RIFF/WEBP y los atributos explícitos `width`/`height` para garantizar CLS cero.",
        "pt": "Asserte bytes mágicos RIFF/WEBP e atributos explícitos `width`/`height` para garantir CLS zero."
      }
    ],
    "vibePrompt": "Write a Node.js script to generate 4 cohesive 16:9 zero-text WebP editorial covers via POST /v1/images/generations, validate RIFF/WEBP magic bytes, and save them into public/img/guides/.",
    "configFilename": "image-spec.json",
    "configLang": "json",
    "configCode": "{\n  \"model\": \"clavue-img\",\n  \"size\": \"1344x768\",\n  \"steps\": 9,\n  \"guidance_scale\": 0.0,\n  \"output_format\": \"webp\",\n  \"suffix\": \"zero text, no labels, no watermark\"\n}",
    "programFilename": "scripts/gen-cover.mjs",
    "programLang": "javascript",
    "programCode": "import fs from 'node:fs';\nconst res = await fetch(`${process.env.CLAVUE_GATEWAY}/v1/images/generations`, {\n  method: 'POST',\n  headers: { 'content-type': 'application/json' },\n  body: JSON.stringify({ model: 'clavue-img', prompt: 'Minimalist dark obsidian prism refracting amber light, studio lighting, zero text, no watermark', size: '1344x768', output_format: 'webp', response_format: 'b64_json' }),\n});\nconst buf = Buffer.from((await res.json()).data[0].b64_json, 'base64');\nif (buf.subarray(0, 4).toString('ascii') !== 'RIFF') throw new Error('Invalid WebP');\nfs.writeFileSync('public/img/cover.webp', buf);"
  },
  {
    "slug": "debugging-and-log-driven-iteration",
    "track": "operations",
    "level": "intermediate",
    "completionPct": 92,
    "estimatedMinutes": 20,
    "heroImage": "/img/guides/configs-readiness.webp",
    "relatedConfigSlug": "global-multilingual-content-pipeline",
    "title": {
      "en": "Log-Driven Vibe Iteration: Turning Production Telemetry into Next-Sprint Plans",
      "zh": "日志驱动的 Vibe 持续迭代：从线上真实流量反推下一轮开发靶点",
      "ja": "ログ駆動のバイブ反復：本番環境のテレメトリを次のスプリント計画に変換する",
      "ko": "로그 기반 바이브 반복: 프로덕션 텔레메트리를 다음 스프린트 계획으로 전환하기",
      "de": "Log-gesteuerte Vibe-Iteration: Produktions-Telemetrie in nächste-Sprint-Pläne umwandeln",
      "fr": "Itération Vibe pilotée par les logs : Transformer la télémétrie de production en plans de sprint suivants",
      "es": "Iteración Vibe impulsada por registros: Convertir la telemetría de producción en planes de siguiente sprint",
      "pt": "Iteração Vibe impulsionada por logs: Transformar telemetria de produção em planos de próximo sprint"
    },
    "tagline": {
      "en": "Parse real Nginx timing logs, 404 hotspots, crawler mixes, and SQLite funnel counts to pick high-ROI work",
      "zh": "自动解析 Nginx 耗时日志、404 热点、爬虫结构与只读漏斗库，让每次迭代直击高回报瓶颈",
      "ja": "実際の Nginx タイミングログ、404 ホットスポット、クローラーのミックス、および SQLite フネルカウントを解析して、高 ROI のタスクを選択します。",
      "ko": "실제 Nginx 타이밍 로그, 404 핫스팟, 크롤러 믹스, 및 SQLite 퍼널 카운트를 파싱하여 고 ROI 작업을 선택합니다.",
      "de": "Echte Nginx-Timing-Logs, 404-Hotspots, Crawler-Mischungen und SQLite-Funnel-Zahlen parsen, um hoch-ROI-Arbeiten auszuwählen.",
      "fr": "Parsez les vrais logs de timing Nginx, les hotspots 404, les mélanges de crawlers et les comptes de tunnel SQLite pour sélectionner des travaux à haut ROI.",
      "es": "Parsea registros reales de tiempo de Nginx, puntos calientes 404, mezclas de arañas y conteos de embudo SQLite para seleccionar trabajo de alto ROI.",
      "pt": "Parse logs reais de tempo do Nginx, hotspots 404, misturas de crawlers e contagens de funil SQLite para escolher trabalho de alto ROI."
    },
    "overview": {
      "en": "Stop guessing what to build next. Run a zero-dependency daily traffic & funnel analyzer over real Nginx logs and read-only SQLite accounts—discovering exact slow endpoints, top 404 probes (like `/v1/models`), and which languages drive real traffic.",
      "zh": "不要拍脑袋决定下一步做什么。每天自动汇总真实访问日志与账户漏斗：慢静态文件、开发者高频探测的 404 路径、真实访客语种分布一目了然，直接转化为下一波编码任务书。",
      "ja": "次に何を構築すべきか推測するのをやめましょう。依存関係ゼロの日常トラフィックおよびフネルアナライザーを実際の Nginx ログと読み取り専用 SQLite アカウントに適用し、正確な遅延エンドポイント、上位 404 プロブ（例：`/v1/models`）、および実際のトラフィックを駆動する言語を発見します。",
      "ko": "다음에 무엇을 구축할지 추측하지 마세요. 의존성 없는 일일 트래픽 및 퍼널 분석기를 실제 Nginx 로그와 읽기 전용 SQLite 계정에 적용하여 정확한 느린 엔드포인트, 상위 404 프로브 (예: `/v1/models`), 및 실제 트래픽을 주도하는 언어를 발견합니다.",
      "de": "Hören Sie auf, zu raten, was als Nächstes gebaut werden soll. Führen Sie einen null-Abhängigkeits-täglichen Verkehrs- und Funnel-Analysator über echte Nginx-Logs und read-only SQLite-Konten durch, um genaue langsame Endpunkte, Top-404-Abfragen (wie `/v1/models`) und welche Sprachen echten Verkehr antreiben, zu entdecken.",
      "fr": "Arrêtez de deviner ce qu'il faut construire ensuite. Exécutez un analyseur de trafic et de tunnel quotidien sans dépendance sur de vrais logs Nginx et des comptes SQLite en lecture seule, pour découvrir les endpoints lents exacts, les top 404 probes (comme `/v1/models`), et les langues qui génèrent du trafic réel.",
      "es": "Deja de adivinar qué construir a continuación. Ejecuta un analizador de tráfico y embudo diario sin dependencias sobre registros reales de Nginx y cuentas SQLite de solo lectura, descubriendo endpoints lentos exactos, top 404 probes (como `/v1/models`), y qué lenguajes impulsan tráfico real.",
      "pt": "Pare de adivinhar o que construir a seguir. Execute um analisador de tráfego e funil diário sem dependências sobre logs reais do Nginx e contas SQLite de leitura apenas, descobrindo endpoints lentos exatos, top 404 probes (como `/v1/models`), e quais idiomas impulsionam tráfego real."
    },
    "readinessNote": {
      "en": "92% completable today: automated daily Feishu/Slack traffic digest turns ops data into concrete next-wave prompts.",
      "zh": "当前可完成度 92%：零依赖日志汇总脚本 + 飞书日报闭环已上线运行。",
      "ja": "今日完了可能率 92%：自動化された日常 Feishu/Slack トラフィック要約が、運用データを具体的な次の波のプロンプトに変換します。",
      "ko": "오늘 완료 가능률 92%: 자동화된 일일 Feishu/Slack 트래픽 요약이 운영 데이터를 구체적인 다음 웨이브 프롬프트로 변환합니다.",
      "de": "92% heute abschließbar: automatisierte tägliche Feishu/Slack-Verkehrszusammenfassung verwandelt Betriebsdaten in konkrete nächste-Welle-Prompts.",
      "fr": "92% réalisables aujourd'hui : un résumé quotidien automatisé du trafic Feishu/Slack transforme les données opérationnelles en prompts concrets pour la prochaine vague.",
      "es": "92% completables hoy: un resumen diario automatizado de tráfico Feishu/Slack convierte datos operativos en prompts concretos para la siguiente ola.",
      "pt": "92% completáveis hoje: um resumo diário automatizado de tráfego Feishu/Slack transforma dados operacionais em prompts concretos para a próxima onda."
    },
    "steps": [
      {
        "en": "Log `$request_time` and `$upstream_response_time` with real Cloudflare client IPs in Nginx.",
        "zh": "Nginx 日志开启真实 IP 还原并记录 `rt` / `urt` 耗时字段。",
        "ja": "Nginx で `$request_time` と `$upstream_response_time` をログ記録し、実際の Cloudflare クライアント IP を含めます。",
        "ko": "Nginx 에서 `$request_time` 과 `$upstream_response_time` 을 로그 기록하고 실제 Cloudflare 클라이언트 IP 를 포함합니다.",
        "de": "Loggen Sie `$request_time` und `$upstream_response_time` mit echten Cloudflare-Client-IPs in Nginx.",
        "fr": "Enregistrez `$request_time` et `$upstream_response_time` avec les vraies adresses IP clients Cloudflare dans Nginx.",
        "es": "Registra `$request_time` y `$upstream_response_time` con IPs reales de clientes Cloudflare en Nginx.",
        "pt": "Registre `$request_time` e `$upstream_response_time` com IPs reais de clientes Cloudflare no Nginx."
      },
      {
        "en": "Separate real browsers, search engines, AI answer engines, and noisy backlink scrapers automatically.",
        "zh": "自动区分真人交互、搜索引擎、AI 答案引擎与高噪采集器。",
        "ja": "実際のブラウザ、検索エンジン、AI 回答エンジン、およびノイズの多いバックリンクスクレイパーを自動的に分離します。",
        "ko": "실제 브라우저, 검색 엔진, AI 답변 엔진, 및 노이즈가 많은 백링크 스크레이퍼를 자동으로 분리합니다.",
        "de": "Trennen Sie echte Browser, Suchmaschinen, KI-Antwort-Engines und laute Backlink-Scraper automatisch.",
        "fr": "Séparez automatiquement les vrais navigateurs, les moteurs de recherche, les moteurs de réponse IA et les scrapers de backlink bruyants.",
        "es": "Separa automáticamente navegadores reales, motores de búsqueda, motores de respuesta de IA y scrapers de backlinks ruidosos.",
        "pt": "Separe automaticamente navegadores reais, motores de busca, motores de resposta de IA e scrapers de backlinks ruidosos."
      },
      {
        "en": "Feed top 404s, slow paths, and conversion drop-offs directly into your next Vibe Coding sprint plan.",
        "zh": "把慢请求、真实 404 与漏斗流失页直接写成下一轮 Vibe Coding 需求。",
        "ja": "上位 404、遅延パス、およびコンバージョン低下を、次のバイブコーディングスプリント計画に直接反映します。",
        "ko": "상위 404, 느린 경로, 및 전환 저하를 다음 바이브 코딩 스프린트 계획에 직접 반영합니다.",
        "de": "Füttern Sie Top-404s, langsame Pfade und Konversionsabfälle direkt in Ihren nächsten Vibe-Coding-Sprint-Plan.",
        "fr": "Alimentez directement les top 404, les chemins lents et les baisses de conversion dans votre prochain plan de sprint de Vibe Coding.",
        "es": "Alimenta directamente los top 404, rutas lentas y caídas de conversión en tu próximo plan de sprint de Vibe Coding.",
        "pt": "Alimente diretamente os top 404, caminhos lentos e quedas de conversão no seu próximo plano de sprint de Vibe Coding."
      }
    ],
    "vibePrompt": "Build a read-only Node.js script that parses nginx timing logs (including .gz) and read-only SQLite funnel tables to report 5xx count, slow requests >=0.5s, top non-scanner 404s, and engaged browser sessions.",
    "configFilename": "cron-traffic-report",
    "configLang": "bash",
    "configCode": "25 0 * * * root set -a; . /etc/app/app.env; set +a; /usr/bin/node /opt/app/traffic-report.mjs --days=1 --feishu >> /var/log/traffic-report.log 2>&1",
    "programFilename": "scripts/find-slow.mjs",
    "programLang": "javascript",
    "programCode": "import fs from 'node:fs';\nconst slow = fs.readFileSync('/var/log/nginx/jevcode-timing.log', 'utf8')\n  .split('\\n')\n  .map((l) => ({ m: l.match(/\"(\\S+ \\S+) [^\"]+\" (\\d{3}).*rt=([\\d.]+)/) }))\n  .filter((x) => x.m && Number(x.m[3]) >= 0.5)\n  .sort((a, b) => Number(b.m[3]) - Number(a.m[3]))\n  .slice(0, 10);\nconsole.table(slow.map((x) => ({ req: x.m[1], status: x.m[2], rt: x.m[3] })));"
  },
  {
    "slug": "future-vibe-coding-2026-2027",
    "track": "roadmap",
    "level": "advanced",
    "completionPct": 72,
    "estimatedMinutes": 20,
    "heroImage": "/img/guides/configs-future.webp",
    "relatedConfigSlug": "future-2027-autonomous-agent-fleet",
    "title": {
      "en": "2026–2027+ Future Vibe Coding: Overnight Goal Swarms & Self-Healing Repos",
      "zh": "2026–2027+ 未来 AI Vibe Coding 演进路线：通宵目标蜂群与自愈代码库",
      "ja": "2026–2027+ 未来バイブコーディング：一夜で完結する目標群と自己修復リポジトリ",
      "ko": "2026–2027+ 미래 바이브 코딩: 밤새 완료되는 목표 군집과 자체 치유 저장소",
      "de": "2026–2027+ Zukunftsvibe-Coding: Übernacht-Ziel-Schwärme und selbstheilende Repositories",
      "fr": "2026–2027+ Vibe Coding futur : Essaims d'objectifs nocturnes et dépôts auto-réparateurs",
      "es": "2026–2027+ Vibe Coding del futuro: Enjambres de objetivos nocturnos y repositorios auto-curativos",
      "pt": "2026–2027+ Vibe Coding do futuro: Enxames de objetivos noturnos e repositórios auto-curativos"
    },
    "tagline": {
      "en": "What works at 95% today vs what reaches maturity across 2026H2–2027 (with quantified readiness table)",
      "zh": "客观拆解今日 95% 成熟能力与 2026H2–2027 演进前沿（含可完成度量化）",
      "ja": "今日 95% で機能するもの vs 2026H2–2027 にかけて成熟するもの（定量的な準備状況表付き）",
      "ko": "오늘 95% 작동하는 것 vs 2026H2–2027 년에 성숙하는 것 (정량화된 준비도 표 포함)",
      "de": "Was heute zu 95 % funktioniert vs. was bis 2026H2–2027 Reife erlangt (mit quantifizierter Bereitstellungs-Tabelle)",
      "fr": "Ce qui fonctionne à 95 % aujourd'hui vs ce qui atteint la maturité entre 2026H2–2027 (avec tableau de préparation quantifié)",
      "es": "Lo que funciona al 95 % hoy vs lo que alcanza la madurez entre 2026H2–2027 (con tabla de preparación cuantificada)",
      "pt": "O que funciona a 95 % hoje vs o que atinge a maturidade entre 2026H2–2027 (com tabela de prontidão quantificada)"
    },
    "overview": {
      "en": "Vibe Coding is evolving from interactive IDE copilot sessions into long-running goal-driven agent fleets: spec → parallel isolated worktrees → automated visual/browser verification → Jev acceptance verdict → staged canary deploy. Adopt clean contracts today so your repo is ready.",
      "zh": "AI 编程正从单轮 IDE 补全演进为目标驱动的自主工程蜂群：契约拆解 → 隔离工作树并行编码 → 浏览器视觉自检 → 独立 Jev 裁决 → 灰度自动发布。今天把工程门禁建扎实，明天即可平滑接入全自主演进。",
      "ja": "バイブコーディングは、対話型 IDE コパイロットセッションから、長期的な目標指向エージェント艦隊へと進化しています。仕様 → 並列孤立ワークツリー → 自動化された視覚/ブラウザ検証 → Jev 受容判定 → 段階的なカナリーデプロイ。今日からクリーンな契約を採用し、リポジトリを準備しておいてください。",
      "ko": "바이브 코딩은 대화형 IDE 코파일럿 세션에서 장기적인 목표 지향 에이전트 함대로 진화하고 있습니다. 사양 → 병렬 격리 워크트리 → 자동화된 시각/브라우저 검증 → Jev 수용 판정 → 단계적 카나리 배포. 오늘부터 깔끔한 계약을 채택하여 저장소를 준비하세요.",
      "de": "Vibe Coding entwickelt sich von interaktiven IDE-Copilot-Sitzungen zu langlaufenden zielorientierten Agentenflotten: Spezifikation → parallele isolierte Worktrees → automatisierte visuelle/Browser-Verifikation → Jev-Akzeptanzurteil → gestaffelter Canary-Deploy. Nehmen Sie heute saubere Verträge an, damit Ihr Repository bereit ist.",
      "fr": "Le Vibe Coding évolue des sessions interactives de copilot IDE vers des flottes d'agents à long terme orientés objectifs : spécification → worktrees isolés parallèles → vérification visuelle/navigateur automatisée → verdict d'acceptation Jev → déploiement canary en étapes. Adoptez des contrats propres dès aujourd'hui pour que votre dépôt soit prêt.",
      "es": "El Vibe Coding evoluciona desde sesiones interactivas de copiloto de IDE hacia flotas de agentes a largo plazo orientados a objetivos: especificación → worktrees aislados paralelos → verificación visual/navegador automatizada → veredicto de aceptación Jev → despliegue canario en etapas. Adopte contratos limpios hoy para que su repositorio esté listo.",
      "pt": "O Vibe Coding está evoluindo de sessões interativas de copiloto de IDE para frotas de agentes de longo prazo orientados a objetivos: especificação → worktrees isolados paralelos → verificação visual/navegador automatizada → veredito de aceitação Jev → implantação canária em etapas. Adote contratos limpos hoje para que seu repositório esteja pronto."
    },
    "readinessNote": {
      "en": "72% completable autonomously today (single-repo feature waves + CI + deploy); 28% (cross-service schema migrations & visual UX taste arbitration) maturing rapidly through 2027.",
      "zh": "当前全自主可完成度 72%（单仓功能波次 + 测试 + 发布已高度成熟）；剩余 28%（跨仓数据迁移与主观审美裁决）将在 2027 年逐步补齐。",
      "ja": "今日、自律的に完了可能なものは 72%（単一リポジトリ機能波 + CI + デプロイ）；残る 28%（クロスサービススキーママイグレーションと視覚 UX 嗜好仲裁）は 2027 年にかけて急速に成熟しています。",
      "ko": "오늘 자율적으로 완료 가능한 것은 72%(단일 저장소 기능 파동 + CI + 배포); 나머지 28%(크로스 서비스 스키마 마이그레이션 및 시각 UX 취향 중재) 는 2027 년까지 급속히 성숙하고 있습니다.",
      "de": "72 % können heute autonom abgeschlossen werden (Single-Repo-Funktionswellen + CI + Deploy); 28 % (Cross-Service-Schema-Migrationen und visuelle UX-Geschmacksurteile) reifen bis 2027 rasch weiter.",
      "fr": "72 % peuvent être complétés de manière autonome aujourd'hui (vagues de fonctionnalités mono-répertoire + CI + déploiement) ; 28 % (migrations de schéma inter-services et arbitrage des goûts UX visuels) mûrissent rapidement jusqu'en 2027.",
      "es": "72 % completan de forma autónoma hoy (olas de características de un solo repositorio + CI + despliegue); 28 % (migraciones de esquema entre servicios y arbitraje de gustos UX visuales) maduran rápidamente hasta 2027.",
      "pt": "72 % completáveis autonomamente hoje (ondas de recursos de único repositório + CI + deploy); 28 % (migrações de esquema entre serviços e arbitragem de gostos UX visuais) amadurecendo rapidamente até 2027."
    },
    "steps": [
      {
        "en": "Keep every repo check deterministic (`npm run check`, `npm test`, `preflight --json`).",
        "zh": "确保仓库所有质量门禁可机读且确定性退出（`preflight --json`）。",
        "ja": "すべてのリポジトリチェックを決定論的に保つ（`npm run check`、`npm test`、`preflight --json`）。",
        "ko": "모든 저장소 체크를 결정론적으로 유지하세요 (`npm run check`, `npm test`, `preflight --json`).",
        "de": "Halten Sie jeden Repo-Check deterministisch (`npm run check`, `npm test`, `preflight --json`).",
        "fr": "Gardez chaque vérification de dépôt déterministe (`npm run check`, `npm test`, `preflight --json`).",
        "es": "Mantenga cada comprobación de repositorio determinista (`npm run check`, `npm test`, `preflight --json`).",
        "pt": "Mantenha cada verificação de repositório determinística (`npm run check`, `npm test`, `preflight --json`)."
      },
      {
        "en": "Enforce strict `--write-scope` contracts and non-root sandboxes before enabling unattended overnight runs.",
        "zh": "开启通宵无人值守模式前先锁死 `--write-scope` 与非 root 沙箱。",
        "ja": "無人のovernight実行を有効にする前に、厳格な `--write-scope` 契約と非ルートサンドボックスを強制してください。",
        "ko": "무인 밤새 실행을 활성화하기 전에 엄격한 `--write-scope` 계약과 비 루트 샌드박스를 강제하세요.",
        "de": "Erzwingen Sie strenge `--write-scope`-Verträge und Nicht-Root-Sandboxen, bevor Sie unbeaufsichtigte Übernachtläufe aktivieren.",
        "fr": "Imposez des contrats stricts `--write-scope` et des sandbox non root avant d'activer les exécutions nocturnes sans surveillance.",
        "es": "Imponga contratos estrictos `--write-scope` y sandboxes no root antes de habilitar ejecuciones nocturnas sin supervisión.",
        "pt": "Imponha contratos estritos `--write-scope` e sandboxes não root antes de habilitar execuções noturnas sem supervisão."
      },
      {
        "en": "Use clavue-jev as an independent, fast, low-cost judge separate from the coding model that wrote the diff.",
        "zh": "坚持用独立的快速判官（clavue-jev）验收编码模型产出，杜绝「既当运动员又当裁判」。",
        "ja": "差分を作成したコーディングモデルとは独立した、高速で低コストの判定器として clavue-jev を使用してください。",
        "ko": "차이를 작성한 코딩 모델과 독립적으로 빠르고 저비용의 판정기로 clavue-jev 를 사용하세요.",
        "de": "Verwenden Sie clavue-jev als unabhängigen, schnellen, kostengünstigen Richter, der vom Codierungsmodell getrennt ist, das den Diff geschrieben hat.",
        "fr": "Utilisez clavue-jev comme juge indépendant, rapide et à faible coût, séparé du modèle de codage ayant écrit le diff.",
        "es": "Utilice clavue-jev como juez independiente, rápido y de bajo costo, separado del modelo de codificación que escribió el diff.",
        "pt": "Use clavue-jev como juiz independente, rápido e de baixo custo, separado do modelo de codificação que escreveu o diff."
      }
    ],
    "vibePrompt": "Plan an unattended overnight improvement cycle: inspect production traffic logs, identify top 3 measurable bottlenecks, implement fixes in disjoint waves, run full test + build gates, and stop if Jev acceptance < 0.92.",
    "configFilename": "future-vibe-loop.yaml",
    "configLang": "yaml",
    "configCode": "autonomous_cycle:\n  trigger: weekly_telemetry_digest\n  planner_model: frontier_architect\n  worker_cli: clavue\n  parallel_worktrees: 4\n  independent_judge: clavue-jev\n  promote_if_jev_noul_gte: 0.92\n  hard_budget_usd: 3.00",
    "programFilename": "scripts/readiness-score.mjs",
    "programLang": "javascript",
    "programCode": "export const VIBE_READINESS_2026_2027 = {\n  singleRepoFeatureWaves: 0.95,\n  multilingualSeoAndAssets: 0.94,\n  securityHardeningAndTests: 0.93,\n  overnightAutonomousRefactor: 0.78,\n  crossServiceZeroDowntimeMigration: 0.65,\n};"
  }
];
