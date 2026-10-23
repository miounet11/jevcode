#!/usr/bin/env node
/**
 * 把管线告警推到飞书群机器人。
 *
 * 独立成脚本而不是塞进 pipeline-cron.sh：飞书要求 `msg_type: text` 且正文在
 * `content.text` 里，和 Slack/自建的 `{text}` 不同形，混在一处容易两边都错。
 *
 * 用法：
 *   node scripts/notify-feishu.mjs "标题" "正文"
 *   echo "正文" | node scripts/notify-feishu.mjs "标题"
 *
 * 环境变量：FEISHU_WEBHOOK（缺省时静默退出 0——告警通道不该反过来弄挂管线）
 * 退出码：0 已投递或未配置；1 投递失败（调用方自行决定是否致命）
 */

const HOST = process.env.HEALTHCHECK_HOST || 'jevcode';

/** 纯函数：拼飞书文本消息体。 */
export function feishuBody(title, text, now = new Date()) {
  const at = now.toISOString().replace('T', ' ').slice(0, 19) + 'Z';
  return {
    msg_type: 'text',
    content: { text: `[${HOST}] ${title}\n\n${text}\n\n时间：${at}` },
  };
}

async function main() {
  const url = process.env.FEISHU_WEBHOOK;
  const title = process.argv[2] ?? 'jevcode';
  let text = process.argv[3];
  if (text === undefined) {
    const chunks = [];
    for await (const chunk of process.stdin) chunks.push(chunk);
    text = Buffer.concat(chunks).toString('utf8').trim();
  }
  if (!text) {
    console.error('[notify-feishu] 没有正文，忽略');
    process.exit(0);
  }
  if (!url) {
    // 没配通道时把内容打到 stderr：cron 日志里仍能查到，不算失败。
    console.error(`[notify-feishu] 未配置 FEISHU_WEBHOOK，未投递：\n${title}\n${text}`);
    process.exit(0);
  }
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(feishuBody(title, text)),
      signal: AbortSignal.timeout(10_000),
    });
    const body = await res.text();
    if (!res.ok) {
      console.error(`[notify-feishu] 投递失败 HTTP ${res.status} ${body.slice(0, 200)}`);
      process.exit(1);
    }
    // 飞书的 HTTP 200 也可能是业务失败（StatusCode != 0），必须看 body。
    let ok = true;
    try {
      const parsed = JSON.parse(body);
      if (parsed.StatusCode !== undefined) ok = parsed.StatusCode === 0;
      else if (parsed.code !== undefined) ok = parsed.code === 0;
    } catch {
      ok = false;
    }
    if (!ok) {
      console.error(`[notify-feishu] 投递被拒绝：${body.slice(0, 200)}`);
      process.exit(1);
    }
    console.log('[notify-feishu] 已投递');
  } catch (err) {
    console.error(`[notify-feishu] 投递异常：${err && err.message ? err.message : err}`);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) await main();
