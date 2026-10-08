import type { Localized } from '../ui';

export const title: Localized<string> = {
  zh: '价格', en: 'Pricing', ja: '価格', ko: '가격', de: 'Preise', fr: 'Tarifs', es: 'Precios', pt: 'Preços',
};

export const lead: Localized<string> = {
  zh: '和 jev-1.13.0 同一个收费方案：只按输入收钱，输出免费。每百万输入 token $0.042（每十亿 $42）。注册就送 $5，按这个单价扣到用完。',
  en: 'Same billing as jev-1.13.0: input tokens only, output free. $0.042 per million input tokens ($42 per billion). Sign up and get $5, drawn at that rate until it runs out.',
  ja: 'jev-1.13.0 と同じ課金方式：入力トークンのみ、出力は無料。入力トークン 100 万あたり $0.042（10 億あたり $42）。登録で $5 が付き、同じ単価で使い切るまで差し引かれます。',
  ko: 'jev-1.13.0과 같은 과금 방식: 입력 토큰만, 출력 무료. 입력 토큰 100만 개당 $0.042(10억 개당 $42). 가입 시 $5가 지급되며 같은 단가로 소진될 때까지 차감됩니다.',
  de: 'Gleiche Abrechnung wie jev-1.13.0: nur Eingabe-Token, Ausgabe kostenlos. $0.042 pro Million Eingabe-Token ($42 pro Milliarde). Bei der Anmeldung gibt es $5, verrechnet zu diesem Satz, bis es aufgebraucht ist.',
  fr: "Même facturation que jev-1.13.0 : uniquement les tokens d'entrée, sortie gratuite. 0,042 $ par million de tokens d'entrée (42 $ par milliard). L'inscription offre 5 $, décomptés à ce tarif jusqu'à épuisement.",
  es: 'Misma facturación que jev-1.13.0: solo tokens de entrada, salida gratis. $0.042 por millón de tokens de entrada ($42 por mil millones). El registro incluye $5, descontados a ese precio hasta agotarse.',
  pt: 'Mesma cobrança do jev-1.13.0: apenas tokens de entrada, saída grátis. $0.042 por milhão de tokens de entrada ($42 por bilhão). O cadastro inclui $5, debitados nessa tarifa até acabar.',
};

export const scheme: Localized<string> = {
  zh: '按输入 token', en: 'Input tokens', ja: '入力トークン', ko: '입력 토큰', de: 'Eingabe-Token', fr: "Tokens d'entrée", es: 'Tokens de entrada', pt: 'Tokens de entrada',
};

export const perMillion: Localized<string> = {
  zh: '每百万输入 token', en: 'per million input tokens', ja: '入力トークン 100 万あたり', ko: '입력 토큰 100만 개당', de: 'pro Million Eingabe-Token', fr: "par million de tokens d'entrée", es: 'por millón de tokens de entrada', pt: 'por milhão de tokens de entrada',
};

export const outputFree: Localized<string> = {
  zh: '输出免费', en: 'Output is free', ja: '出力は無料', ko: '출력 무료', de: 'Ausgabe kostenlos', fr: 'Sortie gratuite', es: 'Salida gratis', pt: 'Saída grátis',
};

export const signup: Localized<string> = {
  zh: '注册赠送', en: 'Signup credit', ja: '登録特典', ko: '가입 크레딧', de: 'Anmeldeguthaben', fr: "Crédit d'inscription", es: 'Crédito de registro', pt: 'Crédito de cadastro',
};

export const inputTokens: Localized<string> = {
  zh: '个输入 token', en: 'input tokens', ja: '入力トークン', ko: '입력 토큰', de: 'Eingabe-Token', fr: "tokens d'entrée", es: 'tokens de entrada', pt: 'tokens de entrada',
};

export const cta: Localized<string> = {
  zh: '开始使用', en: 'Get started', ja: '始める', ko: '시작하기', de: 'Loslegen', fr: 'Commencer', es: 'Empezar', pt: 'Começar',
};

export const cols: Localized<{ item: string; value: string }> = {
  zh: { item: '项目', value: '价格' },
  en: { item: 'Item', value: 'Rate' },
  ja: { item: '項目', value: '基準' },
  ko: { item: '항목', value: '기준' },
  de: { item: 'Posten', value: 'Satz' },
  fr: { item: 'Élément', value: 'Tarif' },
  es: { item: 'Concepto', value: 'Tarifa' },
  pt: { item: 'Item', value: 'Tarifa' },
};

/** 行内 {credit} / {tokens} 由调用点替换为实际数字。 */
export const rows: Localized<[string, string][]> = {
  zh: [
    ['输入', '$0.042 / 百万 token（$42 / 十亿）'],
    ['输出', '$0'],
    ['注册赠送', '${credit}，约够写 {tokens} 个 token 的输入'],
    ['一次能读多少（jev-1.13.0 公布）', '单次 64K token；情况说明和最长的问题各 32K'],
    ['处理速度（jev-1.13.0 公布）', '每秒 100K token，每秒 40 次请求，随负载调整'],
    ['不注册试用', '每个 IP 每小时 20 次，不扣钱'],
    ['单次上限', '情况说明最长 4000 字，最多 6 个问题'],
  ],
  en: [
    ['Input', '$0.042 / million tokens ($42 / billion)'],
    ['Output', '$0'],
    ['Signup credit', '${credit}, about {tokens} input tokens'],
    ['Context (published for jev-1.13.0)', '64K tokens per request; 32K for state and for the longest question'],
    ['Rate (published for jev-1.13.0)', '100K tokens/s and 40 requests/s; published limits move with load'],
    ['Anonymous try', '20 calls per IP per hour, not billed'],
    ['Per-call cap on this site', 'state up to 4000 characters, up to 6 questions'],
  ],
  ja: [
    ['入力', '$0.042 / 100 万トークン（10 億あたり $42）'],
    ['出力', '$0'],
    ['登録特典', '${credit}、約 {tokens} 入力トークン'],
    ['コンテキスト（jev-1.13.0 公表）', '1 リクエスト 64K トークン。state と最長の質問が各 32K'],
    ['レート（jev-1.13.0 公表）', '100K トークン/秒、40 リクエスト/秒。公表値は負荷で変動'],
    ['匿名トライアル', 'IP あたり 1 時間 20 回、課金なし'],
    ['当サイトの 1 回上限', 'state 最大 4000 文字、質問は最大 6 個'],
  ],
  ko: [
    ['입력', '$0.042 / 백만 토큰 ($42 / 십억)'],
    ['출력', '$0'],
    ['가입 크레딧', '${credit}, 약 {tokens} 입력 토큰'],
    ['컨텍스트(jev-1.13.0 공개)', '요청당 64K 토큰. state와 가장 긴 질문이 각 32K'],
    ['레이트(jev-1.13.0 공개)', '100K 토큰/s, 40 요청/s. 공개 한도는 부하에 따라 변동'],
    ['익명 체험', 'IP당 시간당 20회, 과금 없음'],
    ['이 사이트의 호출당 상한', 'state 최대 4000자, 질문 최대 6개'],
  ],
  de: [
    ['Eingabe', '$0.042 / Million Token ($42 / Milliarde)'],
    ['Ausgabe', '$0'],
    ['Anmeldeguthaben', '${credit}, etwa {tokens} Eingabe-Token'],
    ['Kontext (für jev-1.13.0 veröffentlicht)', '64K Token pro Anfrage; 32K für state und für die längste Frage'],
    ['Rate (für jev-1.13.0 veröffentlicht)', '100K Token/s und 40 Anfragen/s; veröffentlichte Grenzen schwanken mit der Last'],
    ['Anonymer Test', '20 Aufrufe pro IP und Stunde, nicht berechnet'],
    ['Limit pro Aufruf auf dieser Site', 'state bis 4000 Zeichen, bis zu 6 Fragen'],
  ],
  fr: [
    ['Entrée', '0,042 $ / million de tokens (42 $ / milliard)'],
    ['Sortie', '0 $'],
    ['Crédit d\'inscription', '${credit}, environ {tokens} tokens d\'entrée'],
    ['Contexte (publié pour jev-1.13.0)', '64K tokens par requête ; 32K pour state et pour la question la plus longue'],
    ['Débit (publié pour jev-1.13.0)', '100K tokens/s et 40 requêtes/s ; les limites publiées varient avec la charge'],
    ['Essai anonyme', '20 appels par IP et par heure, non facturés'],
    ['Plafond par appel sur ce site', 'state jusqu\'à 4000 caractères, jusqu\'à 6 questions'],
  ],
  es: [
    ['Entrada', '$0.042 / millón de tokens ($42 / mil millones)'],
    ['Salida', '$0'],
    ['Crédito de registro', '${credit}, unos {tokens} tokens de entrada'],
    ['Contexto (publicado para jev-1.13.0)', '64K tokens por solicitud; 32K para state y para la pregunta más larga'],
    ['Velocidad (publicada para jev-1.13.0)', '100K tokens/s y 40 solicitudes/s; los límites publicados varían con la carga'],
    ['Prueba anónima', '20 llamadas por IP y hora, sin cargo'],
    ['Límite por llamada en este sitio', 'state hasta 4000 caracteres, hasta 6 preguntas'],
  ],
  pt: [
    ['Entrada', '$0.042 / milhão de tokens ($42 / bilhão)'],
    ['Saída', '$0'],
    ['Crédito de cadastro', '${credit}, cerca de {tokens} tokens de entrada'],
    ['Contexto (publicado para jev-1.13.0)', '64K tokens por requisição; 32K para state e para a pergunta mais longa'],
    ['Taxa (publicada para jev-1.13.0)', '100K tokens/s e 40 requisições/s; os limites publicados variam com a carga'],
    ['Teste anônimo', '20 chamadas por IP por hora, sem cobrança'],
    ['Limite por chamada neste site', 'state até 4000 caracteres, até 6 perguntas'],
  ],
};

export const note: Localized<string> = {
  zh: '上游不返回 token 用量。已登录的调用按实际送出的内容收费：情况说明加问题的 JSON（选择题的选项会先收成 criteria）拼在一起，按 UTF-8 字节数除以 4、向上取整，至少记 1 个 token。判断成功才扣费。',
  en: 'The upstream call does not return token usage. Signed-in calls are metered on what we send: the state plus the questions JSON (choice options are folded into criteria first). UTF-8 bytes divided by 4, rounded up, at least 1 token. Charged only after a successful judgment.',
  ja: '上流はトークン使用量を返しません。ログイン済みの呼び出しは実際に送った内容で計量します：state と questions の JSON（選択問題の options は先に criteria へまとめます）を連結し、UTF-8 のバイト数を 4 で割って切り上げ、最低 1 トークン。判定が成功した後にのみ課金されます。',
  ko: '업스트림은 토큰 사용량을 반환하지 않습니다. 로그인한 호출은 실제로 보낸 내용으로 계량합니다: state와 questions의 JSON(선택 문제의 options는 먼저 criteria로 합칩니다)을 이어 붙여 UTF-8 바이트를 4로 나눈 뒤 올림, 최소 1토큰. 판정이 성공한 뒤에만 과금됩니다.',
  de: 'Der Upstream-Aufruf liefert keine Token-Nutzung. Angemeldete Aufrufe werden nach dem abgerechnet, was wir senden: der state plus das questions-JSON (options von Auswahlfragen werden zuvor in criteria überführt). UTF-8-Bytes durch 4, aufgerundet, mindestens 1 Token. Berechnung erst nach einem erfolgreichen Urteil.',
  fr: "L'appel en amont ne renvoie pas l'usage des tokens. Les appels connectés sont mesurés sur ce que nous envoyons : le state plus le JSON des questions (les options des questions à choix sont d'abord repliées dans criteria). Octets UTF-8 divisés par 4, arrondis au supérieur, au moins 1 token. Facturé seulement après un jugement réussi.",
  es: 'La llamada en origen no devuelve el uso de tokens. Las llamadas con sesión se miden por lo que enviamos: el state más el JSON de questions (las options de las preguntas de opción se integran antes en criteria). Bytes UTF-8 divididos por 4, redondeado al alza, mínimo 1 token. Se cobra solo tras un juicio correcto.',
  pt: 'A chamada na origem não retorna o uso de tokens. As chamadas com sessão são medidas pelo que enviamos: o state mais o JSON de questions (as options das perguntas de escolha são antes reunidas em criteria). Bytes UTF-8 divididos por 4, arredondado para cima, no mínimo 1 token. Cobrado apenas após um julgamento bem-sucedido.',
};

export const back: Localized<string> = {
  zh: '先去试一次', en: 'Try a judgment first', ja: 'まず 1 回試す', ko: '먼저 한 번 시도', de: 'Zuerst eine ausprobieren', fr: "Essayer d'abord", es: 'Probar antes', pt: 'Testar antes',
};

