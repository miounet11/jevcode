import type { Localized } from '../ui';

export const title: Localized<string> = {
  zh: '判定实验室：用真实场景测 clavue-jev',
  en: 'Judgment Lab: test clavue-jev on real scenarios',
  ja: '判定ラボ：実際のシナリオで clavue-jev を試す',
  ko: '판정 실험실: 실제 시나리오로 clavue-jev 테스트',
  de: 'Urteil-Labor: clavue-jev an echten Szenarien testen',
  fr: 'Laboratoire de jugement : testez clavue-jev sur des scénarios réels',
  es: 'Laboratorio de juicios: prueba clavue-jev con escenarios reales',
  pt: 'Laboratório de julgamento: teste o clavue-jev com cenários reais',
};

export const description: Localized<string> = {
  zh: '客服、账单、发布审查、合规分诊、招聘筛选、内容审核——从日常到商业的真实场景，免费在这里调一遍，满意了再进你的程序。',
  en: 'Support triage, billing disputes, release review, compliance routing, candidate screening, content moderation — real daily and business scenarios. Tune them here for free, then ship them into your program.',
  ja: 'サポート仕分け、請求、リリース審査、コンプライアンス、候補者スクリーニング、コンテンツモデレーション——日常から業務までの実際のシナリオを無料で調整し、そのまま自分のプログラムへ。',
  ko: '고객 지원 분류, 청구 분쟁, 릴리스 검토, 컴플라이언스 라우팅, 지원자 스크리닝, 콘텐츠 검토—일상과 업무의 실제 시나리오를 여기서 무료로 조정하고 프로그램에 바로 적용하세요.',
  de: 'Support-Triage, Rechnungsstreitigkeiten, Release-Review, Compliance-Routing, Kandidaten-Screening, Inhaltsmoderation — echte Alltags- und Geschäftsszenarien. Hier kostenlos abstimmen, dann ins eigene Programm übernehmen.',
  fr: 'Triage support, litiges de facturation, revue de release, routage conformité, présélection de candidats, modération de contenu — des scénarios réels du quotidien et des affaires. Ajustez-les ici gratuitement, puis intégrez-les à votre programme.',
  es: 'Clasificación de soporte, disputas de facturación, revisión de releases, enrutado de cumplimiento, cribado de candidatos, moderación de contenido: escenarios reales del día a día y del negocio. Ajusta aquí gratis y llévalo a tu programa.',
  pt: 'Triagem de suporte, disputas de cobrança, revisão de release, roteamento de conformidade, triagem de candidatos, moderação de conteúdo — cenários reais do dia a dia e dos negócios. Ajuste aqui de graça e leve para o seu programa.',
};

export const subtitle: Localized<string> = {
  zh: '改题面、改输入，当场看判定怎么变。所有场景的请求形态都和 POST /v1/judge 一致，调好就能搬走。',
  en: 'Edit the questions, edit the input, and see the judgment move on the spot. Every scenario uses the same shape as POST /v1/judge — tune it here, then take it with you.',
  ja: '質問と入力を編集して、判定の変化をその場で確認します。すべてのシナリオは POST /v1/judge と同じ形なので、調整後にそのまま持ち出せます。',
  ko: '질문과 입력을 편집하고 판정 변화를 즉시 확인하세요. 모든 시나리오는 POST /v1/judge와 같은 형태라 조정 후 그대로 가져갈 수 있습니다.',
  de: 'Bearbeite Fragen und Eingaben und sieh sofort, wie das Urteil reagiert. Jedes Szenario hat dieselbe Form wie POST /v1/judge — hier abstimmen und mitnehmen.',
  fr: 'Modifiez les questions et l’entrée, et voyez le jugement changer sur place. Chaque scénario a la même forme que POST /v1/judge — ajustez ici, puis emportez.',
  es: 'Edita las preguntas y la entrada y mira cómo cambia el juicio al instante. Cada escenario usa la misma forma que POST /v1/judge: afina aquí y llévatelo.',
  pt: 'Edite as perguntas e a entrada e veja o julgamento mudar na hora. Cada cenário tem a mesma forma do POST /v1/judge — ajuste aqui e leve com você.',
};

export const stateLabel: Localized<string> = {
  zh: '输入（state）', en: 'Input (state)', ja: '入力（state）', ko: '입력(state)', de: 'Eingabe (state)', fr: 'Entrée (state)', es: 'Entrada (state)', pt: 'Entrada (state)',
};

export const questionsLabel: Localized<string> = {
  zh: '问题（questions）', en: 'Questions', ja: '質問（questions）', ko: '질문(questions)', de: 'Fragen (questions)', fr: 'Questions', es: 'Preguntas (questions)', pt: 'Perguntas (questions)',
};

export const questionsHint: Localized<string> = {
  zh: 'JSON 格式：noul 是/否判断，choice 从选项里挑，confidence 返回置信度。最多 6 个问题。',
  en: 'JSON: noul yes/no, choice picks from options, confidence returns certainty. Up to 6 questions.',
  ja: 'JSON：noul は是非、choice は選択肢から選択、confidence は確信度。最大 6 問。',
  ko: 'JSON: noul 예/아니오, choice 선택지에서 고름, confidence 신뢰도 반환. 최대 6문항.',
  de: 'JSON: noul ja/nein, choice wählt aus Optionen, confidence gibt Sicherheit zurück. Bis zu 6 Fragen.',
  fr: 'JSON : noul oui/non, choice choisit parmi les options, confidence renvoie la certitude. 6 questions max.',
  es: 'JSON: noul sí/no, choice elige entre opciones, confidence devuelve certeza. Máximo 6 preguntas.',
  pt: 'JSON: noul sim/não, choice escolhe entre opções, confidence retorna certeza. Até 6 perguntas.',
};

export const run: Localized<string> = {
  zh: '运行判定', en: 'Run judgment', ja: '判定を実行', ko: '판정 실행', de: 'Urteil ausführen', fr: 'Lancer le jugement', es: 'Ejecutar juicio', pt: 'Executar julgamento',
};

export const running: Localized<string> = {
  zh: '判定中…', en: 'Judging…', ja: '判定中…', ko: '판정 중…', de: 'Wird beurteilt…', fr: 'Jugement…', es: 'Juzgando…', pt: 'Julgando…',
};

export const reset: Localized<string> = {
  zh: '还原默认', en: 'Reset', ja: '初期に戻す', ko: '초기화', de: 'Zurücksetzen', fr: 'Réinitialiser', es: 'Restablecer', pt: 'Restaurar',
};

export const answersTitle: Localized<string> = {
  zh: '判定结果', en: 'Answers', ja: '判定結果', ko: '판정 결과', de: 'Antworten', fr: 'Réponses', es: 'Respuestas', pt: 'Respostas',
};

export const apiTitle: Localized<string> = {
  zh: '请求形态（与 POST /v1/judge 一致）', en: 'Request shape (same as POST /v1/judge)', ja: 'リクエスト形（POST /v1/judge と同じ）', ko: '요청 형태(POST /v1/judge와 동일)', de: 'Anfrageform (wie POST /v1/judge)', fr: 'Forme de la requête (identique à POST /v1/judge)', es: 'Forma de la petición (igual que POST /v1/judge)', pt: 'Forma da requisição (igual ao POST /v1/judge)',
};

export const faqTitle: Localized<string> = {
  zh: '常见问题', en: 'FAQ', ja: 'よくある質問', ko: '자주 묻는 질문', de: 'FAQ', fr: 'FAQ', es: 'Preguntas frecuentes', pt: 'Perguntas frequentes',
};

export const faq: Localized<[string, string][]> = {
  zh: [
    ['实验室是免费的吗？', '是。这里的调用走匿名试用额度，每小时 20 次，不注册也能用。'],
    ['和正式 API 有什么区别？', '请求形态完全一致。差别只在计费：正式调用用 API Key 走 /v1/judge，按输入 token 扣余额。'],
    ['能测自己的业务场景吗？', '能。把你的文本贴进输入框，把问题改成你的业务判断，运行后即可看到结果。'],
    ['判定结果稳定吗？', '同一段输入可能有小幅波动。要不要更稳，可以用 confidence 问题观察把握程度，或在代码里设阈值。'],
  ],
  en: [
    ['Is the lab free?', 'Yes. Calls here use the anonymous trial quota, 20 per hour, no account needed.'],
    ['How is it different from the live API?', 'The request shape is identical. Only billing differs: production calls use an API key against /v1/judge and draw down your balance by input tokens.'],
    ['Can I test my own business scenario?', 'Yes. Paste your own text into the input, rewrite the questions as your business judgments, and run it.'],
    ['Are judgments stable?', 'The same input can vary slightly. Use a confidence question to watch how sure the model is, or set thresholds in your code.'],
  ],
  ja: [
    ['ラボは無料ですか？', 'はい。匿名の試用枠（1 時間に 20 回）で利用でき、登録は不要です。'],
    ['正式 API との違いは？', 'リクエストの形は同じです。違うのは課金だけ。正式呼び出しは API Key で /v1/judge を叩き、入力トークンで残高を消費します。'],
    ['自分の業務シナリオを試せますか？', 'はい。自分のテキストを入力欄に貼り、質問を業務の判定に書き換えて実行するだけです。'],
    ['判定は安定していますか？', '同じ入力でも多少揺れます。confidence の質問で確信度を観察するか、コード側でしきい値を設けてください。'],
  ],
  ko: [
    ['실험실은 무료인가요?', '네. 익명 체험 한도(시간당 20회)로 이용할 수 있으며 가입이 필요 없습니다.'],
    ['정식 API와 무엇이 다른가요?', '요청 형태는 동일합니다. 차이는 과금뿐입니다. 정식 호출은 API Key로 /v1/judge를 호출하고 입력 토큰만큼 잔액을 차감합니다.'],
    ['내 업무 시나리오를 테스트할 수 있나요?', '네. 텍스트를 입력창에 붙여넣고 질문을 업무 판정으로 바꿔 실행하면 됩니다.'],
    ['판정은 안정적인가요?', '같은 입력도 조금씩 흔들릴 수 있습니다. confidence 질문으로 확신도를 관찰하거나 코드에서 임계값을 설정하세요.'],
  ],
  de: [
    ['Ist das Labor kostenlos?', 'Ja. Aufrufe hier nutzen das anonyme Testkontingent, 20 pro Stunde, ohne Konto.'],
    ['Unterschied zur echten API?', 'Die Anfrageform ist identisch. Nur die Abrechnung unterscheidet sich: Produktivaufrufe nutzen einen API Key gegen /v1/judge und verbrauchen Guthaben nach Eingabe-Token.'],
    ['Kann ich mein eigenes Geschäftsszenario testen?', 'Ja. Füge deinen Text in das Eingabefeld ein, schreibe die Fragen als deine Fachurteile um und führe sie aus.'],
    ['Sind die Urteile stabil?', 'Dieselbe Eingabe kann leicht schwanken. Nutze eine confidence-Frage, um die Sicherheit zu beobachten, oder setze Schwellenwerte im Code.'],
  ],
  fr: [
    ['Le laboratoire est-il gratuit ?', 'Oui. Les appels ici utilisent le quota d’essai anonyme, 20 par heure, sans compte.'],
    ['Différence avec l’API officielle ?', 'La forme de la requête est identique. Seule la facturation diffère : les appels de production utilisent une clé API sur /v1/judge et consomment votre solde en tokens d’entrée.'],
    ['Puis-je tester mon propre scénario métier ?', 'Oui. Collez votre texte dans l’entrée, réécrivez les questions en jugements métier et lancez.'],
    ['Les jugements sont-ils stables ?', 'Une même entrée peut varier légèrement. Utilisez une question confidence pour observer la certitude, ou fixez des seuils dans votre code.'],
  ],
  es: [
    ['¿El laboratorio es gratis?', 'Sí. Las llamadas aquí usan la cuota anónima de prueba, 20 por hora, sin cuenta.'],
    ['¿En qué se diferencia de la API real?', 'La forma de la petición es idéntica. Solo cambia la facturación: las llamadas de producción usan una clave API contra /v1/judge y consumen tu saldo por tokens de entrada.'],
    ['¿Puedo probar mi propio escenario de negocio?', 'Sí. Pega tu texto en la entrada, reescribe las preguntas como juicios de tu negocio y ejecuta.'],
    ['¿Los juicios son estables?', 'La misma entrada puede variar un poco. Usa una pregunta confidence para observar la certeza o fija umbrales en tu código.'],
  ],
  pt: [
    ['O laboratório é grátis?', 'Sim. As chamadas aqui usam a cota anônima de teste, 20 por hora, sem conta.'],
    ['Qual a diferença da API oficial?', 'A forma da requisição é idêntica. Só a cobrança muda: chamadas de produção usam uma chave de API no /v1/judge e consomem seu saldo por tokens de entrada.'],
    ['Posso testar meu próprio cenário de negócio?', 'Sim. Cole seu texto na entrada, reescreva as perguntas como julgamentos do seu negócio e execute.'],
    ['Os julgamentos são estáveis?', 'A mesma entrada pode variar um pouco. Use uma pergunta confidence para observar a certeza ou defina limites no seu código.'],
  ],
};

export const ctaApi: Localized<string> = {
  zh: '看 API 文档', en: 'Read the API docs', ja: 'API ドキュメントを見る', ko: 'API 문서 보기', de: 'API-Doku lesen', fr: 'Voir la doc API', es: 'Ver la documentación de la API', pt: 'Ver a documentação da API',
};

export const ctaPricing: Localized<string> = {
  zh: '看价格', en: 'See pricing', ja: '料金を見る', ko: '가격 보기', de: 'Preise ansehen', fr: 'Voir les tarifs', es: 'Ver precios', pt: 'Ver preços',
};

/** 注入客户端脚本的文案。 */
export const client: Localized<Record<string, string>> = {
  zh: {
    needState: '请先填上输入内容。',
    needQuestions: '问题格式无效：需要 JSON 对象，最多 6 个问题。',
    failed: '判定失败，请稍后再试。',
    tooLong: 'state 最长 4000 字符。',
    tooShort: 'state 至少 8 个字符。',
    limit: '这一小时的试用次数用完了，过一会再测。',
    noAnswers: '没有返回答案。',
  },
  en: {
    needState: 'Write an input first.',
    needQuestions: 'Invalid questions: needs a JSON object, up to 6 questions.',
    failed: 'The judgment failed. Try again later.',
    tooLong: 'state is capped at 4000 characters.',
    tooShort: 'state needs at least 8 characters.',
    limit: 'Hourly try limit reached. Wait and run it again.',
    noAnswers: 'No answers came back.',
  },
  ja: {
    needState: '入力を先に書いてください。',
    needQuestions: '質問の形式が不正です：JSON オブジェクトで最大 6 問。',
    failed: '判定に失敗しました。しばらくしてから再試行してください。',
    tooLong: 'state は最大 4000 文字です。',
    tooShort: 'state は 8 文字以上必要です。',
    limit: '1 時間の試用上限に達しました。しばらくしてから再実行してください。',
    noAnswers: '回答が返りませんでした。',
  },
  ko: {
    needState: '입력을 먼저 적어 주세요.',
    needQuestions: '질문 형식이 잘못되었습니다: JSON 객체, 최대 6문항.',
    failed: '판정에 실패했습니다. 잠시 후 다시 시도하세요.',
    tooLong: 'state는 최대 4000자입니다.',
    tooShort: 'state는 8자 이상이어야 합니다.',
    limit: '시간당 체험 한도에 도달했습니다. 잠시 후 다시 실행하세요.',
    noAnswers: '답변이 돌아오지 않았습니다.',
  },
  de: {
    needState: 'Schreibe zuerst eine Eingabe.',
    needQuestions: 'Ungültige Fragen: JSON-Objekt erwartet, bis zu 6 Fragen.',
    failed: 'Das Urteil ist fehlgeschlagen. Versuche es später erneut.',
    tooLong: 'state ist auf 4000 Zeichen begrenzt.',
    tooShort: 'state braucht mindestens 8 Zeichen.',
    limit: 'Stündliches Testlimit erreicht. Warte und führe es erneut aus.',
    noAnswers: 'Keine Antworten zurückgekommen.',
  },
  fr: {
    needState: 'Écrivez d’abord une entrée.',
    needQuestions: 'Questions invalides : objet JSON attendu, 6 questions max.',
    failed: 'Le jugement a échoué. Réessayez plus tard.',
    tooLong: 'state est limité à 4000 caractères.',
    tooShort: 'state doit contenir au moins 8 caractères.',
    limit: 'Limite horaire d’essai atteinte. Attendez et relancez.',
    noAnswers: 'Aucune réponse reçue.',
  },
  es: {
    needState: 'Escribe primero una entrada.',
    needQuestions: 'Preguntas inválidas: se espera un objeto JSON, hasta 6.',
    failed: 'El juicio falló. Inténtalo más tarde.',
    tooLong: 'state está limitado a 4000 caracteres.',
    tooShort: 'state necesita al menos 8 caracteres.',
    limit: 'Límite horario de prueba alcanzado. Espera y vuelve a ejecutar.',
    noAnswers: 'No volvió ninguna respuesta.',
  },
  pt: {
    needState: 'Escreva primeiro uma entrada.',
    needQuestions: 'Perguntas inválidas: esperado um objeto JSON, até 6.',
    failed: 'O julgamento falhou. Tente mais tarde.',
    tooLong: 'state é limitado a 4000 caracteres.',
    tooShort: 'state precisa de pelo menos 8 caracteres.',
    limit: 'Limite horário de teste atingido. Aguarde e execute de novo.',
    noAnswers: 'Nenhuma resposta retornou.',
  },
};
