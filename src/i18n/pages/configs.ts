import type { Localized } from '../ui';

/** {credit} 由页面替换为不含 $ 的金额（例如 5.00），文案里只保留一个 $。 */
export const title: Localized<string> = {
  en: 'Scenario configuration library',
  zh: '场景配置库',
  ja: 'シナリオ設定ライブラリ',
  ko: '시나리오 구성 라이브러리',
  de: 'Szenario-Konfigurationsbibliothek',
  fr: 'Bibliothèque de configurations par scénario',
  es: 'Biblioteca de configuraciones por escenario',
  pt: 'Biblioteca de configurações por cenário',
};

export const description: Localized<string> = {
  en: '20 copy-ready scenario configs with measured completion readiness, auto-handled / escalation splits, latency targets, cost per million tokens, and 2026–2027+ future upgrade configs.',
  zh: '20 套可直接复制的场景配置，标注完成度、自动处理 / 升级人工的比例、时延目标与每百万 token 成本，并附 2026–2027+ 未来升级配置。',
  ja: '20 のすぐ使えるシナリオ設定。完了度、自動処理／エスカレーションの比率、レイテンシ目標、100 万トークンあたりのコスト、2026–2027+ の将来アップグレード設定を掲載。',
  ko: '20개의 바로 복사 가능한 시나리오 구성. 완료도, 자동 처리／에스컬레이션 비율, 지연 목표, 백만 토큰당 비용, 2026–2027+ 미래 업그레이드 구성을 제공합니다.',
  de: '20 sofort kopierbare Szenario-Konfigurationen mit gemessener Abschlussbereitschaft, Auto-/Eskalierungsanteil, Latenzzielen, Kosten pro Million Tokens und 2026–2027+ Zukunfts-Upgrades.',
  fr: '20 configurations prêtes à copier avec taux de complétion, répartition auto / escalade, cibles de latence, coût par million de jetons et configs d’évolution 2026–2027+.',
  es: '20 configuraciones listas para copiar con porcentaje de finalización, reparto auto / escalado, objetivos de latencia, coste por millón de tokens y configs futuras 2026–2027+.',
  pt: '20 configurações prontas para copiar com grau de conclusão, divisão automático / escalonamento, metas de latência, custo por milhão de tokens e configs futuras 2026–2027+.',
};

export const eyebrow: Localized<string> = {
  en: 'Configurations · measured readiness',
  zh: '配置 · 可量化就绪度',
  ja: '設定 · 測定済みレディネス',
  ko: '구성 · 측정된 준비도',
  de: 'Konfigurationen · gemessene Bereitschaft',
  fr: 'Configurations · maturité mesurée',
  es: 'Configuraciones · madurez medida',
  pt: 'Configurações · prontidão medida',
};

export const lead: Localized<string> = {
  en: 'Every scenario ships with a quantified completion bar, an auto-handled versus escalated split, a latency target, and both a production config and a 2026–2027+ future upgrade config.',
  zh: '每个场景都给出可量化的完成度进度条、自动处理与人工升级的拆分、时延目标，以及生产配置与 2026–2027+ 未来升级配置两份可复制文件。',
  ja: '各シナリオには、定量化された完了バー、自動処理とエスカレーションの内訳、レイテンシ目標、本番設定と 2026–2027+ 将来アップグレード設定の両方が付属します。',
  ko: '모든 시나리오에 정량화된 완료 막대, 자동 처리／에스컬레이션 비율, 지연 목표, 프로덕션 구성과 2026–2027+ 미래 업그레이드 구성이 함께 제공됩니다.',
  de: 'Jedes Szenario liefert einen quantifizierten Fortschrittsbalken, die Aufteilung Auto versus Eskalation, ein Latenzziel sowie eine Produktions- und eine 2026–2027+ Zukunftskonfiguration.',
  fr: 'Chaque scénario fournit une barre de complétion chiffrée, la répartition auto / escalade, une cible de latence, ainsi qu’une config de production et une config d’évolution 2026–2027+.',
  es: 'Cada escenario incluye una barra de finalización cuantificada, el reparto auto / escalado, un objetivo de latencia, y una config de producción y otra de evolución 2026–2027+.',
  pt: 'Cada cenário traz uma barra de conclusão quantificada, a divisão automático / escalonamento, uma meta de latência, além de uma config de produção e outra de evolução 2026–2027+.',
};

export const filterAll: Localized<string> = {
  en: 'All', zh: '全部', ja: 'すべて', ko: '전체', de: 'Alle', fr: 'Tout', es: 'Todo', pt: 'Tudo',
};

export const maturityProduction: Localized<string> = {
  en: 'Production ready',
  zh: '生产就绪',
  ja: '本番対応',
  ko: '프로덕션 준비',
  de: 'Produktionsreif',
  fr: 'Prêt pour la production',
  es: 'Listo para producción',
  pt: 'Pronto para produção',
};

export const maturityHybrid: Localized<string> = {
  en: 'Hybrid assisted',
  zh: '人机协同',
  ja: 'ハイブリッド支援',
  ko: '하이브리드 지원',
  de: 'Hybrid unterstützt',
  fr: 'Assistance hybride',
  es: 'Asistencia híbrida',
  pt: 'Assistência híbrida',
};

export const maturityFuture: Localized<string> = {
  en: 'Future roadmap',
  zh: '未来路线图',
  ja: '将来ロードマップ',
  ko: '미래 로드맵',
  de: 'Zukunfts-Roadmap',
  fr: 'Feuille de route future',
  es: 'Hoja de ruta futura',
  pt: 'Roteiro futuro',
};

export const searchPlaceholder: Localized<string> = {
  en: 'Search 20 configs…',
  zh: '搜索 20 套配置…',
  ja: '20 件の設定を検索…',
  ko: '20개 구성 검색…',
  de: '20 Konfigurationen suchen…',
  fr: 'Rechercher 20 configs…',
  es: 'Buscar 20 configs…',
  pt: 'Buscar 20 configs…',
};

export const completionLabel: Localized<string> = {
  en: 'Completion readiness',
  zh: '完成就绪度',
  ja: '完了レディネス',
  ko: '완료 준비도',
  de: 'Abschlussbereitschaft',
  fr: 'Maturity de complétion',
  es: 'Madurez de finalización',
  pt: 'Prontidão de conclusão',
};

export const autoHandledLabel: Localized<string> = {
  en: 'Auto-handled',
  zh: '自动处理',
  ja: '自動処理',
  ko: '자동 처리',
  de: 'Automatisch erledigt',
  fr: 'Traité automatiquement',
  es: 'Gestionado automáticamente',
  pt: 'Tratado automaticamente',
};

export const escalationLabel: Localized<string> = {
  en: 'Escalated',
  zh: '升级人工',
  ja: 'エスカレーション',
  ko: '에스컬레이션',
  de: 'Eskaliert',
  fr: 'Escaladé',
  es: 'Escalado',
  pt: 'Escalonado',
};

export const latencyLabel: Localized<string> = {
  en: 'Latency', zh: '时延', ja: 'レイテンシ', ko: '지연', de: 'Latenz', fr: 'Latence', es: 'Latencia', pt: 'Latência',
};

export const costLabel: Localized<string> = {
  en: 'Cost', zh: '成本', ja: 'コスト', ko: '비용', de: 'Kosten', fr: 'Coût', es: 'Coste', pt: 'Custo',
};

export const summaryHeading: Localized<string> = {
  en: 'Overview',
  zh: '方案概览',
  ja: '概要',
  ko: '개요',
  de: 'Überblick',
  fr: 'Aperçu',
  es: 'Resumen',
  pt: 'Visão geral',
};

export const readinessHeading: Localized<string> = {
  en: 'Completion readiness breakdown',
  zh: '完成就绪度拆解',
  ja: '完了レディネスの内訳',
  ko: '완료 준비도 분석',
  de: 'Aufschlüsselung der Abschlussbereitschaft',
  fr: 'Détail de la maturité de complétion',
  es: 'Desglose de la madurez de finalización',
  pt: 'Detalhamento da prontidão de conclusão',
};

export const currentConfigHeading: Localized<string> = {
  en: 'Production config',
  zh: '生产配置',
  ja: '本番設定',
  ko: '프로덕션 구성',
  de: 'Produktionskonfiguration',
  fr: 'Configuration de production',
  es: 'Configuración de producción',
  pt: 'Configuração de produção',
};

export const futureConfigHeading: Localized<string> = {
  en: '2026–2027+ future upgrade config',
  zh: '2026–2027+ 未来升级配置',
  ja: '2026–2027+ 将来アップグレード設定',
  ko: '2026–2027+ 미래 업그레이드 구성',
  de: '2026–2027+ Zukunfts-Upgrade-Konfiguration',
  fr: 'Config d’évolution future 2026–2027+',
  es: 'Config de evolución futura 2026–2027+',
  pt: 'Config de evolução futura 2026–2027+',
};

export const futureEvolutionHeading: Localized<string> = {
  en: 'Future evolution',
  zh: '未来演进',
  ja: '将来の進化',
  ko: '미래 진화',
  de: 'Zukünftige Entwicklung',
  fr: 'Évolution future',
  es: 'Evolución futura',
  pt: 'Evolução futura',
};

export const futureRoadmapBannerTitle: Localized<string> = {
  en: '2026–2027+ future configurations',
  zh: '2026–2027+ 未来配置',
  ja: '2026–2027+ 将来設定',
  ko: '2026–2027+ 미래 구성',
  de: '2026–2027+ Zukunftskonfigurationen',
  fr: 'Configurations futures 2026–2027+',
  es: 'Configuraciones futuras 2026–2027+',
  pt: 'Configurações futuras 2026–2027+',
};

export const futureRoadmapBannerLead: Localized<string> = {
  en: 'Native multimodal routing and autonomous agent-fleet governance: keep clavue-jev as System One today, then adopt the staged 2026–2027 upgrades from these blueprints.',
  zh: '原生多模态路由与自主智能体集群治理：今天把 clavue-jev 留在 System One，随后按这些蓝图分阶段引入 2026–2027 升级。',
  ja: 'ネイティブマルチモーダルルーティングと自律エージェント群のガバナンス。今は clavue-jev を System One に置き、段階的な 2026–2027 アップグレードをこれらの設計図から取り入れます。',
  ko: '네이티브 멀티모달 라우팅과 자율 에이전트 플릿 거버넌스: 지금은 clavue-jev를 System One에 두고, 이 청사진에서 단계적인 2026–2027 업그레이드를 도입하세요.',
  de: 'Natives Multimodal-Routing und autonome Agent-Fleet-Governance: clavue-jev bleibt heute System One, danach übernehmen Sie die gestaffelten 2026–2027-Upgrades aus diesen Blaupausen.',
  fr: 'Routage multimodal natif et gouvernance autonome de flottes d’agents : gardez clavue-jev comme System One aujourd’hui, puis adoptez les évolutions 2026–2027 par étapes depuis ces modèles.',
  es: 'Enrutamiento multimodal nativo y gobernanza autónoma de flotas de agentes: mantenga clavue-jev como System One hoy y adopte las mejoras 2026–2027 por fases desde estos planos.',
  pt: 'Roteamento multimodal nativo e governança autônoma de frotas de agentes: mantenha o clavue-jev como System One hoje e adote as atualizações 2026–2027 por etapas a partir destes planos.',
};

export const copyBtn: Localized<string> = {
  en: 'Copy', zh: '复制', ja: 'コピー', ko: '복사', de: 'Kopieren', fr: 'Copier', es: 'Copiar', pt: 'Copiar',
};

export const copiedBtn: Localized<string> = {
  en: 'Copied', zh: '已复制', ja: 'コピー済み', ko: '복사됨', de: 'Kopiert', fr: 'Copié', es: 'Copiado', pt: 'Copiado',
};

export const backToHub: Localized<string> = {
  en: 'Scenario configs',
  zh: '场景配置',
  ja: 'シナリオ設定',
  ko: '시나리오 구성',
  de: 'Szenario-Konfigurationen',
  fr: 'Configurations par scénario',
  es: 'Configuraciones por escenario',
  pt: 'Configurações por cenário',
};

export const viewConfig: Localized<string> = {
  en: 'View config',
  zh: '查看配置',
  ja: '設定を見る',
  ko: '구성 보기',
  de: 'Konfiguration ansehen',
  fr: 'Voir la config',
  es: 'Ver configuración',
  pt: 'Ver configuração',
};

export const home: Localized<string> = {
  en: 'Home', zh: '首页', ja: 'ホーム', ko: '홈', de: 'Start', fr: 'Accueil', es: 'Inicio', pt: 'Início',
};

export const noMatch: Localized<string> = {
  en: 'No configs match this filter.',
  zh: '没有符合筛选的配置。',
  ja: '条件に一致する設定はありません。',
  ko: '필터와 일치하는 구성이 없습니다.',
  de: 'Keine Konfiguration entspricht diesem Filter.',
  fr: 'Aucune configuration ne correspond à ce filtre.',
  es: 'Ninguna configuración coincide con este filtro.',
  pt: 'Nenhuma configuração corresponde a este filtro.',
};

export const vibecodingLink: Localized<string> = {
  en: 'Vibe-coding guide',
  zh: 'Vibe 编程指南',
  ja: 'バイブコーディングガイド',
  ko: '바이브 코딩 가이드',
  de: 'Vibe-Coding-Anleitung',
  fr: 'Guide de vibe-coding',
  es: 'Guía de vibe-coding',
  pt: 'Guia de vibe-coding',
};

export const heroAlt: Localized<string> = {
  en: 'Scenario configuration readiness dashboard with completion bars and auto-handled splits',
  zh: '场景配置就绪度面板，展示完成度进度条与自动处理占比',
  ja: '完了バーと自動処理の内訳を示すシナリオ設定レディネス画面',
  ko: '완료 막대와 자동 처리 비율을 보여주는 시나리오 구성 준비도 대시보드',
  de: 'Dashboard zur Szenario-Bereitschaft mit Fortschrittsbalken und Auto-Anteilen',
  fr: 'Tableau de bord de maturité des configurations avec barres de complétion et répartition auto',
  es: 'Panel de madurez de configuraciones con barras de finalización y reparto automático',
  pt: 'Painel de prontidão das configurações com barras de conclusão e divisão automática',
};

export const futureAlt: Localized<string> = {
  en: '2026–2027+ future configuration roadmap for multimodal routing and autonomous agents',
  zh: '面向多模态路由与自主智能体的 2026–2027+ 未来配置路线图',
  ja: 'マルチモーダルルーティングと自律エージェント向けの 2026–2027+ 将来設定ロードマップ',
  ko: '멀티모달 라우팅과 자율 에이전트를 위한 2026–2027+ 미래 구성 로드맵',
  de: '2026–2027+ Zukunfts-Roadmap für multimodales Routing und autonome Agenten',
  fr: 'Feuille de route 2026–2027+ pour le routage multimodal et les agents autonomes',
  es: 'Hoja de ruta 2026–2027+ para enrutamiento multimodal y agentes autónomos',
  pt: 'Roteiro 2026–2027+ para roteamento multimodal e agentes autônomos',
};

export const ctaTitle: Localized<string> = {
  en: 'Put this config to work today',
  zh: '今天就让这套配置跑起来',
  ja: 'この設定を今日から動かす',
  ko: '이 구성을 오늘 바로 사용하세요',
  de: 'Setzen Sie diese Konfiguration noch heute ein',
  fr: 'Mettez cette configuration en service dès aujourd’hui',
  es: 'Ponga esta configuración en marcha hoy mismo',
  pt: 'Coloque esta configuração em produção hoje mesmo',
};

export const ctaLead: Localized<string> = {
  en: 'New accounts include ${credit} in free API credit for POST /v1/judge.',
  zh: '新账户含 ${credit} 免费 API 额度，可直接调用 POST /v1/judge。',
  ja: '新規アカウントには ${credit} の無料 API クレジットが付き、POST /v1/judge をすぐ呼べます。',
  ko: '새 계정에 ${credit} 무료 API 크레딧이 포함되며 POST /v1/judge 를 바로 호출할 수 있습니다.',
  de: 'Neue Konten enthalten ${credit} kostenloses API-Guthaben für POST /v1/judge.',
  fr: 'Les nouveaux comptes incluent ${credit} de crédit API gratuit pour POST /v1/judge.',
  es: 'Las cuentas nuevas incluyen ${credit} de crédito API gratis para POST /v1/judge.',
  pt: 'Contas novas incluem ${credit} de crédito API grátis para POST /v1/judge.',
};

export const ctaTry: Localized<string> = {
  en: 'Try it', zh: '立即试', ja: '試す', ko: '체험', de: 'Ausprobieren', fr: 'Essayer', es: 'Probar', pt: 'Experimentar',
};

export const ctaRegister: Localized<string> = {
  en: 'Create account', zh: '注册账户', ja: 'アカウント作成', ko: '계정 만들기', de: 'Konto erstellen', fr: 'Créer un compte', es: 'Crear cuenta', pt: 'Criar conta',
};
