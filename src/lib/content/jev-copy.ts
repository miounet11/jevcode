/**
 * /jev 相关页面的界面文案，8 语言齐全。
 *
 * 这些是界面词（表头、按钮、说明），可以直接翻译；
 * 条目断言本身仍只有中英两版，属于内容而非界面，不在这里。
 *
 * `tr()` 统一取值：未知语言回退英文，绝不返回空串——
 * 空标签比英文标签更容易让页面被判定为低质量。
 */
import type { Lang } from '../../i18n/ui';
import type { VerificationLabel } from './registry';

export interface JevUiCopy {
  hub: {
    title: string;
    lead: (total: number) => string;
    evidence: string;
    reviewed: string;
    labels: string;
    empty: string;
    /** 枢纽页的分类导航标题，同时用作 nav 的 aria-label。 */
    categories: string;
  };
  category: {
    lead: (count: number) => string;
    evidence: string;
    labels: string;
    back: string;
  };
  entry: {
    evidence: string;
    labels: string;
    decision: string;
    category: string;
    language: string;
    added: string;
    reviewed: string;
    repo: string;
    back: string;
    labelsNote: string;
  };
}

const EN: JevUiCopy = {
  hub: {
    title: 'Jev coverage',
    lead: (total) =>
      `${total} projects, each naming the specific decision Jev makes with an evidence link you can open. Verification labels describe evidence, not a score.`,
    evidence: 'Evidence',
    reviewed: 'Reviewed',
    labels: 'Labels',
    empty: 'No publicly verified entries yet.',
    categories: 'Categories',
  },
  category: {
    lead: (count) =>
      `${count} entries in this category. Each names the specific decision and links to openable evidence.`,
    evidence: 'Evidence',
    labels: 'Labels',
    back: 'Back to coverage',
  },
  entry: {
    evidence: 'Evidence',
    labels: 'Verification labels',
    decision: 'The decision',
    category: 'Category',
    language: 'Language',
    added: 'Listed',
    reviewed: 'Reviewed',
    repo: 'Repository',
    back: 'Back to coverage',
    labelsNote: 'Labels describe the kind of evidence; they are not a score or a ranking.',
  },
};

const ZH: JevUiCopy = {
  hub: {
    title: 'Jev 覆盖地图',
    lead: (total) =>
      `这里收录 ${total} 个项目，每条写明 Jev 在其中做的具体决策，并给出可点开的证据链接。验证标签说明证据强度，不是评分。`,
    evidence: '证据',
    reviewed: '复核于',
    labels: '验证标签',
    empty: '暂无可公开的条目。',
    categories: '分类',
  },
  category: {
    lead: (count) => `收录 ${count} 个条目，按证据与决策归类。每条给出具体决策与可点开的证据链接。`,
    evidence: '证据',
    labels: '验证标签',
    back: '返回覆盖地图',
  },
  entry: {
    evidence: '证据链接',
    labels: '验证标签',
    decision: '具体决策',
    category: '分类',
    language: '实现语言',
    added: '收录于',
    reviewed: '复核于',
    repo: '仓库',
    back: '返回覆盖地图',
    labelsNote: '标签描述证据类型，不构成评分或推荐排序。',
  },
};

const JA: JevUiCopy = {
  hub: {
    title: 'Jev カバレッジ',
    lead: (total) =>
      `${total} 件のプロジェクトを収録。各項目は Jev が行う具体的な判断と、開ける根拠リンクを示します。検証ラベルは根拠の種類であり、評価ではありません。`,
    evidence: '根拠',
    reviewed: 'レビュー日',
    labels: 'ラベル',
    empty: '公開できる項目はまだありません。',
    categories: 'カテゴリ',
  },
  category: {
    lead: (count) => `このカテゴリの ${count} 件。各項目に具体的な判断と開ける根拠リンクがあります。`,
    evidence: '根拠',
    labels: 'ラベル',
    back: 'カバレッジに戻る',
  },
  entry: {
    evidence: '根拠リンク',
    labels: '検証ラベル',
    decision: '具体的な判断',
    category: 'カテゴリ',
    language: '実装言語',
    added: '収録日',
    reviewed: 'レビュー日',
    repo: 'リポジトリ',
    back: 'カバレッジに戻る',
    labelsNote: 'ラベルは根拠の種類を示すもので、評価や順位ではありません。',
  },
};

const KO: JevUiCopy = {
  hub: {
    title: 'Jev 커버리지',
    lead: (total) =>
      `${total}개 프로젝트를 수록합니다. 각 항목은 Jev 가 내리는 구체적 결정과 열어볼 수 있는 근거 링크를 함께 제시합니다. 검증 라벨은 근거의 종류이며 점수가 아닙니다.`,
    evidence: '근거',
    reviewed: '검토일',
    labels: '라벨',
    empty: '공개할 수 있는 항목이 아직 없습니다.',
    categories: '카테고리',
  },
  category: {
    lead: (count) => `이 분류의 ${count}개 항목. 각 항목에 구체적 결정과 열어볼 수 있는 근거 링크가 있습니다.`,
    evidence: '근거',
    labels: '라벨',
    back: '커버리지로 돌아가기',
  },
  entry: {
    evidence: '근거 링크',
    labels: '검증 라벨',
    decision: '구체적 결정',
    category: '분류',
    language: '구현 언어',
    added: '수록일',
    reviewed: '검토일',
    repo: '저장소',
    back: '커버리지로 돌아가기',
    labelsNote: '라벨은 근거의 종류를 나타내며 점수나 순위가 아닙니다.',
  },
};

const DE: JevUiCopy = {
  hub: {
    title: 'Jev-Coverage',
    lead: (total) =>
      `${total} Projekte, jedes nennt die konkrete Entscheidung von Jev und verlinkt einen öffnbaren Beleg. Verifikationslabels beschreiben die Art des Belegs, keine Bewertung.`,
    evidence: 'Beleg',
    reviewed: 'Geprüft',
    labels: 'Labels',
    empty: 'Noch keine öffentlich belegten Einträge.',
    categories: 'Kategorien',
  },
  category: {
    lead: (count) => `${count} Einträge in dieser Kategorie. Jeder nennt die konkrete Entscheidung und verlinkt einen öffnbaren Beleg.`,
    evidence: 'Beleg',
    labels: 'Labels',
    back: 'Zurück zur Coverage',
  },
  entry: {
    evidence: 'Beleg-Link',
    labels: 'Verifikationslabels',
    decision: 'Die Entscheidung',
    category: 'Kategorie',
    language: 'Sprache',
    added: 'Aufgenommen',
    reviewed: 'Geprüft',
    repo: 'Repository',
    back: 'Zurück zur Coverage',
    labelsNote: 'Labels beschreiben die Art des Belegs; sie sind keine Bewertung oder Rangfolge.',
  },
};

const FR: JevUiCopy = {
  hub: {
    title: 'Couverture Jev',
    lead: (total) =>
      `${total} projets, chacun nommant la décision concrète prise par Jev avec un lien de preuve ouvrable. Les étiquettes décrivent la preuve, pas une note.`,
    evidence: 'Preuve',
    reviewed: 'Vérifié le',
    labels: 'Étiquettes',
    empty: 'Aucune entrée publiquement vérifiée pour le moment.',
    categories: 'Catégories',
  },
  category: {
    lead: (count) => `${count} entrées dans cette catégorie. Chacune nomme la décision concrète et renvoie à une preuve ouvrable.`,
    evidence: 'Preuve',
    labels: 'Étiquettes',
    back: 'Retour à la couverture',
  },
  entry: {
    evidence: 'Lien de preuve',
    labels: 'Étiquettes de vérification',
    decision: 'La décision',
    category: 'Catégorie',
    language: 'Langage',
    added: 'Ajouté le',
    reviewed: 'Vérifié le',
    repo: 'Dépôt',
    back: 'Retour à la couverture',
    labelsNote: 'Les étiquettes décrivent le type de preuve ; ce ne sont ni une note ni un classement.',
  },
};

const ES: JevUiCopy = {
  hub: {
    title: 'Cobertura de Jev',
    lead: (total) =>
      `${total} proyectos, cada uno indica la decisión concreta de Jev y enlaza una evidencia abrible. Las etiquetas describen la evidencia, no una puntuación.`,
    evidence: 'Evidencia',
    reviewed: 'Revisado',
    labels: 'Etiquetas',
    empty: 'Todavía no hay entradas verificadas públicamente.',
    categories: 'Categorías',
  },
  category: {
    lead: (count) => `${count} entradas en esta categoría. Cada una indica la decisión concreta y enlaza evidencia abrible.`,
    evidence: 'Evidencia',
    labels: 'Etiquetas',
    back: 'Volver a la cobertura',
  },
  entry: {
    evidence: 'Enlace de evidencia',
    labels: 'Etiquetas de verificación',
    decision: 'La decisión',
    category: 'Categoría',
    language: 'Lenguaje',
    added: 'Añadido',
    reviewed: 'Revisado',
    repo: 'Repositorio',
    back: 'Volver a la cobertura',
    labelsNote: 'Las etiquetas describen el tipo de evidencia; no son una puntuación ni un ranking.',
  },
};

const PT: JevUiCopy = {
  hub: {
    title: 'Cobertura do Jev',
    lead: (total) =>
      `${total} projetos, cada um declara a decisão concreta do Jev e aponta uma evidência abrível. Os rótulos descrevem a evidência, não uma nota.`,
    evidence: 'Evidência',
    reviewed: 'Revisado em',
    labels: 'Rótulos',
    empty: 'Ainda não há entradas verificadas publicamente.',
    categories: 'Categorias',
  },
  category: {
    lead: (count) => `${count} entradas nesta categoria. Cada uma declara a decisão concreta e aponta evidência abrível.`,
    evidence: 'Evidência',
    labels: 'Rótulos',
    back: 'Voltar à cobertura',
  },
  entry: {
    evidence: 'Link da evidência',
    labels: 'Rótulos de verificação',
    decision: 'A decisão',
    category: 'Categoria',
    language: 'Linguagem',
    added: 'Adicionado em',
    reviewed: 'Revisado em',
    repo: 'Repositório',
    back: 'Voltar à cobertura',
    labelsNote: 'Os rótulos descrevem o tipo de evidência; não são uma nota nem um ranking.',
  },
};

const COPY: Record<Lang, JevUiCopy> = {
  en: EN,
  zh: ZH,
  ja: JA,
  ko: KO,
  de: DE,
  fr: FR,
  es: ES,
  pt: PT,
};

export function jevCopy(lang: string): JevUiCopy {
  return COPY[lang as Lang] ?? EN;
}

/**
 * 断言实际渲染出的文字与其语言。
 *
 * registry 里的断言只有 zh / en 两版。非中英语言的页面会渲染英文原文，
 * 这时必须让调用方拿到 `sourceLang: 'en'`，好在 HTML 上用 lang 属性标注，
 * 否则读屏器和翻译引擎会把英文当作页面语言去朗读——这是真实的无障碍缺陷。
 */
export function assertionFor(
  entry: { assertion: Record<string, string> },
  lang: string,
): { text: string; sourceLang: 'zh' | 'en' } {
  if (lang === 'zh' && entry.assertion.zh) {
    return { text: entry.assertion.zh, sourceLang: 'zh' };
  }
  return { text: entry.assertion.en ?? entry.assertion.zh ?? '', sourceLang: 'en' };
}

/** 验证标签的解释；同样 8 语言，缺项回退英文。 */
export const VERIFICATION_MEANING_I18N: Record<VerificationLabel, Record<string, string>> = {
  'public-source': {
    zh: '仓库公开，README 描述了可识别的 Jev 工作流。',
    en: 'The repository is public and its README describes an identifiable Jev workflow.',
    ja: 'リポジトリは公開されており、README に識別可能な Jev のワークフローが書かれています。',
    ko: '저장소가 공개되어 있고 README 에 식별 가능한 Jev 워크플로가 설명되어 있습니다.',
    de: 'Das Repository ist öffentlich und seine README beschreibt einen erkennbaren Jev-Workflow.',
    fr: 'Le dépôt est public et son README décrit un flux Jev identifiable.',
    es: 'El repositorio es público y su README describe un flujo de Jev identificable.',
    pt: 'O repositório é público e seu README descreve um fluxo Jev identificável.',
  },
  'call-site-verified': {
    zh: '已定位到公开代码中调用 Jev 并消费其答案的位置。',
    en: 'Public code that calls Jev and consumes its answer was located.',
    ja: '公開コード内で Jev を呼び出し、その回答を利用している箇所を特定しました。',
    ko: '공개 코드에서 Jev 를 호출하고 그 답을 사용하는 지점을 확인했습니다.',
    de: 'Öffentlicher Code, der Jev aufruft und die Antwort verarbeitet, wurde gefunden.',
    fr: 'Du code public qui appelle Jev et exploite sa réponse a été localisé.',
    es: 'Se localizó código público que llama a Jev y consume su respuesta.',
    pt: 'Foi localizado código público que chama o Jev e consome sua resposta.',
  },
  'demo-only': {
    zh: '有公开演示可观察行为，但未找到可检视的调用点。',
    en: 'A public demo shows the behavior, but no inspectable call site was found.',
    ja: '公開デモで挙動は確認できますが、検証可能な呼び出し箇所は見つかっていません。',
    ko: '공개 데모에서 동작은 확인되지만 검사 가능한 호출 지점은 찾지 못했습니다.',
    de: 'Eine öffentliche Demo zeigt das Verhalten, aber keine prüfbare Aufrufstelle wurde gefunden.',
    fr: 'Une démo publique montre le comportement, mais aucun site d’appel inspectable n’a été trouvé.',
    es: 'Una demo pública muestra el comportamiento, pero no se encontró un punto de llamada inspeccionable.',
    pt: 'Uma demo pública mostra o comportamento, mas nenhum ponto de chamada inspecionável foi encontrado.',
  },
  'readme-claim': {
    zh: '上游自述使用 Jev，调用点尚未核实。',
    en: 'The upstream project states it uses Jev; the call site has not been verified.',
    ja: '上流プロジェクトが Jev の使用を述べていますが、呼び出し箇所は未検証です。',
    ko: '업스트림 프로젝트가 Jev 사용을 밝혔지만 호출 지점은 검증되지 않았습니다.',
    de: 'Das Upstream-Projekt gibt an, Jev zu nutzen; die Aufrufstelle ist nicht geprüft.',
    fr: 'Le projet amont indique utiliser Jev ; le site d’appel n’a pas été vérifié.',
    es: 'El proyecto original indica que usa Jev; el punto de llamada no se ha verificado.',
    pt: 'O projeto original declara usar o Jev; o ponto de chamada não foi verificado.',
  },
  'maintainer-runbook': {
    zh: '上游提供了可执行的安装与运行说明。',
    en: 'The upstream project provides setup and execution instructions.',
    ja: '上流プロジェクトが実行可能な導入と実行手順を提供しています。',
    ko: '업스트림 프로젝트가 실행 가능한 설치 및 실행 절차를 제공합니다.',
    de: 'Das Upstream-Projekt bietet ausführbare Installations- und Ausführungshinweise.',
    fr: 'Le projet amont fournit des instructions d’installation et d’exécution exécutables.',
    es: 'El proyecto original ofrece instrucciones ejecutables de instalación y ejecución.',
    pt: 'O projeto original fornece instruções executáveis de instalação e execução.',
  },
  'reviewer-reproduced': {
    zh: '独立评审者按文档跑通了流程，并记录了日期。',
    en: 'An independent reviewer ran the documented workflow and recorded the date.',
    ja: '独立したレビュアーが文書どおりに実行し、日付を記録しました。',
    ko: '독립 검토자가 문서대로 실행하고 날짜를 기록했습니다.',
    de: 'Eine unabhängige Prüfperson hat den dokumentierten Ablauf ausgeführt und das Datum erfasst.',
    fr: 'Un relecteur indépendant a exécuté le flux documenté et consigné la date.',
    es: 'Un revisor independiente ejecutó el flujo documentado y registró la fecha.',
    pt: 'Um revisor independente executou o fluxo documentado e registrou a data.',
  },
  'author-reported-metric': {
    zh: '数字来自项目作者，未经独立复现。',
    en: 'The number comes from the project author and has not been independently reproduced.',
    ja: '数値はプロジェクト作者によるもので、独立した再現はされていません。',
    ko: '수치는 프로젝트 작성자가 제시한 것으로 독립적으로 재현되지 않았습니다.',
    de: 'Die Zahl stammt vom Projektautor und wurde nicht unabhängig reproduziert.',
    fr: 'Le chiffre provient de l’auteur du projet et n’a pas été reproduit indépendamment.',
    es: 'La cifra proviene del autor del proyecto y no se ha reproducido de forma independiente.',
    pt: 'O número vem do autor do projeto e não foi reproduzido de forma independente.',
  },
  'third-party-reproduced': {
    zh: '有第三方公开来源按可查方法重复了该测量。',
    en: 'A separate public source repeated the measurement with a documented method.',
    ja: '別の公開情報源が文書化された方法で測定を再現しました。',
    ko: '별도의 공개 출처가 문서화된 방법으로 측정을 반복했습니다.',
    de: 'Eine separate öffentliche Quelle hat die Messung mit dokumentierter Methode wiederholt.',
    fr: 'Une source publique distincte a répété la mesure avec une méthode documentée.',
    es: 'Una fuente pública distinta repitió la medición con un método documentado.',
    pt: 'Uma fonte pública separada repetiu a medição com um método documentado.',
  },
};

export function verificationMeaning(label: VerificationLabel, lang: string): string {
  return VERIFICATION_MEANING_I18N[label]?.[lang] ?? VERIFICATION_MEANING_I18N[label].en;
}
