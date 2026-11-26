import type { Localized } from '../ui';

export const title: Localized<string> = {
  en: 'GPU hardware matrix',
  zh: 'GPU 硬件矩阵',
  ja: 'GPU ハードウェア一覧',
  ko: 'GPU 하드웨어 매트릭스',
  de: 'GPU-Hardware-Matrix',
  fr: 'Matrice matérielle GPU',
  es: 'Matriz de hardware GPU',
  pt: 'Matriz de hardware GPU',
};

export const description: Localized<string> = {
  en: 'Compare 16 consumer, workstation, datacenter, and 2026–2027 roadmap GPUs for local and cluster LLM inference with Jev bypass savings.',
  zh: '对比 16 张消费级、工作站、数据中心与 2026–2027 路线图 GPU，看本地与集群推理上的 Jev 旁路节省。',
  ja: 'コンシューマ、ワークステーション、データセンター、2026–2027 ロードマップの 16 GPU を、Jev バイパス節約付きで比較。',
  ko: '소비자, 워크스테이션, 데이터센터, 2026–2027 로드맵 GPU 16종을 Jev 우회 절감과 함께 비교합니다.',
  de: '16 Consumer-, Workstation-, Rechenzentrums- und 2026–2027-Roadmap-GPUs mit Jev-Bypass-Ersparnis vergleichen.',
  fr: 'Comparez 16 GPU grand public, station, datacenter et feuille de route 2026–2027, avec les économies de contournement Jev.',
  es: 'Compare 16 GPU de consumo, estación, centro de datos y hoja de ruta 2026–2027, con el ahorro de bypass Jev.',
  pt: 'Compare 16 GPUs de consumo, estação, datacenter e roteiro 2026–2027, com a poupança de bypass Jev.',
};

export const eyebrow: Localized<string> = {
  en: 'Hardware · inference capacity',
  zh: '硬件 · 推理容量',
  ja: 'ハードウェア · 推論容量',
  ko: '하드웨어 · 추론 용량',
  de: 'Hardware · Inferenzkapazität',
  fr: 'Matériel · capacité d’inférence',
  es: 'Hardware · capacidad de inferencia',
  pt: 'Hardware · capacidade de inferência',
};

export const lead: Localized<string> = {
  en: 'Pick a card by VRAM, bandwidth, FP8 throughput, and power. Pair every GPU with a clavue-jev gate so trivial traffic never burns KV cache.',
  zh: '按显存、带宽、FP8 吞吐和功耗选卡。每张 GPU 都配 clavue-jev 门控，简单流量不再占用 KV Cache。',
  ja: 'VRAM、帯域、FP8 スループット、消費電力で選びます。各 GPU に clavue-jev ゲートを置き、単純な流量が KV キャッシュを使わないようにします。',
  ko: 'VRAM, 대역폭, FP8 처리량, 전력으로 고르세요. 모든 GPU에 clavue-jev 게이트를 두어 단순 트래픽이 KV 캐시를 쓰지 않게 합니다.',
  de: 'Wählen Sie nach VRAM, Bandbreite, FP8-Durchsatz und Leistung. Ein clavue-jev-Gate hält trivialen Traffic vom KV-Cache fern.',
  fr: 'Choisissez selon la VRAM, la bande passante, le débit FP8 et la puissance. Une porte clavue-jev empêche le trafic trivial de brûler le cache KV.',
  es: 'Elija por VRAM, ancho de banda, rendimiento FP8 y potencia. Una puerta clavue-jev evita que el tráfico trivial gaste la caché KV.',
  pt: 'Escolha por VRAM, largura de banda, débito FP8 e potência. Um portão clavue-jev impede que o tráfego trivial gaste a cache KV.',
};

export const tierAll: Localized<string> = {
  en: 'All', zh: '全部', ja: 'すべて', ko: '전체', de: 'Alle', fr: 'Tout', es: 'Todo', pt: 'Tudo',
};

export const tierConsumer: Localized<string> = {
  en: 'Consumer', zh: '消费级', ja: 'コンシューマ', ko: '소비자', de: 'Consumer', fr: 'Grand public', es: 'Consumo', pt: 'Consumo',
};

export const tierWorkstation: Localized<string> = {
  en: 'Workstation', zh: '工作站', ja: 'ワークステーション', ko: '워크스테이션', de: 'Workstation', fr: 'Station', es: 'Estación', pt: 'Estação',
};

export const tierDatacenter: Localized<string> = {
  en: 'Datacenter', zh: '数据中心', ja: 'データセンター', ko: '데이터센터', de: 'Rechenzentrum', fr: 'Datacenter', es: 'Centro de datos', pt: 'Datacenter',
};

export const tierRoadmap: Localized<string> = {
  en: '2026–2027+ Roadmap',
  zh: '2026–2027+ 路线图',
  ja: '2026–2027+ ロードマップ',
  ko: '2026–2027+ 로드맵',
  de: '2026–2027+ Roadmap',
  fr: 'Feuille de route 2026–2027+',
  es: 'Hoja de ruta 2026–2027+',
  pt: 'Roteiro 2026–2027+',
};

export const specGpu: Localized<string> = {
  en: 'GPU', zh: 'GPU', ja: 'GPU', ko: 'GPU', de: 'GPU', fr: 'GPU', es: 'GPU', pt: 'GPU',
};

export const specArch: Localized<string> = {
  en: 'Architecture', zh: '架构', ja: 'アーキテクチャ', ko: '아키텍처', de: 'Architektur', fr: 'Architecture', es: 'Arquitectura', pt: 'Arquitetura',
};

export const specVram: Localized<string> = {
  en: 'VRAM', zh: '显存', ja: 'VRAM', ko: 'VRAM', de: 'VRAM', fr: 'VRAM', es: 'VRAM', pt: 'VRAM',
};

export const specBandwidth: Localized<string> = {
  en: 'Bandwidth', zh: '带宽', ja: '帯域', ko: '대역폭', de: 'Bandbreite', fr: 'Bande passante', es: 'Ancho de banda', pt: 'Largura de banda',
};

export const specFp8: Localized<string> = {
  en: 'FP8', zh: 'FP8', ja: 'FP8', ko: 'FP8', de: 'FP8', fr: 'FP8', es: 'FP8', pt: 'FP8',
};

export const specTdp: Localized<string> = {
  en: 'TDP', zh: '功耗', ja: 'TDP', ko: 'TDP', de: 'TDP', fr: 'TDP', es: 'TDP', pt: 'TDP',
};

export const specInterconnect: Localized<string> = {
  en: 'Interconnect', zh: '互联', ja: '相互接続', ko: '인터커넥트', de: 'Interconnect', fr: 'Interconnexion', es: 'Interconexión', pt: 'Interconexão',
};

export const specCloud: Localized<string> = {
  en: 'Typical cloud', zh: '典型云价格', ja: '標準クラウド', ko: '일반 클라우드', de: 'Typische Cloud', fr: 'Cloud typique', es: 'Nube típica', pt: 'Nuvem típica',
};

export const specSavings: Localized<string> = {
  en: 'Jev bypass savings',
  zh: 'Jev 旁路节省',
  ja: 'Jev バイパス節約',
  ko: 'Jev 우회 절감',
  de: 'Jev-Bypass-Ersparnis',
  fr: 'Économie bypass Jev',
  es: 'Ahorro bypass Jev',
  pt: 'Poupança bypass Jev',
};

export const workloadsHeading: Localized<string> = {
  en: 'Recommended LLM and Jev workload benchmarks',
  zh: '推荐 LLM 与 Jev 负载基准',
  ja: '推奨 LLM と Jev ワークロードのベンチマーク',
  ko: '권장 LLM 및 Jev 워크로드 벤치마크',
  de: 'Empfohlene LLM- und Jev-Workload-Benchmarks',
  fr: 'Benchmarks LLM et charges Jev recommandés',
  es: 'Benchmarks de LLM y cargas Jev recomendados',
  pt: 'Benchmarks de LLM e cargas Jev recomendados',
};

export const colModel: Localized<string> = {
  en: 'Model', zh: '模型', ja: 'モデル', ko: '모델', de: 'Modell', fr: 'Modèle', es: 'Modelo', pt: 'Modelo',
};

export const colEngine: Localized<string> = {
  en: 'Engine', zh: '引擎', ja: 'エンジン', ko: '엔진', de: 'Engine', fr: 'Moteur', es: 'Motor', pt: 'Motor',
};

export const colDecode: Localized<string> = {
  en: 'Decode', zh: '解码', ja: 'デコード', ko: '디코드', de: 'Decode', fr: 'Décodage', es: 'Decodificación', pt: 'Decode',
};

export const colTtft: Localized<string> = {
  en: 'TTFT', zh: '首 token', ja: 'TTFT', ko: 'TTFT', de: 'TTFT', fr: 'TTFT', es: 'TTFT', pt: 'TTFT',
};

export const colConcurrency: Localized<string> = {
  en: 'Concurrency', zh: '并发', ja: '同時実行', ko: '동시성', de: 'Parallelität', fr: 'Concurrence', es: 'Concurrencia', pt: 'Concorrência',
};

export const colJevRole: Localized<string> = {
  en: 'Jev role', zh: 'Jev 角色', ja: 'Jev の役割', ko: 'Jev 역할', de: 'Jev-Rolle', fr: 'Rôle Jev', es: 'Rol de Jev', pt: 'Papel do Jev',
};

export const bestUseHeading: Localized<string> = {
  en: 'Best use', zh: '最适合', ja: '最適な用途', ko: '최적 용도', de: 'Bester Einsatz', fr: 'Meilleur usage', es: 'Mejor uso', pt: 'Melhor uso',
};

export const futureHeading: Localized<string> = {
  en: 'Future-proofing', zh: '跨代规划', ja: '将来への備え', ko: '미래 대비', de: 'Zukunftssicherheit', fr: 'Pérennité', es: 'Preparación futura', pt: 'Preparação futura',
};

export const configHeading: Localized<string> = {
  en: 'Production configuration',
  zh: '生产配置',
  ja: '本番構成',
  ko: '프로덕션 구성',
  de: 'Produktionskonfiguration',
  fr: 'Configuration de production',
  es: 'Configuración de producción',
  pt: 'Configuração de produção',
};

export const copyBtn: Localized<string> = {
  en: 'Copy', zh: '复制', ja: 'コピー', ko: '복사', de: 'Kopieren', fr: 'Copier', es: 'Copiar', pt: 'Copiar',
};

export const copiedBtn: Localized<string> = {
  en: 'Copied', zh: '已复制', ja: 'コピー済み', ko: '복사됨', de: 'Kopiert', fr: 'Copié', es: 'Copiado', pt: 'Copiado',
};

export const backToMatrix: Localized<string> = {
  en: 'GPU matrix', zh: 'GPU 矩阵', ja: 'GPU 一覧', ko: 'GPU 매트릭스', de: 'GPU-Matrix', fr: 'Matrice GPU', es: 'Matriz GPU', pt: 'Matriz GPU',
};

export const viewDetails: Localized<string> = {
  en: 'View details', zh: '查看详情', ja: '詳細を見る', ko: '자세히 보기', de: 'Details ansehen', fr: 'Voir le détail', es: 'Ver detalle', pt: 'Ver detalhes',
};

export const roadmapTitle: Localized<string> = {
  en: 'Future hardware roadmap spotlight',
  zh: '未来硬件路线图焦点',
  ja: '将来ハードウェアのロードマップ',
  ko: '미래 하드웨어 로드맵 스포트라이트',
  de: 'Spotlight: zukünftige Hardware-Roadmap',
  fr: 'Focus feuille de route matérielle',
  es: 'Foco de la hoja de ruta de hardware',
  pt: 'Destaque do roteiro de hardware',
};

export const roadmapLead: Localized<string> = {
  en: 'B300 288GB HBM3e and Rubin HBM4 capacity planning: keep System One on clavue-jev and reserve the next rack for deep generation.',
  zh: 'B300 288GB HBM3e 与 Rubin HBM4 容量规划：System One 留在 clavue-jev，下一机柜只留给深度生成。',
  ja: 'B300 288GB HBM3e と Rubin HBM4 の容量計画。System One は clavue-jev に残し、次のラックは深い生成に確保します。',
  ko: 'B300 288GB HBM3e와 Rubin HBM4 용량 계획. System One은 clavue-jev에 두고 다음 랙은 깊은 생성에 남깁니다.',
  de: 'Kapazitätsplanung für B300 288GB HBM3e und Rubin HBM4: System One bleibt auf clavue-jev, das nächste Rack ist für tiefe Generierung.',
  fr: 'Plan de capacité B300 288 Go HBM3e et Rubin HBM4 : System One reste sur clavue-jev, le prochain rack sert à la génération profonde.',
  es: 'Plan de capacidad B300 288GB HBM3e y Rubin HBM4: System One queda en clavue-jev y el siguiente rack se reserva a la generación profunda.',
  pt: 'Plano de capacidade B300 288GB HBM3e e Rubin HBM4: o System One fica no clavue-jev e o próximo rack fica para geração profunda.',
};

/** {credit} 由页面换成不含 $ 的金额，例如 5.00。文案里只保留一个 $。 */
export const ctaTitle: Localized<string> = {
  en: 'Try the gate before you buy the GPU',
  zh: '买卡之前，先试这道门',
  ja: 'GPU を買う前にゲートを試す',
  ko: 'GPU를 사기 전에 게이트를 시험하세요',
  de: 'Testen Sie das Gate, bevor Sie die GPU kaufen',
  fr: 'Essayez la porte avant d’acheter le GPU',
  es: 'Pruebe la puerta antes de comprar la GPU',
  pt: 'Experimente o portão antes de comprar a GPU',
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

export const home: Localized<string> = {
  en: 'Home', zh: '首页', ja: 'ホーム', ko: '홈', de: 'Start', fr: 'Accueil', es: 'Inicio', pt: 'Início',
};

export const vendorLabel: Localized<string> = {
  en: 'Vendor', zh: '厂商', ja: 'ベンダー', ko: '벤더', de: 'Hersteller', fr: 'Fournisseur', es: 'Fabricante', pt: 'Fabricante',
};

export const searchLabel: Localized<string> = {
  en: 'Search GPUs', zh: '搜索 GPU', ja: 'GPU を検索', ko: 'GPU 검색', de: 'GPUs suchen', fr: 'Rechercher des GPU', es: 'Buscar GPU', pt: 'Pesquisar GPUs',
};

export const noMatch: Localized<string> = {
  en: 'No GPUs match this filter.',
  zh: '没有符合筛选的 GPU。',
  ja: '条件に一致する GPU はありません。',
  ko: '필터와 일치하는 GPU가 없습니다.',
  de: 'Keine GPU entspricht diesem Filter.',
  fr: 'Aucun GPU ne correspond à ce filtre.',
  es: 'Ninguna GPU coincide con este filtro.',
  pt: 'Nenhuma GPU corresponde a este filtro.',
};

export const recipesLink: Localized<string> = {
  en: 'Recipes', zh: '配方', ja: 'レシピ', ko: '레시피', de: 'Rezepte', fr: 'Recettes', es: 'Recetas', pt: 'Receitas',
};

export const industriesLink: Localized<string> = {
  en: 'Industries', zh: '行业', ja: '業種', ko: '산업', de: 'Branchen', fr: 'Secteurs', es: 'Industrias', pt: 'Indústrias',
};

export const heroAlt: Localized<string> = {
  en: 'GPU inference racks and local accelerator cards arranged as a hardware matrix',
  zh: '作为硬件矩阵排列的 GPU 推理机柜与本地加速卡',
  ja: 'ハードウェア一覧として並ぶ GPU 推論ラックとローカル加速カード',
  ko: '하드웨어 매트릭스로 늘어선 GPU 추론 랙과 로컬 가속기',
  de: 'GPU-Inferenz-Racks und lokale Beschleuniger als Hardware-Matrix',
  fr: 'Racks d’inférence GPU et cartes locales disposés en matrice matérielle',
  es: 'Racks de inferencia GPU y tarjetas locales dispuestos como matriz de hardware',
  pt: 'Racks de inferência GPU e placas locais dispostos como matriz de hardware',
};

export const compareBtn: Localized<string> = {
  en: 'Compare', zh: '加入对比', ja: '比較に追加', ko: '비교 추가', de: 'Vergleichen', fr: 'Comparer', es: 'Comparar', pt: 'Comparar',
};

export const comparedBtn: Localized<string> = {
  en: 'Selected', zh: '已选对比', ja: '選択済み', ko: '선택됨', de: 'Ausgewählt', fr: 'Sélectionné', es: 'Seleccionado', pt: 'Selecionado',
};

export const compareTitle: Localized<string> = {
  en: 'Side-by-side GPU comparison',
  zh: '双卡参数实时对比',
  ja: '2 つの GPU を並べて比較',
  ko: 'GPU 2종 나란히 비교',
  de: 'GPU direkt nebeneinander vergleichen',
  fr: 'Comparaison de GPU côte à côte',
  es: 'Comparación de GPU lado a lado',
  pt: 'Comparação de GPUs lado a lado',
};

export const compareHint: Localized<string> = {
  en: 'Pick any 2 GPUs above to compare VRAM, bandwidth, FP8, power, cloud rate, and Jev bypass savings.',
  zh: '在上方任选 2 款 GPU，实时对比显存、带宽、FP8 算力、功耗、云价格与 Jev 旁路收益。',
  ja: '上から GPU を 2 つ選ぶと、VRAM、帯域、FP8、消費電力、クラウド料金、Jev バイパス節約を比較できます。',
  ko: '위에서 GPU 2종을 선택하면 VRAM, 대역폭, FP8, 전력, 클라우드 요금, Jev 우회 절감을 비교합니다.',
  de: 'Wählen Sie oben 2 GPUs, um VRAM, Bandbreite, FP8, Leistung, Cloud-Preis und Jev-Bypass-Ersparnis zu vergleichen.',
  fr: 'Choisissez 2 GPU ci-dessus pour comparer VRAM, bande passante, FP8, puissance, tarif cloud et économies de contournement Jev.',
  es: 'Elija 2 GPU arriba para comparar VRAM, ancho de banda, FP8, potencia, tarifa de nube y ahorro de bypass Jev.',
  pt: 'Escolha 2 GPUs acima para comparar VRAM, largura de banda, FP8, potência, preço de nuvem e poupança de bypass Jev.',
};

export const compareClear: Localized<string> = {
  en: 'Clear', zh: '清空', ja: 'クリア', ko: '지우기', de: 'Leeren', fr: 'Effacer', es: 'Limpiar', pt: 'Limpar',
};

export const openWorkbench: Localized<string> = {
  en: 'Configure in Workbench',
  zh: '在工作台配置此卡',
  ja: 'ワークベンチで設定',
  ko: '워크벤치에서 구성',
  de: 'Im Workbench konfigurieren',
  fr: 'Configurer dans Workbench',
  es: 'Configurar en Workbench',
  pt: 'Configurar no Workbench',
};

export const roadmapAlt: Localized<string> = {
  en: 'B300 288GB and Rubin HBM4 roadmap capacity plan',
  zh: 'B300 288GB 与 Rubin HBM4 路线图容量规划',
  ja: 'B300 288GB と Rubin HBM4 のロードマップ容量計画',
  ko: 'B300 288GB와 Rubin HBM4 로드맵 용량 계획',
  de: 'Kapazitätsplan für B300 288GB und Rubin HBM4',
  fr: 'Plan de capacité B300 288 Go et Rubin HBM4',
  es: 'Plan de capacidad B300 288GB y Rubin HBM4',
  pt: 'Plano de capacidade B300 288GB e Rubin HBM4',
};
