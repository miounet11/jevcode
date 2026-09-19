import { readFileSync } from 'node:fs';

const KEY = process.env.TYPESAFE_API_KEY;
if (!KEY) {
  console.error('缺少 TYPESAFE_API_KEY 环境变量');
  process.exit(1);
}

const BASE = 'https://api.typesafe.ai/v1/systemone';
const MODEL = 'jev-latest';

async function ask(model, state, questions) {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ state, model, questions }),
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}: ${JSON.stringify(await res.text())}`);
  }
  const data = await res.json();
  return data.answers;
}

/**
 * 核心模式（fan-out）：把整个评估上下文放 state，一次性问多个原子问题，
 * 输出 tokens 免费，所以多问不增加成本，只增加输入 tokens（$42/Btok）。
 */
function evalRequest(state, questions) {
  return ask(MODEL, state, questions);
}

export { evalRequest };

// CLI 直接运行时的自测
if (import.meta.url === `file://${process.argv[1]}`) {
  const answers = await evalRequest('Help. My payouts have been failing for 3 days.', {
    is_urgent: { type: 'noul', instructions: 'Does this convey urgency?' },
    severity: {
      type: 'score',
      instructions: 'How severe is the issue?',
      criteria: ['Minor', 'Moderate', 'Critical'],
    },
  });
  console.log(JSON.stringify(answers, null, 2));
}
