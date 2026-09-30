import type { Localized } from '../ui';

export const title: Localized<string> = {
  zh: '社区生态', en: 'Ecosystem', ja: 'エコシステム', ko: '생태계', de: 'Ökosystem', fr: 'Écosystème', es: 'Ecosistema', pt: 'Ecossistema',
};

export const lead: Localized<string> = {
  zh: '围绕 Jev 与 TypeSafe System One 模型构建的公开项目。可按分类与语言筛选。',
  en: 'Public projects built around Jev and the TypeSafe System One model. Filter by category and language.',
  ja: 'Jev と TypeSafe System One モデルを中心にした公開プロジェクト。分類と言語で絞り込めます。',
  ko: 'Jev와 TypeSafe System One 모델을 중심으로 한 공개 프로젝트. 분류와 언어로 필터링할 수 있습니다.',
  de: 'Öffentliche Projekte rund um Jev und das TypeSafe-System-One-Modell. Nach Kategorie und Sprache filterbar.',
  fr: 'Des projets publics autour de Jev et du modèle TypeSafe System One. Filtrez par catégorie et langue.',
  es: 'Proyectos públicos en torno a Jev y el modelo TypeSafe System One. Filtra por categoría e idioma.',
  pt: 'Projetos públicos em torno do Jev e do modelo TypeSafe System One. Filtre por categoria e idioma.',
};

export const statProjects: Localized<string> = {
  zh: '收录项目', en: 'Projects', ja: '収録プロジェクト', ko: '수록 프로젝트', de: 'Projekte', fr: 'Projets', es: 'Proyectos', pt: 'Projetos',
};

export const statStars: Localized<string> = {
  zh: '合计 stars', en: 'Combined stars', ja: '合計 star', ko: '합계 star', de: 'Sterne gesamt', fr: 'Étoiles cumulées', es: 'Estrellas totales', pt: 'Estrelas totais',
};

export const statLanguages: Localized<string> = {
  zh: '编程语言', en: 'Languages', ja: 'プログラミング言語', ko: '프로그래밍 언어', de: 'Sprachen', fr: 'Langages', es: 'Lenguajes', pt: 'Linguagens',
};

/** 含插值 {date} */
export const snapshot: Localized<string> = {
  zh: '快照日期 {date}，stars 会随时间变化。',
  en: 'Snapshot taken {date}; star counts drift over time.',
  ja: 'スナップショット日 {date}。star 数は時間とともに変わります。',
  ko: '스냅샷 날짜 {date}. star 수는 시간이 지나면 변합니다.',
  de: 'Snapshot vom {date}; Sternzahlen ändern sich mit der Zeit.',
  fr: 'Instantané du {date} ; le nombre d\'étoiles évolue avec le temps.',
  es: 'Instantánea del {date}; el número de estrellas cambia con el tiempo.',
  pt: 'Instantâneo de {date}; as contagens de estrelas mudam com o tempo.',
};

export const forks: Localized<string> = {
  zh: 'forks', en: 'forks', ja: 'forks', ko: 'forks', de: 'Forks', fr: 'forks', es: 'forks', pt: 'forks',
};

export const filterAll: Localized<string> = {
  zh: '全部', en: 'All', ja: 'すべて', ko: '전체', de: 'Alle', fr: 'Tout', es: 'Todo', pt: 'Tudo',
};

export const filterLanguage: Localized<string> = {
  zh: '语言', en: 'Language', ja: '言語', ko: '언어', de: 'Sprache', fr: 'Langue', es: 'Idioma', pt: 'Idioma',
};

export const filterTopic: Localized<string> = {
  zh: '主题', en: 'Topic', ja: 'トピック', ko: '주제', de: 'Thema', fr: 'Sujet', es: 'Tema', pt: 'Tema',
};

export const searchPlaceholder: Localized<string> = {
  zh: '搜索项目名、描述…', en: 'Search name or description…', ja: 'プロジェクト名・説明を検索…', ko: '프로젝트 이름, 설명 검색…', de: 'Name oder Beschreibung suchen…', fr: 'Rechercher nom ou description…', es: 'Buscar nombre o descripción…', pt: 'Buscar nome ou descrição…',
};

export const noResult: Localized<string> = {
  zh: '没有匹配的项目。', en: 'No matching projects.', ja: '一致するプロジェクトはありません。', ko: '일치하는 프로젝트가 없습니다.', de: 'Keine passenden Projekte.', fr: 'Aucun projet correspondant.', es: 'No hay proyectos coincidentes.', pt: 'Nenhum projeto correspondente.',
};

export const shownTpl: Localized<string> = {
  zh: '显示 {n} 个项目', en: '{n} projects shown', ja: '{n} 件のプロジェクトを表示', ko: '{n}개 프로젝트 표시', de: '{n} Projekte angezeigt', fr: '{n} projets affichés', es: '{n} proyectos mostrados', pt: '{n} projetos exibidos',
};

export const decision: Localized<string> = {
  zh: 'Jev 在这里做什么', en: 'What Jev does here', ja: 'ここで Jev が担うこと', ko: '여기서 Jev가 하는 일', de: 'Was Jev hier tut', fr: 'Ce que fait Jev ici', es: 'Qué hace Jev aquí', pt: 'O que o Jev faz aqui',
};
