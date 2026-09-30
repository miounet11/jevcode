import type { Localized } from '../ui';

export const title: Localized<string> = {
  zh: '社区脉搏',
  en: 'Community pulse',
  ja: 'コミュニティの動き',
  ko: '커뮤니티 동향',
  de: 'Community-Puls',
  fr: 'Pouls de la communauté',
  es: 'Pulso de la comunidad',
  pt: 'Movimento da comunidade',
};

export const lead: Localized<string> = {
  zh: 'Jev 正在被用来做什么：社区推文精选，看真实项目、演示与讨论。打开任一条可看到原文摘录全文与出处。',
  en: 'What Jev is being used for: curated community posts — real projects, demos, and discussion. Open any entry for the full excerpt and its source.',
  ja: 'Jev が何に使われているか：コミュニティ投稿の抜粋。実際のプロジェクト、デモ、議論が見られます。各項目を開くと抜粋の全文と出典が読めます。',
  ko: 'Jev가 어디에 쓰이는지: 커뮤니티 게시물 선별. 실제 프로젝트, 데모, 토론을 볼 수 있습니다. 항목을 열면 발췌 전문과 출처를 볼 수 있습니다.',
  de: 'Wofür Jev genutzt wird: kuratierte Community-Beiträge – echte Projekte, Demos und Diskussionen. Öffne einen Eintrag für den vollständigen Auszug und seine Quelle.',
  fr: "À quoi sert Jev : des publications communautaires sélectionnées — projets réels, démos et discussions. Ouvrez une entrée pour l'extrait complet et sa source.",
  es: 'Para qué se usa Jev: publicaciones de la comunidad seleccionadas — proyectos reales, demos y debate. Abre cualquier entrada para el extracto completo y su fuente.',
  pt: 'Para que o Jev está sendo usado: publicações da comunidade selecionadas — projetos reais, demos e discussão. Abra qualquer entrada para o excerto completo e sua fonte.',
};

export const stats: Localized<string> = {
  zh: '条精选', en: 'entries', ja: '件の抜粋', ko: '개 항목', de: 'Einträge', fr: 'entrées', es: 'entradas', pt: 'entradas',
};

export const open: Localized<string> = {
  zh: '查看详情', en: 'Read entry', ja: '詳細を見る', ko: '자세히 보기', de: 'Eintrag lesen', fr: "Lire l'entrée", es: 'Leer entrada', pt: 'Ler entrada',
};

export const asOf: Localized<string> = {
  zh: '收录时间', en: 'Collected', ja: '収録日時', ko: '수집 시각', de: 'Erfasst', fr: 'Collecté le', es: 'Recogido', pt: 'Coletado',
};

export const all: Localized<string> = {
  zh: '全部', en: 'All', ja: 'すべて', ko: '전체', de: 'Alle', fr: 'Tout', es: 'Todo', pt: 'Tudo',
};

export const note: Localized<string> = {
  zh: '条目为英文原文摘录，筛选标准：显著传播量或附项目链接；经 Jev 批级相关性判定。',
  en: 'Entries are excerpts of original posts. Inclusion bar: significant engagement or an attached project link; batch relevance judged by Jev.',
  ja: '項目は原文（英語）の抜粋です。採用基準は顕著な拡散量、またはプロジェクトリンクの添付。関連性は Jev のバッチ判定によります。',
  ko: '항목은 원문(영어) 발췌입니다. 선정 기준은 뚜렷한 확산량 또는 프로젝트 링크 첨부이며, 관련성은 Jev의 배치 판정으로 결정됩니다.',
  de: 'Einträge sind Auszüge der Originalbeiträge. Aufnahmekriterium: erhebliche Reichweite oder ein angehängter Projektlink; Relevanz im Batch von Jev beurteilt.',
  fr: "Les entrées sont des extraits de publications originales. Critère d'inclusion : forte engagement ou un lien de projet joint ; pertinence jugée par Jev en lot.",
  es: 'Las entradas son extractos de publicaciones originales. Criterio de inclusión: difusión significativa o un enlace de proyecto adjunto; relevancia juzgada por Jev en lote.',
  pt: 'As entradas são excertos das publicações originais. Critério de inclusão: alcance significativo ou um link de projeto anexado; relevância julgada pelo Jev em lote.',
};

/** 条目详情页（community/[id]）。 */
export const detailNote: Localized<string> = {
  zh: '条目为英文原文摘录，筛选标准：显著传播量或附项目链接；经 Jev 批级相关性判定。本站未逐条核实其真实性。',
  en: 'Entries are excerpts of original posts. Inclusion bar: significant engagement or an attached project link; batch relevance judged by Jev. We have not independently verified each claim.',
  ja: '項目は原文（英語）の抜粋です。採用基準は顕著な拡散量、またはプロジェクトリンクの添付。関連性は Jev のバッチ判定によります。当サイトは各項目の真偽を個別に検証していません。',
  ko: '항목은 원문(영어) 발췌입니다. 선정 기준은 뚜렷한 확산량 또는 프로젝트 링크 첨부이며, 관련성은 Jev의 배치 판정으로 결정됩니다. 이 사이트는 각 항목의 진위를 개별적으로 검증하지 않았습니다.',
  de: 'Einträge sind Auszüge der Originalbeiträge. Aufnahmekriterium: erhebliche Reichweite oder ein angehängter Projektlink; Relevanz im Batch von Jev beurteilt. Wir haben nicht jede Aussage unabhängig geprüft.',
  fr: "Les entrées sont des extraits de publications originales. Critère d'inclusion : forte engagement ou un lien de projet joint ; pertinence jugée par Jev en lot. Nous n'avons pas vérifié chaque affirmation de façon indépendante.",
  es: 'Las entradas son extractos de publicaciones originales. Criterio de inclusión: difusión significativa o un enlace de proyecto adjunto; relevancia juzgada por Jev en lote. No hemos verificado cada afirmación de forma independiente.',
  pt: 'As entradas são excertos das publicações originais. Critério de inclusão: alcance significativo ou um link de projeto anexado; relevância julgada pelo Jev em lote. Não verificamos cada afirmação de forma independente.',
};

export const metaAuthor: Localized<string> = {
  zh: '作者', en: 'Author', ja: '作者', ko: '작성자', de: 'Autor', fr: 'Auteur', es: 'Autor', pt: 'Autor',
};

export const metaDate: Localized<string> = {
  zh: '发布时间', en: 'Posted', ja: '投稿日', ko: '게시 시각', de: 'Veröffentlicht', fr: 'Publié', es: 'Publicado', pt: 'Publicado',
};

export const metaViews: Localized<string> = {
  zh: '阅读', en: 'Views', ja: '閲覧', ko: '조회', de: 'Aufrufe', fr: 'Vues', es: 'Vistas', pt: 'Visualizações',
};

export const metaLikes: Localized<string> = {
  zh: '点赞', en: 'Likes', ja: 'いいね', ko: '좋아요', de: 'Likes', fr: 'J\'aime', es: 'Me gusta', pt: 'Curtidas',
};

export const metaCategory: Localized<string> = {
  zh: '分类', en: 'Category', ja: '分類', ko: '분류', de: 'Kategorie', fr: 'Catégorie', es: 'Categoría', pt: 'Categoria',
};

export const post: Localized<string> = {
  zh: '查看原推', en: 'View original', ja: '原投稿を見る', ko: '원문 보기', de: 'Original ansehen', fr: "Voir l'original", es: 'Ver original', pt: 'Ver original',
};

export const project: Localized<string> = {
  zh: '项目链接', en: 'Project', ja: 'プロジェクト', ko: '프로젝트', de: 'Projekt', fr: 'Projet', es: 'Proyecto', pt: 'Projeto',
};

export const outbound: Localized<string> = {
  zh: '站外链接', en: 'External links', ja: '外部リンク', ko: '외부 링크', de: 'Externe Links', fr: 'Liens externes', es: 'Enlaces externos', pt: 'Links externos',
};

export const back: Localized<string> = {
  zh: '← 返回社区脉搏', en: '← Back to community pulse', ja: '← コミュニティの動きへ戻る', ko: '← 커뮤니티 동향으로 돌아가기', de: '← Zurück zum Community-Puls', fr: '← Retour au pouls de la communauté', es: '← Volver al pulso de la comunidad', pt: '← Voltar ao movimento da comunidade',
};

export const more: Localized<string> = {
  zh: '同类条目', en: 'More in this category', ja: '同じ分類の項目', ko: '같은 분류의 항목', de: 'Mehr in dieser Kategorie', fr: 'Plus dans cette catégorie', es: 'Más en esta categoría', pt: 'Mais nesta categoria',
};

export const prev: Localized<string> = {
  zh: '上一条', en: 'Previous', ja: '前の項目', ko: '이전 항목', de: 'Zurück', fr: 'Précédent', es: 'Anterior', pt: 'Anterior',
};

export const next: Localized<string> = {
  zh: '下一条', en: 'Next', ja: '次の項目', ko: '다음 항목', de: 'Weiter', fr: 'Suivant', es: 'Siguiente', pt: 'Próximo',
};
