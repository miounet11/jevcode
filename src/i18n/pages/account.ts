import type { Localized } from '../ui';

export const title: Localized<string> = {
  zh: '我的账户', en: 'Your account', ja: 'アカウント', ko: '내 계정', de: 'Dein Konto', fr: 'Votre compte', es: 'Tu cuenta', pt: 'Sua conta',
};

export const lead: Localized<string> = {
  zh: '查看余额与消费、签发与吊销 API Key。',
  en: 'See your credit balance and spend, and issue or revoke API keys.',
  ja: '残高と利用状況の確認、API Key の発行と失効。',
  ko: '잔액과 사용 내역을 확인하고 API Key를 발급하거나 폐기합니다.',
  de: 'Guthaben und Verbrauch einsehen, API Keys ausstellen oder widerrufen.',
  fr: 'Voir votre solde et vos dépenses, émettre ou révoquer des clés API.',
  es: 'Consulta tu saldo y gasto, y emite o revoca claves de API.',
  pt: 'Veja seu saldo e gastos, e emita ou revogue chaves de API.',
};

export const loading: Localized<string> = {
  zh: '加载中…', en: 'Loading…', ja: '読み込み中…', ko: '불러오는 중…', de: 'Lädt…', fr: 'Chargement…', es: 'Cargando…', pt: 'Carregando…',
};

export const notSignedIn: Localized<string> = {
  zh: '尚未登录。', en: 'You are not signed in.', ja: 'まだログインしていません。', ko: '아직 로그인하지 않았습니다.', de: 'Du bist nicht angemeldet.', fr: 'Vous n\'êtes pas connecté.', es: 'No has iniciado sesión.', pt: 'Você não está conectado.',
};

export const signIn: Localized<string> = {
  zh: '去登录', en: 'Sign in', ja: 'ログイン', ko: '로그인', de: 'Anmelden', fr: 'Se connecter', es: 'Iniciar sesión', pt: 'Entrar',
};

export const remaining: Localized<string> = {
  zh: '余额', en: 'Balance', ja: '残高', ko: '잔액', de: 'Guthaben', fr: 'Solde', es: 'Saldo', pt: 'Saldo',
};

export const perDay: Localized<string> = {
  zh: '剩余输入 token', en: 'input tokens left', ja: '残り入力トークン', ko: '남은 입력 토큰', de: 'verbleibende Eingabe-Token', fr: "tokens d'entrée restants", es: 'tokens de entrada restantes', pt: 'tokens de entrada restantes',
};

export const email: Localized<string> = {
  zh: '邮箱', en: 'Email', ja: 'メール', ko: '이메일', de: 'E-Mail', fr: 'E-mail', es: 'Correo', pt: 'E-mail',
};

export const plan: Localized<string> = {
  zh: '套餐', en: 'Plan', ja: 'プラン', ko: '요금제', de: 'Tarif', fr: 'Forfait', es: 'Plan', pt: 'Plano',
};

export const keys: Localized<string> = {
  zh: 'API Key', en: 'API keys', ja: 'API Key', ko: 'API Key', de: 'API Keys', fr: 'Clés API', es: 'Claves de API', pt: 'Chaves de API',
};

export const noKeys: Localized<string> = {
  zh: '还没有 Key。', en: 'No keys yet.', ja: 'まだ Key がありません。', ko: '아직 Key가 없습니다.', de: 'Noch keine Keys.', fr: 'Aucune clé pour le moment.', es: 'Aún no hay claves.', pt: 'Ainda sem chaves.',
};

export const issue: Localized<string> = {
  zh: '签发新 Key', en: 'Issue new key', ja: '新しい Key を発行', ko: '새 Key 발급', de: 'Neuen Key ausstellen', fr: 'Émettre une nouvelle clé', es: 'Emitir nueva clave', pt: 'Emitir nova chave',
};

export const issuing: Localized<string> = {
  zh: '签发中…', en: 'Issuing…', ja: '発行中…', ko: '발급 중…', de: 'Wird ausgestellt…', fr: 'Émission…', es: 'Emitiendo…', pt: 'Emitindo…',
};

export const newKeyWarn: Localized<string> = {
  zh: '这个 Key 只显示这一次，请立刻保存。',
  en: 'This key is shown once. Save it now.',
  ja: 'この Key は今回だけ表示されます。すぐに保存してください。',
  ko: '이 Key는 이번 한 번만 표시됩니다. 즉시 저장하세요.',
  de: 'Dieser Key wird nur einmal angezeigt. Speichere ihn jetzt.',
  fr: "Cette clé n'est affichée qu'une fois. Enregistrez-la maintenant.",
  es: 'Esta clave se muestra una sola vez. Guárdala ahora.',
  pt: 'Esta chave é exibida uma única vez. Salve-a agora.',
};

export const prefix: Localized<string> = {
  zh: '前缀', en: 'Prefix', ja: 'プレフィックス', ko: '접두사', de: 'Präfix', fr: 'Préfixe', es: 'Prefijo', pt: 'Prefixo',
};

export const label: Localized<string> = {
  zh: '备注', en: 'Label', ja: 'ラベル', ko: '라벨', de: 'Label', fr: 'Étiquette', es: 'Etiqueta', pt: 'Rótulo',
};

export const created: Localized<string> = {
  zh: '创建于', en: 'Created', ja: '作成', ko: '생성', de: 'Erstellt', fr: 'Créée', es: 'Creada', pt: 'Criada',
};

export const revoke: Localized<string> = {
  zh: '吊销', en: 'Revoke', ja: '失効', ko: '폐기', de: 'Widerrufen', fr: 'Révoquer', es: 'Revocar', pt: 'Revogar',
};

export const revoked: Localized<string> = {
  zh: '已吊销', en: 'Revoked', ja: '失効済み', ko: '폐기됨', de: 'Widerrufen', fr: 'Révoquée', es: 'Revocada', pt: 'Revogada',
};

export const active: Localized<string> = {
  zh: '可用', en: 'Active', ja: '有効', ko: '사용 가능', de: 'Aktiv', fr: 'Active', es: 'Activa', pt: 'Ativa',
};

export const logout: Localized<string> = {
  zh: '登出', en: 'Sign out', ja: 'ログアウト', ko: '로그아웃', de: 'Abmelden', fr: 'Se déconnecter', es: 'Cerrar sesión', pt: 'Sair',
};

export const confirmRevoke: Localized<string> = {
  zh: '确认吊销这个 Key？使用它的程序会立刻失效。',
  en: 'Revoke this key? Any program using it stops working immediately.',
  ja: 'この Key を失効させますか？使用中のプログラムは即座に動かなくなります。',
  ko: '이 Key를 폐기할까요? 사용 중인 프로그램이 즉시 작동을 멈춥니다.',
  de: 'Diesen Key widerrufen? Jedes Programm, das ihn nutzt, funktioniert sofort nicht mehr.',
  fr: 'Révoquer cette clé ? Tout programme qui l\'utilise cesse de fonctionner immédiatement.',
  es: '¿Revocar esta clave? Cualquier programa que la use deja de funcionar de inmediato.',
  pt: 'Revogar esta chave? Qualquer programa que a use para de funcionar imediatamente.',
};

export const ledger: Localized<string> = {
  zh: '消费明细', en: 'Ledger', ja: '利用明細', ko: '사용 내역', de: 'Abrechnung', fr: 'Relevé', es: 'Movimientos', pt: 'Extrato',
};

export const ledNone: Localized<string> = {
  zh: '还没有消费记录。', en: 'No entries yet.', ja: 'まだ記録がありません。', ko: '아직 기록이 없습니다.', de: 'Noch keine Einträge.', fr: 'Aucune entrée pour le moment.', es: 'Aún no hay movimientos.', pt: 'Ainda sem lançamentos.',
};

export const ledTime: Localized<string> = {
  zh: '时间', en: 'Time', ja: '日時', ko: '시간', de: 'Zeit', fr: 'Date', es: 'Hora', pt: 'Hora',
};

export const ledKind: Localized<string> = {
  zh: '类型', en: 'Type', ja: '種類', ko: '유형', de: 'Typ', fr: 'Type', es: 'Tipo', pt: 'Tipo',
};

export const ledAmount: Localized<string> = {
  zh: '金额', en: 'Amount', ja: '金額', ko: '금액', de: 'Betrag', fr: 'Montant', es: 'Importe', pt: 'Valor',
};

export const kindSignup: Localized<string> = {
  zh: '注册赠送', en: 'Signup credit', ja: '登録特典', ko: '가입 크레딧', de: 'Anmeldeguthaben', fr: "Crédit d'inscription", es: 'Crédito de registro', pt: 'Crédito de cadastro',
};

export const kindJudge: Localized<string> = {
  zh: '判定', en: 'Judgment', ja: '判定', ko: '판정', de: 'Urteil', fr: 'Jugement', es: 'Juicio', pt: 'Julgamento',
};

export const kindTopup: Localized<string> = {
  zh: '充值', en: 'Top-up', ja: 'チャージ', ko: '충전', de: 'Aufladung', fr: 'Rechargement', es: 'Recarga', pt: 'Recarga',
};

export const spent: Localized<string> = {
  zh: '累计消费', en: 'Total spent', ja: '累計利用', ko: '누적 사용', de: 'Gesamt ausgegeben', fr: 'Total dépensé', es: 'Total gastado', pt: 'Total gasto',
};

export const apiDocs: Localized<string> = {
  zh: 'API 文档', en: 'API docs', ja: 'API ドキュメント', ko: 'API 문서', de: 'API-Doku', fr: 'Doc API', es: 'Doc de API', pt: 'Doc da API',
};
