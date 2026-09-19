// Buffer -> base64，供 data: URL 动态 import 使用
export function b64(text) {
  return Buffer.from(text, 'utf8').toString('base64');
}
