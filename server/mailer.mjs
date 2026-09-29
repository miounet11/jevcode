/**
 * 邮件投递通道 —— OTP 的发信出口。
 *
 * 做成按环境变量选择的多通道，而不是硬编码某家服务：
 *   MAIL_TRANSPORT=console  开发用，把验证码打到服务日志，不发信
 *   MAIL_TRANSPORT=smtp     通用 SMTP，需要 SMTP_URL
 *   MAIL_TRANSPORT=webhook  走 HTTP 接口（适配 Resend/SendGrid 等），需要 MAIL_WEBHOOK_URL
 *   未设置时的默认：生产外（NODE_ENV!=='production'）用 console，生产则视为未配置
 *
 * 安全约定：console 通道在生产环境会拒绝启动，防止验证码被写进生产日志。
 */

import { connect as netConnect } from 'node:net';
import { connect as tlsConnect } from 'node:tls';

/** 从环境变量推导出投递实现；返回 null 表示没有可用通道 */
export function makeMailer(env = process.env) {
  const kind = (env.MAIL_TRANSPORT || '').trim().toLowerCase();
  const isProd = env.NODE_ENV === 'production';
  const from = env.MAIL_FROM || 'JevCode <no-reply@jevcode.ai>';

  if (kind === 'console' || (kind === '' && !isProd)) {
    if (isProd && kind === 'console') {
      throw new Error('MAIL_TRANSPORT=console is not allowed in production (codes would leak into logs)');
    }
    return {
      name: 'console',
      async send(email, code) {
        // 只在开发日志里出现，且显式标注，避免被误当成生产配置
        console.log(`[mail:console] to=${email} code=${code} (dev only, not actually sent)`);
      },
    };
  }

  if (kind === 'webhook') {
    const url = env.MAIL_WEBHOOK_URL;
    const token = env.MAIL_WEBHOOK_TOKEN || '';
    if (!url) throw new Error('MAIL_WEBHOOK_URL is required for the webhook transport');
    return {
      name: 'webhook',
      async send(email, code) {
        const res = await fetch(url, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            ...(token ? { authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({
            from,
            to: email,
            subject: 'Your JevCode sign-in code',
            text: `Your sign-in code is ${code}. It expires in 10 minutes.`,
          }),
        });
        if (!res.ok) {
          const detail = await res.text().catch(() => '');
          throw new Error(`mail webhook ${res.status}: ${detail.slice(0, 200)}`);
        }
      },
    };
  }

  if (kind === 'smtp') {
    const raw = env.SMTP_URL;
    if (!raw) throw new Error('SMTP_URL is required for the smtp transport');
    const u = new URL(raw);
    const port = Number(u.port || (u.protocol === 'smtps:' ? 465 : 587));
    const secure = u.protocol === 'smtps:' || port === 465;
    const authUser = decodeURIComponent(u.username || '');
    const authPass = decodeURIComponent(u.password || '');

    return {
      name: 'smtp',
      async send(email, code) {
        await smtpSend({
          host: u.hostname, port, secure, authUser, authPass,
          from, to: email,
          subject: 'Your JevCode sign-in code',
          body: `Your sign-in code is ${code}. It expires in 10 minutes.`,
        });
      },
    };
  }

  // 生产且未配置
  if (isProd) return null;
  return {
    name: 'console',
    async send(email, code) {
      console.log(`[mail:console] to=${email} code=${code} (dev only, not actually sent)`);
    },
  };
}

/**
 * 极简 SMTP 客户端：只做 AUTH LOGIN + MAIL FROM/RCPT TO/DATA。
 * 不引第三方库，够发一封纯文本验证码；不支持附件、多收件人、DKIM 签名。
 */
async function smtpSend({ host, port, secure, authUser, authPass, from, to, subject, body }) {
  const socket = secure
    ? tlsConnect({ host, port, servername: host })
    : netConnect({ host, port });

  const read = () => new Promise((resolve, reject) => {
    let buf = '';
    const onData = (d) => {
      buf += d.toString('utf8');
      // 多行响应以「3位码 + 空格」结尾
      if (/^\d{3} [^\n]*\r?\n$/m.test(buf) || /\n\d{3} /.test(buf)) {
        cleanup();
        resolve(buf);
      }
    };
    const onErr = (e) => { cleanup(); reject(e); };
    const cleanup = () => {
      socket.off('data', onData);
      socket.off('error', onErr);
    };
    socket.on('data', onData);
    socket.on('error', onErr);
  });

  const send = (line) => new Promise((resolve, reject) => {
    socket.write(line + '\r\n', (e) => (e ? reject(e) : resolve()));
  });

  const expect = (resp, code) => {
    if (!resp.startsWith(code)) throw new Error(`SMTP expected ${code}, got: ${resp.split('\n')[0]}`);
  };

  try {
    await new Promise((res, rej) => {
      socket.once(secure ? 'secureConnect' : 'connect', res);
      socket.once('error', rej);
    });
    expect(await read(), '220');
    await send('EHLO jevcode.ai'); expect(await read(), '250');

    if (authUser) {
      await send('AUTH LOGIN'); expect(await read(), '334');
      await send(Buffer.from(authUser).toString('base64')); expect(await read(), '334');
      await send(Buffer.from(authPass).toString('base64')); expect(await read(), '235');
    }

    await send(`MAIL FROM:<${extractAddr(from)}>`); expect(await read(), '250');
    await send(`RCPT TO:<${to}>`); expect(await read(), '250');
    await send('DATA'); expect(await read(), '354');

    const headers = [
      `From: ${from}`,
      `To: ${to}`,
      `Subject: ${subject}`,
      'MIME-Version: 1.0',
      'Content-Type: text/plain; charset=utf-8',
      '',
      body.replace(/^\./gm, '..'),   // 行首点须转义
    ].join('\r\n');
    await send(headers + '\r\n.');
    expect(await read(), '250');
    await send('QUIT').catch(() => {});
  } finally {
    socket.destroy();
  }
}

/** 从 "Name <a@b.c>" 里取出裸地址 */
function extractAddr(s) {
  const m = /<([^>]+)>/.exec(s);
  return m ? m[1] : s.trim();
}
