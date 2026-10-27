import type { Localized } from '../ui';

/** 生态实体详情页文案。用 {name}/{n}/{cat} 占位，由页面替换。 */

export const categoryCount: Localized<string> = {
  zh: '{n} 个项目', en: '{n} projects', ja: '{n} プロジェクト', ko: '{n}개 프로젝트',
  de: '{n} Projekte', fr: '{n} projets', es: '{n} proyectos', pt: '{n} projetos',
};

export const categoryStars: Localized<string> = {
  zh: '合计 {n} stars', en: '{n} stars in total', ja: '合計 {n} stars', ko: '총 {n} stars',
  de: 'insgesamt {n} Stars', fr: '{n} étoiles au total', es: '{n} estrellas en total', pt: '{n} estrelas no total',
};

export const browseTitle: Localized<string> = {
  zh: '分类下的项目', en: 'Projects in this category', ja: 'このカテゴリのプロジェクト', ko: '이 카테고리의 프로젝트',
  de: 'Projekte dieser Kategorie', fr: 'Projets de cette catégorie', es: 'Proyectos de esta categoría', pt: 'Projetos nesta categoria',
};

export const allCategories: Localized<string> = {
  zh: '其他分类', en: 'Other categories', ja: '他のカテゴリ', ko: '다른 카테고리',
  de: 'Weitere Kategorien', fr: 'Autres catégories', es: 'Otras categorías', pt: 'Outras categorias',
};

export const categoryMetaDescription: Localized<string> = {
  zh: '{cat}：收录 {n} 个 Jev 生态项目，合计 {stars} stars。含定位说明、语言与许可证信息。',
  en: '{cat}: {n} Jev ecosystem projects with {stars} stars in total, each with positioning, language and license details.',
  ja: '{cat}：Jev エコシステムの {n} プロジェクト、合計 {stars} stars。位置づけ・言語・ライセンス情報付き。',
  ko: '{cat}: Jev 생태계 프로젝트 {n}개, 총 {stars} stars. 포지셔닝·언어·라이선스 정보 포함.',
  de: '{cat}: {n} Jev-Ökosystem-Projekte mit insgesamt {stars} Stars — inklusive Einordnung, Sprache und Lizenz.',
  fr: '{cat} : {n} projets de l\u2019écosystème Jev, {stars} étoiles au total, avec positionnement, langage et licence.',
  es: '{cat}: {n} proyectos del ecosistema Jev con {stars} estrellas en total, con posicionamiento, lenguaje y licencia.',
  pt: '{cat}: {n} projetos do ecossistema Jev com {stars} estrelas no total, com posicionamento, linguagem e licença.',
};

export const categoryFaqWhat: Localized<string> = {
  zh: '「{cat}」是 Jev 生态里的一个项目分类，目前收录 {n} 个项目。{lead}',
  en: '"{cat}" is a project category in the Jev ecosystem with {n} projects listed. {lead}',
  ja: '「{cat}」は Jev エコシステムのプロジェクト分類で、現在 {n} 件を収録しています。{lead}',
  ko: '"{cat}"은(는) Jev 생태계의 프로젝트 분류로 현재 {n}개를 수록하고 있습니다. {lead}',
  de: '„{cat}" ist eine Projektkategorie im Jev-Ökosystem mit derzeit {n} Projekten. {lead}',
  fr: '« {cat} » est une catégorie de projets de l\u2019écosystème Jev, avec {n} projets référencés. {lead}',
  es: '«{cat}» es una categoría de proyectos del ecosistema Jev con {n} proyectos registrados. {lead}',
  pt: '"{cat}" é uma categoria de projetos do ecossistema Jev com {n} projetos listados. {lead}',
};

export const categoryFaqWhich: Localized<string> = {
  zh: '「{cat}」里值得先看哪些项目？',
  en: 'Which projects in "{cat}" should I look at first?',
  ja: '「{cat}」で最初に見るべきプロジェクトは？',
  ko: '"{cat}"에서 먼저 볼 만한 프로젝트는?',
  de: 'Welche Projekte in „{cat}" sollte man zuerst ansehen?',
  fr: 'Quels projets de « {cat} » regarder en premier ?',
  es: '¿Qué proyectos de «{cat}» conviene ver primero?',
  pt: 'Quais projetos em "{cat}" devo ver primeiro?',
};

export const categoryFaqWhichA: Localized<string> = {
  zh: '按 stars 排序，优先看：{list}。每个项目都有独立页面，写明定位、语言、许可证与同分类替代方案。',
  en: 'Sorted by stars, start with: {list}. Each has its own page covering positioning, language, license and alternatives in the same category.',
  ja: 'stars 順では {list} から見るのがおすすめです。各プロジェクトには位置づけ・言語・ライセンス・同カテゴリの代替案をまとめた個別ページがあります。',
  ko: 'stars 순으로 {list}을(를) 먼저 보세요. 각 프로젝트에는 포지셔닝·언어·라이선스·같은 카테고리의 대안을 정리한 개별 페이지가 있습니다.',
  de: 'Nach Stars sortiert zuerst: {list}. Jedes Projekt hat eine eigene Seite mit Einordnung, Sprache, Lizenz und Alternativen derselben Kategorie.',
  fr: 'Triés par étoiles, commencez par : {list}. Chaque projet a sa page dédiée : positionnement, langage, licence et alternatives de la même catégorie.',
  es: 'Ordenados por estrellas, empieza por: {list}. Cada proyecto tiene su propia página con posicionamiento, lenguaje, licencia y alternativas de la misma categoría.',
  pt: 'Ordenados por estrelas, comece por: {list}. Cada projeto tem página própria com posicionamento, linguagem, licença e alternativas da mesma categoria.',
};

export const metaDescription: Localized<string> = {
  zh: '{name}：{desc} 收录于 Jev 生态「{cat}」分类，{stars} stars。',
  en: '{name}: {desc} Listed under the "{cat}" category of the Jev ecosystem with {stars} stars.',
  ja: '{name}：{desc} Jevエコシステムの「{cat}」カテゴリに収録、{stars} stars。',
  ko: '{name}: {desc} Jev 생태계 "{cat}" 카테고리에 수록, {stars} stars.',
  de: '{name}: {desc} Gelistet in der Kategorie „{cat}" des Jev-Ökosystems, {stars} Stars.',
  fr: '{name} : {desc} Répertorié dans la catégorie « {cat} » de l\u2019écosystème Jev, {stars} stars.',
  es: '{name}: {desc} Incluido en la categoría «{cat}» del ecosistema Jev, {stars} stars.',
  pt: '{name}: {desc} Listado na categoria "{cat}" do ecossistema Jev, {stars} stars.',
};

export const keyFacts: Localized<string> = {
  zh: '关键信息', en: 'Key facts', ja: '基本情報', ko: '주요 정보', de: 'Eckdaten', fr: 'Chiffres clés', es: 'Datos clave', pt: 'Dados principais',
};

export const factStars: Localized<string> = {
  zh: 'Stars', en: 'Stars', ja: 'Stars', ko: 'Stars', de: 'Stars', fr: 'Stars', es: 'Stars', pt: 'Stars',
};

export const factForks: Localized<string> = {
  zh: 'Forks', en: 'Forks', ja: 'Forks', ko: 'Forks', de: 'Forks', fr: 'Forks', es: 'Forks', pt: 'Forks',
};

export const factLanguage: Localized<string> = {
  zh: '主要语言', en: 'Language', ja: '主要言語', ko: '주요 언어', de: 'Sprache', fr: 'Langage', es: 'Lenguaje', pt: 'Linguagem',
};

export const factLicense: Localized<string> = {
  zh: '许可证', en: 'License', ja: 'ライセンス', ko: '라이선스', de: 'Lizenz', fr: 'Licence', es: 'Licencia', pt: 'Licença',
};

export const factCategory: Localized<string> = {
  zh: '分类', en: 'Category', ja: 'カテゴリ', ko: '카테고리', de: 'Kategorie', fr: 'Catégorie', es: 'Categoría', pt: 'Categoria',
};

export const factTopics: Localized<string> = {
  zh: '主题', en: 'Topics', ja: 'トピック', ko: '토픽', de: 'Themen', fr: 'Sujets', es: 'Temas', pt: 'Tópicos',
};

export const factUpdated: Localized<string> = {
  zh: '数据快照', en: 'Data snapshot', ja: 'データ取得日', ko: '데이터 스냅샷', de: 'Datenstand', fr: 'Instantané des données', es: 'Instantánea de datos', pt: 'Instantâneo dos dados',
};

export const factArchived: Localized<string> = {
  zh: '上游已归档', en: 'Upstream archived', ja: '上流はアーカイブ済み', ko: '업스트림 보관됨', de: 'Upstream archiviert', fr: 'Amont archivé', es: 'Upstream archivado', pt: 'Upstream arquivado',
};

export const decisionTitle: Localized<string> = {
  zh: 'Jev 在这里做什么', en: 'What Jev does here', ja: 'Jevがここで担う役割', ko: 'Jev가 여기서 하는 일', de: 'Was Jev hier leistet', fr: 'Ce que Jev apporte ici', es: 'Qué aporta Jev aquí', pt: 'O que o Jev faz aqui',
};

export const faqTitle: Localized<string> = {
  zh: '常见问题', en: 'Frequently asked questions', ja: 'よくある質問', ko: '자주 묻는 질문', de: 'Häufige Fragen', fr: 'Questions fréquentes', es: 'Preguntas frecuentes', pt: 'Perguntas frequentes',
};

export const relatedTitle: Localized<string> = {
  zh: '同分类项目', en: 'More in this category', ja: '同じカテゴリのプロジェクト', ko: '같은 카테고리의 프로젝트', de: 'Weitere Projekte dieser Kategorie', fr: 'Autres projets de cette catégorie', es: 'Más proyectos de esta categoría', pt: 'Mais projetos nesta categoria',
};

export const allInCategory: Localized<string> = {
  zh: '查看「{cat}」全部项目', en: 'See all projects in "{cat}"', ja: '「{cat}」の全プロジェクトを見る', ko: '"{cat}"의 모든 프로젝트 보기', de: 'Alle Projekte in „{cat}" ansehen', fr: 'Voir tous les projets de « {cat} »', es: 'Ver todos los proyectos de «{cat}»', pt: 'Ver todos os projetos em "{cat}"',
};

export const backToEcosystem: Localized<string> = {
  zh: '返回生态总览', en: 'Back to the ecosystem overview', ja: 'エコシステム一覧に戻る', ko: '생태계 개요로 돌아가기', de: 'Zurück zur Ökosystem-Übersicht', fr: 'Retour à la vue d\u2019ensemble', es: 'Volver a la vista general', pt: 'Voltar à visão geral',
};

export const viewRepo: Localized<string> = {
  zh: '在 GitHub 查看仓库', en: 'View repository on GitHub', ja: 'GitHubでリポジトリを見る', ko: 'GitHub에서 저장소 보기', de: 'Repository auf GitHub ansehen', fr: 'Voir le dépôt sur GitHub', es: 'Ver el repositorio en GitHub', pt: 'Ver repositório no GitHub',
};

export const officialSite: Localized<string> = {
  zh: '访问官网', en: 'Visit official site', ja: '公式サイトを見る', ko: '공식 사이트 방문', de: 'Offizielle Website besuchen', fr: 'Visiter le site officiel', es: 'Visitar el sitio oficial', pt: 'Visitar o site oficial',
};

export const summaryLabel: Localized<string> = {
  zh: '一句话定位', en: 'In one line', ja: 'ひとことで言うと', ko: '한 줄 요약', de: 'In einer Zeile', fr: 'En une phrase', es: 'En una línea', pt: 'Em uma linha',
};

export const fromEcosystem: Localized<string> = {
  zh: '收录于 Jev 社区生态索引，数据快照 {date}。',
  en: 'Indexed in the Jev community ecosystem directory, data snapshot {date}.',
  ja: 'Jevコミュニティのエコシステム索引に収録。データ取得日 {date}。',
  ko: 'Jev 커뮤니티 생태계 색인에 수록. 데이터 스냅샷 {date}.',
  de: 'Im Jev-Community-Ökosystemverzeichnis gelistet, Datenstand {date}.',
  fr: 'Répertorié dans l\u2019annuaire de l\u2019écosystème communautaire Jev, instantané du {date}.',
  es: 'Incluido en el directorio del ecosistema comunitario Jev, instantánea del {date}.',
  pt: 'Listado no diretório do ecossistema da comunidade Jev, instantâneo de {date}.',
};

/* ---------- FAQ 问答（占位符由页面填充） ---------- */

export const qWhatIs: Localized<string> = {
  zh: '什么是 {name}？', en: 'What is {name}?', ja: '{name}とは何ですか？', ko: '{name}은(는) 무엇인가요?', de: 'Was ist {name}?', fr: 'Qu\u2019est-ce que {name} ?', es: '¿Qué es {name}?', pt: 'O que é {name}?',
};

export const aWhatIs: Localized<string> = {
  zh: '{name} 是 Jev 生态中「{cat}」分类下的一个项目。{desc}',
  en: '{name} is a project in the "{cat}" category of the Jev ecosystem. {desc}',
  ja: '{name} は Jevエコシステムの「{cat}」カテゴリに属するプロジェクトです。{desc}',
  ko: '{name}은(는) Jev 생태계 "{cat}" 카테고리에 속한 프로젝트입니다. {desc}',
  de: '{name} ist ein Projekt der Kategorie „{cat}" im Jev-Ökosystem. {desc}',
  fr: '{name} est un projet de la catégorie « {cat} » de l\u2019écosystème Jev. {desc}',
  es: '{name} es un proyecto de la categoría «{cat}» del ecosistema Jev. {desc}',
  pt: '{name} é um projeto da categoria "{cat}" do ecossistema Jev. {desc}',
};

export const qOpenSource: Localized<string> = {
  zh: '{name} 是开源的吗？使用什么许可证？', en: 'Is {name} open source, and under which license?',
  ja: '{name} はオープンソースですか？ライセンスは何ですか？', ko: '{name}은(는) 오픈 소스인가요? 라이선스는 무엇인가요?',
  de: 'Ist {name} Open Source, und unter welcher Lizenz?', fr: '{name} est-il open source, et sous quelle licence ?',
  es: '¿{name} es de código abierto y bajo qué licencia?', pt: '{name} é open source e sob qual licença?',
};

export const aOpenSourceKnown: Localized<string> = {
  zh: '{name} 使用 {license} 许可证，可自由查看、修改与分发（以许可证条款为准）。',
  en: '{name} is released under the {license} license; you may view, modify and redistribute it subject to those terms.',
  ja: '{name} は {license} ライセンスで公開されています。閲覧・改変・再配布はライセンス条件に従います。',
  ko: '{name}은(는) {license} 라이선스로 배포됩니다. 열람·수정·재배포는 라이선스 조건을 따릅니다.',
  de: '{name} steht unter der {license}-Lizenz; Ansicht, Änderung und Weitergabe richten sich nach deren Bedingungen.',
  fr: '{name} est publié sous licence {license} ; consultation, modification et redistribution selon ses termes.',
  es: '{name} se distribuye bajo la licencia {license}; su consulta, modificación y redistribución se rigen por esos términos.',
  pt: '{name} é distribuído sob a licença {license}; visualização, modificação e redistribuição seguem esses termos.',
};

export const aLanguageKnown: Localized<string> = {
  zh: '{name} 的主要开发语言是 {language}。',
  en: 'The primary language of {name} is {language}.',
  ja: '{name} の主要開発言語は {language} です。',
  ko: '{name}의 주요 개발 언어는 {language}입니다.',
  de: 'Die Hauptsprache von {name} ist {language}.',
  fr: 'Le langage principal de {name} est {language}.',
  es: 'El lenguaje principal de {name} es {language}.',
  pt: 'A linguagem principal de {name} é {language}.',
};

export const aAlternativesKnown: Localized<string> = {
  zh: '同属「{cat}」分类的项目还有：{list}。',
  en: 'Other projects in the "{cat}" category include: {list}.',
  ja: '「{cat}」カテゴリには他に {list} などのプロジェクトがあります。',
  ko: '"{cat}" 카테고리에는 {list} 등의 프로젝트가 더 있습니다.',
  de: 'Weitere Projekte der Kategorie „{cat}" sind: {list}.',
  fr: 'D\u2019autres projets de la catégorie « {cat} » incluent : {list}.',
  es: 'Otros proyectos de la categoría «{cat}» incluyen: {list}.',
  pt: 'Outros projetos na categoria "{cat}" incluem: {list}.',
};

export const aOpenSourceUnknown: Localized<string> = {
  zh: '{name} 的许可证信息尚未采集，建议到上游仓库确认最新条款。',
  en: 'The license for {name} has not been captured yet — check the upstream repository for the current terms.',
  ja: '{name} のライセンス情報は未取得です。最新の条件は上流リポジトリで確認してください。',
  ko: '{name}의 라이선스 정보는 아직 수집되지 않았습니다. 최신 조건은 업스트림 저장소에서 확인하세요.',
  de: 'Die Lizenz von {name} wurde noch nicht erfasst — prüfe die aktuellen Bedingungen im Upstream-Repository.',
  fr: 'La licence de {name} n\u2019a pas encore été relevée — vérifiez les conditions à jour dans le dépôt amont.',
  es: 'La licencia de {name} aún no se ha registrado; consulta los términos actuales en el repositorio upstream.',
  pt: 'A licença de {name} ainda não foi coletada — confira os termos atuais no repositório upstream.',
};

export const qLanguage: Localized<string> = {
  zh: '{name} 用什么语言编写？', en: 'What language is {name} written in?',
  ja: '{name} は何語で書かれていますか？', ko: '{name}은(는) 어떤 언어로 작성되었나요?',
  de: 'In welcher Sprache ist {name} geschrieben?', fr: 'Dans quel langage {name} est-il écrit ?',
  es: '¿En qué lenguaje está escrito {name}?', pt: 'Em qual linguagem {name} é escrito?',
};

export const aLanguageUnknown: Localized<string> = {
  zh: '{name} 的主要语言尚未采集，可到上游仓库查看。',
  en: 'The primary language of {name} has not been captured yet — see the upstream repository.',
  ja: '{name} の主要言語は未取得です。上流リポジトリを確認してください。',
  ko: '{name}의 주요 언어는 아직 수집되지 않았습니다. 업스트림 저장소를 확인하세요.',
  de: 'Die Hauptsprache von {name} wurde noch nicht erfasst — siehe Upstream-Repository.',
  fr: 'Le langage principal de {name} n\u2019a pas encore été relevé — voir le dépôt amont.',
  es: 'El lenguaje principal de {name} aún no se ha registrado; consulta el repositorio upstream.',
  pt: 'A linguagem principal de {name} ainda não foi coletada — veja o repositório upstream.',
};

export const qAlternatives: Localized<string> = {
  zh: '和 {name} 类似的项目有哪些？', en: 'What are alternatives to {name}?',
  ja: '{name} に似たプロジェクトは？', ko: '{name}과(와) 유사한 프로젝트는?',
  de: 'Welche Alternativen gibt es zu {name}?', fr: 'Quelles sont les alternatives à {name} ?',
  es: '¿Cuáles son las alternativas a {name}?', pt: 'Quais são as alternativas a {name}?',
};

export const aAlternativesEmpty: Localized<string> = {
  zh: '「{cat}」分类目前还没有其它收录项目，可以查看生态总览了解全部分类。',
  en: 'No other projects are listed in "{cat}" yet — browse the ecosystem overview for all categories.',
  ja: '「{cat}」カテゴリにはまだ他のプロジェクトがありません。エコシステム一覧で全カテゴリを確認できます。',
  ko: '"{cat}" 카테고리에는 아직 다른 프로젝트가 없습니다. 생태계 개요에서 모든 카테고리를 확인하세요.',
  de: 'In der Kategorie „{cat}" sind noch keine weiteren Projekte gelistet — die Ökosystem-Übersicht zeigt alle Kategorien.',
  fr: 'Aucun autre projet n\u2019est encore répertorié dans « {cat} » — parcourez la vue d\u2019ensemble pour toutes les catégories.',
  es: 'Aún no hay otros proyectos en «{cat}»; consulta la vista general para ver todas las categorías.',
  pt: 'Ainda não há outros projetos em "{cat}" — veja a visão geral para todas as categorias.',
};

export const qStars: Localized<string> = {
  zh: '{name} 有多受欢迎？', en: 'How popular is {name}?',
  ja: '{name} の人気はどのくらいですか？', ko: '{name}의 인기도는 어느 정도인가요?',
  de: 'Wie beliebt ist {name}?', fr: 'Quelle est la popularité de {name} ?',
  es: '¿Qué tan popular es {name}?', pt: 'Quão popular é {name}?',
};

export const aStars: Localized<string> = {
  zh: '截至 {date}，{name} 在 GitHub 上有 {stars} stars、{forks} forks。',
  en: 'As of {date}, {name} has {stars} stars and {forks} forks on GitHub.',
  ja: '{date} 時点で、{name} は GitHub で {stars} stars、{forks} forks です。',
  ko: '{date} 기준으로 {name}은(는) GitHub에서 {stars} stars, {forks} forks입니다.',
  de: 'Stand {date} hat {name} auf GitHub {stars} Stars und {forks} Forks.',
  fr: 'Au {date}, {name} compte {stars} stars et {forks} forks sur GitHub.',
  es: 'A fecha de {date}, {name} tiene {stars} stars y {forks} forks en GitHub.',
  pt: 'Em {date}, {name} tem {stars} stars e {forks} forks no GitHub.',
};

export const qArchived: Localized<string> = {
  zh: '{name} 还在维护吗？', en: 'Is {name} still maintained?',
  ja: '{name} はまだメンテナンスされていますか？', ko: '{name}은(는) 아직 유지 관리되나요?',
  de: 'Wird {name} noch gepflegt?', fr: '{name} est-il encore maintenu ?',
  es: '¿{name} sigue mantenido?', pt: '{name} ainda é mantido?',
};

export const aArchived: Localized<string> = {
  zh: '{name} 的上游仓库已归档，不再接受更新，选型时应考虑替代方案。',
  en: 'The upstream repository of {name} is archived and no longer updated — consider alternatives when choosing.',
  ja: '{name} の上流リポジトリはアーカイブ済みで更新されません。選定時は代替案を検討してください。',
  ko: '{name}의 업스트림 저장소는 보관되어 더 이상 업데이트되지 않습니다. 선택 시 대안을 고려하세요.',
  de: 'Das Upstream-Repository von {name} ist archiviert und wird nicht mehr aktualisiert — bei der Auswahl Alternativen prüfen.',
  fr: 'Le dépôt amont de {name} est archivé et n\u2019est plus mis à jour — envisagez des alternatives.',
  es: 'El repositorio upstream de {name} está archivado y ya no se actualiza; considera alternativas.',
  pt: 'O repositório upstream de {name} está arquivado e não é mais atualizado — considere alternativas.',
};
