import type { Localized } from '../ui';

export const title: Localized<string> = {
  zh: 'Jev 动态', en: 'Jev builds', ja: 'Jev の動き', ko: 'Jev 소식', de: 'Jev-Builds', fr: 'Builds Jev', es: 'Builds de Jev', pt: 'Builds do Jev',
};

export const lead: Localized<string> = {
  zh: '网上的帖子，本站用 Jev 判断后收录。标题必须是原话摘录，判断不过关的不会出现。内容不代表本站核实过的案例。',
  en: 'Public posts judged here with Jev. A title is kept only when it is a contiguous excerpt of the post. Posts that fail the judgment are omitted. This is not a verified production-case list.',
  ja: '公開投稿の原文を当サイトが Jev で判定します。タイトルは原文からの連続した抜粋でなければなりません。判定を通らない投稿は掲載されません。当サイトが検証した本番事例の一覧ではありません。',
  ko: '공개 게시물 원문을 이 사이트가 Jev로 판정합니다. 제목은 원문에서 연속된 발췌여야 합니다. 판정을 통과하지 못한 게시물은 표시되지 않습니다. 이 사이트가 검증한 프로덕션 사례 목록이 아닙니다.',
  de: 'Öffentliche Beiträge, hier mit Jev beurteilt. Ein Titel bleibt nur erhalten, wenn er ein zusammenhängender Auszug des Beitrags ist. Beiträge, die das Urteil nicht bestehen, entfallen. Dies ist keine verifizierte Produktionsfall-Liste.',
  fr: "Des publications publiques jugées ici avec Jev. Un titre n'est conservé que s'il est un extrait contigu de la publication. Les publications qui échouent au jugement sont omises. Ce n'est pas une liste de cas de production vérifiés.",
  es: 'Publicaciones públicas juzgadas aquí con Jev. Un título se conserva solo si es un extracto contiguo de la publicación. Las publicaciones que no pasan el juicio se omiten. No es una lista de casos de producción verificados.',
  pt: 'Publicações públicas julgadas aqui com Jev. Um título só é mantido se for um excerto contíguo da publicação. Publicações que falham no julgamento são omitidas. Não é uma lista de casos de produção verificados.',
};

export const collected: Localized<string> = {
  zh: '已收录', en: 'Indexed posts', ja: '索引済み', ko: '색인 항목', de: 'Indexierte Beiträge', fr: 'Publications indexées', es: 'Publicaciones indexadas', pt: 'Publicações indexadas',
};

export const analysed: Localized<string> = {
  zh: '已判断', en: 'Judged here', ja: '当サイトで判定済み', ko: '이 사이트에서 판정함', de: 'Hier beurteilt', fr: 'Jugées ici', es: 'Juzgadas aquí', pt: 'Julgadas aqui',
};

export const authors: Localized<string> = {
  zh: '作者', en: 'Authors', ja: '作者', ko: '작성자', de: 'Autoren', fr: 'Auteurs', es: 'Autores', pt: 'Autores',
};

/** 含插值 {date}，渲染时把快照更新时间填入。 */
export const updated: Localized<string> = {
  zh: '判断更新于 {date}。', en: 'Judged here at {date}.', ja: '当サイトの判定更新は {date}。', ko: '이 사이트의 판정 갱신: {date}.', de: 'Hier beurteilt am {date}.', fr: 'Jugées ici le {date}.', es: 'Juzgadas aquí el {date}.', pt: 'Julgadas aqui em {date}.',
};

export const source: Localized<string> = {
  zh: '查看来源', en: 'View source', ja: '出典を見る', ko: '출처 보기', de: 'Quelle ansehen', fr: 'Voir la source', es: 'Ver fuente', pt: 'Ver fonte',
};

export const category: Localized<string> = {
  zh: '分类', en: 'Category', ja: '分類', ko: '분류', de: 'Kategorie', fr: 'Catégorie', es: 'Categoría', pt: 'Categoria',
};

export const usecase: Localized<string> = {
  zh: '用途', en: 'Use', ja: '用途', ko: '용도', de: 'Verwendung', fr: 'Usage', es: 'Uso', pt: 'Uso',
};

export const all: Localized<string> = {
  zh: '全部', en: 'All', ja: 'すべて', ko: '전체', de: 'Alle', fr: 'Tout', es: 'Todo', pt: 'Tudo',
};

export const search: Localized<string> = {
  zh: '搜索标题或正文…', en: 'Search title or text…', ja: 'タイトルまたは本文を検索…', ko: '제목 또는 본문 검색…', de: 'Titel oder Text suchen…', fr: 'Rechercher titre ou texte…', es: 'Buscar título o texto…', pt: 'Buscar título ou texto…',
};

export const shownTpl: Localized<string> = {
  zh: '显示 {n} 条', en: '{n} shown', ja: '{n} 件表示', ko: '{n}개 표시', de: '{n} angezeigt', fr: '{n} affichés', es: '{n} mostrados', pt: '{n} exibidos',
};

export const empty: Localized<string> = {
  zh: '没有匹配的动态。', en: 'No matching builds.', ja: '一致する動きはありません。', ko: '일치하는 소식이 없습니다.', de: 'Keine passenden Builds.', fr: 'Aucun build correspondant.', es: 'No hay builds coincidentes.', pt: 'Nenhum build correspondente.',
};

export const post: Localized<string> = {
  zh: '原帖', en: 'Post', ja: '原投稿', ko: '원문', de: 'Beitrag', fr: 'Publication', es: 'Publicación', pt: 'Publicação',
};

export const link: Localized<string> = {
  zh: '链接', en: 'Link', ja: 'リンク', ko: '링크', de: 'Link', fr: 'Lien', es: 'Enlace', pt: 'Link',
};
