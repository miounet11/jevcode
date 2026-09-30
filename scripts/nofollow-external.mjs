/**
 * 构建后给 dist 里的站外 <a> 补 nofollow。
 * Astro 7 默认 Markdown 处理器不再走 rehype，所以在 HTML 上做这一步。
 * 站内链接、mailto、锚点保持原样。人仍然可以点出去。
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = fileURLToPath(new URL('../dist/', import.meta.url));

async function htmlFiles(dir) {
  const out = [];
  for (const ent of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, ent.name);
    if (ent.isDirectory()) out.push(...await htmlFiles(path));
    else if (ent.name.endsWith('.html')) out.push(path);
  }
  return out;
}

function hrefOf(tag) {
  const m = tag.match(/\bhref\s*=\s*(?:"([^"]*)"|'([^']*)')/i);
  return m ? (m[1] ?? m[2] ?? '') : '';
}

function withRel(tag) {
  if (/\brel\s*=\s*"([^"]*)"/i.test(tag)) {
    return tag.replace(/\brel\s*=\s*"([^"]*)"/i, (_, cur) => {
      const rel = new Set(cur.split(/\s+/).filter(Boolean));
      rel.add('nofollow');
      rel.add('noopener');
      rel.add('noreferrer');
      return `rel="${[...rel].join(' ')}"`;
    });
  }
  if (/\brel\s*=\s*'([^']*)'/i.test(tag)) {
    return tag.replace(/\brel\s*=\s*'([^']*)'/i, (_, cur) => {
      const rel = new Set(cur.split(/\s+/).filter(Boolean));
      rel.add('nofollow');
      rel.add('noopener');
      rel.add('noreferrer');
      return `rel='${[...rel].join(' ')}'`;
    });
  }
  return tag.replace(/<a\b/i, '<a rel="nofollow noopener noreferrer"');
}

function patch(html) {
  return html.replace(/<a\b[^>]*>/gi, (tag) => {
    const href = hrefOf(tag);
    if (!/^(https?:)?\/\//i.test(href)) return tag;
    if (/jevcode\.ai/i.test(href)) return tag;
    return withRel(tag);
  });
}

const files = await htmlFiles(dist);
let changed = 0;
let anchors = 0;
for (const file of files) {
  const before = await readFile(file, 'utf8');
  const after = patch(before);
  const added = (after.match(/rel="[^"]*nofollow/gi) || []).length
    - (before.match(/rel="[^"]*nofollow/gi) || []).length
    + ((after.match(/rel='[^']*nofollow/gi) || []).length
      - (before.match(/rel='[^']*nofollow/gi) || []).length);
  if (after !== before) {
    await writeFile(file, after);
    changed += 1;
    anchors += Math.max(added, 0);
  }
}
console.log(`nofollow: ${changed} html files, ${anchors} external anchors`);
