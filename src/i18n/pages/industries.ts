import type { Localized } from '../ui';

export const title: Localized<string> = {
  en: 'Industry cases',
  zh: '行业案例',
  ja: '業界ケース',
  ko: '산업 사례',
  de: 'Branchenfälle',
  fr: 'Cas sectoriels',
  es: 'Casos por industria',
  pt: 'Casos por setor',
};

export const description: Localized<string> = {
  en: 'Eighteen production industry cases for clavue-jev: region, compliance, latency, and the share of traffic that never reaches a heavy LLM.',
  zh: '十八个 clavue-jev 生产行业案例：区域、合规、时延，以及不必进入重型大模型的流量比例。',
  ja: 'clavue-jev の本番業界ケース 18 件。地域、コンプライアンス、レイテンシ、重い LLM に渡さないトラフィック比率。',
  ko: 'clavue-jev 프로덕션 산업 사례 18건. 지역, 컴플라이언스, 지연, 무거운 LLM 으로 가지 않는 트래픽 비율.',
  de: 'Achtzehn Produktionsfälle für clavue-jev: Region, Compliance, Latenz und der Anteil, der nie ein schweres LLM erreicht.',
  fr: 'Dix-huit cas de production pour clavue-jev : région, conformité, latence et part du trafic qui n’atteint jamais un LLM lourd.',
  es: 'Dieciocho casos de producción con clavue-jev: región, cumplimiento, latencia y la parte del tráfico que nunca llega a un LLM pesado.',
  pt: 'Dezoito casos de produção com clavue-jev: região, conformidade, latência e a fatia de tráfego que nunca chega a um LLM pesado.',
};

export const eyebrow: Localized<string> = {
  en: 'Industries',
  zh: '行业',
  ja: '業界',
  ko: '산업',
  de: 'Branchen',
  fr: 'Secteurs',
  es: 'Industrias',
  pt: 'Setores',
};

export const lead: Localized<string> = {
  en: 'Each case shows where a structured Jev gate sits in front of a slower model: the problem, the architecture, the business impact, a JSON payload, and runnable integration code.',
  zh: '每个案例说明结构化 Jev 门控如何挡在更慢的模型前面：问题、架构、业务影响、JSON 载荷与可运行的接入代码。',
  ja: '各ケースは、遅いモデルの前に構造化 Jev ゲートを置く位置を示します。課題、アーキテクチャ、事業インパクト、JSON ペイロード、実行できる統合コード。',
  ko: '각 사례는 느린 모델 앞에 구조화 Jev 게이트를 두는 위치를 보여 줍니다. 문제, 아키텍처, 사업 영향, JSON 페이로드, 실행 가능한 연동 코드.',
  de: 'Jeder Fall zeigt, wo ein strukturiertes Jev-Gate vor einem langsameren Modell steht: Problem, Architektur, Wirkung, JSON-Payload und lauffähiger Integrationscode.',
  fr: 'Chaque cas montre où une porte Jev structurée se place devant un modèle plus lent : problème, architecture, impact, charge JSON et code d’intégration exécutable.',
  es: 'Cada caso muestra dónde se sitúa una puerta Jev estructurada delante de un modelo más lento: problema, arquitectura, impacto, carga JSON y código de integración ejecutable.',
  pt: 'Cada caso mostra onde um portão Jev estruturado fica à frente de um modelo mais lento: problema, arquitetura, impacto, payload JSON e código de integração executável.',
};

export const filterAll: Localized<string> = {
  en: 'All sectors',
  zh: '全部行业',
  ja: 'すべての分野',
  ko: '모든 분야',
  de: 'Alle Branchen',
  fr: 'Tous les secteurs',
  es: 'Todos los sectores',
  pt: 'Todos os setores',
};

export const searchPlaceholder: Localized<string> = {
  en: 'Search cases, regions, compliance…',
  zh: '搜索案例、区域、合规…',
  ja: 'ケース、地域、コンプライアンスを検索…',
  ko: '사례, 지역, 컴플라이언스 검색…',
  de: 'Fälle, Regionen, Compliance suchen…',
  fr: 'Rechercher cas, régions, conformité…',
  es: 'Buscar casos, regiones, cumplimiento…',
  pt: 'Buscar casos, regiões, conformidade…',
};

export const colRegion: Localized<string> = {
  en: 'Region',
  zh: '区域',
  ja: '地域',
  ko: '지역',
  de: 'Region',
  fr: 'Région',
  es: 'Región',
  pt: 'Região',
};

export const colCompliance: Localized<string> = {
  en: 'Compliance',
  zh: '合规',
  ja: 'コンプライアンス',
  ko: '컴플라이언스',
  de: 'Compliance',
  fr: 'Conformité',
  es: 'Cumplimiento',
  pt: 'Conformidade',
};

export const colLatency: Localized<string> = {
  en: 'Latency',
  zh: '时延',
  ja: 'レイテンシ',
  ko: '지연',
  de: 'Latenz',
  fr: 'Latence',
  es: 'Latencia',
  pt: 'Latência',
};

export const colBypass: Localized<string> = {
  en: 'LLM bypass',
  zh: '绕过重型模型',
  ja: 'LLM バイパス',
  ko: 'LLM 우회',
  de: 'LLM-Bypass',
  fr: 'Contournement LLM',
  es: 'Bypass de LLM',
  pt: 'Bypass de LLM',
};

export const problemHeading: Localized<string> = {
  en: 'Problem',
  zh: '问题',
  ja: '課題',
  ko: '문제',
  de: 'Problem',
  fr: 'Problème',
  es: 'Problema',
  pt: 'Problema',
};

export const solutionHeading: Localized<string> = {
  en: 'Architecture solution',
  zh: '架构方案',
  ja: 'アーキテクチャ上の解決',
  ko: '아키텍처 해법',
  de: 'Architekturlösung',
  fr: 'Solution d’architecture',
  es: 'Solución de arquitectura',
  pt: 'Solução de arquitetura',
};

export const impactHeading: Localized<string> = {
  en: 'Business impact',
  zh: '业务影响',
  ja: '事業インパクト',
  ko: '사업 영향',
  de: 'Geschäftliche Wirkung',
  fr: 'Impact métier',
  es: 'Impacto de negocio',
  pt: 'Impacto de negócio',
};

export const payloadHeading: Localized<string> = {
  en: 'Jev JSON payload',
  zh: 'Jev JSON 载荷',
  ja: 'Jev JSON ペイロード',
  ko: 'Jev JSON 페이로드',
  de: 'Jev-JSON-Payload',
  fr: 'Charge JSON Jev',
  es: 'Carga JSON de Jev',
  pt: 'Payload JSON do Jev',
};

export const codeHeading: Localized<string> = {
  en: 'Runnable integration code',
  zh: '可运行的接入代码',
  ja: '実行できる統合コード',
  ko: '실행 가능한 연동 코드',
  de: 'Lauffähiger Integrationscode',
  fr: 'Code d’intégration exécutable',
  es: 'Código de integración ejecutable',
  pt: 'Código de integração executável',
};

export const recommendedStackHeading: Localized<string> = {
  en: 'Recommended stack',
  zh: '推荐组合',
  ja: '推奨スタック',
  ko: '권장 스택',
  de: 'Empfohlener Stack',
  fr: 'Pile recommandée',
  es: 'Pila recomendada',
  pt: 'Pilha recomendada',
};

export const gpuLinkLabel: Localized<string> = {
  en: 'GPU profile',
  zh: 'GPU 档案',
  ja: 'GPU プロファイル',
  ko: 'GPU 프로필',
  de: 'GPU-Profil',
  fr: 'Profil GPU',
  es: 'Perfil de GPU',
  pt: 'Perfil de GPU',
};

export const recipeLinkLabel: Localized<string> = {
  en: 'Code recipe',
  zh: '代码配方',
  ja: 'コードレシピ',
  ko: '코드 레시피',
  de: 'Code-Rezept',
  fr: 'Recette de code',
  es: 'Receta de código',
  pt: 'Receita de código',
};

export const copyBtn: Localized<string> = {
  en: 'Copy',
  zh: '复制',
  ja: 'コピー',
  ko: '복사',
  de: 'Kopieren',
  fr: 'Copier',
  es: 'Copiar',
  pt: 'Copiar',
};

export const copiedBtn: Localized<string> = {
  en: 'Copied',
  zh: '已复制',
  ja: 'コピーしました',
  ko: '복사됨',
  de: 'Kopiert',
  fr: 'Copié',
  es: 'Copiado',
  pt: 'Copiado',
};

export const openWorkbench: Localized<string> = {
  en: 'Build this stack in Workbench',
  zh: '在工作台生成该行业配置',
  ja: 'このスタックを Workbench で生成',
  ko: '이 스택을 워크벤치에서 생성',
  de: 'Diesen Stack im Workbench erstellen',
  fr: 'Générer cette pile dans Workbench',
  es: 'Generar esta pila en Workbench',
  pt: 'Gerar esta pilha no Workbench',
};

export const backToHub: Localized<string> = {
  en: 'All industry cases',
  zh: '全部行业案例',
  ja: 'すべての業界ケース',
  ko: '모든 산업 사례',
  de: 'Alle Branchenfälle',
  fr: 'Tous les cas sectoriels',
  es: 'Todos los casos',
  pt: 'Todos os casos',
};

export const viewCase: Localized<string> = {
  en: 'View case',
  zh: '查看案例',
  ja: 'ケースを見る',
  ko: '사례 보기',
  de: 'Fall ansehen',
  fr: 'Voir le cas',
  es: 'Ver caso',
  pt: 'Ver caso',
};

export const ctaTitle: Localized<string> = {
  en: 'Run this gate on your own traffic',
  zh: '用你自己的流量跑这条门控',
  ja: '自社トラフィックでこのゲートを動かす',
  ko: '자체 트래픽으로 이 게이트를 실행',
  de: 'Dieses Gate mit eigenem Traffic ausführen',
  fr: 'Exécuter cette porte sur votre trafic',
  es: 'Ejecuta esta puerta con tu propio tráfico',
  pt: 'Execute este portão no seu próprio tráfego',
};

export const ctaLead: Localized<string> = {
  en: 'New accounts include ${credit} of API credit. Try a judgment in the browser, or register and call POST /v1/judge.',
  zh: '新账户含 ${credit} API 额度。可在浏览器里直接试一次判断，或注册后调用 POST /v1/judge。',
  ja: '新規アカウントには ${credit} の API クレジットが含まれます。ブラウザで判断を試すか、登録して POST /v1/judge を呼び出します。',
  ko: '신규 계정에 ${credit} API 크레딧이 포함됩니다. 브라우저에서 판단을 시험하거나 등록 후 POST /v1/judge 를 호출하세요.',
  de: 'Neue Konten enthalten ${credit} API-Guthaben. Urteil im Browser testen oder registrieren und POST /v1/judge aufrufen.',
  fr: 'Les nouveaux comptes incluent ${credit} de crédit API. Essayez un jugement dans le navigateur, ou inscrivez-vous et appelez POST /v1/judge.',
  es: 'Las cuentas nuevas incluyen ${credit} de crédito de API. Prueba un juicio en el navegador o regístrate y llama a POST /v1/judge.',
  pt: 'Contas novas incluem ${credit} de crédito de API. Experimente um julgamento no navegador ou registre-se e chame POST /v1/judge.',
};

export const ctaTry: Localized<string> = {
  en: 'Try it',
  zh: '立即试',
  ja: '試す',
  ko: '지금 시험',
  de: 'Ausprobieren',
  fr: 'Essayer',
  es: 'Probar',
  pt: 'Experimentar',
};

export const ctaRegister: Localized<string> = {
  en: 'Create account',
  zh: '注册账户',
  ja: 'アカウント作成',
  ko: '계정 만들기',
  de: 'Konto erstellen',
  fr: 'Créer un compte',
  es: 'Crear cuenta',
  pt: 'Criar conta',
};
