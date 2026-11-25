import type { Localized } from '../i18n/ui';

export interface IndustryCase {
  slug: string;
  sector: string;
  regionFocus: string;
  compliance: string;
  latencyTarget: string;
  llmBypassRate: string;
  recommendedGpuSlug: string;
  recommendedRecipeSlug: string;
  heroImage: string;
  name: Localized<string>;
  tagline: Localized<string>;
  problem: Localized<string>;
  solution: Localized<string>;
  impact: Localized<string>;
  samplePayload: string;
  codeLang: string;
  codeSnippet: string;
}

export const INDUSTRY_CASES: IndustryCase[] = [
  {
    "slug": "fintech-payments-fraud",
    "sector": "finance",
    "regionFocus": "Global / US / EU / APAC",
    "compliance": "PCI-DSS · PSD2 · AML",
    "latencyTarget": "65 ms p50 / 120 ms p95",
    "llmBypassRate": "84%",
    "recommendedGpuSlug": "nvidia-h100-80g-sxm",
    "recommendedRecipeSlug": "golang-high-throughput",
    "heroImage": "/img/guides/industries-enterprise.webp",
    "name": {
      "en": "Global Payments, Chargebacks & Anti-Fraud",
      "zh": "全球支付、拒付仲裁与实时反欺诈",
      "ja": "グローバル決済、チャージバックおよび不正防止",
      "ko": "글로벌 결제, 환불 및 사기 방지",
      "de": "Global Payments, Chargebacks & Anti-Fraud",
      "fr": "Paiements mondiaux, litiges et lutte contre la fraude",
      "es": "Pagos globales, devoluciones y prevención de fraude",
      "pt": "Pagamentos globais, chargebacks e prevenção de fraude"
    },
    "tagline": {
      "en": "Sub-100ms transaction risk gating, dispute triage, and AML escalation before heavy LLM investigation",
      "zh": "百毫秒内完成交易风险拦截、拒付归因与反洗钱升级，避免阻塞支付授权链路",
      "ja": "LLM 調査前のサブ 100ms トランザクションリスクゲート、紛争の優先付け、および AML エスカレーション",
      "ko": "중요한 LLM 조사 전 서브 100ms 거래 리스크 게이트, 분쟁 선별, 및 AML 에스컬레이션",
      "de": "Sub-100ms Transaktionsrisiko-Filter, Streitbeilegung-Triage und AML-Eskalation vor aufwendiger LLM-Untersuchung",
      "fr": "Passerelle de risque de transaction sub-100ms, tri des litiges et escalade AML avant une enquête LLM lourde",
      "es": "Puerta de enlace de riesgo de transacción sub-100ms, triaje de disputas y escalada AML antes de una investigación LLM intensiva",
      "pt": "Porta de risco de transação sub-100ms, triagem de disputas e escalada AML antes de uma investigação LLM pesada"
    },
    "problem": {
      "en": "Payment processors and neo-banks handle millions of real-time checkout events, chargeback narratives, and sanctions alerts daily. Running a generative LLM on every alert blows past authorization timeouts and costs $10K+/month.",
      "zh": "跨境支付机构与数字银行每天面对海量实时交易、拒付申诉与制裁名单告警。若对每条告警都调用生成式大模型，不仅击穿支付授权超时，推理账单也会居高不下。",
      "ja": "決済処理業者とネオバンクは、毎日数百万回のリアルタイムチェックアウトイベント、チャージバックの物語、および制裁アラートを処理しています。すべてのアラートに生成型 LLM を実行すると、承認タイムアウトを超え、月額 $10K+ のコストがかかります。",
      "ko": "결제 처리업체와 네오뱅크는 매일 수백만 건의 실시간 체크아웃 이벤트, 환불 서술, 및 제재 알림을 처리합니다. 모든 알림에 생성형 LLM 을 실행하면 승인 시간 초과를 초과하고 월 $10K+ 의 비용이 듭니다.",
      "de": "Zahlungsabwickler und Neobanken verarbeiten täglich Millionen von Echtzeit-Checkout-Ereignissen, Chargeback-Erzählungen und Sanktionenalarmen. Das Ausführen eines generativen LLMs bei jedem Alarm überschreitet die Autorisierungszeitlimits und kostet $10K+/Monat.",
      "fr": "Les processeurs de paiement et les néo-banques gèrent quotidiennement des millions d'événements de paiement en temps réel, de récits de litiges et d'alertes de sanctions. Exécuter un LLM génératif sur chaque alerte dépasse les délais d'autorisation et coûte $10K+/mois.",
      "es": "Los procesadores de pagos y los neobancos manejan diariamente millones de eventos de pago en tiempo real, narrativas de disputas y alertas de sanciones. Ejecutar un LLM generativo en cada alerta supera los tiempos de autorización y cuesta $10K+/mes.",
      "pt": "Processadores de pagamento e neobancos lidam diariamente com milhões de eventos de checkout em tempo real, narrativas de chargebacks e alertas de sanções. Executar um LLM generativo em cada alerta ultrapassa os tempos de autorização e custa $10K+/mês."
    },
    "solution": {
      "en": "clavue-jev evaluates structured transaction context + merchant narrative in a single parallel batch (noul fraud_hold + choice dispute_reason + confidence risk_score). Clear approvals and obvious fraud execute deterministically; only borderline cases escalate to a System Two investigator model or analyst.",
      "zh": "通过 clavue-jev 单次并发返回「是否冻结（noul）+ 拒付类型（choice）+ 风险置信度（confidence）」。高置信放行与明确欺诈直接执行规则动作，仅边界样本升级至 System Two 调查模型或风控专员。",
      "ja": "clavue-jev は、構造化されたトランザクションコンテキストと商取引の物語を単一の並列バッチで評価します（noul fraud_hold + choice dispute_reason + confidence risk_score）。明確な承認と明白な不正は決定論的に実行され、境界線に近いケースのみが System Two 調査者モデルまたはアナリストにエスカレーションされます。",
      "ko": "clavue-jev 은 구조화된 거래 컨텍스트와 상점 서술을 단일 병렬 배치로 평가합니다 (noul fraud_hold + choice dispute_reason + confidence risk_score). 명확한 승인과 명백한 사기는 결정론적으로 실행되며, 경계선 사례만 System Two 조사자 모델이나 분석가로 에스컬레이션됩니다.",
      "de": "clavue-jev bewertet strukturierten Transaktionskontext + Händler-Erzählung in einem einzigen parallelen Batch (noul fraud_hold + choice dispute_reason + confidence risk_score). Klare Freigaben und offensichtlicher Betrug werden deterministisch ausgeführt; nur Grenzfälle eskalieren zu einem System Two Investigator-Modell oder Analysten.",
      "fr": "clavue-jev évalue le contexte de transaction structuré + le récit du commerçant dans un lot parallèle unique (noul fraud_hold + choice dispute_reason + confidence risk_score). Les approbations claires et la fraude évidente s'exécutent de manière déterministe ; seuls les cas limites sont escaladés vers un modèle d'investigateur System Two ou un analyste.",
      "es": "clavue-jev evalúa el contexto de transacción estructurado + la narrativa del comerciante en un solo lote paralelo (noul fraud_hold + choice dispute_reason + confidence risk_score). Las aprobaciones claras y el fraude evidente se ejecutan determinísticamente; solo los casos límite se escalan a un modelo de investigador System Two o un analista.",
      "pt": "clavue-jev avalia o contexto de transação estruturado + narrativa do comerciante em um único lote paralelo (noul fraud_hold + choice dispute_reason + confidence risk_score). Aprovações claras e fraude óbvia executam-se deterministicamente; apenas casos limítrofes são escalonados para um modelo de investigador System Two ou analista."
    },
    "impact": {
      "en": "84% fewer System Two LLM calls, sub-100ms decision SLA preserved during peak shopping surges, auditable probability distributions for compliance.",
      "zh": "减少 84% 的重型大模型调用，大促峰值仍守住百毫秒 SLA，并沉淀可审计的概率分布记录。",
      "ja": "System Two LLM 呼び出しが 84% 削減、ピークショッピング時のサブ 100ms 意思決定 SLA を維持、コンプライアンスのための監査可能な確率分布。",
      "ko": "System Two LLM 호출이 84% 감소, 피크 쇼핑 기간 동안 서브 100ms 의사결정 SLA 유지, 규정 준수를 위한 감사 가능한 확률 분포.",
      "de": "84% weniger System Two LLM-Aufrufe, Sub-100ms Entscheidungs-SLA auch bei Spitzenlasten erhalten, überprüfbare Wahrscheinlichkeitsverteilungen für Compliance.",
      "fr": "84% d'appels LLM System Two en moins, SLA de décision sub-100ms préservé lors des pics d'achats, distributions de probabilité auditable pour la conformité.",
      "es": "84% menos de llamadas a LLM System Two, SLA de decisión sub-100ms preservado durante los picos de compras, distribuciones de probabilidad auditables para cumplimiento.",
      "pt": "84% menos chamadas de LLM System Two, SLA de decisão sub-100ms preservado durante picos de compras, distribuições de probabilidade auditáveis para conformidade."
    },
    "samplePayload": "{\n  \"state\": \"Cardholder disputes $480 SaaS renewal; device fingerprint matches 14 prior logins from Berlin, 3DS2 passed, invoice emailed 7d prior.\",\n  \"questions\": {\n    \"likely_friendly_fraud\": { \"type\": \"noul\", \"instructions\": \"Does the evidence indicate first-party friendly fraud?\" },\n    \"action\": { \"type\": \"choice\", \"instructions\": \"Choose dispute action\", \"options\": [\"auto_represent\", \"refund_fast\", \"manual_review\"] },\n    \"aml_risk\": { \"type\": \"confidence\", \"instructions\": \"Confidence that this requires AML/sanctions review\" }\n  }\n}",
    "codeLang": "typescript",
    "codeSnippet": "const res = await fetch('https://api.jevcode.ai/v1/judge', {\n  method: 'POST',\n  headers: { 'content-type': 'application/json', authorization: `Bearer ${process.env.JEVCODE_API_KEY}` },\n  body: JSON.stringify({\n    state: `Amount: ${tx.amount} ${tx.currency}; 3DS: ${tx.threeDs}; Note: ${tx.reason}`,\n    questions: {\n      block_now: { type: 'noul', instructions: 'Should this transaction be blocked immediately for fraud?' },\n      queue: { type: 'choice', instructions: 'Route dispute queue', options: ['auto_approve', 'representment', 'compliance_hold'] },\n    },\n  }),\n});\nconst { answers } = await res.json();\nif (answers.block_now.noul >= 0.92) return holdTransaction(tx.id);"
  },
  {
    "slug": "healthcare-clinical-triage",
    "sector": "healthcare",
    "regionFocus": "US / EU / UK / Japan",
    "compliance": "HIPAA · GDPR · ISO 27001",
    "latencyTarget": "75 ms p50 / 140 ms p95",
    "llmBypassRate": "76%",
    "recommendedGpuSlug": "rtx-pro-6000-blackwell-96g",
    "recommendedRecipeSlug": "python-asyncio-fastapi",
    "heroImage": "/img/guides/industries-hero.webp",
    "name": {
      "en": "Healthcare Intake & Clinical Triage Routing",
      "zh": "医疗分诊、急症红旗识别与科室路由",
      "ja": "医療受入および臨床トリアージルーティング",
      "ko": "의료 접수 및 임상 선별 라우팅",
      "de": "Medizinische Aufnahme und klinische Triage-Verleitung",
      "fr": "Prise en charge médicale et routage de triage clinique",
      "es": "Ingreso médico y enrutamiento de triaje clínico",
      "pt": "Admissão médica e roteamento de triagem clínica"
    },
    "tagline": {
      "en": "Deterministic urgency classification and specialty routing for patient intake messages",
      "zh": "面向患者初诊消息的确定性紧急度分级与专科路由",
      "ja": "患者受入メッセージに対する決定論的緊急性分類と専門分野ルーティング",
      "ko": "환자 접수 메시지에 대한 결정론적 긴급도 분류 및 전문 분야 라우팅",
      "de": "Deterministische Dringlichkeitsklassifizierung und Fachbereichs-Verleitung für Patientenaufnahmemeldungen",
      "fr": "Classification déterministe de l'urgence et routage par spécialité pour les messages d'admission des patients",
      "es": "Clasificación determinista de urgencia y enrutamiento por especialidad para mensajes de ingreso de pacientes",
      "pt": "Classificação determinista de urgência e roteamento por especialidade para mensagens de admissão de pacientes"
    },
    "problem": {
      "en": "Telehealth platforms and hospital portals receive unstructured patient messages across multiple languages. Missing a red-flag symptom is unacceptable, yet routing every prescription refill through a slow reasoning model delays urgent queues.",
      "zh": "互联网医院与诊所门户每天收到大量多语种非结构化患者留言。遗漏急症红旗风险极高，但把每一条续方、改期咨询都送进慢速推理模型又会拖慢分诊队列。",
      "ja": "遠隔医療プラットフォームと病院ポータルは、複数の言語で構造化されていない患者メッセージを受信します。赤旗症状を見逃すことは許されませんが、すべての処方箋補充を遅い推論モデルにルーティングすると、緊急キューが遅延します。",
      "ko": "원격 의료 플랫폼과 병원 포털은 여러 언어로 구성된 구조화되지 않은 환자 메시지를 수신합니다. 경고 신호 증상을 놓치는 것은 용납될 수 없으나, 모든 처방전 재충전을 느린 추론 모델로 라우팅하면 긴급 대기열이 지연됩니다.",
      "de": "Telemedizin-Plattformen und Krankenhausportale erhalten strukturiertelose Patientennachrichten in mehreren Sprachen. Ein übersehenes Warnsymptom ist inakzeptabel, doch die Verleitung jeder Rezepterneuerung über ein langsames Schlussfolgerungsmodell verzögert dringende Warteschlangen.",
      "fr": "Les plateformes de télémédecine et les portaux hospitaliers reçoivent des messages de patients non structurés dans plusieurs langues. Manquer un symptôme d'alerte est inacceptable, mais router chaque renouvellement de prescription via un modèle de raisonnement lent retarde les files d'attente urgentes.",
      "es": "Las plataformas de telemedicina y los portales hospitalarios reciben mensajes de pacientes no estructurados en múltiples idiomas. Perder un síntoma de alerta roja es inaceptable, pero enrutando cada recarga de receta a través de un modelo de razonamiento lento, se retrasan las colas urgentes.",
      "pt": "Plataformas de telemedicina e portais hospitalares recebem mensagens de pacientes não estruturadas em múltiplos idiomas. Perder um sintoma de alerta vermelho é inaceitável, mas rotear cada renovação de receita através de um modelo de raciocínio lento atrasa filas urgentes."
    },
    "solution": {
      "en": "Deploy clavue-jev on de-identified symptom summaries to score emergency red flags (noul), classify specialty department (choice), and trigger immediate nurse escalation whenever urgency confidence crosses a conservative safety threshold (0.35).",
      "zh": "对脱敏症状摘要调用 clavue-jev，并行判定急症红旗（noul）与目标科室（choice），设置保守安全阈值（如 0.35）即时触发值班护士人工接管，常规预约与续方走自动流程。",
      "ja": "匿名化された症状サマリーに clavue-jev を展開し、緊急赤旗（noul）をスコアリングし、専門分野部門（choice）を分類し、緊急性の信頼度が保守的な安全閾値（0.35）を超えた場合、即座に看護師のエスカレーションをトリガーします。",
      "ko": "익명화된 증상 요약에 clavue-jev 를 배포하여 응급 경고 신호 (noul) 점수를 매기고, 전문 부서 (choice) 를 분류하며, 긴급도 신뢰도가 보수적인 안전 임계값 (0.35) 을 초과할 때마다 즉시 간호사 에스컬레이션을 트리거합니다.",
      "de": "Bereitstellen von clavue-jev für anonymisierte Symptomzusammenfassungen, um Notfallwarnsignale (noul) zu bewerten, Fachabteilungen (choice) zu klassifizieren und bei Überschreiten einer konservativen Sicherheitsschwelle (0.35) für die Dringlichkeitsoberzeugung sofortige Pflegekräfte-Eskalation auszulösen.",
      "fr": "Déployer clavue-jev sur des résumés de symptômes anonymisés pour évaluer les drapeaux rouges d'urgence (noul), classer le département de spécialité (choice), et déclencher une escalade immédiate aux infirmiers dès que le seuil de confiance en l'urgence dépasse un seuil de sécurité conservateur (0.35).",
      "es": "Desplegar clavue-jev en resúmenes de síntomas anonimizados para puntuar banderas rojas de emergencia (noul), clasificar el departamento de especialidad (choice) y desencadenar una escalada inmediata de enfermería siempre que la confianza en la urgencia cruce un umbral de seguridad conservador (0.35).",
      "pt": "Implantar clavue-jev em resumos de sintomas anonimizados para pontuar bandeiras vermelhas de emergência (noul), classificar o departamento de especialidade (choice) e acionar escalonamento imediato de enfermagem sempre que a confiança na urgência ultrapassar um limiar de segurança conservador (0.35)."
    },
    "impact": {
      "en": "Reduces emergency triage routing delay from minutes to <150ms while keeping routine scheduling and refill workflows automated.",
      "zh": "急症识别分流从分钟级压至 150ms 内，大幅释放临床分诊人力。",
      "ja": "緊急トリアージルーティングの遅延を分単位から<150ms に削減し、通常のスケジューリングと補充ワークフローを自動化したままにします。",
      "ko": "응급 선별 라우팅 지연을 분 단위에서 <150ms 로 줄이면서 일상적인 스케줄링 및 재충전 워크플로우를 자동화합니다.",
      "de": "Reduziert die Verzögerung der Notfall-Triage-Verleitung von Minuten auf <150ms, während routinemäßige Terminierungs- und Nachfüllworkflows automatisiert bleiben.",
      "fr": "Réduit le délai de routage du triage d'urgence de minutes à <150ms tout en maintenant l'automatisation des flux de travail de planification et de renouvellement de routine.",
      "es": "Reduce el retraso en el enrutamiento de triaje de emergencia de minutos a <150ms mientras mantiene automatizados los flujos de trabajo de programación y recarga rutinarios.",
      "pt": "Reduz o atraso no roteamento de triagem de emergência de minutos para <150ms enquanto mantém os fluxos de trabalho de agendamento e renovação de rotina automatizados."
    },
    "samplePayload": "{\n  \"state\": \"Patient reports sudden crushing chest pressure radiating to left arm for 20 minutes with sweating.\",\n  \"questions\": {\n    \"emergency_red_flag\": { \"type\": \"noul\", \"instructions\": \"Does this describe a potential medical emergency requiring immediate escalation?\" },\n    \"department\": { \"type\": \"choice\", \"instructions\": \"Assign clinical queue\", \"options\": [\"emergency_er\", \"cardiology\", \"primary_care\", \"pharmacy_refill\"] }\n  }\n}",
    "codeLang": "python",
    "codeSnippet": "async def triage_intake(summary: str) -> str:\n    r = await client.post(\n        \"https://api.jevcode.ai/v1/judge\",\n        headers={\"Authorization\": f\"Bearer {JEVCODE_API_KEY}\"},\n        json={\n            \"state\": summary,\n            \"questions\": {\n                \"emergency\": {\"type\": \"noul\", \"instructions\": \"Potential life-threatening emergency?\"},\n                \"queue\": {\"type\": \"choice\", \"instructions\": \"Clinical queue\", \"options\": [\"er_now\", \"urgent_nurse\", \"routine_booking\", \"rx_refill\"]},\n            },\n        },\n    )\n    ans = r.json()[\"answers\"]\n    if ans[\"emergency\"][\"noul\"] >= 0.35:\n        return \"IMMEDIATE_EMERGENCY_PROTOCOL\"\n    return ans[\"queue\"][\"choice\"]"
  },
  {
    "slug": "legal-contract-review",
    "sector": "legal",
    "regionFocus": "US / UK / EU / APAC",
    "compliance": "SOC2 · GDPR · Privilege Safe",
    "latencyTarget": "80 ms p50 / 160 ms p95",
    "llmBypassRate": "79%",
    "recommendedGpuSlug": "nvidia-h200-141g-sxm",
    "recommendedRecipeSlug": "rag-rerank-citation-pipeline",
    "heroImage": "/img/guides/industries-enterprise.webp",
    "name": {
      "en": "Legal Contract Review & Clause Risk Screening",
      "zh": "法务合同审查与高风险条款并行初筛",
      "ja": "法的契約レビューおよび条項リスクスクリーニング",
      "ko": "법적 계약 검토 및 조항 위험 선별",
      "de": "Rechtliche Vertragsprüfung und Klausel-Risikofilterung",
      "fr": "Examen juridique des contrats et criblage des risques de clauses",
      "es": "Revisión legal de contratos y cribado de riesgos de cláusulas",
      "pt": "Revisão legal de contratos e triagem de riscos de cláusulas"
    },
    "tagline": {
      "en": "Pre-screen hundreds of NDA/MSA clauses in parallel before invoking expensive long-context redline models",
      "zh": "先以百毫秒并发筛出异常条款，再把真正高风险段落送入长上下文精修大模型",
      "ja": "高コストの長文脈リダインモデルを呼び出す前に、NDA/MSAの数百の条項を並列で事前スクリーニング",
      "ko": "고비용의 긴 컨텍스트 리드라인 모델을 호출하기 전에 NDA/MSA 조항 수백 개를 병렬로 사전 선별",
      "de": "Vor dem Aufruf teurer Langkontext-Redline-Modelle parallele Vorschau von Hunderten von NDA/MSA-Klauseln",
      "fr": "Pré-écran en parallèle de centaines de clauses NDA/MSA avant d'invoquer des modèles de redaction à long contexte coûteux",
      "es": "Pre-cribar cientos de cláusulas NDA/MSA en paralelo antes de invocar modelos costosos de redacción de largo contexto",
      "pt": "Pré-triar centenas de cláusulas NDA/MSA em paralelo antes de invocar modelos caros de redação de longo contexto"
    },
    "problem": {
      "en": "In-house legal teams and CLM platforms inspect 50–200 clauses per vendor agreement. Sending every standard boilerplate paragraph to a frontier reasoning LLM creates huge token bills and 30-second waits.",
      "zh": "企业法务与 CLM 系统每份合同包含 50–200 条款，如果把所有常规格式条款全量送入长上下文推理模型，既昂贵又让律师等待数十秒。",
      "ja": "社内法務チームおよびCLMプラットフォームは、ベンダー契約ごとに50〜200の条項を検査します。すべての標準的な定型文を最先端の推論LLMに送信すると、莫大なトークンコストと30秒の待機時間が発生します。",
      "ko": "내부 법무 팀 및 CLM 플랫폼은 벤더 계약당 50~200 개의 조항을 검사합니다. 모든 표준 템플릿 문단을 최첨단 추론 LLM 에 전송하면 막대한 토큰 비용과 30 초 대기 시간이 발생합니다.",
      "de": "Inhouse-Rechtsteams und CLM-Plattformen prüfen pro Vendor-Vertrag 50–200 Klauseln. Das Senden jedes Standard-Boilerplate-Paragraphs an ein Frontier-Reasoning-LLM verursacht enorme Token-Kosten und 30-Sekunden-Wartezeiten.",
      "fr": "Les équipes juridiques internes et les plateformes CLM inspectent 50 à 200 clauses par accord avec un fournisseur. Envoyer chaque paragraphe de boilerplate standard à un LLM de raisonnement de pointe génère des factures de tokens énormes et des attentes de 30 secondes.",
      "es": "Los equipos legales internos y las plataformas CLM inspeccionan 50–200 cláusulas por acuerdo con proveedores. Enviar cada párrafo de texto estándar a un LLM de razonamiento de frontera genera facturas de tokens enormes y esperas de 30 segundos.",
      "pt": "Equipes jurídicas internas e plataformas CLM inspecionam 50–200 cláusulas por acordo com fornecedores. Enviar cada parágrafo de texto padrão a um LLM de raciocínio de fronteira gera faturas de tokens enormes e esperas de 30 segundos."
    },
    "solution": {
      "en": "Split contracts by clause and run parallel clavue-jev checks for uncapped liability, unilateral termination, IP assignment, and governing law deviations. Only non-standard risky clauses (~21%) enter the long-context H200 / frontier redline LLM.",
      "zh": "按条款切分并并发调用 clavue-jev 核验无限责任、单方解约、知识产权归属与管辖地偏离，仅把约 21% 的非标高风险条款交给长上下文精修模型起草红线批注。",
      "ja": "契約を条項ごとに分割し、無制限の責任、一方的な解約、知的財産権の譲渡、および準拠法からの逸脱について並列に clavue-jev チェックを実行します。非標準的なリスク条項（約21%）のみが、長文脈 H200 / 最先端リダインLLM に送られます。",
      "ko": "계약을 조항별로 분할하고 무제한 책임, 일방적 해지, 지식재산권 귀속, 준거법 편차에 대해 병렬로 clavue-jev 점검을 실행합니다. 비표준 위험 조항(약 21%) 만 긴 컨텍스트 H200/최첨단 리드라인 LLM 으로 진입합니다.",
      "de": "Verträge nach Klauseln aufteilen und parallele clavue-jev-Checks für unbegrenzte Haftung, einseitige Kündigung, IP-Zuweisung und Abweichungen vom anwendbaren Recht durchführen. Nur nicht-standardisierte risikobehaftete Klauseln (~21%) gelangen in das Langkontext-H200/Frontier-Redline-LLM.",
      "fr": "Diviser les contrats par clause et exécuter des vérifications clavue-jev parallèles pour la responsabilité illimitée, la résiliation unilatérale, l'affectation de la PI et les écarts de loi applicable. Seules les clauses risquées non standard (~21%) entrent dans le LLM de redaction à long contexte H200 / de pointe.",
      "es": "Dividir los contratos por cláusula y ejecutar comprobaciones clavue-jev en paralelo para responsabilidad ilimitada, terminación unilateral, cesión de propiedad intelectual y desviaciones de la ley aplicable. Solo las cláusulas de riesgo no estándar (~21%) entran en el LLM de redacción de largo contexto H200 / de frontera.",
      "pt": "Dividir contratos por cláusula e executar verificações clavue-jev em paralelo para responsabilidade ilimitada, rescisão unilateral, cessão de propriedade intelectual e desvios da lei aplicável. Apenas cláusulas de risco não padrão (~21%) entram no LLM de redação de longo contexto H200 / de fronteira."
    },
    "impact": {
      "en": "79% reduction in contract review token spend and 5× faster first-pass redline turnaround.",
      "zh": "合同审查 Token 成本直降 79%，初审响应提速 5 倍。",
      "ja": "契約レビューのトークン使用量を79%削減し、ファーストパスリダインのターンアラウンドを5倍高速化。",
      "ko": "계약 검토 토큰 사용량을 79% 감소시키고, 첫 번째 패스 리드라인 처리 속도를 5 배 향상.",
      "de": "79% Reduktion der Token-Ausgaben für Vertragsprüfungen und 5× schnellere Erstpass-Redline-Durchlaufzeit.",
      "fr": "Réduction de 79 % de la dépense en tokens pour l'examen des contrats et accélération de 5× du délai de premier passage de redaction.",
      "es": "Reducción del 79 % en el gasto de tokens de revisión de contratos y 5× más rápido en el tiempo de giro de la primera pasada de redacción.",
      "pt": "Redução de 79% no gasto de tokens de revisão de contratos e 5× mais rápido no turnaround da primeira passagem de redação."
    },
    "samplePayload": "{\n  \"state\": \"Supplier liability shall be unlimited for consequential damages and Customer retains perpetual ownership of all background tools used.\",\n  \"questions\": {\n    \"uncapped_liability\": { \"type\": \"noul\", \"instructions\": \"Does this clause expose the vendor to uncapped liability?\" },\n    \"risk_tier\": { \"type\": \"choice\", \"instructions\": \"Classify clause risk\", \"options\": [\"standard_ok\", \"negotiate\", \"legal_blocker\"] }\n  }\n}",
    "codeLang": "typescript",
    "codeSnippet": "const flagged = (await Promise.all(clauses.map(async (clause) => {\n  const { answers } = await judge(clause.text, {\n    blocker: { type: 'noul', instructions: 'Contains uncapped liability or broad IP assignment?' },\n    tier: { type: 'choice', instructions: 'Clause risk', options: ['standard', 'negotiate', 'blocker'] },\n  });\n  return answers.blocker.noul > 0.6 || answers.tier.choice !== 'standard' ? { clause, answers } : null;\n}))).filter(Boolean);"
  },
  {
    "slug": "ecommerce-marketplace-trust",
    "sector": "commerce",
    "regionFocus": "Global / Americas / EU / SEA",
    "compliance": "EU DSA · Consumer Protection",
    "latencyTarget": "70 ms p50 / 130 ms p95",
    "llmBypassRate": "86%",
    "recommendedGpuSlug": "nvidia-l40s-48g",
    "recommendedRecipeSlug": "typescript-node-sdk",
    "heroImage": "/img/guides/industries-hero.webp",
    "name": {
      "en": "E-Commerce Listings, Reviews & Marketplace Trust",
      "zh": "跨境电商选品合规、评论风控与售后仲裁",
      "ja": "EC 商品リスト、レビューおよびマーケットプレイス信頼性",
      "ko": "EC 상품 리스팅, 리뷰 및 마켓플레이스 신뢰도",
      "de": "E-Commerce-Listen, Bewertungen und Marktplatz-Vertrauen",
      "fr": "Listings E-commerce, Avis et Confiance sur le Marché",
      "es": "Listados de comercio electrónico, reseñas y confianza del mercado",
      "pt": "Listagens de E-commerce, Avaliações e Confiança do Mercado"
    },
    "tagline": {
      "en": "Real-time counterfeit detection, review authenticity scoring, and buyer-seller dispute routing",
      "zh": "实时拦截仿品/违禁上架、识别水军评论并自动分流买卖双方纠纷",
      "ja": "リアルタイムの偽物検出、レビューの真正性スコアリング、および購入者・販売者間の紛争ルーティング",
      "ko": "실시간 위조품 탐지, 리뷰 진정성 점수 매기기, 구매자-판매자 분쟁 라우팅",
      "de": "Echtzeit-Erkennung von Fälschungen, Bewertungsauthentizitäts-Bewertung und Routing von Käufer-Verkäufer-Streitigkeiten",
      "fr": "Détection de contrefaçon en temps réel, notation de l'authenticité des avis et routage des litiges acheteur-vendeur",
      "es": "Detección de falsificaciones en tiempo real, puntuación de autenticidad de reseñas y enrutamiento de disputas entre compradores y vendedores",
      "pt": "Detecção de falsificações em tempo real, pontuação de autenticidade de avaliações e roteamento de disputas entre compradores e vendedores"
    },
    "problem": {
      "en": "Global marketplaces ingest millions of daily SKU updates, product reviews, and return claims in dozens of languages. Keyword filters miss obfuscated policy violations while LLM-only moderation fails under flash-sale load.",
      "zh": "全球电商平台每日涌入数百万条多语种 SKU 上架、商品评价与退货申诉。关键词规则容易被变体绕过，而纯大模型审核在大促峰值难以承受延迟与成本。",
      "ja": "グローバルマーケットプレイスは、数十言語で毎日数百万件の SKU 更新、商品レビュー、および返品請求を処理します。キーワードフィルターでは暗号化されたポリシー違反を見逃し、LLM 単体のモデレーションではフラッシュセール時の負荷に耐えられません。",
      "ko": "글로벌 마켓플레이스는 수십 개 언어로 매일 수백만 개의 SKU 업데이트, 상품 리뷰, 반품 요청을 처리합니다. 키워드 필터는 은폐된 정책 위반 사항을 놓치며, LLM 만의 모더레이션은 플래시 세일 부하에서 실패합니다.",
      "de": "Globale Marktplätze verarbeiten täglich Millionen von SKU-Updates, Produktbewertungen und Rückgabeanträgen in Dutzenden von Sprachen. Keyword-Filter übersehen verschlüsselte Verstöße gegen Richtlinien, während reine LLM-Moderation unter Flash-Sale-Last versagt.",
      "fr": "Les marchés globaux ingèrent des millions de mises à jour de SKU, d'avis de produits et de réclamations de retour dans des dizaines de langues. Les filtres à mots-clés manquent les violations de politique obscurcies, tandis que la modération par LLM seul échoue sous la charge des ventes flash.",
      "es": "Los mercados globales ingieren millones de actualizaciones de SKU diarias, reseñas de productos y reclamaciones de devolución en docenas de idiomas. Los filtros de palabras clave omiten las violaciones de política ofuscadas, mientras que la moderación solo con LLM falla bajo la carga de las ventas flash.",
      "pt": "Mercados globais ingerem milhões de atualizações de SKU diárias, avaliações de produtos e reclamações de devolução em dezenas de idiomas. Filtros de palavras-chave perdem violações de política ofuscadas, enquanto a moderação apenas com LLM falha sob a carga de vendas flash."
    },
    "solution": {
      "en": "Run clavue-jev at ingestion to score counterfeit/prohibited-goods probability, fake review signals, and return eligibility. Auto-publish clean listings (>0.92 safe) and isolate high-risk SKUs for multimodal inspection.",
      "zh": "在入库链路接入 clavue-jev 并行判定违禁/仿品风险、虚假刷评与退货资格，高置信合规商品秒级放行，可疑商品自动进入多模态复核或人工审核池。",
      "ja": "取り込み時に clavue-jev を実行し、偽物・禁止品の確率、偽レビューのシグナル、および返品適格性をスコアリングします。安全なリスト（>0.92 の信頼度）を自動公開し、高リスクの SKU をマルチモーダル検査用に隔離します。",
      "ko": "수입 시 clavue-jev 를 실행하여 위조/금지품 확률, 가짜 리뷰 신호, 반품 적합성을 점수 매깁니다. 안전한 리스팅 (>0.92 신뢰도) 을 자동 게시하고 고위험 SKU 를 다중 모달 검사용으로 격리합니다.",
      "de": "Führen Sie clavue-jev beim Import aus, um die Wahrscheinlichkeit von Fälschungen/verbotenen Waren, Fake-Bewertungssignale und Rückgabefähigkeit zu bewerten. Veröffentlichen Sie saubere Listen automatisch (>0.92 sicher) und isolieren Sie Hochrisiko-SKUs für multimodale Inspektion.",
      "fr": "Exécutez clavue-jev lors de l'ingestion pour noter la probabilité de contrefaçon/marchandises interdites, les signaux d'avis faux et l'éligibilité au retour. Publiez automatiquement les listings propres (>0.92 sûr) et isolez les SKU à haut risque pour inspection multimodale.",
      "es": "Ejecute clavue-jev durante la ingestión para puntuar la probabilidad de falsificaciones/bienes prohibidos, señales de reseñas falsas y elegibilidad de devolución. Publique automáticamente los listados limpios (>0.92 seguro) y aísle los SKU de alto riesgo para inspección multimodal.",
      "pt": "Execute o clavue-jev durante a ingestão para pontuar a probabilidade de falsificações/mercadorias proibidas, sinais de avaliações falsas e elegibilidade de devolução. Publique automaticamente listagens limpas (>0.92 seguro) e isole SKUs de alto risco para inspeção multimodal."
    },
    "impact": {
      "en": "86% straight-through automation with calibrated confidence thresholds tunable per country and category.",
      "zh": "实现 86% 直通自动化，按国家与类目灵活微调置信度阈值。",
      "ja": "国とカテゴリごとに調整可能なキャリブレーションされた信頼度閾値により、86% のストレートスルー自動化を実現。",
      "ko": "국별 및 카테고리별 조정 가능한 보정된 신뢰도 임계값으로 86% 의 직통 자동화 달성.",
      "de": "86% Straight-Through-Automatisierung mit pro Land und Kategorie justierbaren kalibrierten Vertrauensschwellenwerten.",
      "fr": "86 % d'automatisation en direct avec des seuils de confiance calibrés ajustables par pays et catégorie.",
      "es": "86 % de automatización directa con umbrales de confianza calibrados ajustables por país y categoría.",
      "pt": "86 % de automação direta com limiares de confiança calibrados ajustáveis por país e categoria."
    },
    "samplePayload": "{\n  \"state\": \"Listing title: '1:1 mirror quality luxury leather handbag, no box, WhatsApp for factory catalog.' Price: $39.\",\n  \"questions\": {\n    \"counterfeit_signal\": { \"type\": \"noul\", \"instructions\": \"Does this listing exhibit counterfeit or off-platform solicitation signals?\" },\n    \"action\": { \"type\": \"choice\", \"instructions\": \"Moderation action\", \"options\": [\"publish\", \"quarantine_review\", \"block_listing\"] }\n  }\n}",
    "codeLang": "typescript",
    "codeSnippet": "const { answers } = await jevJudge(listingText, {\n  counterfeit: { type: 'noul', instructions: 'Indicates counterfeit goods or off-platform payment?' },\n  action: { type: 'choice', instructions: 'Enforcement decision', options: ['publish', 'manual_review', 'block'] },\n});\nawait db.listings.updateStatus(listing.id, answers.counterfeit.noul > 0.85 ? 'blocked' : answers.action.choice);"
  },
  {
    "slug": "saas-customer-support",
    "sector": "saas",
    "regionFocus": "Global 8+ Languages",
    "compliance": "SOC2 · GDPR",
    "latencyTarget": "68 ms p50 / 125 ms p95",
    "llmBypassRate": "81%",
    "recommendedGpuSlug": "rtx-5090-32g",
    "recommendedRecipeSlug": "realtime-support-triage-app",
    "heroImage": "/img/guides/industries-enterprise.webp",
    "name": {
      "en": "Global B2B SaaS Multilingual Support Triage",
      "zh": "全球 B2B SaaS 多语种客服工单分诊",
      "ja": "グローバル B2B SaaS 多言語サポートの優先整理",
      "ko": "글로벌 B2B SaaS 다국어 지원 우선순위 분류",
      "de": "Globale B2B SaaS mehrsprachige Support-Triage",
      "fr": "Triage de support multilingue B2B SaaS mondial",
      "es": "Triaje de soporte multilingüe B2B SaaS global",
      "pt": "Triagem de suporte multilíngue B2B SaaS global"
    },
    "tagline": {
      "en": "Instant intent routing, churn/anger detection, and SLA priority across 8+ customer languages",
      "zh": "覆盖 8+ 语种的实时意图路由、流失预警与 SLA 优先级自动定级",
      "ja": "8 以上の顧客言語に対応した即時意図ルーティング、解約/怒り検出、および SLA 優先順位付け",
      "ko": "8 개 이상의 고객 언어에 대한 즉시 의도 라우팅, 이탈/분노 감지 및 SLA 우선순위 설정",
      "de": "Sofortige Intent-Weiterleitung, Churn-/Wut-Erkennung und SLA-Priorisierung in über 8 Kunden-Sprachen",
      "fr": "Routage d'intention instantané, détection de churn/colère et priorité SLA dans plus de 8 langues clients",
      "es": "Ruteo de intención instantáneo, detección de abandono/ira y prioridad SLA en más de 8 idiomas de clientes",
      "pt": "Roteamento de intenção instantâneo, detecção de churn/raiva e prioridade SLA em mais de 8 idiomas de clientes"
    },
    "problem": {
      "en": "Support teams using Zendesk, Intercom, or Linear waste hours manually tagging multilingual tickets and miss VIP cancellation threats buried in general queues.",
      "zh": "跨国 SaaS 客服团队在 Zendesk / Intercom / Linear 中耗费大量人力手动打标，高价值客户的流失信号与严重故障常淹没在普通队列中。",
      "ja": "Zendesk、Intercom、Linear を使用しているサポートチームは、多言語チケットを手動でタグ付けするために時間を浪費し、一般キューに埋もれた VIP 解約の脅威を見逃しています。",
      "ko": "Zendesk, Intercom, Linear 를 사용하는 지원 팀은 다국어 티켓을 수동으로 태그하는 데 시간을 낭비하며, 일반 큐에 숨겨진 VIP 해지 위협을 놓칩니다.",
      "de": "Support-Teams, die Zendesk, Intercom oder Linear nutzen, verschwenden Stunden mit der manuellen Kennzeichnung mehrsprachiger Tickets und übersehen VIP-Absagungsbedrohungen, die in allgemeinen Warteschlangen versteckt sind.",
      "fr": "Les équipes de support utilisant Zendesk, Intercom ou Linear gaspillent des heures à étiqueter manuellement des tickets multilingues et manquent les menaces d'annulation VIP enfouies dans les files d'attente générales.",
      "es": "Los equipos de soporte que utilizan Zendesk, Intercom o Linear pierden horas etiquetando manualmente tickets multilingües y pierden las amenazas de cancelación VIP enterradas en colas generales.",
      "pt": "Equipes de suporte que utilizam Zendesk, Intercom ou Linear desperdiçam horas etiquetando manualmente tickets multilíngues e perdem ameaças de cancelamento VIP enterradas em filas gerais."
    },
    "solution": {
      "en": "A webhook calls clavue-jev on every inbound ticket to output department (billing/technical/security/sales), urgency, churn risk (noul), and self-serve eligibility—routing tickets before any AI drafting model runs.",
      "zh": "工单到达 Webhook 时立即调用 clavue-jev，并行输出归属部门、紧急度、流失风险（noul）与自助答复资格，先完成精准分流再决定是否唤醒生成模型草拟回复。",
      "ja": "すべての入出チケットで clavue-jev を呼び出す Webhook を使用し、部署（請求/技術/セキュリティ/営業）、緊急性、解約リスク（noul）、およびセルフサービス適格性を出力します。AI 起草モデルの実行前にチケットをルーティングします。",
      "ko": "각 입출 티켓마다 clavue-jev 를 호출하여 부서 (결제/기술/보안/영업), 긴급도, 이탈 위험 (noul), 그리고 자체 서비스 적합성을 출력합니다. AI 초안 모델 실행 전에 티켓을 라우팅합니다.",
      "de": "Ein Webhook ruft clavue-jev bei jedem eingehenden Ticket auf, um Abteilung (Abrechnung/Technik/Sicherheit/Vertrieb), Dringlichkeit, Churn-Risiko (noul) und Self-Service-Tauglichkeit auszugeben – Tickets werden vor jedem AI-Drafting-Modell geroutet.",
      "fr": "Un webhook appelle clavue-jev sur chaque ticket entrant pour afficher le département (facturation/technique/sécurité/vente), l'urgence, le risque de churn (noul) et l'éligibilité à l'auto-service – routant les tickets avant que tout modèle de brouillon IA ne s'exécute.",
      "es": "Un webhook llama a clavue-jev en cada ticket entrante para devolver departamento (facturación/técnico/seguridad/ventas), urgencia, riesgo de abandono (noul) y elegibilidad para autoservicio – ruteando tickets antes de que cualquier modelo de redacción de IA se ejecute.",
      "pt": "Um webhook chama clavue-jev em cada ticket de entrada para retornar departamento (faturamento/técnico/segurança/vendas), urgência, risco de churn (noul) e elegibilidade para autoatendimento – roteando tickets antes que qualquer modelo de redação de IA seja executado."
    },
    "impact": {
      "en": "First-response SLA improves 4× while cutting support LLM drafting costs by 81%.",
      "zh": "首次响应 SLA 提速 4 倍，同时削减 81% 的客服大模型调用账单。",
      "ja": "ファーストレスポンス SLA が 4 倍向上し、サポート LLM 起草コストを 81% 削減します。",
      "ko": "첫 응답 SLA 가 4 배 개선되고 지원 LLM 초안 비용을 81% 절감합니다.",
      "de": "Die First-Response-SLA verbessert sich um das 4-fache, während die Support-LLM-Drafting-Kosten um 81% gesenkt werden.",
      "fr": "Le SLA de première réponse s'améliore de 4 fois tout en réduisant les coûts de brouillage LLM de support de 81 %.",
      "es": "El SLA de primera respuesta mejora 4 veces mientras se reducen los costos de redacción LLM de soporte en un 81%.",
      "pt": "O SLA de primeira resposta melhora 4 vezes enquanto reduz os custos de redação LLM de suporte em 81%."
    },
    "samplePayload": "{\n  \"state\": \"Our SSO SAML login has been broken for 120 seats since your 08:00 deploy. Renewal is next week—fix today or we cancel.\",\n  \"questions\": {\n    \"churn_threat\": { \"type\": \"noul\", \"instructions\": \"Does the customer threaten cancellation or churn?\" },\n    \"team\": { \"type\": \"choice\", \"instructions\": \"Target team\", \"options\": [\"billing\", \"auth_sre\", \"product\", \"sales\"] },\n    \"priority\": { \"type\": \"choice\", \"instructions\": \"SLA tier\", \"options\": [\"p0_outage\", \"p1_urgent\", \"p2_normal\", \"p3_low\"] }\n  }\n}",
    "codeLang": "typescript",
    "codeSnippet": "export async function onTicketWebhook(ticket: Ticket) {\n  const { answers } = await jevJudge(ticket.body, {\n    churn: { type: 'noul', instructions: 'Customer threatens churn or escalation?' },\n    team: { type: 'choice', instructions: 'Assign team', options: ['billing', 'auth_sre', 'support', 'sales'] },\n    priority: { type: 'choice', instructions: 'Priority', options: ['p0', 'p1', 'p2', 'p3'] },\n  });\n  await linear.createIssue({ team: answers.team.choice, priority: answers.priority.choice, urgentAlert: answers.churn.noul > 0.7 });\n}"
  },
  {
    "slug": "devops-sre-incident",
    "sector": "devops",
    "regionFocus": "Global Cloud / Multi-Region",
    "compliance": "ISO 27001 · SOC2",
    "latencyTarget": "60 ms p50 / 110 ms p95",
    "llmBypassRate": "88%",
    "recommendedGpuSlug": "nvidia-l4-24g",
    "recommendedRecipeSlug": "shell-curl-github-actions",
    "heroImage": "/img/guides/blueprint-cascade.webp",
    "name": {
      "en": "DevOps, SRE Incident Triage & CI/CD Release Gates",
      "zh": "DevOps / SRE 故障降噪与 CI/CD 发布门禁",
      "ja": "DevOps、SRE 事故対応および CI/CD リリースゲート",
      "ko": "DevOps, SRE 사고 대응 및 CI/CD 릴리스 게이트",
      "de": "DevOps, SRE Incident-Triage & CI/CD Release Gates",
      "fr": "DevOps, SRE Incident Triage & CI/CD Release Gates",
      "es": "DevOps, SRE Triage de Incidentes y Puertas de Liberación CI/CD",
      "pt": "DevOps, SRE Triage de Incidentes e Portas de Lançamento CI/CD"
    },
    "tagline": {
      "en": "Automated PR risk scoring, canary rollback gating, and alert noise suppression in CI pipelines",
      "zh": "在 GitHub Actions 与告警链路中实现百毫秒级 PR 风险评分与灰度回滚门控",
      "ja": "CI パイプラインにおける自動 PR リスクスコアリング、カナリアロールバックゲート、およびアラートノイズの抑制",
      "ko": "CI 파이프라인 내 자동 PR 리스크 점수화, 카나리아 롤백 게이트, 및 알림 노이즈 억제",
      "de": "Automatisierte PR-Risikobewertung, Canary-Rollback-Gating und Unterdrückung von Alarm-Rauschen in CI-Pipelines",
      "fr": "Évaluation automatique des risques de PR, verrouillage de rollback de canard et suppression du bruit d'alertes dans les pipelines CI",
      "es": "Puntuación de riesgo de PR automatizada, bloqueo de rollback de canario y supresión de ruido de alertas en pipelines CI",
      "pt": "Pontuação de risco de PR automatizada, bloqueio de rollback de canário e supressão de ruído de alertas em pipelines CI"
    },
    "problem": {
      "en": "On-call engineers suffer alert fatigue from noisy deploy logs and PRs that skip manual security checks. Slow 20-second LLM checks stall GitHub Actions queues.",
      "zh": "值班工程师饱受告警风暴困扰，且人工 Code Review 容易漏过数据库破坏性变更或权限回退；传统大模型检查耗时数十秒拖慢流水线。",
      "ja": "オンコールエンジニアは、ノイズの多いデプロイログや手動セキュリティチェックをスキップした PR からアラート疲労に悩まされています。遅延する 20 秒の LLM チェックは GitHub Actions キューを停止させます。",
      "ko": "온콜 엔지니어는 노이즈가 많은 배포 로그와 수동 보안 검사를 건너뜀 PR 에서 알림 피로에 시달립니다. 느린 20 초 LLM 체크는 GitHub Actions 큐를 막습니다.",
      "de": "On-Call-Ingenieure leiden unter Alarm-Müdigkeit durch laute Deploy-Logs und PRs, die manuelle Sicherheitsprüfungen überspringen. Langsame 20-Sekunden-LLM-Checks blockieren GitHub Actions-Warteschlangen.",
      "fr": "Les ingénieurs en garde souffrent de fatigue d'alertes due aux journaux de déploiement bruyants et aux PR qui sautent les contrôles de sécurité manuels. Les vérifications LLM lentes de 20 secondes bloquent les files d'attente GitHub Actions.",
      "es": "Los ingenieros de guardia sufren fatiga de alertas debido a registros de despliegue ruidosos y PRs que saltan las verificaciones de seguridad manuales. Las verificaciones LLM lentas de 20 segundos estancan las colas de GitHub Actions.",
      "pt": "Engenheiros de plantão sofrem com fadiga de alertas devido a logs de deploy ruidosos e PRs que pulham verificações de segurança manuais. Verificações LLM lentas de 20 segundos estancam filas do GitHub Actions."
    },
    "solution": {
      "en": "Call clavue-jev inside GitHub Actions and PagerDuty webhooks to score migration safety, secret exposure risk, and canary error-log regressions in <100ms—blocking high-risk merges automatically.",
      "zh": "在 CI 门禁与告警 Webhook 接入 clavue-jev，百毫秒评估迁移风险、敏感凭据泄露与灰度日志异常，高风险变更自动拦截阻断合入。",
      "ja": "GitHub Actions と PagerDuty ウェブフック内で clavue-jev を呼び出し、移行安全性、機密情報の露出リスク、およびカナリアエラーログの回帰を<100ms でスコアリングし、高リスクのマージを自動的にブロックします。",
      "ko": "GitHub Actions 와 PagerDuty 웹훅에서 clavue-jev 을 호출하여 마이그레이션 안전성, 기밀 정보 노출 위험, 및 카나리아 오류 로그 회귀를 <100ms 로 점수화하고 고위험 병합을 자동으로 차단합니다.",
      "de": "Rufen Sie clavue-jev innerhalb von GitHub Actions und PagerDuty-Webhooks auf, um Migrations-Sicherheit, Geheimnis-Expositionsrisiko und Canary-Fehler-Log-Regressionen in <100ms zu bewerten und Hochrisiko-Merges automatisch zu blockieren.",
      "fr": "Appelez clavue-jev dans GitHub Actions et les webhooks PagerDuty pour évaluer la sécurité de migration, le risque d'exposition de secrets et les régressions d'erreurs de canard en <100ms, bloquant automatiquement les fusions à haut risque.",
      "es": "Llame a clavue-jev dentro de GitHub Actions y webhooks de PagerDuty para puntuar la seguridad de la migración, el riesgo de exposición de secretos y las regresiones de errores de canario en <100ms, bloqueando automáticamente las fusiones de alto riesgo.",
      "pt": "Chame o clavue-jev dentro do GitHub Actions e webhooks do PagerDuty para pontuar a segurança da migração, o risco de exposição de segredos e regressões de logs de erro de canário em <100ms, bloqueando automaticamente fusões de alto risco."
    },
    "impact": {
      "en": "88% reduction in false-positive pages and sub-second automated release safety gates.",
      "zh": "误报告警下降 88%，CI 发布安全门禁控制在百毫秒内。",
      "ja": "誤検知アラートの 88% 削減と、サブ秒単位の自動リリース安全性ゲートの実現。",
      "ko": "거짓 양성 페이지 88% 감소 및 서브 초 자동 릴리스 안전 게이트 구현.",
      "de": "88% Reduktion von False-Positive-Seiten und sub-second automatisierte Release-Sicherheitsgates.",
      "fr": "Réduction de 88 % des pages de faux positifs et des portes de sécurité de release automatisées en moins d'une seconde.",
      "es": "88% de reducción en páginas de falsos positivos y puertas de seguridad de liberación automatizadas en subsegundos.",
      "pt": "Redução de 88% em páginas de falsos positivos e portas de segurança de lançamento automatizadas em subsegundos."
    },
    "samplePayload": "{\n  \"state\": \"PR diff drops NOT NULL constraint on payments.user_id and disables CSRF middleware on /api/auth/redeem.\",\n  \"questions\": {\n    \"release_ready\": { \"type\": \"noul\", \"instructions\": \"Is this PR safe to merge without security sign-off?\" },\n    \"risk\": { \"type\": \"choice\", \"instructions\": \"Change risk class\", \"options\": [\"low\", \"medium\", \"high_blocker\"] }\n  }\n}",
    "codeLang": "bash",
    "codeSnippet": "curl -fsS https://api.jevcode.ai/v1/judge \\\n  -H \"Authorization: Bearer $JEVCODE_API_KEY\" -H \"Content-Type: application/json\" \\\n  -d '{\"state\":\"'\"$PR_DIFF_SUMMARY\"'\",\"questions\":{\"safe\":{\"type\":\"noul\",\"instructions\":\"Safe to auto-merge?\"}}}' \\\n  | jq -e '.answers.safe.noul >= 0.85'"
  },
  {
    "slug": "cybersecurity-soc-triage",
    "sector": "security",
    "regionFocus": "Global Enterprise / MSSP",
    "compliance": "NIS2 · SOC2 · ISO 27001",
    "latencyTarget": "65 ms p50 / 120 ms p95",
    "llmBypassRate": "85%",
    "recommendedGpuSlug": "nvidia-h100-80g-sxm",
    "recommendedRecipeSlug": "rust-tokio-reqwest",
    "heroImage": "/img/guides/blueprint-edge.webp",
    "name": {
      "en": "Cybersecurity SOC Alert Triage & Phishing Defense",
      "zh": "网络安全 SOC 告警研判与钓鱼/提示注入防御",
      "ja": "サイバーセキュリティ SOC アラート優先順位付けとフィッシング防御",
      "ko": "사이버보안 SOC 경고 우선순위 지정 및 피싱 방어",
      "de": "Cybersecurity SOC Alarm-Triage und Phishing-Abwehr",
      "fr": "Triage des alertes SOC Cybersecurity et défense contre le phishing",
      "es": "Triage de alertas SOC de ciberseguridad y defensa contra phishing",
      "pt": "Triagem de alertas SOC de cibersegurança e defesa contra phishing"
    },
    "tagline": {
      "en": "High-throughput SIEM alert deduplication, prompt-injection defense, and phishing escalation",
      "zh": "高吞吐 SIEM 告警降噪、MITRE 战术分类与 AI Agent 实时提示注入拦截",
      "ja": "高スループット SIEM アラート重複排除、プロンプトインジェクション防御、フィッシングエスカレーション",
      "ko": "고처리량 SIEM 경고 중복 제거, 프롬프트 주입 방어, 피싱 에스컬레이션",
      "de": "Hoher Durchsatz SIEM-Alarm-Deduplizierung, Prompt-Injection-Abwehr und Phishing-Eskalation",
      "fr": "Déduplication des alertes SIEM à haut débit, défense contre l'injection de prompts et escalade du phishing",
      "es": "Deduplicación de alertas SIEM de alto rendimiento, defensa contra inyección de prompts y escalada de phishing",
      "pt": "Deducação de alertas SIEM de alto throughput, defesa contra injeção de prompts e escalada de phishing"
    },
    "problem": {
      "en": "SOC teams face 10,000+ daily SIEM events, suspicious emails, and AI agent prompt-injection attempts. Analysts drown in benign positives while real lateral movement hides in the backlog.",
      "zh": "安全运营中心每天面对上万条 SIEM 告警、可疑邮件与 AI Agent 提示注入攻击，人工极易疲劳漏报真正的横向移动威胁。",
      "ja": "SOC チームは、1 日 10,000 件以上の SIEM イベント、疑わしいメール、および AI エージェントへのプロンプトインジェクション攻撃に直面しています。分析担当者は無害な陽性結果に埋もれ、実際のラテラルムーブメントはバックログに隠れています。",
      "ko": "SOC 팀은 일일 10,000 건 이상의 SIEM 이벤트, 의심스러운 이메일, 그리고 AI 에이전트 프롬프트 주입 시도에 직면해 있습니다. 분석가들은 유해하지 않은 양성 결과에 묻혀 있으며, 실제 라테럴 이동은 백로그에 숨어 있습니다.",
      "de": "SOC-Teams sind mit über 10.000 täglichen SIEM-Ereignissen, verdächtigen E-Mails und KI-Agenten-Prompt-Injection-Versuchen konfrontiert. Analysten ertrinken in harmlosen Positivmeldungen, während echte laterale Bewegungen im Rückstand versteckt bleiben.",
      "fr": "Les équipes SOC font face à plus de 10 000 événements SIEM quotidiens, des e-mails suspects et des tentatives d'injection de prompts d'agents IA. Les analystes sont submergés par des faux positifs inoffensifs tandis que les mouvements latéraux réels se cachent dans la file d'attente.",
      "es": "Los equipos SOC enfrentan más de 10,000 eventos SIEM diarios, correos electrónicos sospechosos e intentos de inyección de prompts en agentes de IA. Los analistas se ahogan en falsos positivos inofensivos mientras el movimiento lateral real se esconde en la cola.",
      "pt": "Equipes SOC enfrentam mais de 10.000 eventos SIEM diários, e-mails suspeitos e tentativas de injeção de prompts em agentes de IA. Analistas estão submersos em falsos positivos inofensivos enquanto o movimento lateral real se esconde na fila."
    },
    "solution": {
      "en": "A Rust Tokio worker streams normalized alert payloads to clavue-jev for binary maliciousness (noul) and MITRE ATT&CK tactic classification (choice), auto-closing verified benign scans and paging Tier-2 analysts on high-confidence threats.",
      "zh": "由 Rust Tokio 异步服务将标准化告警并发推送至 clavue-jev，秒级输出恶意概率（noul）与攻击阶段（choice），自动关闭良性扫描并对高置信威胁即刻告警。",
      "ja": "Rust Tokio ワーカーは、正規化されたアラートペイロードを clavue-jev にストリーミングし、バイナリマルウェア判定（noul）と MITRE ATT&CK タクティクス分類（choice）を実行します。検証済みの無害スキャンは自動閉鎖され、高信頼度の脅威については 2 次分析担当者にページされます。",
      "ko": "Rust Tokio 워커는 정규화된 경고 페이로드를 clavue-jev 로 스트리밍하여 바이너리 악성도 (noul) 판별과 MITRE ATT&CK 전술 분류 (choice) 를 자동으로 수행합니다. 검증된 유해하지 않은 스캔은 자동 종료되고, 고신뢰도 위협에 대해서는 2 차 분석가에게 페이지가 발송됩니다.",
      "de": "Ein Rust Tokio Worker streamt normalisierte Alarm-Payloads an clavue-jev zur binären Schädlichkeitsbestimmung (noul) und MITRE ATT&CK-Taktik-Klassifizierung (choice), schließt verifizierte harmlose Scans automatisch und alarmiert Tier-2-Analysten bei hochvertraulichen Bedrohungen.",
      "fr": "Un worker Rust Tokio diffuse les charges utiles d'alertes normalisées vers clavue-jev pour la détermination binaire de la malveillance (noul) et la classification des tactiques MITRE ATT&CK (choice), fermant automatiquement les scans inoffensifs vérifiés et alertant les analystes de niveau 2 sur les menaces à haute confiance.",
      "es": "Un worker de Rust Tokio transmite cargas útiles de alertas normalizadas a clavue-jev para la determinación binaria de malicia (noul) y clasificación de tácticas MITRE ATT&CK (choice), cerrando automáticamente los escaneos inofensivos verificados y notificando a los analistas de nivel 2 sobre amenazas de alta confianza.",
      "pt": "Um worker Rust Tokio streama cargas úteis de alertas normalizadas para clavue-jev para determinação binária de malícia (noul) e classificação de táticas MITRE ATT&CK (choice), fechando automaticamente varreduras inofensivas verificadas e notificando analistas de nível 2 sobre ameaças de alta confiança."
    },
    "impact": {
      "en": "85% analyst queue compression and sub-120ms inline prompt-injection blocking for AI agents.",
      "zh": "SOC 人工研判队列压缩 85%，并可在 120ms 内实现 AI Agent 入口提示注入实时阻断。",
      "ja": "分析担当者のキュー圧縮率 85%、AI エージェント向けのインラインプロンプトインジェクションブロック遅延 120ms 未満。",
      "ko": "분석가 대기열 압축률 85%, AI 에이전트를 위한 인라인 프롬프트 주입 차단 지연 시간 120ms 미만.",
      "de": "85% Kompression der Analysten-Warteschlange und sub-120ms Inline-Blockierung von Prompt-Injection-Angriffen für KI-Agenten.",
      "fr": "Compression de la file d'attente des analystes de 85 % et blocage en ligne des injections de prompts pour les agents IA en moins de 120 ms.",
      "es": "Compresión del 85 % de la cola de analistas y bloqueo en línea de inyección de prompts para agentes de IA en menos de 120 ms.",
      "pt": "Compressão de 85% da fila de analistas e bloqueio em linha de injeção de prompts para agentes de IA em menos de 120 ms."
    },
    "samplePayload": "{\n  \"state\": \"Email claims HR payroll update from hr-payro11-portal.net requesting immediate Okta MFA code entry.\",\n  \"questions\": {\n    \"is_phishing\": { \"type\": \"noul\", \"instructions\": \"Is this a credential-harvesting phishing attempt?\" },\n    \"severity\": { \"type\": \"choice\", \"instructions\": \"SOC severity\", \"options\": [\"benign\", \"suspicious\", \"critical_quarantine\"] }\n  }\n}",
    "codeLang": "rust",
    "codeSnippet": "let resp: JudgeResp = client.post(\"https://api.jevcode.ai/v1/judge\")\n    .bearer_auth(&api_key)\n    .json(&serde_json::json!({\n        \"state\": alert.summary,\n        \"questions\": { \"malicious\": { \"type\": \"noul\", \"instructions\": \"Is this alert malicious?\" } }\n    }))\n    .send().await?.json().await?;\nif resp.answers[\"malicious\"].noul >= 0.88 { quarantine_host(&alert.host).await?; }"
  },
  {
    "slug": "manufacturing-iot-qa",
    "sector": "industrial",
    "regionFocus": "Germany / Japan / China / US",
    "compliance": "ISO 9001 · IEC 62443",
    "latencyTarget": "75 ms p50 / 140 ms p95",
    "llmBypassRate": "83%",
    "recommendedGpuSlug": "rtx-4090-24g",
    "recommendedRecipeSlug": "golang-high-throughput",
    "heroImage": "/img/guides/gpus-hero.webp",
    "name": {
      "en": "Smart Manufacturing, Quality Inspection & IIoT Maintenance",
      "zh": "智能制造质检异常分级与工业物联网运维派单",
      "ja": "スマート製造、品質検査およびIIoT保守",
      "ko": "스마트 제조, 품질 검사 및 IIoT 유지보수",
      "de": "Smart Manufacturing, Qualitätsprüfung und IIoT-Wartung",
      "fr": "Fabrication intelligente, inspection de qualité et maintenance IIoT",
      "es": "Fabricación inteligente, inspección de calidad y mantenimiento IIoT",
      "pt": "Manufatura inteligente, inspeção de qualidade e manutenção IIoT"
    },
    "tagline": {
      "en": "Rapid operator-log defect triage and predictive maintenance dispatch across factory lines",
      "zh": "跨德/日/中/英多国工厂的班次异常日志实时分级与预测性维护派单",
      "ja": "工場ライン全体での迅速なオペレーターログ欠陥選別と予測保全ディスパッチ",
      "ko": "공장 라인 전반에 걸친 신속한 운영자 로그 결함 선별 및 예측 유지보수 파견",
      "de": "Schnelle Triage von Operator-Log-Fehlern und vorausschauende Wartungsdispatching über Produktionslinien hinweg",
      "fr": "Triage rapide des défauts dans les logs d'opérateurs et déploiement de maintenance prédictive sur les lignes d'usine",
      "es": "Triaje rápido de defectos en registros de operadores y despacho de mantenimiento predictivo en líneas de fábrica",
      "pt": "Triagem rápida de defeitos em logs de operadores e despacho de manutenção preditiva em linhas de fábrica"
    },
    "problem": {
      "en": "Factory MES systems log thousands of shift handoff notes, vibration anomalies, and QA inspection reports in Japanese, German, Chinese, and English. Unplanned line stops cost $20K+/hour.",
      "zh": "工厂 MES 每日产生海量多语种交接班记录、设备振动告警与质检报告，产线意外停机每小时损失数万美元。",
      "ja": "工場MESシステムは、日本語、ドイツ語、中国語、英語で数千件のシフト交代メモ、振動異常、およびQA検査レポートを記録します。予期せぬライン停止は1時間あたり2万ドル以上の損失をもたらします。",
      "ko": "공장 MES 시스템은 일본어, 독일어, 중국어, 영어로 수천 건의 교대 인수 메모, 진동 이상, 및 QA 검사 보고서를 기록합니다. 계획되지 않은 라인 정지는 시간당 2 만 달러 이상의 손실을 초래합니다.",
      "de": "FabrikmES-Systeme protokollieren Tausende von Schichtübergabe-Notizen, Vibrationsanomalien und QA-Inspektionsberichte auf Japanisch, Deutsch, Chinesisch und Englisch. Ungeplante Linienstillstände kosten über 20.000 USD pro Stunde.",
      "fr": "Les systèmes MES d'usine enregistrent des milliers de notes de relais de poste, d'anomalies de vibration et de rapports d'inspection QA en japonais, allemand, chinois et anglais. Les arrêts de ligne imprévus coûtent plus de 20 000 $/heure.",
      "es": "Los sistemas MES de fábrica registran miles de notas de relevo de turno, anomalías de vibración y informes de inspección de calidad en japonés, alemán, chino e inglés. Las paradas de línea no planificadas cuestan más de 20.000 USD/hora.",
      "pt": "Os sistemas MES da fábrica registram milhares de notas de troca de turno, anomalias de vibração e relatórios de inspeção de qualidade em japonês, alemão, chinês e inglês. Paradas de linha não planejadas custam mais de 20.000 USD/hora."
    },
    "solution": {
      "en": "Pair edge sensor summaries and shift reports with clavue-jev to classify halt-line defects vs scheduled maintenance, dispatching work orders automatically while reserving generative root-cause diagnostics for recurring faults.",
      "zh": "将传感器异常摘要与巡检日志送入 clavue-jev，自动区分「立即停线缺陷」与「计划维保」，仅对反复出现的复杂故障触发根因推理大模型。",
      "ja": "エッジセンサーのサマリーとシフトレポートをclavue-jevと組み合わせ、停止ラインの欠陥と計画保全を分類し、作業オーダーを自動的にディスパッチします。再発する故障には生成型根本原因診断を留保します。",
      "ko": "엣지 센서 요약 및 교대 보고서를 clavue-jev 와 결합하여 정지 라인 결함 및 계획 유지보수를 분류하고 작업 주문을 자동으로 파견합니다. 재발하는 고장에는 생성형 근본 원인 진단을 예약합니다.",
      "de": "Koppeln Sie Edge-Sensor-Zusammenfassungen und Schichtberichte mit clavue-jev, um Stillstandsfehler von geplanten Wartungen zu unterscheiden, und dispatchen Sie Arbeitsaufträge automatisch, während generative Root-Cause-Diagnosen für wiederkehrende Fehler vorbehalten bleiben.",
      "fr": "Associez les résumés de capteurs en bordure et les rapports de poste avec clavue-jev pour classer les défauts d'arrêt de ligne par rapport à la maintenance planifiée, en déployant automatiquement les bons de travail tout en réservant les diagnostics de cause racine génératifs pour les pannes récurrentes.",
      "es": "Combine los resúmenes de sensores en el borde y los informes de turno con clavue-jev para clasificar los defectos de parada de línea frente al mantenimiento programado, despachando órdenes de trabajo automáticamente mientras reserva diagnósticos de causa raíz generativos para fallas recurrentes.",
      "pt": "Combine resumos de sensores na borda e relatórios de turno com clavue-jev para classificar defeitos de parada de linha versus manutenção programada, despachando ordens de trabalho automaticamente enquanto reserva diagnósticos de causa raiz gerativos para falhas recorrentes."
    },
    "impact": {
      "en": "Cuts unplanned downtime response latency and standardizes multilingual QA triage across global plants.",
      "zh": "显著缩短异常响应时间，统一全球工厂多语种质检分级口径。",
      "ja": "予期せぬダウンタイムへの対応遅延を削減し、グローバル工場全体での多言語QA選別を標準化します。",
      "ko": "계획되지 않은 다운타임 대응 지연을 줄이고 글로벌 공장 전반의 다국어 QA 선별을 표준화합니다.",
      "de": "Reduziert die Reaktionslatenz bei ungeplanten Stillständen und standardisiert die mehrsprachige QA-Triage über globale Werke hinweg.",
      "fr": "Réduit la latence de réponse aux arrêts imprévus et standardise le triage QA multilingue dans les usines mondiales.",
      "es": "Reduce la latencia de respuesta ante paradas no planificadas y estandariza el triaje de calidad multilingüe en plantas globales.",
      "pt": "Reduz a latência de resposta a paradas não planejadas e padroniza a triagem de qualidade multilíngue em plantas globais."
    },
    "samplePayload": "{\n  \"state\": \"CNC spindle #4 bearing temp rose +18C in 12min with 2.4x harmonic vibration spike; operator notes faint metallic whine.\",\n  \"questions\": {\n    \"stop_line\": { \"type\": \"noul\", \"instructions\": \"Should the spindle be halted immediately to prevent failure?\" },\n    \"dispatch\": { \"type\": \"choice\", \"instructions\": \"Maintenance priority\", \"options\": [\"emergency_stop\", \"next_shift\", \"log_only\"] }\n  }\n}",
    "codeLang": "go",
    "codeSnippet": "payload := map[string]any{\n    \"state\": telemetrySummary,\n    \"questions\": map[string]any{\n        \"stop_line\": map[string]any{\"type\": \"noul\", \"instructions\": \"Halt machine immediately?\"},\n        \"dispatch\":  map[string]any{\"type\": \"choice\", \"instructions\": \"Work order\", \"options\": []string{\"emergency_stop\", \"next_shift\", \"log_only\"}},\n    },\n}"
  },
  {
    "slug": "logistics-supply-chain",
    "sector": "logistics",
    "regionFocus": "Global Trade / EU / US / APAC",
    "compliance": "WCO HS · Customs Compliance",
    "latencyTarget": "75 ms p50 / 145 ms p95",
    "llmBypassRate": "80%",
    "recommendedGpuSlug": "nvidia-l40s-48g",
    "recommendedRecipeSlug": "java-spring-boot",
    "heroImage": "/img/guides/industries-hero.webp",
    "name": {
      "en": "Global Logistics, Customs Clearance & Exception Routing",
      "zh": "跨境物流清关异常拦截与危险品申报初筛",
      "ja": "グローバルロジスティクス、通関、例外ルーティング",
      "ko": "글로벌 물류, 통관, 예외 라우팅",
      "de": "Globale Logistik, Zollabfertigung und Ausnahmerouting",
      "fr": "Logistique mondiale, dédouanement et routage des exceptions",
      "es": "Logística global, despacho de aduanas y enrutamiento de excepciones",
      "pt": "Logística global, desembaraço aduaneiro e roteamento de exceções"
    },
    "tagline": {
      "en": "Instant HS-code conflict screening, hazmat detection, and shipment delay escalation",
      "zh": "面单发货前毫秒级识别隐报危险品、HS 编码冲突与单证缺失",
      "ja": "即時のHSコード紛争スクリーニング、危険物検知、および貨物遅延エスカレーション",
      "ko": "즉시 HS 코드 충돌 스크리닝, 위험물 감지, 및 화물 지연 에스컬레이션",
      "de": "Sofortige HS-Code-Konfliktprüfung, Gefahrgut-Erkennung und Versandverzögerungs-Eskalierung",
      "fr": "Détection instantanée des conflits de codes HS, identification des matières dangereuses et escalade des retards d'expédition",
      "es": "Cribado instantáneo de conflictos de código HS, detección de mercancías peligrosas y escalada de retrasos en el envío",
      "pt": "Triagem instantânea de conflitos de código HS, detecção de mercadorias perigosas e escalada de atrasos de envio"
    },
    "problem": {
      "en": "Freight forwarders process massive manifests with inconsistent shipper descriptions. A single misdeclared lithium battery or missing commercial invoice holds an entire container at customs.",
      "zh": "国际货代每天处理海量非规范托运品名，只要漏检一票隐报锂电池或发票缺失，就会导致整柜滞留海关产生高额滞港费。",
      "ja": "貨物フォワーダーは、不整合な発注者説明を含む大規模なマニフェストを処理します。単一の誤申告されたリチウム電池や商業インボイスの欠落が、コンテナ全体を税関で留保します。",
      "ko": "화물 포워더는 일관되지 않은 발주자 설명이 포함된 대규모 마니페스트를 처리합니다. 단일 오선언된 리튬 배터리나 상업 송장 누락이 전체 컨테이너를 세관에서 정지시킵니다.",
      "de": "Frachtführer verarbeiten massive Manifeste mit inkonsistenten Absenderbeschreibungen. Eine einzige falsch deklarierte Lithiumbatterie oder eine fehlende Handelsrechnung hält einen gesamten Container an der Zollstelle zurück.",
      "fr": "Les transitaires traitent des manifestes massifs avec des descriptions d'expéditeurs incohérentes. Une seule batterie au lithium mal déclarée ou une facture commerciale manquante retient un conteneur entier à la douane.",
      "es": "Los transitarios procesan manifiestos masivos con descripciones del remitente inconsistentes. Una sola batería de litio mal declarada o una factura comercial faltante retiene un contenedor entero en aduanas.",
      "pt": "Os despachantes aduaneiros processam manifestos massivos com descrições do remetente inconsistentes. Uma única bateria de lítio mal declarada ou uma fatura comercial faltante retém um contêiner inteiro na alfândega."
    },
    "solution": {
      "en": "Screen every waybill description via clavue-jev for dangerous goods (noul), customs document completeness, and carrier exception class before manifests transmit to port EDI gateways.",
      "zh": "在报文发送至口岸 EDI 前由 clavue-jev 并发判定危险品风险（noul）、单证完整度与异常类型，干净运单直通放行，异常票件秒级退回补单。",
      "ja": "マニフェストが港湾EDIゲートウェイに送信される前に、clavue-jev を使用してすべての荷送書説明を危険物（noul）、通関書類の完全性、およびキャリア例外クラスについてスクリーニングします。",
      "ko": "마니페스트가 항구 EDI 게이트웨이로 전송되기 전에 clavue-jev 를 사용하여 모든 송장 설명을 위험물 (noul), 통관 문서 완전성, 및 운송사 예외 클래스에 대해 스크리닝합니다.",
      "de": "Screenen Sie jede Sendungsbeschreibung via clavue-jev auf gefährliche Güter (noul), Vollständigkeit der Zollunterlagen und Carrier-Ausnahme-Klasse, bevor die Manifeste an Hafen-EDI-Gateways übertragen werden.",
      "fr": "Écranisez chaque description de waybill via clavue-jev pour les marchandises dangereuses (noul), la complétude des documents douaniers et la classe d'exception du transporteur avant que les manifestes ne soient transmis aux passerelles EDI portuaires.",
      "es": "Cribar cada descripción de guía de envío vía clavue-jev para mercancías peligrosas (noul), integridad de documentos aduaneros y clase de excepción del transportista antes de que los manifiestos se transmitan a las pasarelas EDI portuarias.",
      "pt": "Triar cada descrição de guia de remessa via clavue-jev para mercadorias perigosas (noul), integridade de documentos aduaneiros e classe de exceção do transportador antes de os manifestos serem transmitidos aos gateways EDI portuários."
    },
    "impact": {
      "en": "80% fewer manual manifest touches and sharp drop in customs inspection penalties.",
      "zh": "人工审单量下降 80%，显著降低海关查验与滞箱罚金。",
      "ja": "手動マニフェスト操作が 80% 減少し、税関検査ペナルティが大幅に低下します。",
      "ko": "수동 마니페스트 처리가 80% 감소하고 통관 검사 페널티가 급격히 감소합니다.",
      "de": "80 % weniger manuelle Manifest-Bearbeitungen und ein starker Rückgang von Zollinspektionsstrafen.",
      "fr": "80 % moins de manipulations manuelles de manifestes et une baisse marquée des pénalités d'inspection douanière.",
      "es": "80 % menos de toques manuales en manifiestos y una caída aguda en las multas de inspección aduanera.",
      "pt": "80 % menos de toques manuais em manifestos e queda acentuada nas multas de inspeção aduaneira."
    },
    "samplePayload": "{\n  \"state\": \"Waybill: 'Portable outdoor power station 1200Wh LiFePO4', declared as general electronics with no UN3480 hazmat sheet.\",\n  \"questions\": {\n    \"hazmat_hold\": { \"type\": \"noul\", \"instructions\": \"Must this shipment be held for undeclared dangerous goods?\" },\n    \"issue\": { \"type\": \"choice\", \"instructions\": \"Customs status\", \"options\": [\"clear_edi\", \"missing_hazmat_docs\", \"hs_mismatch\"] }\n  }\n}",
    "codeLang": "java",
    "codeSnippet": "var body = Map.of(\n    \"state\", waybill.description(),\n    \"questions\", Map.of(\"hazmatHold\", Map.of(\"type\", \"noul\", \"instructions\", \"Undeclared lithium battery or hazmat?\"))\n);\nvar resp = restClient.post().uri(\"https://api.jevcode.ai/v1/judge\")\n    .header(\"Authorization\", \"Bearer \" + apiKey).body(body).retrieve().body(JudgeResponse.class);"
  },
  {
    "slug": "gaming-anticheat-moderation",
    "sector": "gaming",
    "regionFocus": "Global / KR / JP / US / EU",
    "compliance": "COPPA · Online Safety Act",
    "latencyTarget": "55 ms p50 / 100 ms p95",
    "llmBypassRate": "90%",
    "recommendedGpuSlug": "nvidia-l4-24g",
    "recommendedRecipeSlug": "cloudflare-workers-edge",
    "heroImage": "/img/guides/blueprint-edge.webp",
    "name": {
      "en": "Gaming Live Chat Safety, Toxicity & Appeal Triage",
      "zh": "全球游戏实时聊天治理与封禁申诉分流",
      "ja": "ゲームライブチャット安全性、毒性および訴求の優先処理",
      "ko": "게임 라이브 채팅 안전성, 독성 및 항소 우선순위 처리",
      "de": "Game Live-Chat-Sicherheit, Toxizität und Berufungspriorisierung",
      "fr": "Sécurité du chat en direct de jeu, toxicité et tri des appels",
      "es": "Seguridad del chat en vivo de juegos, toxicidad y clasificación de apelaciones",
      "pt": "Segurança do chat ao vivo de jogos, toxicidade e triagem de apelações"
    },
    "tagline": {
      "en": "Ultra-low-latency multilingual chat moderation and ban-appeal classification at edge scale",
      "zh": "面向韩/日/英/西/葡多语服务器的超低延迟发言风控与申诉自动化",
      "ja": "エッジスケールでの超低遅延多言語チャットモデレーションとBAN訴求分類",
      "ko": "엣지 규모에서의 초저지연 다국어 채팅モデ레이션 및 밴 항소 분류",
      "de": "Ultra-niedrige Latenz mehrsprachige Chat-Moderierung und Ban-Berufungsklassifizierung im Edge-Scale",
      "fr": "Modération de chat multilingue à ultra-basse latence et classification des appels de bannissement à l'échelle du bord",
      "es": "Moderación de chat multilingüe de ultra baja latencia y clasificación de apelaciones de baneo a escala de borde",
      "pt": "Moderação de chat multilíngue de ultra baixa latência e classificação de apelações de banimento em escala de borda"
    },
    "problem": {
      "en": "Multiplayer games handle huge bursts of multilingual slang, griefing reports, and ban appeals across Korean, Japanese, English, Spanish, and Portuguese servers.",
      "zh": "多人在线游戏充斥跨语种俚语辱骂、外挂广告与海量封禁申诉，传统词库误杀率高、重型大模型延迟扛不住实时聊天洪峰。",
      "ja": "マルチプレイヤーゲームは、韓国、日本、英語、スペイン語、ポルトガル語サーバー間で、大量の多言語スラング、イジメ報告、およびBAN訴求を処理します。",
      "ko": "멀티플레이어 게임은 한국, 일본, 영어, 스페인어, 포르투갈어 서버 간에 대량의 다국어 슬랭, 괴롭힘 신고, 및 밴 항구를 처리합니다.",
      "de": "Multiplayer-Spiele verarbeiten enorme Spitzen an mehrsprachigem Slang, Mobbing-Berichten und Ban-Berufungen über Server in Koreanisch, Japanisch, Englisch, Spanisch und Portugiesisch.",
      "fr": "Les jeux multijeurs gèrent d'énormes pics de slang multilingue, de signalements de harcèlement et d'appels de bannissement sur les serveurs coréen, japonais, anglais, espagnol et portugais.",
      "es": "Los juegos multijugador manejan grandes ráfagas de jerga multilingüe, informes de acoso y apelaciones de baneo en servidores en coreano, japonés, inglés, español y portugués.",
      "pt": "Jogos multijogador lidam com grandes rajadas de gírias multilíngues, relatórios de assédio e apelações de banimento em servidores coreanos, japoneses, em inglês, espanhol e português."
    },
    "solution": {
      "en": "Call clavue-jev from Cloudflare Workers or game backend services to score severe harassment/self-harm/cheating-ad signals in <100ms, auto-muting clear violations and routing nuanced appeals.",
      "zh": "由边缘网关或游戏服调用 clavue-jev，百毫秒判定严重骚扰/外挂引流/恶意退赛，明确违规自动禁言，复杂申诉精准分派客服。",
      "ja": "Cloudflare Workersまたはゲームバックエンドサービスからclavue-jevを呼び出し、深刻な嫌がらせ/自殺企図/チート検知シグナルを<100msでスコアリングし、明確な違反を自動ミュートし、微妙な訴求をルーティングします。",
      "ko": "Cloudflare Workers 또는 게임 백엔드 서비스에서 clavue-jev를 호출하여 심각한 괴롭힘/자해/치팅 신호를 <100ms 내에 점수화하고, 명백한 위반 사항을 자동 차단하며, 미묘한 항구를 라우팅합니다.",
      "de": "Rufen Sie clavue-jev von Cloudflare Workers oder Game-Backend-Diensten auf, um schwere Belästigung/Selbstgefährdung/Cheat-Signale in <100ms zu bewerten, offensichtliche Verstöße automatisch zu stummschalten und differenzierte Berufungen zu routen.",
      "fr": "Appelez clavue-jev depuis Cloudflare Workers ou les services backend de jeu pour scorer les signaux de harcèlement grave/auto-lésion/triche en <100ms, muet automatiquement les violations claires et acheminer les appels nuancés.",
      "es": "Llame a clavue-jev desde Cloudflare Workers o servicios de backend de juego para puntuar señales de acoso grave/autodestrucción/trampa en <100ms, silenciar automáticamente las violaciones claras y enrutar las apelaciones matizadas.",
      "pt": "Chame o clavue-jev a partir de Cloudflare Workers ou serviços de backend de jogo para pontuar sinais de assédio grave/autolesão/trapaça em <100ms, silenciamento automático de violações claras e roteamento de apelações nuances."
    },
    "impact": {
      "en": "90% automated live-ops moderation at ~$0.042 per million input tokens.",
      "zh": "90% 实时治理自动化，单百万输入 token 成本低至 $0.042。",
      "ja": "ライブ運用モデレーションの90%を自動化し、入力トークン100万あたり約$0.042の費用で実現。",
      "ko": "라이브 오퍼레이션モデ레이션의 90%를 자동화하며, 입력 토큰 100만 개당 약 $0.042 비용으로 구현.",
      "de": "90% automatisierte Live-Operations-Moderierung bei ca. $0.042 pro Million Eingabetokens.",
      "fr": "90% de modération des opérations en direct automatisée à environ $0.042 par million de tokens d'entrée.",
      "es": "90% de moderación de operaciones en vivo automatizada a ~$0.042 por millón de tokens de entrada.",
      "pt": "90% de moderação de operações ao vivo automatizada a ~$0.042 por milhão de tokens de entrada."
    },
    "samplePayload": "{\n  \"state\": \"Chat message: 'sell cheap aimbot undetected discord.gg/xyz123 dm fast'\",\n  \"questions\": {\n    \"cheat_promo\": { \"type\": \"noul\", \"instructions\": \"Is this promoting game cheats or RMT scams?\" },\n    \"penalty\": { \"type\": \"choice\", \"instructions\": \"Moderation tier\", \"options\": [\"allow\", \"mute_1h\", \"ban_review\"] }\n  }\n}",
    "codeLang": "typescript",
    "codeSnippet": "const res = await fetch('https://api.jevcode.ai/v1/judge', {\n  method: 'POST',\n  headers: { 'content-type': 'application/json', authorization: `Bearer ${env.JEVCODE_API_KEY}` },\n  body: JSON.stringify({ state: msg.text, questions: { violation: { type: 'noul', instructions: 'Cheat promo, hate speech, or scam?' } } }),\n});"
  },
  {
    "slug": "media-adtech-brand-safety",
    "sector": "media",
    "regionFocus": "Global Publishers & Ad Networks",
    "compliance": "GARM · IAB Brand Safety",
    "latencyTarget": "70 ms p50 / 130 ms p95",
    "llmBypassRate": "87%",
    "recommendedGpuSlug": "nvidia-l40s-48g",
    "recommendedRecipeSlug": "typescript-node-sdk",
    "heroImage": "/img/guides/industries-enterprise.webp",
    "name": {
      "en": "Digital Media, UGC Moderation & AdTech Brand Safety",
      "zh": "数字媒体、UGC 内容审核与 AdTech 品牌安全分级",
      "ja": "デジタルメディア、UGC モデレーションおよびアドテックのブランドセーフティ",
      "ko": "디지털 미디어, UGC 모더레이션 및 애드테크 브랜드 안전",
      "de": "Digitale Medien, UGC-Moderation und AdTech-Marken-Sicherheit",
      "fr": "Médias numériques, modération UGC et sécurité de marque AdTech",
      "es": "Medios digitales, moderación UGC y seguridad de marca AdTech",
      "pt": "Mídia digital, moderação UGC e segurança de marca AdTech"
    },
    "tagline": {
      "en": "GARM brand-safety tiering, sponsor suitability, and comment-stream filtering at scale",
      "zh": "替代误杀率极高的关键词黑名单，精准实现 GARM 品牌安全与上下文广告分层",
      "ja": "GARM ブランドセーフティ階層、スポンサー適合性、および大規模なコメントストリームフィルタリング",
      "ko": "대규모 GARM 브랜드 안전 계층, 후원자 적합성, 및 댓글 스트림 필터링",
      "de": "GARM-Marken-Sicherheitsstufen, Sponsoren-Tauglichkeit und Filterung von Kommentarströmen im großen Maßstab",
      "fr": "Hiérarchisation de la sécurité de marque GARM, adéquation des sponsors et filtrage des flux de commentaires à grande échelle",
      "es": "Jerarquización de seguridad de marca GARM, idoneidad de patrocinadores y filtrado de flujos de comentarios a gran escala",
      "pt": "Hierarquização de segurança de marca GARM, adequação de patrocinadores e filtragem de fluxos de comentários em grande escala"
    },
    "problem": {
      "en": "Publishers and ad exchanges must classify millions of articles, video transcripts, and user comments against advertiser brand-safety policies without losing monetization on benign news.",
      "zh": "媒体与广告交易平台需对海量文章、视频字幕与评论做品牌安全判定，传统敏感词拦截常把正常新闻误伤导致广告变现受损。",
      "ja": "出版社と広告取引所は、無害なニュースの収益化を損なうことなく、数百万の記事、動画字幕、およびユーザーコメントを広告主のブランドセーフティポリシーに対して分類する必要があります。",
      "ko": "출판사와 광고 거래소는 수익화를 해치지 않으면서 수백만 개의 기사, 동영상 자막, 및 사용자 댓글을 광고주의 브랜드 안전 정책에 따라 분류해야 합니다.",
      "de": "Verlage und Ad-Exchanges müssen Millionen von Artikeln, Videotranskripten und Benutzerkommentaren nach Werbetreibenden-Marken-Sicherheitsrichtlinien klassifizieren, ohne die Monetarisierung von harmlosen Nachrichten zu verlieren.",
      "fr": "Les éditeurs et les bourses publicitaires doivent classer des millions d'articles, de transcriptions vidéo et de commentaires d'utilisateurs selon les politiques de sécurité de marque des annonceurs sans perdre de revenus publicitaires sur les nouvelles inoffensives.",
      "es": "Los editores y los intercambios de publicidad deben clasificar millones de artículos, transcripciones de video y comentarios de usuarios contra las políticas de seguridad de marca de los anunciantes sin perder monetización en noticias inocuas.",
      "pt": "Editoras e bolsas de publicidade devem classificar milhões de artigos, transcrições de vídeo e comentários de usuários contra políticas de segurança de marca de anunciantes sem perder monetização em notícias inofensivas."
    },
    "solution": {
      "en": "Score each content unit with clavue-jev across GARM safety tiers and contextual topic buckets, replacing brittle keyword blocklists that mistakenly demonetize legitimate journalism.",
      "zh": "用 clavue-jev 对每条内容并行判定 GARM 安全等级与商业适配类目，准确区分「新闻报道」与「违禁宣扬」。",
      "ja": "脆弱なキーワードブロックリスト（正当なジャーナリズムを誤って収益化を停止してしまう）を置き換え、GARM セーフティ階層と文脈的なトピックバケット全体で clavue-jev を使用して各コンテンツユニットをスコアリングします。",
      "ko": "취약한 키워드 차단 목록 (정당한 저널리즘을 실수로 수익화 중단) 을 대체하여 GARM 안전 계층과 문맥적 주제 버킷 전반에 걸쳐 clavue-jev 를 사용하여 각 콘텐츠 단위를 점수화합니다.",
      "de": "Jede Inhaltseinheit wird mit clavue-jev über GARM-Sicherheitsstufen und kontextuelle Themenbuckets bewertet, wodurch fragile Keyword-Sperrlisten ersetzt werden, die legitime Journalismus fälschlicherweise entmonetarisieren.",
      "fr": "Attribuer un score à chaque unité de contenu avec clavue-jev à travers les niveaux de sécurité GARM et les buckets de sujets contextuels, remplaçant les listes de mots-clés fragiles qui démonétisent à tort le journalisme légitime.",
      "es": "Puntuar cada unidad de contenido con clavue-jev a través de los niveles de seguridad GARM y los grupos de temas contextuales, reemplazando las listas de bloqueo de palabras clave frágiles que monetizan erróneamente el periodismo legítimo.",
      "pt": "Avaliar cada unidade de conteúdo com clavue-jev através dos níveis de segurança GARM e buckets de tópicos contextuais, substituindo listas de bloqueio de palavras-chave frágeis que desmonetizam erroneamente o jornalismo legítimo."
    },
    "impact": {
      "en": "Recovers 20–35% wrongly blocked ad inventory while cutting moderation compute by 87%.",
      "zh": "挽回 20–35% 被误封的优质广告库存，同时审核算力成本下降 87%。",
      "ja": "誤ってブロックされた広告インベントリの 20–35% を回復し、モデレーション計算コストを 87% 削減します。",
      "ko": "오류로 차단된 광고 인벤토리의 20–35% 를 회복하고 모더레이션 컴퓨팅 비용을 87% 절감합니다.",
      "de": "Wiederherstellung von 20–35% fälschlich blockierter Werbeeinheiten und Reduzierung der Moderationsrechenleistung um 87%.",
      "fr": "Récupère 20–35% de l'inventaire publicitaire incorrectement bloqué tout en réduisant les coûts de calcul de modération de 87%.",
      "es": "Recupera el 20–35% del inventario publicitario bloqueado incorrectamente mientras reduce la computación de moderación en un 87%.",
      "pt": "Recupera 20–35% do inventário publicitário bloqueado incorretamente enquanto reduz a computação de moderação em 87%."
    },
    "samplePayload": "{\n  \"state\": \"Documentary transcript analyzing historical cyber defense policies and how enterprises patch zero-day bugs.\",\n  \"questions\": {\n    \"brand_safe\": { \"type\": \"noul\", \"instructions\": \"Is this safe for mainstream enterprise advertisers under GARM?\" },\n    \"tier\": { \"type\": \"choice\", \"instructions\": \"Brand safety floor\", \"options\": [\"all_brands\", \"standard_only\", \"exclude_ads\"] }\n  }\n}",
    "codeLang": "typescript",
    "codeSnippet": "const { answers } = await jevJudge(article.excerpt, {\n  brand_safe: { type: 'noul', instructions: 'Safe for mainstream GARM advertisers?' },\n  tier: { type: 'choice', instructions: 'Ad tier', options: ['all_brands', 'standard', 'exclude'] },\n});"
  },
  {
    "slug": "edtech-assessment",
    "sector": "education",
    "regionFocus": "Global / US / LATAM / APAC",
    "compliance": "FERPA · COPPA · GDPR",
    "latencyTarget": "75 ms p50 / 145 ms p95",
    "llmBypassRate": "78%",
    "recommendedGpuSlug": "rtx-4090-24g",
    "recommendedRecipeSlug": "python-asyncio-fastapi",
    "heroImage": "/img/guides/industries-hero.webp",
    "name": {
      "en": "Global EdTech Rubric Checking & Hint Routing",
      "zh": "全球在线教育答题评分核验与分层提示路由",
      "ja": "グローバル EdTech 用採点基準チェックとヒントルーティング",
      "ko": "글로벌 EdTech 평가 기준 확인 및 힌트 라우팅",
      "de": "Globale EdTech-Richtlinienprüfung und Hinweis-Verleitung",
      "fr": "Vérification des grilles et routage des indices pour l'EdTech mondiale",
      "es": "Verificación de rúbricas y enrutamiento de pistas para EdTech global",
      "pt": "Verificação de rubricas e roteamento de dicas para EdTech global"
    },
    "tagline": {
      "en": "Instant rubric mastery checks and Socratic hint routing before calling tutoring LLMs",
      "zh": "先用百毫秒判定知识点掌握度与错因类型，再按需唤醒辅导大模型",
      "ja": "チューター LLM を呼び出す前に、瞬時の採点基準習熟チェックとソクラテス的ヒントルーティング",
      "ko": "튜터 LLM 호출 전 즉시 평가 기준 숙달 확인과 소크라테스식 힌트 라우팅",
      "de": "Sofortige Richtlinienbeherrschung und sokratische Hinweis-Verleitung vor dem Aufruf von Tutor-LLMs",
      "fr": "Vérifications instantanées de maîtrise des grilles et routage d'indices socratiques avant l'appel des LLM de tutorat",
      "es": "Verificaciones instantáneas de dominio de rúbricas y enrutamiento de pistas socráticas antes de llamar a los LLM de tutoría",
      "pt": "Verificações instantâneas de domínio de rubricas e roteamento de dicas socráticas antes de chamar LLMs de tutoria"
    },
    "problem": {
      "en": "Online learning platforms serve millions of short-answer exercises. Sending every correct or trivially off-track submission to a conversational tutor LLM destroys unit economics.",
      "zh": "在线教育平台每天批改数百万道简答题与编程作业，若每份提交都调用对话式辅导大模型，单生 AI 成本将难以维系。",
      "ja": "オンライン学習プラットフォームは数百万の短答式演習を提供しています。すべての正解または明らかに外れた提出物を対話型チューター LLM に送ると、単価経済が崩壊します。",
      "ko": "온라인 학습 플랫폼은 수백만 개의 단답형 연습 문제를 제공합니다. 모든 정답 또는 명백히 벗어난 제출물을 대화형 튜터 LLM 에 보내면 단위 경제성이 파괴됩니다.",
      "de": "Online-Lernplattformen bedienen Millionen von Kurzantwort-Übungen. Das Senden jeder korrekten oder trivial fehlgeleiteten Einreichung an einen konversationellen Tutor-LLM zerstört die Unit Economics.",
      "fr": "Les plateformes d'apprentissage en ligne desservent des millions d'exercices à réponse courte. Envoyer chaque soumission correcte ou trivialement hors voie à un LLM de tutorat conversationnel détruit l'économie d'unité.",
      "es": "Las plataformas de aprendizaje en línea atienden a millones de ejercicios de respuesta corta. Enviar cada envío correcto o trivialmente fuera de rumbo a un LLM de tutoría conversacional destruye la economía unitaria.",
      "pt": "Plataformas de aprendizado online atendem milhões de exercícios de resposta curta. Enviar cada envio correto ou trivialmente fora de rumo a um LLM de tutoria conversacional destrói a economia unitária."
    },
    "solution": {
      "en": "Evaluate student answers against explicit rubric criteria using clavue-jev (noul concept_mastered + choice misconception_type). Auto-advance mastered answers and invoke the System Two tutor only for targeted hints.",
      "zh": "使用 clavue-jev 对照评分细则并行判定「是否掌握核心概念（noul）」与「常见误区类型（choice）」，答对即刻放行，仅对有偏差作答按错因精准触发辅导模型。",
      "ja": "clavue-jev（noul の concept_mastered + choice の misconception_type）を使用して、学生の回答を明示的な採点基準と照合します。習熟した回答は自動で進捗させ、ターゲットされたヒントのみに対して System Two チューターを呼び出します。",
      "ko": "clavue-jev(noul 의 concept_mastered + choice 의 misconception_type) 을 사용하여 학생의 답변을 명시적인 평가 기준과 비교합니다. 숙달된 답변은 자동으로 진행시키고, 표적화된 힌트에만 System Two 튜터를 호출합니다.",
      "de": "Bewerten Sie Schülerantworten anhand expliziter Richtlinienkriterien mit clavue-jev (noul concept_mastered + choice misconception_type). Bewältigte Antworten werden automatisch weitergeleitet, und der System Two Tutor wird nur für gezielte Hinweise aufgerufen.",
      "fr": "Évaluez les réponses des élèves contre des critères de grille explicites en utilisant clavue-jev (concept_mastered noul + misconception_type choice). Faites progresser automatiquement les réponses maîtrisées et invoquez le tuteur System Two uniquement pour des indices ciblés.",
      "es": "Evalúe las respuestas de los estudiantes contra criterios de rúbrica explícitos utilizando clavue-jev (concept_mastered noul + misconception_type choice). Avance automáticamente las respuestas dominadas e invoque al tutor System Two solo para pistas dirigidas.",
      "pt": "Avalie as respostas dos alunos contra critérios de rubrica explícitos usando clavue-jev (concept_mastered noul + misconception_type choice). Avance automaticamente as respostas dominadas e invoque o tutor System Two apenas para dicas direcionadas."
    },
    "impact": {
      "en": "78% lower per-student AI tutoring cost with instant grading feedback.",
      "zh": "单生 AI 辅导成本下降 78%，学生获得即时反馈。",
      "ja": "瞬時の採点フィードバックにより、生徒一人あたりの AI チューターコストを 78% 削減。",
      "ko": "즉시 채점 피드백으로 학생당 AI 튜터 비용을 78% 절감.",
      "de": "78% geringere Kosten pro Schüler für KI-Tutoring mit sofortigem Bewertungsfeedback.",
      "fr": "Réduction de 78 % des coûts de tutorat par IA par élève grâce à un retour de notation instantané.",
      "es": "78 % menos de costo de tutoría por IA por estudiante con retroalimentación de calificación instantánea.",
      "pt": "78% menos de custo de tutoria por IA por aluno com feedback de avaliação instantâneo."
    },
    "samplePayload": "{\n  \"state\": \"Rubric: Explain why WAL mode requires checkpointing. Student: 'WAL appends writes to a side log so readers never block writers, and checkpoint merges it back into the main db file.'\",\n  \"questions\": {\n    \"mastered\": { \"type\": \"noul\", \"instructions\": \"Does the student accurately cover both non-blocking writes and merging back?\" },\n    \"next_step\": { \"type\": \"choice\", \"instructions\": \"Tutor action\", \"options\": [\"mark_pass\", \"give_hint\", \"review_lesson\"] }\n  }\n}",
    "codeLang": "python",
    "codeSnippet": "ans = (await jev_judge(f\"Rubric: {rubric}\\nStudent: {submission}\", {\n    \"mastered\": {\"type\": \"noul\", \"instructions\": \"Meets all rubric requirements?\"},\n    \"next_step\": {\"type\": \"choice\", \"instructions\": \"Next action\", \"options\": [\"mark_pass\", \"give_hint\", \"review_lesson\"]},\n}))[\"answers\"]"
  },
  {
    "slug": "insurance-claims-underwriting",
    "sector": "insurance",
    "regionFocus": "US / EU / UK / Japan",
    "compliance": "NAIC · Solvency II · GDPR",
    "latencyTarget": "80 ms p50 / 150 ms p95",
    "llmBypassRate": "77%",
    "recommendedGpuSlug": "rtx-pro-6000-blackwell-96g",
    "recommendedRecipeSlug": "csharp-dotnet-minimal-api",
    "heroImage": "/img/guides/industries-enterprise.webp",
    "name": {
      "en": "Insurance FNOL Claims Triage & SIU Referral",
      "zh": "保险理赔报案初筛、闪赔分流与欺诈转交",
      "ja": "保険 FNOL 請求の優先分類および SIU 紹介",
      "ko": "보험 FNOL 청구 선별 및 SIU 소개",
      "de": "Versicherung FNOL-Anspruchsvorprüfung und SIU-Verweisung",
      "fr": "Triage des sinistres FNOL et renvoi à l'unité d'enquête spéciale (SIU) pour les assurances",
      "es": "Triaje de reclamaciones FNOL de seguros y referencia a la Unidad de Investigación Especial (SIU)",
      "pt": "Triagem de sinistros FNOL de seguros e referência à Unidade de Investigação Especial (SIU)"
    },
    "tagline": {
      "en": "Fast severity grading, fast-track payout routing, and fraud-investigation referral on first notice of loss",
      "zh": "在报案首环即完成定损分级、小额直赔放行与反欺诈调查转交",
      "ja": "迅速な重大度評価、優先処理された支払いルート、および損失発生初報（FNOL）時の不正調査紹介",
      "ko": "빠른 중대도 평가, 우선 처리된 지급 경로, 그리고 손실 발생 첫 통보 시 사기 조사 소개",
      "de": "Schnelle Schweregradbewertung, beschleunigte Zahlungswege und Betrugsuntersuchungsverweisung bei der ersten Schadensmeldung",
      "fr": "Évaluation rapide de la gravité, routage prioritaire des paiements et renvoi pour enquête sur la fraude dès la première notification de perte",
      "es": "Clasificación rápida de la gravedad, enrutamiento prioritario de pagos y referencia para investigación de fraude en la primera notificación de pérdida",
      "pt": "Avaliação rápida de gravidade, roteamento prioritário de pagamentos e referência para investigação de fraude no primeiro aviso de perda"
    },
    "problem": {
      "en": "Insurers handle surges of auto, property, and travel claims—especially during storms. Fast-tracking straightforward low-dollar claims while flagging suspicious inconsistencies is critical to NPS and loss ratio.",
      "zh": "车险、财产险与航旅险在极端天气下报案暴增，如何秒级放行简单小额理赔同时不放过疑点案件，直接决定理赔体验与赔付率。",
      "ja": "保険会社は、特に嵐の時期に自動車、不動産、旅行に関する請求の急増に対応しています。単純な低額請求の優先処理と、疑わしい不一致の検出は、NPS（ネットプロモータースコア）および損失率にとって不可欠です。",
      "ko": "보험사는 특히 폭풍 기간에 자동차, 부동산, 여행 청구의 급증에 대응합니다. 단순한 소액 청구의 우선 처리와 의심스러운 불일치 플래깅은 NPS 및 손실 비율에 필수적입니다.",
      "de": "Versicherer bewältigen Spitzen bei Autoversicherungen, Sachschäden und Reiseversicherungen – insbesondere bei Stürmen. Die Priorisierung einfacher Kleinstschäden und das Kennzeichnen verdächtiger Inkonsistenzen sind entscheidend für die NPS und den Verlustquoten.",
      "fr": "Les assureurs gèrent des pics de sinistres automobiles, immobiliers et de voyage – en particulier lors de tempêtes. La priorisation des sinistres simples à faible montant et le repérage des incohérences suspectes sont cruciaux pour le NPS et le ratio de perte.",
      "es": "Las aseguradoras gestionan picos de reclamaciones de automóviles, propiedades y viajes – especialmente durante tormentas. Priorizar reclamaciones simples de bajo monto y marcar inconsistencias sospechosas es crucial para el NPS y la ratio de pérdidas.",
      "pt": "As seguradoras lidam com picos de sinistros de automóveis, propriedade e viagens – especialmente durante tempestades. Priorizar sinistros simples de baixo valor e sinalizar inconsistências suspeitas é crucial para o NPS e a taxa de perda."
    },
    "solution": {
      "en": "Score First Notice of Loss (FNOL) narratives with clavue-jev to separate straight-through payouts, adjuster visits, and Special Investigation Unit (SIU) referrals with calibrated confidence scores.",
      "zh": "对首报（FNOL）文本调用 clavue-jev 判定理赔严重度、直赔资格与 SIU 欺诈调查倾向，输出可校准置信度接入核心理赔系统。",
      "ja": "clavue-jev を使用して、FNOL（損失発生初報）のナラティブをスコアリングし、直通支払い、査察官訪問、および特別調査ユニット（SIU）の紹介を、校正された信頼スコアで分類します。",
      "ko": "clavue-jev 를 사용하여 FNOL (손실 발생 첫 통보) 서술을 점수화하여直通 지급, 조정자 방문, 및 특별 조사부 (SIU) 소개를 교정된 신뢰 점수로 분리합니다.",
      "de": "Bewerten Sie FNOL-Erzählungen mit clavue-jev, um Direktzahlungen, Gutachterbesuche und Verweisungen an die Sonderermittlungsabteilung (SIU) mit kalibrierten Vertrauenswerten zu trennen.",
      "fr": "Évaluez les récits de première notification de perte (FNOL) avec clavue-jev pour séparer les paiements directs, les visites d'ajusteurs et les renvois à l'unité d'enquête spéciale (SIU) avec des scores de confiance calibrés.",
      "es": "Puntuar los relatos de la primera notificación de pérdida (FNOL) con clavue-jev para separar pagos directos, visitas de ajustadores y referencias a la Unidad de Investigación Especial (SIU) con puntuaciones de confianza calibradas.",
      "pt": "Avalie narrativas de Primeiro Aviso de Perda (FNOL) com clavue-jev para separar pagamentos diretos, visitas de ajustadores e referências à Unidade de Investigação Especial (SIU) com pontuações de confiança calibradas."
    },
    "impact": {
      "en": "Straight-through processing cuts claim cycle time from days to minutes on routine claims.",
      "zh": "常规小额案件周期由数天缩至分钟级，显著降低人工初审积压。",
      "ja": "直通処理により、通常の請求の処理サイクル時間は数日から数分に短縮されます。",
      "ko": "直通 처리는 일반 청구의 청구 사이클 시간을 일에서 분 단위로 단축합니다.",
      "de": "Durch Direktverarbeitung wird die Bearbeitungszeit für Routineansprüche von Tagen auf Minuten reduziert.",
      "fr": "Le traitement direct réduit le temps de cycle des sinistres de jours à minutes pour les sinistres courants.",
      "es": "El procesamiento directo reduce el tiempo del ciclo de reclamación de días a minutos en reclamaciones rutinarias.",
      "pt": "O processamento direto reduz o tempo do ciclo de sinistros de dias para minutos em sinistros rotineiros."
    },
    "samplePayload": "{\n  \"state\": \"Policyholder reports cracked windshield from highway gravel; policy active 3 years, $0 prior claims, glass coverage active, repair quote $410.\",\n  \"questions\": {\n    \"fast_track_eligible\": { \"type\": \"noul\", \"instructions\": \"Eligible for straight-through auto-approval under glass coverage?\" },\n    \"route\": { \"type\": \"choice\", \"instructions\": \"Claims track\", \"options\": [\"auto_pay\", \"desk_adjuster\", \"field_inspect\", \"siu_review\"] }\n  }\n}",
    "codeLang": "csharp",
    "codeSnippet": "var payload = new {\n    state = claim.Narrative,\n    questions = new {\n        fastTrack = new { type = \"noul\", instructions = \"Eligible for straight-through payout?\" },\n        route = new { type = \"choice\", instructions = \"Claims queue\", options = new[] { \"auto_pay\", \"desk_adjuster\", \"siu_review\" } }\n    }\n};\nvar resp = await http.PostAsJsonAsync(\"https://api.jevcode.ai/v1/judge\", payload);"
  },
  {
    "slug": "telecom-network-ops",
    "sector": "telecom",
    "regionFocus": "EU / APAC / LATAM / US",
    "compliance": "ISO 27001 · Telecom SLA",
    "latencyTarget": "65 ms p50 / 120 ms p95",
    "llmBypassRate": "84%",
    "recommendedGpuSlug": "amd-mi300x-192g",
    "recommendedRecipeSlug": "java-spring-boot",
    "heroImage": "/img/guides/blueprint-edge.webp",
    "name": {
      "en": "Telecom & 5G Network Operations Ticket Classification",
      "zh": "电信与 5G 运维故障工单分类与携号转网预警",
      "ja": "Telecom & 5G Network Operations チケット分類",
      "ko": "Telecom & 5G 네트워크 운영 티켓 분류",
      "de": "Telecom & 5G Netzwerk-Betriebs-Ticket-Klassifizierung",
      "fr": "Classification des tickets d'exploitation réseau Telecom & 5G",
      "es": "Clasificación de tickets de operaciones de red Telecom & 5G",
      "pt": "Classificação de tickets de operações de rede Telecom & 5G"
    },
    "tagline": {
      "en": "Separate regional fiber outages from CPE modem issues and prioritize retention calls",
      "zh": "实时区分区域光纤/基站故障与终端光猫问题，同步捕获离网风险",
      "ja": "地域ファイバー障害とCPEモデム問題を区別し、顧客維持コールを優先する",
      "ko": "지역 광케이블 장애와 CPE 모뎀 문제를 구분하고 이탈 방지 콜 우선 처리",
      "de": "Regionale Glasfaserausfälle von CPE-Modem-Problemen trennen und Abwanderungsanrufe priorisieren",
      "fr": "Séparer les pannes de fibre régionales des problèmes de modem CPE et prioriser les appels de rétention",
      "es": "Separar las interrupciones de fibra regional de los problemas del módem CPE y priorizar las llamadas de retención",
      "pt": "Separar interrupções de fibra regional de problemas de modem CPE e priorizar chamadas de retenção"
    },
    "problem": {
      "en": "Carrier NOC and subscriber care teams receive tens of thousands of daily trouble tickets spanning billing disputes, roaming drops, and cell-tower faults.",
      "zh": "运营商 NOC 与客服中心每日承接数万条报障与资费争议，人工排查难以第一时间聚合同区域大面积中断。",
      "ja": "キャリアのNOCおよび顧客サポートチームは、請求紛争、ローミング断線、セルタワー障害など、毎日数万件のトラブルチケットを受け取っています。",
      "ko": "통신사 NOC 및 고객 지원 팀은 청구 분쟁, 로밍 끊김, 기지국 고장 등 매일 수만 개의 트러블 티켓을 처리합니다.",
      "de": "Carrier-NOC- und Kundenbetreuungsteams erhalten zehntausende täglicher Störungstickets, die Abrechnungsstreitigkeiten, Roaming-Abbrüche und Zellenturmfehler umfassen.",
      "fr": "Les équipes NOC des opérateurs et de l'assistance aux abonnés reçoivent des dizaines de milliers de tickets de trouble quotidiens couvrant les litiges de facturation, les coupures de roaming et les pannes de tours cellulaires.",
      "es": "Los equipos NOC de las operadoras y de atención al suscriptor reciben decenas de miles de tickets de problemas diarios que abarcan disputas de facturación, caídas de roaming y fallas de torres de celular.",
      "pt": "As equipes NOC das operadoras e de suporte ao assinante recebem dezenas de milhares de tickets de problemas diários abrangendo disputas de faturamento, quedas de roaming e falhas de torres de celular."
    },
    "solution": {
      "en": "Run clavue-jev over inbound trouble reports to cluster outage-vs-device root causes and flag port-out churn risk in real time.",
      "zh": "在报障接入层用 clavue-jev 毫秒级归类故障域（基站中断/终端设备/漫游资费）并输出离网风险概率，自动关联区域告警。",
      "ja": "入ってくるトラブルレポートに clavue-jev を適用し、障害とデバイスの根本原因をクラスタリングし、リアルタイムでポートアウトによる離脱リスクをフラグします。",
      "ko": "들어오는 트러블 보고서에 clavue-jev 를 적용하여 장애와 장치 근본 원인을 클러스터링하고 실시간으로 포트 이탈 위험을 표시합니다.",
      "de": "Führen Sie clavue-jev über eingehende Störungsmeldungen, um Ausfall- vs. Geräteursachen zu gruppieren und das Risiko von Port-Out-Churn in Echtzeit zu kennzeichnen.",
      "fr": "Exécutez clavue-jev sur les rapports de trouble entrants pour regrouper les causes racines panne vs appareil et signaler le risque d'attrition par port-out en temps réel.",
      "es": "Ejecutar clavue-jev sobre los informes de problemas entrantes para agrupar las causas raíz de interrupción vs. dispositivo y marcar el riesgo de churn por port-out en tiempo real.",
      "pt": "Execute o clavue-jev sobre relatórios de problemas entrantes para agrupar causas raiz de interrupção vs. dispositivo e sinalizar o risco de churn por port-out em tempo real."
    },
    "impact": {
      "en": "84% automated dispatch accuracy and faster regional outage correlation.",
      "zh": "自动派单准确率达 84%，区域性故障定位显著提速。",
      "ja": "84% の自動化されたディスパッチ精度と、より高速な地域障害相関分析。",
      "ko": "84% 자동 분배 정확도 및 더 빠른 지역 장애 상관관계 분석.",
      "de": "84% automatisierte Dispatch-Genauigkeit und schnellere regionale Ausfallkorrelation.",
      "fr": "84% de précision de dispatch automatisé et corrélation des pannes régionales plus rapide.",
      "es": "84% de precisión de despacho automatizado y correlación de interrupciones regionales más rápida.",
      "pt": "84% de precisão de despacho automatizado e correlação de interrupções regionais mais rápida."
    },
    "samplePayload": "{\n  \"state\": \"Fiber LOS red LED blinking on ONT after neighborhood street excavation; 4 neighbors also offline.\",\n  \"questions\": {\n    \"area_outage\": { \"type\": \"noul\", \"instructions\": \"Does this indicate an upstream fiber/area outage rather than a single router bug?\" },\n    \"dispatch\": { \"type\": \"choice\", \"instructions\": \"Dispatch team\", \"options\": [\"field_fiber_noc\", \"remote_reboot\", \"billing_care\"] }\n  }\n}",
    "codeLang": "java",
    "codeSnippet": "var req = Map.of(\"state\", ticket.text(), \"questions\", Map.of(\n    \"areaOutage\", Map.of(\"type\", \"noul\", \"instructions\", \"Upstream fiber/tower outage?\"),\n    \"dispatch\", Map.of(\"type\", \"choice\", \"instructions\", \"Queue\", \"options\", List.of(\"field_fiber_noc\", \"remote_reboot\", \"billing_care\"))\n));"
  },
  {
    "slug": "automotive-fleet-ops",
    "sector": "automotive",
    "regionFocus": "Germany / US / Japan / China",
    "compliance": "ISO 26262 Process · UN R155",
    "latencyTarget": "75 ms p50 / 140 ms p95",
    "llmBypassRate": "82%",
    "recommendedGpuSlug": "nvidia-l40s-48g",
    "recommendedRecipeSlug": "rust-tokio-reqwest",
    "heroImage": "/img/guides/gpus-hero.webp",
    "name": {
      "en": "Automotive, EV Telematics & Fleet Warranty Triage",
      "zh": "智能汽车、EV 车联网告警与车队质保分诊",
      "ja": "自動車、EV テレマティクスおよび車隊保証の優先順位付け",
      "ko": "자동차, EV 텔레매틱스 및 차량 보증 우선순위 분류",
      "de": "Automobil, EV-Telematik und Flotten-Garantie-Triage",
      "fr": "Automobile, Télématique EV et Triage des Garanties de Flotte",
      "es": "Automotriz, Telemática EV y Triage de Garantía de Flota",
      "pt": "Automotivo, Telemetria EV e Triage de Garantia de Frota"
    },
    "tagline": {
      "en": "Classify connected-vehicle DTC alerts, roadside safety urgency, and warranty eligibility",
      "zh": "结合 DTC 故障码与车主反馈，毫秒区分安全停车告警与常规预约维保",
      "ja": "接続車両の DTC アラート、道路安全の緊急性、および保証適合性を分類する",
      "ko": "연결 차량의 DTC 경고, 도로 안전 긴급도, 및 보증 적합성을 분류합니다.",
      "de": "Klassifizierung von DTC-Alarmen für vernetzte Fahrzeuge, Dringlichkeit der Straßensicherheit und Garantieberechtigung",
      "fr": "Classer les alertes DTC des véhicules connectés, l'urgence de sécurité routière et l'éligibilité à la garantie",
      "es": "Clasificar alertas DTC de vehículos conectados, urgencia de seguridad vial y elegibilidad de garantía",
      "pt": "Classificar alertas DTC de veículos conectados, urgência de segurança viária e elegibilidade de garantia"
    },
    "problem": {
      "en": "Connected EV fleets and dealer service centers process huge streams of driver voice notes, diagnostic trouble codes, and warranty claims across global markets.",
      "zh": "新能源车企与大型车队每天面对全球多语种车主报修、远程故障码与质保索赔，安全隐患必须与常规软件问题秒级分层。",
      "ja": "接続された EV 車隊とディーラーサービスセンターは、グローバル市場でドライバーの音声メモ、診断トラブルコード、および保証請求の大量ストリームを処理しています。",
      "ko": "연결된 EV 차량 군과 딜러 서비스 센터는 글로벌 시장에서 운전자 음성 메모, 진단 트러블 코드, 및 보증 청구의 대량 스트림을 처리합니다.",
      "de": "Vernetzte EV-Flotten und Händlerservicezentren verarbeiten riesige Datenströme aus Fahrer-Stimmenotizen, Diagnose-Fehlercodes und Garantieansprüchen in globalen Märkten.",
      "fr": "Les flottes de véhicules électriques connectés et les centres de service des concessionnaires traitent de grands flux de notes vocales des conducteurs, de codes de défauts diagnostiques et de réclamations de garantie sur les marchés mondiaux.",
      "es": "Las flotas de vehículos eléctricos conectados y los centros de servicio de concesionarios procesan grandes flujos de notas de voz del conductor, códigos de problemas de diagnóstico y reclamaciones de garantía en mercados globales.",
      "pt": "Frotas de veículos elétricos conectados e centros de serviço de concessionárias processam grandes fluxos de anotações de voz do motorista, códigos de problemas de diagnóstico e reivindicações de garantia em mercados globais."
    },
    "solution": {
      "en": "Combine DTC summaries with driver reports in clavue-jev to separate immediate pull-over safety warnings from scheduled OTA/dealer service appointments.",
      "zh": "将 DTC 摘要与车主描述送入 clavue-jev，并行判定安全隐患等级、是否可 OTA 远程修复或需道路救援/进店检修。",
      "ja": "clavue-jev で DTC のサマリーとドライバーレポートを組み合わせ、即時の停車安全警告とスケジュールされた OTA/ディーラーサービス予約を区別します。",
      "ko": "clavue-jev 에서 DTC 요약과 운전자 보고서를 결합하여 즉각적인 정차 안전 경고와 예약된 OTA/딜러 서비스 약속을 구분합니다.",
      "de": "Kombinieren Sie DTC-Zusammenfassungen mit Fahrerberichten in clavue-jev, um sofortige Warnungen zum Anhalten von der geplanten OTA/Händler-Wartung zu trennen.",
      "fr": "Combinez les résumés DTC avec les rapports des conducteurs dans clavue-jev pour séparer les avertissements de sécurité d'arrêt immédiat des rendez-vous de service OTA/concessionnaire planifiés.",
      "es": "Combine los resúmenes DTC con los informes del conductor en clavue-jev para separar las advertencias de seguridad de parada inmediata de las citas de servicio OTA/concesionario programadas.",
      "pt": "Combine resumos DTC com relatórios do motorista no clavue-jev para separar avisos de segurança de parada imediata de agendamentos de serviço OTA/concessionária."
    },
    "impact": {
      "en": "82% faster warranty & roadside dispatch triage across multilingual dealer networks.",
      "zh": "全球经销与救援体系工单分诊提速 82%。",
      "ja": "多言語ディーラーネットワーク全体で、保証およびロードサイド派遣の優先順位付けが 82% 高速化されました。",
      "ko": "다국어 딜러 네트워크를 통해 보증 및 도로 지원 파견 분류가 82% 더 빨라졌습니다.",
      "de": "82% schnellere Triage von Garantie- und Straßenrettungseinsätzen über mehrsprachige Händlernetzwerke hinweg.",
      "fr": "Triage 82 % plus rapide des dépêches de garantie et de secours routier à travers des réseaux de concessionnaires multilingues.",
      "es": "82% más rápido en la triage de despacho de garantía y asistencia vial a través de redes de concesionarios multilingües.",
      "pt": "82% mais rápido no triagem de despacho de garantia e assistência viária através de redes de concessionárias multilíngues."
    },
    "samplePayload": "{\n  \"state\": \"EV battery thermal sensor DTC P0A80 logged; cabin display shows 'Stop Safely Now' while fast charging at 120kW.\",\n  \"questions\": {\n    \"safety_critical\": { \"type\": \"noul\", \"instructions\": \"Requires immediate stop-driving / roadside tow protocol?\" },\n    \"channel\": { \"type\": \"choice\", \"instructions\": \"Service route\", \"options\": [\"roadside_tow\", \"dealer_urgent\", \"ota_fix\"] }\n  }\n}",
    "codeLang": "rust",
    "codeSnippet": "let payload = serde_json::json!({\n    \"state\": format!(\"DTC: {}; Driver note: {}\", dtc, note),\n    \"questions\": { \"safety_critical\": { \"type\": \"noul\", \"instructions\": \"Immediate stop-driving safety fault?\" } }\n});"
  },
  {
    "slug": "proptech-real-estate",
    "sector": "proptech",
    "regionFocus": "US / UK / EU / APAC",
    "compliance": "Fair Housing · Local Tenancy Law",
    "latencyTarget": "75 ms p50 / 140 ms p95",
    "llmBypassRate": "81%",
    "recommendedGpuSlug": "rtx-4060-ti-16g",
    "recommendedRecipeSlug": "php-laravel-service",
    "heroImage": "/img/guides/industries-hero.webp",
    "name": {
      "en": "Real Estate, Property Ops & Maintenance Dispatch",
      "zh": "房产科技、租客报修应急分级与招租线索筛选",
      "ja": "不動産、プロパティ運用およびメンテナンスディスパッチ",
      "ko": "부동산, 부동산 운영 및 유지보수 파견",
      "de": "Immobilien, Immobilienmanagement und Wartungsdispatching",
      "fr": "Immobilier, Gestion Immobilière et Dispatching de Maintenance",
      "es": "Inmobiliaria, Operaciones de Propiedad y Despacho de Mantenimiento",
      "pt": "Imobiliária, Operações de Propriedade e Despacho de Manutenção"
    },
    "tagline": {
      "en": "Prioritize tenant emergencies (gas/water leaks) and qualify commercial leasing inquiries",
      "zh": "全天候识别燃气/爆管等紧急险情，自动派发水电暖通工单并筛选高意向租客",
      "ja": "テナントの緊急事態（ガス/水道の漏れ）を優先し、商業賃貸の問い合わせを資格判定する",
      "ko": "임차인의 긴급 상황 (가스/수도 누수) 을 우선 처리하고 상업 임대 문의를 자격 심사합니다",
      "de": "Priorisieren Sie Mieternotfälle (Gas-/Wasserverluste) und qualifizieren Sie kommerzielle Vermietungsanfragen",
      "fr": "Prioriser les urgences locataires (fuites de gaz/eau) et qualifier les demandes de location commerciale",
      "es": "Priorice emergencias de inquilinos (fugas de gas/agua) y califique consultas de alquiler comercial",
      "pt": "Priorize emergências de inquilinos (vazamentos de gás/água) e qualifique consultas de aluguel comercial"
    },
    "problem": {
      "en": "Property management companies manage thousands of apartments and commercial units. Missing an active water leak or gas smell message overnight causes massive property damage.",
      "zh": "长租公寓与商业物业管理数千套房源，夜间若漏判水管爆裂或燃气异味消息将酿成重大财产与安全损失。",
      "ja": "プロパティ管理会社は数千のアパートと商業ユニットを管理しています。夜間に活動中の水道の漏れやガス臭のメッセージを見逃すと、莫大な財産被害が発生します。",
      "ko": "부동산 관리 회사는 수천 개의 아파트와 상업 단위를 관리합니다. 밤새 활동 중인 수도 누수나 가스 냄새 메시지를 놓치면 막대한 재산 피해가 발생합니다.",
      "de": "Immobilienverwaltungsgesellschaften verwalten Tausende von Wohnungen und Gewerbeobjekte. Ein übersehenes aktives Wasserschaden- oder Geruchsmeldung über Nacht verursacht massive Sachschäden.",
      "fr": "Les sociétés de gestion immobilière gèrent des milliers d'appartements et d'unités commerciales. Manquer un message de fuite d'eau ou d'odeur de gaz active la nuit provoque des dégâts matériels massifs.",
      "es": "Las empresas de gestión de propiedades gestionan miles de apartamentos y unidades comerciales. Perder un mensaje de fuga de agua activa o olor a gas durante la noche causa daños masivos a la propiedad.",
      "pt": "Empresas de gestão de propriedades gerenciam milhares de apartamentos e unidades comerciais. Perder uma mensagem de vazamento de água ativo ou cheiro de gás durante a noite causa danos massivos à propriedade."
    },
    "solution": {
      "en": "Route every tenant SMS/email through clavue-jev to detect life-safety/water emergencies (noul) and dispatch the right trade (plumbing, HVAC, electrical, leasing) automatically.",
      "zh": "租客短信/邮件接入 clavue-jev 实时判定紧急险情（noul）与工种分类（水电/暖通/门锁/租务），紧急险情直连 24 小时值班抢修。",
      "ja": "テナントからのすべてのSMS/メールを clavue-jev を通じてルーティングし、生命安全保障/水道の緊急事態（noul）を検出し、適切な職人（管工事、HVAC、電気、賃貸）を自動的にディスパッチします。",
      "ko": "임차인의 모든 SMS/이메일을 clavue-jev 를 통해 라우팅하여 생명 안전/수도 긴급 상황 (noul) 을 감지하고 적절한 직종 (배관, HVAC, 전기, 임대) 을 자동으로 파견합니다.",
      "de": "Routen Sie jede Mieter-SMS/E-Mail über clavue-jev, um Lebenssicherheit/Wasser-Notfälle (noul) zu erkennen und den richtigen Handwerker (Sanitär, HVAC, Elektro, Vermietung) automatisch zu dispatchen.",
      "fr": "Routez chaque SMS/email locataire via clavue-jev pour détecter les urgences vie-sécurité/eau (noul) et dispatcher automatiquement le bon métier (plomberie, CVC, électricité, location).",
      "es": "Rutee cada SMS/email de inquilino a través de clavue-jev para detectar emergencias de seguridad vital/agua (noul) y despache automáticamente al oficio correcto (fontanería, HVAC, electricidad, alquiler).",
      "pt": "Roteie cada SMS/email de inquilino através do clavue-jev para detectar emergências de segurança vital/água (noul) e despache automaticamente o ofício correto (encanamento, HVAC, elétrica, aluguel)."
    },
    "impact": {
      "en": "Instant 24/7 emergency dispatch accuracy with 81% lower property-ops triage cost.",
      "zh": "24/7 应急派单秒级响应，物业客服分诊成本下降 81%。",
      "ja": "瞬時の 24 時間 365 日緊急ディスパッチ精度で、プロパティ運用のタriageコストを 81% 削減。",
      "ko": "즉각적인 24 시간 365 일 긴급 파견 정확도로 부동산 운영 분류 비용을 81% 절감합니다.",
      "de": "Sofortige 24/7-Einsatzgenauigkeit mit 81 % geringeren Kosten für die Immobilienmanagement-Triage.",
      "fr": "Précision de dispatch d'urgence 24/7 instantanée avec une réduction de 81 % des coûts de triage de gestion immobilière.",
      "es": "Precisión instantánea de despacho de emergencias 24/7 con un 81 % menor costo de triaje de operaciones de propiedad.",
      "pt": "Precisão instantânea de despacho de emergência 24/7 com 81% menor custo de triagem de operações de propriedade."
    },
    "samplePayload": "{\n  \"state\": \"Tenant Apt 4B: Water is pouring from the bathroom ceiling light fixture and dripping onto the breaker hallway.\",\n  \"questions\": {\n    \"emergency_dispatch\": { \"type\": \"noul\", \"instructions\": \"Requires immediate 24/7 emergency plumber/electrician dispatch?\" },\n    \"trade\": { \"type\": \"choice\", \"instructions\": \"Vendor trade\", \"options\": [\"plumbing_emergency\", \"electrical\", \"hvac\", \"general_maintenance\"] }\n  }\n}",
    "codeLang": "php",
    "codeSnippet": "$res = Http::withToken(config('services.jevcode.key'))\n    ->post('https://api.jevcode.ai/v1/judge', [\n        'state' => $ticket->message,\n        'questions' => [\n            'emergency' => ['type' => 'noul', 'instructions' => 'Active water leak, gas smell, or safety emergency?'],\n            'trade' => ['type' => 'choice', 'instructions' => 'Trade', 'options' => ['plumbing', 'electrical', 'hvac', 'leasing']],\n        ],\n    ])->json('answers');"
  },
  {
    "slug": "energy-smart-grid",
    "sector": "energy",
    "regionFocus": "EU / US / Australia / APAC",
    "compliance": "NERC CIP · EU Grid Codes",
    "latencyTarget": "75 ms p50 / 150 ms p95",
    "llmBypassRate": "83%",
    "recommendedGpuSlug": "nvidia-a100-80g-sxm",
    "recommendedRecipeSlug": "python-asyncio-fastapi",
    "heroImage": "/img/guides/blueprint-rag.webp",
    "name": {
      "en": "Energy, Renewables & Smart Grid Anomaly Dispatch",
      "zh": "新能源、光伏风电与智能电网巡检异常派发",
      "ja": "エネルギー、再生可能エネルギーおよびスマートグリッドの異常検知・派遣",
      "ko": "에너지, 재생에너지 및 스마트 그리드 이상_dispatch",
      "de": "Energie, Erneuerbare Energien & Smart Grid Anomalie-Dispatch",
      "fr": "Déploiement d'anomalies pour l'énergie, les énergies renouvelables et le smart grid",
      "es": "Despacho de anomalías en energía, renovables y smart grid",
      "pt": "Despacho de anomalias em energia, renováveis e smart grid"
    },
    "tagline": {
      "en": "Triage solar/wind inverter faults, substation inspection notes, and regulatory alerts",
      "zh": "实时分级逆变器/储能故障、变电站巡检日志与合规上报事件",
      "ja": "太陽光・風力インバーター障害、変電所点検ノート、規制アラートの優先順位付け",
      "ko": "태양광/풍력 인버터 고장, 변전소 점검 노트, 규제 알림의 우선순위 결정",
      "de": "Triage von Solar-/Wind-Inverter-Fehlern, Umspannstation-Inspektionsnotizen und regulatorischen Warnungen",
      "fr": "Triage des pannes d'onduleurs solaires/éoliens, notes d'inspection de sous-stations et alertes réglementaires",
      "es": "Triaje de fallos en inversores solares/eólicos, notas de inspección de subestaciones y alertas regulatorias",
      "pt": "Triagem de falhas em inversores solares/eólicos, notas de inspeção de subestações e alertas regulatórios"
    },
    "problem": {
      "en": "Utility operators and renewable IPPs ingest thousands of field technician notes and SCADA fault logs across distributed solar farms and battery storage sites.",
      "zh": "电力运营商与新能源场站分布广泛，每日汇入海量现场巡检记录与 SCADA 告警，亟需区分限电重大故障与常规维护。",
      "ja": "電力事業者および再生可能エネルギー発電事業者は、分散型太陽光発電所およびバッテリー貯蔵サイト全体にわたる、数千件の現場技術者ノートとSCADA障害ログを処理しています。",
      "ko": "전력 운영자 및 재생에너지 IPP 는 분산형 태양광 발전소 및 배터리 저장 사이트 전반에 걸쳐 수천 건의 현장 기술자 노트 및 SCADA 고장 로그를 처리합니다.",
      "de": "Versorger und erneuerbare IPPs verarbeiten Tausende von Feldtechniker-Notizen und SCADA-Fehlerprotokollen über verteilte Solarparks und Batteriespeichersysteme hinweg.",
      "fr": "Les opérateurs de réseau et les IPP renouvelables ingèrent des milliers de notes de techniciens de terrain et journaux de pannes SCADA à travers des fermes solaires et sites de stockage batterie distribués.",
      "es": "Los operadores de servicios públicos y las IPP renovadoras ingieren miles de notas de técnicos de campo y registros de fallos SCADA a través de parques solares y sitios de almacenamiento de baterías distribuidos.",
      "pt": "Operadores de utilidade e IPPs renováveis ingerem milhares de notas de técnicos de campo e registros de falhas SCADA através de fazendas solares e sites de armazenamento de bateria distribuídos."
    },
    "solution": {
      "en": "Classify fault severity, curtailment impact, and field-crew dispatch priority via clavue-jev, handing only multi-site root-cause reports to System Two analytical LLMs.",
      "zh": "利用 clavue-jev 对故障摘要进行严重度与派工分级，常规工单自动入库派发，仅跨场站复杂根因分析交由深度分析大模型。",
      "ja": "clavue-jev を使用して障害の深刻度、削減影響、および現場チームの派遣優先順位を分類し、複数サイトにわたる根本原因レポートのみを System Two 分析 LLM に渡します。",
      "ko": "clavue-jev 를 사용하여 고장 심각도, 축소 영향 및 현장 작업자 파견 우선순위를 분류하고, 다중 사이트 근본 원인 보고서만 System Two 분석 LLM 에 전달합니다.",
      "de": "Klassifizierung der Fehlerkritikalität, Abschaltwirkung und Feldcrew-Dispatch-Priorität über clavue-jev, wobei nur mehrstandortige Ursachenberichte an System Two analytische LLMs weitergeleitet werden.",
      "fr": "Classer la gravité des pannes, l'impact de la réduction de production et la priorité de déploiement des équipes de terrain via clavue-jev, en ne transmettant aux LLM analytiques System Two que les rapports de causes racines multi-sites.",
      "es": "Clasificar la gravedad del fallo, el impacto de la reducción y la prioridad de despacho del equipo de campo mediante clavue-jev, enviando solo los informes de causa raíz multi-sitio a los LLM analíticos de System Two.",
      "pt": "Classificar a severidade da falha, o impacto de corte e a prioridade de despacho da equipe de campo via clavue-jev, enviando apenas relatórios de causa raiz multi-sítio para os LLMs analíticos do System Two."
    },
    "impact": {
      "en": "83% faster dispatch prioritization across distributed renewable assets.",
      "zh": "分布式新能源资产异常派单效率提升 83%。",
      "ja": "分散型再生可能エネルギー資産における派遣優先順位の決定が 83% 高速化されました。",
      "ko": "분산형 재생에너지 자산의 파견 우선순위 결정이 83% 빨라졌습니다.",
      "de": "83% schnellere Dispatch-Priorisierung über verteilte erneuerbare Anlagen hinweg.",
      "fr": "Priorisation du déploiement 83 % plus rapide sur les actifs renouvelables distribués.",
      "es": "83% más rápido en la priorización del despacho de activos renovables distribuidos.",
      "pt": "83% mais rápido na priorização de despacho de ativos renováveis distribuídos."
    },
    "samplePayload": "{\n  \"state\": \"Inverter Bank B3 tripped on DC arc-fault error 402; output dropped 18MW during peak tariff window.\",\n  \"questions\": {\n    \"fire_safety_risk\": { \"type\": \"noul\", \"instructions\": \"Does DC arc-fault require immediate isolation and field inspection?\" },\n    \"priority\": { \"type\": \"choice\", \"instructions\": \"Dispatch tier\", \"options\": [\"immediate_isolate\", \"same_day_tech\", \"scheduled_pm\"] }\n  }\n}",
    "codeLang": "python",
    "codeSnippet": "ans = await judge_async(scada_event_summary, {\n    \"fire_safety_risk\": {\"type\": \"noul\", \"instructions\": \"DC arc-fault or thermal runaway risk?\"},\n    \"priority\": {\"type\": \"choice\", \"instructions\": \"Dispatch priority\", \"options\": [\"immediate_isolate\", \"same_day_tech\", \"scheduled_pm\"]},\n})"
  },
  {
    "slug": "travel-hospitality-ops",
    "sector": "travel",
    "regionFocus": "Global Airlines / OTAs / Hotels",
    "compliance": "EU261 · DOT · GDPR",
    "latencyTarget": "65 ms p50 / 120 ms p95",
    "llmBypassRate": "85%",
    "recommendedGpuSlug": "rtx-5090-32g",
    "recommendedRecipeSlug": "ruby-rails-service",
    "heroImage": "/img/guides/industries-hero.webp",
    "name": {
      "en": "Aviation IRROPS, OTA Support & Hospitality Recovery",
      "zh": "航旅不正常航班（IRROPS）应急重签与酒店客诉分级",
      "ja": "航空 IRROPS、OTA サポートおよびホスピタリティ回復",
      "ko": "항공 IRROPS, OTA 지원 및 호스피탈리티 복구",
      "de": "Luftfahrt IRROPS, OTA-Unterstützung und Hospitality-Wiederherstellung",
      "fr": "Aviation IRROPS, Support OTA et Récupération de l'Hospitalité",
      "es": "Aviación IRROPS, Soporte OTA y Recuperación de Hospitalidad",
      "pt": "Aviação IRROPS, Suporte OTA e Recuperação de Hospitalidade"
    },
    "tagline": {
      "en": "Real-time disruption rebooking triage, EU261 compensation screening, and VIP escalation",
      "zh": "恶劣天气洪峰期毫秒区分 24 小时内滞留旅客、法定赔付（EU261）与常规咨询",
      "ja": "リアルタイムの中断再予約トリアージ、EU261 補償スクリーニング、および VIP エスカレーション",
      "ko": "실시간 중단 재예약 선별, EU261 보상 스크리닝, 및 VIP 에스컬레이션",
      "de": "Echtzeit-Störung-Umgebuchung-Triage, EU261-Schadensersatz-Screening und VIP-Eskalation",
      "fr": "Triage de réacheminement en temps réel, filtrage des indemnités EU261 et escalade VIP",
      "es": "Triaje de reasignación en tiempo real, cribado de compensación EU261 y escalada VIP",
      "pt": "Triagem de reprogramação em tempo real, triagem de compensação EU261 e escalada VIP"
    },
    "problem": {
      "en": "When weather cancels flights, OTAs and airlines face 10× message spikes in every language—passengers stranded at gates cannot wait in the same queue as future trip-planning chats.",
      "zh": "台风或暴雪导致航班大面积取消时，航司与 OTA 面临十倍多语种消息洪峰，滞留登机口的旅客绝不能与远期改签咨询排在同一队列。",
      "ja": "天候によりフライトがキャンセルされると、OTA と航空会社はあらゆる言語でメッセージの急増（10 倍）に直面します。ゲートで立ち往生した乗客は、将来の旅行計画チャットと同じキューに並ぶことはできません。",
      "ko": "날씨로 인해 항공편이 취소되면 OTA 와 항공사는 모든 언어에서 메시지 급증 (10 배) 에 직면합니다. 게이트에 갇힌 승객은 미래 여행 계획 채팅과 같은 대기열에 서 있을 수 없습니다.",
      "de": "Wenn das Wetter Flüge storniert, stehen OTAs und Airlines vor einem 10-fachen Anstieg der Nachrichten in jeder Sprache – Passagiere, die am Gate feststecken, können nicht in derselben Warteschlange wie zukünftige Reiseplanungs-Chats warten.",
      "fr": "Lorsque la météo annule des vols, les OTAs et les compagnies aériennes font face à une augmentation de 10 fois des messages dans toutes les langues – les passagers bloqués aux portes d'embarquement ne peuvent pas attendre dans la même file d'attente que les chats de planification de voyage futurs.",
      "es": "Cuando el clima cancela vuelos, las OTAs y las aerolíneas enfrentan un aumento de 10 veces en los mensajes en cada idioma – los pasajeros atrapados en las puertas no pueden esperar en la misma cola que los chats de planificación de viajes futuros.",
      "pt": "Quando o clima cancela voos, as OTAs e as companhias aéreas enfrentam um aumento de 10 vezes nas mensagens em todos os idiomas – os passageiros presos nos portões não podem esperar na mesma fila que os chats de planejamento de viagem futuros."
    },
    "solution": {
      "en": "clavue-jev classifies stranded-within-24h emergencies, EU261/DOT statutory refund claims, and VIP tier escalations in <100ms, prioritizing live disruption rebooking automatically.",
      "zh": "由 clavue-jev 并行识别 24 小时内滞留应急、法定赔付资格与 VIP 升级诉求，秒级将滞留旅客切入优先重签通道。",
      "ja": "clavue-jev は、24 時間以内の立ち往生緊急事態、EU261/DOT 法定払い戻し請求、および VIP 階層のエスカレーションを <100ms で分類し、ライブ中断再予約を自動的に優先します。",
      "ko": "clavue-jev 는 24 시간 이내 갇힌 긴급 상황, EU261/DOT 법적 환불 청구, 및 VIP 계층 에스컬레이션을 <100ms 로 분류하여 실시간 중단 재예약을 자동으로 우선시합니다.",
      "de": "clavue-jev klassifiziert Notfälle innerhalb von 24 Stunden, EU261/DOT gesetzlich vorgeschriebene Rückerstattungsansprüche und VIP-Stufen-Eskalationen in <100ms und priorisiert die Live-Störung-Umgebuchung automatisch.",
      "fr": "clavue-jev classe les urgences bloquées dans les 24 heures, les demandes de remboursement légales EU261/DOT et les escalades de niveau VIP en <100ms, en priorisant automatiquement le réacheminement en direct.",
      "es": "clavue-jev clasifica las emergencias atrapadas en menos de 24 horas, las reclamaciones de reembolso estatutario EU261/DOT y las escaladas de nivel VIP en <100ms, priorizando automáticamente la reasignación en vivo.",
      "pt": "clavue-jev classifica emergências presas em menos de 24 horas, reivindicações de reembolso estatutário EU261/DOT e escaladas de nível VIP em <100ms, priorizando automaticamente a reprogramação em tempo real."
    },
    "impact": {
      "en": "85% surge triage automated during weather disruptions with sub-second queue prioritization.",
      "zh": "不正常航班洪峰期 85% 消息自动分级，滞留旅客响应速度大幅提升。",
      "ja": "天候関連の中断時には、サブ秒単位のキュー優先化により、85% のサージトリアージを自動化しました。",
      "ko": "날씨 중단 시 서브 초 대기열 우선화로 85% 의 급증 선별을 자동화했습니다.",
      "de": "Während wetterbedingter Störungen wurde 85 % der Surge-Triage mit subsekundärer Warteschlangen-Priorisierung automatisiert.",
      "fr": "85 % du triage de pointe automatisé lors des perturbations météorologiques avec une priorisation de file d'attente en sous-seconde.",
      "es": "85 % del triaje de aumento automatizado durante las interrupciones meteorológicas con priorización de cola en subsegundos.",
      "pt": "85 % da triagem de pico automatizada durante interrupções meteorológicas com priorização de fila em subsegundos."
    },
    "samplePayload": "{\n  \"state\": \"Flight LH401 cancelled at gate; connecting passenger with infant stranded in Frankfurt, next flight departs in 3 hours.\",\n  \"questions\": {\n    \"stranded_urgent\": { \"type\": \"noul\", \"instructions\": \"Is the traveler actively stranded within 24 hours of departure?\" },\n    \"queue\": { \"type\": \"choice\", \"instructions\": \"Support queue\", \"options\": [\"irrops_live_rebook\", \"eu261_claim\", \"future_change\", \"general_faq\"] }\n  }\n}",
    "codeLang": "ruby",
    "codeSnippet": "res = Net::HTTP.post(\n  URI('https://api.jevcode.ai/v1/judge'),\n  { state: msg.body, questions: { stranded: { type: 'noul', instructions: 'Actively stranded within 24h?' } } }.to_json,\n  { 'Content-Type' => 'application/json', 'Authorization' => \"Bearer #{ENV.fetch('JEVCODE_API_KEY')}\" }\n)"
  }
];
