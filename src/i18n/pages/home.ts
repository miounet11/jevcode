/**
 * 首页内联文案（8 语言）。
 * 键为 Localized<T>，`en` 必填；缺语言时 pick() 回落英文。
 * 字符串里的 `{lang}` 会在渲染时替换为当前语言前缀。
 */
import type { Localized } from '../ui';

export const trialLabels: Localized<Record<string, string>> = {
  zh: { urgency: '紧急', intent: '意图', billing: '账单', safety: '安全', route: '路由', language: '语言', priority: '优先级', sentiment: '情绪', match3: '消消乐' },
  en: { urgency: 'Urgency', intent: 'Intent', billing: 'Billing', safety: 'Safety', route: 'Routing', language: 'Language', priority: 'Priority', sentiment: 'Sentiment', match3: 'Match-3' },
  ja: { urgency: '緊急', intent: '意図', billing: '請求', safety: '安全', route: 'ルーティング', language: '言語', priority: '優先度', sentiment: '感情', match3: 'マッチ3' },
  ko: { urgency: '긴급', intent: '의도', billing: '청구', safety: '안전', route: '라우팅', language: '언어', priority: '우선순위', sentiment: '감정', match3: '매치3' },
  de: { urgency: 'Dringlichkeit', intent: 'Absicht', billing: 'Abrechnung', safety: 'Sicherheit', route: 'Routing', language: 'Sprache', priority: 'Priorität', sentiment: 'Stimmung', match3: 'Match-3' },
  fr: { urgency: 'Urgence', intent: 'Intention', billing: 'Facturation', safety: 'Sécurité', route: 'Routage', language: 'Langue', priority: 'Priorité', sentiment: 'Sentiment', match3: 'Match-3' },
  es: { urgency: 'Urgencia', intent: 'Intención', billing: 'Facturación', safety: 'Seguridad', route: 'Enrutamiento', language: 'Idioma', priority: 'Prioridad', sentiment: 'Sentimiento', match3: 'Match-3' },
  pt: { urgency: 'Urgência', intent: 'Intenção', billing: 'Cobrança', safety: 'Segurança', route: 'Roteamento', language: 'Idioma', priority: 'Prioridade', sentiment: 'Sentimento', match3: 'Match-3' },
};

export type Faq = { q: string; a: string };

export const faqs: Localized<Faq[]> = {
  zh: [
    { q: 'JevCode 是什么？', a: 'Jev 的主场。本站的模型是 clavue-jev，今天世界上最好的 Jev。概念页是我们自己写的。' },
    { q: '这个站提供哪个模型？', a: '只提供 clavue-jev。对比页会用同一道题再问一次 jev-1.13.0，用来对照，不把那边叫做另一套服务。' },
    { q: '怎么计费？', a: '与 jev-1.13.0 相同：只按输入 token，每百万 $0.042，输出免费。注册赠送 $5，按这个单价扣。判定成功后才扣。' },
    { q: '不登录能试吗？', a: '可以。匿名每 IP 每小时 20 次，不计费。现场页的「用本站复测」走的就是这条。' },
    { q: '文档和案例从哪里进？', a: '站内目录把试用、文档、案例和价格列在同一页。每一页底部也有下一跳。' },
  ],
  en: [
    { q: 'What is JevCode?', a: 'The home of Jev. The model is clavue-jev, the best Jev in the world today. The concept pages are written here.' },
    { q: 'Which model does this site serve?', a: 'clavue-jev only. The compare page also asks jev-1.13.0 the same question, as a side-by-side check.' },
    { q: 'How is it billed?', a: 'Same as jev-1.13.0: input tokens only, $0.042 per million, output free. Signup credit is $5, drawn at that rate, and only after a successful call.' },
    { q: 'Can I try it without an account?', a: 'Yes. Anonymous calls are 20 per IP per hour and are not billed. "Run it here" on the live scenes page uses that path.' },
    { q: 'Where are the docs and cases?', a: 'The site directory lists try, docs, cases, and pricing on one page. Each page also links onward at the bottom.' },
  ],
  ja: [
    { q: 'JevCode とは？', a: 'Jev の本拠です。このサイトのモデルは clavue-jev で、今日世界で最も優れた Jev です。概念ページは当サイトが書いています。' },
    { q: 'このサイトはどのモデルを提供しますか？', a: 'clavue-jev のみです。比較ページでは同じ問題を jev-1.13.0 にもう一度尋ね、並べて確認します。' },
    { q: '料金はどうなりますか？', a: 'jev-1.13.0 と同じ：入力トークンのみ、100 万あたり $0.042、出力は無料。登録で $5 分が付き、同じ単価で差し引かれます。判定が成功した後にのみ課金されます。' },
    { q: 'アカウントなしで試せますか？', a: 'はい。匿名は IP あたり 1 時間 20 回で、課金されません。現場ページの「ここで再実行」がこの経路です。' },
    { q: 'ドキュメントと事例はどこから？', a: 'サイト内ディレクトリが試用・ドキュメント・事例・料金を 1 ページにまとめています。各ページ下部にも次の入口があります。' },
  ],
  ko: [
    { q: 'JevCode는 무엇인가요?', a: 'Jev의 본거지입니다. 이 사이트의 모델은 clavue-jev이며, 오늘 세계에서 가장 뛰어난 Jev입니다. 개념 페이지는 저희가 직접 작성합니다.' },
    { q: '이 사이트는 어떤 모델을 제공하나요?', a: 'clavue-jev만 제공합니다. 비교 페이지에서는 같은 문제를 jev-1.13.0에 한 번 더 물어 나란히 확인합니다.' },
    { q: '요금은 어떻게 부과되나요?', a: 'jev-1.13.0과 같습니다: 입력 토큰만, 100만 개당 $0.042, 출력 무료. 가입 시 $5가 지급되며 같은 단가로 차감됩니다. 판정이 성공한 뒤에만 부과됩니다.' },
    { q: '계정 없이 시도할 수 있나요?', a: '네. 익명은 IP당 시간당 20회이며 과금되지 않습니다. 현장 페이지의 "여기서 재실행"이 이 경로입니다.' },
    { q: '문서와 사례는 어디서 보나요?', a: '사이트 디렉터리가 체험·문서·사례·가격을 한 페이지에 모아 둡니다. 각 페이지 하단에도 다음 이동 지점이 있습니다.' },
  ],
  de: [
    { q: 'Was ist JevCode?', a: 'Das Zuhause von Jev. Das Modell dieser Seite ist clavue-jev, heute das beste Jev der Welt. Die Konzeptseiten stammen von uns.' },
    { q: 'Welches Modell bietet diese Seite?', a: 'Nur clavue-jev. Die Vergleichsseite stellt dieselbe Frage zusätzlich an jev-1.13.0, zum Nebeneinanderstellen.' },
    { q: 'Wie wird abgerechnet?', a: 'Wie bei jev-1.13.0: nur Eingabe-Token, $0.042 pro Million, Ausgabe kostenlos. Das Anmeldeguthaben beträgt $5, wird zu diesem Satz verrechnet und erst nach einem erfolgreichen Aufruf.' },
    { q: 'Kann ich es ohne Konto testen?', a: 'Ja. Anonyme Aufrufe sind 20 pro IP und Stunde und werden nicht berechnet. "Hier erneut ausführen" auf der Live-Seite nutzt diesen Weg.' },
    { q: 'Wo finde ich Doku und Fälle?', a: 'Das Site-Verzeichnis listet Test, Doku, Fälle und Preise auf einer Seite. Jede Seite verlinkt unten weiter.' },
  ],
  fr: [
    { q: "Qu'est-ce que JevCode ?", a: "Le foyer de Jev. Le modèle de ce site est clavue-jev, le meilleur Jev du monde aujourd'hui. Les pages de concepts sont écrites ici." },
    { q: 'Quel modèle ce site sert-il ?', a: 'clavue-jev uniquement. La page comparer pose aussi la même question à jev-1.13.0, pour une vérification côte à côte.' },
    { q: 'Comment la facturation fonctionne-t-elle ?', a: "Comme jev-1.13.0 : uniquement les tokens d'entrée, 0,042 $ par million, sortie gratuite. Le crédit d'inscription est de 5 $, décompté à ce tarif, et seulement après un appel réussi." },
    { q: 'Puis-je essayer sans compte ?', a: "Oui. Les appels anonymes sont de 20 par IP et par heure et ne sont pas facturés. « Réexécuter ici » sur la page des scènes utilise ce chemin." },
    { q: 'Où sont la documentation et les cas ?', a: "L'annuaire du site réunit essai, documentation, cas et tarifs sur une seule page. Chaque page propose aussi une suite en bas." },
  ],
  es: [
    { q: '¿Qué es JevCode?', a: 'El hogar de Jev. El modelo de este sitio es clavue-jev, el mejor Jev del mundo hoy. Las páginas de conceptos las escribimos nosotros.' },
    { q: '¿Qué modelo ofrece este sitio?', a: 'Solo clavue-jev. La página de comparación también pregunta lo mismo a jev-1.13.0, para contrastar en paralelo.' },
    { q: '¿Cómo se factura?', a: 'Igual que jev-1.13.0: solo tokens de entrada, $0.042 por millón, salida gratis. El crédito de registro es de $5, se descuenta a ese precio y solo tras una llamada correcta.' },
    { q: '¿Puedo probarlo sin cuenta?', a: 'Sí. Las llamadas anónimas son 20 por IP y hora y no se facturan. "Ejecutar aquí" en la página de escenas usa esa vía.' },
    { q: '¿Dónde están la documentación y los casos?', a: 'El directorio del sitio reúne prueba, documentación, casos y precios en una página. Cada página también enlaza a la siguiente abajo.' },
  ],
  pt: [
    { q: 'O que é o JevCode?', a: 'A casa do Jev. O modelo deste site é o clavue-jev, o melhor Jev do mundo hoje. As páginas de conceitos são escritas por nós.' },
    { q: 'Qual modelo este site oferece?', a: 'Apenas o clavue-jev. A página de comparação também pergunta o mesmo ao jev-1.13.0, para conferir lado a lado.' },
    { q: 'Como é a cobrança?', a: 'Igual ao jev-1.13.0: apenas tokens de entrada, $0.042 por milhão, saída grátis. O crédito de cadastro é de $5, debitado nesse valor, e só após uma chamada bem-sucedida.' },
    { q: 'Posso testar sem conta?', a: 'Sim. As chamadas anônimas são 20 por IP por hora e não são cobradas. "Executar aqui" na página de cenas usa esse caminho.' },
    { q: 'Onde estão a documentação e os casos?', a: 'O diretório do site reúne teste, documentação, casos e preços em uma página. Cada página também aponta a próxima abaixo.' },
  ],
};

export const hero = {
  ctaPrimary: { zh: '参加 clavue-jev 测试', en: 'Try clavue-jev', ja: 'clavue-jev のテストに参加', ko: 'clavue-jev 테스트 참여', de: 'clavue-jev testen', fr: 'Essayer clavue-jev', es: 'Probar clavue-jev', pt: 'Testar o clavue-jev' } as Localized<string>,
  ctaSecondary: { zh: '试一次判定', en: 'Try a judgment', ja: '判定を 1 回試す', ko: '판정 한 번 시도', de: 'Ein Urteil versuchen', fr: 'Essayer un jugement', es: 'Probar un juicio', pt: 'Tentar um julgamento' } as Localized<string>,
  stageOurs: { zh: '本站这一边', en: 'This site', ja: '当サイト側', ko: '이 사이트 쪽', de: 'Diese Seite', fr: 'Ce site', es: 'Este sitio', pt: 'Este site' } as Localized<string>,
  stagePeer: { zh: '同一道题', en: 'Same question', ja: '同じ問題', ko: '같은 문제', de: 'Dieselbe Frage', fr: 'Même question', es: 'Misma pregunta', pt: 'Mesma pergunta' } as Localized<string>,
  stageHint: { zh: '点开，看这一题谁命中', en: 'Open a question and see who hits', ja: '開いて、この問題でどちらが当てるか見る', ko: '열어서 이 문제에서 누가 맞히는지 보기', de: 'Öffnen und sehen, wer diese Frage trifft', fr: 'Ouvrir et voir qui réussit cette question', es: 'Abrir y ver quién acierta esta pregunta', pt: 'Abrir e ver quem acerta esta pergunta' } as Localized<string>,
};

export const bench = {
  runOne: { zh: '开跑这一题', en: 'Run this one', ja: 'この問題を実行', ko: '이 문제 실행', de: 'Diese ausführen', fr: 'Lancer celle-ci', es: 'Ejecutar esta', pt: 'Executar esta' } as Localized<string>,
  scenesLink: { zh: '现场演示', en: 'Live scenes', ja: 'ライブデモ', ko: '라이브 데모', de: 'Live-Demos', fr: 'Démos en direct', es: 'Demos en vivo', pt: 'Demos ao vivo' } as Localized<string>,
  metersLabel: { zh: '本场结果', en: 'This session', ja: '今回の結果', ko: '이번 세션 결과', de: 'Diese Sitzung', fr: 'Cette session', es: 'Esta sesión', pt: 'Esta sessão' } as Localized<string>,
  played: { zh: '本场已测', en: 'Played', ja: '実行済み', ko: '실행함', de: 'Gespielt', fr: 'Jouées', es: 'Jugadas', pt: 'Jogadas' } as Localized<string>,
  hits: { zh: '命中', en: 'hits', ja: '的中', ko: '적중', de: 'Treffer', fr: 'touches', es: 'aciertos', pt: 'acertos' } as Localized<string>,
  agree: { zh: '选择一致', en: 'Agree', ja: '選択一致', ko: '선택 일치', de: 'Übereinstimmung', fr: 'Accord', es: 'Coinciden', pt: 'Concordam' } as Localized<string>,
  railLabel: { zh: '测试分类', en: 'Test categories', ja: 'テスト分類', ko: '테스트 범주', de: 'Testkategorien', fr: 'Catégories de test', es: 'Categorías de prueba', pt: 'Categorias de teste' } as Localized<string>,
};

export const sceneRow = {
  title: { zh: '看见判断发生', en: 'Watch a judgment land', ja: '判定が下るのを見る', ko: '판정이 일어나는 것을 보기', de: 'Ein Urteil landen sehen', fr: 'Voir un jugement arriver', es: 'Ver cómo llega un juicio', pt: 'Ver um julgamento acontecer' } as Localized<string>,
  lead: {
    zh: '俄罗斯方块、六题连判、分拣。代码就在旁边，复制后用本站再跑一次。',
    en: 'Tetris, six rapid judgments, and a sort. The call sits beside the stage. Copy it and run it here again.',
    ja: 'テトリス、6 問の連続判定、仕分け。コードはすぐ横にあります。コピーして当サイトでもう一度実行してください。',
    ko: '테트리스, 6문항 연속 판정, 분류. 코드가 바로 옆에 있습니다. 복사해서 이 사이트에서 다시 실행하세요.',
    de: 'Tetris, sechs schnelle Urteile und eine Sortierung. Der Aufruf steht neben der Bühne. Kopiere ihn und führe ihn hier erneut aus.',
    fr: "Tetris, six jugements rapides et un tri. L'appel se trouve à côté de la scène. Copiez-le et relancez-le ici.",
    es: 'Tetris, seis juicios rápidos y una clasificación. La llamada está junto al escenario. Cópiala y ejecútala aquí de nuevo.',
    pt: 'Tetris, seis julgamentos rápidos e uma classificação. A chamada fica ao lado do palco. Copie e execute aqui de novo.',
  } as Localized<string>,
  cards: {
    tetris: { title: { zh: '俄罗斯方块', en: 'Tetris', ja: 'テトリス', ko: '테트리스', de: 'Tetris', fr: 'Tetris', es: 'Tetris', pt: 'Tetris' } as Localized<string>,
      desc: { zh: '两格横条该落在哪一列。落对了，格子会亮。', en: 'Where a two-cell bar should land. A correct column lights up.', ja: '2 マスのバーをどの列に落とすか。正しく落ちるとマスが光ります。', ko: '두 칸 막대가 어느 열에 떨어져야 하는지. 맞게 떨어지면 칸이 빛납니다.', de: 'In welche Spalte ein Zwei-Zellen-Balken gehört. Bei richtiger Spalte leuchtet das Feld.', fr: 'Où une barre de deux cases doit tomber. La bonne colonne s\'illumine.', es: 'Dónde debe caer una barra de dos celdas. La columna correcta se ilumina.', pt: 'Onde uma barra de duas células deve cair. A coluna certa acende.' } as Localized<string> },
    rapid: { title: { zh: '快速判断', en: 'Rapid judgments', ja: '高速判定', ko: '빠른 판정', de: 'Schnelle Urteile', fr: 'Jugements rapides', es: 'Juicios rápidos', pt: 'Julgamentos rápidos' } as Localized<string>,
      desc: { zh: '六条消息一次送出，回来就盖上是或否。', en: 'Six messages in one call. Each comes back yes or no.', ja: '6 件のメッセージを一度に送信。それぞれがはい／いいえで返ります。', ko: '여섯 메시지를 한 번에 보냅니다. 각각 예 또는 아니오로 돌아옵니다.', de: 'Sechs Nachrichten in einem Aufruf. Jede kommt als Ja oder Nein zurück.', fr: 'Six messages en un appel. Chacun revient par oui ou non.', es: 'Seis mensajes en una llamada. Cada uno vuelve como sí o no.', pt: 'Seis mensagens em uma chamada. Cada uma volta como sim ou não.' } as Localized<string> },
    sort: { title: { zh: '分拣', en: 'Sort', ja: '仕分け', ko: '분류', de: 'Sortieren', fr: 'Trier', es: 'Clasificar', pt: 'Classificar' } as Localized<string>,
      desc: { zh: '六件事滑进账单、技术、销售或隐私。', en: 'Six notes slide into billing, technical, sales, or privacy.', ja: '6 件のメモが請求・技術・営業・プライバシーに振り分けられます。', ko: '여섯 건의 메모가 청구, 기술, 영업, 개인정보로 나뉩니다.', de: 'Sechs Notizen rutschen in Abrechnung, Technik, Vertrieb oder Datenschutz.', fr: 'Six notes glissent vers facturation, technique, ventes ou confidentialité.', es: 'Seis notas se deslizan a facturación, técnico, ventas o privacidad.', pt: 'Seis notas deslizam para cobrança, técnico, vendas ou privacidade.' } as Localized<string> },
  },
};

export const library = {
  title: { zh: '页面是连着的', en: 'The pages connect', ja: 'ページはつながっています', ko: '페이지는 이어집니다', de: 'Die Seiten hängen zusammen', fr: 'Les pages se suivent', es: 'Las páginas se conectan', pt: 'As páginas se conectam' } as Localized<string>,
  faqTitle: { zh: '常见问题', en: 'Questions', ja: 'よくある質問', ko: '자주 묻는 질문', de: 'Fragen', fr: 'Questions', es: 'Preguntas', pt: 'Perguntas' } as Localized<string>,
  lead: {
    zh: '从<a href="/{lang}/scenes/">现场</a>看一次判定落地，从<a href="/{lang}/compare/">对比</a>看 clavue-jev 和 jev-1.13.0 的同一道题，从<a href="/{lang}/quickstart/">快速开始</a>进入写法，从<a href="/{lang}/cases/use-case-map/">能力地图</a>进入案例。计费写在<a href="/{lang}/pricing/">价格</a>，调用写在<a href="/{lang}/api/">API</a>。全部入口在<a href="/{lang}/map/">站内目录</a>。',
    en: 'Watch a call land on <a href="/{lang}/scenes/">live scenes</a>, see clavue-jev and jev-1.13.0 on the same item in <a href="/{lang}/compare/">compare</a>, then read the <a href="/{lang}/quickstart/">quick start</a> and the <a href="/{lang}/cases/use-case-map/">use-case map</a>. Rates are on <a href="/{lang}/pricing/">pricing</a>, the call shape is on the <a href="/{lang}/api/">API</a> page, and every entrance is on the <a href="/{lang}/map/">site directory</a>.',
    ja: '<a href="/{lang}/scenes/">ライブ</a>で判定が下る瞬間を見て、<a href="/{lang}/compare/">比較</a>で clavue-jev と jev-1.13.0 の同じ問題を見て、<a href="/{lang}/quickstart/">クイックスタート</a>で書き方を、<a href="/{lang}/cases/use-case-map/">ユースケースマップ</a>で事例に入れます。料金は<a href="/{lang}/pricing/">価格</a>、呼び出しは <a href="/{lang}/api/">API</a> に。すべての入口は<a href="/{lang}/map/">サイト内ディレクトリ</a>にあります。',
    ko: '<a href="/{lang}/scenes/">라이브</a>에서 판정이 내려지는 순간을 보고, <a href="/{lang}/compare/">비교</a>에서 clavue-jev와 jev-1.13.0의 같은 문제를 보고, <a href="/{lang}/quickstart/">빠른 시작</a>에서 작성법을, <a href="/{lang}/cases/use-case-map/">유스케이스 맵</a>에서 사례를 볼 수 있습니다. 요금은 <a href="/{lang}/pricing/">가격</a>에, 호출은 <a href="/{lang}/api/">API</a> 페이지에 있습니다. 모든 입구는 <a href="/{lang}/map/">사이트 디렉터리</a>에 있습니다.',
    de: 'Sieh auf den <a href="/{lang}/scenes/">Live-Szenen</a>, wie ein Aufruf landet, vergleiche in <a href="/{lang}/compare/">Vergleich</a> clavue-jev und jev-1.13.0 bei derselben Frage, lies den <a href="/{lang}/quickstart/">Schnellstart</a> und die <a href="/{lang}/cases/use-case-map/">Anwendungslandkarte</a>. Preise stehen unter <a href="/{lang}/pricing/">Preise</a>, die Aufrufform auf der <a href="/{lang}/api/">API</a>-Seite, und jeder Einstieg im <a href="/{lang}/map/">Site-Verzeichnis</a>.',
    fr: 'Regardez un appel arriver sur les <a href="/{lang}/scenes/">scènes en direct</a>, comparez clavue-jev et jev-1.13.0 sur la même question dans <a href="/{lang}/compare/">comparer</a>, puis lisez le <a href="/{lang}/quickstart/">démarrage rapide</a> et la <a href="/{lang}/cases/use-case-map/">carte des cas d\'usage</a>. Les tarifs sont sur <a href="/{lang}/pricing/">tarifs</a>, la forme de l\'appel sur la page <a href="/{lang}/api/">API</a>, et chaque entrée dans l\'<a href="/{lang}/map/">annuaire du site</a>.',
    es: 'Mira cómo llega una llamada en las <a href="/{lang}/scenes/">escenas en vivo</a>, compara clavue-jev y jev-1.13.0 en la misma pregunta en <a href="/{lang}/compare/">comparar</a>, y luego lee el <a href="/{lang}/quickstart/">inicio rápido</a> y el <a href="/{lang}/cases/use-case-map/">mapa de casos de uso</a>. Las tarifas están en <a href="/{lang}/pricing/">precios</a>, la forma de la llamada en la página de <a href="/{lang}/api/">API</a>, y cada entrada en el <a href="/{lang}/map/">directorio del sitio</a>.',
    pt: 'Veja uma chamada chegar nas <a href="/{lang}/scenes/">cenas ao vivo</a>, compare clavue-jev e jev-1.13.0 na mesma pergunta em <a href="/{lang}/compare/">comparar</a>, e leia o <a href="/{lang}/quickstart/">início rápido</a> e o <a href="/{lang}/cases/use-case-map/">mapa de casos de uso</a>. Os preços estão em <a href="/{lang}/pricing/">preços</a>, a forma da chamada na página de <a href="/{lang}/api/">API</a>, e cada entrada no <a href="/{lang}/map/">diretório do site</a>.',
  } as Localized<string>,
};

/** 首页客户端脚本文案（注入到 <script type="application/json"> 里）。 */
export const benchClient: Localized<Record<string, string>> = {
  zh: { waiting: '还没开跑。选定一道题，两边同时作答。', running: '两边正在看这道题…', hit: '命中', miss: '未中', none: '无答案', limit: '这一小时的对比次数用完了，过一会再测。', win: '这一题 clavue-jev 拿下了', bothFast: '两边都命中，clavue-jev 更快', both: '两边都命中', lose: '这一题 jev-1.13.0 命中', sameMiss: '两边选择一致，都没中', split: '两边都没中，选择也不一样', down: '两边都没有给出选择', batch: '这一类 {n} 题：clavue-jev 命中 {ours}，jev-1.13.0 命中 {peer}' },
  en: { waiting: 'Not run yet. Pick a question and both sides answer it.', running: 'Both sides are reading this question…', hit: 'Hit', miss: 'Miss', none: 'No answer', limit: 'Hourly compare limit reached. Wait and try again.', win: 'clavue-jev takes this one', bothFast: 'Both hit, and clavue-jev was faster', both: 'Both hit', lose: 'jev-1.13.0 hits this one', sameMiss: 'They agree, and both miss', split: 'Both miss, and they disagree', down: 'Neither side answered', batch: '{n} in this category: clavue-jev {ours}, jev-1.13.0 {peer}' },
  ja: { waiting: 'まだ実行していません。問題を選ぶと両側が同時に答えます。', running: '両側がこの問題を読んでいます…', hit: '的中', miss: '外れ', none: '回答なし', limit: '1 時間の比較上限に達しました。しばらくしてからお試しください。', win: 'この問題は clavue-jev が取りました', bothFast: '両方的中、clavue-jev がより速く', both: '両方的中', lose: 'この問題は jev-1.13.0 が的中', sameMiss: '選択は一致し、どちらも外れ', split: 'どちらも外れ、選択も不一致', down: 'どちらも選択を示しませんでした', batch: 'このカテゴリ {n} 問：clavue-jev 的中 {ours}、jev-1.13.0 的中 {peer}' },
  ko: { waiting: '아직 실행하지 않았습니다. 문제를 고르면 양쪽이 동시에 답합니다.', running: '양쪽이 이 문제를 읽는 중…', hit: '적중', miss: '실패', none: '답 없음', limit: '시간당 비교 한도에 도달했습니다. 잠시 후 다시 시도하세요.', win: '이 문제는 clavue-jev가 가져갔습니다', bothFast: '양쪽 적중, clavue-jev가 더 빠름', both: '양쪽 적중', lose: '이 문제는 jev-1.13.0이 적중', sameMiss: '선택은 같지만 둘 다 실패', split: '둘 다 실패, 선택도 다름', down: '어느 쪽도 선택을 내놓지 않음', batch: '이 범주 {n}문항: clavue-jev 적중 {ours}, jev-1.13.0 적중 {peer}' },
  de: { waiting: 'Noch nicht gestartet. Wähle eine Frage, und beide Seiten antworten.', running: 'Beide Seiten lesen diese Frage…', hit: 'Treffer', miss: 'Daneben', none: 'Keine Antwort', limit: 'Stündliches Vergleichslimit erreicht. Warte und versuche es erneut.', win: 'clavue-jev holt sich diese Frage', bothFast: 'Beide treffen, clavue-jev war schneller', both: 'Beide treffen', lose: 'jev-1.13.0 trifft diese Frage', sameMiss: 'Sie stimmen überein und treffen beide nicht', split: 'Beide verfehlen, und sie widersprechen sich', down: 'Keine Seite hat geantwortet', batch: '{n} in dieser Kategorie: clavue-jev {ours}, jev-1.13.0 {peer}' },
  fr: { waiting: "Pas encore lancé. Choisissez une question et les deux côtés répondent.", running: 'Les deux côtés lisent cette question…', hit: 'Touché', miss: 'Raté', none: 'Sans réponse', limit: 'Limite horaire de comparaison atteinte. Attendez et réessayez.', win: 'clavue-jev remporte celle-ci', bothFast: 'Les deux touchent, et clavue-jev était plus rapide', both: 'Les deux touchent', lose: 'jev-1.13.0 touche celle-ci', sameMiss: "Ils sont d'accord et ratent tous les deux", split: 'Les deux ratent, et ils divergent', down: "Aucun des deux n'a répondu", batch: '{n} dans cette catégorie : clavue-jev {ours}, jev-1.13.0 {peer}' },
  es: { waiting: 'Aún sin ejecutar. Elige una pregunta y ambos lados responden.', running: 'Ambos lados están leyendo esta pregunta…', hit: 'Acierto', miss: 'Fallo', none: 'Sin respuesta', limit: 'Se alcanzó el límite de comparaciones por hora. Espera e inténtalo de nuevo.', win: 'clavue-jev se lleva esta', bothFast: 'Ambos aciertan, y clavue-jev fue más rápido', both: 'Ambos aciertan', lose: 'jev-1.13.0 acierta esta', sameMiss: 'Coinciden y ambos fallan', split: 'Ambos fallan, y discrepan', down: 'Ninguno respondió', batch: '{n} en esta categoría: clavue-jev {ours}, jev-1.13.0 {peer}' },
  pt: { waiting: 'Ainda não executado. Escolha uma pergunta e os dois lados respondem.', running: 'Os dois lados estão lendo esta pergunta…', hit: 'Acerto', miss: 'Erro', none: 'Sem resposta', limit: 'Limite horário de comparação atingido. Aguarde e tente de novo.', win: 'clavue-jev leva esta', bothFast: 'Os dois acertam, e clavue-jev foi mais rápido', both: 'Os dois acertam', lose: 'jev-1.13.0 acerta esta', sameMiss: 'Concordam e os dois erram', split: 'Os dois erram, e divergem', down: 'Nenhum lado respondeu', batch: '{n} nesta categoria: clavue-jev {ours}, jev-1.13.0 {peer}' },
};
