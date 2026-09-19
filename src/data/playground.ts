/**
 * Playground 场景数据。
 *
 * 每个 scenario 的 response 都是 2026-09-19 用 `scripts/run-jev.mjs`
 * 对 jev-latest（jev-1.13.0）的真实 API 调用录制；genSample 是同一
 * 输入喂给生成式模型的代表性输出（人工编写，用于并排对比展示）。
 * 请求 JSON 存档在 .research/jev-requests/，可在 UI 上复演。
 */

import type { Lang } from '../i18n/ui';

export type ScenarioId = 'noul-urgency' | 'choice-intent' | 'score-severity' | 'composite-support' | 'fanout-ticket';

export interface ProbBar {
  key: string;
  label: Record<Lang, string>;
  p: number;
}

export interface Scenario {
  id: ScenarioId;
  /** 原语标签（noul/choice/score/管线） */
  primitive: 'noul' | 'choice' | 'score' | 'pipeline';
  title: Record<Lang, string>;
  /** 场景说明 */
  lead: Record<Lang, string>;
  /** 输入 state（可编辑，仅展示） */
  state: string;
  /** 实际发出的 questions（展示用） */
  request: Record<string, unknown>;
  /** Jev 真实响应（预录） */
  response: Record<string, unknown>;
  /** 同一输入下生成式模型的代表性输出 */
  genSample: string;
  /** 结果可视化：概率条 */
  bars: ProbBar[];
  /** 主答案行，如 score 1.87 · confidence 0.81 */
  answerLine: Record<Lang, string>;
  /** 相关文档链接（相对当前语言） */
  docLinks: { label: Record<Lang, string>; href: string }[];
  /** API 计费信息（预录请求的真实 usage） */
  usage: { input_tokens: number; output_tokens: number };
}

export const scenarios: Scenario[] = [
  {
    id: 'noul-urgency',
    primitive: 'noul',
    title: {
      zh: '这条客服消息紧急吗？',
      en: 'Is this support message urgent?',
      ja: 'このサポートメッセージは緊急ですか？',
      ko: '이 지원 메시지가 긴급한가요?',
      de: 'Ist diese Support-Nachricht dringend?',
      fr: 'Ce message d\'assistance est-il urgent ?',
      es: '¿Es urgente este mensaje de soporte?',
      pt: 'Esta mensagem de suporte é urgente?',
    },
    lead: {
      zh: 'Noul 评估一个是/否问题，返回「是」的概率——它本身就是 0–1 的数值。',
      en: 'Noul evaluates a yes/no question and returns the probability of "yes" — itself a number from 0 to 1.',
      ja: 'NoulはYes/Noの質問を評価し、「Yes」の確率（0〜1の数値そのもの）を返します。',
      ko: 'Noul은 예/아니오 질문을 평가하고 "예"의 확률(0~1 값 자체)을 반환합니다.',
      de: 'Noul bewertet eine Ja/Nein-Frage und gibt die Wahrscheinlichkeit für „Ja“ zurück — selbst eine Zahl zwischen 0 und 1.',
      fr: 'Noul évalue une question oui/non et renvoie la probabilité de « oui » — une valeur de 0 à 1.',
      es: 'Noul evalúa una pregunta de sí/no y devuelve la probabilidad de «sí»: un valor de 0 a 1.',
      pt: 'Noul avalia uma pergunta de sim/não e devolve a probabilidade de «sim» — um valor de 0 a 1.',
    },
    state: "Hi, I've been trying to connect my Stripe account for 3 days and it keeps failing. I'm losing sales. Please help ASAP.",
    request: {
      urgency: { type: 'noul', instructions: 'Does this message express urgency?' },
    },
    response: {
      model: 'jev-1.13.0',
      answers: { urgency: { type: 'noul', noul: 0.98 } },
    },
    genSample:
      "I'm really sorry to hear you've been having trouble connecting your Stripe account. I understand how frustrating that must be, especially when it affects your sales. Let me help you look into this. Could you tell me a bit more about...",
    bars: [{ key: 'yes', label: { zh: '是 · urgent', en: 'Yes · urgent', ja: 'Yes・緊急', ko: '예 · 긴급', de: 'Ja · dringend', fr: 'Oui · urgent', es: 'Sí · urgente', pt: 'Sim · urgente' }, p: 0.98 }],
    answerLine: { zh: 'noul = 0.98', en: 'noul = 0.98', ja: 'noul = 0.98', ko: 'noul = 0.98', de: 'noul = 0.98', fr: 'noul = 0.98', es: 'noul = 0.98', pt: 'noul = 0.98' },
    docLinks: [
      { label: { zh: 'Noul 原语文档', en: 'Noul primitive docs', ja: 'Noulプリミティブのドキュメント', ko: 'Noul 프리미티브 문서', de: 'Noul-Primitiv-Dokumentation', fr: 'Doc de la primitive Noul', es: 'Documentación de Noul', pt: 'Documentação de Noul' }, href: '/primitives/noul/' },
      { label: { zh: '置信度路由模式', en: 'Confidence routing pattern', ja: '信頼度ルーティングのパターン', ko: '신뢰도 라우팅 패턴', de: 'Konfidenz-Routing-Muster', fr: 'Pattern de routage par confiance', es: 'Patrón de enrutamiento por confianza', pt: 'Padrão de roteamento por confiança' }, href: '/patterns/confidence-routing/' },
    ],
    usage: { input_tokens: 301, output_tokens: 21 },
  },
 {
    id: 'choice-intent',
    primitive: 'choice',
    title: {
      zh: '这封邮件想要什么？',
      en: 'What does this email want?',
      ja: 'このメールは何を求めていますか？',
      ko: '이 이메일은 무엇을 원하나요?',
      de: 'Was will diese E-Mail?',
      fr: 'Que veut cet e-mail ?',
      es: '¿Qué quiere este correo?',
      pt: 'O que este e-mail quer?',
    },
    lead: {
      zh: 'Choice 从一组固定选项中选一个，附带每个选项的概率与整体置信度。',
      en: 'Choice picks one option from a fixed set, with per-option probabilities and an overall confidence.',
      ja: 'Choiceは固定の選択肢から1つを選び、各選択肢の確率と全体の信頼度を返します。',
      ko: 'Choice는 고정된 옵션 중 하나를 선택하며 각 옵션의 확률과 전체 신뢰도를 반환합니다.',
      de: 'Choice wählt eine Option aus einer festen Menge — mit Wahrscheinlichkeiten je Option und einer Gesamtkonfidenz.',
      fr: 'Choice choisit une option dans un ensemble fixe, avec la probabilité de chaque option et une confiance globale.',
      es: 'Choice elige una opción de un conjunto fijo, con probabilidades por opción y una confianza general.',
      pt: 'Choice escolhe uma opção de um conjunto fixo, com probabilidades por opção e uma confiança geral.',
    },
    state: 'Hey team, the export button on the reports page throws a 500 every time I click it on Safari. Happens on both my laptop and phone. Any fix coming?',
    request: {
      intent: {
        type: 'choice',
        instructions: 'What is the primary intent of this message?',
        criteria: {
          bug_report: 'Reporting something broken',
          feature_request: 'Asking for new functionality',
          how_to_question: 'Asking how to do something',
          other: 'None of the above',
        },
      },
    },
    response: {
      model: 'jev-1.13.0',
      answers: {
        intent: {
          type: 'choice',
          choice: 'bug_report',
          confidence: 1,
          probabilities: { bug_report: 1.0, feature_request: 0.0, how_to_question: 0.0, other: 0.0 },
        },
      },
    },
    genSample:
      'Thanks for reaching out! It sounds like you are experiencing an error with the export functionality on the reports page when using Safari. This could be related to browser compatibility. Have you tried...',
    bars: [
      { key: 'bug_report', label: { zh: 'bug 报告', en: 'Bug report', ja: 'バグ報告', ko: '버그 리포트', de: 'Fehlerbericht', fr: 'Rapport de bug', es: 'Informe de error', pt: 'Relatório de erro' }, p: 1.0 },
      { key: 'how_to_question', label: { zh: '使用提问', en: 'How-to question', ja: '使い方の質問', ko: '사용법 질문', de: 'How-to-Frage', fr: 'Question d\'usage', es: 'Pregunta de uso', pt: 'Pergunta de uso' }, p: 0.02 },
      { key: 'other', label: { zh: '其他', en: 'Other', ja: 'その他', ko: '기타', de: 'Sonstiges', fr: 'Autre', es: 'Otro', pt: 'Outro' }, p: 0.01 },
    ],
    answerLine: { zh: 'choice = bug_report · confidence 1.0', en: 'choice = bug_report · confidence 1.0', ja: 'choice = bug_report · 信頼度 0.97', ko: 'choice = bug_report · 신뢰도 1.0', de: 'choice = bug_report · Konfidenz 0.97', fr: 'choice = bug_report · confiance 0.97', es: 'choice = bug_report · confianza 0.97', pt: 'choice = bug_report · confiança 1.0' },
    docLinks: [
      { label: { zh: 'Choice 原语文档', en: 'Choice primitive docs', ja: 'Choiceプリミティブのドキュメント', ko: 'Choice 프리미티브 문서', de: 'Choice-Primitiv-Dokumentation', fr: 'Doc de la primitive Choice', es: 'Documentación de Choice', pt: 'Documentação de Choice' }, href: '/primitives/choice/' },
      { label: { zh: '意图路由模式', en: 'Intent routing pattern', ja: 'インテントルーティングのパターン', ko: '인텐트 라우팅 패턴', de: 'Intent-Routing-Muster', fr: 'Pattern de routage d\'intention', es: 'Patrón de enrutamiento de intención', pt: 'Padrão de roteamento de intenção' }, href: '/patterns/intent-routing/' },
    ],
    usage: { input_tokens: 389, output_tokens: 50 },
  },
 {
    id: 'score-severity',
    primitive: 'score',
    title: {
      zh: '这个问题有多严重？',
      en: 'How severe is this issue?',
      ja: 'この問題はどのくらい深刻ですか？',
      ko: '이 문제는 얼마나 심각한가요?',
      de: 'Wie schwerwiegend ist dieses Problem?',
      fr: 'Quelle est la gravité de ce problème ?',
      es: '¿Qué tan grave es este problema?',
      pt: 'Quão grave é este problema?',
    },
    lead: {
      zh: 'Score 按有序档位打分，分数可落在两档之间，附每档概率与置信度。',
      en: 'Score rates on ordered criteria; the value can land between levels, with per-level probabilities and confidence.',
      ja: 'Scoreは順序付きの基準で評価し、値は2つのレベルの間になることもあり、レベルごとの確率と信頼度を返します。',
      ko: 'Score는 순서가 있는 기준으로 평가하며, 값은 두 수준 사이에 위치할 수 있고 수준별 확률과 신뢰도를 반환합니다.',
      de: 'Score bewertet anhand geordneter Kriterien; der Wert kann zwischen Stufen liegen, mit Wahrscheinlichkeiten je Stufe und Konfidenz.',
      fr: 'Score évalue selon des critères ordonnés ; la valeur peut se situer entre deux niveaux, avec probabilités par niveau et confiance.',
      es: 'Score califica según criterios ordenados; el valor puede quedar entre niveles, con probabilidades por nivel y confianza.',
      pt: 'Score avalia segundo critérios ordenados; o valor pode ficar entre níveis, com probabilidades por nível e confiança.',
    },
    state: 'Help. My payouts have been failing for 3 days.',
    request: {
      severity: {
        type: 'score',
        instructions: 'How severe is the issue?',
        criteria: ['Minor', 'Moderate', 'Critical'],
      },
    },
    response: {
      model: 'jev-1.13.0',
      answers: {
        severity: {
          type: 'score',
          score: 1.87,
          confidence: 0.81,
          legend: { '0': 'Minor', '1': 'Moderate', '2': 'Critical' },
          probabilities: { '0': 0.0, '1': 0.13, '2': 0.87 },
        },
      },
    },
    genSample:
      "I'm so sorry to hear that your payouts have been failing for three days. That sounds really stressful. Payout failures can have several causes, such as... (510 more words)",
    bars: [
      { key: '0', label: { zh: '轻微', en: 'Minor', ja: '軽微', ko: '경미', de: 'Gering', fr: 'Mineur', es: 'Leve', pt: 'Leve' }, p: 0.0 },
      { key: '1', label: { zh: '中等', en: 'Moderate', ja: '中程度', ko: '보통', de: 'Mittel', fr: 'Modéré', es: 'Moderado', pt: 'Moderado' }, p: 0.13 },
      { key: '2', label: { zh: '严重', en: 'Critical', ja: '重大', ko: '심각', de: 'Kritisch', fr: 'Critique', es: 'Crítico', pt: 'Crítico' }, p: 0.87 },
    ],
    answerLine: { zh: 'score = 1.87（介于中等与严重之间）· confidence 0.81', en: 'score = 1.87 (between Moderate and Critical) · confidence 0.81', ja: 'score = 1.87（中程度と重大の間）・信頼度 0.81', ko: 'score = 1.87 (보통과 심각 사이) · 신뢰도 0.81', de: 'score = 1.87 (zwischen Mittel und Kritisch) · Konfidenz 0.81', fr: 'score = 1,87 (entre Modéré et Critique) · confiance 0,81', es: 'score = 1,87 (entre Moderado y Crítico) · confianza 0,81', pt: 'score = 1,87 (entre Moderado e Crítico) · confiança 0,81' },
    docLinks: [
      { label: { zh: 'Score 原语文档', en: 'Score primitive docs', ja: 'Scoreプリミティブのドキュメント', ko: 'Score 프리미티브 문서', de: 'Score-Primitiv-Dokumentation', fr: 'Doc de la primitive Score', es: 'Documentación de Score', pt: 'Documentação de Score' }, href: '/primitives/score/' },
      { label: { zh: '复合评分模式', en: 'Composite scoring pattern', ja: '複合スコアリングのパターン', ko: '복합 스코어링 패턴', de: 'Verbund-Scoring-Muster', fr: 'Pattern de scoring composite', es: 'Patrón de puntuación compuesta', pt: 'Padrão de pontuação composta' }, href: '/patterns/composite-scoring/' },
    ],
    usage: { input_tokens: 321, output_tokens: 36 },
  },
 {
    id: 'composite-support',
    primitive: 'pipeline',
    title: {
      zh: '复合评分：一张工单该多快响应？',
      en: 'Composite scoring: how fast should we respond?',
      ja: '複合スコアリング：どれだけ早く対応すべきか？',
      ko: '복합 스코어링: 얼마나 빨리 대응해야 하는가?',
      de: 'Verbund-Scoring: Wie schnell sollten wir reagieren?',
      fr: 'Scoring composite : dans quel délai répondre ?',
      es: 'Puntuación compuesta: ¿con qué rapidez responder?',
      pt: 'Pontuação composta: responder com que rapidez?',
    },
    lead: {
      zh: '把「情绪激动度」与「业务影响」两个独立评分加权合成一个响应优先级，全部类型化、可解释。',
      en: 'Combine two independent scores — emotional intensity and business impact — into a weighted response priority. All typed, all explainable.',
      ja: '「感情の強さ」と「ビジネス影響」という2つの独立したスコアを重み付きで合成し、対応優先度を導きます。すべて型付きで説明可能です。',
      ko: '"감정 강도"와 "비즈니스 영향"이라는 두 독립 점수를 가중합해 대응 우선순위를 도출합니다. 모두 타입화되어 설명 가능합니다.',
      de: 'Kombiniert zwei unabhängige Scores — emotionale Intensität und Geschäftsauswirkung — gewichtet zu einer Antwortpriorität. Typisiert und erklärbar.',
      fr: 'Combine deux scores indépendants — intensité émotionnelle et impact métier — en une priorité de réponse pondérée. Typé et explicable.',
      es: 'Combina dos puntuaciones independientes —intensidad emocional e impacto de negocio— en una prioridad de respuesta ponderada. Tipado y explicable.',
      pt: 'Combina duas pontuações independentes —intensidade emocional e impacto de negócio— numa prioridade de resposta ponderada. Tipado e explicável.',
    },
    state: "We are a paying customer on the Enterprise plan. The API has been returning 500s since this morning and our checkout is completely down. We are losing thousands of dollars per hour. This is unacceptable.",
    request: {
      emotional_intensity: {
        type: 'score',
        instructions: 'How emotionally intense is this message?',
        criteria: ['Calm and factual', 'Frustrated but professional', 'Angry or escalating'],
      },
      business_impact: {
        type: 'score',
        instructions: 'How severe is the business impact described?',
        criteria: ['No material impact', 'Degraded operations', 'Revenue-blocking outage'],
      },
    },
    response: {
      model: 'jev-1.13.0',
      answers: {
        emotional_intensity: {
          type: 'score',
          score: 1.82,
          confidence: 0.74,
          legend: { '0': 'Calm and factual', '1': 'Frustrated but professional', '2': 'Angry or escalating' },
          probabilities: { '0': 0.0, '1': 0.18, '2': 0.82 },
        },
        business_impact: {
          type: 'score',
          score: 2,
          confidence: 1,
          legend: { '0': 'No material impact', '1': 'Degraded operations', '2': 'Revenue-blocking outage' },
          probabilities: { '0': 0.0, '1': 0.0, '2': 1.0 },
        },
      },
    },
    genSample:
      'Dear valued customer, thank you for bringing this to our attention. We sincerely apologize for the inconvenience caused by the API errors. Our engineering team is investigating the issue with the highest priority...',
    bars: [
      { key: 'e2', label: { zh: '情绪 · 激愤', en: 'Emotion · escalating', ja: '感情・激化', ko: '감정 · 격화', de: 'Emotion · eskalierend', fr: 'Émotion · escalade', es: 'Emoción · escalada', pt: 'Emoção · escalada' }, p: 0.82 },
      { key: 'b2', label: { zh: '影响 · 营收阻断', en: 'Impact · revenue-blocking', ja: '影響・収益遮断', ko: '영향 · 수익 차단', de: 'Auswirkung · umsatzblockierend', fr: 'Impact · blocage de revenus', es: 'Impacto · bloqueo de ingresos', pt: 'Impacto · bloqueio de receita' }, p: 1.0 },
    ],
    answerLine: {
      zh: 'priority = 0.6×2.0 + 0.4×1.82 = 1.93 → 立即响应',
      en: 'priority = 0.6×2.0 + 0.4×1.82 = 1.93 → respond immediately',
      ja: 'priority = 0.6×2.0 + 0.4×1.82 = 1.93 → 即時対応',
      ko: 'priority = 0.6×2.0 + 0.4×1.82 = 1.93 → 즉시 대응',
      de: 'priority = 0.6×2.0 + 0.4×1.82 = 1.93 → sofort reagieren',
      fr: 'priority = 0,6×2 + 0,4×1,82 = 1,93 → réponse immédiate',
      es: 'priority = 0,6×2 + 0,4×1,82 = 1,93 → responder de inmediato',
      pt: 'priority = 0.6×2.0 + 0.4×1.82 = 1.93 → responder imediatamente',
    },
    docLinks: [
      { label: { zh: '复合评分模式', en: 'Composite scoring pattern', ja: '複合スコアリングのパターン', ko: '복합 스코어링 패턴', de: 'Verbund-Scoring-Muster', fr: 'Pattern de scoring composite', es: 'Patrón de puntuación compuesta', pt: 'Padrão de pontuação composta' }, href: '/patterns/composite-scoring/' },
      { label: { zh: 'LLM 护栏案例', en: 'LLM guardrails case', ja: 'LLMガードレールの事例', ko: 'LLM 가드레일 사례', de: 'LLM-Guardrails-Fall', fr: 'Cas des garde-fous LLM', es: 'Caso de guardarrails LLM', pt: 'Caso de guardrails LLM' }, href: '/cases/llm-guardrails/' },
    ],
    usage: { input_tokens: 397, output_tokens: 37 },
  },
 {
    id: 'fanout-ticket',
    primitive: 'pipeline',
    title: {
      zh: '扇出并行：一次调用问完所有判断',
      en: 'Fan-out: every judgment in one call',
      ja: 'ファンアウト：すべての判断を1回の呼び出しで',
      ko: '팬아웃: 모든 판단을 한 번의 호출로',
      de: 'Fan-out: alle Urteile in einem Aufruf',
      fr: 'Fan-out : toutes les décisions en un appel',
      es: 'Fan-out: todas las decisiones en una llamada',
      pt: 'Fan-out: todas as decisões numa chamada',
    },
    lead: {
      zh: '不用「先分类再追问」。把所有可能用到的问题一次发出，答案相互独立，代码再决定用哪些。输出 tokens 免费。',
      en: 'No classify-then-follow-up. Send every question you might need at once — answers are independent, your code decides which to use. Output tokens are free.',
      ja: '「分類してから質問」は不要。必要になる可能性のある質問をすべて一度に送ります。回答は独立しており、どれを使うかはコードが決めます。出力トークンは無料です。',
      ko: '"분류 후 후속 질문"은 불필요합니다. 필요할 수 있는 모든 질문을 한 번에 보내면 답변은 독립적이며, 무엇을 쓸지는 코드가 정합니다. 출력 토큰은 무료입니다.',
      de: 'Kein „erst klassifizieren, dann nachfragen“. Senden Sie alle eventuell nötigen Fragen auf einmal — die Antworten sind unabhängig, Ihr Code entscheidet, welche er nutzt. Ausgabe-Tokens sind kostenlos.',
      fr: 'Pas de « classer puis relancer ». Envoyez d’un coup toutes les questions potentiellement utiles — les réponses sont indépendantes, votre code choisit. Les tokens de sortie sont gratuits.',
      es: 'Sin «clasificar y luego preguntar». Envía de una vez todas las preguntas que puedas necesitar — las respuestas son independientes y tu código decide cuáles usar. Los tokens de salida son gratis.',
      pt: 'Sem «classificar e depois perguntar». Envie de uma vez todas as perguntas que possa precisar — as respostas são independentes e o seu código decide quais usar. Tokens de saída são gratuitos.',
    },
    state: 'Hey, quick question — we trialed Jev last quarter with the eval harness. Does the JevCode enterprise plan include SOC 2 report access? Also the invoice PDF from March has the wrong billing address on it, can someone fix and resend? Thanks!',
    request: {
      request_type: {
        type: 'choice',
        instructions: 'What kind of request is this?',
        criteria: {
          sales_question: 'Asking about plans, pricing, compliance, or contracts',
          billing_issue: 'Payment, invoice, or refund matters',
          technical_support: 'Something is broken or needs troubleshooting',
        },
      },
      is_existing_customer: { type: 'noul', instructions: 'Does the writer appear to be an existing customer?' },
      tone_politeness: {
        type: 'score',
        instructions: 'How courteous is the tone overall?',
        criteria: ['Blunt or rude', 'Neutral', 'Warm and appreciative'],
      },
    },
    response: {
      model: 'jev-1.13.0',
      answers: {
        request_type: {
          type: 'choice',
          choice: 'sales_question',
          confidence: 0.25,
          probabilities: { sales_question: 0.5, billing_issue: 0.5, technical_support: 0.0 },
        },
        is_existing_customer: { type: 'noul', noul: 0.86 },
        tone_politeness: {
          type: 'score',
          score: 1.74,
          confidence: 0.61,
          legend: { '0': 'Blunt or rude', '1': 'Neutral', '2': 'Warm and appreciative' },
          probabilities: { '0': 0.0, '1': 0.26, '2': 0.74 },
        },
      },
    },
    genSample:
      'Thank you for reaching out! To answer your questions: regarding SOC 2 report access, our enterprise plan does include... (the answer continues for 300+ words, mixing both topics with no typed structure to route on)',
    bars: [
      { key: 'sales', label: { zh: '类型 · 售前咨询 0.50', en: 'Type · sales 0.50', ja: '種別・営業 0.50', ko: '유형 · 영업 0.50', de: 'Art · Vertrieb 0.50', fr: 'Type · ventes 0,50', es: 'Tipo · ventas 0,50', pt: 'Tipo · vendas 0.50' }, p: 0.5 },
      { key: 'cust', label: { zh: '老客户 · 是 0.86', en: 'Existing customer · yes 0.86', ja: '既存顧客・はい 0.86', ko: '기존 고객 · 예 0.86', de: 'Bestandskunde · ja 0.86', fr: 'Client existant · oui 0,86', es: 'Cliente existente · sí 0,86', pt: 'Cliente existente · sim 0.86' }, p: 0.86 },
      { key: 'tone', label: { zh: '语气 · 温和 0.74', en: 'Tone · warm 0.74', ja: 'トーン・温厚 0.74', ko: '어조 · 따뜻함 0.74', de: 'Ton · warm 0.74', fr: 'Ton · chaleureux 0,74', es: 'Tono · cálido 0,74', pt: 'Tom · caloroso 0.74' }, p: 0.74 },
    ],
    answerLine: {
      zh: 'choice=sales_question (conf 0.25) · noul=0.86 · score=1.74 —— 一次调用，三个独立判断',
      en: 'choice=sales_question (conf 0.25) · noul=0.86 · score=1.74 — one call, three independent judgments',
      ja: 'choice=sales_question (conf 0.25) ・ noul=0.86 ・ score=1.74 ― 1回の呼び出しで3つの独立した判断',
      ko: 'choice=sales_question (conf 0.25) · noul=0.86 · score=1.74 — 한 번의 호출로 세 가지 독립 판단',
      de: 'choice=sales_question (conf 0.25) · noul=0.86 · score=1.74 — ein Aufruf, drei unabhängige Urteile',
      fr: 'choice=sales_question (conf 0.25) · noul=0,86 · score=1,74 — un appel, trois décisions indépendantes',
      es: 'choice=sales_question (conf 0.25) · noul=0,86 · score=1,74 — una llamada, tres decisiones independientes',
      pt: 'choice=sales_question (conf 0.25) · noul=0.86 · score=1.74 — uma chamada, três decisões independentes',
    },
    docLinks: [
      { label: { zh: '扇出并行模式', en: 'Fan-out pattern', ja: 'ファンアウトのパターン', ko: '팬아웃 패턴', de: 'Fan-out-Muster', fr: 'Pattern fan-out', es: 'Patrón fan-out', pt: 'Padrão fan-out' }, href: '/patterns/fan-out/' },
      { label: { zh: '并行问题案例', en: 'Parallel questions case', ja: '並列質問の事例', ko: '병렬 질문 사례', de: 'Fall: parallele Fragen', fr: 'Cas : questions parallèles', es: 'Caso: preguntas paralelas', pt: 'Caso: perguntas paralelas' }, href: '/cases/parallel-questions/' },
    ],
    usage: { input_tokens: 459, output_tokens: 78 },
  },
];
