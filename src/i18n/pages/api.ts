import type { Localized } from '../ui';

/** lead 里含 {credit}/{rate} 插值，渲染时由调用点替换。 */
export const lead: Localized<string> = {
  zh: '用密钥在自己的程序里调用判断。注册就送 ${credit}。收费和 jev-1.13.0 相同：只按输入收钱，每百万 ${rate}，输出免费。',
  en: 'Call judgments from your own program with an API key. Sign up and get ${credit} in credit. Same as jev-1.13.0: input tokens only, ${rate} per million, output free.',
  ja: 'API Key を使って自分のプログラムから判定を呼び出します。登録で ${credit} 分のクレジットが付きます。jev-1.13.0 と同じく入力トークンのみ、100 万あたり ${rate}、出力は無料です。',
  ko: 'API Key로 자신의 프로그램에서 판정을 호출합니다. 가입 시 ${credit} 크레딧이 지급됩니다. jev-1.13.0과 같이 입력 토큰만, 100만 개당 ${rate}, 출력 무료입니다.',
  de: 'Rufe Urteile mit einem API Key aus deinem Programm ab. Bei der Anmeldung gibt es ${credit} Guthaben. Wie bei jev-1.13.0: nur Eingabe-Token, ${rate} pro Million, Ausgabe kostenlos.',
  fr: "Appelez des jugements depuis votre programme avec une clé API. L'inscription offre ${credit} de crédit. Comme jev-1.13.0 : uniquement les tokens d'entrée, ${rate} par million, sortie gratuite.",
  es: 'Llama a juicios desde tu propio programa con una clave de API. El registro incluye ${credit} de crédito. Igual que jev-1.13.0: solo tokens de entrada, ${rate} por millón, salida gratis.',
  pt: 'Chame julgamentos do seu programa com uma chave de API. O cadastro inclui ${credit} de crédito. Igual ao jev-1.13.0: apenas tokens de entrada, ${rate} por milhão, saída grátis.',
};

export const getKeyLead: Localized<string> = {
  zh: '在我的账户页创建一把密钥。明文只显示一次，网站只存加密指纹。',
  en: 'Issue a key on your account page. The plaintext is shown once; the server keeps only its sha256.',
  ja: 'アカウントページで Key を発行します。平文は一度だけ表示され、サーバーは sha256 のみを保持します。',
  ko: '계정 페이지에서 Key를 발급합니다. 평문은 한 번만 표시되며 서버는 sha256만 보관합니다.',
  de: 'Stelle einen Key auf deiner Kontoseite aus. Der Klartext wird einmal angezeigt; der Server behält nur seinen sha256.',
  fr: 'Émettez une clé sur votre page de compte. Le texte en clair n\'est affiché qu\'une fois ; le serveur ne conserve que son sha256.',
  es: 'Emite una clave en tu página de cuenta. El texto claro se muestra una vez; el servidor solo conserva su sha256.',
  pt: 'Emita uma chave na sua página de conta. O texto puro é mostrado uma vez; o servidor guarda apenas seu sha256.',
};

export const getKey: Localized<string> = {
  zh: '去我的账户创建密钥', en: 'Get a key on your account page', ja: 'アカウントページで Key を発行', ko: '계정 페이지에서 Key 발급', de: 'Key auf der Kontoseite ausstellen', fr: 'Obtenir une clé sur votre compte', es: 'Obtener una clave en tu cuenta', pt: 'Obter uma chave na sua conta',
};

export const authTitle: Localized<string> = {
  zh: '认证', en: 'Authentication', ja: '認証', ko: '인증', de: 'Authentifizierung', fr: 'Authentification', es: 'Autenticación', pt: 'Autenticação',
};

export const authLead: Localized<string> = {
  zh: '所有 /v1/* 请求都要带 Bearer Key。只认 Key，不认浏览器会话 Cookie——把网页登录状态和计费调用分开。',
  en: 'Every /v1/* request needs a Bearer key. Keys only — session cookies are not accepted, so browser sign-in and billed API calls stay separate.',
  ja: '/v1/* へのリクエストにはすべて Bearer Key が必要です。Key のみを受け付け、ブラウザのセッション Cookie は使いません。Web のログイン状態と課金される呼び出しを分けています。',
  ko: '모든 /v1/* 요청에는 Bearer Key가 필요합니다. Key만 인정하며 브라우저 세션 쿠키는 받지 않습니다. 웹 로그인 상태와 과금되는 호출을 분리합니다.',
  de: 'Jede /v1/*-Anfrage braucht einen Bearer Key. Nur Keys – Session-Cookies werden nicht akzeptiert, damit Browser-Anmeldung und abgerechnete Aufrufe getrennt bleiben.',
  fr: 'Chaque requête /v1/* exige une clé Bearer. Clés uniquement — les cookies de session ne sont pas acceptés, pour séparer la connexion web et les appels facturés.',
  es: 'Toda solicitud /v1/* necesita una clave Bearer. Solo claves: no se aceptan cookies de sesión, así el inicio de sesión web y las llamadas facturadas quedan separados.',
  pt: 'Toda requisição /v1/* exige uma chave Bearer. Apenas chaves — cookies de sessão não são aceitos, mantendo o login web e as chamadas cobradas separados.',
};

export const endpointsTitle: Localized<string> = {
  zh: '端点', en: 'Endpoints', ja: 'エンドポイント', ko: '엔드포인트', de: 'Endpunkte', fr: 'Points de terminaison', es: 'Endpoints', pt: 'Endpoints',
};

export const epJudge: Localized<string> = {
  zh: '跑一次判断。按本次输入收钱，成功才扣；上游失败不扣。',
  en: 'Run one judgment. Billed on the input tokens of this call, and only after it succeeds. Upstream failures are not charged.',
  ja: '判定を 1 回実行します。今回の入力トークンで課金され、成功後にのみ差し引かれます。上流の失敗は課金されません。',
  ko: '판정을 한 번 실행합니다. 이번 호출의 입력 토큰으로 과금되며 성공한 뒤에만 차감됩니다. 업스트림 실패는 과금되지 않습니다.',
  de: 'Führe ein Urteil aus. Abgerechnet über die Eingabe-Token dieses Aufrufs, und erst nach Erfolg. Fehler stromaufwärts werden nicht berechnet.',
  fr: "Lancez un jugement. Facturé sur les tokens d'entrée de cet appel, et seulement après succès. Les échecs en amont ne sont pas facturés.",
  es: 'Ejecuta un juicio. Se factura por los tokens de entrada de esta llamada, y solo tras el éxito. Los fallos en origen no se cobran.',
  pt: 'Execute um julgamento. Cobrado pelos tokens de entrada desta chamada, e somente após o sucesso. Falhas na origem não são cobradas.',
};

export const epMe: Localized<string> = {
  zh: '查当前用户、余额和累计花费。', en: 'Current user, balance, and total spend.', ja: '現在のユーザー、残高、累計利用。', ko: '현재 사용자, 잔액, 누적 사용.', de: 'Aktueller Nutzer, Guthaben und Gesamtausgaben.', fr: 'Utilisateur actuel, solde et dépenses totales.', es: 'Usuario actual, saldo y gasto total.', pt: 'Usuário atual, saldo e gasto total.',
};

export const epUsage: Localized<string> = {
  zh: '查余额、累计花费和最近记录。', en: 'Balance, total spend, and recent ledger entries.', ja: '残高、累計利用、直近の利用明細。', ko: '잔액, 누적 사용, 최근 사용 내역.', de: 'Guthaben, Gesamtausgaben und jüngste Abrechnungsposten.', fr: 'Solde, dépenses totales et dernières écritures.', es: 'Saldo, gasto total y movimientos recientes.', pt: 'Saldo, gasto total e lançamentos recentes.',
};

export const reqTitle: Localized<string> = {
  zh: '请求体（/v1/judge）', en: 'Request body (/v1/judge)', ja: 'リクエストボディ（/v1/judge）', ko: '요청 본문(/v1/judge)', de: 'Request-Body (/v1/judge)', fr: 'Corps de la requête (/v1/judge)', es: 'Cuerpo de la solicitud (/v1/judge)', pt: 'Corpo da requisição (/v1/judge)',
};

export const reqStateDesc: Localized<string> = {
  zh: '要判断的文本，8–4000 字。', en: 'The text to judge, 8–4000 chars.', ja: '判定するテキスト、8〜4000 文字。', ko: '판정할 텍스트, 8–4000자.', de: 'Der zu beurteilende Text, 8–4000 Zeichen.', fr: 'Le texte à juger, 8 à 4000 caractères.', es: 'El texto a juzgar, 8–4000 caracteres.', pt: 'O texto a julgar, 8–4000 caracteres.',
};

export const reqQuestionsDesc: Localized<string> = {
  zh: '最多 6 个问题，键名需为小写字母开头的标识符。', en: 'Up to 6 questions; keys must be lowercase-letter identifiers.', ja: '最大 6 問。キー名は小文字で始まる識別子にしてください。', ko: '최대 6문항. 키 이름은 소문자로 시작하는 식별자여야 합니다.', de: 'Bis zu 6 Fragen; Schlüssel müssen mit Kleinbuchstaben beginnen.', fr: 'Jusqu\'à 6 questions ; les clés doivent être des identifiants commençant par une minuscule.', es: 'Hasta 6 preguntas; las claves deben ser identificadores que empiecen con minúscula.', pt: 'Até 6 perguntas; as chaves devem ser identificadores que começam com minúscula.',
};

export const typesTitle: Localized<string> = {
  zh: '问题类型', en: 'Question types', ja: '質問タイプ', ko: '질문 유형', de: 'Fragetypen', fr: 'Types de question', es: 'Tipos de pregunta', pt: 'Tipos de pergunta',
};

export const typeNoul: Localized<string> = {
  zh: '相关程度，返回 0–1 的浮点数。', en: 'Relevance, returns a float 0–1.', ja: '関連度。0〜1 の浮動小数点数を返します。', ko: '관련도. 0–1 실수를 반환합니다.', de: 'Relevanz, gibt eine Gleitkommazahl 0–1 zurück.', fr: 'Pertinence, renvoie un nombre décimal de 0 à 1.', es: 'Relevancia, devuelve un decimal de 0 a 1.', pt: 'Relevância, retorna um decimal de 0 a 1.',
};

export const typeConf: Localized<string> = {
  zh: '置信度，返回 0–1 的浮点数。', en: 'Confidence, returns a float 0–1.', ja: '信頼度。0〜1 の浮動小数点数を返します。', ko: '신뢰도. 0–1 실수를 반환합니다.', de: 'Konfidenz, gibt eine Gleitkommazahl 0–1 zurück.', fr: 'Confiance, renvoie un nombre décimal de 0 à 1.', es: 'Confianza, devuelve un decimal de 0 a 1.', pt: 'Confiança, retorna um decimal de 0 a 1.',
};

export const typeChoice: Localized<string> = {
  zh: '从给定选项里选一个，返回被选中的字符串。可以传 options 数组，也可以传 criteria 对象；服务端会把 options 收成 criteria 再送给模型。',
  en: 'Pick one option and return the chosen string. Send an options array or a criteria object; options are folded into criteria before the model sees them.',
  ja: '与えられた選択肢から 1 つを選び、選ばれた文字列を返します。options 配列でも criteria オブジェクトでも渡せます。サーバーは options を criteria にまとめてからモデルへ送ります。',
  ko: '주어진 선택지에서 하나를 골라 선택된 문자열을 반환합니다. options 배열이나 criteria 객체를 보낼 수 있으며, 서버가 options를 criteria로 합쳐 모델에 전달합니다.',
  de: 'Wähle eine Option und gib den gewählten String zurück. Sende ein options-Array oder ein criteria-Objekt; options werden vor dem Modell in criteria überführt.',
  fr: 'Choisissez une option et renvoyez la chaîne retenue. Envoyez un tableau options ou un objet criteria ; les options sont repliées dans criteria avant le modèle.',
  es: 'Elige una opción y devuelve la cadena elegida. Envía un array options o un objeto criteria; las options se integran en criteria antes del modelo.',
  pt: 'Escolha uma opção e retorne a string escolhida. Envie um array options ou um objeto criteria; as options são reunidas em criteria antes do modelo.',
};

export const respTitle: Localized<string> = {
  zh: '响应', en: 'Response', ja: 'レスポンス', ko: '응답', de: 'Antwort', fr: 'Réponse', es: 'Respuesta', pt: 'Resposta',
};

export const respCredit: Localized<string> = {
  zh: '本次调用后的余额。', en: 'Balance after this call.', ja: '今回の呼び出し後の残高。', ko: '이번 호출 후 잔액.', de: 'Guthaben nach diesem Aufruf.', fr: 'Solde après cet appel.', es: 'Saldo tras esta llamada.', pt: 'Saldo após esta chamada.',
};

export const creditTitle: Localized<string> = {
  zh: 'credit 结构', en: 'The credit object', ja: 'credit の構造', ko: 'credit 구조', de: 'Das credit-Objekt', fr: 'L\'objet credit', es: 'El objeto credit', pt: 'O objeto credit',
};

export const creditFields: Localized<[string, string][]> = {
  zh: [
    ['cents', '剩余额度四舍五入到美分。精确余额看 usd 和 microUsd。'],
    ['usd', '美元字符串。小额会保留到微美元。'],
    ['microUsd', '剩余微美元。1 美元 = 1,000,000。'],
    ['inputTokensLeft', '按 $0.042 / 百万输入 token，这笔余额还能覆盖多少输入 token。'],
  ],
  en: [
    ['cents', 'Remaining balance rounded to the nearest cent. usd and microUsd are exact.'],
    ['usd', 'USD string. Small amounts keep microdollar digits.'],
    ['microUsd', 'Remaining microdollars. 1 USD = 1,000,000.'],
    ['inputTokensLeft', 'Input tokens this balance still covers at $0.042 per million.'],
  ],
  ja: [
    ['cents', '残高をセント単位に四捨五入したもの。正確な残高は usd と microUsd を参照。'],
    ['usd', 'USD 文字列。少額はマイクロドル桁まで保持します。'],
    ['microUsd', '残りのマイクロドル。1 USD = 1,000,000。'],
    ['inputTokensLeft', '100 万あたり $0.042 の入力トークンで、この残高がまかなえる入力トークン数。'],
  ],
  ko: [
    ['cents', '잔액을 센트 단위로 반올림한 값. 정확한 잔액은 usd와 microUsd를 보세요.'],
    ['usd', 'USD 문자열. 소액은 마이크로달러 자릿수까지 유지합니다.'],
    ['microUsd', '남은 마이크로달러. 1 USD = 1,000,000.'],
    ['inputTokensLeft', '100만 개당 $0.042인 입력 토큰 기준으로 이 잔액이 감당할 수 있는 입력 토큰 수.'],
  ],
  de: [
    ['cents', 'Restguthaben auf den nächsten Cent gerundet. usd und microUsd sind exakt.'],
    ['usd', 'USD-String. Kleine Beträge behalten Mikrodollar-Stellen.'],
    ['microUsd', 'Verbleibende Mikrodollar. 1 USD = 1,000,000.'],
    ['inputTokensLeft', 'Eingabe-Token, die dieses Guthaben bei $0.042 pro Million noch deckt.'],
  ],
  fr: [
    ['cents', 'Solde restant arrondi au centime. usd et microUsd sont exacts.'],
    ['usd', 'Chaîne USD. Les petits montants conservent les chiffres en microdollars.'],
    ['microUsd', 'Microdollars restants. 1 USD = 1 000 000.'],
    ['inputTokensLeft', "Tokens d'entrée que ce solde couvre encore à 0,042 $ par million."],
  ],
  es: [
    ['cents', 'Saldo restante redondeado al centavo. usd y microUsd son exactos.'],
    ['usd', 'Cadena USD. Los importes pequeños conservan dígitos en microdólares.'],
    ['microUsd', 'Microdólares restantes. 1 USD = 1.000.000.'],
    ['inputTokensLeft', 'Tokens de entrada que este saldo aún cubre a $0.042 por millón.'],
  ],
  pt: [
    ['cents', 'Saldo restante arredondado ao centavo. usd e microUsd são exatos.'],
    ['usd', 'String USD. Valores pequenos mantêm dígitos em microdólares.'],
    ['microUsd', 'Microdólares restantes. 1 USD = 1.000.000.'],
    ['inputTokensLeft', 'Tokens de entrada que este saldo ainda cobre a $0.042 por milhão.'],
  ],
};

export const errTitle: Localized<string> = {
  zh: '错误', en: 'Errors', ja: 'エラー', ko: '오류', de: 'Fehler', fr: 'Erreurs', es: 'Errores', pt: 'Erros',
};

export const errTh: Localized<string> = {
  zh: '状态', en: 'Status', ja: 'ステータス', ko: '상태', de: 'Status', fr: 'Statut', es: 'Estado', pt: 'Status',
};

export const errCodes: Localized<[string, string, string][]> = {
  zh: [
    ['401', 'unauthorized / invalid_api_key', '缺少或无效的 API Key。'],
    ['400', 'invalid_request', 'state 太短或没有问题。'],
    ['429', 'quota_exceeded', '余额不足，带 retry-after。'],
    ['502', 'upstream_unavailable', '判定后端暂时不可用，本次不扣费。'],
  ],
  en: [
    ['401', 'unauthorized / invalid_api_key', 'Missing or invalid API key.'],
    ['400', 'invalid_request', 'State too short, or no questions.'],
    ['429', 'quota_exceeded', 'Not enough balance; includes retry-after.'],
    ['502', 'upstream_unavailable', 'Judgment backend is down. Not charged.'],
  ],
  ja: [
    ['401', 'unauthorized / invalid_api_key', 'API Key がないか無効です。'],
    ['400', 'invalid_request', 'state が短すぎるか、質問がありません。'],
    ['429', 'quota_exceeded', '残高不足。retry-after が付きます。'],
    ['502', 'upstream_unavailable', '判定バックエンドが一時的に利用できません。今回の課金はありません。'],
  ],
  ko: [
    ['401', 'unauthorized / invalid_api_key', 'API Key가 없거나 유효하지 않습니다.'],
    ['400', 'invalid_request', 'state가 너무 짧거나 질문이 없습니다.'],
    ['429', 'quota_exceeded', '잔액 부족. retry-after가 포함됩니다.'],
    ['502', 'upstream_unavailable', '판정 백엔드를 일시적으로 사용할 수 없습니다. 이번 호출은 과금되지 않습니다.'],
  ],
  de: [
    ['401', 'unauthorized / invalid_api_key', 'API Key fehlt oder ist ungültig.'],
    ['400', 'invalid_request', 'state zu kurz oder keine Fragen.'],
    ['429', 'quota_exceeded', 'Zu wenig Guthaben; enthält retry-after.'],
    ['502', 'upstream_unavailable', 'Urteil-Backend ist nicht erreichbar. Keine Abrechnung.'],
  ],
  fr: [
    ['401', 'unauthorized / invalid_api_key', 'Clé API manquante ou invalide.'],
    ['400', 'invalid_request', 'state trop court, ou aucune question.'],
    ['429', 'quota_exceeded', 'Solde insuffisant ; inclut retry-after.'],
    ['502', 'upstream_unavailable', 'Le backend de jugement est indisponible. Non facturé.'],
  ],
  es: [
    ['401', 'unauthorized / invalid_api_key', 'Clave de API ausente o inválida.'],
    ['400', 'invalid_request', 'state demasiado corto, o sin preguntas.'],
    ['429', 'quota_exceeded', 'Saldo insuficiente; incluye retry-after.'],
    ['502', 'upstream_unavailable', 'El backend de juicio está caído. Sin cargo.'],
  ],
  pt: [
    ['401', 'unauthorized / invalid_api_key', 'Chave de API ausente ou inválida.'],
    ['400', 'invalid_request', 'state muito curto, ou sem perguntas.'],
    ['429', 'quota_exceeded', 'Saldo insuficiente; inclui retry-after.'],
    ['502', 'upstream_unavailable', 'O backend de julgamento está fora do ar. Sem cobrança.'],
  ],
};

export const exampleTitle: Localized<string> = {
  zh: '示例', en: 'Example', ja: '例', ko: '예시', de: 'Beispiel', fr: 'Exemple', es: 'Ejemplo', pt: 'Exemplo',
};

export const ctaTry: Localized<string> = {
  zh: '先去试用页试一次', en: 'Try one on the try page', ja: 'まず試用ページで 1 回試す', ko: '먼저 체험 페이지에서 한 번 시도', de: 'Auf der Testseite eine ausprobieren', fr: 'En essayer une sur la page d\'essai', es: 'Probar una en la página de prueba', pt: 'Testar uma na página de teste',
};

export const ctaPricing: Localized<string> = {
  zh: '看价格', en: 'Pricing', ja: '価格を見る', ko: '가격 보기', de: 'Preise', fr: 'Tarifs', es: 'Precios', pt: 'Preços',
};
