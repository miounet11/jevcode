// 由 scripts/gen-models.mjs 从推理端点 /v1/models 抓取生成，请勿手改。
// 数据来源：本地推理服务（OpenAI 兼容）实际返回的模型清单。
// 抓取时间以脚本运行时为准；此处只记录 id 与能力开关，不含任何性能宣称。

export interface ModelEntry {
  id: string;
  caps: string[];
}

export const models: ModelEntry[] = [
  {
    "id": "PaddleOCR-VL-1.6-0.9B",
    "caps": [
      "chat_completion",
      "completion",
      "vision"
    ]
  },
  {
    "id": "api-clavuej-2b-v38-last",
    "caps": []
  },
  {
    "id": "bge-m3",
    "caps": [
      "chat_completion",
      "completion"
    ]
  },
  {
    "id": "clavue-2-ai",
    "caps": [
      "chat_completion",
      "completion",
      "function_calling",
      "streaming",
      "tools",
      "vision"
    ]
  },
  {
    "id": "clavue-2-analysis",
    "caps": [
      "chat_completion",
      "completion",
      "function_calling",
      "streaming",
      "tools",
      "vision"
    ]
  },
  {
    "id": "clavue-2-code",
    "caps": [
      "chat_completion",
      "completion",
      "function_calling",
      "streaming",
      "tools",
      "vision"
    ]
  },
  {
    "id": "clavue-2-desktop",
    "caps": [
      "chat_completion",
      "completion",
      "function_calling",
      "streaming",
      "tools",
      "vision"
    ]
  },
  {
    "id": "clavue-2-film",
    "caps": [
      "chat_completion",
      "completion",
      "function_calling",
      "streaming",
      "tools",
      "vision"
    ]
  },
  {
    "id": "clavue-2-manuf",
    "caps": [
      "chat_completion",
      "completion",
      "function_calling",
      "streaming",
      "tools",
      "vision"
    ]
  },
  {
    "id": "clavue-2-medical",
    "caps": [
      "chat_completion",
      "completion",
      "function_calling",
      "streaming",
      "tools",
      "vision"
    ]
  },
  {
    "id": "clavue-2-network",
    "caps": [
      "chat_completion",
      "completion",
      "function_calling",
      "streaming",
      "tools",
      "vision"
    ]
  },
  {
    "id": "clavue-2-novel-edit",
    "caps": [
      "chat_completion",
      "completion",
      "function_calling",
      "streaming",
      "tools",
      "vision"
    ]
  },
  {
    "id": "clavue-2-raw",
    "caps": [
      "chat_completion",
      "completion",
      "function_calling",
      "streaming",
      "tools",
      "vision"
    ]
  },
  {
    "id": "clavue-2-rust",
    "caps": [
      "chat_completion",
      "completion",
      "function_calling",
      "streaming",
      "tools",
      "vision"
    ]
  },
  {
    "id": "clavue-2-teach",
    "caps": [
      "chat_completion",
      "completion",
      "function_calling",
      "streaming",
      "tools",
      "vision"
    ]
  },
  {
    "id": "clavue-2-wiki",
    "caps": [
      "chat_completion",
      "completion",
      "function_calling",
      "streaming",
      "tools",
      "vision"
    ]
  },
  {
    "id": "clavue-2.1",
    "caps": []
  },
  {
    "id": "clavue-2.1-fast",
    "caps": []
  },
  {
    "id": "clavue-2b-last",
    "caps": [
      "chat_completion",
      "completion",
      "streaming",
      "vision"
    ]
  },
  {
    "id": "clavue-2b-last",
    "caps": [
      "chat_completion",
      "completion",
      "streaming",
      "vision"
    ]
  },
  {
    "id": "clavue-2b-v38",
    "caps": []
  },
  {
    "id": "clavue-2b-v61",
    "caps": [
      "chat_completion",
      "completion",
      "streaming",
      "vision"
    ]
  },
  {
    "id": "clavue-3-chat",
    "caps": [
      "chat_completion",
      "completion",
      "streaming",
      "vision"
    ]
  },
  {
    "id": "clavue-3-content",
    "caps": [
      "chat_completion",
      "completion",
      "streaming",
      "vision"
    ]
  },
  {
    "id": "clavue-3-film",
    "caps": [
      "chat_completion",
      "completion",
      "streaming",
      "vision"
    ]
  },
  {
    "id": "clavue-3-geo",
    "caps": [
      "chat_completion",
      "completion",
      "streaming",
      "vision"
    ]
  },
  {
    "id": "clavue-3-industry",
    "caps": [
      "chat_completion",
      "completion",
      "streaming",
      "vision"
    ]
  },
  {
    "id": "clavue-3-judge",
    "caps": [
      "chat_completion",
      "completion",
      "streaming",
      "vision"
    ]
  },
  {
    "id": "clavue-3-manhua",
    "caps": [
      "chat_completion",
      "completion",
      "streaming",
      "vision"
    ]
  },
  {
    "id": "clavue-3-medical",
    "caps": [
      "chat_completion",
      "completion",
      "streaming",
      "vision"
    ]
  },
  {
    "id": "clavue-3-novel",
    "caps": [
      "chat_completion",
      "completion",
      "streaming",
      "vision"
    ]
  },
  {
    "id": "clavue-3-novel-edit",
    "caps": [
      "chat_completion",
      "completion",
      "streaming",
      "vision"
    ]
  },
  {
    "id": "clavue-3-raw",
    "caps": [
      "chat_completion",
      "completion",
      "streaming",
      "vision"
    ]
  },
  {
    "id": "clavue-3-seo",
    "caps": [
      "chat_completion",
      "completion",
      "streaming",
      "vision"
    ]
  },
  {
    "id": "clavue-3-teach",
    "caps": [
      "chat_completion",
      "completion",
      "streaming",
      "vision"
    ]
  },
  {
    "id": "clavue-3-title",
    "caps": [
      "chat_completion",
      "completion",
      "streaming",
      "vision"
    ]
  },
  {
    "id": "clavue-3-travel",
    "caps": [
      "chat_completion",
      "completion",
      "streaming",
      "vision"
    ]
  },
  {
    "id": "clavue-3-wiki",
    "caps": [
      "chat_completion",
      "completion",
      "streaming",
      "vision"
    ]
  },
  {
    "id": "clavue-album",
    "caps": [
      "chat_completion",
      "completion",
      "vision"
    ]
  },
  {
    "id": "clavue-asmr",
    "caps": [
      "audio",
      "chat_completion",
      "completion"
    ]
  },
  {
    "id": "clavue-base",
    "caps": []
  },
  {
    "id": "clavue-id",
    "caps": [
      "chat_completion",
      "completion",
      "vision"
    ]
  },
  {
    "id": "clavue-img",
    "caps": []
  },
  {
    "id": "clavue-trans",
    "caps": [
      "chat_completion",
      "completion",
      "vision"
    ]
  },
  {
    "id": "clavue-tts",
    "caps": []
  },
  {
    "id": "clavue-tts-acted",
    "caps": [
      "audio",
      "chat_completion",
      "completion"
    ]
  },
  {
    "id": "gpt-4o-mini-tts",
    "caps": []
  },
  {
    "id": "kokoro",
    "caps": []
  },
  {
    "id": "lingsi1.0",
    "caps": [
      "audio",
      "chat_completion",
      "completion",
      "function_calling",
      "streaming",
      "tools",
      "video",
      "vision"
    ]
  },
  {
    "id": "minimax-music3",
    "caps": [
      "audio",
      "chat_completion",
      "completion"
    ]
  },
  {
    "id": "qwen-image-edit",
    "caps": [
      "chat_completion",
      "completion",
      "vision"
    ]
  },
  {
    "id": "qwen-image-edit-album",
    "caps": [
      "chat_completion",
      "completion",
      "vision"
    ]
  },
  {
    "id": "qwen-image-edit-id",
    "caps": [
      "chat_completion",
      "completion",
      "vision"
    ]
  },
  {
    "id": "qwen3-tts-acted",
    "caps": [
      "audio",
      "chat_completion",
      "completion"
    ]
  },
  {
    "id": "qwen3-tts-acted-fn",
    "caps": [
      "audio",
      "chat_completion",
      "completion"
    ]
  },
  {
    "id": "qwen3-tts-acted-ml",
    "caps": [
      "audio",
      "chat_completion",
      "completion"
    ]
  },
  {
    "id": "qwen3-tts-acted-rest",
    "caps": [
      "audio",
      "chat_completion",
      "completion"
    ]
  },
  {
    "id": "qwen3-tts-asmr",
    "caps": [
      "audio",
      "chat_completion",
      "completion"
    ]
  },
  {
    "id": "qwen3-tts-custom",
    "caps": []
  },
  {
    "id": "qwen3.5:4b",
    "caps": [
      "audio",
      "chat_completion",
      "completion",
      "function_calling",
      "streaming",
      "tools",
      "video",
      "vision"
    ]
  },
  {
    "id": "qwen3.6:27b",
    "caps": [
      "chat_completion",
      "completion",
      "function_calling",
      "streaming",
      "tools",
      "vision"
    ]
  },
  {
    "id": "qwen3.6:35b-a3b",
    "caps": [
      "chat_completion",
      "completion",
      "streaming",
      "vision"
    ]
  },
  {
    "id": "qwen3.8:27b",
    "caps": []
  },
  {
    "id": "tools-clean",
    "caps": [
      "chat_completion",
      "completion",
      "function_calling",
      "streaming",
      "tools",
      "vision"
    ]
  },
  {
    "id": "tts-1",
    "caps": []
  },
  {
    "id": "tts-1-hd",
    "caps": []
  },
  {
    "id": "z-image-album",
    "caps": []
  },
  {
    "id": "z-image-manhua",
    "caps": []
  },
  {
    "id": "z-image-turbo",
    "caps": []
  }
];

export const modelCount = models.length;

/** 能力开关的覆盖数（真实统计，非估计） */
export const capabilityCounts = models.reduce<Record<string, number>>((acc, m) => {
  for (const c of m.caps) acc[c] = (acc[c] ?? 0) + 1;
  return acc;
}, {});
