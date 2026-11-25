import type { Localized } from '../i18n/ui';

export type GpuTier = 'consumer' | 'workstation' | 'datacenter' | 'roadmap';

export interface GpuWorkload {
  model: string;
  engine: string;
  decodeTps: string;
  ttftMs: string;
  maxConcurrency: string;
  jevRole: string;
}

export interface GpuProfile {
  slug: string;
  name: string;
  vendor: 'NVIDIA' | 'AMD' | 'Apple' | 'Future Roadmap';
  tier: GpuTier;
  arch: string;
  vramGb: number;
  vramType: string;
  bandwidthGbs: number;
  fp8Tflops: number;
  tdpW: number;
  interconnect: string;
  typicalCloudUsdHr: string;
  jevBypassSavings: string;
  heroImage: string;
  tagline: Localized<string>;
  summary: Localized<string>;
  bestUse: Localized<string>;
  futureNote: Localized<string>;
  workloads: GpuWorkload[];
  configLang: string;
  configTitle: string;
  configCode: string;
}

export const GPU_PROFILES: GpuProfile[] = [
  {
    "slug": "rtx-4060-ti-16g",
    "name": "NVIDIA RTX 4060 Ti 16GB",
    "vendor": "NVIDIA",
    "tier": "consumer",
    "arch": "Ada Lovelace",
    "vramGb": 16,
    "vramType": "GDDR6",
    "bandwidthGbs": 288,
    "fp8Tflops": 176,
    "tdpW": 165,
    "interconnect": "PCIe 4.0 x8",
    "typicalCloudUsdHr": "$0.18–$0.28/hr",
    "jevBypassSavings": "68%",
    "heroImage": "/img/guides/gpus-hero.webp",
    "tagline": {
      "en": "Budget 16GB edge box for Qwen3-8B/14B Q4 paired with clavue-jev fast routing",
      "zh": "高性价比 16GB 边缘/本地开发卡：运行 Qwen3-8B/14B Q4 并以 clavue-jev 做快速路由",
      "ja": "Qwen3-8B/14B Q4 と clavue-jev 高速ルーティングを組み合わせ、予算 16GB エッジボックス",
      "ko": "Qwen3-8B/14B Q4 와 clavue-jev 고속 라우팅을 결합한 예산 16GB 에지 박스",
      "de": "Budget 16GB Edge-Box für Qwen3-8B/14B Q4 gepaart mit clavue-jev schneller Routing",
      "fr": "Boîte edge budgétaire 16GB pour Qwen3-8B/14B Q4 associée à la routage rapide clavue-jev",
      "es": "Caja edge de presupuesto 16GB para Qwen3-8B/14B Q4 emparejada con enrutamiento rápido clavue-jev",
      "pt": "Caixa de borda de orçamento 16GB para Qwen3-8B/14B Q4 emparelhada com roteamento rápido clavue-jev"
    },
    "summary": {
      "en": "The RTX 4060 Ti 16GB hits the practical floor for hosting a quantized 14B assistant locally while keeping power under 165W. Offloading binary gates, intent routing, and safety filters to clavue-jev prevents small local models from wasting KV cache on trivial traffic.",
      "zh": "RTX 4060 Ti 16GB 以不到 165W 的功耗跨过本地运行量化 14B 模型的实用门槛。将二元拦截、意图分流与安全过滤前移到 clavue-jev，可避免小显存本地模型把宝贵的 KV Cache 浪费在简单流量上。",
      "ja": "RTX 4060 Ti 16GB は、量子化された 14B アシスタントをローカルでホストする際の現実的な下限を達成し、消費電力を 165W 以下に抑えます。clavue-jev にバイナリゲート、意図ルーティング、安全フィルターをオフロードすることで、小規模なローカルモデルが自明なトラフィックに KV キャッシュを浪費することを防ぎます。",
      "ko": "RTX 4060 Ti 16GB 는 양자화된 14B 어시스턴트를 로컬에서 호스팅하는 실질적인 하한선을 충족시키면서 전력 소모를 165W 이하로 유지합니다. clavue-jev 로 이진 게이트, 의도 라우팅, 안전 필터를 오프로드하여 작은 로컬 모델이 자명한 트래픽에 KV 캐시를 낭비하는 것을 방지합니다.",
      "de": "Die RTX 4060 Ti 16GB erreicht die praktische Untergrenze für die lokale Hostung eines quantisierten 14B-Assistenten, während der Stromverbrauch unter 165W bleibt. Das Offloading von Binärgattern, Intent-Routing und Sicherheitsfiltern an clavue-jev verhindert, dass kleine lokale Modelle den KV-Cache für trivialen Traffic verschwenden.",
      "fr": "La RTX 4060 Ti 16GB atteint le plancher pratique pour héberger localement un assistant 14B quantifié tout en maintenant la consommation sous 165W. Le déchargement des portes binaires, du routage d'intention et des filtres de sécurité vers clavue-jev empêche les petits modèles locaux de gaspiller le cache KV sur du trafic trivial.",
      "es": "La RTX 4060 Ti 16GB alcanza el límite práctico inferior para alojar localmente un asistente 14B cuantizado manteniendo el consumo de energía por debajo de 165W. Descargar puertas binarias, enrutamiento de intenciones y filtros de seguridad a clavue-jev evita que los modelos locales pequeños desperdicien el caché KV en tráfico trivial.",
      "pt": "A RTX 4060 Ti 16GB atinge o piso prático para hospedar localmente um assistente 14B quantizado mantendo a energia abaixo de 165W. Descarregar portas binárias, roteamento de intenção e filtros de segurança para clavue-jev evita que modelos locais pequenos desperdicem cache KV em tráfego trivial."
    },
    "bestUse": {
      "en": "Local developer workstations, quiet branch-office inference boxes, and edge prototypes running 8B–14B GGUF/AWQ models behind a sub-100ms Jev gate.",
      "zh": "个人开发者本地工作站、低噪音边缘推理节点，以及 8B–14B GGUF/AWQ 模型加百毫秒 Jev 前置门控原型。",
      "ja": "ローカル開発ワークステーション、静かなブランチオフィスの推論ボックス、および sub-100ms Jev ゲート背後で 8B–14B GGUF/AWQ モデルを実行するエッジプロトタイプ。",
      "ko": "로컬 개발 워크스테이션, 조용한 지사 오피스 추론 박스, 그리고 sub-100ms Jev 게이트 뒤에서 8B–14B GGUF/AWQ 모델을 실행하는 에지 프로토타입.",
      "de": "Lokale Entwickler-Workstations, leise Branch-Office-Inferenz-Boxen und Edge-Prototypen, die 8B–14B GGUF/AWQ-Modelle hinter einem sub-100ms Jev-Gate ausführen.",
      "fr": "Postes de travail de développeur locaux, boîtes d'inférence de bureau de branchement silencieux et prototypes edge exécutant des modèles 8B–14B GGUF/AWQ derrière une porte Jev sous 100ms.",
      "es": "Estaciones de trabajo de desarrollador locales, cajas de inferencia de oficina en sucursal silenciosas y prototipos de borde ejecutando modelos 8B–14B GGUF/AWQ detrás de una puerta Jev sub-100ms.",
      "pt": "Estações de trabalho de desenvolvedor locais, caixas de inferência de escritório de filial silenciosas e protótipos de borda executando modelos 8B–14B GGUF/AWQ atrás de um portão Jev sub-100ms."
    },
    "futureNote": {
      "en": "Still viable through 2026–2027 as a dedicated local dev or small-model edge node; upgrade to RTX 5090 32GB when 32B dense models become your baseline.",
      "zh": "2026–2027 年仍适合作为边缘与本地开发卡；当 32B 稠密模型成为主力基线时建议升级至 RTX 5090 32GB。",
      "ja": "2026–2027 年まで、専用ローカル開発または小規模モデルエッジノードとして依然として有効です。32B 密度モデルがベースラインとなるまで、RTX 5090 32GB にアップグレードしてください。",
      "ko": "2026–2027 년까지 전용 로컬 개발 또는 소규모 모델 에지 노드로 여전히 유효합니다. 32B 밀집 모델이 기준이 될 때 RTX 5090 32GB 로 업그레이드하세요.",
      "de": "Bis 2026–2027 noch als dedizierter lokaler Dev- oder Small-Model-Edge-Knoten lebensfähig; auf RTX 5090 32GB aufrüsten, wenn 32B-dichte Modelle Ihre Basislinie werden.",
      "fr": "Toujours viable jusqu'en 2026–2027 en tant que nœud de développement local dédié ou de bordure de petit modèle ; passez à la RTX 5090 32GB lorsque les modèles denses 32B deviendront votre référence.",
      "es": "Aún viable hasta 2026–2027 como nodo de desarrollo local dedicado o de borde de modelo pequeño; actualice a RTX 5090 32GB cuando los modelos densos de 32B se conviertan en su línea base.",
      "pt": "Ainda viável até 2026–2027 como nó de desenvolvimento local dedicado ou de borda de modelo pequeno; atualize para RTX 5090 32GB quando modelos densos de 32B se tornarem sua linha de base."
    },
    "workloads": [
      {
        "model": "Qwen3-8B (Q4_K_M / AWQ)",
        "engine": "ollama / vLLM",
        "decodeTps": "62 tok/s",
        "ttftMs": "180 ms",
        "maxConcurrency": "4 reqs",
        "jevRole": "Pre-filter 70% noise before local LLM"
      },
      {
        "model": "Qwen3-14B (Q4_K_M)",
        "engine": "llama.cpp",
        "decodeTps": "34 tok/s",
        "ttftMs": "320 ms",
        "maxConcurrency": "2 reqs",
        "jevRole": "Escalate only uncertain cases (conf < 0.85)"
      },
      {
        "model": "DeepSeek-R1-Distill-14B (AWQ)",
        "engine": "vLLM",
        "decodeTps": "31 tok/s",
        "ttftMs": "350 ms",
        "maxConcurrency": "2 reqs",
        "jevRole": "Skip reasoning chain on deterministic intents"
      }
    ],
    "configLang": "yaml",
    "configTitle": "docker-compose.yml (llama.cpp + Jev pre-router)",
    "configCode": "services:\n  llm-local:\n    image: ghcr.io/ggerganov/llama.cpp:server-cuda\n    deploy:\n      resources:\n        reservations:\n          devices:\n            - driver: nvidia\n              count: 1\n              capabilities: [gpu]\n    command: >\n      --model /models/qwen3-14b-q4_k_m.gguf\n      --ctx-size 16384 --n-gpu-layers 99 --port 8080 --flash-attn\n    volumes:\n      - ./models:/models:ro\n    ports: [\"127.0.0.1:8080:8080\"]\n  jev-gateway:\n    image: node:22-alpine\n    environment:\n      JEVCODE_API_KEY: \"${JEVCODE_API_KEY}\"\n      JEVCODE_URL: \"https://api.jevcode.ai/v1/judge\"\n      LOCAL_LLM_URL: \"http://llm-local:8080/v1/chat/completions\"\n    command: [\"node\", \"/app/router.mjs\"]"
  },
  {
    "slug": "rtx-4090-24g",
    "name": "NVIDIA RTX 4090 24GB",
    "vendor": "NVIDIA",
    "tier": "consumer",
    "arch": "Ada Lovelace",
    "vramGb": 24,
    "vramType": "GDDR6X",
    "bandwidthGbs": 1008,
    "fp8Tflops": 660,
    "tdpW": 450,
    "interconnect": "PCIe 4.0 x16",
    "typicalCloudUsdHr": "$0.35–$0.55/hr",
    "jevBypassSavings": "72%",
    "heroImage": "/img/guides/gpus-hero.webp",
    "tagline": {
      "en": "1 TB/s bandwidth workhorse for 14B–32B AWQ/FP8 serving with Jev cascade",
      "zh": "1 TB/s 带宽主力卡：高性价比承载 14B–32B AWQ/FP8 推理与 Jev 级联路由",
      "ja": "Jev 級联を備えた 14B–32B AWQ/FP8 サービングのための 1 TB/s バンド幅の主力機",
      "ko": "Jev 캐스케이드를 활용한 14B–32B AWQ/FP8 서빙을 위한 1 TB/s 대역폭의 주력 모델",
      "de": "Arbeitspferd mit 1 TB/s Bandbreite für 14B–32B AWQ/FP8-Serving mit Jev-Kaskade",
      "fr": "Travailleur de 1 TB/s de bande passante pour le service 14B–32B AWQ/FP8 avec cascade Jev",
      "es": "Trabajo de 1 TB/s de ancho de banda para servicio 14B–32B AWQ/FP8 con cascada Jev",
      "pt": "Trabalhador de 1 TB/s de largura de banda para serviço 14B–32B AWQ/FP8 com cascata Jev"
    },
    "summary": {
      "en": "With 1,008 GB/s memory bandwidth and 24GB GDDR6X, the RTX 4090 delivers exceptional tokens-per-dollar for single-GPU vLLM or SGLang nodes. Putting clavue-jev in front absorbs bursty classification traffic so the 4090 stays dedicated to high-value generation.",
      "zh": "凭借 1,008 GB/s 显存带宽与 24GB GDDR6X，RTX 4090 在单卡 vLLM/SGLang 部署中具备极高的单位成本吞吐比。在前端接入 clavue-jev 吸收高频分类与拦截流量，可让 4090 专注于高价值生成任务。",
      "ja": "1,008 GB/s のメモリ帯域幅と 24GB の GDDR6X を搭載した RTX 4090 は、単一 GPU の vLLM または SGLang ノードにおいて、驚異的なトークン/ドル比を実現します。clavue-jev を前面に配置することで突発的な分類トラフィックを吸収し、4090 を高価値な生成処理に専念させます。",
      "ko": "1,008 GB/s 메모리 대역폭과 24GB GDDR6X 를 탑재한 RTX 4090 은 단일 GPU vLLM 또는 SGLang 노드에서 탁월한 토큰/달러 비율을 제공합니다. clavue-jev 를 앞에 배치하여 불규칙한 분류 트래픽을 흡수함으로써 4090 을 고부가가치 생성 작업에 전념하게 합니다.",
      "de": "Mit 1.008 GB/s Speicherbandbreite und 24GB GDDR6X liefert die RTX 4090 außergewöhnliche Token pro Dollar für einzelne-GPU vLLM- oder SGLang-Knoten. Durch das Platzieren von clavue-jev an der Vorderseite werden burstige Klassifizierungsverkehr absorbiert, sodass die 4090 sich auf hochwertige Generierung konzentrieren kann.",
      "fr": "Avec 1 008 Go/s de bande passante mémoire et 24 Go de GDDR6X, la RTX 4090 offre un rapport tokens par dollar exceptionnel pour les nœuds vLLM ou SGLang à GPU unique. Placer clavue-jev en amont absorbe le trafic de classification en rafales, permettant à la 4090 de se concentrer sur la génération à haute valeur.",
      "es": "Con 1.008 GB/s de ancho de banda de memoria y 24 GB de GDDR6X, la RTX 4090 ofrece una relación tokens por dólar excepcional para nodos vLLM o SGLang de GPU única. Colocar clavue-jev al frente absorbe el tráfico de clasificación en ráfagas para que la 4090 se dedique a la generación de alto valor.",
      "pt": "Com 1.008 GB/s de largura de banda de memória e 24 GB de GDDR6X, a RTX 4090 oferece uma relação tokens por dólar excepcional para nós vLLM ou SGLang de GPU única. Colocar o clavue-jev na frente absorve o tráfego de classificação em rajadas para que a 4090 se dedique à geração de alto valor."
    },
    "bestUse": {
      "en": "Indie SaaS backends, coding copilot clusters, and high-speed single-card vLLM nodes serving Qwen3-14B FP8 or Qwen3-32B AWQ.",
      "zh": "独立 SaaS 推理后端、代码助手节点，以及单卡部署 Qwen3-14B FP8 / Qwen3-32B AWQ。",
      "ja": "インディーズ SaaS バックエンド、コーディングコパイロットクラスター、および Qwen3-14B FP8 または Qwen3-32B AWQ を提供する高速シングルカード vLLM ノード。",
      "ko": "인디 SaaS 백엔드, 코딩 코파일럿 클러스터, 그리고 Qwen3-14B FP8 또는 Qwen3-32B AWQ 를 제공하는 고속 단일 카드 vLLM 노드.",
      "de": "Indie-SaaS-Backends, Coding-Copilot-Cluster und Hochgeschwindigkeits-Ein-Karten-vLLM-Knoten für Qwen3-14B FP8 oder Qwen3-32B AWQ.",
      "fr": "Backends SaaS indépendants, clusters de copilotes de codage et nœuds vLLM à carte unique haute vitesse servant Qwen3-14B FP8 ou Qwen3-32B AWQ.",
      "es": "Backends de SaaS independientes, clústeres de copilotos de codificación y nodos vLLM de una sola tarjeta de alta velocidad que sirven Qwen3-14B FP8 o Qwen3-32B AWQ.",
      "pt": "Backends de SaaS independentes, clusters de copilotos de codificação e nós vLLM de alta velocidade com uma única placa servindo Qwen3-14B FP8 ou Qwen3-32B AWQ."
    },
    "futureNote": {
      "en": "Remains a price-performance sweet spot on secondary/cloud rental markets; watch power and 24GB VRAM ceiling for >32K context windows.",
      "zh": "在云租赁市场仍具极高性价比；32K 以上长上下文场景需留意 24GB 显存上限。",
      "ja": "セカンダリ市場やクラウドレンタル市場では依然として価格パフォーマンスのスイートスポットです。ただし、24GB の VRAM 制限と 32K 以上のコンテキストウィンドウにおける電力消費に注意してください。",
      "ko": "2 차 시장 및 클라우드 렌탈 시장에서 여전히 가격 대비 성능의 최적점입니다. 32K 이상의 컨텍스트 윈도우를 사용할 경우 전력 소모와 24GB VRAM 한계를 주의 깊게 확인하세요.",
      "de": "Bleibt auf Sekundär- und Cloud-Vermietungsmärkten ein Preis-Leistungs-Sweetspot; achten Sie auf Stromverbrauch und die 24GB VRAM-Grenze für Kontextfenster über 32K.",
      "fr": "Reste un point fort prix-performance sur les marchés secondaires et de location cloud ; surveillez la consommation électrique et la limite de 24 Go de VRAM pour les fenêtres de contexte >32K.",
      "es": "Sigue siendo un punto dulce de precio-rendimiento en mercados secundarios y de alquiler en la nube; vigile el consumo de energía y el límite de 24 GB de VRAM para ventanas de contexto >32K.",
      "pt": "Continua sendo um ponto ideal de custo-benefício em mercados secundários e de aluguel em nuvem; monitore o consumo de energia e o limite de 24 GB de VRAM para janelas de contexto >32K."
    },
    "workloads": [
      {
        "model": "Qwen3-14B (FP8)",
        "engine": "vLLM / SGLang",
        "decodeTps": "108 tok/s",
        "ttftMs": "95 ms",
        "maxConcurrency": "16 reqs",
        "jevRole": "Handles 72% routing/triage without touching GPU"
      },
      {
        "model": "Qwen3-32B (AWQ 4-bit)",
        "engine": "vLLM",
        "decodeTps": "54 tok/s",
        "ttftMs": "190 ms",
        "maxConcurrency": "8 reqs",
        "jevRole": "Only invoked when Jev confidence < 0.88"
      },
      {
        "model": "Qwen3-Coder-30B-A3B (MoE)",
        "engine": "SGLang",
        "decodeTps": "145 tok/s",
        "ttftMs": "75 ms",
        "maxConcurrency": "20 reqs",
        "jevRole": "Jev gates PR risk before code-review generation"
      }
    ],
    "configLang": "bash",
    "configTitle": "vLLM FP8 serving command (RTX 4090 24GB)",
    "configCode": "vllm serve Qwen/Qwen3-14B-FP8 \\\n  --host 127.0.0.1 --port 8000 \\\n  --gpu-memory-utilization 0.90 \\\n  --max-model-len 32768 \\\n  --enable-prefix-caching \\\n  --max-num-seqs 24 \\\n  --kv-cache-dtype fp8"
  },
  {
    "slug": "rtx-5090-32g",
    "name": "NVIDIA RTX 5090 32GB",
    "vendor": "NVIDIA",
    "tier": "consumer",
    "arch": "Blackwell",
    "vramGb": 32,
    "vramType": "GDDR7",
    "bandwidthGbs": 1792,
    "fp8Tflops": 1676,
    "tdpW": 575,
    "interconnect": "PCIe 5.0 x16",
    "typicalCloudUsdHr": "$0.75–$1.15/hr",
    "jevBypassSavings": "75%",
    "heroImage": "/img/guides/gpus-hero.webp",
    "tagline": {
      "en": "1.79 TB/s GDDR7 + native FP4 flagship unlocking 32B FP8 and 70B FP4 on one desktop GPU",
      "zh": "1.79 TB/s GDDR7 + 原生 FP4 桌面旗舰：单卡跑满 32B FP8 与 70B FP4",
      "ja": "1.79 TB/s GDDR7 + ネイティブ FP4 フラグシップにより、1 つのデスクトップ GPU で 32B FP8 および 70B FP4 を解凍",
      "ko": "1.79 TB/s GDDR7 + 네이티브 FP4 플래그십으로 단일 데스크톱 GPU 에서 32B FP8 및 70B FP4 해제",
      "de": "1.79 TB/s GDDR7 + natives FP4 Flaggschiff, das 32B FP8 und 70B FP4 auf einer Desktop-GPU freischaltet",
      "fr": "1.79 TB/s GDDR7 + flagship FP4 natif débloquant 32B FP8 et 70B FP4 sur un seul GPU de bureau",
      "es": "1.79 TB/s GDDR7 + flagship FP4 nativo desbloqueando 32B FP8 y 70B FP4 en una GPU de escritorio",
      "pt": "1.79 TB/s GDDR7 + flagship FP4 nativo desbloqueando 32B FP8 e 70B FP4 em uma GPU de desktop"
    },
    "summary": {
      "en": "Blackwell brings 32GB GDDR7 at 1,792 GB/s and hardware NVFP4 tensor cores to desktop form factors—nearly matching an H100 PCIe in single-stream decode speed at a fraction of the cost. Pairing RTX 5090 with clavue-jev lets small teams run private 32B–70B stacks with datacenter responsiveness.",
      "zh": "Blackwell 架构把 32GB GDDR7（1,792 GB/s 带宽）与硬件 NVFP4 Tensor Core 引入桌面级显卡，单流解码速度逼近 H100 PCIe 而购置成本大幅下降。配合 clavue-jev 前置判定，小团队即可低成本搭建响应媲美数据中心的私有 32B–70B 推理栈。",
      "ja": "Blackwell は、1,792 GB/s の 32GB GDDR7 とハードウェア NVFP4 テンソアコアをデスクトップフォームファクターに搭載し、単一ストリームデコード速度で H100 PCIe にほぼ匹敵する性能を、コストの断片で実現します。RTX 5090 と clavue-jev の組み合わせにより、小規模チームがデータセンターのレスポンシブさを持つプライベート 32B–70B スタックを実行できます。",
      "ko": "Blackwell 은 1,792 GB/s 의 32GB GDDR7 과 하드웨어 NVFP4 텐서 코어를 데스크톱 폼 팩터에 탑재하여 단일 스트림 디코딩 속도에서 H100 PCIe 에 거의匹敵하는 성능을 비용의 일부로 제공합니다. RTX 5090 과 clavue-jev 를 결합하면 소규모 팀이 데이터센터 응답성을 갖춘 사설 32B–70B 스택을 실행할 수 있습니다.",
      "de": "Blackwell bringt 32GB GDDR7 mit 1.792 GB/s und Hardware-NVFP4-Tensor-Kerne in Desktop-Formfaktoren – nahezu gleichwertig mit einem H100 PCIe in der Single-Stream-Decode-Geschwindigkeit zu einem Bruchteil der Kosten. Die Kombination von RTX 5090 mit clavue-jev ermöglicht kleinen Teams das Ausführen privater 32B–70B-Stacks mit Datacenter-Responsiveness.",
      "fr": "Blackwell apporte 32 Go GDDR7 à 1 792 Go/s et des cœurs tensoriels NVFP4 matériels aux formules de bureau – correspondant presque à un H100 PCIe en vitesse de décodage en flux unique à une fraction du coût. L'appariement RTX 5090 avec clavue-jev permet aux petites équipes d'exécuter des piles privées 32B–70B avec une réactivité de centre de données.",
      "es": "Blackwell trae 32 GB GDDR7 a 1.792 GB/s y núcleos tensoriales NVFP4 de hardware a factores de forma de escritorio – casi igualando a un H100 PCIe en velocidad de decodificación de flujo único a una fracción del costo. Emparejar RTX 5090 con clavue-jev permite a los equipos pequeños ejecutar pilas privadas 32B–70B con responsividad de centro de datos.",
      "pt": "Blackwell traz 32 GB GDDR7 a 1.792 GB/s e núcleos tensoriais NVFP4 de hardware a fatores de forma de desktop – quase igualando um H100 PCIe em velocidade de decodificação de fluxo único a uma fração do custo. Emparelhar RTX 5090 com clavue-jev permite que pequenas equipes executem pilhas privadas 32B–70B com responsividade de datacenter."
    },
    "bestUse": {
      "en": "Private enterprise AI boxes, fast coding & agentic workstations, and multi-card 2×/4×5090 clusters serving 70B–235B MoE models.",
      "zh": "企业私有化 AI 一体机、高速编码与 Agent 工作站，以及 2×/4×5090 集群承载 70B–235B MoE 模型。",
      "ja": "プライベートエンタープライズ AI ボックス、高速コーディングおよびエージェントワークステーション、70B–235B MoE モデルをサービスするマルチカード 2×/4×5090 クラスター。",
      "ko": "사설 엔터프라이즈 AI 박스, 빠른 코딩 및 에이전트 워크스테이션, 70B–235B MoE 모델을 서비스하는 멀티카드 2×/4×5090 클러스터.",
      "de": "Private Enterprise-AI-Boxen, schnelles Coden und agentenbasierte Workstations sowie Mehrkarten-2×/4×5090-Cluster, die 70B–235B MoE-Modelle bedienen.",
      "fr": "Boîtes d'IA d'entreprise privées, postes de travail de codage rapide et d'agents, et clusters multi-carte 2×/4×5090 servant des modèles MoE 70B–235B.",
      "es": "Cajas de IA de empresa privadas, estaciones de trabajo de codificación rápida y agentes, y clusters multi-tarjeta 2×/4×5090 que sirven modelos MoE 70B–235B.",
      "pt": "Caixas de IA de empresa privadas, estações de trabalho de codificação rápida e agentes, e clusters multi-cartão 2×/4×5090 servindo modelos MoE 70B–235B."
    },
    "futureNote": {
      "en": "The new 2026–2028 prosumer benchmark; ensure 1200W+ PSU and proper airflow for sustained 575W batch inference.",
      "zh": "2026–2028 年桌面与中小企业标杆卡；持续满载推理需预留 1200W+ 电源与强风道散热。",
      "ja": "新しい 2026–2028 プロシューマーベンチマーク；持続的な 575W バッチ推論のために 1200W+ PSU と適切なエアフローを確保してください。",
      "ko": "새로운 2026–2028 프로슈머 벤치마크; 지속적인 575W 배치 추론을 위해 1200W+ 전원 공급 장치와 적절한 공기 흐름을 보장하세요.",
      "de": "Der neue 2026–2028 Prosumer-Benchmark; stellen Sie sicher, dass ein 1200W+ Netzteil und eine angemessene Luftzirkulation für anhaltende 575W Batch-Inferenz vorhanden sind.",
      "fr": "Le nouveau benchmark prosumer 2026–2028 ; assurez-vous d'avoir une alimentation 1200W+ et une bonne circulation d'air pour une inférence par lot soutenue de 575W.",
      "es": "El nuevo benchmark prosumer 2026–2028; asegúrese de tener una fuente de alimentación de 1200W+ y un flujo de aire adecuado para inferencia por lotes sostenida de 575W.",
      "pt": "O novo benchmark prosumer 2026–2028; garanta fonte de alimentação de 1200W+ e fluxo de ar adequado para inferência em lote sustentada de 575W."
    },
    "workloads": [
      {
        "model": "Qwen3-32B (AWQ / NVFP4)",
        "engine": "SGLang / TensorRT-LLM",
        "decodeTps": "115 tok/s",
        "ttftMs": "85 ms",
        "maxConcurrency": "24 reqs",
        "jevRole": "Offloads classification & safety gates at <90ms"
      },
      {
        "model": "Llama-3.3-70B (NVFP4)",
        "engine": "TensorRT-LLM",
        "decodeTps": "52 tok/s",
        "ttftMs": "170 ms",
        "maxConcurrency": "8 reqs",
        "jevRole": "System Two fallback only for complex edge cases"
      },
      {
        "model": "Qwen3-Coder-30B-A3B (FP8)",
        "engine": "vLLM",
        "decodeTps": "210 tok/s",
        "ttftMs": "55 ms",
        "maxConcurrency": "32 reqs",
        "jevRole": "Jev classifies repo diffs before code edits"
      }
    ],
    "configLang": "bash",
    "configTitle": "SGLang NVFP4/FP8 serving command (RTX 5090 32GB)",
    "configCode": "python3 -m sglang.launch_server \\\n  --model-path Qwen/Qwen3-32B-AWQ \\\n  --host 127.0.0.1 --port 30000 \\\n  --mem-fraction-static 0.88 \\\n  --context-length 65536 \\\n  --kv-cache-dtype fp8_e4m3 \\\n  --chunked-prefill-size 4096"
  },
  {
    "slug": "rtx-pro-6000-blackwell-96g",
    "name": "NVIDIA RTX PRO 6000 Blackwell 96GB",
    "vendor": "NVIDIA",
    "tier": "workstation",
    "arch": "Blackwell Workstation",
    "vramGb": 96,
    "vramType": "GDDR7 ECC",
    "bandwidthGbs": 1792,
    "fp8Tflops": 2000,
    "tdpW": 600,
    "interconnect": "PCIe 5.0 x16",
    "typicalCloudUsdHr": "$1.40–$2.10/hr",
    "jevBypassSavings": "76%",
    "heroImage": "/img/guides/gpus-hero.webp",
    "tagline": {
      "en": "96GB ECC single-card workstation powerhouse for 70B FP8 without multi-GPU tensor-parallel overhead",
      "zh": "单卡 96GB ECC 工作站巨兽：无多卡通信开销直接运行 70B FP8",
      "ja": "70B FP8 をマルチGPUテンソル並列オーバーヘッドなしで動作させるための、96GB ECC搭載シングルカードワークステーション用ハイエンドモデル",
      "ko": "멀티 GPU 텐서 병렬 오버헤드 없이 70B FP8 를 구동하기 위한 96GB ECC 단일 카드 워크스테이션용 고성능 모델",
      "de": "Leistungsstarker Workstation-Chip mit 96GB ECC für 70B FP8 ohne Multi-GPU-Tensor-Parallelitäts-Overhead",
      "fr": "Puissance de poste de travail en carte unique avec 96GB ECC pour 70B FP8 sans surcoût de parallélisme tensoriel multi-GPU",
      "es": "Potente estación de trabajo en tarjeta única con 96GB ECC para 70B FP8 sin sobrecarga de paralelismo tensorial multi-GPU",
      "pt": "Estação de trabalho poderosa em cartão único com 96GB ECC para 70B FP8 sem sobrecarga de paralelismo tensorial multi-GPU"
    },
    "summary": {
      "en": "Fitting a full 70B FP8 model plus generous KV cache on a single 96GB ECC GPU eliminates PCIe all-reduce latency entirely. Combined with clavue-jev System One triage, one workstation replaces an entire legacy multi-GPU rack for mid-market enterprise workloads.",
      "zh": "单卡 96GB ECC 显存可直接装下完整 70B FP8 模型与充裕 KV Cache，彻底消除多卡 PCIe Tensor Parallel 通信延迟。搭配 clavue-jev 做 System One 门控，一台工作站即可替代传统多卡推理机柜。",
      "ja": "96GB ECC GPU 1枚でフルサイズの70B FP8モデルと十分なKVキャッシュを収容することで、PCIe全リダクションのレイテンシを完全に排除します。clavue-jev System Oneのトリアージ機能と組み合わせることで、1台のワークステーションが中規模企業のワークロード向けに従来のマルチGPUラック全体を代替します。",
      "ko": "96GB ECC GPU 1 개로 전체 70B FP8 모델과 넉넉한 KV 캐시를 수용함으로써 PCIe 전체 리덕스 지연 시간을 완전히 제거합니다. clavue-jev System One 트리아지와 결합하면 중규모 기업 워크로드를 위해 단일 워크스테이션이 기존 멀티 GPU 랙 전체를 대체합니다.",
      "de": "Das Platzieren eines vollständigen 70B FP8-Modells sowie eines großzügigen KV-Caches auf einer einzigen 96GB ECC GPU eliminiert die PCIe-All-Reduce-Latenz vollständig. In Kombination mit clavue-jev System One-Triage ersetzt eine einzige Workstation einen gesamten Legacy-Multi-GPU-Rack für mittelständische Unternehmensworkloads.",
      "fr": "L'installation d'un modèle complet 70B FP8 ainsi qu'un cache KV généreux sur une seule GPU ECC 96GB élimine entièrement la latence de réduction globale PCIe. Combiné à la triage clavue-jev System One, un seul poste de travail remplace un rack multi-GPU entier pour les charges de travail des entreprises de marché intermédiaire.",
      "es": "Ajustar un modelo completo de 70B FP8 junto con un caché KV generoso en una sola GPU ECC de 96GB elimina por completo la latencia de reducción global PCIe. Combinado con la clasificación clavue-jev System One, una sola estación de trabajo reemplaza a todo un rack multi-GPU heredado para cargas de trabajo de empresas de mercado intermedio.",
      "pt": "Ajustar um modelo completo de 70B FP8 junto com um cache KV generoso em uma única GPU ECC de 96GB elimina completamente a latência de redução global PCIe. Combinado com a triagem clavue-jev System One, uma única estação de trabalho substitui todo um rack multi-GPU legado para cargas de trabalho de empresas de mercado intermediário."
    },
    "bestUse": {
      "en": "On-premise legal, healthcare, and finance deployments needing 70B–120B FP8/FP4 accuracy inside a single quiet server chassis.",
      "zh": "金融、医疗、法律等要求数据不出机房、需单机部署 70B–120B FP8/FP4 的企业私有化场景。",
      "ja": "オンプレミス環境で、70B–120B FP8/FP4の精度を静かな単一サーバーシャーシ内で必要とする法務、医療、金融分野の導入向け。",
      "ko": "온프레미스 환경에서 70B–120B FP8/FP4 정확도를 단일 조용한 서버 쉘리스 내부에서 필요로 하는 법률, 의료, 금융 분야 배포용.",
      "de": "On-Premise-Implementierungen für Recht, Gesundheitswesen und Finanzen, die 70B–120B FP8/FP4-Genauigkeit innerhalb eines einzelnen leisen Server-Chassis benötigen.",
      "fr": "Déploiements on-premise pour le juridique, la santé et la finance nécessitant une précision 70B–120B FP8/FP4 à l'intérieur d'un châssis serveur silencieux unique.",
      "es": "Despliegues on-premise para derecho, salud y finanzas que requieren precisión de 70B–120B FP8/FP4 dentro de un único chasis de servidor silencioso.",
      "pt": "Implantações on-premise para direito, saúde e finanças que requerem precisão de 70B–120B FP8/FP4 dentro de um único chassi de servidor silencioso."
    },
    "futureNote": {
      "en": "Ideal bridge card for 2026–2028 on-prem teams avoiding SXM/NVLink datacenter infrastructure costs.",
      "zh": "2026–2028 年规避 SXM 数据中心高基建门槛的最佳本地旗舰卡。",
      "ja": "2026–2028年のオンプレミスチームにとって、SXM/NVLinkデータセンターインフラのコストを回避するための理想的なブリッジカード。",
      "ko": "2026–2028 년 온프레미스 팀을 위한 이상적인 브리지 카드로, SXM/NVLink 데이터센터 인프라 비용을 피합니다.",
      "de": "Ideale Brückenkarte für On-Premise-Teams 2026–2028, die die Kosten für SXM/NVLink-Datacenter-Infrastruktur vermeiden möchten.",
      "fr": "Carte de pont idéale pour les équipes on-premise 2026–2028 souhaitant éviter les coûts d'infrastructure de centre de données SXM/NVLink.",
      "es": "Tarjeta puente ideal para equipos on-premise de 2026–2028 que evitan los costos de infraestructura de centro de datos SXM/NVLink.",
      "pt": "Cartão ponte ideal para equipes on-premise de 2026–2028 que evitam os custos de infraestrutura de datacenter SXM/NVLink."
    },
    "workloads": [
      {
        "model": "Llama-3.3-70B-Instruct (FP8)",
        "engine": "vLLM",
        "decodeTps": "46 tok/s",
        "ttftMs": "140 ms",
        "maxConcurrency": "24 reqs",
        "jevRole": "Bypasses 70B call on 76% routine requests"
      },
      {
        "model": "Qwen3-235B-A22B (NVFP4)",
        "engine": "SGLang",
        "decodeTps": "68 tok/s",
        "ttftMs": "130 ms",
        "maxConcurrency": "16 reqs",
        "jevRole": "Jev routes specialist prompts to MoE experts"
      }
    ],
    "configLang": "bash",
    "configTitle": "Single-GPU 70B FP8 vLLM deployment (RTX PRO 6000 96GB)",
    "configCode": "vllm serve neuralmagic/Llama-3.3-70B-Instruct-FP8-dynamic \\\n  --tensor-parallel-size 1 \\\n  --gpu-memory-utilization 0.92 \\\n  --max-model-len 65536 \\\n  --enable-prefix-caching \\\n  --kv-cache-dtype fp8"
  },
  {
    "slug": "apple-m4-max-128g",
    "name": "Apple M4 Max 128GB Unified",
    "vendor": "Apple",
    "tier": "consumer",
    "arch": "Apple Silicon (40-core GPU)",
    "vramGb": 128,
    "vramType": "LPDDR5X Unified",
    "bandwidthGbs": 546,
    "fp8Tflops": 58,
    "tdpW": 95,
    "interconnect": "Unified SoC Fabric",
    "typicalCloudUsdHr": "On-prem laptop/Studio",
    "jevBypassSavings": "80%",
    "heroImage": "/img/guides/gpus-hero.webp",
    "tagline": {
      "en": "Silent 95W unified-memory developer machine running 70B Q4 locally with cloud clavue-jev",
      "zh": "95W 静音 128GB 统一内存开发利器：本地 MLX 跑 70B Q4 + 云端 clavue-jev",
      "ja": "クラウド clavue-jev を活用し、ローカルで 70B Q4 を実行する、95W のサイレント統一メモリ開発マシン",
      "ko": "클라우드 clavue-jev 를 활용하여 로컬에서 70B Q4 를 실행하는 95W 무소음 통합 메모리 개발 머신",
      "de": "Stille 95W Unified-Memory-Entwicklermaschine, die lokal 70B Q4 mit Cloud clavue-jev ausführt",
      "fr": "Machine de développement à mémoire unifiée silencieuse de 95W exécutant 70B Q4 localement avec cloud clavue-jev",
      "es": "Máquina de desarrollo de memoria unificada silenciosa de 95W que ejecuta 70B Q4 localmente con cloud clavue-jev",
      "pt": "Máquina de desenvolvimento de memória unificada silenciosa de 95W executando 70B Q4 localmente com cloud clavue-jev"
    },
    "summary": {
      "en": "M4 Max trades raw prefill FLOPS for 128GB of coherent unified memory at 546 GB/s under 95W. Because long-prompt prefill is slower on Apple Silicon, using clavue-jev (~80ms) to filter and classify inputs before waking the local MLX model makes desktop AI workflows feel instant.",
      "zh": "M4 Max 在不到 95W 功耗下提供 128GB 统一内存与 546 GB/s 带宽。由于 Apple Silicon 在长提示词 Prefill 阶段相对偏慢，前置接入约 80ms 的 clavue-jev 过滤与分流请求，可大幅减少无效唤醒、让本地开发助手流畅如飞。",
      "ja": "M4 Max は、95W で 546 GB/s の一貫した統一メモリ 128GB を提供し、生粋のプリフィル FLOPS をトレードインします。Apple Silicon では長文プロンプトのプリフィルが遅いため、ローカルの MLX モデルを起動する前に clavue-jev（約 80ms）で入力をフィルタリングおよび分類することで、デスクトップ AI ワークフローが瞬時に感じられます。",
      "ko": "M4 Max 는 95W 에서 546 GB/s 의 일관된 통합 메모리 128GB 를 제공하며, 원시 프리필 FLOPS 을 트레이드인합니다. Apple Silicon 에서 긴 프롬프트 프리필이 느리기 때문에, 로컬 MLX 모델을 깨기 전에 clavue-jev(약 80ms) 로 입력을 필터링하고 분류하면 데스크톱 AI 워크플로우가 즉시 느껴집니다.",
      "de": "Der M4 Max tauscht rohe Prefill-FLOPS gegen 128 GB kohärenten Unified Memory bei 546 GB/s unter 95W. Da Prefill für lange Prompts auf Apple Silicon langsamer ist, macht die Verwendung von clavue-jev (~80ms) zum Filtern und Klassifizieren von Eingaben vor dem Wecken des lokalen MLX-Modells Desktop-AI-Workflows sofort spürbar.",
      "fr": "Le M4 Max échange des FLOPS de préremplissage bruts contre 128 Go de mémoire unifiée cohérente à 546 Go/s sous 95 W. Étant donné que le préremplissage de longs prompts est plus lent sur Apple Silicon, l'utilisation de clavue-jev (~80 ms) pour filtrer et classifier les entrées avant d'éveiller le modèle MLX local rend les flux de travail IA de bureau instantanés.",
      "es": "El M4 Max intercambia FLOPS de prellenado brutos por 128 GB de memoria unificada coherente a 546 GB/s bajo 95 W. Dado que el prellenado de prompts largos es más lento en Apple Silicon, el uso de clavue-jev (~80 ms) para filtrar y clasificar las entradas antes de despertar el modelo MLX local hace que los flujos de trabajo de IA de escritorio se sientan instantáneos.",
      "pt": "O M4 Max troca FLOPS brutos de preenchimento inicial por 128 GB de memória unificada coerente a 546 GB/s sob 95 W. Como o preenchimento inicial de prompts longos é mais lento no Apple Silicon, o uso do clavue-jev (~80 ms) para filtrar e classificar entradas antes de acordar o modelo MLX local faz com que os fluxos de trabalho de IA de desktop pareçam instantâneos."
    },
    "bestUse": {
      "en": "Mobile engineers, security researchers, and offline-capable Mac Studio / MacBook Pro coding assistants using MLX or llama.cpp.",
      "zh": "移动开发者、安全审计与离线代码助手场景，基于 MLX 或 llama.cpp 在 MacBook Pro / Mac Studio 本地部署。",
      "ja": "モバイルエンジニア、セキュリティ研究者、および MLX や llama.cpp を使用するオフライン対応 Mac Studio / MacBook Pro コーディングアシスタント向け。",
      "ko": "모바일 엔지니어, 보안 연구자, 그리고 MLX 또는 llama.cpp 를 사용하는 오프라인 지원 Mac Studio / MacBook Pro 코딩 어시스턴트용입니다.",
      "de": "Für mobile Ingenieure, Sicherheitsforscher und offline-fähige Mac Studio / MacBook Pro Coding-Assistenten, die MLX oder llama.cpp verwenden.",
      "fr": "Pour les ingénieurs mobiles, les chercheurs en sécurité et les assistants de codage Mac Studio / MacBook Pro capables de fonctionner hors ligne utilisant MLX ou llama.cpp.",
      "es": "Para ingenieros móviles, investigadores de seguridad y asistentes de codificación Mac Studio / MacBook Pro capaces de funcionar sin conexión que utilizan MLX o llama.cpp.",
      "pt": "Para engenheiros móveis, pesquisadores de segurança e assistentes de codificação Mac Studio / MacBook Pro capazes de funcionar offline que utilizam MLX ou llama.cpp."
    },
    "futureNote": {
      "en": "Expect M5 Max / M5 Ultra to push unified bandwidth past 700–1,000 GB/s with dedicated matrix accelerators.",
      "zh": "后续 M5 Max / Ultra 预计将统一内存带宽推向 700–1,000 GB/s 并强化矩阵加速单元。",
      "ja": "M5 Max / M5 Ultra は、専用行列アクセラレータにより統一帯域を 700–1,000 GB/s 以上へ押し上げることを期待してください。",
      "ko": "M5 Max / M5 Ultra 는 전용 행렬 가속기를 통해 통합 대역폭을 700–1,000 GB/s 이상으로 끌어올릴 것으로 예상됩니다.",
      "de": "Erwarten Sie, dass M5 Max / M5 Ultra die Unified-Bandbreite mit dedizierten Matrixbeschleunigern über 700–1.000 GB/s hinausdrängen.",
      "fr": "Attendez-vous que le M5 Max / M5 Ultra pousse la bande passante unifiée au-delà de 700–1 000 Go/s avec des accélérateurs matriciels dédiés.",
      "es": "Esperar que el M5 Max / M5 Ultra impulse el ancho de banda unificado más allá de 700–1.000 GB/s con aceleradores matriciales dedicados.",
      "pt": "Espere que o M5 Max / M5 Ultra empurre a largura de banda unificada para além de 700–1.000 GB/s com aceleradores matriciais dedicados."
    },
    "workloads": [
      {
        "model": "Qwen3-32B (MLX 4-bit)",
        "engine": "mlx_lm.server",
        "decodeTps": "28 tok/s",
        "ttftMs": "420 ms",
        "maxConcurrency": "2 reqs",
        "jevRole": "Filters trivial prompts so prefill stays free"
      },
      {
        "model": "DeepSeek-R1-Distill-70B (Q4_K_M)",
        "engine": "llama.cpp Metal",
        "decodeTps": "13 tok/s",
        "ttftMs": "950 ms",
        "maxConcurrency": "1 req",
        "jevRole": "Only triggered on high-stakes escalations"
      }
    ],
    "configLang": "bash",
    "configTitle": "MLX OpenAI-compatible local server (M4 Max 128GB)",
    "configCode": "mlx_lm.server \\\n  --model mlx-community/Qwen3-32B-4bit \\\n  --host 127.0.0.1 --port 8080 \\\n  --max-tokens 4096 \\\n  --temp 0.2"
  },
  {
    "slug": "apple-m3-ultra-512g",
    "name": "Apple M3 Ultra 512GB Unified",
    "vendor": "Apple",
    "tier": "workstation",
    "arch": "Apple Silicon (80-core GPU)",
    "vramGb": 512,
    "vramType": "LPDDR5X Unified",
    "bandwidthGbs": 819,
    "fp8Tflops": 110,
    "tdpW": 250,
    "interconnect": "UltraFusion 2.5 TB/s",
    "typicalCloudUsdHr": "On-prem Mac Studio",
    "jevBypassSavings": "82%",
    "heroImage": "/img/guides/gpus-hero.webp",
    "tagline": {
      "en": "Half-terabyte quiet desktop node capable of hosting 671B MoE models locally",
      "zh": "512GB 桌面级静音节点：单机装下 671B 旗舰 MoE 大模型",
      "ja": "671B MoE モデルをローカルでホストできる、半テラバイト級の静かなデスクトップノード",
      "ko": "671B MoE 모델을 로컬에서 호스팅할 수 있는 반 테라바이트급 조용한 데스크톱 노드",
      "de": "Ein ruhiger Desktop-Node mit halber Terabyte-Kapazität, der 671B MoE-Modelle lokal hosten kann",
      "fr": "Nœud de bureau silencieux de demi-téraoctet capable d'héberger localement des modèles MoE de 671B",
      "es": "Nodo de escritorio silencioso de medio terabyte capaz de alojar localmente modelos MoE de 671B",
      "pt": "Nó de desktop silencioso de meio terabyte capaz de hospedar localmente modelos MoE de 671B"
    },
    "summary": {
      "en": "A single Mac Studio with 512GB unified memory holds quantized 671B MoE models (DeepSeek-V3/R1 4-bit) at 250W—a workload otherwise requiring an 8×H100 node. Pairing it with clavue-jev eliminates slow prefill queues for low-complexity queries.",
      "zh": "单台 512GB 统一内存 Mac Studio 仅以 250W 功耗即可装下 4-bit 量化的 DeepSeek-V3/R1 671B 等超大 MoE 模型（此前通常需 8×H100 节点）。前端接入 clavue-jev 拦截常规判定，可彻底避免低并发桌机被长队列阻塞。",
      "ja": "512GB の統一メモリを搭載した単一の Mac Studio が、250W の消費電力で量子化された 671B MoE モデル（DeepSeek-V3/R1 4-bit）を保持します。これは通常、8×H100 ノードを必要とする負荷です。clavue-jev と組み合わせることで、低複雑度クエリの遅いプリフィルキューを解消できます。",
      "ko": "512GB 통합 메모리를 탑재한 단일 Mac Studio 는 250W 로 양자화된 671B MoE 모델 (DeepSeek-V3/R1 4-bit) 을 보유합니다. 이는 일반적으로 8×H100 노드가 필요한 작업량입니다. clavue-jev 과 결합하면 저복잡도 쿼리의 느린 프리필 큐를 제거할 수 있습니다.",
      "de": "Ein einzelnes Mac Studio mit 512GB Unified Memory hält quantisierte 671B MoE-Modelle (DeepSeek-V3/R1 4-bit) bei 250W – eine Arbeitslast, die sonst einen 8×H100-Node erfordern würde. Die Kombination mit clavue-jev eliminiert langsame Prefill-Warteschlangen für Abfragen mit geringer Komplexität.",
      "fr": "Un seul Mac Studio avec 512 Go de mémoire unifiée tient des modèles MoE de 671B quantifiés (DeepSeek-V3/R1 4-bit) à 250 W – une charge de travail qui nécessiterait normalement un nœud 8×H100. L'association avec clavue-jev élimine les files d'attente de préremplissage lentes pour les requêtes à faible complexité.",
      "es": "Un solo Mac Studio con 512 GB de memoria unificada alberga modelos MoE de 671B cuantizados (DeepSeek-V3/R1 4-bit) a 250 W – una carga de trabajo que normalmente requeriría un nodo de 8×H100. Emparejarlo con clavue-jev elimina las colas de prellenado lentas para consultas de baja complejidad.",
      "pt": "Um único Mac Studio com 512 GB de memória unificada mantém modelos MoE de 671B quantizados (DeepSeek-V3/R1 4-bit) a 250 W – uma carga de trabalho que normalmente exigiria um nó de 8×H100. Emparelhar com clavue-jev elimina filas de preenchimento lento para consultas de baixa complexidade."
    },
    "bestUse": {
      "en": "R&D labs, executive private AI appliances, and air-gapped teams needing frontier MoE weights on a desk.",
      "zh": "研发实验室、私密桌面级前沿模型一体机及低并发（1–4 人）深度推理团队。",
      "ja": "最先端 MoE 重みをデスクトップで必要とする R&D ラボ、エグゼクティブ向けプライベート AI アプライアンス、およびエアギャップ環境のチーム向け。",
      "ko": "최첨단 MoE 가중치를 데스크톱에서 필요로 하는 R&D 실험실, 임원용 개인 AI 기기, 그리고 에어갭 팀을 위한 용도입니다.",
      "de": "Für R&D-Labore, private AI-Geräte für Führungskräfte und luftgetrennte Teams, die Frontier-MoE-Gewichte am Schreibtisch benötigen.",
      "fr": "Pour les laboratoires de R&D, les appareils AI privés d'exécutifs et les équipes en environnement air-gapped ayant besoin de poids MoE de pointe sur un bureau.",
      "es": "Para laboratorios de I+D, dispositivos AI privados ejecutivos y equipos aislados que necesitan pesos MoE de vanguardia en un escritorio.",
      "pt": "Para laboratórios de P&D, aparelhos AI privados de executivos e equipes em ambiente air-gapped que precisam de pesos MoE de fronteira em uma mesa."
    },
    "futureNote": {
      "en": "Best for low-concurrency (1–4 user) frontier inference; move to B200/H200 clusters when concurrency exceeds 10+ simultaneous streams.",
      "zh": "适合低并发旗舰模型本地化；一旦并发超过 10 路以上建议切换至 H200 / B200 集群。",
      "ja": "低並列度（1〜4 ユーザー）の最先端推論に最適です。並列度が 10 以上の同時ストリームを超えた場合は、B200/H200 クラスターへ移行してください。",
      "ko": "저 동시성 (1~4 사용자) 최첨단 추론에 가장 적합합니다. 동시성이 10 개 이상의 스트림을 초과하면 B200/H200 클러스터로 이동하세요.",
      "de": "Am besten geeignet für geringe Konkurrenz (1–4 Benutzer) bei Frontier-Inferenz; wechseln Sie zu B200/H200-Clustern, wenn die Konkurrenz 10+ gleichzeitige Streams überschreitet.",
      "fr": "Idéal pour une faible concurrence (1–4 utilisateurs) lors de l'inférence de pointe ; passez à des clusters B200/H200 lorsque la concurrence dépasse 10+ flux simultanés.",
      "es": "Ideal para baja concurrencia (1–4 usuarios) en inferencia de vanguardia; pase a clústeres B200/H200 cuando la concurrencia supere 10+ flujos simultáneos.",
      "pt": "Melhor para baixa concorrência (1–4 usuários) em inferência de fronteira; mova-se para clusters B200/H200 quando a concorrência exceder 10+ streams simultâneos."
    },
    "workloads": [
      {
        "model": "DeepSeek-V3 / R1 671B (MLX 4-bit)",
        "engine": "mlx_lm.server",
        "decodeTps": "17 tok/s",
        "ttftMs": "1800 ms",
        "maxConcurrency": "2 reqs",
        "jevRole": "Absorbs 82% quick checks before waking 671B"
      },
      {
        "model": "Qwen3-235B-A22B (Q6_K)",
        "engine": "llama.cpp Metal",
        "decodeTps": "31 tok/s",
        "ttftMs": "680 ms",
        "maxConcurrency": "3 reqs",
        "jevRole": "Routes simple intents directly to code"
      }
    ],
    "configLang": "bash",
    "configTitle": "llama.cpp server for 671B MoE on M3 Ultra 512GB",
    "configCode": "llama-server \\\n  --model /models/DeepSeek-V3-Q4_K_M-00001-of-00009.gguf \\\n  --host 127.0.0.1 --port 8080 \\\n  --ctx-size 32768 --n-gpu-layers 999 \\\n  --flash-attn --parallel 2"
  },
  {
    "slug": "nvidia-l4-24g",
    "name": "NVIDIA L4 24GB",
    "vendor": "NVIDIA",
    "tier": "workstation",
    "arch": "Ada Lovelace",
    "vramGb": 24,
    "vramType": "GDDR6 ECC",
    "bandwidthGbs": 300,
    "fp8Tflops": 485,
    "tdpW": 72,
    "interconnect": "PCIe 4.0 x16",
    "typicalCloudUsdHr": "$0.55–$0.80/hr",
    "jevBypassSavings": "70%",
    "heroImage": "/img/guides/gpus-hero.webp",
    "tagline": {
      "en": "Ultra-efficient 72W cloud inference card for dense microservices and embedding/rerank tiers",
      "zh": "72W 超低功耗云端推理卡：高密度微服务、向量嵌入与轻量模型主力",
      "ja": "高密度マイクロサービスおよび埋め込み/再ランク付け階層向けの超効率化 72W クラウド推論カード",
      "ko": "고밀도 마이크로서비스 및 임베딩/재랭킹 계층을 위한 초고효율 72W 클라우드 추론 카드",
      "de": "Ultra-effiziente 72W Cloud-Inferenzkarte für dichte Microservices und Embedding/Rerank-Stufen",
      "fr": "Carte d'inférence cloud ultra-efficace de 72 W pour les microservices denses et les niveaux d'embedding/rerank",
      "es": "Tarjeta de inferencia en la nube ultraeficiente de 72 W para microservicios densos y niveles de embedding/rerank",
      "pt": "Cartão de inferência em nuvem ultraeficiente de 72 W para microsserviços densos e níveis de embedding/rerank"
    },
    "summary": {
      "en": "L4 is ubiquitous across AWS g6, GCP g2, and Kubernetes inference pools at just 72W. Its 300 GB/s bandwidth caps large-model decode speed, making it ideal for small 7B–14B models, embeddings, and lightweight companion services orchestrated by clavue-jev.",
      "zh": "NVIDIA L4 广泛分布于主流云平台，功耗仅 72W。受限于 300 GB/s 显存带宽，它更适合承载 7B–14B 轻量模型、向量嵌入与重排服务，并由 clavue-jev 在外层完成高速结构化路由。",
      "ja": "L4 は AWS g6、GCP g2、および Kubernetes 推論プールのいずれでも 72W という低消費電力で広く採用されています。300 GB/s の帯域幅は大規模モデルのデコード速度を制限するため、clavue-jev によってオーケストレーションされる 7B–14B の小型モデル、埋め込み、および軽量コンパニオンサービスに最適です。",
      "ko": "L4 는 AWS g6, GCP g2, 및 Kubernetes 추론 풀에서 72W 의 낮은 전력으로 보편적으로 사용됩니다. 300 GB/s 의 대역폭은 대규모 모델 디코딩 속도를 제한하므로, clavue-jev 로 오케스트레이션된 7B–14B 소형 모델, 임베딩, 및 경량 동반 서비스에 이상적입니다.",
      "de": "L4 ist auf AWS g6, GCP g2 und Kubernetes-Inferenz-Pools bei nur 72W allgegenwärtig. Seine 300 GB/s Bandbreite begrenzt die Decode-Geschwindigkeit großer Modelle, was sie ideal für kleine 7B–14B-Modelle, Embeddings und leichte Begleitdienste macht, die von clavue-jev orchestriert werden.",
      "fr": "L4 est omniprésent sur AWS g6, GCP g2 et les pools d'inférence Kubernetes à seulement 72 W. Sa bande passante de 300 Go/s limite la vitesse de décodage des grands modèles, ce qui la rend idéale pour les petits modèles de 7B–14B, les embeddings et les services compagnons légers orchestrés par clavue-jev.",
      "es": "L4 es ubicua en AWS g6, GCP g2 y pools de inferencia de Kubernetes a solo 72 W. Su ancho de banda de 300 GB/s limita la velocidad de decodificación de modelos grandes, lo que la hace ideal para modelos pequeños de 7B–14B, embeddings y servicios de acompañamiento ligeros orquestados por clavue-jev.",
      "pt": "L4 é ubíquo em AWS g6, GCP g2 e pools de inferência Kubernetes a apenas 72 W. Sua largura de banda de 300 GB/s limita a velocidade de decodificação de modelos grandes, tornando-o ideal para modelos pequenos de 7B–14B, embeddings e serviços de acompanhamento leves orquestrados por clavue-jev."
    },
    "bestUse": {
      "en": "High-density cloud microservice pods, RAG embedding + rerank tiers, and budget 8B generation backends.",
      "zh": "高密度 Kubernetes 推理 Pod、RAG 向量嵌入/重排层，以及低成本 8B FP8 辅助生成服务。",
      "ja": "高密度クラウドマイクロサービスポッド、RAG 埋め込みおよび再ランク付け階層、および予算制約のある 8B 生成バックエンド。",
      "ko": "고밀도 클라우드 마이크로서비스 포드, RAG 임베딩 + 재랭킹 계층, 및 예산 친화적 8B 생성 백엔드.",
      "de": "Hochdichte Cloud-Microservice-Pods, RAG-Embedding- und Rerank-Stufen sowie budgetfreundliche 8B-Generierungs-Backends.",
      "fr": "Pods de microservices cloud à haute densité, niveaux d'embedding + rerank RAG, et backends de génération 8B économiques.",
      "es": "Pods de microservicios en la nube de alta densidad, niveles de embedding + rerank RAG y backends de generación 8B de bajo presupuesto.",
      "pt": "Pods de microsserviços em nuvem de alta densidade, níveis de embedding + rerank RAG e backends de geração 8B de baixo custo."
    },
    "futureNote": {
      "en": "Prefer L40S or H100/B200 for heavy LLM decode; keep L4 for embeddings, OCR, and lightweight 8B FP8 microservices.",
      "zh": "大参数高并发生成建议选 L40S / H100 / B200；L4 长期适合嵌入、OCR 与轻量微服务。",
      "ja": "重い LLM デコードには L40S または H100/B200 を推奨します。埋め込み、OCR、および軽量 8B FP8 マイクロサービスには L4 を維持してください。",
      "ko": "무거운 LLM 디코딩에는 L40S 또는 H100/B200 을 선호하세요. 임베딩, OCR, 및 경량 8B FP8 마이크로서비스에는 L4 를 유지하세요.",
      "de": "Für schwere LLM-Decodes L40S oder H100/B200 bevorzugen; L4 für Embeddings, OCR und leichte 8B FP8-Microservices beibehalten.",
      "fr": "Préférez L40S ou H100/B200 pour un décodage LLM lourd ; conservez L4 pour les embeddings, l'OCR et les microservices 8B FP8 légers.",
      "es": "Prefiera L40S o H100/B200 para decodificación pesada de LLM; mantenga L4 para embeddings, OCR y microservicios 8B FP8 ligeros.",
      "pt": "Prefira L40S ou H100/B200 para decodificação pesada de LLM; mantenha L4 para embeddings, OCR e microsserviços 8B FP8 leves."
    },
    "workloads": [
      {
        "model": "Qwen3-8B (FP8)",
        "engine": "vLLM",
        "decodeTps": "52 tok/s",
        "ttftMs": "110 ms",
        "maxConcurrency": "16 reqs",
        "jevRole": "Filters 70% non-generative tickets pre-GPU"
      },
      {
        "model": "BGE-M3 Embeddings + Reranker",
        "engine": "TEI / vLLM",
        "decodeTps": "1,400 docs/s",
        "ttftMs": "18 ms",
        "maxConcurrency": "64 reqs",
        "jevRole": "Jev validates passage relevance post-retrieval"
      }
    ],
    "configLang": "yaml",
    "configTitle": "Kubernetes GPU Pod spec (NVIDIA L4 24GB)",
    "configCode": "apiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: qwen3-8b-l4\nspec:\n  replicas: 2\n  template:\n    spec:\n      containers:\n        - name: vllm\n          image: vllm/vllm-openai:latest\n          args: [\"--model\", \"Qwen/Qwen3-8B-FP8\", \"--gpu-memory-utilization\", \"0.88\", \"--max-model-len\", \"16384\"]\n          resources:\n            limits:\n              nvidia.com/gpu: 1"
  },
  {
    "slug": "nvidia-l40s-48g",
    "name": "NVIDIA L40S 48GB",
    "vendor": "NVIDIA",
    "tier": "workstation",
    "arch": "Ada Lovelace",
    "vramGb": 48,
    "vramType": "GDDR6 ECC",
    "bandwidthGbs": 864,
    "fp8Tflops": 1466,
    "tdpW": 350,
    "interconnect": "PCIe 4.0 x16",
    "typicalCloudUsdHr": "$1.10–$1.60/hr",
    "jevBypassSavings": "74%",
    "heroImage": "/img/guides/gpus-hero.webp",
    "tagline": {
      "en": "48GB enterprise all-rounder balancing FP8 LLM serving, vision/OCR, and mid-size RAG stacks",
      "zh": "48GB 企业全能卡：兼顾 FP8 大模型推理、多模态 OCR 与中等并发 RAG",
      "ja": "FP8 LLM サービング、ビジョン/OCR、および中規模 RAG スタックをバランスよく扱う 48GB エンタープライズ向けオールラウンダー",
      "ko": "FP8 LLM 서비스, 비전/OCR, 및 중규모 RAG 스택을 균형 있게 지원하는 48GB 엔터프라이즈용 올라운더",
      "de": "48GB Enterprise-Allrounder, der FP8 LLM-Serving, Vision/OCR und mittelgroße RAG-Stacks ausbalanciert",
      "fr": "48GB tout-terrain d'entreprise équilibrant le service LLM FP8, la vision/OCR et les piles RAG de taille moyenne",
      "es": "48GB todo terreno empresarial equilibrando el servicio LLM FP8, visión/OCR y pilas RAG de tamaño medio",
      "pt": "48GB all-rounder empresarial equilibrando o serviço LLM FP8, visão/OCR e pilhas RAG de tamanho médio"
    },
    "summary": {
      "en": "L40S doubles L4 VRAM to 48GB ECC with nearly 3× memory bandwidth (864 GB/s) and strong FP8 compute, without H100 scarcity or liquid cooling. Ideal for 32B FP8 production deployments fronted by clavue-jev guardrails.",
      "zh": "L40S 将显存提升至 48GB ECC、带宽近三倍于 L4（864 GB/s），且无需数据中心液冷设施即可广泛采购。单卡流畅承载 32B FP8 或双卡跑 70B FP8，前接 clavue-jev 门控可显著压降单次推理成本。",
      "ja": "L40S は L4 の VRAM を 48GB の ECC に倍増させ、メモリ帯域幅をほぼ 3 倍（864 GB/s）に向上させ、強力な FP8 計算能力を備えています。H100 の不足や液体冷却の必要性はありません。clavue-jev ガードレールを前面に配置した 32B FP8 本番デプロイメントに最適です。",
      "ko": "L40S 는 L4 의 VRAM 을 48GB ECC 로 두 배로 늘리고, 메모리 대역폭을 거의 3 배 (864 GB/s) 로 향상시키며 강력한 FP8 연산 능력을 제공합니다. H100 부족이나 액체 냉각이 필요하지 않습니다. clavue-jev 가드레일을 앞세운 32B FP8 프로덕션 배포에 이상적입니다.",
      "de": "L40S verdoppelt den L4-VRAM auf 48GB ECC mit nahezu 3-facher Speicherbandbreite (864 GB/s) und starker FP8-Berechnung, ohne H100-Mangel oder Flüssigkühlung. Ideal für 32B FP8-Produktionsbereitstellungen, die von clavue-jev-Guardrails geschützt werden.",
      "fr": "L40S double la VRAM L4 à 48GB ECC avec une bande passante mémoire presque 3× (864 Go/s) et un calcul FP8 robuste, sans pénurie H100 ni refroidissement liquide. Idéal pour les déploiements de production 32B FP8 protégés par des garde-fous clavue-jev.",
      "es": "L40S duplica la VRAM L4 a 48GB ECC con casi 3× de ancho de banda de memoria (864 GB/s) y fuerte cálculo FP8, sin escasez de H100 ni refrigeración líquida. Ideal para despliegues de producción 32B FP8 protegidos por guardrails clavue-jev.",
      "pt": "L40S duplica a VRAM L4 para 48GB ECC com quase 3× de largura de banda de memória (864 GB/s) e forte computação FP8, sem escassez de H100 ou refrigeração líquida. Ideal para implantações de produção 32B FP8 protegidas por guardrails clavue-jev."
    },
    "bestUse": {
      "en": "Enterprise SaaS inference (32B FP8 single-GPU or 70B FP8 on 2×L40S), multimodal OCR/vision pipelines, and regional EU/APAC cloud zones.",
      "zh": "企业 SaaS 32B FP8 单卡生产服务、双卡 70B FP8，以及多模态视觉/OCR 混合流水线。",
      "ja": "エンタープライズ SaaS 推論（32B FP8 シングル GPU または 2×L40S 上の 70B FP8）、マルチモーダル OCR/ビジョンパイプライン、および欧州/アジア太平洋地域のクラウドゾーン。",
      "ko": "엔터프라이즈 SaaS 추론 (32B FP8 단일 GPU 또는 2×L40S 에서 70B FP8), 멀티모달 OCR/비전 파이프라인, 및 유럽/아시아 태평양 지역 클라우드 존.",
      "de": "Enterprise SaaS-Inferenz (32B FP8 Single-GPU oder 70B FP8 auf 2×L40S), multimodale OCR/Vision-Pipelines und regionale EU/APAC-Cloud-Zonen.",
      "fr": "Inférence SaaS d'entreprise (32B FP8 single-GPU ou 70B FP8 sur 2×L40S), pipelines multimodaux OCR/vision, et zones cloud régionales UE/APAC.",
      "es": "Inferencia SaaS empresarial (32B FP8 single-GPU o 70B FP8 en 2×L40S), pipelines multimodales OCR/visión y zonas de nube regionales UE/APAC.",
      "pt": "Inferência SaaS empresarial (32B FP8 single-GPU ou 70B FP8 em 2×L40S), pipelines multimodais OCR/visão e zonas de nuvem regionais UE/APAC."
    },
    "futureNote": {
      "en": "Strong mid-tier cloud staple through 2027; upgrade to H200/B200 when KV cache concurrency or >100K context dominates.",
      "zh": "2027 年前仍是高可用中端主力；当长上下文（>100K）与超大并发成为瓶颈时再升至 H200/B200。",
      "ja": "2027 年まで強力な中級クラウドの定番です。KV キャッシュの同時実行数や 100K 以上のコンテキストが支配的になる場合は、H200/B200 にアップグレードしてください。",
      "ko": "2027 년까지 강력한 중급 클라우드 주류 제품입니다. KV 캐시 동시성 또는 100K 이상의 컨텍스트가 지배적이 되면 H200/B200 으로 업그레이드하세요.",
      "de": "Starker Mittelklasse-Cloud-Standard bis 2027; Upgrade auf H200/B200, wenn KV-Cache-Konkurrenz oder >100K-Kontext dominieren.",
      "fr": "Pilier cloud de milieu de gamme solide jusqu'en 2027 ; passez à H200/B200 lorsque la concurrence du cache KV ou le contexte >100K dominent.",
      "es": "Estándar de nube de gama media sólido hasta 2027; actualice a H200/B200 cuando la concurrencia de caché KV o el contexto >100K dominen.",
      "pt": "Padrão de nuvem de médio porte sólido até 2027; atualize para H200/B200 quando a concorrência de cache KV ou contexto >100K dominar."
    },
    "workloads": [
      {
        "model": "Qwen3-32B (FP8)",
        "engine": "vLLM / SGLang",
        "decodeTps": "58 tok/s",
        "ttftMs": "115 ms",
        "maxConcurrency": "28 reqs",
        "jevRole": "Cuts LLM calls by 74% via System One triage"
      },
      {
        "model": "Llama-3.3-70B (FP8 on 2×L40S TP2)",
        "engine": "vLLM",
        "decodeTps": "42 tok/s",
        "ttftMs": "150 ms",
        "maxConcurrency": "24 reqs",
        "jevRole": "Jev enforces policy guardrails pre- and post-call"
      }
    ],
    "configLang": "bash",
    "configTitle": "2×L40S TP2 production vLLM command",
    "configCode": "vllm serve neuralmagic/Llama-3.3-70B-Instruct-FP8-dynamic \\\n  --tensor-parallel-size 2 \\\n  --gpu-memory-utilization 0.92 \\\n  --max-model-len 32768 \\\n  --enable-chunked-prefill \\\n  --enable-prefix-caching"
  },
  {
    "slug": "nvidia-a100-80g-sxm",
    "name": "NVIDIA A100 80GB SXM",
    "vendor": "NVIDIA",
    "tier": "datacenter",
    "arch": "Ampere",
    "vramGb": 80,
    "vramType": "HBM2e",
    "bandwidthGbs": 2039,
    "fp8Tflops": 624,
    "tdpW": 400,
    "interconnect": "NVLink 600 GB/s",
    "typicalCloudUsdHr": "$1.30–$1.90/hr",
    "jevBypassSavings": "77%",
    "heroImage": "/img/guides/gpus-hero.webp",
    "tagline": {
      "en": "2 TB/s HBM2e veteran still dominating discounted 80GB BF16/AWQ production clusters",
      "zh": "2 TB/s HBM2e 常青主力：高性价比盘活存量 80GB BF16/AWQ 生产集群",
      "ja": "2 TB/s HBM2e のベテランが、割引された 80GB BF16/AWQ 生産クラスターを依然として支配",
      "ko": "2 TB/s HBM2e 베테랑이 할인된 80GB BF16/AWQ 생산 클러스터를 여전히 지배",
      "de": "2 TB/s HBM2e-Veteran beherrscht weiterhin diskontierte 80GB BF16/AWQ-Produktionscluster",
      "fr": "Vétéran 2 TB/s HBM2e toujours dominant les clusters de production 80GB BF16/AWQ à prix réduit",
      "es": "Veterano de 2 TB/s HBM2e que aún domina los clusters de producción de 80GB BF16/AWQ con descuento",
      "pt": "Veterano de 2 TB/s HBM2e que ainda domina clusters de produção de 80GB BF16/AWQ com desconto"
    },
    "summary": {
      "en": "A100 80GB lacks native FP8 tensor cores (uses BF16/W4A16 AWQ/Marlin kernels instead), yet its 2,039 GB/s HBM2e bandwidth and low spot pricing keep it hugely cost-effective. Adding clavue-jev lets legacy A100 fleets absorb 3–4× more business volume without buying new GPUs.",
      "zh": "尽管 A100 80GB 缺少原生 FP8 Tensor Core（推荐 BF16 或 AWQ/Marlin W4A16 核），但凭借 2,039 GB/s HBM2e 带宽与极具吸引力的云折扣价依然实用。前置接入 clavue-jev 可让存量 A100 集群在不扩卡的前提下承接 3–4 倍业务量。",
      "ja": "A100 80GB はネイティブ FP8 テンソアコアを備えていない（代わりに BF16/W4A16 AWQ/Marlin カーネルを使用）が、2,039 GB/s の HBM2e バンド幅と低いスポット価格により、依然として極めてコスト効果が高い。clavue-jev を追加することで、既存の A100 フリートは新しい GPU を購入せずに 3〜4 倍のビジネスボリュームを処理できるようになる。",
      "ko": "A100 80GB 는 네이티브 FP8 텐서 코어를 갖지 않지만 (대신 BF16/W4A16 AWQ/Marlin 커널 사용), 2,039 GB/s HBM2e 대역폭과 낮은 스팟 가격으로 인해 여전히 비용 효율성이 매우 높습니다. clavue-jev 를 추가하면 기존 A100 플릿은 새로운 GPU 를 구매하지 않고도 3~4 배 더 많은 비즈니스 볼륨을 처리할 수 있습니다.",
      "de": "Die A100 80GB verfügt über keine nativen FP8-Tensor-Kerne (verwendet stattdessen BF16/W4A16 AWQ/Marlin-Kernel), doch ihre 2.039 GB/s HBM2e-Bandbreite und niedrigen Spot-Preise machen sie extrem kosteneffizient. Durch die Integration von clavue-jev können bestehende A100-Flotten 3–4× mehr Geschäftsvolumen verarbeiten, ohne neue GPUs zu kaufen.",
      "fr": "L'A100 80GB ne dispose pas de cœurs tensoriels FP8 natifs (utilise plutôt des noyaux BF16/W4A16 AWQ/Marlin), mais sa bande passante HBM2e de 2 039 Go/s et ses prix spot bas la rendent extrêmement rentable. L'ajout de clavue-jev permet aux flottes A100 existantes d'absorber 3 à 4 fois plus de volume commercial sans acheter de nouvelles GPU.",
      "es": "La A100 80GB carece de núcleos tensoriales FP8 nativos (usa kernels BF16/W4A16 AWQ/Marlin en su lugar), pero su ancho de banda HBM2e de 2.039 GB/s y sus precios spot bajos la mantienen extremadamente rentable. Añadir clavue-jev permite que las flotas A100 existentes absorban 3–4 veces más volumen de negocio sin comprar nuevas GPUs.",
      "pt": "A A100 80GB não possui núcleos tensoriais FP8 nativos (usa kernels BF16/W4A16 AWQ/Marlin em vez disso), mas sua largura de banda HBM2e de 2.039 GB/s e preços spot baixos a mantêm extremamente rentável. Adicionar clavue-jev permite que frotas A100 existentes absorvam 3–4 vezes mais volume de negócios sem comprar novas GPUs."
    },
    "bestUse": {
      "en": "Existing enterprise A100 reservations, BF16/AWQ 70B serving, and high-throughput batch evaluation pipelines.",
      "zh": "存量企业 A100 预留实例、BF16/AWQ 70B 服务，以及大批量离线评测任务。",
      "ja": "既存のエンタープライズ A100 リザーブ、BF16/AWQ 70B サービング、および高スループットバッチ評価パイプライン。",
      "ko": "기존 엔터프라이즈 A100 예약, BF16/AWQ 70B 서빙, 고처리량 배치 평가 파이프라인.",
      "de": "Bestehende Unternehmens-A100-Reservierungen, BF16/AWQ 70B-Serving und Hochdurchsatz-Batch-Bewertungspipelines.",
      "fr": "Réservations d'A100 d'entreprise existantes, service BF16/AWQ 70B et pipelines d'évaluation par lots à haut débit.",
      "es": "Reservas empresariales A100 existentes, servicio BF16/AWQ 70B y pipelines de evaluación por lotes de alto rendimiento.",
      "pt": "Reservas empresariais A100 existentes, serviço BF16/AWQ 70B e pipelines de avaliação em lote de alto throughput."
    },
    "futureNote": {
      "en": "Extend existing A100 fleet ROI with Jev traffic shaping; allocate new capex to H200 or B200 for native FP8/FP4.",
      "zh": "用 Jev 流量整形最大化存量 A100 投资回报；新增预算建议投向支持原生 FP8/FP4 的 H200/B200。",
      "ja": "Jev トラフィックシェイピングで既存の A100 フリートの ROI を延伸し、ネイティブ FP8/FP4 に対応する H200 または B200 に新しい CAPEX を割り当てる。",
      "ko": "기존 A100 플릿의 ROI 를 Jev 트래픽 셰이핑으로 확장하고, 네이티브 FP8/FP4 를 위한 H200 또는 B200 에 새로운 CAPEX 를 할당합니다.",
      "de": "ROI bestehender A100-Flotten durch Jev-Traffic-Shaping erweitern; neue CAPEX für native FP8/FP4 auf H200 oder B200 umlegen.",
      "fr": "Étendre le ROI des flottes A100 existantes avec le façonnage du trafic Jev ; allouer le nouveau CAPEX à des H200 ou B200 pour le FP8/FP4 natif.",
      "es": "Extender el ROI de las flotas A100 existentes con la configuración de tráfico Jev; asignar el nuevo CAPEX a H200 o B200 para FP8/FP4 nativo.",
      "pt": "Estender o ROI das frotas A100 existentes com o shaping de tráfego Jev; alocar novo CAPEX para H200 ou B200 para FP8/FP4 nativo."
    },
    "workloads": [
      {
        "model": "Llama-3.3-70B (AWQ Marlin)",
        "engine": "vLLM",
        "decodeTps": "68 tok/s",
        "ttftMs": "135 ms",
        "maxConcurrency": "36 reqs",
        "jevRole": "Multiplies effective cluster capacity by 3.5×"
      },
      {
        "model": "Qwen3-32B (BF16)",
        "engine": "SGLang",
        "decodeTps": "54 tok/s",
        "ttftMs": "120 ms",
        "maxConcurrency": "32 reqs",
        "jevRole": "Routes binary/choice decisions away from BF16"
      }
    ],
    "configLang": "bash",
    "configTitle": "A100 80GB AWQ-Marlin serving command",
    "configCode": "vllm serve hugging-quants/Meta-Llama-3.1-70B-Instruct-AWQ-INT4 \\\n  --quantization awq_marlin \\\n  --dtype float16 \\\n  --gpu-memory-utilization 0.92 \\\n  --max-model-len 32768 \\\n  --enable-prefix-caching"
  },
  {
    "slug": "nvidia-h100-80g-sxm",
    "name": "NVIDIA H100 80GB SXM",
    "vendor": "NVIDIA",
    "tier": "datacenter",
    "arch": "Hopper",
    "vramGb": 80,
    "vramType": "HBM3",
    "bandwidthGbs": 3350,
    "fp8Tflops": 3958,
    "tdpW": 700,
    "interconnect": "NVLink 900 GB/s",
    "typicalCloudUsdHr": "$2.10–$3.20/hr",
    "jevBypassSavings": "79%",
    "heroImage": "/img/guides/gpus-hero.webp",
    "tagline": {
      "en": "Industry-standard FP8 Transformer Engine datacenter GPU for low-latency production LLMs",
      "zh": "工业标准 FP8 Transformer Engine 数据中心卡：低延迟高并发生产首选",
      "ja": "低遅延プロダクションLLM向けの業界標準FP8 Transformer Engine データセンターGPU",
      "ko": "저지연 프로덕션 LLM 을 위한 업계 표준 FP8 Transformer Engine 데이터센터 GPU",
      "de": "Industriestandard-FP8 Transformer Engine Datacenter-GPU für Latenzkritische Produktions-LLMs",
      "fr": "GPU de centre de données à moteur de transformateur FP8 conforme aux normes de l'industrie pour les LLM de production à faible latence",
      "es": "GPU de centro de datos de motor de transformador FP8 estándar de la industria para LLM de producción de baja latencia",
      "pt": "GPU de data center de motor de transformador FP8 padrão da indústria para LLMs de produção de baixa latência"
    },
    "summary": {
      "en": "H100 SXM delivers 3.35 TB/s HBM3 and native FP8 Transformer Engine throughput, powering most global production LLM APIs today. Placing clavue-jev ($0.042/M input tokens) ahead of an H100 pool typically eliminates 75–85% of avoidable GPU burn on classification, routing, and guardrails.",
      "zh": "H100 SXM 提供 3.35 TB/s HBM3 带宽与原生 FP8 算力，是全球生产级大模型 API 的主力底座。在 H100 池前部署 clavue-jev（输入 $0.042/百万 token），通常可砍掉 75–85% 用于分类、路由与安全门控的昂贵 GPU 消耗。",
      "ja": "H100 SXM は、3.35 TB/s の HBM3 とネイティブ FP8 Transformer Engine スループットを提供し、現在世界中の多くのプロダクション LLM API を支えています。clavue-jev（$0.042/M 入力トークン）を H100 プールと比較すると、分類、ルーティング、ガードレールにおける回避可能な GPU 使用量の 75〜85% を削減できます。",
      "ko": "H100 SXM 은 3.35 TB/s 의 HBM3 와 네이티브 FP8 Transformer Engine 처리량을 제공하여 현재 전 세계 대부분의 프로덕션 LLM API 를 구동합니다. clavue-jev ($0.042/M 입력 토큰) 을 H100 풀과 비교하면 분류, 라우팅, 가드레일에서 회피 가능한 GPU 사용량의 75~85% 를 제거할 수 있습니다.",
      "de": "H100 SXM bietet 3,35 TB/s HBM3 und natives FP8 Transformer Engine-Durchsatz, was die meisten globalen Produktions-LLM-APIs heute antreibt. Der Einsatz von clavue-jev ($0.042/M Eingabetokens) vor einem H100-Pool eliminiert typischerweise 75–85% des vermeidbaren GPU-Verbrauchs bei Klassifizierung, Routing und Guardrails.",
      "fr": "L'H100 SXM offre 3,35 TB/s de HBM3 et un débit natif FP8 Transformer Engine, alimentant la plupart des API LLM de production mondiales aujourd'hui. Placer clavue-jev ($0,042/M jetons d'entrée) devant un pool H100 élimine généralement 75 à 85 % de la consommation GPU évitable pour la classification, le routage et les garde-fous.",
      "es": "H100 SXM ofrece 3,35 TB/s de HBM3 y rendimiento nativo FP8 Transformer Engine, impulsando la mayoría de las APIs LLM de producción globales hoy en día. Colocar clavue-jev ($0.042/M tokens de entrada) frente a un grupo H100 elimina típicamente el 75–85 % del consumo de GPU evitable en clasificación, enrutamiento y guardarrails.",
      "pt": "H100 SXM oferece 3,35 TB/s de HBM3 e throughput nativo FP8 Transformer Engine, alimentando a maioria das APIs LLM de produção globais hoje. Posicionar clavue-jev ($0.042/M tokens de entrada) à frente de um pool H100 tipicamente elimina 75–85% do consumo de GPU evitável em classificação, roteamento e guardrails."
    },
    "bestUse": {
      "en": "High-QPS production APIs (70B FP8 on 2×H100, 671B MoE FP8 on 8×H100), real-time coding agents, and latency-critical RAG.",
      "zh": "高 QPS 生产 API（双卡 70B FP8、8 卡 671B MoE FP8）、实时编码 Agent 与低延迟 RAG。",
      "ja": "高 QPS プロダクション API（2×H100 での 70B FP8、8×H100 での 671B MoE FP8）、リアルタイムコーディングエージェント、遅延が重要な RAG。",
      "ko": "고 QPS 프로덕션 API(2×H100 에서 70B FP8, 8×H100 에서 671B MoE FP8), 실시간 코딩 에이전트, 지연 시간이 중요한 RAG.",
      "de": "Hohe-QPS-Produktions-APIs (70B FP8 auf 2×H100, 671B MoE FP8 auf 8×H100), Echtzeit-Coding-Agenten und latenzkritische RAG.",
      "fr": "API de production haute QPS (70B FP8 sur 2×H100, 671B MoE FP8 sur 8×H100), agents de codage en temps réel et RAG critiques en latence.",
      "es": "APIs de producción de alto QPS (70B FP8 en 2×H100, 671B MoE FP8 en 8×H100), agentes de codificación en tiempo real y RAG críticos en latencia.",
      "pt": "APIs de produção de alto QPS (70B FP8 em 2×H100, 671B MoE FP8 em 8×H100), agentes de codificação em tempo real e RAG críticos em latência."
    },
    "futureNote": {
      "en": "Widely available across every global cloud region; compare TCO against H200 when KV cache capacity limits batch size.",
      "zh": "全球云区供给充足；当长上下文 KV Cache 限制批量并发时，可评估升级至 H200。",
      "ja": "世界中のすべてのクラウドリージョンで広く利用可能。バッチサイズが KV キャッシュ容量に制限される場合は、H200 との TCO を比較してください。",
      "ko": "전 세계 모든 클라우드 리전에서 널리 사용 가능. KV 캐시 용량이 배치 크기를 제한할 경우 H200 과 TCO 를 비교하세요.",
      "de": "Überall in globalen Cloud-Regionen verfügbar; vergleichen Sie die TCO mit H200, wenn die KV-Cache-Kapazität die Batch-Größe begrenzt.",
      "fr": "Disponible dans toutes les régions cloud mondiales ; comparez le TCO avec H200 lorsque la capacité du cache KV limite la taille des lots.",
      "es": "Ampliamente disponible en todas las regiones de nube globales; compare el TCO con H200 cuando la capacidad del caché KV limite el tamaño del lote.",
      "pt": "Amplamente disponível em todas as regiões de nuvem globais; compare o TCO com H200 quando a capacidade do cache KV limitar o tamanho do lote."
    },
    "workloads": [
      {
        "model": "Llama-3.3-70B (FP8, 2×H100 TP2)",
        "engine": "SGLang / TensorRT-LLM",
        "decodeTps": "148 tok/s",
        "ttftMs": "62 ms",
        "maxConcurrency": "80 reqs",
        "jevRole": "Offloads 79% decision traffic at $0.042/M tok"
      },
      {
        "model": "DeepSeek-V3 671B (FP8, 8×H100 TP8)",
        "engine": "SGLang DP+EP",
        "decodeTps": "78 tok/s",
        "ttftMs": "140 ms",
        "maxConcurrency": "128 reqs",
        "jevRole": "System One gate prevents unnecessary MoE calls"
      }
    ],
    "configLang": "bash",
    "configTitle": "8×H100 SGLang FP8 cluster launch (with prefix cache)",
    "configCode": "python3 -m sglang.launch_server \\\n  --model-path deepseek-ai/DeepSeek-V3 \\\n  --tp 8 --trust-remote-code \\\n  --host 0.0.0.0 --port 30000 \\\n  --mem-fraction-static 0.88 \\\n  --kv-cache-dtype fp8_e4m3 \\\n  --enable-dp-attention"
  },
  {
    "slug": "nvidia-h200-141g-sxm",
    "name": "NVIDIA H200 141GB SXM",
    "vendor": "NVIDIA",
    "tier": "datacenter",
    "arch": "Hopper",
    "vramGb": 141,
    "vramType": "HBM3e",
    "bandwidthGbs": 4800,
    "fp8Tflops": 3958,
    "tdpW": 700,
    "interconnect": "NVLink 900 GB/s",
    "typicalCloudUsdHr": "$3.20–$4.50/hr",
    "jevBypassSavings": "80%",
    "heroImage": "/img/guides/gpus-hero.webp",
    "tagline": {
      "en": "141GB HBM3e & 4.8 TB/s bandwidth engineered for massive KV caches and 128K–1M long-context serving",
      "zh": "141GB HBM3e 与 4.8 TB/s 超宽带：专为 128K–1M 长上下文与巨量 KV Cache 打造",
      "ja": "大規模な KV キャッシュと 128K–1M の長文脈サービングのために設計された 141GB HBM3e と 4.8 TB/s の帯域幅",
      "ko": "대규모 KV 캐시 및 128K–1M 길어진 컨텍스트 서빙을 위해 설계된 141GB HBM3e 및 4.8 TB/s 대역폭",
      "de": "141GB HBM3e und 4.8 TB/s Bandbreite für massive KV-Caches und 128K–1M lange Kontext-Serving ausgelegt",
      "fr": "141GB HBM3e et 4,8 TB/s de bande passante conçus pour les caches KV massifs et le service de contexte long de 128K à 1M",
      "es": "141GB HBM3e y 4.8 TB/s de ancho de banda diseñados para cachés KV masivas y servicio de contexto largo de 128K–1M",
      "pt": "141GB HBM3e e 4.8 TB/s de largura de banda projetados para caches KV massivos e serviço de contexto longo de 128K–1M"
    },
    "summary": {
      "en": "H200 keeps Hopper software maturity while boosting VRAM by 76% and memory bandwidth by 43% over H100. Single-GPU 70B FP8 runs with massive KV cache headroom; paired with clavue-jev RAG passage filtering, you shrink prompt tokens before they ever hit HBM3e.",
      "zh": "H200 完整继承 Hopper 生态成熟度，同时显存扩容 76%、带宽提升 43%。单卡即可从容承载 70B FP8 及海量并发 KV Cache；前端再叠加 clavue-jev 段落筛选，在进入 HBM3e 前先削减无效上下文 token。",
      "ja": "H200 は Hopper のソフトウェア成熟度を維持しつつ、H100 比で VRAM を 76%、メモリ帯域幅を 43% 向上させます。単一 GPU での 70B FP8 実行では大規模な KV キャッシュの余裕が確保され、clavue-jev RAG パッセージフィルタリングと組み合わせることで、HBM3e に到達する前にプロンプトトークンを削減できます。",
      "ko": "H200 은 Hopper 소프트웨어 성숙도를 유지하면서 H100 대비 VRAM 을 76%, 메모리 대역폭을 43% 향상시킵니다. 단일 GPU 에서 70B FP8 실행 시 대용량 KV 캐시 여유가 확보되며, clavue-jev RAG 패시지 필터링과 결합하여 HBM3 에 도달하기 전에 프롬프트 토큰을 줄일 수 있습니다.",
      "de": "H200 behält die Hopper-Software-Reife bei und steigert den VRAM um 76% sowie die Speicherbandbreite um 43% gegenüber H100. Single-GPU 70B FP8 läuft mit massivem KV-Cache-Puffer; kombiniert mit clavue-jev RAG-Passage-Filtering reduzieren Sie Prompt-Token, bevor sie HBM3e erreichen.",
      "fr": "H200 conserve la maturité logicielle Hopper tout en augmentant la VRAM de 76 % et la bande passante mémoire de 43 % par rapport à H100. L'exécution 70B FP8 en GPU unique dispose d'une marge importante pour le cache KV ; couplé au filtrage de passage RAG clavue-jev, vous réduisez les tokens de prompt avant qu'ils n'atteignent HBM3e.",
      "es": "H200 mantiene la madurez de software Hopper mientras aumenta la VRAM un 76% y el ancho de banda de memoria un 43% respecto a H100. La ejecución 70B FP8 en GPU única cuenta con un margen masivo de caché KV; emparejado con el filtrado de pasajes RAG clavue-jev, reduce los tokens del prompt antes de que lleguen a HBM3e.",
      "pt": "H200 mantém a maturidade de software Hopper enquanto aumenta a VRAM em 76% e a largura de banda de memória em 43% em relação ao H100. A execução 70B FP8 em GPU única opera com margem massiva de cache KV; combinado com o filtragem de passagens RAG clavue-jev, você reduz os tokens do prompt antes que eles cheguem ao HBM3e."
    },
    "bestUse": {
      "en": "Long-context legal/codebase analysis (128K+ prompts), single-card 70B FP8 high-batch serving, and 8×H200 671B MoE fleets.",
      "zh": "长上下文代码库/合同分析（128K+ 提示词）、单卡高并发 70B FP8，以及 8×H200 旗舰 MoE 集群。",
      "ja": "長文脈の法務/コードベース分析（128K+ プロンプト）、シングルカード 70B FP8 高バッチサービング、および 8×H200 671B MoE クラスタ。",
      "ko": "장문맥 법률/코드베이스 분석 (128K+ 프롬프트), 싱글 카드 70B FP8 고 배치 서빙, 및 8×H200 671B MoE 클러스터.",
      "de": "Lange-Kontext-Recht/Codebase-Analyse (128K+ Prompts), Single-Card 70B FP8 High-Batch-Serving und 8×H200 671B MoE-Flotten.",
      "fr": "Analyse juridique/codebase à contexte long (128K+ prompts), service haute charge 70B FP8 sur carte unique, et flottes MoE 8×H200 671B.",
      "es": "Análisis legal/código base de contexto largo (128K+ prompts), servicio de alto lote 70B FP8 en tarjeta única y flotas MoE 8×H200 671B.",
      "pt": "Análise jurídica/código base de contexto longo (128K+ prompts), serviço de alto lote 70B FP8 em cartão único e frotas MoE 8×H200 671B."
    },
    "futureNote": {
      "en": "Drop-in software upgrade from H100 with zero kernel rewrite; best immediate Hopper choice for memory-bound decode.",
      "zh": "相比 H100 零代码平滑升级，是目前解决显存带宽瓶颈见效最快的 Hopper 方案。",
      "ja": "H100 からのドロップインソフトウェアアップグレードでゼロのカーネル書き換えが必要。メモリ制約のあるデコード向けの最適な直近 Hopper チェイス。",
      "ko": "H100 에서의 드롭인 소프트웨어 업그레이드로 커널 재작성이 필요하지 않음. 메모리 제한이 있는 디코딩을 위한 최적의 즉각적인 Hopper 선택.",
      "de": "Drop-in-Software-Upgrade von H100 ohne Kernel-Umschreibung; beste sofortige Hopper-Wahl für speicherbegrenztes Decoding.",
      "fr": "Mise à jour logicielle drop-in depuis H100 sans réécriture de noyau ; meilleur choix Hopper immédiat pour le décodage limité par la mémoire.",
      "es": "Actualización de software drop-in desde H100 sin reescritura de kernels; mejor opción Hopper inmediata para decodificación limitada por memoria.",
      "pt": "Atualização de software drop-in do H100 sem reescrita de kernels; melhor escolha Hopper imediata para decodificação limitada por memória."
    },
    "workloads": [
      {
        "model": "Llama-3.3-70B (FP8, 1×H200)",
        "engine": "vLLM / SGLang",
        "decodeTps": "112 tok/s",
        "ttftMs": "70 ms",
        "maxConcurrency": "96 reqs",
        "jevRole": "Pre-ranks RAG chunks so KV cache serves 3× users"
      },
      {
        "model": "Qwen3-235B-A22B (FP8, 2×H200 TP2)",
        "engine": "SGLang",
        "decodeTps": "165 tok/s",
        "ttftMs": "65 ms",
        "maxConcurrency": "128 reqs",
        "jevRole": "Jev gates tool calls and safety policies"
      }
    ],
    "configLang": "bash",
    "configTitle": "Single H200 141GB high-concurrency 70B FP8 command",
    "configCode": "vllm serve neuralmagic/Llama-3.3-70B-Instruct-FP8-dynamic \\\n  --tensor-parallel-size 1 \\\n  --gpu-memory-utilization 0.93 \\\n  --max-model-len 131072 \\\n  --enable-prefix-caching \\\n  --kv-cache-dtype fp8"
  },
  {
    "slug": "nvidia-b200-192g",
    "name": "NVIDIA B200 192GB",
    "vendor": "NVIDIA",
    "tier": "datacenter",
    "arch": "Blackwell",
    "vramGb": 192,
    "vramType": "HBM3e",
    "bandwidthGbs": 8000,
    "fp8Tflops": 9000,
    "tdpW": 1000,
    "interconnect": "NVLink 5 (1.8 TB/s)",
    "typicalCloudUsdHr": "$4.80–$7.50/hr",
    "jevBypassSavings": "83%",
    "heroImage": "/img/guides/gpus-roadmap.webp",
    "tagline": {
      "en": "8 TB/s HBM3e + hardware NVFP4 datacenter flagship delivering 3–4× Hopper inference throughput",
      "zh": "8 TB/s HBM3e + 硬件 NVFP4 旗舰卡：3–4 倍于 Hopper 的吞吐跃迁",
      "ja": "8 TB/s HBM3e + ハードウェアネイティブ NVFP4 データセンターフラッグシップ、ホッパー推論スループットの 3–4 倍を実現",
      "ko": "8 TB/s HBM3e + 하드웨어 네이티브 NVFP4 데이터센터 플래그십, 호퍼 추론 처리량의 3–4 배 달성",
      "de": "8 TB/s HBM3e + Hardware-Native NVFP4 Datacenter-Flaggschiff, 3–4× Hopper-Inferenz-Durchsatz",
      "fr": "8 TB/s HBM3e + Datacenter flagship natif NVFP4 offrant 3–4× le débit d'inférence Hopper",
      "es": "8 TB/s HBM3e + Datacenter flagship nativo NVFP4 que ofrece 3–4× el rendimiento de inferencia Hopper",
      "pt": "8 TB/s HBM3e + Datacenter flagship nativo NVFP4 que oferece 3–4× o throughput de inferência Hopper"
    },
    "summary": {
      "en": "B200 leaps to 192GB HBM3e at 8 TB/s and native NVFP4 tensor acceleration, allowing an 8×B200 node to serve frontier reasoning & MoE models at blisteringly low cost per generated token. Pairing B200 with clavue-jev reserves costly 1000W silicon strictly for deep reasoning.",
      "zh": "B200 跃升至 192GB HBM3e、8 TB/s 显存带宽与原生 NVFP4 加速，单台 8×B200 节点即可高速承载旗舰推理与超大 MoE 模型。前端配合 clavue-jev，把每瓦 1000W 的顶级算力 100% 留给深度推理而非简单分类。",
      "ja": "B200 は 192GB HBM3e (8 TB/s) とネイティブ NVFP4 テンソルアクセラレーションを実現し、8×B200 ノードで最先端の推論および MoE モデルを極めて低コストで提供可能にします。B200 と clavue-jev の組み合わせにより、高価な 1000W シリコンは深層推論にのみ専念させます。",
      "ko": "B200 은 192GB HBM3e (8 TB/s) 와 네이티브 NVFP4 텐서 가속화를 실현하여 8×B200 노드로 최첨단 추론 및 MoE 모델을 매우 낮은 비용으로 제공할 수 있습니다. B200 과 clavue-jev 의 조합을 통해 고가의 1000W 실리콘은 심층 추론에만 전용되도록 합니다.",
      "de": "B200 springt auf 192GB HBM3e bei 8 TB/s und native NVFP4-Tensor-Beschleunigung, was einem 8×B200-Node ermöglicht, Frontier-Reasoning- und MoE-Modelle bei extrem niedriger Kosten pro generiertem Token zu bedienen. Die Kombination von B200 mit clavue-jev reserviert teure 1000W-Silizium ausschließlich für tiefes Reasoning.",
      "fr": "Le B200 saute à 192GB HBM3e à 8 TB/s et une accélération tensorielle native NVFP4, permettant à un nœud 8×B200 de servir les modèles de raisonnement de pointe et MoE à un coût par token généré extrêmement faible. L'appariement du B200 avec clavue-jev réserve le silicium coûteux de 1000W strictement au raisonnement profond.",
      "es": "El B200 salta a 192GB HBM3e a 8 TB/s y aceleración tensorial nativa NVFP4, permitiendo que un nodo 8×B200 sirva modelos de razonamiento de vanguardia y MoE a un costo por token generado extremadamente bajo. El emparejamiento de B200 con clavue-jev reserva el silicio costoso de 1000W estrictamente para el razonamiento profundo.",
      "pt": "O B200 salta para 192GB HBM3e a 8 TB/s e aceleração tensorial nativa NVFP4, permitindo que um nó 8×B200 sirva modelos de raciocínio de fronteira e MoE a um custo por token gerado extremamente baixo. O emparelhamento de B200 com clavue-jev reserva o silício caro de 1000W estritamente para raciocínio profundo."
    },
    "bestUse": {
      "en": "Global SaaS AI platforms, high-volume reasoning models (DeepSeek-R1 / Qwen3-235B NVFP4), and ultra-low-latency multi-agent systems.",
      "zh": "全球级 SaaS AI 平台、高并发深度推理模型（NVFP4）与超低延迟多 Agent 编排系统。",
      "ja": "グローバル SaaS AI プラットフォーム、高ボリューム推論モデル (DeepSeek-R1 / Qwen3-235B NVFP4)、および超低遅延マルチエージェントシステム。",
      "ko": "글로벌 SaaS AI 플랫폼, 고부하 추론 모델 (DeepSeek-R1 / Qwen3-235B NVFP4), 초저지연 멀티 에이전트 시스템.",
      "de": "Globale SaaS-AI-Plattformen, Hochvolumen-Reasoning-Modelle (DeepSeek-R1 / Qwen3-235B NVFP4) und ultra-niedrige Latenz Multi-Agenten-Systeme.",
      "fr": "Plateformes SaaS AI mondiales, modèles de raisonnement à haut volume (DeepSeek-R1 / Qwen3-235B NVFP4) et systèmes multi-agents à latence ultra-faible.",
      "es": "Plataformas SaaS AI globales, modelos de razonamiento de alto volumen (DeepSeek-R1 / Qwen3-235B NVFP4) y sistemas multiagente de latencia ultra baja.",
      "pt": "Plataformas SaaS AI globais, modelos de raciocínio de alto volume (DeepSeek-R1 / Qwen3-235B NVFP4) e sistemas multiagente de latência ultra baixa."
    },
    "futureNote": {
      "en": "The 2026–2027 gold standard for Tier-1 datacenter serving; adopt TensorRT-LLM / SGLang NVFP4 kernels for full ROI.",
      "zh": "2026–2027 年顶级数据中心推理标杆；建议采用 TensorRT-LLM / SGLang NVFP4 核榨干算力。",
      "ja": "2026–2027 年の Tier-1 データセンターサービスにおけるゴールドスタンダード。完全な ROI 獲得のため、TensorRT-LLM / SGLang NVFP4 カーネルを採用してください。",
      "ko": "2026–2027 년 Tier-1 데이터센터 서비스의 골드 표준. 완전한 ROI 를 위해 TensorRT-LLM / SGLang NVFP4 커널을 채택하세요.",
      "de": "Der Goldstandard für Tier-1 Datacenter-Service 2026–2027; nutzen Sie TensorRT-LLM / SGLang NVFP4-Kernel für volle ROI.",
      "fr": "La norme d'or 2026–2027 pour le service de datacenter Tier-1 ; adoptez les noyaux TensorRT-LLM / SGLang NVFP4 pour un ROI complet.",
      "es": "El estándar de oro 2026–2027 para el servicio de datacenter Tier-1; adopte kernels TensorRT-LLM / SGLang NVFP4 para un ROI completo.",
      "pt": "O padrão ouro 2026–2027 para o serviço de datacenter Tier-1; adote kernels TensorRT-LLM / SGLang NVFP4 para ROI completo."
    },
    "workloads": [
      {
        "model": "DeepSeek-R1 671B (NVFP4, 4×B200)",
        "engine": "TensorRT-LLM / SGLang",
        "decodeTps": "185 tok/s",
        "ttftMs": "85 ms",
        "maxConcurrency": "256 reqs",
        "jevRole": "Skips System Two CoT on 83% direct queries"
      },
      {
        "model": "Qwen3-235B-A22B (FP8, 2×B200)",
        "engine": "SGLang",
        "decodeTps": "260 tok/s",
        "ttftMs": "45 ms",
        "maxConcurrency": "256 reqs",
        "jevRole": "Jev validates structured outputs & guardrails"
      }
    ],
    "configLang": "yaml",
    "configTitle": "TensorRT-LLM NVFP4 config snippet (B200 192GB)",
    "configCode": "backend: trtllm\ntensor_parallel_size: 4\nquantization: nvfp4\nkv_cache_config:\n  dtype: fp8\n  free_gpu_memory_fraction: 0.90\n  enable_block_reuse: true\nscheduler_policy: guaranteed_no_evict\njev_prefilter:\n  endpoint: https://api.jevcode.ai/v1/judge\n  skip_llm_confidence_threshold: 0.90"
  },
  {
    "slug": "nvidia-gb200-nvl72",
    "name": "NVIDIA GB200 NVL72 (Rack-Scale)",
    "vendor": "NVIDIA",
    "tier": "datacenter",
    "arch": "Grace Blackwell",
    "vramGb": 13824,
    "vramType": "HBM3e Coherent Rack",
    "bandwidthGbs": 576000,
    "fp8Tflops": 720000,
    "tdpW": 120000,
    "interconnect": "NVLink 5 Domain (130 TB/s)",
    "typicalCloudUsdHr": "Dedicated cluster / token API",
    "jevBypassSavings": "85%",
    "heroImage": "/img/guides/gpus-roadmap.webp",
    "tagline": {
      "en": "72 Blackwell GPUs in one coherent NVLink domain for disaggregated prefill/decode at hyperscale",
      "zh": "72 颗 Blackwell 统一 NVLink 域：面向超大规模 Prefill/Decode 分离架构",
      "ja": "disaggregated prefill/decode 向けハイパースケール環境で、72 枚の Blackwell GPU を 1 つの統一的な NVLink ドメインに統合",
      "ko": "disaggregated prefill/decode 를 위한 하이퍼스케일 환경에서 72 개의 Blackwell GPU 를 하나의 통합된 NVLink 도메인으로 통합",
      "de": "72 Blackwell-GPUs in einem kohärenten NVLink-Domain für disaggregiertes Prefill/Decode im Hyperscale",
      "fr": "72 GPU Blackwell dans un domaine NVLink cohérent pour le préremplissage/découplage désagrégé à l'échelle hyperscale",
      "es": "72 GPUs Blackwell en un dominio NVLink coherente para prellenado/descodificación desagregada a escala hiperscalable",
      "pt": "72 GPUs Blackwell em um domínio NVLink coerente para pré-preenchimento/descriptografia desagregada em escala hiperscalável"
    },
    "summary": {
      "en": "GB200 NVL72 unifies 72 GPUs and 36 Grace CPUs into a single liquid-cooled exascale inference fabric with disaggregated prefill/decode pools. Even at hyperscale, fronting trillion-parameter expert fleets with clavue-jev System One routing avoids wasting rack-scale power on routine triage.",
      "zh": "GB200 NVL72 将 72 颗 GPU 与 36 颗 Grace CPU 融合为液冷整机柜统一域，专为 Prefill/Decode 分离调度与万亿参数 MoE 优化。即使在超大规模下，用 clavue-jev 做入口流量整形仍能省下巨额机柜级电力与算力开销。",
      "ja": "GB200 NVL72 は、72 枚の GPU と 36 台の Grace CPU を、 disaggregated prefill/decode プールを備えた単一の液体冷却エクサスケール推論ファブリックに統合します。ハイパースケール環境においても、 clavue-jev System One ルーティングによる trillion パラメータの専門家フロートのフロントエンド化により、通常のタスクの選別のためにラックスケールの電力を無駄にすることを回避できます。",
      "ko": "GB200 NVL72 는 72 개의 GPU 와 36 개의 Grace CPU 를 disaggregated prefill/decode 풀을 갖춘 단일 액체 냉각 엑사스케일 추론 패브릭으로 통합합니다. 하이퍼스케일 환경에서도 clavue-jev System One 라우팅을 통해 트릴리온 파라미터 전문가 플릿을 프론트엔딩하여, 일상적인 선별 작업에 랙스케일 전력을 낭비하지 않도록 합니다.",
      "de": "GB200 NVL72 vereinigt 72 GPUs und 36 Grace-CPUs in einer einzigen flüssigkeitsgekühlten Exascale-Inferenz-Fabrik mit disaggregierten Prefill/Decode-Pools. Selbst im Hyperscale vermeidet das Fronten von Trillion-Parameter-Experten-Flotten mit clavue-jev System One Routing, Energie im Rack-Scale für Routine-Triage zu verschwenden.",
      "fr": "GB200 NVL72 unifie 72 GPU et 36 processeurs Grace dans un seul tissu d'inférence exascale refroidi par liquide avec des pools de préremplissage/découplage désagrégés. Même à l'échelle hyperscale, le routage clavue-jev System One évite de gaspiller la puissance rack-scale sur la triage routinière en plaçant des flottes d'experts de trillions de paramètres en avant.",
      "es": "GB200 NVL72 unifica 72 GPUs y 36 CPUs Grace en un único tejido de inferencia exascale refrigerado por líquido con pools de prellenado/descodificación desagregados. Incluso a escala hiperscalable, el enrutamiento clavue-jev System One evita desperdiciar energía a escala de rack en la triage rutinaria al poner flotas de expertos de billones de parámetros al frente.",
      "pt": "GB200 NVL72 unifica 72 GPUs e 36 CPUs Grace em um único tecido de inferência exascale refrigerado a líquido com pools de pré-preenchimento/descriptografia desagregados. Mesmo em escala hiperscalável, o roteamento clavue-jev System One evita desperdiçar energia em escala de rack na triagem rotineira ao colocar frotas de especialistas de trilhões de parâmetros na frente."
    },
    "bestUse": {
      "en": "Hyperscalers, frontier AI labs, and global inference providers running >500B–2T parameter MoE models with strict SLOs.",
      "zh": "超大规模云厂商、前沿模型实验室及全球高 SLO 的 500B–2T 参数 MoE 推理集群。",
      "ja": "500B–2T パラメータの MoE モデルを厳格な SLO で実行するハイパースケール事業者、フロンティア AI ラボ、およびグローバル推論プロバイダー向け。",
      "ko": "500B–2T 파라미터 MoE 모델을 엄격한 SLO 로 실행하는 하이퍼스케일러, 프론티어 AI 연구소, 글로벌 추론 제공업체용.",
      "de": "Für Hyperscaler, Frontier-AI-Labore und globale Inferenz-Anbieter, die MoE-Modelle mit >500B–2T Parametern unter strengen SLOs betreiben.",
      "fr": "Pour les hyperscaleurs, les laboratoires d'IA de pointe et les fournisseurs d'inférence mondiaux exécutant des modèles MoE de >500B–2T paramètres avec des SLO stricts.",
      "es": "Para hiperscalers, laboratorios de IA de frontera y proveedores de inferencia global ejecutando modelos MoE de >500B–2T parámetros con SLOs estrictos.",
      "pt": "Para hiperscalers, laboratórios de IA de fronteira e provedores de inferência global executando modelos MoE de >500B–2T parâmetros com SLOs rigorosos."
    },
    "futureNote": {
      "en": "Directly sets the architectural template for GB300 NVL72 and Rubin NVL144 liquid-cooled deployments.",
      "zh": "直接奠定后续 GB300 NVL72 与 Rubin NVL144 整机柜液冷部署的标准蓝图。",
      "ja": "GB300 NVL72 および Rubin NVL144 液体冷却デプロイメントのアーキテクチャテンプレートに直接設定されます。",
      "ko": "GB300 NVL72 및 Rubin NVL144 액체 냉각 배포의 아키텍처 템플릿을 직접 설정합니다.",
      "de": "Setzt direkt das architektonische Template für GB300 NVL72 und Rubin NVL144 flüssigkeitsgekühlte Bereitstellungen.",
      "fr": "Définit directement le modèle architectural pour les déploiements refroidis par liquide GB300 NVL72 et Rubin NVL144.",
      "es": "Establece directamente la plantilla arquitectónica para los despliegues refrigerados por líquido GB300 NVL72 y Rubin NVL144.",
      "pt": "Define diretamente o modelo arquitetônico para implantações refrigeradas a líquido GB300 NVL72 e Rubin NVL144."
    },
    "workloads": [
      {
        "model": "Frontier MoE 671B–1T+ (NVFP4, EP32/EP64)",
        "engine": "Dynamo / SGLang Disaggregated",
        "decodeTps": "320+ tok/s/user",
        "ttftMs": "50 ms",
        "maxConcurrency": "2,000+ reqs",
        "jevRole": "Edge System One traffic shaping & SLA routing"
      }
    ],
    "configLang": "yaml",
    "configTitle": "Disaggregated Prefill / Decode + Jev edge router topology",
    "configCode": "topology:\n  edge_gate:\n    provider: jevcode\n    model: clavue-jev\n    endpoint: https://api.jevcode.ai/v1/judge\n    budget_ms: 90\n  prefill_pool:\n    nodes: 4x_gb200_compute_trays\n    role: context_ingestion_and_kv_transfer\n  decode_pool:\n    nodes: 14x_gb200_compute_trays\n    quantization: nvfp4\n    expert_parallel: 64"
  },
  {
    "slug": "amd-mi300x-192g",
    "name": "AMD Instinct MI300X 192GB",
    "vendor": "AMD",
    "tier": "datacenter",
    "arch": "CDNA 3",
    "vramGb": 192,
    "vramType": "HBM3",
    "bandwidthGbs": 5300,
    "fp8Tflops": 5220,
    "tdpW": 750,
    "interconnect": "Infinity Fabric 896 GB/s",
    "typicalCloudUsdHr": "$1.90–$2.90/hr",
    "jevBypassSavings": "78%",
    "heroImage": "/img/guides/gpus-hero.webp",
    "tagline": {
      "en": "192GB HBM3 & 5.3 TB/s ROCm powerhouse fitting 70B BF16 or 235B MoE on fewer GPUs",
      "zh": "192GB HBM3 + 5.3 TB/s ROCm 猛兽：更少卡数装下 70B BF16 与 235B MoE",
      "ja": "192GB HBM3 と 5.3 TB/s ROCm パワーハブ。70B BF16 または 235B MoE をより少ない GPU で実行可能",
      "ko": "192GB HBM3 및 5.3 TB/s ROCm 파워하우스. 70B BF16 또는 235B MoE 를 더 적은 GPU 에서 실행 가능",
      "de": "192GB HBM3 und 5.3 TB/s ROCm Powerhouse. Läuft 70B BF16 oder 235B MoE auf weniger GPUs",
      "fr": "192GB HBM3 et 5.3 TB/s ROCm : une puissance capable d'exécuter 70B BF16 ou 235B MoE sur moins de GPU",
      "es": "192GB HBM3 y 5.3 TB/s ROCm: potencia capaz de ejecutar 70B BF16 o 235B MoE en menos GPUs",
      "pt": "192GB HBM3 e 5.3 TB/s ROCm: poder capaz de executar 70B BF16 ou 235B MoE em menos GPUs"
    },
    "summary": {
      "en": "MI300X packs 192GB HBM3 per card with mature vLLM and SGLang ROCm support, frequently beating H100 on VRAM-per-dollar for dense 70B BF16 and large MoE serving. Pairing MI300X with clavue-jev delivers a resilient multi-vendor inference stack.",
      "zh": "MI300X 单卡提供 192GB HBM3 显存且已获 vLLM 与 SGLang ROCm 原生支持，在单卡显存性价比上极具优势。结合 clavue-jev 可构建不锁定单一硬件厂商的高韧性推理架构。",
      "ja": "MI300X はカードあたり 192GB HBM3 を搭載し、成熟した vLLM と SGLang ROCm サポートを備えています。VRAM 単価性能において H100 を凌駕し、特に 70B BF16 の高密度モデルおよび大規模 MoE の推論で優位性を発揮します。MI300X と clavue-jev を組み合わせることで、堅牢なマルチベンダー推論スタックを実現します。",
      "ko": "MI300X 는 카드당 192GB HBM3 을 탑재하며 성숙한 vLLM 과 SGLang ROCm 지원 기능을 갖추고 있습니다. VRAM 당 가격 대비 성능에서 H100 을 능가하며, 특히 70B BF16 고밀도 모델 및 대규모 MoE 서비스에서 우위를 점합니다. MI300X 와 clavue-jev 를 결합하면 견고한 다중 벤더 추론 스택을 구축할 수 있습니다.",
      "de": "MI300X bietet pro Karte 192GB HBM3 mit ausgereifter vLLM- und SGLang ROCm-Unterstützung. Er übertrifft den H100 häufig im VRAM-per-Dollar-Verhältnis für dichte 70B BF16-Modelle und große MoE-Services. Die Kombination von MI300X mit clavue-jev liefert eine robuste Multi-Vendor-Inferenz-Stack.",
      "fr": "MI300X intègre 192GB HBM3 par carte avec un support mature de vLLM et SGLang ROCm, surpassant souvent le H100 en VRAM par dollar pour les modèles denses 70B BF16 et les grands services MoE. L'association de MI300X avec clavue-jev offre une pile d'inférence multi-fournisseurs résiliente.",
      "es": "MI300X incluye 192GB HBM3 por tarjeta con soporte maduro de vLLM y SGLang ROCm, superando frecuentemente al H100 en VRAM por dólar para modelos densos 70B BF16 y grandes servicios MoE. La combinación de MI300X con clavue-jev ofrece una pila de inferencia multi-proveedor resiliente.",
      "pt": "MI300X inclui 192GB HBM3 por cartão com suporte maduro a vLLM e SGLang ROCm, superando frequentemente o H100 em VRAM por dólar para modelos densos 70B BF16 e grandes serviços MoE. A combinação de MI300X com clavue-jev oferece uma pilha de inferência multi-fornecedor resiliente."
    },
    "bestUse": {
      "en": "Cost-optimized cloud inference on Azure/OCI/DigitalOcean/TensorWave, single-card 70B BF16, and vendor-diversified AI infrastructure.",
      "zh": "追求显存性价比的云端部署、单卡 70B BF16 推理，以及多硬件供应商容灾集群。",
      "ja": "Azure/OCI/DigitalOcean/TensorWave におけるコスト最適化されたクラウド推論、シングルカード 70B BF16、およびベンダー多様化された AI インフラストラクチャ。",
      "ko": "Azure/OCI/DigitalOcean/TensorWave 에서 비용 최적화된 클라우드 추론, 싱글 카드 70B BF16, 그리고 벤더 다양화 AI 인프라.",
      "de": "Kostenoptimierte Cloud-Inferenz auf Azure/OCI/DigitalOcean/TensorWave, Single-Card 70B BF16 und vendor-diversifizierte AI-Infrastruktur.",
      "fr": "Inférence cloud optimisée sur Azure/OCI/DigitalOcean/TensorWave, 70B BF16 sur une seule carte, et infrastructure IA diversifiée par fournisseur.",
      "es": "Inferencia en la nube optimizada en Azure/OCI/DigitalOcean/TensorWave, 70B BF16 en una sola tarjeta e infraestructura de IA diversificada por proveedor.",
      "pt": "Inferência em nuvem otimizada no Azure/OCI/DigitalOcean/TensorWave, 70B BF16 em um único cartão e infraestrutura de IA diversificada por fornecedor."
    },
    "futureNote": {
      "en": "ROCm 6.3+ & AITER kernels closed most FP8 performance gaps; smooth upgrade path to MI325X and MI355X.",
      "zh": "ROCm 6.3+ 与 AITER 算子已大幅拉近 FP8 效能，可平滑演进至 MI325X 与 MI355X。",
      "ja": "ROCm 6.3+ と AITER カーネルにより、FP8 パフォーマンスの大部分のギャップが埋められた。MI325X と MI355X へのスムーズなアップグレードパス。",
      "ko": "ROCm 6.3+ 및 AITER 커널이 FP8 성능 격차의 대부분을 해소했습니다. MI325X 및 MI355X 로의 원활한 업그레이드 경로.",
      "de": "ROCm 6.3+ und AITER-Kernels schlossen die meisten FP8-Leistungslücken; glatter Upgrade-Pfad zu MI325X und MI355X.",
      "fr": "ROCm 6.3+ et noyaux AITER ont comblé la plupart des écarts de performance FP8 ; voie d'amélioration fluide vers MI325X et MI355X.",
      "es": "ROCm 6.3+ y kernels AITER han cerrado la mayoría de las brechas de rendimiento FP8; camino de actualización suave hacia MI325X y MI355X.",
      "pt": "ROCm 6.3+ e kernels AITER fecharam a maioria das lacunas de desempenho FP8; caminho de atualização suave para MI325X e MI355X."
    },
    "workloads": [
      {
        "model": "Llama-3.3-70B (BF16, 1×MI300X)",
        "engine": "vLLM ROCm",
        "decodeTps": "88 tok/s",
        "ttftMs": "85 ms",
        "maxConcurrency": "64 reqs",
        "jevRole": "Offloads structured classification before GPU"
      },
      {
        "model": "Qwen3-235B-A22B (FP8, 2×MI300X)",
        "engine": "SGLang ROCm",
        "decodeTps": "140 tok/s",
        "ttftMs": "90 ms",
        "maxConcurrency": "96 reqs",
        "jevRole": "Jev gates tool routing & compliance checks"
      }
    ],
    "configLang": "bash",
    "configTitle": "vLLM ROCm Docker deployment (AMD MI300X 192GB)",
    "configCode": "docker run --rm --device=/dev/kfd --device=/dev/dri \\\n  --group-add video --ipc=host --shm-size 32g \\\n  -p 8000:8000 rocm/vllm:latest \\\n  vllm serve Qwen/Qwen3-32B \\\n  --dtype bfloat16 --gpu-memory-utilization 0.92 --max-model-len 65536"
  },
  {
    "slug": "amd-mi325x-256g",
    "name": "AMD Instinct MI325X 256GB",
    "vendor": "AMD",
    "tier": "datacenter",
    "arch": "CDNA 3 (HBM3e)",
    "vramGb": 256,
    "vramType": "HBM3e",
    "bandwidthGbs": 6000,
    "fp8Tflops": 5220,
    "tdpW": 1000,
    "interconnect": "Infinity Fabric 896 GB/s",
    "typicalCloudUsdHr": "$2.80–$4.20/hr",
    "jevBypassSavings": "80%",
    "heroImage": "/img/guides/gpus-roadmap.webp",
    "tagline": {
      "en": "256GB HBM3e single-GPU capacity giant built for massive batch sizes and long-context MoE",
      "zh": "单卡 256GB HBM3e 容量之王：单机 2TB 显存从容应对海量多租户上下文",
      "ja": "大規模バッチ処理と長文脈 MoE に最適化された、256GB HBM3e 単一 GPU 容量の巨匠",
      "ko": "대규모 배치 처리 및 긴 컨텍스트 MoE 를 위한 256GB HBM3e 단일 GPU 용량의 거대 시스템",
      "de": "Riesige Single-GPU-Kapazität mit 256GB HBM3e für massive Batch-Größen und lange Kontext-MoE",
      "fr": "Géant de capacité GPU unique avec 256GB HBM3e conçu pour les lots massifs et le MoE à contexte long",
      "es": "Gigante de capacidad de GPU único de 256GB HBM3e diseñado para lotes masivos y MoE de contexto largo",
      "pt": "Gigante de capacidade de GPU único de 256GB HBM3e construído para lotes massivos e MoE de contexto longo"
    },
    "summary": {
      "en": "With 256GB HBM3e and 6 TB/s memory bandwidth per accelerator, an 8×MI325X server offers 2 TB of coherent GPU memory—handling huge multi-tenant KV caches effortlessly while clavue-jev strips low-value routing calls off the main pipeline.",
      "zh": "MI325X 单卡拥有 256GB HBM3e 与 6 TB/s 带宽，8 卡整机即达 2TB 显存容量，轻松承载超大批量与长上下文 KV Cache；前端再配合 clavue-jev 剥离高频结构化判定流量。",
      "ja": "256GB の HBM3e と各アクセラレータあたり 6 TB/s のメモリ帯域幅を備えた 8×MI325X サーバーは、2 TB の一貫性のある GPU メモリを提供し、大規模なマルチテナント KV キャッシュを容易に処理します。clavue-jev は、メインパイプラインから低価値なルーティング呼び出しをフィルタリングします。",
      "ko": "256GB HBM3e 와 각 가속기당 6 TB/s 의 메모리 대역폭을 갖춘 8×MI325X 서버는 2 TB 의 일관성 있는 GPU 메모리를 제공하여 거대한 멀티 테넌트 KV 캐시를 원활하게 처리하며, clavue-jev 는 메인 파이프라인에서 저가치 라우팅 호출을 제거합니다.",
      "de": "Mit 256GB HBM3e und 6 TB/s Speicherbandbreite pro Beschleuniger bietet ein 8×MI325X-Server 2 TB kohärenten GPU-Speicher – er bewältigt riesige Multi-Tenant-KV-Caches mühelos, während clavue-jev unwichtige Routing-Aufrufe aus dem Hauptpipeline filtert.",
      "fr": "Avec 256GB HBM3e et 6 TB/s de bande passante mémoire par accélérateur, un serveur 8×MI325X offre 2 To de mémoire GPU cohérente – gérant sans effort d'énormes caches KV multi-locataires, tandis que clavue-jev élimine les appels de routage à faible valeur du pipeline principal.",
      "es": "Con 256GB HBM3e y 6 TB/s de ancho de banda de memoria por acelerador, un servidor 8×MI325X ofrece 2 TB de memoria GPU coherente, manejando sin esfuerzo enormes cachés KV multiinquilinos mientras clavue-jev elimina las llamadas de enrutamiento de bajo valor del pipeline principal.",
      "pt": "Com 256GB HBM3e e 6 TB/s de largura de banda de memória por acelerador, um servidor 8×MI325X oferece 2 TB de memória GPU coerente, lidando facilmente com enormes caches KV multiinquilinos enquanto o clavue-jev remove chamadas de roteamento de baixo valor do pipeline principal."
    },
    "bestUse": {
      "en": "Memory-capacity-bound enterprise clusters, single-card 235B FP8 MoE hosting, and ultra-long-context document intelligence.",
      "zh": "显存容量受限的企业集群、单卡 235B FP8 MoE 推理及超长文档智能分析。",
      "ja": "メモリ容量に制約されるエンタープライズクラスター、シングルカード 235B FP8 MoE ホスティング、および超長文脈ドキュメントインテリジェンス。",
      "ko": "메모리 용량에 제한받는 엔터프라이즈 클러스터, 단일 카드 235B FP8 MoE 호스팅, 초장문맥 문서 지능.",
      "de": "Speicherkapazitätsbegrenzte Unternehmenscluster, Single-Card-235B-FP8-MoE-Hosting und Ultra-Lang-Kontext-Dokumentenintelligenz.",
      "fr": "Clusters d'entreprise limités par la capacité mémoire, hébergement MoE 235B FP8 sur carte unique, et intelligence de documents à contexte ultra-long.",
      "es": "Clusters empresariales limitados por capacidad de memoria, alojamiento MoE 235B FP8 en una sola tarjeta e inteligencia de documentos de contexto ultra largo.",
      "pt": "Clusters empresariais limitados por capacidade de memória, hospedagem MoE 235B FP8 em placa única e inteligência de documentos de contexto ultra longo."
    },
    "futureNote": {
      "en": "Drop-in successor to MI300X servers; watch MI355X (CDNA 4, FP4/FP6) for next-wave AMD compute density.",
      "zh": "与 MI300X 平台兼容平滑升级；下一代可重点关注支持 FP4/FP6 的 CDNA 4 MI355X。",
      "ja": "MI300X サーバーのドロップイン後継機。次世代の AMD 計算密度については、MI355X（CDNA 4、FP4/FP6）を注視してください。",
      "ko": "MI300X 서버의 플러그인 후속 모델; 다음 세대 AMD 컴퓨팅 밀도에는 MI355X(CDNA 4, FP4/FP6) 를 주목하세요.",
      "de": "Drop-in-Nachfolger von MI300X-Servern; achten Sie auf MI355X (CDNA 4, FP4/FP6) für die nächste Welle der AMD-Rechenleistungsdichte.",
      "fr": "Successeur drop-in des serveurs MI300X ; surveillez le MI355X (CDNA 4, FP4/FP6) pour la prochaine vague de densité de calcul AMD.",
      "es": "Sucesor drop-in de los servidores MI300X; vigile el MI355X (CDNA 4, FP4/FP6) para la próxima ola de densidad de cálculo de AMD.",
      "pt": "Sucessor drop-in dos servidores MI300X; acompanhe o MI355X (CDNA 4, FP4/FP6) para a próxima onda de densidade de computação da AMD."
    },
    "workloads": [
      {
        "model": "Qwen3-235B-A22B (FP8, 1×MI325X)",
        "engine": "SGLang ROCm",
        "decodeTps": "92 tok/s",
        "ttftMs": "95 ms",
        "maxConcurrency": "64 reqs",
        "jevRole": "Eliminates 80% avoidable MoE activations"
      },
      {
        "model": "DeepSeek-V3 671B (FP8, 4×MI325X)",
        "engine": "vLLM / SGLang ROCm",
        "decodeTps": "86 tok/s",
        "ttftMs": "130 ms",
        "maxConcurrency": "128 reqs",
        "jevRole": "System One gate enforces SLA & safety"
      }
    ],
    "configLang": "bash",
    "configTitle": "4×MI325X 1TB-VRAM FP8 MoE deployment",
    "configCode": "python3 -m sglang.launch_server \\\n  --model-path deepseek-ai/DeepSeek-V3 \\\n  --tp 4 --trust-remote-code \\\n  --host 0.0.0.0 --port 30000 \\\n  --mem-fraction-static 0.90 \\\n  --context-length 131072"
  },
  {
    "slug": "next-gen-b300-rubin-roadmap",
    "name": "2026–2027+ Future Roadmap: B300 Ultra (288GB) & Rubin (HBM4)",
    "vendor": "Future Roadmap",
    "tier": "roadmap",
    "arch": "Blackwell Ultra / Vera Rubin / CDNA 4",
    "vramGb": 288,
    "vramType": "HBM3e 12-Hi → HBM4",
    "bandwidthGbs": 13000,
    "fp8Tflops": 15000,
    "tdpW": 1400,
    "interconnect": "NVLink 5 / 6 + Co-Packaged Optics",
    "typicalCloudUsdHr": "2026H2–2027+ Capacity Plan",
    "jevBypassSavings": "85%",
    "heroImage": "/img/guides/gpus-roadmap.webp",
    "tagline": {
      "en": "Future-proof capacity planning: 288GB HBM3e, HBM4 Rubin, NVFP4, and why System One + System Two wins every generation",
      "zh": "2026–2027+ 未来算力规划：B300 (288GB)、Rubin (HBM4)、NVFP4 与跨代稳赢的双系统架构",
      "ja": "将来を見据えた容量計画：288GB HBM3e、HBM4 Rubin、NVFP4、そして System One + System Two がなぜ各世代を制覇するか",
      "ko": "미래 지향적인 용량 계획: 288GB HBM3e, HBM4 Rubin, NVFP4, 그리고 System One + System Two 가 왜 모든 세대를 이끄는지",
      "de": "Zukunftssichere Kapazitätsplanung: 288GB HBM3e, HBM4 Rubin, NVFP4 und warum System One + System Two jede Generation gewinnt",
      "fr": "Planification de capacité à l'épreuve du futur : 288GB HBM3e, HBM4 Rubin, NVFP4, et pourquoi System One + System Two gagne chaque génération",
      "es": "Planificación de capacidad a prueba del futuro: 288GB HBM3e, HBM4 Rubin, NVFP4, y por qué System One + System Two gana cada generación",
      "pt": "Planeamento de capacidade à prova do futuro: 288GB HBM3e, HBM4 Rubin, NVFP4, e por que System One + System Two vence todas as gerações"
    },
    "summary": {
      "en": "Next-generation accelerators—NVIDIA Blackwell Ultra B300 (288GB HBM3e), Vera Rubin (HBM4, 13+ TB/s), and AMD MI355X (288GB HBM3e, FP4)—push rack power past 120–250 kW and prioritize ultra-dense reasoning compute. The durable architectural rule across every future hardware generation is decoupling: run deterministic sub-100ms System One decisions on clavue-jev, and keep expensive System Two GPU capacity strictly for deep generation and reasoning.",
      "zh": "下一代旗舰卡——NVIDIA Blackwell Ultra B300（288GB HBM3e）、Vera Rubin（HBM4，13+ TB/s 带宽）与 AMD MI355X（288GB HBM3e，原生 FP4）将把单机柜功耗推向 120–250 kW 并聚焦深度推理算力。跨越多代硬件演进始终不变的架构铁律是「双系统解耦」：把百毫秒结构化 System One 决策交给 clavue-jev，把昂贵的 System Two GPU 集群留给真正的复杂推理与生成。",
      "ja": "次世代アクセラレータ——NVIDIA Blackwell Ultra B300（288GB HBM3e）、Vera Rubin（HBM4、13+ TB/s）、AMD MI355X（288GB HBM3e、FP4）——ラック電力を 120–250 kW 超えに押し上げ、超高密度な推論計算を優先します。あらゆる将来のハードウェア世代にわたる堅牢なアーキテクチャの法則は「分離」です：clavue-jev で決定論的な sub-100ms の System One 決定を実行し、高価な System Two GPU 容量は深層生成と推論に厳格に割り当てます。",
      "ko": "次세대 가속기——NVIDIA Blackwell Ultra B300 (288GB HBM3e), Vera Rubin (HBM4, 13+ TB/s), AMD MI355X (288GB HBM3e, FP4)——랙 전력을 120–250 kW 이상으로 밀고 초고밀도 추론 컴퓨팅을 우선시합니다. 모든 미래 하드웨어 세대에 걸친 견고한 아키텍처 규칙은 '분리'입니다: clavue-jev 에서 결정론적 sub-100ms System One 결정을 실행하고, 고가의 System Two GPU 용량을 엄격하게 깊은 생성 및 추론에 할당합니다.",
      "de": "Nächste-Generation-Acceleratoren—NVIDIA Blackwell Ultra B300 (288GB HBM3e), Vera Rubin (HBM4, 13+ TB/s), AMD MI355X (288GB HBM3e, FP4)—drücken die Rack-Leistung über 120–250 kW und priorisieren ultra-dichte Inferenz-Berechnung. Die robuste architektonische Regel über alle zukünftigen Hardware-Generationen hinweg ist die Entkopplung: führen Sie deterministische sub-100ms System One-Entscheidungen auf clavue-jev aus und halten Sie die teure System Two GPU-Kapazität strikt für tiefe Generierung und Inferenz.",
      "fr": "Les accélérateurs de nouvelle génération—NVIDIA Blackwell Ultra B300 (288GB HBM3e), Vera Rubin (HBM4, 13+ TB/s), AMD MI355X (288GB HBM3e, FP4)—poussent la puissance des racks au-delà de 120–250 kW et priorisent le calcul d'inférence ultra-dense. La règle architecturale durable à travers chaque génération matérielle future est le découplage : exécutez des décisions déterministes sub-100ms System One sur clavue-jev, et gardez la capacité GPU System Two coûteuse strictement pour la génération profonde et l'inférence.",
      "es": "Aceleradores de próxima generación—NVIDIA Blackwell Ultra B300 (288GB HBM3e), Vera Rubin (HBM4, 13+ TB/s), AMD MI355X (288GB HBM3e, FP4)—empujan la potencia del rack por encima de 120–250 kW y priorizan el cálculo de inferencia ultra denso. La regla arquitectónica duradera a través de cada generación futura de hardware es el desacoplamiento: ejecute decisiones deterministas sub-100ms System One en clavue-jev, y mantenga la capacidad GPU System Two costosa estrictamente para generación profunda e inferencia.",
      "pt": "Aceleradores de próxima geração—NVIDIA Blackwell Ultra B300 (288GB HBM3e), Vera Rubin (HBM4, 13+ TB/s), AMD MI355X (288GB HBM3e, FP4)—empurram a potência do rack para além de 120–250 kW e priorizam o cálculo de inferência ultra denso. A regra arquitetónica duradoura através de cada geração futura de hardware é o desacoplamento: execute decisões deterministas sub-100ms System One no clavue-jev, e mantenha a capacidade GPU System Two cara estritamente para geração profunda e inferência."
    },
    "bestUse": {
      "en": "CTOs and ML infra architects planning 12–36 month GPU procurement, cloud commitments, power budgets, and vendor-agnostic routing layers.",
      "zh": "CTO 与 AI 基础设施架构师制定未来 12–36 个月显卡采购、云包年承诺、液冷机柜预算与硬件无关路由层规划。",
      "ja": "12–36 ヶ月の GPU 調達、クラウドコミットメント、電力予算、ベンダー非依存ルーティング層を計画する CTO および ML インフラアーキテクト向け。",
      "ko": "12–36 개월 GPU 조달, 클라우드 커밋, 전력 예산, 벤더 중립 라우팅 계층을 계획하는 CTO 와 ML 인프라 아키텍트용.",
      "de": "Für CTOs und ML-Infra-Architekten, die 12–36 Monate GPU-Beschaffung, Cloud-Engagements, Strombudgets und vendor-agnostische Routing-Ebenen planen.",
      "fr": "Pour les CTO et architectes d'infrastructure ML planifiant l'acquisition GPU sur 12–36 mois, les engagements cloud, les budgets électriques et les couches de routage agnostiques aux fournisseurs.",
      "es": "Para CTOs y arquitectos de infraestructura ML planificando adquisición de GPU de 12–36 meses, compromisos en la nube, presupuestos de energía y capas de enrutamiento agnósticas a proveedores.",
      "pt": "Para CTOs e arquitetos de infraestrutura ML a planear aquisição de GPU de 12–36 meses, compromissos na nuvem, orçamentos de energia e camadas de roteamento agnósticas a fornecedores."
    },
    "futureNote": {
      "en": "Design your application around a clean HTTP decision contract (/v1/judge) + OpenAI-compatible LLM pool so swapping H200 → B200 → B300 → Rubin requires zero app code changes.",
      "zh": "应用层坚持面向标准判定契约（/v1/judge）与 OpenAI 兼容模型池解耦，未来从 H200 → B200 → B300 → Rubin 换代零代码改造。",
      "ja": "アプリケーションをクリーンな HTTP 決定契約（/v1/judge）+ OpenAI 互換 LLM プールを周りに設計し、H200 → B200 → B300 → Rubin の切り替えにゼロのアプリケーションコード変更を必要とします。",
      "ko": "애플리케이션을 깔끔한 HTTP 결정 계약 (/v1/judge) + OpenAI 호환 LLM 풀을 중심으로 설계하여 H200 → B200 → B300 → Rubin 전환 시 애플리케이션 코드 변경이 전혀 필요 없도록 하세요.",
      "de": "Entwerfen Sie Ihre Anwendung um einen sauberen HTTP-Entscheidungsvertrag (/v1/judge) + OpenAI-kompatiblen LLM-Pool, sodass der Wechsel von H200 → B200 → B300 → Rubin keine App-Code-Änderungen erfordert.",
      "fr": "Concevez votre application autour d'un contrat de décision HTTP propre (/v1/judge) + un pool LLM compatible OpenAI, afin que le remplacement H200 → B200 → B300 → Rubin nécessite zéro changement de code d'application.",
      "es": "Diseñe su aplicación alrededor de un contrato de decisión HTTP limpio (/v1/judge) + un pool de LLM compatible con OpenAI para que el cambio de H200 → B200 → B300 → Rubin requiera cero cambios de código de aplicación.",
      "pt": "Projete a sua aplicação em torno de um contrato de decisão HTTP limpo (/v1/judge) + um pool de LLM compatível com OpenAI para que a troca de H200 → B200 → B300 → Rubin exija zero alterações de código de aplicação."
    },
    "workloads": [
      {
        "model": "Blackwell Ultra B300 (288GB HBM3e, NVFP4)",
        "engine": "TensorRT-LLM / Dynamo",
        "decodeTps": "240–350 tok/s",
        "ttftMs": "<45 ms",
        "maxConcurrency": "512 reqs",
        "jevRole": "Hardware-agnostic routing shields apps from GPU churn"
      },
      {
        "model": "AMD MI355X (288GB HBM3e, FP4/FP6)",
        "engine": "vLLM / SGLang ROCm",
        "decodeTps": "210–300 tok/s",
        "ttftMs": "<55 ms",
        "maxConcurrency": "400 reqs",
        "jevRole": "Enables seamless NVIDIA/AMD multi-cloud arbitrage"
      },
      {
        "model": "Vera Rubin R100 / NVL144 (HBM4, 2027+)",
        "engine": "Disaggregated Prefill/Decode",
        "decodeTps": "500+ tok/s (est.)",
        "ttftMs": "<30 ms (est.)",
        "maxConcurrency": "4,000+ reqs",
        "jevRole": "Keeps 85% deterministic logic off high-TDP racks"
      }
    ],
    "configLang": "yaml",
    "configTitle": "Future-proof multi-generation inference router policy (2026–2028)",
    "configCode": "# Hardware-agnostic dual-system routing policy\nrouting:\n  system_one:\n    provider: jevcode\n    model: clavue-jev\n    endpoint: https://api.jevcode.ai/v1/judge\n    timeout_ms: 1500\n    auto_handle_confidence: 0.90\n  system_two_pools:\n    - name: economy-tier\n      hardware: [rtx-5090, l40s, mi300x]\n      models: [qwen3-32b-fp8, qwen3-coder-30b]\n      route_when: complexity == \"medium\"\n    - name: frontier-tier\n      hardware: [h200, b200, b300, rubin]\n      models: [deepseek-r1-nvfp4, qwen3-235b]\n      route_when: complexity == \"high\" || confidence < 0.70"
  }
];
