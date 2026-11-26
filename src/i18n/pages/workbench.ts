import type { Localized } from '../ui';

/** ${credit} 由页面替换为不含 $ 的金额（例如 5.00），文案里只保留一个 $。 */

export const title: Localized<string> = {
  en: 'AI Stack & Config Workbench',
  zh: 'AI 技术栈与配置工作台',
  ja: 'AI スタック＆設定ワークベンチ',
  ko: 'AI 스택 및 구성 워크벤치',
  de: 'AI-Stack & Konfigurations-Workbench',
  fr: 'Atelier de configuration et de stack IA',
  es: 'Banco de trabajo de stack y configuración IA',
  pt: 'Bancada de configuração e stack de IA',
};

export const description: Localized<string> = {
  en: 'Interactive workbench: pick a scenario, GPU, language stack, and IDE, then simulate readiness and cost and export a complete JevCode starter bundle.',
  zh: '交互式工作台：选择场景、显卡、语言技术栈与 IDE，实时模拟完成度与成本，并导出完整的 JevCode 启动包。',
  ja: '対話型ワークベンチ。シナリオ、GPU、言語スタック、IDE を選び、レディネスとコストをシミュレーションして、完全な JevCode スターターバンドルを書き出せます。',
  ko: '대화형 워크벤치: 시나리오, GPU, 언어 스택, IDE를 선택한 뒤 준비도와 비용을 시뮬레이션하고 완전한 JevCode 스타터 번들을 내보냅니다.',
  de: 'Interaktiver Workbench: Szenario, GPU, Sprach-Stack und IDE wählen, Bereitschaft und Kosten simulieren und ein vollständiges JevCode-Starterpaket exportieren.',
  fr: 'Atelier interactif : choisissez un scénario, un GPU, une stack linguistique et un IDE, simulez la maturité et le coût, puis exportez un bundle de départ JevCode complet.',
  es: 'Banco de trabajo interactivo: elige escenario, GPU, stack de lenguaje e IDE, simula la preparación y el coste, y exporta un paquete inicial completo de JevCode.',
  pt: 'Bancada interativa: escolha cenário, GPU, stack de linguagem e IDE, simule prontidão e custo e exporte um pacote inicial completo do JevCode.',
};

export const eyebrow: Localized<string> = {
  en: 'Workbench · design to deployment',
  zh: '工作台 · 从设计到上线',
  ja: 'ワークベンチ · 設計からデプロイまで',
  ko: '워크벤치 · 설계부터 배포까지',
  de: 'Workbench · vom Entwurf bis zum Deployment',
  fr: 'Atelier · de la conception au déploiement',
  es: 'Banco de trabajo · del diseño al despliegue',
  pt: 'Bancada · do projeto à implantação',
};

export const lead: Localized<string> = {
  en: 'One page takes you from a chosen scenario to four ready-to-run artifacts: config, agent rules, typed starter code, and an acceptance verifier. Every control recomputes the readiness and cost model live.',
  zh: '在一个页面里，从选定场景一路生成四份可直接运行的产物：配置、智能体规则、带类型的启动代码与验收校验器。每次调整控件都会实时重算就绪度与成本模型。',
  ja: '1 ページで、選択したシナリオから 4 つのすぐ実行できる成果物（設定、エージェントルール、型付きスターターコード、受入検証器）を生成します。操作するたびにレディネスとコストのモデルがその場で再計算されます。',
  ko: '한 페이지에서 선택한 시나리오를 바로 실행 가능한 네 가지 산출물(구성, 에이전트 규칙, 타입화된 시작 코드, 수용 검증기)로 만듭니다. 컨트롤을 바꿀 때마다 준비도와 비용 모델이 실시간으로 다시 계산됩니다.',
  de: 'Eine Seite führt vom gewählten Szenario zu vier sofort lauffähigen Artefakten: Konfiguration, Agent-Regeln, typisierter Starter-Code und Akzeptanz-Prüfer. Jede Steuerung berechnet Bereitschaft und Kostenmodell live neu.',
  fr: 'Une seule page mène du scénario choisi à quatre artefacts exécutables : configuration, règles d’agent, code de départ typé et vérificateur d’acceptation. Chaque contrôle recalcule la maturité et le coût en direct.',
  es: 'Una página te lleva del escenario elegido a cuatro artefactos listos para ejecutar: configuración, reglas del agente, código inicial tipado y verificador de aceptación. Cada control recalcula la preparación y el coste en vivo.',
  pt: 'Uma página leva do cenário escolhido a quatro artefatos prontos para executar: configuração, regras do agente, código inicial tipado e verificador de aceitação. Cada controle recalcula prontidão e custo em tempo real.',
};

export const home: Localized<string> = {
  en: 'Home', zh: '首页', ja: 'ホーム', ko: '홈', de: 'Start', fr: 'Accueil', es: 'Inicio', pt: 'Início',
};

export const heroAlt: Localized<string> = {
  en: 'Workbench flow from scenario selection to exported artifacts',
  zh: '从场景选择到产物导出的工作台流程图',
  ja: 'シナリオ選択から成果物の書き出しまでのワークベンチの流れ',
  ko: '시나리오 선택부터 산출물 내보내기까지의 워크벤치 흐름',
  de: 'Workbench-Ablauf von der Szenarioauswahl bis zum exportierten Artefakt',
  fr: 'Flux de l’atelier, de la sélection du scénario à l’export des artefacts',
  es: 'Flujo del banco de trabajo, de la selección del escenario a la exportación de artefactos',
  pt: 'Fluxo da bancada, da seleção do cenário à exportação dos artefatos',
};

export const readinessAlt: Localized<string> = {
  en: 'Readiness and cost simulation dashboard with completion, automation, and savings',
  zh: '就绪度与成本模拟面板，展示完成度、自动化率与节省额',
  ja: '完了度、自動化率、節約額を示すレディネスとコストのシミュレーション画面',
  ko: '완료도, 자동화율, 절감액을 보여주는 준비도 및 비용 시뮬레이션 화면',
  de: 'Dashboard für Bereitschaft und Kosten mit Abschluss, Automatisierung und Einsparung',
  fr: 'Tableau de bord de maturité et de coût avec complétion, automatisation et économies',
  es: 'Panel de preparación y coste con finalización, automatización y ahorro',
  pt: 'Painel de prontidão e custo com conclusão, automação e economia',
};

export const exportAlt: Localized<string> = {
  en: 'Four generated artifacts ready to copy or download as a bundle',
  zh: '四份已生成的产物，可复制或打包下载',
  ja: 'コピーまたはバンドル書き出しができる 4 つの生成成果物',
  ko: '복사하거나 번들로 내보낼 수 있는 네 개의 생성 산출물',
  de: 'Vier generierte Artefakte zum Kopieren oder als Paket-Download',
  fr: 'Quatre artefacts générés, prêts à copier ou à télécharger en lot',
  es: 'Cuatro artefactos generados listos para copiar o descargar en paquete',
  pt: 'Quatro artefatos gerados prontos para copiar ou baixar em pacote',
};

export const controlsHeading: Localized<string> = {
  en: 'Configuration controls', zh: '配置控件', ja: '設定コントロール', ko: '구성 컨트롤',
  de: 'Konfigurationssteuerung', fr: 'Contrôles de configuration', es: 'Controles de configuración', pt: 'Controles de configuração',
};

export const scenarioLabel: Localized<string> = {
  en: 'Scenario', zh: '场景', ja: 'シナリオ', ko: '시나리오', de: 'Szenario', fr: 'Scénario', es: 'Escenario', pt: 'Cenário',
};

export const gpuLabel: Localized<string> = {
  en: 'GPU profile', zh: '显卡配置', ja: 'GPU 構成', ko: 'GPU 구성', de: 'GPU-Profil', fr: 'Profil GPU', es: 'Perfil de GPU', pt: 'Perfil de GPU',
};

export const stackLabel: Localized<string> = {
  en: 'Language stack', zh: '语言技术栈', ja: '言語スタック', ko: '언어 스택', de: 'Sprach-Stack', fr: 'Stack linguistique', es: 'Stack de lenguaje', pt: 'Stack de linguagem',
};

export const ideLabel: Localized<string> = {
  en: 'AI IDE / agent', zh: 'AI IDE / 智能体', ja: 'AI IDE / エージェント', ko: 'AI IDE / 에이전트',
  de: 'AI-IDE / Agent', fr: 'IDE IA / agent', es: 'IDE de IA / agente', pt: 'IDE de IA / agente',
};

export const requestsLabel: Localized<string> = {
  en: 'Monthly requests', zh: '每月请求数', ja: '月間リクエスト数', ko: '월간 요청 수',
  de: 'Anfragen pro Monat', fr: 'Requêtes mensuelles', es: 'Solicitudes mensuales', pt: 'Solicitações mensais',
};

export const tokensLabel: Localized<string> = {
  en: 'Avg. input tokens / request', zh: '平均每次输入 token', ja: 'リクエストあたりの平均入力トークン', ko: '요청당 평균 입력 토큰',
  de: 'Ø Eingabe-Tokens / Anfrage', fr: 'Jetons d’entrée moyens / requête', es: 'Tokens de entrada medios / solicitud', pt: 'Tokens de entrada médios / solicitação',
};

export const postureLabel: Localized<string> = {
  en: 'Engineering posture', zh: '工程姿态', ja: 'エンジニアリング姿勢', ko: '엔지니어링 태도',
  de: 'Engineering-Haltung', fr: 'Posture d’ingénierie', es: 'Postura de ingeniería', pt: 'Postura de engenharia',
};

export const horizonLabel: Localized<string> = {
  en: 'Capability horizon', zh: '能力时间线', ja: '能力の地平', ko: '역량 시계열',
  de: 'Fähigkeitshorizont', fr: 'Horizon de capacité', es: 'Horizonte de capacidad', pt: 'Horizonte de capacidade',
};

export const postureBalanced: Localized<string> = {
  en: 'Balanced', zh: '均衡', ja: 'バランス', ko: '균형', de: 'Ausgewogen', fr: 'Équilibré', es: 'Equilibrado', pt: 'Equilibrado',
};

export const postureStrict: Localized<string> = {
  en: 'Strict', zh: '严格', ja: '厳格', ko: '엄격', de: 'Streng', fr: 'Strict', es: 'Estricto', pt: 'Rígido',
};

export const postureRegulated: Localized<string> = {
  en: 'Regulated', zh: '合规', ja: 'レギュレーション対応', ko: '규제 준수', de: 'Reguliert', fr: 'Réglementé', es: 'Regulado', pt: 'Regulado',
};

export const horizonNow: Localized<string> = {
  en: '2025–2026', zh: '2025–2026', ja: '2025–2026', ko: '2025–2026', de: '2025–2026', fr: '2025–2026', es: '2025–2026', pt: '2025–2026',
};

export const horizonFuture: Localized<string> = {
  en: '2026–2027+', zh: '2026–2027+', ja: '2026–2027+', ko: '2026–2027+', de: '2026–2027+', fr: '2026–2027+', es: '2026–2027+', pt: '2026–2027+',
};

export const fitLocal: Localized<string> = {
  en: 'Local fit', zh: '本地适配', ja: 'ローカル適合', ko: '로컬 적합', de: 'Lokal geeignet', fr: 'Adapté en local', es: 'Adecuado localmente', pt: 'Adequado localmente',
};

export const fitHybrid: Localized<string> = {
  en: 'Hybrid recommended', zh: '推荐混合', ja: 'ハイブリッド推奨', ko: '하이브리드 권장', de: 'Hybrid empfohlen', fr: 'Hybride recommandé', es: 'Híbrido recomendado', pt: 'Híbrido recomendado',
};

export const fitCluster: Localized<string> = {
  en: 'Cluster scale', zh: '集群规模', ja: 'クラス規模', ko: '클러스터 규모', de: 'Cluster-Scale', fr: 'À l’échelle du cluster', es: 'Escala de clúster', pt: 'Escala de cluster',
};

export const readinessHeading: Localized<string> = {
  en: 'Live readiness & cost simulation', zh: '实时就绪度与成本模拟', ja: 'リアルタイムのレディネスとコストのシミュレーション', ko: '실시간 준비도 및 비용 시뮬레이션',
  de: 'Live-Bereitschaft und Kostensimulation', fr: 'Simulation de maturité et de coût en direct', es: 'Simulación de preparación y coste en vivo', pt: 'Simulação de prontidão e custo em tempo real',
};

export const completionLabel: Localized<string> = {
  en: 'Completion readiness', zh: '完成就绪度', ja: '完了レディネス', ko: '완료 준비도',
  de: 'Abschlussbereitschaft', fr: 'Maturité de complétion', es: 'Madurez de finalización', pt: 'Prontidão de conclusão',
};

export const autoHandledLabel: Localized<string> = {
  en: 'Auto-handled', zh: '自动处理', ja: '自動処理', ko: '자동 처리',
  de: 'Automatisch erledigt', fr: 'Traité automatiquement', es: 'Gestionado automáticamente', pt: 'Tratado automaticamente',
};

export const escalationLabel: Localized<string> = {
  en: 'Escalated', zh: '升级人工', ja: 'エスカレーション', ko: '에스컬레이션',
  de: 'Eskaliert', fr: 'Escaladé', es: 'Escalado', pt: 'Escalonado',
};

export const jevCostLabel: Localized<string> = {
  en: 'JevCode cost', zh: 'JevCode 成本', ja: 'JevCode コスト', ko: 'JevCode 비용',
  de: 'JevCode-Kosten', fr: 'Coût JevCode', es: 'Coste de JevCode', pt: 'Custo do JevCode',
};

export const frontierCostLabel: Localized<string> = {
  en: 'Frontier-only cost', zh: '纯前沿模型成本', ja: 'フロンティアのみのコスト', ko: '프론티어 전용 비용',
  de: 'Nur-Frontier-Kosten', fr: 'Coût frontier uniquement', es: 'Coste solo frontier', pt: 'Custo apenas frontier',
};

export const savingsLabel: Localized<string> = {
  en: 'Monthly savings', zh: '每月节省', ja: '月間節約額', ko: '월간 절감액',
  de: 'Monatliche Einsparung', fr: 'Économies mensuelles', es: 'Ahorro mensual', pt: 'Economia mensal',
};

export const latencyLabel: Localized<string> = {
  en: 'Target latency', zh: '目标时延', ja: '目標レイテンシ', ko: '목표 지연',
  de: 'Ziellatenz', fr: 'Latence cible', es: 'Latencia objetivo', pt: 'Latência alvo',
};

export const gpuFitLabel: Localized<string> = {
  en: 'GPU fit', zh: '显卡适配', ja: 'GPU 適合', ko: 'GPU 적합성',
  de: 'GPU-Eignung', fr: 'Adéquation GPU', es: 'Ajuste de GPU', pt: 'Adequação da GPU',
};

export const perMonthSuffix: Localized<string> = {
  en: '/ mo', zh: '/ 月', ja: '/ 月', ko: '/ 월', de: '/ Mon.', fr: '/ mois', es: '/ mes', pt: '/ mês',
};

export const linksHeading: Localized<string> = {
  en: 'Explore the selected stack', zh: '查看所选组合', ja: '選択したスタックを見る', ko: '선택한 스택 살펴보기',
  de: 'Gewählten Stack erkunden', fr: 'Explorer la stack sélectionnée', es: 'Explorar el stack seleccionado', pt: 'Explorar a stack selecionada',
};

export const viewScenarioLink: Localized<string> = {
  en: 'View scenario', zh: '查看场景', ja: 'シナリオを見る', ko: '시나리오 보기',
  de: 'Szenario ansehen', fr: 'Voir le scénario', es: 'Ver escenario', pt: 'Ver cenário',
};

export const viewGpuLink: Localized<string> = {
  en: 'View GPU', zh: '查看显卡', ja: 'GPU を見る', ko: 'GPU 보기',
  de: 'GPU ansehen', fr: 'Voir le GPU', es: 'Ver GPU', pt: 'Ver GPU',
};

export const viewTutorialLink: Localized<string> = {
  en: 'View tutorial', zh: '查看教程', ja: 'チュートリアルを見る', ko: '튜토리얼 보기',
  de: 'Anleitung ansehen', fr: 'Voir le tutoriel', es: 'Ver tutorial', pt: 'Ver tutorial',
};

export const artifactsHeading: Localized<string> = {
  en: 'Generated artifacts', zh: '生成的产物', ja: '生成された成果物', ko: '생성된 산출물',
  de: 'Generierte Artefakte', fr: 'Artefacts générés', es: 'Artefactos generados', pt: 'Artefatos gerados',
};

export const tabConfig: Localized<string> = {
  en: 'jevcode.config.yaml', zh: 'jevcode.config.yaml', ja: 'jevcode.config.yaml', ko: 'jevcode.config.yaml',
  de: 'jevcode.config.yaml', fr: 'jevcode.config.yaml', es: 'jevcode.config.yaml', pt: 'jevcode.config.yaml',
};

export const tabRules: Localized<string> = {
  en: 'Agent rules', zh: '智能体规则', ja: 'エージェントルール', ko: '에이전트 규칙',
  de: 'Agent-Regeln', fr: 'Règles d’agent', es: 'Reglas del agente', pt: 'Regras do agente',
};

export const tabStarter: Localized<string> = {
  en: 'Starter program', zh: '启动程序', ja: 'スタータープログラム', ko: '시작 프로그램',
  de: 'Starter-Programm', fr: 'Programme de départ', es: 'Programa inicial', pt: 'Programa inicial',
};

export const tabVerifier: Localized<string> = {
  en: 'Verifier', zh: '校验器', ja: '検証器', ko: '검증기',
  de: 'Prüfer', fr: 'Vérificateur', es: 'Verificador', pt: 'Verificador',
};

export const copyBtn: Localized<string> = {
  en: 'Copy', zh: '复制', ja: 'コピー', ko: '복사', de: 'Kopieren', fr: 'Copier', es: 'Copiar', pt: 'Copiar',
};

export const copiedBtn: Localized<string> = {
  en: 'Copied', zh: '已复制', ja: 'コピー済み', ko: '복사됨', de: 'Kopiert', fr: 'Copié', es: 'Copiado', pt: 'Copiado',
};

export const downloadFileBtn: Localized<string> = {
  en: 'Download file', zh: '下载文件', ja: 'ファイルを書き出し', ko: '파일 내려받기',
  de: 'Datei herunterladen', fr: 'Télécharger le fichier', es: 'Descargar archivo', pt: 'Baixar arquivo',
};

export const downloadBundleBtn: Localized<string> = {
  en: 'Download full bundle', zh: '下载完整包', ja: '完全なバンドルを書き出し', ko: '전체 번들 내려받기',
  de: 'Gesamtes Paket herunterladen', fr: 'Télécharger le bundle complet', es: 'Descargar paquete completo', pt: 'Baixar pacote completo',
};

export const copyShareBtn: Localized<string> = {
  en: 'Copy shareable URL', zh: '复制分享链接', ja: '共有用 URL をコピー', ko: '공유 URL 복사',
  de: 'Teilbare URL kopieren', fr: 'Copier l’URL partageable', es: 'Copiar URL compartible', pt: 'Copiar URL compartilhável',
};

export const copiedShareBtn: Localized<string> = {
  en: 'Link copied', zh: '链接已复制', ja: 'リンクをコピーしました', ko: '링크 복사됨',
  de: 'Link kopiert', fr: 'Lien copié', es: 'Enlace copiado', pt: 'Link copiado',
};

export const ctaTitle: Localized<string> = {
  en: 'Take this stack into production', zh: '把这套技术栈带上生产环境', ja: 'このスタックを本番環境へ', ko: '이 스택을 프로덕션으로 가져가기',
  de: 'Diesen Stack in die Produktion bringen', fr: 'Passez cette stack en production', es: 'Lleva este stack a producción', pt: 'Leve esta stack para produção',
};

export const ctaLead: Localized<string> = {
  en: 'Sign up for ${credit} in credit and call clavue-jev from your own code. Input tokens only — output is free.',
  zh: '注册即送 ${credit} 额度，从自己的代码里调用 clavue-jev。只对输入 token 计费，输出免费。',
  ja: '登録すると ${credit} のクレジットが付与され、自分のコードから clavue-jev を呼び出せます。入力トークンのみ課金され、出力は無料です。',
  ko: '가입하면 ${credit} 크레딧을 받고 내 코드에서 clavue-jev를 호출할 수 있습니다. 입력 토큰만 과금되고 출력은 무료입니다.',
  de: 'Melde dich an, erhalte ${credit} Guthaben und rufe clavue-jev aus deinem eigenen Code auf. Nur Eingabe-Tokens werden berechnet, Ausgaben sind frei.',
  fr: 'Inscrivez-vous pour ${credit} de crédit et appelez clavue-jev depuis votre propre code. Seuls les jetons d’entrée sont facturés, la sortie est gratuite.',
  es: 'Regístrate con ${credit} de crédito y llama a clavue-jev desde tu propio código. Solo se facturan los tokens de entrada; la salida es gratuita.',
  pt: 'Cadastre-se com ${credit} de crédito e chame o clavue-jev do seu próprio código. Apenas tokens de entrada são cobrados; a saída é gratuita.',
};

export const ctaTry: Localized<string> = {
  en: 'Try clavue-jev', zh: '试用 clavue-jev', ja: 'clavue-jev を試す', ko: 'clavue-jev 시도하기',
  de: 'clavue-jev testen', fr: 'Essayer clavue-jev', es: 'Probar clavue-jev', pt: 'Experimentar clavue-jev',
};

export const ctaRegister: Localized<string> = {
  en: 'Sign up', zh: '注册', ja: '登録する', ko: '가입하기', de: 'Registrieren', fr: 'S’inscrire', es: 'Registrarse', pt: 'Cadastrar-se',
};
