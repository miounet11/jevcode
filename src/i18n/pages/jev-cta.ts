import type { Localized } from '../ui';

/** {credit} 由页面替换为不含 $ 的金额，例如 5.00。 */
export const title: Localized<string> = {
  zh: '用 clavue-jev 在线实测同类判定',
  en: 'Test this decision live with clavue-jev',
  ja: 'この判定を clavue-jev でその場で試す',
  ko: '이 판정을 clavue-jev로 바로 시험하기',
  de: 'Diese Entscheidung live mit clavue-jev testen',
  fr: 'Tester cette décision en direct avec clavue-jev',
  es: 'Prueba esta decisión en vivo con clavue-jev',
  pt: 'Teste esta decisão ao vivo com clavue-jev',
};

export const lead: Localized<string> = {
  zh: '在浏览器免注册试跑结构化判定，或注册领取 ${credit} 免费 API 额度直接接入。',
  en: 'Run structured yes/no, choice, or confidence decisions in the browser, or sign up for ${credit} in free API credit.',
  ja: 'ブラウザで構造化された yes/no・選択・確信度の判定を実行するか、登録して ${credit} の無料 API クレジットを受け取れます。',
  ko: '브라우저에서 구조화된 예/아니오, 선택, 확신도 판정을 실행하거나, 가입하고 ${credit} 무료 API 크레딧을 받으세요.',
  de: 'Führe strukturierte Ja/Nein-, Auswahl- oder Konfidenz-Entscheidungen im Browser aus, oder registriere dich für ${credit} kostenloses API-Guthaben.',
  fr: 'Lancez des décisions structurées oui/non, à choix ou avec confiance dans le navigateur, ou inscrivez-vous pour ${credit} de crédit API offert.',
  es: 'Ejecuta decisiones estructuradas de sí/no, opción o confianza en el navegador, o regístrate para ${credit} de crédito API gratis.',
  pt: 'Execute decisões estruturadas de sim/não, escolha ou confiança no navegador, ou crie uma conta e receba ${credit} de crédito API grátis.',
};

export const tryBtn: Localized<string> = {
  zh: '在线免费试跑',
  en: 'Open live playground',
  ja: 'ライブプレイグラウンドを開く',
  ko: '라이브 플레이그라운드 열기',
  de: 'Live-Playground öffnen',
  fr: 'Ouvrir le bac à sable',
  es: 'Abrir el playground',
  pt: 'Abrir o playground',
};

export const registerBtn: Localized<string> = {
  zh: '免费领取 API 密钥',
  en: 'Get free API key',
  ja: '無料の API キーを取得',
  ko: '무료 API 키 받기',
  de: 'Kostenlosen API-Schlüssel holen',
  fr: 'Obtenir une clé API gratuite',
  es: 'Obtener clave API gratis',
  pt: 'Obter chave API grátis',
};
