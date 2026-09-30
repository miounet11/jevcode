/**
 * 公开请求里的选择题，收成上游认的 criteria，并估算可计费的输入 token。
 *
 * 上游对 choice + options 数组会返回
 * “The decision head returned no answers.”。choice + criteria 对象可以返回。
 * 页面和可复制的请求继续用 options，转发前在这里转换。
 *
 * 上游响应的 usage 是 null，没有 tokenizer 计数。已登录调用按送出的
 * state 与 questions JSON 的 UTF-8 字节估算：4 字节 1 token，向上取整。
 * 这个模块用到 Buffer，不要从 Astro 页面 import。
 */

const NAME_RE = /^[a-z][a-z0-9_]{0,40}$/;

function label(value, max) {
  if (typeof value !== 'string' && typeof value !== 'number') return '';
  return String(value).trim().slice(0, max);
}

function criteriaOf(spec) {
  if (!spec.criteria || typeof spec.criteria !== 'object' || Array.isArray(spec.criteria)) return null;
  const criteria = {};
  for (const [key, value] of Object.entries(spec.criteria)) {
    if (Object.keys(criteria).length >= 8) break;
    const k = label(key, 80);
    const v = label(value, 200);
    if (!k || !v || Object.hasOwn(criteria, k)) continue;
    criteria[k] = v;
  }
  return Object.keys(criteria).length >= 2 ? criteria : null;
}

function optionsOf(spec) {
  if (!Array.isArray(spec.options)) return null;
  const options = [];
  for (const option of spec.options) {
    if (options.length >= 8) break;
    const k = label(option, 80);
    if (!k || options.includes(k)) continue;
    options.push(k);
  }
  return options.length >= 2 ? options : null;
}

/** 校验并截断问题。choice 保留调用方原来的 options 或 criteria。 */
export function cleanQuestions(input, maxQuestions = 6) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) return null;
  const out = {};
  for (const [name, spec] of Object.entries(input)) {
    if (Object.keys(out).length >= maxQuestions) break;
    if (!NAME_RE.test(name)) continue;
    if (!spec || typeof spec !== 'object' || Array.isArray(spec)) continue;
    const instructions = label(spec.instructions, 400);
    if (!instructions) continue;
    if (spec.type === 'noul' || spec.type === 'confidence') {
      out[name] = { type: spec.type, instructions };
    } else if (spec.type === 'choice') {
      const criteria = criteriaOf(spec);
      if (criteria) out[name] = { type: 'choice', instructions, criteria };
      else {
        const options = optionsOf(spec);
        if (options) out[name] = { type: 'choice', instructions, options };
      }
    }
  }
  return Object.keys(out).length ? out : null;
}

/**
 * 发给上游的 questions。非 choice 原样通过。
 * choice 优先用已有 criteria；否则把每个 option 收成 criteria[option] = option。
 */
export function toUpstreamQuestions(questions) {
  const out = {};
  for (const [name, spec] of Object.entries(questions || {})) {
    if (!spec || spec.type !== 'choice') {
      out[name] = spec;
      continue;
    }
    const criteria = {};
    if (spec.criteria && typeof spec.criteria === 'object' && !Array.isArray(spec.criteria)) {
      for (const [key, value] of Object.entries(spec.criteria)) {
        if (Object.keys(criteria).length >= 8) break;
        const k = label(key, 80);
        const v = label(value, 200);
        if (k && v && !Object.hasOwn(criteria, k)) criteria[k] = v;
      }
    }
    if (Object.keys(criteria).length < 2 && Array.isArray(spec.options)) {
      for (const option of spec.options) {
        if (Object.keys(criteria).length >= 8) break;
        const k = label(option, 80);
        if (k && !Object.hasOwn(criteria, k)) criteria[k] = k;
      }
    }
    out[name] = { type: 'choice', instructions: spec.instructions, criteria };
  }
  return out;
}

/** 按实际送给模型的 state 与 questions 估算输入 token。至少 1。 */
export function billableInputTokens(state, questions) {
  const text = `${state}\n${JSON.stringify(questions)}`;
  return Math.max(1, Math.ceil(Buffer.byteLength(text, 'utf8') / 4));
}
