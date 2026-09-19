import { defineCollection } from 'astro:content';
// astro:content 的 z 重导出已废弃（Astro 8 移除），改用 astro/zod
import { z } from 'astro/zod';
import { glob } from 'astro/loaders';

/**
 * 文档集合。
 * 文件位于 src/content/docs/<lang>/<slug>.md，id 形如 `zh/primitives/choice`。
 * 语言从 id 的第一段解析。
 */
const docs = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/docs' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    /** 侧边栏分组 key，对应 src/data/site.ts 中的 section */
    section: z.string(),
    order: z.number().default(100),
    tags: z.array(z.string()).default([]),
    /** 是否为官方文档的改写/聚合 */
    source: z.string().optional(),
    /** 该篇由哪种语言机器翻译而来，取值形如 'zh'；用于页面上标注，避免被当成官方译文 */
    translatedFrom: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = { docs };
