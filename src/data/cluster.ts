import type { Lang, Localized } from '../i18n/ui';
import { pick } from '../i18n/ui';

export type ClusterCopy = Localized<string>;

export type ClusterItem = {
  href: string;
  title: ClusterCopy;
  desc: ClusterCopy;
};

export type ClusterGroup = {
  id: string;
  title: ClusterCopy;
  items: ClusterItem[];
};

export function clusterText(lang: Lang, copy: ClusterCopy): string {
  return pick(lang, copy);
}

const T = (
  zh: string, en: string, ja: string, ko: string, de: string, fr: string, es: string, pt: string,
): ClusterCopy => ({ zh, en, ja, ko, de, fr, es, pt });

/** 站内可互相走到的页面。href 不含语言前缀。 */
export const clusterGroups: ClusterGroup[] = [
  {
    id: 'use',
    title: T('使用 clavue-jev', 'Use clavue-jev', 'clavue-jev を使う', 'clavue-jev 사용하기', 'clavue-jev nutzen', 'Utiliser clavue-jev', 'Usar clavue-jev', 'Usar o clavue-jev'),
    items: [
      { href: '/try/', title: T('试一次判定', 'Try a judgment', '判定を試す', '판정 시도', 'Ein Urteil versuchen', 'Essayer un jugement', 'Probar un juicio', 'Tentar um julgamento'),
        desc: T('写一段状态，当场看返回。', 'Send a state and read the answer.', '状態を書いて、その場で返り値を見る。', '상태를 적고 즉시 반환을 확인.', 'Schreibe einen Zustand und lies die Antwort.', 'Écrivez un état et lisez la réponse.', 'Escribe un estado y lee la respuesta.', 'Escreva um estado e leia a resposta.') },
      { href: '/scenes/', title: T('现场', 'Live scenes', 'ライブ', '라이브', 'Live', 'Scènes en direct', 'Escenas en vivo', 'Cenas ao vivo'),
        desc: T('俄罗斯方块、六题连判、分拣。代码可以复制后再跑。', 'Tetris, six rapid judgments, and a sort. Copy the call and run it again.', 'テトリス、6 問の連続判定、仕分け。呼び出しをコピーして再実行できます。', '테트리스, 6문항 연속 판정, 분류. 호출을 복사해 다시 실행하세요.', 'Tetris, sechs schnelle Urteile und eine Sortierung. Kopiere den Aufruf und führe ihn erneut aus.', 'Tetris, six jugements rapides et un tri. Copiez l\'appel et relancez-le.', 'Tetris, seis juicios rápidos y una clasificación. Copia la llamada y ejecútala de nuevo.', 'Tetris, seis julgamentos rápidos e uma classificação. Copie a chamada e execute de novo.') },
      { href: '/compare/', title: T('对比', 'Compare', '比較', '비교', 'Vergleich', 'Comparer', 'Comparar', 'Comparar'),
        desc: T('同一道题，clavue-jev 与 jev-1.13.0 同时作答。', 'clavue-jev and jev-1.13.0 answer the same question.', '同じ問題に clavue-jev と jev-1.13.0 が同時に答えます。', '같은 문제에 clavue-jev와 jev-1.13.0이 함께 답합니다.', 'clavue-jev und jev-1.13.0 beantworten dieselbe Frage.', 'clavue-jev et jev-1.13.0 répondent à la même question.', 'clavue-jev y jev-1.13.0 responden a la misma pregunta.', 'clavue-jev e jev-1.13.0 respondem à mesma pergunta.') },
      { href: '/playground/', title: T('示例', 'Demos', 'デモ', '데모', 'Demos', 'Démos', 'Demos', 'Demos'),
        desc: T('可以改题面的判定例子。', 'Judgment examples you can edit.', '問題を書き換えられる判定例。', '문제를 바꿀 수 있는 판정 예시.', 'Urteil-Beispiele, die du bearbeiten kannst.', 'Des exemples de jugement que vous pouvez modifier.', 'Ejemplos de juicio que puedes editar.', 'Exemplos de julgamento que você pode editar.') },
      { href: '/pricing/', title: T('价格', 'Pricing', '価格', '가격', 'Preise', 'Tarifs', 'Precios', 'Preços'),
        desc: T('输入 $0.042 / 百万 token，输出免费。', 'Input is $0.042 per million tokens. Output is free.', '入力は 100 万トークンあたり $0.042、出力は無料。', '입력은 백만 토큰당 $0.042, 출력은 무료.', 'Eingabe kostet $0.042 pro Million Token. Ausgabe ist kostenlos.', 'L\'entrée est à 0,042 $ par million de tokens. La sortie est gratuite.', 'La entrada cuesta $0.042 por millón de tokens. La salida es gratis.', 'A entrada custa $0.042 por milhão de tokens. A saída é grátis.') },
      { href: '/api/', title: T('API', 'API', 'API', 'API', 'API', 'API', 'API', 'API'),
        desc: T('用 Key 调用 POST /v1/judge。', 'Call POST /v1/judge with a key.', 'Key で POST /v1/judge を呼び出す。', 'Key로 POST /v1/judge를 호출합니다.', 'Rufe POST /v1/judge mit einem Key auf.', 'Appelez POST /v1/judge avec une clé.', 'Llama a POST /v1/judge con una clave.', 'Chame POST /v1/judge com uma chave.') },
    ],
  },
  {
    id: 'learn',
    title: T('文档', 'Docs', 'ドキュメント', '문서', 'Doku', 'Documentation', 'Documentación', 'Documentação'),
    items: [
      { href: '/introduction/', title: T('介绍', 'Introduction', '紹介', '소개', 'Einführung', 'Introduction', 'Introducción', 'Introdução'),
        desc: T('这个模型解决什么问题。', 'What this model is for.', 'このモデルが何を解くのか。', '이 모델이 무엇을 푸는지.', 'Wofür dieses Modell da ist.', 'À quoi sert ce modèle.', 'Para qué sirve este modelo.', 'Para que serve este modelo.') },
      { href: '/quickstart/', title: T('快速开始', 'Quick start', 'クイックスタート', '빠른 시작', 'Schnellstart', 'Démarrage rapide', 'Inicio rápido', 'Início rápido'),
        desc: T('一次调用就能跑通的最小例子。', 'The smallest call that runs.', '1 回の呼び出しで動く最小例。', '한 번의 호출로 실행되는 최소 예시.', 'Das kleinste lauffähige Beispiel.', 'Le plus petit appel qui fonctionne.', 'La llamada mínima que funciona.', 'A menor chamada que funciona.') },
      { href: '/concepts/system-one/', title: T('System One', 'System One', 'System One', 'System One', 'System One', 'System One', 'System One', 'System One'),
        desc: T('JevCode 自己写的概念：状态加一个类型化问题，模型是 clavue-jev。', 'Written here: a state plus one typed question. The model is clavue-jev.', '当サイトが書いた概念：状態に型付きの質問を 1 つ。モデルは clavue-jev。', '이 사이트가 쓴 개념: 상태에 타입이 있는 질문 하나. 모델은 clavue-jev.', 'Hier geschrieben: ein Zustand plus eine typisierte Frage. Das Modell ist clavue-jev.', 'Écrit ici : un état plus une question typée. Le modèle est clavue-jev.', 'Escrito aquí: un estado más una pregunta tipada. El modelo es clavue-jev.', 'Escrito aqui: um estado mais uma pergunta tipada. O modelo é clavue-jev.') },
      { href: '/concepts/state/', title: T('State', 'State', '状態', '상태', 'Zustand', 'État', 'Estado', 'Estado'),
        desc: T('送进判定的那段文本。', 'The text you send in.', '判定に送るテキスト。', '판정에 보내는 텍스트.', 'Der Text, den du sendest.', 'Le texte que vous envoyez.', 'El texto que envías.', 'O texto que você envia.') },
      { href: '/concepts/confidence/', title: T('置信度', 'Confidence', '信頼度', '신뢰도', 'Konfidenz', 'Confiance', 'Confianza', 'Confiança'),
        desc: T('返回里的把握，用来决定要不要自动执行。', 'How sure the answer is, and when to act on it.', '返り値の確かさ。自動実行の可否を決めるのに使う。', '반환의 확실성. 자동 실행 여부를 정할 때 씁니다.', 'Wie sicher die Antwort ist und wann man darauf handelt.', 'À quel point la réponse est sûre, et quand agir.', 'Cuán segura es la respuesta, y cuándo actuar.', 'Quão segura é a resposta, e quando agir.') },
      { href: '/primitives/choice/', title: T('Choice', 'Choice', 'Choice', 'Choice', 'Choice', 'Choice', 'Choice', 'Choice'),
        desc: T('在互斥选项里选一个。', 'Pick one mutually exclusive option.', '排他的な選択肢から 1 つ選ぶ。', '상호 배타적인 선택지에서 하나를 고름.', 'Wähle eine von mehreren sich ausschließenden Optionen.', 'Choisir une option mutuellement exclusive.', 'Elegir una opción mutuamente excluyente.', 'Escolher uma opção mutuamente exclusiva.') },
      { href: '/primitives/noul/', title: T('Noul', 'Noul', 'Noul', 'Noul', 'Noul', 'Noul', 'Noul', 'Noul'),
        desc: T('一个是/否问题，返回「是」的概率。', 'A yes/no question, returned as the probability of yes.', 'はい／いいえの質問。はいの確率として返る。', "예/아니오 질문으로, '예'의 확률로 반환됩니다.", 'Eine Ja/Nein-Frage, zurückgegeben als Wahrscheinlichkeit für Ja.', 'Une question oui/non, renvoyée comme probabilité de oui.', 'Una pregunta de sí/no, devuelta como probabilidad de sí.', 'Uma pergunta sim/não, retornada como probabilidade de sim.') },
      { href: '/primitives/score/', title: T('Score', 'Score', 'Score', 'Score', 'Score', 'Score', 'Score', 'Score'),
        desc: T('沿一把尺子打分。', 'Rate along a scale.', '尺度に沿って点数を付ける。', '척도를 따라 점수를 매김.', 'Entlang einer Skala bewerten.', 'Noter sur une échelle.', 'Puntuar en una escala.', 'Pontuar numa escala.') },
      { href: '/patterns/intent-routing/', title: T('意图路由', 'Intent routing', '意図ルーティング', '의도 라우팅', 'Absichts-Routing', "Routage d'intention", 'Enrutamiento de intención', 'Roteamento de intenção'),
        desc: T('一次 Choice 把请求分到下游。', 'One Choice call dispatches the request.', 'Choice 1 回でリクエストを下流へ振り分ける。', 'Choice 한 번으로 요청을 하위로 보냅니다.', 'Ein Choice-Aufruf leitet die Anfrage weiter.', 'Un appel Choice achemine la requête.', 'Una llamada Choice despacha la solicitud.', 'Uma chamada Choice encaminha a requisição.') },
      { href: '/patterns/confidence-routing/', title: T('置信度路由', 'Confidence routing', '信頼度ルーティング', '신뢰도 라우팅', 'Konfidenz-Routing', 'Routage par confiance', 'Enrutamiento por confianza', 'Roteamento por confiança'),
        desc: T('高置信度自动做，低置信度转人。', 'Act when confidence is high. Hand off when it is low.', '信頼度が高ければ自動実行、低ければ人へ。', '신뢰도가 높으면 자동 실행, 낮으면 사람에게.', 'Bei hoher Konfidenz handeln, bei niedriger übergeben.', 'Agir si la confiance est haute, passer la main sinon.', 'Actuar si la confianza es alta; derivar si es baja.', 'Agir se a confiança for alta; repassar se for baixa.') },
      { href: '/patterns/fan-out/', title: T('扇出', 'Fan-out', 'ファンアウト', '팬아웃', 'Fan-out', 'Fan-out', 'Fan-out', 'Fan-out'),
        desc: T('一道状态上同时问多个问题。', 'Ask several questions of one state.', '1 つの状態に複数の質問を同時に投げる。', '하나의 상태에 여러 질문을 동시에.', 'Mehrere Fragen zu einem Zustand.', 'Poser plusieurs questions sur un même état.', 'Hacer varias preguntas a un estado.', 'Fazer várias perguntas a um estado.') },
      { href: '/patterns/composite-scoring/', title: T('组合评分', 'Composite scoring', '複合スコアリング', '복합 스코어링', 'Zusammengesetztes Scoring', 'Notation composite', 'Puntuación compuesta', 'Pontuação composta'),
        desc: T('把多把尺子合成一个排序。', 'Fold several scores into one ranking.', '複数のスコアを 1 つの順位にまとめる。', '여러 점수를 하나의 순위로 합칩니다.', 'Mehrere Scores zu einem Ranking verrechnen.', 'Combiner plusieurs scores en un classement.', 'Combinar varias puntuaciones en un ranking.', 'Combinar várias pontuações em um ranking.') },
      { href: '/sdk/http-api/', title: T('HTTP API', 'HTTP API', 'HTTP API', 'HTTP API', 'HTTP API', 'HTTP API', 'HTTP API', 'HTTP API'),
        desc: T('不装 SDK 时的请求形状。', 'The request shape without an SDK.', 'SDK を入れない場合のリクエスト形状。', 'SDK 없이 쓰는 요청 형태.', 'Die Anfrageform ohne SDK.', 'La forme de la requête sans SDK.', 'La forma de la solicitud sin SDK.', 'A forma da requisição sem SDK.') },
      { href: '/sdk/python/', title: T('Python SDK', 'Python SDK', 'Python SDK', 'Python SDK', 'Python SDK', 'SDK Python', 'SDK de Python', 'SDK Python'),
        desc: T('在 Python 里发起判定。', 'Call a judgment from Python.', 'Python から判定を呼ぶ。', 'Python에서 판정을 호출합니다.', 'Ein Urteil aus Python aufrufen.', 'Lancer un jugement depuis Python.', 'Llamar a un juicio desde Python.', 'Chamar um julgamento do Python.') },
      { href: '/sdk/javascript/', title: T('JavaScript SDK', 'JavaScript SDK', 'JavaScript SDK', 'JavaScript SDK', 'JavaScript SDK', 'SDK JavaScript', 'SDK de JavaScript', 'SDK JavaScript'),
        desc: T('在 JavaScript 里发起判定。', 'Call a judgment from JavaScript.', 'JavaScript から判定を呼ぶ。', 'JavaScript에서 판정을 호출합니다.', 'Ein Urteil aus JavaScript aufrufen.', 'Lancer un jugement depuis JavaScript.', 'Llamar a un juicio desde JavaScript.', 'Chamar um julgamento do JavaScript.') },
    ],
  },
  {
    id: 'cases',
    title: T('案例', 'Cases', '事例', '사례', 'Fälle', 'Cas', 'Casos', 'Casos'),
    items: [
      { href: '/cases/use-case-map/', title: T('能力地图', 'Use-case map', 'ユースケースマップ', '유스케이스 맵', 'Anwendungslandkarte', "Carte des cas d'usage", 'Mapa de casos de uso', 'Mapa de casos de uso'),
        desc: T('按场景看别人用了哪类原语。', 'Which primitive people use for which job.', '場面ごとにどの原語が使われるか。', '상황별로 어떤 프리미티브를 쓰는지.', 'Welche Primitive wofür genutzt werden.', 'Quelle primitive pour quel usage.', 'Qué primitiva se usa para cada tarea.', 'Qual primitiva se usa para cada tarefa.') },
      { href: '/cases/llm-guardrails/', title: T('护栏', 'Guardrails', 'ガードレール', '가드레일', 'Leitplanken', 'Garde-fous', 'Barreras de seguridad', 'Guardrails'),
        desc: T('在动作发生前做一次是/否检查。', 'A yes/no check before an action runs.', '動作の前に 1 回のはい／いいえチェック。', '동작 전에 한 번의 예/아니오 검사.', 'Eine Ja/Nein-Prüfung, bevor eine Aktion läuft.', 'Une vérification oui/non avant une action.', 'Una comprobación sí/no antes de una acción.', 'Uma checagem sim/não antes de uma ação.') },
      { href: '/cases/function-calling/', title: T('函数调用', 'Function calling', '関数呼び出し', '함수 호출', 'Funktionsaufruf', 'Appel de fonction', 'Llamada a función', 'Chamada de função'),
        desc: T('用判定决定该调用哪一个函数。', 'Pick which function to call.', 'どの関数を呼ぶかを判定で決める。', '어떤 함수를 호출할지 판정으로 정합니다.', 'Per Urteil entscheiden, welche Funktion aufgerufen wird.', 'Décider par jugement quelle fonction appeler.', 'Decidir con un juicio qué función llamar.', 'Decidir por julgamento qual função chamar.') },
      { href: '/cases/classification-using-confidence/', title: T('按置信度分类', 'Classify with confidence', '信頼度つき分類', '신뢰도 기반 분류', 'Klassifizieren mit Konfidenz', 'Classer avec confiance', 'Clasificar con confianza', 'Classificar com confiança'),
        desc: T('分类结果不够有把握时不要硬做。', 'Do not act when the class is unsure.', '分類に自信がないときは無理に進めない。', '분류가 확실하지 않으면 억지로 하지 않습니다.', 'Nicht handeln, wenn die Klasse unsicher ist.', 'Ne rien faire si la classe est incertaine.', 'No actuar si la clase es dudosa.', 'Não agir quando a classe é incerta.') },
      { href: '/cases/semantic-find/', title: T('语义查找', 'Semantic find', 'セマンティック検索', '의미 기반 검색', 'Semantische Suche', 'Recherche sémantique', 'Búsqueda semántica', 'Busca semântica'),
        desc: T('在一堆文本里找出相关的那几段。', 'Find the passages that match.', 'たくさんのテキストから該当する箇所を見つける。', '많은 텍스트에서 관련된 구절을 찾습니다.', 'Die passenden Passagen finden.', 'Trouver les passages pertinents.', 'Encontrar los pasajes que coinciden.', 'Encontrar as passagens que combinam.') },
      { href: '/cases/parallel-questions/', title: T('并行问题', 'Parallel questions', '並列質問', '병렬 질문', 'Parallele Fragen', 'Questions parallèles', 'Preguntas paralelas', 'Perguntas paralelas'),
        desc: T('同一段状态一次问完。', 'Ask the whole set in one call.', '同じ状態にまとめて 1 回で問う。', '같은 상태에 한 번에 모두 묻습니다.', 'Den ganzen Satz in einem Aufruf fragen.', 'Poser toute la série en un appel.', 'Preguntar todo el conjunto en una llamada.', 'Perguntar todo o conjunto em uma chamada.') },
      { href: '/cases/hierarchical-classification/', title: T('层级分类', 'Hierarchical classification', '階層分類', '계층 분류', 'Hierarchische Klassifikation', 'Classification hiérarchique', 'Clasificación jerárquica', 'Classificação hierárquica'),
        desc: T('先分大类，再分小类。', 'Coarse class first, then the fine one.', 'まず大分類、次に小分類。', '먼저 대분류, 다음 소분류.', 'Erst grobe Klasse, dann die feine.', "D'abord la classe grossière, puis la fine.", 'Primero la clase gruesa, luego la fina.', 'Primeiro a classe grossa, depois a fina.') },
      { href: '/cases/citation-check/', title: T('引用核查', 'Citation check', '引用チェック', '인용 검사', 'Zitat-Prüfung', 'Vérification de citation', 'Verificación de citas', 'Verificação de citação'),
        desc: T('一句话有没有被给定材料支撑。', 'Whether a sentence is supported by the source.', '一文が与えられた資料に支えられているか。', '한 문장이 주어진 자료로 뒷받침되는지.', 'Ob ein Satz durch die Quelle gestützt wird.', 'Si une phrase est étayée par la source.', 'Si una frase está respaldada por la fuente.', 'Se uma frase é sustentada pela fonte.') },
      { href: '/cases/entity-alignment/', title: T('实体对齐', 'Entity alignment', 'エンティティ照合', '엔터티 정렬', 'Entitätsabgleich', "Alignement d'entités", 'Alineación de entidades', 'Alinhamento de entidades'),
        desc: T('两个名字是不是同一个东西。', 'Whether two names are the same thing.', '2 つの名前が同じものを指すか。', '두 이름이 같은 것인지.', 'Ob zwei Namen dasselbe bezeichnen.', 'Si deux noms désignent la même chose.', 'Si dos nombres son lo mismo.', 'Se dois nomes são a mesma coisa.') },
      { href: '/cases/skill-suggestion/', title: T('技能建议', 'Skill suggestion', 'スキル提案', '스킬 제안', 'Skill-Vorschlag', 'Suggestion de compétence', 'Sugerencia de habilidad', 'Sugestão de habilidade'),
        desc: T('从候选技能里挑现在该用的那个。', 'Choose which skill fits the moment.', '候補のスキルから今使うべきものを選ぶ。', '후보 스킬 중 지금 쓸 것을 고릅니다.', 'Aus den Kandidaten den passenden Skill wählen.', 'Choisir la compétence adaptée au moment.', 'Elegir la habilidad que encaja ahora.', 'Escolher a habilidade que cabe agora.') },
    ],
  },
  {
    id: 'site',
    title: T('本站其他入口', 'More on this site', 'このサイトの他の入口', '이 사이트의 다른 입구', 'Mehr auf dieser Site', 'Plus sur ce site', 'Más en este sitio', 'Mais neste site'),
    items: [
      { href: '/map/', title: T('站内目录', 'Site directory', 'サイト内ディレクトリ', '사이트 디렉터리', 'Site-Verzeichnis', 'Annuaire du site', 'Directorio del sitio', 'Diretório do site'),
        desc: T('上面这些页面的总表。', 'The full list of the pages above.', '上記ページの一覧。', '위 페이지들의 전체 목록.', 'Die vollständige Liste der Seiten oben.', 'La liste complète des pages ci-dessus.', 'La lista completa de las páginas anteriores.', 'A lista completa das páginas acima.') },
      { href: '/ecosystem/', title: T('生态目录', 'Ecosystem', 'エコシステム', '생태계', 'Ökosystem', 'Écosystème', 'Ecosistema', 'Ecossistema'),
        desc: T('社区项目按类别浏览。', 'Community projects by category.', 'コミュニティプロジェクトを分類別に。', '커뮤니티 프로젝트를 분류별로.', 'Community-Projekte nach Kategorie.', 'Projets communautaires par catégorie.', 'Proyectos de la comunidad por categoría.', 'Projetos da comunidade por categoria.') },
      { href: '/community/', title: T('社区', 'Community', 'コミュニティ', '커뮤니티', 'Community', 'Communauté', 'Comunidad', 'Comunidade'),
        desc: T('公开讨论，每条注明出处。', 'Public posts, each with its source.', '公開の議論。各項目に出典付き。', '공개 토론. 각 항목에 출처 표기.', 'Öffentliche Beiträge, jeder mit Quelle.', 'Des publications publiques, chacune avec sa source.', 'Publicaciones públicas, cada una con su fuente.', 'Publicações públicas, cada uma com sua fonte.') },
      { href: '/builds/', title: T('动态', 'Builds', '動き', '소식', 'Builds', 'Builds', 'Builds', 'Builds'),
        desc: T('模型与站点的更新记录。', 'Notes on model and site updates.', 'モデルとサイトの更新記録。', '모델과 사이트 업데이트 기록.', 'Notizen zu Modell- und Site-Updates.', 'Notes sur les mises à jour du modèle et du site.', 'Notas sobre las actualizaciones del modelo y del sitio.', 'Notas sobre as atualizações do modelo e do site.') },
      { href: '/primitives/', title: T('问题原语', 'Primitives', 'プリミティブ', '프리미티브', 'Primitive', 'Primitives', 'Primitivas', 'Primitivas'),
        desc: T('Choice、Noul、Score 的总页。', 'Choice, Noul, and Score together.', 'Choice、Noul、Score のまとめ。', 'Choice, Noul, Score 모음.', 'Choice, Noul und Score zusammen.', 'Choice, Noul et Score réunis.', 'Choice, Noul y Score juntos.', 'Choice, Noul e Score juntos.') },
      { href: '/patterns/', title: T('架构模式', 'Patterns', 'パターン', '패턴', 'Muster', 'Modèles', 'Patrones', 'Padrões'),
        desc: T('路由、扇出、组合评分。', 'Routing, fan-out, and composite scoring.', 'ルーティング、ファンアウト、複合スコアリング。', '라우팅, 팬아웃, 복합 스코어링.', 'Routing, Fan-out und zusammengesetztes Scoring.', 'Routage, fan-out et notation composite.', 'Enrutamiento, fan-out y puntuación compuesta.', 'Roteamento, fan-out e pontuação composta.') },
      { href: '/sdk/', title: T('SDK', 'SDKs', 'SDK', 'SDK', 'SDKs', 'SDK', 'SDK', 'SDK'),
        desc: T('HTTP、Python、JavaScript。', 'HTTP, Python, and JavaScript.', 'HTTP、Python、JavaScript。', 'HTTP, Python, JavaScript.', 'HTTP, Python und JavaScript.', 'HTTP, Python et JavaScript.', 'HTTP, Python y JavaScript.', 'HTTP, Python e JavaScript.') },
    ],
  },
];

export function pageHref(lang: Lang, href: string): string {
  return `/${lang}${href}`;
}

export function isCurrent(path: string, lang: Lang, href: string): boolean {
  const here = path.endsWith('/') ? path : `${path}/`;
  return here === pageHref(lang, href);
}
