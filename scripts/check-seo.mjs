/**
 * sitemap ↔ 可索引页面 双向一致性校验。
 *
 * 借 yyds-bot 的 `sitemap-bidirectional` 检查：sitemap 与「页面自己说的
 * 可索引状态」必须互相覆盖。单边检查会漏掉两类真实故障——
 *  1) 页面改成可索引，sitemap 还停在旧规则 → 页面永远不会被抓（本轮实测 1518 条）
 *  2) sitemap 收录了 noindex 页 → 事后矛盾，抓取预算被浪费
 *
 * 用法：node scripts/check-seo.mjs [--dist=dist]
 * 退出码：0 一致；1 有差异（打印前 20 条，按方向分组）。
 */

import { readdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const repoRoot = path.resolve(import.meta.dirname, '..');

/** 与 astro.config.mjs 的 site 保持同一来源。 */
export function siteOf(astroConfigText) {
  return astroConfigText.match(/site:\s*'([^']+)'/)?.[1] ?? 'https://www.jevcode.ai';
}

/** 扫描 dist 下所有 index.html，返回 [{url, indexable, file}]。 */
export async function scanPages(distDir, site) {
  const out = [];
  async function walk(dir) {
    for (const ent of await readdir(dir, { withFileTypes: true })) {
      const full = path.join(dir, ent.name);
      if (ent.isDirectory()) {
        await walk(full);
      } else if (ent.name === 'index.html') {
        const html = await readFile(full, 'utf8');
        const rel = path.relative(distDir, dir);
        const url = new URL(rel ? `${rel.split(path.sep).join('/')}/` : '/', site).href;
        // 页面没写 robots meta 时，默认就是可索引。
        const robots = html.match(/<meta\s+name="robots"\s+content="([^"]*)"/i)?.[1] ?? '';
        out.push({ url, indexable: !/noindex/i.test(robots), file: full });
      }
    }
  }
  await walk(distDir);
  return out;
}

/**
 * 纯函数：llms.txt 里推荐的每个链接都必须真实存在且可索引。
 * 推荐一个 noindex 页面（或 404）比不推荐更糟——等于把模型引到死路。
 * @returns {{broken: string[], noindex: string[]}}
 */
export function checkLlmsLinks(llmsText, pages, site) {
  const known = new Map(pages.map((p) => [p.url, p.indexable]));
  const broken = [];
  const noindex = [];
  for (const m of llmsText.matchAll(/\]\((https:\/\/[^)\s]+)\)/g)) {
    const url = m[1];
    if (!known.has(url)) broken.push(url);
    else if (!known.get(url)) noindex.push(url);
  }
  void site;
  return { broken, noindex };
}

/** 读 sitemap-*.xml 里的全部 <loc>。 */
export async function readSitemapUrls(distDir) {
  const urls = new Set();
  for (const name of await readdir(distDir)) {
    if (!/^sitemap.*\.xml$/.test(name)) continue;
    const xml = await readFile(path.join(distDir, name), 'utf8');
    for (const m of xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)) {
      if (!name.startsWith('sitemap-index')) urls.add(m[1]);
    }
  }
  return urls;
}

/**
 * 纯函数：对比两个集合。
 * @returns {{missing: string[], extra: string[]}} missing = 可索引但不在 sitemap
 */
export function diffSitemap(pages, sitemapUrls) {
  const urlSet = new Set(pages.filter((p) => p.indexable).map((p) => p.url));
  const missing = [...urlSet].filter((u) => !sitemapUrls.has(u)).sort();
  const extra = [...sitemapUrls].filter((u) => !urlSet.has(u)).sort();
  return { missing, extra };
}

async function main() {
  const arg = process.argv.find((a) => a.startsWith('--dist='));
  const distDir = path.resolve(repoRoot, arg ? arg.slice('--dist='.length) : 'dist');
  if (!existsSync(distDir)) {
    // 没有构建产物就无法校验。这里必须失败而不是静默跳过：
    // 跳过会让这道门在 CI 或单独运行时「假成功」，等于没有门禁。
    // `npm run check` 里不会走到这里——check 先构建再校验。
    console.error(`check-seo: FAIL — 找不到 ${path.relative(repoRoot, distDir)}，先跑 npm run build`);
    process.exit(1);
  }
  const site = siteOf(await readFile(path.join(repoRoot, 'astro.config.mjs'), 'utf8'));
  const pages = await scanPages(distDir, site);
  const sitemapUrls = await readSitemapUrls(distDir);
  const { missing, extra } = diffSitemap(pages, sitemapUrls);

  const indexable = pages.filter((p) => p.indexable).length;
  const noindex = pages.length - indexable;
  console.log(`check-seo: ${pages.length} pages (${indexable} indexable, ${noindex} noindex), sitemap ${sitemapUrls.size}`);

  if (missing.length) {
    console.error(`\n可索引但不在 sitemap（${missing.length}）:`);
    for (const u of missing.slice(0, 20)) console.error(`  ${u}`);
  }
  if (extra.length) {
    console.error(`\nsitemap 里但页面不存在或 noindex（${extra.length}）:`);
    for (const u of extra.slice(0, 20)) console.error(`  ${u}`);
  }
  let failed = missing.length + extra.length > 0;
  if (failed) console.error(`\ncheck-seo: FAIL — sitemap 差异 ${missing.length + extra.length} 条`);

  // llms.txt 推荐的链接同样要能走通。
  const llmsPath = path.join(distDir, 'llms.txt');
  if (existsSync(llmsPath)) {
    const { broken, noindex: llmsNoindex } = checkLlmsLinks(
      await readFile(llmsPath, 'utf8'),
      pages,
      site,
    );
    if (broken.length) {
      console.error(`\nllms.txt 指向不存在的页面（${broken.length}）:`);
      for (const u of broken.slice(0, 20)) console.error(`  ${u}`);
    }
    if (llmsNoindex.length) {
      console.error(`\nllms.txt 指向 noindex 页面（${llmsNoindex.length}）:`);
      for (const u of llmsNoindex.slice(0, 20)) console.error(`  ${u}`);
    }
    if (broken.length || llmsNoindex.length) {
      console.error(`\ncheck-seo: FAIL — llms.txt 有 ${broken.length + llmsNoindex.length} 条无效推荐`);
      failed = true;
    } else {
      console.log('check-seo: llms.txt 链接全部有效且可索引');
    }
  } else {
    console.error('check-seo: FAIL — dist/llms.txt 缺失');
    failed = true;
  }

  if (failed) process.exit(1);
  console.log('check-seo: OK — sitemap 与可索引页面双向一致');
}

if (import.meta.url === `file://${process.argv[1]}`) await main();
