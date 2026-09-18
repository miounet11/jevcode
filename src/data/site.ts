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

/** 各语言均从 i18n/ui.ts 的 Lang 派生，新增语言时 TypeScript 会强制补齐。 */
import type { Lang } from '../i18n/ui';

export const sectionTitles: Record<SectionKey, Record<Lang, string>> = {
  start:     {
      zh: '快速开始',
      en: 'Getting started',
      ja: 'はじめに',
      ko: '시작하기',
      de: 'Erste Schritte',
      fr: 'Premiers pas',
      es: 'Primeros pasos',
      pt: 'Primeiros passos',
    },
  concepts:     {
      zh: '核心概念',
      en: 'Core concepts',
      ja: '基本概念',
      ko: '핵심 개념',
      de: 'Grundkonzepte',
      fr: 'Concepts fondamentaux',
      es: 'Conceptos básicos',
      pt: 'Conceitos principais',
    },
  primitives:     {
      zh: '问题原语',
      en: 'Primitives',
      ja: 'プリミティブ',
      ko: '프라이머티브',
      de: 'Primitiven',
      fr: 'Primitives',
      es: 'Primitivas',
      pt: 'Primitivas',
    },
  patterns:     {
      zh: '架构模式',
      en: 'Patterns',
      ja: 'パターン',
      ko: '패턴',
      de: 'Muster',
      fr: 'Modèles',
      es: 'Patrones',
      pt: 'Padrões',
    },
  sdk:     {
      zh: 'SDK 与集成',
      en: 'SDKs & integration',
      ja: 'SDKと統合',
      ko: 'SDK 및 통합',
      de: 'SDKs & Integration',
      fr: 'SDK & intégration',
      es: 'SDKs e integración',
      pt: 'SDKs e integração',
    },
  cases:     {
      zh: '生态案例',
      en: 'Ecosystem cases',
      ja: 'エコシステム事例',
      ko: '생태계 사례',
      de: 'Ökosystem-Beispiele',
      fr: 'Cas d\'écosystème',
      es: 'Casos del ecosistema',
      pt: 'Casos do ecossistema',
    },
};

export function sectionTitle(key: string, lang: Lang): string {
  const s = sectionTitles[key as SectionKey];
  return s ? s[lang] : key;
}

/** 三种问题原语的展示卡片数据 */
export const primitiveCards = [
  {
    slug: 'choice',
    label: 'Choice',
    tagline:     {
      zh: '在候选集中选一个',
      en: 'Pick one from a set',
      ja: '選択肢から1つ選択',
      ko: '옵션 중 하나 선택',
      de: 'Eine Option aus einer Menge wählen',
      fr: 'Choisir un élément d\'un ensemble',
      es: 'Elige uno de un conjunto',
      pt: 'Escolha uma opção de um conjunto',
    },
    desc:     {
      zh: '给定一组互斥选项，模型返回选中的选项及置信度。适用于意图分类、工单路由、动作选择。',
      en: 'Given a set of mutually exclusive options, the model returns the selected option with a confidence. Used for intent classification, ticket routing, action selection.',
      ja: '相互排他的な選択肢のセットが与えられた場合、モデルは選択された選択肢と信頼度を返します。意図分類、チケットルーティング、アクション選択に使用します。',
      ko: '서로 배타적인 옵션 집합에서 모델이 선택된 옵션과 신뢰도를 반환합니다. 의도 분류, 티켓 라우팅, 액션 선택에 사용합니다.',
      de: 'Bei einer Menge sich gegenseitig ausschließender Optionen gibt das Modell die gewählte Option mit einem Konfidenzwert zurück. Wird für Intent-Klassifikation, Ticket-Routing und Aktionsauswahl verwendet.',
      fr: 'À partir d\'un ensemble d\'options mutuellement exclusives, le modèle renvoie l\'option sélectionnée avec une confiance. Utilisé pour la classification d\'intention, le routage de tickets et la sélection d\'actions.',
      es: 'Dado un conjunto de opciones mutuamente excluyentes, el modelo devuelve la opción seleccionada con un nivel de confianza. Se usa para clasificación de intención, enrutamiento de tickets y selección de acciones.',
      pt: 'Dado um conjunto de opções mutuamente exclusivas, o modelo retorna a opção selecionada com um nível de confiança. Usado para classificação de intenção, roteamento de tickets e seleção de ações.',
    },
  },
  {
    slug: 'score',
    label: 'Score',
    tagline:     {
      zh: '在量纲上打分',
      en: 'Rate along a scale',
      ja: 'スケールで評価',
      ko: '스케일로 평가',
      de: 'Auf einer Skala bewerten',
      fr: 'Noter sur une échelle',
      es: 'Califica en una escala',
      pt: 'Avalie em uma escala',
    },
    desc:     {
      zh: '按定义好的量纲或评分标准打分，返回数值与置信度。适用于相关性排序、质量评估、风险分级。',
      en: 'Rate along a defined scale or rubric, returning a numeric value with confidence. Used for relevance ranking, quality assessment, risk grading.',
      ja: '定義されたスケールまたはルーブリックに沿って評価し、信頼度付きの数値を返します。関連性ランキング、品質評価、リスク格付けに使用します。',
      ko: '정의된 스케일 또는 평가 기준에 따라 수치와 신뢰도를 반환합니다. 관련성 랭킹, 품질 평가, 위험 등급에 사용합니다.',
      de: 'Bewerten Sie auf einer definierten Skala oder Rubrik und geben Sie einen numerischen Wert mit einem Konfidenzwert zurück. Wird für Relevanz-Ranking, Qualitätsbewertung und Risikoeinstufung verwendet.',
      fr: 'Noter selon une échelle ou une grille définie, en renvoyant une valeur numérique avec une confiance. Utilisé pour le classement par pertinence, l\'évaluation de la qualité et la notation du risque.',
      es: 'Califica según una escala o rúbrica definida, devolviendo un valor numérico con un nivel de confianza. Se usa para clasificación por relevancia, evaluación de calidad y calificación de riesgo.',
      pt: 'Avalie em uma escala ou rubrica definida, retornando um valor numérico com nível de confiança. Usado para ranqueamento de relevância, avaliação de qualidade e classificação de risco.',
    },
  },
  {
    slug: 'noul',
    label: 'Noul',
    tagline:     {
      zh: '回答一个是/否概率',
      en: 'Probability of yes/no',
      ja: 'Yes/Noの確率',
      ko: '예/아니오 확률',
      de: 'Ja/Nein-Wahrscheinlichkeit',
      fr: 'Probabilité oui/non',
      es: 'Probabilidad de sí/no',
      pt: 'Probabilidade de sim/não',
    },
    desc:     {
      zh: '提出一个是/否问题，返回答案为「是」的概率。适用于内容校验、断言核查、智能体护栏。',
      en: 'Ask a yes/no question and get the probability the answer is yes. Used for verification, claim checking, agent guardrails.',
      ja: 'Yes/Noの質問を行い、答えがYesである確率を取得します。検証、主張チェック、エージェントのガードレールに使用します。',
      ko: '예/아니오 질문을 하면 \'예\'일 확률을 반환합니다. 검증, 주장 확인, 에이전트 가드레일에 사용합니다.',
      de: 'Stellen Sie eine Ja/Nein-Frage und erhalten Sie die Wahrscheinlichkeit, dass die Antwort Ja lautet. Wird für Verifikation, Claim-Prüfung und Agent-Guardrails verwendet.',
      fr: 'Poser une question oui/non et obtenir la probabilité que la réponse soit oui. Utilisé pour la vérification, le contrôle des affirmations et les garde-fous d\'agent.',
      es: 'Formula una pregunta de sí/no y obtén la probabilidad de que la respuesta sea sí. Se usa para verificación, comprobación de afirmaciones y guardas de agentes.',
      pt: 'Faça uma pergunta de sim/não e obtenha a probabilidade de a resposta ser sim. Usado para verificação, checagem de afirmações e controles de segurança de agentes.',
    },
  },
] as const;

/** 首页展示的架构模式 */
export const patternCards = [
  {
    slug: 'intent-routing',
    title:     {
      zh: '意图路由',
      en: 'Intent routing',
      ja: '意図ルーティング',
      ko: '의도 라우팅',
      de: 'Intent-Routing',
      fr: 'Routage d\'intention',
      es: 'Enrutamiento de intención',
      pt: 'Roteamento de intenção',
    },
    desc:     {
      zh: '用一次 Choice 调用把请求分派到下游处理链路，替代脆弱的正则与关键词匹配。',
      en: 'Dispatch requests to downstream handlers with a single Choice call, replacing brittle regex and keyword matching.',
      ja: '1回のChoice呼び出しでリクエストをダウンストリームハンドラーにディスパッチし、もろい正規表現やキーワードマッチングを置き換えます。',
      ko: 'Choice 호출 한 번으로 요청을 하위 핸들러에 전달하고, 취약한 정규식 및 키워드 매칭을 대체합니다.',
      de: 'Leiten Sie Anfragen mit einem einzigen Choice-Aufruf an nachgelagerte Handler weiter und ersetzen Sie fragiles Regex- und Keyword-Matching.',
      fr: 'Acheminer les requêtes vers les gestionnaires en aval avec un seul appel Choice, remplaçant les regex et les correspondances de mots-clés fragiles.',
      es: 'Despacha solicitudes a manejadores de destino con una sola llamada Choice, reemplazando expresiones regulares y coincidencia de palabras clave frágiles.',
      pt: 'Despache solicitações para processadores downstream com uma única chamada Choice, substituindo regex e correspondência de palavras-chave frágeis.',
    },
  },
  {
    slug: 'confidence-routing',
    title:     {
      zh: '置信度路由',
      en: 'Confidence routing',
      ja: '信頼度ルーティング',
      ko: '신뢰도 라우팅',
      de: 'Konfidenz-Routing',
      fr: 'Routage par confiance',
      es: 'Enrutamiento por confianza',
      pt: 'Roteamento por confiança',
    },
    desc:     {
      zh: '按置信度高低分流：高置信度自动执行，低置信度转人工或升级到更强模型。',
      en: 'Route by confidence: auto-execute when high, escalate to a human or a stronger model when low.',
      ja: '信頼度でルーティングします。高い場合は自動実行し、低い場合は人間またはより強力なモデルにエスカレーションします。',
      ko: '신뢰도 기반 라우팅: 높으면 자동 실행, 낮으면 사람 또는 더 강한 모델로 에스컬레이션합니다.',
      de: 'Routing nach Konfidenz: bei hoher Konfidenz automatisch ausführen, bei niedriger Konfidenz an einen Menschen oder ein stärkeres Modell eskalieren.',
      fr: 'Router selon la confiance : exécuter automatiquement si élevée, escalader vers un humain ou un modèle plus puissant si faible.',
      es: 'Enruta por confianza: ejecuta automáticamente cuando es alta y escala a un humano o a un modelo más fuerte cuando es baja.',
      pt: 'Roteie por confiança: execute automaticamente quando alta e escale para um humano ou um modelo mais forte quando baixa.',
    },
  },
  {
    slug: 'composite-scoring',
    title:     {
      zh: '组合评分',
      en: 'Composite scoring',
      ja: '複合スコアリング',
      ko: '복합 스코어링',
      de: 'Kombiniertes Scoring',
      fr: 'Score composite',
      es: 'Puntuación compuesta',
      pt: 'Pontuação composta',
    },
    desc:     {
      zh: '把多个 Score 维度加权合成为单一排序指标，让排序逻辑可解释、可调参。',
      en: 'Combine several Score dimensions into a single ranking metric, making ranking logic explainable and tunable.',
      ja: '複数のScoreの次元を単一のランキング指標に統合し、ランキングロジックを説明可能かつ調整可能にします。',
      ko: '여러 Score 차원을 단일 랭킹 지표로 결합하여 랭킹 로직을 설명 가능하고 조정 가능하게 만듭니다.',
      de: 'Kombinieren Sie mehrere Score-Dimensionen zu einer einzigen Ranking-Metrik, um die Ranking-Logik erklärbar und anpassbar zu machen.',
      fr: 'Combiner plusieurs dimensions Score en une seule métrique de classement, rendant la logique de classement explicable et ajustable.',
      es: 'Combina varias dimensiones de Score en una sola métrica de clasificación, haciendo la lógica de clasificación explicable y ajustable.',
      pt: 'Combine várias dimensões Score em uma única métrica de ranqueamento, tornando a lógica de ranqueamento explicável e ajustável.',
    },
  },
  {
    slug: 'fan-out',
    title:     {
      zh: '扇出并行',
      en: 'Fan-out',
      ja: 'ファンアウト',
      ko: '팬아웃',
      de: 'Fan-out',
      fr: 'Éventail',
      es: 'Difusión',
      pt: 'Distribuição paralela',
    },
    desc:     {
      zh: '并行发起多个独立判断再汇总，降低总延迟并提升吞吐。',
      en: 'Issue many independent judgements in parallel and aggregate, cutting total latency and raising throughput.',
      ja: '多数の独立した判定を並列で発行して集約し、総レイテンシを削減してスループットを向上させます。',
      ko: '독립적인 판단을 병렬로 수행하고 집계하여 전체 지연 시간을 줄이고 처리량을 높입니다.',
      de: 'Führen Sie viele unabhängige Bewertungen parallel aus und aggregieren Sie sie, um die Gesamtlatenz zu senken und den Durchsatz zu erhöhen.',
      fr: 'Émettre de nombreuses décisions indépendantes en parallèle et les agréger, réduisant la latence totale et augmentant le débit.',
      es: 'Emite muchos juicios independientes en paralelo y los agrega, reduciendo la latencia total y aumentando el rendimiento.',
      pt: 'Emita muitos julgamentos independentes em paralelo e agregue-os, reduzindo a latência total e aumentando a vazão.',
    },
  },
] as const;

export const site = {
  domain: 'www.jevcode.ai',
  repo: 'https://github.com/miounet11/jevcode',
  official: 'https://typesafe.ai/',
  docs: 'https://docs.typesafe.ai/',
};
