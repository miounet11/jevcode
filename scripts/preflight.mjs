#!/usr/bin/env node
/**
 * 发布前统一验证入口：一处跑完内容质量与可索引性两项校验，输出一份机器可读的结论。
 *
 * 为什么要有这个入口：
 *   这两项校验此前分散在三处——内容校验只在 healthcheck 巡检里跑（每天两次，
 *   和发布不同步），可索引性校验埋在 check-seo 里只能看到 build 是否成功，
 *   发布报告里没有它们的单独字段。结果就是「发布成功」这句话不包含这两项的
 *   任何信息，出了问题只能等第二天巡检才发现。这个入口让每次发布都带着一份
 *   明确的验证结论。
 *
 * 用法：
 *   node scripts/preflight.mjs            # 人类可读
 *   node scripts/preflight.mjs --json     # 机器可读（pipeline 用这个）
 *   node scripts/preflight.mjs --strict   # 软问题也算失败（门 2 / 手工发布用）
 *
 * 退出码：
 *   0  通过
 *   1  未通过（硬问题，或 --strict 下有新增软问题）
 *
 * 设计取舍（与 10-18~10-22 连续停更的关系）：
 *   pipeline 调用时默认不传 --strict。硬问题必然阻断，软问题只记录——翻译没
 *   跟上会让整批没译文而触发大量硬问题，那种情况下失败也要如实报出来；但
 *   「术语缺译名」这类存量软问题不该拦发布，否则日更会再次停摆。
 */

import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(import.meta.dirname, '..');

/**
 * 跑一个子命令，返回 { code, stdout, stderr }，不抛异常（失败要能被归类）。
 *
 * maxBuffer 必须显式放宽：硬问题成批出现时 content-check --json 的输出会远超
 * 默认 1MB（实测 750 条硬问题就有 173KB，翻译整批没跟上会到 MB 级）。默认值
 * 下 spawnSync 会以 ENOBUFS 截断并置 error，下游只看到半截 JSON，进而把
 * 「内容坏了」误报成「输出无法解析」——错误原因被替换掉，排查方向就全错了。
 */
export function execCheck(cmd, args, cwd = repoRoot) {
  const r = spawnSync(cmd, args, {
    cwd,
    encoding: 'utf8',
    env: process.env,
    maxBuffer: 64 * 1024 * 1024,
  });
  if (r.error) {
    // 传不下去的错误要如实带上，不能伪装成空输出。
    return { code: 1, stdout: r.stdout ?? '', stderr: `执行失败：${r.error.message}` };
  }
  return { code: r.status ?? 1, stdout: r.stdout ?? '', stderr: r.stderr ?? '' };
}

/**
 * 把两项校验的输出归一成统一结构。
 *
 * content 用 --json 是因为它已经能给出结构化的问题分类；seo 只有退出码和
 * 文字输出，就从 stderr 里数 FAIL 行——足够区分「通过」和「没过，去看日志」。
 *
 * @returns {{ok: boolean, content: object, seo: object}}
 */
export function summarize({ content, seo, strict = false }) {
  // content-check 的退出码 1 有两种含义：硬问题，或「软问题超出基线」。
  // 两者处置完全不同——硬问题是内容本身坏了，软问题是存量缺口的增量。
  // 只看退出码会让默认模式连软问题一起拦，--strict 也就失去意义。
  const contentOk = content.hard === null ? content.code === 0 : content.hard === 0;
  const softOk = strict ? content.addedSoft === 0 : true;
  const seoOk = seo.code === 0;
  return {
    ok: contentOk && softOk && seoOk,
    content: {
      ok: contentOk,
      hard: content.hard ?? null,
      addedSoft: content.addedSoft ?? null,
      detail: contentOk ? 'ok' : (content.reason ?? 'failed'),
    },
    seo: {
      ok: seoOk,
      detail: seoOk ? 'ok' : (seo.reason ?? 'failed'),
    },
  };
}

async function main() {
  const argv = process.argv.slice(2);
  const json = argv.includes('--json');
  const strict = argv.includes('--strict');
  const distArg = argv.find((a) => a.startsWith('--dist='));
  const skipSeo = argv.includes('--no-seo');

  // 内容质量：--json 的输出就是结论本身，不用再解析文字。
  const contentRun = execCheck(process.execPath, ['scripts/content-check.mjs', '--json']);
  let content;
  try {
    const parsed = JSON.parse(contentRun.stdout);
    content = {
      code: contentRun.code,
      hard: parsed.hard?.length ?? 0,
      addedSoft: parsed.added?.length ?? 0,
      reason: parsed.hard?.length
        ? `${parsed.hard.length} 条硬问题`
        : parsed.added?.length
          ? `${parsed.added.length} 条新增软问题`
          : 'failed',
    };
  } catch {
    // JSON 都解析不出来说明脚本本身坏了，必须当成失败而不是「没问题」。
    const why = contentRun.stderr.trim().slice(0, 200) || 'stdout 为空';
    content = { code: 1, hard: null, addedSoft: null, reason: `content-check 输出无法解析：${why}` };
  }

  // 可索引性：需要 dist，没有产物就明确报失败（静默跳过等于这道门不存在）。
  let seo;
  if (skipSeo) {
    seo = { code: 0, reason: 'skipped' };
  } else {
    const distDir = distArg ? distArg.slice('--dist='.length) : 'dist';
    if (!existsSync(path.join(repoRoot, distDir))) {
      seo = { code: 1, reason: `找不到 ${distDir}，先跑 npm run build` };
    } else {
      const seoArgs = ['scripts/check-seo.mjs', ...(distArg ? [distArg] : [])];
      const r = execCheck(process.execPath, seoArgs);
      const fails = (r.stderr + r.stdout).split('\n').filter((l) => /check-seo: FAIL/.test(l));
      seo = { code: r.code, reason: r.code === 0 ? 'ok' : fails.join('; ').trim() || 'failed' };
    }
  }

  const result = summarize({ content, seo, strict });

  if (json) {
    console.log(JSON.stringify(result, null, 2));
  } else {
    const mark = (ok) => (ok ? 'OK  ' : 'FAIL');
    console.log(`[preflight] 内容质量      ${mark(result.content.ok)} ${result.content.detail}`);
    console.log(`[preflight] 可索引性      ${mark(result.seo.ok)} ${result.seo.detail}`);
    if (result.content.addedSoft) {
      console.log(`[preflight] 新增软问题 ${result.content.addedSoft} 条：node scripts/content-check.mjs 看清单`);
    }
  }

  if (!result.ok) process.exit(1);
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isMain) await main();
