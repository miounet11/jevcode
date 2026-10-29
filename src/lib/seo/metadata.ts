/**
 * /jev 覆盖枢纽的 SEO 元数据。
 *
 * 这里不写任何独立文案：标题与描述全部从 registry 派生，
 * 保证页面上看到的内容与 head 里的内容同源。
 */
import type { Lang } from '../../i18n/ui';
import {
  categoryLabel,
  COVERAGE_ENTRIES,
  REGISTRY_REVIEWED_AT,
  type Category,
  type CoverageEntry,
} from '../content/registry';

const HEAD_COPY: Record<Lang, { title: string; description: string }> = {
  en: {
    title: 'Jev coverage: projects, SDKs and models that use typed decisions',
    description:
      'A reviewed index of projects built on Jev. Every entry states the specific decision Jev makes, links to the strongest public evidence, and carries verification labels instead of a score.',
  },
  zh: {
    title: 'Jev 覆盖地图：使用类型化决策的项目、SDK 与模型',
    description:
      '经复核的 Jev 项目索引。每条都写明 Jev 做的具体决策、给出最强公开证据链接，并以验证标签标注证据强度，而不是打分。',
  },
  ja: {
    title: 'Jev カバレッジ：型付き意思決定を使うプロジェクト・SDK・モデル',
    description:
      'レビュー済みの Jev プロジェクト索引。各項目は Jev が行う具体的な判断、最も強い公開根拠へのリンク、証拠の強さを示す検証ラベルを持ちます。',
  },
  ko: {
    title: 'Jev 커버리지: 타입화된 결정을 쓰는 프로젝트·SDK·모델',
    description:
      '검토된 Jev 프로젝트 색인. 각 항목은 Jev 가 내리는 구체적 결정, 가장 강한 공개 근거 링크, 점수가 아닌 검증 라벨을 함께 표시합니다.',
  },
  de: {
    title: 'Jev-Coverage: Projekte, SDKs und Modelle mit typisierten Entscheidungen',
    description:
      'Ein geprüfter Index von Jev-Projekten. Jeder Eintrag nennt die konkrete Entscheidung, verlinkt den stärksten öffentlichen Beleg und trägt Verifikationslabels statt einer Bewertung.',
  },
  fr: {
    title: 'Couverture Jev : projets, SDK et modèles à décisions typées',
    description:
      "Un index vérifié de projets construits sur Jev. Chaque entrée énonce la décision concrète, renvoie à la meilleure preuve publique et porte des étiquettes de vérification, pas une note.",
  },
  es: {
    title: 'Cobertura de Jev: proyectos, SDK y modelos con decisiones tipadas',
    description:
      'Un índice revisado de proyectos construidos sobre Jev. Cada entrada indica la decisión concreta, enlaza la mejor evidencia pública y lleva etiquetas de verificación, no una puntuación.',
  },
  pt: {
    title: 'Cobertura Jev: projetos, SDKs e modelos com decisões tipadas',
    description:
      'Um índice revisado de projetos construídos sobre Jev. Cada entrada declara a decisão concreta, aponta a melhor evidência pública e traz rótulos de verificação, não uma nota.',
  },
};

export function hubTitle(lang: Lang): string {
  return HEAD_COPY[lang]?.title ?? HEAD_COPY.en.title;
}

export function hubDescription(lang: Lang): string {
  return HEAD_COPY[lang]?.description ?? HEAD_COPY.en.description;
}

/**
 * 条目页的框架文案是本地化的，但断言本身只有中英两版。
 * 非中英语言据此拼出本语言的标题框，断言保留原文——这比把英文
 * 断言直接当标题更诚实，也让每个 locale 的 title 有本语言信号。
 */
const ENTRY_FRAME: Record<Lang, { reviewed: string; evidence: string }> = {
  en: { reviewed: 'reviewed', evidence: 'Evidence' },
  zh: { reviewed: '复核于', evidence: '证据' },
  ja: { reviewed: 'レビュー日', evidence: '根拠' },
  ko: { reviewed: '검토일', evidence: '근거' },
  de: { reviewed: 'geprüft', evidence: 'Beleg' },
  fr: { reviewed: 'vérifié le', evidence: 'Preuve' },
  es: { reviewed: 'revisado', evidence: 'Evidencia' },
  pt: { reviewed: 'revisado em', evidence: 'Evidência' },
};

/** 各语言的短品牌词，只用于 title 后缀，避免整句描述把 title 撑爆。 */
const SHORT_BRAND: Record<Lang, string> = {
  en: 'Jev coverage',
  zh: 'Jev 覆盖',
  ja: 'Jev カバレッジ',
  ko: 'Jev 커버리지',
  de: 'Jev-Coverage',
  fr: 'Couverture Jev',
  es: 'Cobertura de Jev',
  pt: 'Cobertura do Jev',
};

/**
 * 标题里的断言要截断：断言是整句，原文直接进 title 会到 140+ 字符，
 * 搜索结果只显示前 60 左右，后面全被切掉。
 * CJK 按字数算，拉丁按词边界切，避免切出半截单词。
 */
function clipAssertion(text: string, isCjk: boolean): string {
  if (isCjk) return text.length <= 48 ? text : `${text.slice(0, 48)}…`;
  if (text.length <= 92) return text;
  const cut = text.slice(0, 92);
  const at = cut.lastIndexOf(' ');
  return `${(at > 60 ? cut.slice(0, at) : cut).replace(/[,;:.\s]+$/, '')}…`;
}

/** 详情页标题：项目名 + 截断后的断言 + 本语言短品牌词。 */
export function entryTitle(lang: Lang, entry: CoverageEntry): string {
  const isCjk = lang === 'zh' || lang === 'ja' || lang === 'ko';
  const label = clipAssertion(entry.assertion[lang === 'zh' ? 'zh' : 'en'], isCjk);
  const suffix = lang === 'en' ? '' : ` · ${SHORT_BRAND[lang]}`;
  return `${entry.name} — ${label}${suffix}`;
}

export function entryDescription(lang: Lang, entry: CoverageEntry): string {
  const assertion = entry.assertion[lang === 'zh' ? 'zh' : 'en'];
  const frame = ENTRY_FRAME[lang] ?? ENTRY_FRAME.en;
  return `${entry.name}: ${assertion} ${frame.evidence}: ${entry.evidenceUrl} (${frame.reviewed} ${entry.reviewedAt}).`;
}

/** 分类落地页标题：分类名 + 本语言枢纽标题，避免与枢纽页标题重复。 */
export function categoryTitle(lang: Lang, category: Category): string {
  return `${categoryLabel(category, lang)} · ${hubTitle(lang)}`;
}

export function categoryDescription(lang: Lang, category: Category, count: number): string {
  const label = categoryLabel(category, lang);
  if (lang === 'zh') {
    return `${label}分类下 ${count} 个 Jev 覆盖条目，每条写明 Jev 做的具体决策并给出公开证据链接。`;
  }
  return `${count} Jev coverage entries in ${label}, each naming the specific decision with a public evidence link.`;
}

/** 页面上展示的收录统计，供跨语言一致引用。 */
export function coverageStats() {
  return {
    total: COVERAGE_ENTRIES.length,
    reviewedAt: REGISTRY_REVIEWED_AT,
  };
}
