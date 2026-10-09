import type { Localized } from '../ui';

export const title: Localized<string> = {
  zh: '试一次判定', en: 'Try a judgment', ja: '判定を試す', ko: '판정 시도', de: 'Ein Urteil versuchen', fr: 'Essayer un jugement', es: 'Probar un juicio', pt: 'Tentar um julgamento',
};

export const lead: Localized<string> = {
  zh: '不用注册。写一段情况说明，Jev 直接给出判断和把握度，还给你一个能转发的链接。',
  en: 'No account. Write a state and Jev returns a probability, not generated prose. The result gets a link you can forward.',
  ja: '登録は不要です。状態を書くと、Jev は生成された文章ではなく確率付きの判定を返します。結果には転送できるリンクが付きます。',
  ko: '가입이 필요 없습니다. 상태를 적으면 Jev는 생성된 문장이 아니라 확률이 있는 판정을 반환합니다. 결과에는 전달할 수 있는 링크가 붙습니다.',
  de: 'Kein Konto nötig. Schreibe einen Zustand, und Jev gibt eine Wahrscheinlichkeit zurück, keinen erzeugten Text. Das Ergebnis bekommt einen weiterleitbaren Link.',
  fr: "Aucun compte. Écrivez un état et Jev renvoie une probabilité, pas un texte généré. Le résultat obtient un lien à transmettre.",
  es: 'Sin cuenta. Escribe un estado y Jev devuelve una probabilidad, no texto generado. El resultado obtiene un enlace que puedes reenviar.',
  pt: 'Sem conta. Escreva um estado e o Jev retorna uma probabilidade, não texto gerado. O resultado ganha um link que você pode encaminhar.',
};

export const state: Localized<string> = {
  zh: '情况说明', en: 'State', ja: '状態', ko: '상태', de: 'Zustand', fr: 'État', es: 'Estado', pt: 'Estado',
};

export const run: Localized<string> = {
  zh: '开始判断', en: 'Run judgment', ja: '判定を実行', ko: '판정 실행', de: 'Urteil ausführen', fr: 'Lancer le jugement', es: 'Ejecutar juicio', pt: 'Executar julgamento',
};

export const running: Localized<string> = {
  zh: '正在判断…', en: 'Judging…', ja: '判定中…', ko: '판정 중…', de: 'Wird beurteilt…', fr: 'Jugement…', es: 'Juzgando…', pt: 'Julgando…',
};

export const share: Localized<string> = {
  zh: '分享结果', en: 'Share this result', ja: 'この結果を共有', ko: '이 결과 공유', de: 'Dieses Ergebnis teilen', fr: 'Partager ce résultat', es: 'Compartir este resultado', pt: 'Compartilhar este resultado',
};

export const copied: Localized<string> = {
  zh: '链接已复制', en: 'Link copied', ja: 'リンクをコピーしました', ko: '링크 복사됨', de: 'Link kopiert', fr: 'Lien copié', es: 'Enlace copiado', pt: 'Link copiado',
};

export const compareLink: Localized<string> = {
  zh: '看 clavue-jev 和 jev-1.13.0 的同题对比', en: 'Compare clavue-jev with jev-1.13.0 on the same questions', ja: 'clavue-jev と jev-1.13.0 の同問比較を見る', ko: 'clavue-jev와 jev-1.13.0의 같은 문제 비교 보기', de: 'clavue-jev mit jev-1.13.0 bei denselben Fragen vergleichen', fr: 'Comparer clavue-jev et jev-1.13.0 sur les mêmes questions', es: 'Comparar clavue-jev con jev-1.13.0 en las mismas preguntas', pt: 'Comparar clavue-jev com jev-1.13.0 nas mesmas perguntas',
};

/** 判定结果下方的注册引导条 */
export const ctaTitle: Localized<string> = {
  zh: '想把这个判断接进你的程序？',
  en: 'Want this judgment in your own program?',
  ja: 'この判定を自分のプログラムに組み込みたい？',
  ko: '이 판정을 프로그램에 연결하고 싶으신가요?',
  de: 'Dieses Urteil in dein Programm einbauen?',
  fr: 'Envie d’intégrer ce jugement à votre programme ?',
  es: '¿Quieres integrar este juicio en tu programa?',
  pt: 'Quer integrar este julgamento no seu programa?',
};

export const ctaLead: Localized<string> = {
  zh: '注册就送 $5 额度，一个 API 调用就能跑同样的判断。',
  en: 'Sign up for $5 in credit — one API call runs the same judgment.',
  ja: '登録で $5 分のクレジット。API 呼び出し 1 回で同じ判定が動きます。',
  ko: '가입 시 $5 크레딧. API 호출 한 번으로 같은 판정을 실행합니다.',
  de: 'Anmeldung mit $5 Guthaben – ein API-Aufruf startet dasselbe Urteil.',
  fr: 'Inscription avec 5 $ de crédit — un appel API lance le même jugement.',
  es: 'Regístrate con $5 de crédito: una llamada a la API ejecuta el mismo juicio.',
  pt: 'Cadastre-se com $5 de crédito — uma chamada de API executa o mesmo julgamento.',
};

export const ctaButton: Localized<string> = {
  zh: '注册领 $5', en: 'Sign up for $5', ja: '登録して $5 をもらう', ko: '가입하고 $5 받기', de: 'Für $5 anmelden', fr: 'S’inscrire pour 5 $', es: 'Registrarse por $5', pt: 'Cadastrar por $5',
};

/** 客户端脚本文案。 */
export const client: Localized<Record<string, string>> = {
  zh: { needState: '先写一段情况说明。', failed: '没跑成，等一下再试。', tooLong: '最长 4000 字，删一点再试。', tooShort: '太短了，至少写 8 个字。' },
  en: { needState: 'Write a state first.', failed: 'The judgment failed. Try again later.', tooLong: 'state is capped at 4000 characters.', tooShort: 'state needs at least 8 characters.' },
  ja: { needState: '先に状態を書いてください。', failed: '判定に失敗しました。しばらくしてからお試しください。', tooLong: 'state は最大 4000 文字です。', tooShort: 'state は 8 文字以上必要です。' },
  ko: { needState: '먼저 상태를 적어 주세요.', failed: '판정에 실패했습니다. 잠시 후 다시 시도하세요.', tooLong: 'state는 최대 4000자입니다.', tooShort: 'state는 최소 8자입니다.' },
  de: { needState: 'Schreibe zuerst einen Zustand.', failed: 'Das Urteil ist fehlgeschlagen. Versuche es später erneut.', tooLong: 'state ist auf 4000 Zeichen begrenzt.', tooShort: 'state braucht mindestens 8 Zeichen.' },
  fr: { needState: "Écrivez d'abord un état.", failed: 'Le jugement a échoué. Réessayez plus tard.', tooLong: 'state est limité à 4000 caractères.', tooShort: 'state nécessite au moins 8 caractères.' },
  es: { needState: 'Escribe primero un estado.', failed: 'El juicio falló. Inténtalo más tarde.', tooLong: 'state está limitado a 4000 caracteres.', tooShort: 'state necesita al menos 8 caracteres.' },
  pt: { needState: 'Escreva primeiro um estado.', failed: 'O julgamento falhou. Tente mais tarde.', tooLong: 'state é limitado a 4000 caracteres.', tooShort: 'state precisa de pelo menos 8 caracteres.' },
};
