import type { Localized } from '../ui';

export const title: Localized<string> = {
  zh: 'clavue-jev 与 jev-1.13.0',
  en: 'clavue-jev and jev-1.13.0',
  ja: 'clavue-jev と jev-1.13.0',
  ko: 'clavue-jev와 jev-1.13.0',
  de: 'clavue-jev und jev-1.13.0',
  fr: 'clavue-jev et jev-1.13.0',
  es: 'clavue-jev y jev-1.13.0',
  pt: 'clavue-jev e jev-1.13.0',
};

export const description: Localized<string> = {
  zh: 'JevCode 只提供 clavue-jev 的判定。这里用同一道选择题对比 clavue-jev 和 jev-1.13.0，每次结果会记下来，写在旁白里。',
  en: 'JevCode serves clavue-jev. The same choice question is sent to clavue-jev and jev-1.13.0, and every result is kept as narration.',
  ja: 'JevCode が提供するのは clavue-jev の判定のみです。ここでは同じ選択問題を clavue-jev と jev-1.13.0 に送り、結果はすべてナレーションに記録します。',
  ko: 'JevCode는 clavue-jev의 판정만 제공합니다. 여기서는 같은 선택 문제를 clavue-jev와 jev-1.13.0에 보내고, 결과는 모두 나레이션에 기록합니다.',
  de: 'JevCode bietet nur Urteile von clavue-jev. Hier geht dieselbe Auswahlfrage an clavue-jev und jev-1.13.0; jedes Ergebnis bleibt als Erzählung erhalten.',
  fr: 'JevCode ne sert que les jugements de clavue-jev. Ici, la même question à choix est envoyée à clavue-jev et à jev-1.13.0, et chaque résultat est conservé dans la narration.',
  es: 'JevCode solo sirve los juicios de clavue-jev. Aquí la misma pregunta de opción se envía a clavue-jev y a jev-1.13.0, y cada resultado se guarda como narración.',
  pt: 'O JevCode serve apenas os julgamentos do clavue-jev. Aqui a mesma pergunta de escolha vai para clavue-jev e jev-1.13.0, e cada resultado fica guardado como narração.',
};

export const eyebrow: Localized<string> = {
  zh: '实时对比', en: 'Live compare', ja: 'リアルタイム比較', ko: '실시간 비교', de: 'Live-Vergleich', fr: 'Comparaison en direct', es: 'Comparación en vivo', pt: 'Comparação ao vivo',
};

export const narration: Localized<string> = {
  zh: '旁白', en: 'Narration', ja: 'ナレーション', ko: '나레이션', de: 'Erzählung', fr: 'Narration', es: 'Narración', pt: 'Narração',
};

/** 含插值 {n} 与 {batch} */
export const note: Localized<string> = {
  zh: '题库 {n} 道，全部是选择题，有标准答案。左边是 clavue-jev，右边是 jev-1.13.0。跑过的题会留在旁白里。每小时每 IP 最多 {batch} 次批量请求。',
  en: '{n} choice questions, each with an expected answer. Left is clavue-jev, right is jev-1.13.0. Finished runs stay in the narration. {batch} batch requests per IP per hour.',
  ja: '全問 {n} 問の選択問題で、正解があります。左が clavue-jev、右が jev-1.13.0。実行済みの問題はナレーションに残ります。IP あたり 1 時間 {batch} 回のバッチリクエストまで。',
  ko: '전부 {n}문항의 선택 문제이며 정답이 있습니다. 왼쪽이 clavue-jev, 오른쪽이 jev-1.13.0입니다. 실행한 문제는 나레이션에 남습니다. IP당 시간당 배치 요청 {batch}회까지.',
  de: '{n} Auswahlfragen, jede mit einer erwarteten Antwort. Links clavue-jev, rechts jev-1.13.0. Abgeschlossene Läufe bleiben in der Erzählung. {batch} Batch-Anfragen pro IP und Stunde.',
  fr: '{n} questions à choix, chacune avec une réponse attendue. À gauche clavue-jev, à droite jev-1.13.0. Les exécutions terminées restent dans la narration. {batch} requêtes par lot et par IP et par heure.',
  es: '{n} preguntas de opción, cada una con una respuesta esperada. A la izquierda clavue-jev, a la derecha jev-1.13.0. Las ejecuciones terminadas quedan en la narración. {batch} solicitudes por lote y por IP y hora.',
  pt: '{n} perguntas de escolha, cada uma com uma resposta esperada. À esquerda clavue-jev, à direita jev-1.13.0. As execuções concluídas ficam na narração. {batch} requisições em lote por IP por hora.',
};

export const matchTitle: Localized<string> = {
  zh: '消消乐：亲自看一步有多快', en: 'Match-3: time one move', ja: 'マッチ3：一手の速さを見る', ko: '매치3: 한 수의 속도를 보기', de: 'Match-3: einen Zug messen', fr: 'Match-3 : chronométrer un coup', es: 'Match-3: mide un movimiento', pt: 'Match-3: cronometre um movimento',
};

export const matchLead: Localized<string> = {
  zh: '盘面没有现成三连。两边各自选一步相邻交换。点「再测一次」会换一盘再打。',
  en: 'The board has no match yet. Each side picks one adjacent swap. Retest deals a new board.',
  ja: '盤面に既存の 3 連はありません。両側がそれぞれ隣接する 1 手を選びます。「もう一度」で新しい盤面になります。',
  ko: '판에는 이미 만들어진 3연결이 없습니다. 양쪽이 각각 인접한 한 수를 고릅니다. "다시 테스트"를 누르면 새 판이 나옵니다.',
  de: 'Das Brett hat noch keine Reihe. Jede Seite wählt einen benachbarten Tausch. Ein erneuter Test gibt ein neues Brett.',
  fr: 'Le plateau n\'a pas encore d\'alignement. Chaque côté choisit un échange adjacent. Relancer distribue un nouveau plateau.',
  es: 'El tablero aún no tiene trío. Cada lado elige un intercambio adyacente. Reintentar reparte un tablero nuevo.',
  pt: 'O tabuleiro ainda não tem trinca. Cada lado escolhe uma troca adjacente. Reexecutar distribui um tabuleiro novo.',
};

export const askBoth: Localized<string> = {
  zh: '双方一起走一步', en: 'Ask both', ja: '両方に一手を聞く', ko: '양쪽에 한 수 묻기', de: 'Beide fragen', fr: 'Demander aux deux', es: 'Preguntar a ambos', pt: 'Perguntar aos dois',
};

export const newBoard: Localized<string> = {
  zh: '换一盘', en: 'New board', ja: '新しい盤面', ko: '새 판', de: 'Neues Brett', fr: 'Nouveau plateau', es: 'Nuevo tablero', pt: 'Novo tabuleiro',
};

export const all: Localized<string> = {
  zh: '全部', en: 'All', ja: 'すべて', ko: '전체', de: 'Alle', fr: 'Tout', es: 'Todo', pt: 'Tudo',
};

export const filterAll: Localized<string> = {
  zh: '全部', en: 'All', ja: 'すべて', ko: '전체', de: 'Alle', fr: 'Tout', es: 'Todo', pt: 'Tudo',
};

export const runUntested: Localized<string> = {
  zh: '跑未测的 {n} 题', en: 'Run {n} untested', ja: '未実行の {n} 問を実行', ko: '미실행 {n}문항 실행', de: '{n} ungetestete ausführen', fr: 'Lancer {n} non testées', es: 'Ejecutar {n} sin probar', pt: 'Executar {n} não testadas',
};

export const retestFilter: Localized<string> = {
  zh: '复测当前筛选', en: 'Retest this filter', ja: '現在の絞り込みを再実行', ko: '현재 필터 재실행', de: 'Diesen Filter erneut testen', fr: 'Retester ce filtre', es: 'Reintentar este filtro', pt: 'Retestar este filtro',
};

export const clearScores: Localized<string> = {
  zh: '清空成绩', en: 'Clear scores', ja: '成績を消去', ko: '점수 지우기', de: 'Ergebnisse löschen', fr: 'Effacer les scores', es: 'Borrar puntuaciones', pt: 'Limpar pontuações',
};

/** 客户端脚本文案 */
export const client: Localized<Record<string, unknown>> = {
  zh: {
    pending: '还没跑', running: '正在打两边…', hit: '命中', miss: '未中', agree: '一致', error: '失败',
    limit: '这一小时的对比次数用完了，过一会再复测。', empty: '这一类还没有成绩。',
    summaryTpl: 'clavue-jev 命中 {oursHit}/{oursN}，jev-1.13.0 命中 {offHit}/{offN}，两边一致 {agree}/{agreeN}。clavue-jev 中位 {oursMedian} ms，jev-1.13.0 中位 {offMedian} ms。clavue-jev 的 ms 是这一批（最多 8 题）的总时间，jev-1.13.0 是单题时间。',
    win: '这一题 clavue-jev 拿下了', bothFast: '两边都命中，clavue-jev 更快', both: '两边都命中',
    lose: '这一题 jev-1.13.0 命中', sameMiss: '两边选择一致，都没中', split: '两边都没中，选择也不一样',
    expected: '标准答案', retest: '复测这一题', noRecords: '还没有记录。跑一题之后，旁白会写在这里。',
  },
  en: {
    pending: 'Not run', running: 'Asking both…', hit: 'Hit', miss: 'Miss', agree: 'Agree', error: 'Failed',
    limit: 'Hourly compare limit reached. Wait and retest.', empty: 'No scores in this filter yet.',
    summaryTpl: 'clavue-jev {oursHit}/{oursN}, jev-1.13.0 {offHit}/{offN}, agree {agree}/{agreeN}. Median {oursMedian} ms vs {offMedian} ms. clavue-jev ms is the whole batch (up to 8); jev-1.13.0 is per question.',
    win: 'clavue-jev takes this one', bothFast: 'Both hit, and clavue-jev was faster', both: 'Both hit',
    lose: 'jev-1.13.0 hits this one', sameMiss: 'They agree, and both miss', split: 'Both miss, and they disagree',
    expected: 'Expected', retest: 'Retest', noRecords: 'No results yet. Run a question and the narration will land here.',
  },
  ja: {
    pending: '未実行', running: '両側に問い合わせ中…', hit: '的中', miss: '外れ', agree: '一致', error: '失敗',
    limit: '1 時間の比較上限に達しました。しばらくしてから再実行してください。', empty: 'この分類にはまだ成績がありません。',
    summaryTpl: 'clavue-jev {oursHit}/{oursN} 的中、jev-1.13.0 {offHit}/{offN} 的中、一致 {agree}/{agreeN}。中央値 clavue-jev {oursMedian} ms、jev-1.13.0 {offMedian} ms。clavue-jev の ms はこのバッチ（最大 8 問）の合計時間、jev-1.13.0 は 1 問あたりの時間です。',
    win: 'この問題は clavue-jev が取りました', bothFast: '両方的中、clavue-jev がより速く', both: '両方的中',
    lose: 'この問題は jev-1.13.0 が的中', sameMiss: '選択は一致し、どちらも外れ', split: 'どちらも外れ、選択も不一致',
    expected: '正解', retest: 'この問題を再実行', noRecords: 'まだ記録がありません。問題を実行すると、ナレーションがここに書かれます。',
  },
  ko: {
    pending: '미실행', running: '양쪽에 묻는 중…', hit: '적중', miss: '실패', agree: '일치', error: '실패',
    limit: '시간당 비교 한도에 도달했습니다. 잠시 후 다시 테스트하세요.', empty: '이 분류에는 아직 점수가 없습니다.',
    summaryTpl: 'clavue-jev {oursHit}/{oursN} 적중, jev-1.13.0 {offHit}/{offN} 적중, 일치 {agree}/{agreeN}. 중앙값 clavue-jev {oursMedian} ms, jev-1.13.0 {offMedian} ms. clavue-jev의 ms는 이 배치(최대 8문항) 총 시간이고, jev-1.13.0은 문항당 시간입니다.',
    win: '이 문제는 clavue-jev가 가져갔습니다', bothFast: '양쪽 적중, clavue-jev가 더 빠름', both: '양쪽 적중',
    lose: '이 문제는 jev-1.13.0이 적중', sameMiss: '선택은 같지만 둘 다 실패', split: '둘 다 실패, 선택도 다름',
    expected: '정답', retest: '이 문제 재실행', noRecords: '아직 기록이 없습니다. 문제를 실행하면 나레이션이 여기에 기록됩니다.',
  },
  de: {
    pending: 'Nicht ausgeführt', running: 'Beide werden gefragt…', hit: 'Treffer', miss: 'Daneben', agree: 'Übereinstimmung', error: 'Fehlgeschlagen',
    limit: 'Stündliches Vergleichslimit erreicht. Warte und teste erneut.', empty: 'In diesem Filter liegen noch keine Ergebnisse.',
    summaryTpl: 'clavue-jev {oursHit}/{oursN}, jev-1.13.0 {offHit}/{offN}, Übereinstimmung {agree}/{agreeN}. Median {oursMedian} ms gegen {offMedian} ms. clavue-jev ms ist der ganze Batch (bis 8); jev-1.13.0 gilt pro Frage.',
    win: 'clavue-jev holt sich diese Frage', bothFast: 'Beide treffen, clavue-jev war schneller', both: 'Beide treffen',
    lose: 'jev-1.13.0 trifft diese Frage', sameMiss: 'Sie stimmen überein und treffen beide nicht', split: 'Beide verfehlen, und sie widersprechen sich',
    expected: 'Erwartet', retest: 'Erneut testen', noRecords: 'Noch keine Einträge. Führe eine Frage aus, und die Erzählung landet hier.',
  },
  fr: {
    pending: 'Non lancé', running: 'Demande aux deux…', hit: 'Touché', miss: 'Raté', agree: 'Accord', error: 'Échec',
    limit: 'Limite horaire de comparaison atteinte. Attendez et retestez.', empty: 'Aucun score dans ce filtre pour le moment.',
    summaryTpl: 'clavue-jev {oursHit}/{oursN}, jev-1.13.0 {offHit}/{offN}, accord {agree}/{agreeN}. Médiane {oursMedian} ms contre {offMedian} ms. Les ms de clavue-jev couvrent tout le lot (jusqu\'à 8) ; jev-1.13.0 est par question.',
    win: 'clavue-jev remporte celle-ci', bothFast: 'Les deux touchent, et clavue-jev était plus rapide', both: 'Les deux touchent',
    lose: 'jev-1.13.0 touche celle-ci', sameMiss: 'Ils sont d\'accord et ratent tous les deux', split: 'Les deux ratent, et ils divergent',
    expected: 'Attendu', retest: 'Retester', noRecords: 'Aucun résultat pour l\'instant. Lancez une question et la narration apparaîtra ici.',
  },
  es: {
    pending: 'Sin ejecutar', running: 'Preguntando a ambos…', hit: 'Acierto', miss: 'Fallo', agree: 'Coinciden', error: 'Falló',
    limit: 'Se alcanzó el límite de comparaciones por hora. Espera y reintenta.', empty: 'Aún no hay puntuaciones en este filtro.',
    summaryTpl: 'clavue-jev {oursHit}/{oursN}, jev-1.13.0 {offHit}/{offN}, coinciden {agree}/{agreeN}. Mediana {oursMedian} ms frente a {offMedian} ms. Los ms de clavue-jev son todo el lote (hasta 8); los de jev-1.13.0 son por pregunta.',
    win: 'clavue-jev se lleva esta', bothFast: 'Ambos aciertan, y clavue-jev fue más rápido', both: 'Ambos aciertan',
    lose: 'jev-1.13.0 acierta esta', sameMiss: 'Coinciden y ambos fallan', split: 'Ambos fallan, y discrepan',
    expected: 'Esperada', retest: 'Reintentar', noRecords: 'Aún no hay resultados. Ejecuta una pregunta y la narración aparecerá aquí.',
  },
  pt: {
    pending: 'Não executado', running: 'Perguntando aos dois…', hit: 'Acerto', miss: 'Erro', agree: 'Concordam', error: 'Falhou',
    limit: 'Limite horário de comparação atingido. Aguarde e reteste.', empty: 'Ainda sem pontuações neste filtro.',
    summaryTpl: 'clavue-jev {oursHit}/{oursN}, jev-1.13.0 {offHit}/{offN}, concordam {agree}/{agreeN}. Mediana {oursMedian} ms contra {offMedian} ms. Os ms do clavue-jev são o lote inteiro (até 8); os do jev-1.13.0 são por pergunta.',
    win: 'clavue-jev leva esta', bothFast: 'Os dois acertam, e clavue-jev foi mais rápido', both: 'Os dois acertam',
    lose: 'jev-1.13.0 acerta esta', sameMiss: 'Concordam e os dois erram', split: 'Os dois erram, e divergem',
    expected: 'Esperada', retest: 'Retestar', noRecords: 'Ainda sem resultados. Execute uma pergunta e a narração aparecerá aqui.',
  },
};
