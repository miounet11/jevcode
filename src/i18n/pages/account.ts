import type { Localized } from '../ui';

export const title: Localized<string> = {
  zh: '我的账户', en: 'Your account', ja: 'マイアカウント', ko: '내 계정', de: 'Mein Konto', fr: 'Mon compte', es: 'Mi cuenta', pt: 'Minha conta',
};

export const lead: Localized<string> = {
  zh: '看余额和花销，创建或停用密钥。',
  en: 'See your balance and spending, create or disable keys.',
  ja: '残高と使った金額を確認し、キーを作成や停止できます。',
  ko: '잔액과 사용 금액을 확인하고 키를 만들거나 끌 수 있습니다.',
  de: 'Guthaben und Ausgaben ansehen, Keys erstellen oder stoppen.',
  fr: 'Voir votre solde et vos dépenses, créer ou désactiver des clés.',
  es: 'Mira tu saldo y lo gastado, crea o desactiva claves.',
  pt: 'Veja seu saldo e gastos, crie ou desative chaves.',
};

export const loading: Localized<string> = {
  zh: '加载中…', en: 'Loading…', ja: '読み込み中…', ko: '불러오는 중…', de: 'Lädt…', fr: 'Chargement…', es: 'Cargando…', pt: 'Carregando…',
};

export const notSignedIn: Localized<string> = {
  zh: '你还没登录。', en: 'You are not signed in.', ja: 'まだログインしていません。', ko: '아직 로그인하지 않았습니다.', de: 'Du bist nicht angemeldet.', fr: 'Vous n\'êtes pas connecté.', es: 'No has iniciado sesión.', pt: 'Você não está conectado.',
};

export const signIn: Localized<string> = {
  zh: '去登录', en: 'Sign in', ja: 'ログイン', ko: '로그인', de: 'Anmelden', fr: 'Se connecter', es: 'Iniciar sesión', pt: 'Entrar',
};

export const remaining: Localized<string> = {
  zh: '余额', en: 'Balance', ja: '残高', ko: '잔액', de: 'Guthaben', fr: 'Solde', es: 'Saldo', pt: 'Saldo',
};

export const perDay: Localized<string> = {
  zh: '剩余额度', en: 'credit left', ja: '残り额度', ko: '남은 크레딧', de: 'Restguthaben', fr: 'crédit restant', es: 'crédito restante', pt: 'crédito restante',
};

export const email: Localized<string> = {
  zh: '邮箱', en: 'Email', ja: 'メール', ko: '이메일', de: 'E-Mail', fr: 'E-mail', es: 'Correo', pt: 'E-mail',
};

export const plan: Localized<string> = {
  zh: '套餐', en: 'Plan', ja: 'プラン', ko: '요금제', de: 'Tarif', fr: 'Forfait', es: 'Plan', pt: 'Plano',
};

export const keys: Localized<string> = {
  zh: '密钥', en: 'Keys', ja: 'キー', ko: '키', de: 'Keys', fr: 'Clés', es: 'Claves', pt: 'Chaves',
};

export const noKeys: Localized<string> = {
  zh: '还没有密钥，点下面按钮创建一把。',
  en: 'No keys yet. Use the button below to create one.',
  ja: 'まだキーがありません。下のボタンで作成できます。',
  ko: '아직 키가 없습니다. 아래 버튼으로 만들 수 있습니다.',
  de: 'Noch keine Keys. Erstelle unten einen.',
  fr: 'Aucune clé pour le moment. Créez-en une ci-dessous.',
  es: 'Aún no hay claves. Crea una con el botón de abajo.',
  pt: 'Ainda sem chaves. Crie uma com o botão abaixo.',
};

export const issue: Localized<string> = {
  zh: '新建密钥', en: 'New key', ja: 'キーを作成', ko: '키 만들기', de: 'Neuen Key erstellen', fr: 'Créer une clé', es: 'Crear clave', pt: 'Criar chave',
};

export const issuing: Localized<string> = {
  zh: '创建中…', en: 'Creating…', ja: '作成中…', ko: '만드는 중…', de: 'Wird erstellt…', fr: 'Création…', es: 'Creando…', pt: 'Criando…',
};

export const newKeyWarn: Localized<string> = {
  zh: '密钥只显示这一次，请马上保存。',
  en: 'This key is shown once. Save it now.',
  ja: 'キーは今回だけ表示されます。今すぐ保存してください。',
  ko: '키는 이번 한 번만 표시됩니다. 지금 저장하세요.',
  de: 'Dieser Key wird nur einmal angezeigt. Jetzt speichern.',
  fr: "Cette clé n'est affichée qu'une fois. Enregistrez-la maintenant.",
  es: 'Esta clave se muestra una sola vez. Guárdala ahora.',
  pt: 'Esta chave é exibida uma única vez. Salve-a agora.',
};

export const prefix: Localized<string> = {
  zh: '编号', en: 'ID', ja: 'ID', ko: 'ID', de: 'ID', fr: 'ID', es: 'ID', pt: 'ID',
};

export const label: Localized<string> = {
  zh: '备注', en: 'Note', ja: 'メモ', ko: '메모', de: 'Notiz', fr: 'Note', es: 'Nota', pt: 'Nota',
};

export const created: Localized<string> = {
  zh: '创建时间', en: 'Created', ja: '作成日', ko: '만든 날', de: 'Erstellt', fr: 'Créée le', es: 'Creada', pt: 'Criada em',
};

export const revoke: Localized<string> = {
  zh: '停用', en: 'Disable', ja: '停止', ko: '끄기', de: 'Deaktivieren', fr: 'Désactiver', es: 'Desactivar', pt: 'Desativar',
};

export const revoked: Localized<string> = {
  zh: '已停用', en: 'Disabled', ja: '停止済み', ko: '꺼짐', de: 'Deaktiviert', fr: 'Désactivée', es: 'Desactivada', pt: 'Desativada',
};

export const active: Localized<string> = {
  zh: '可用', en: 'Active', ja: '使用中', ko: '사용 중', de: 'Aktiv', fr: 'Active', es: 'Activa', pt: 'Ativa',
};

export const logout: Localized<string> = {
  zh: '退出', en: 'Sign out', ja: 'ログアウト', ko: '로그아웃', de: 'Abmelden', fr: 'Se déconnecter', es: 'Cerrar sesión', pt: 'Sair',
};

export const confirmRevoke: Localized<string> = {
  zh: '确定停用？用这把密钥的程序会立刻断开。',
  en: 'Disable this key? Programs using it will stop right away.',
  ja: '停止しますか？このキーを使うプログラムはすぐに動かなくなります。',
  ko: '끄시겠습니까? 이 키를 쓰는 프로그램이 바로 멈춥니다.',
  de: 'Diesen Key deaktivieren? Programme, die ihn nutzen, stoppen sofort.',
  fr: 'Désactiver cette clé ? Les programmes qui l\'utilisent s\'arrêtent aussitôt.',
  es: '¿Desactivar esta clave? Los programas que la usan se detienen al instante.',
  pt: 'Desativar esta chave? Programas que a usam param imediatamente.',
};

export const ledger: Localized<string> = {
  zh: '消费记录', en: 'Spending', ja: '利用履歴', ko: '사용 기록', de: 'Ausgaben', fr: 'Dépenses', es: 'Gastos', pt: 'Gastos',
};

export const ledNone: Localized<string> = {
  zh: '还没有消费记录。', en: 'No spending yet.', ja: 'まだ履歴がありません。', ko: '아직 기록이 없습니다.', de: 'Noch keine Ausgaben.', fr: 'Aucune dépense pour le moment.', es: 'Aún no hay gastos.', pt: 'Ainda sem gastos.',
};

export const ledTime: Localized<string> = {
  zh: '时间', en: 'When', ja: '日時', ko: '시간', de: 'Zeit', fr: 'Quand', es: 'Cuándo', pt: 'Quando',
};

export const ledKind: Localized<string> = {
  zh: '类型', en: 'What', ja: '種類', ko: '구분', de: 'Art', fr: 'Quoi', es: 'Qué', pt: 'O quê',
};

export const ledAmount: Localized<string> = {
  zh: '金额', en: 'Amount', ja: '金額', ko: '금액', de: 'Betrag', fr: 'Montant', es: 'Importe', pt: 'Valor',
};

export const kindSignup: Localized<string> = {
  zh: '注册赠送', en: 'Signup bonus', ja: '登録特典', ko: '가입 보너스', de: 'Anmeldebonus', fr: 'Bonus d\'inscription', es: 'Bono de registro', pt: 'Bônus de cadastro',
};

export const kindJudge: Localized<string> = {
  zh: '判定', en: 'Judgment', ja: '判定', ko: '판정', de: 'Urteil', fr: 'Jugement', es: 'Juicio', pt: 'Julgamento',
};

export const kindTopup: Localized<string> = {
  zh: '充值', en: 'Top-up', ja: 'チャージ', ko: '충전', de: 'Aufladung', fr: 'Rechargement', es: 'Recarga', pt: 'Recarga',
};

export const spent: Localized<string> = {
  zh: '累计花费', en: 'Total spent', ja: '合計利用額', ko: '총 사용액', de: 'Insgesamt ausgegeben', fr: 'Total dépensé', es: 'Total gastado', pt: 'Total gasto',
};

export const apiDocs: Localized<string> = {
  zh: '开发文档', en: 'Developer docs', ja: '開発ドキュメント', ko: '개발 문서', de: 'Entwicklerdoku', fr: 'Doc développeur', es: 'Doc para devs', pt: 'Doc para devs',
};

export const copyKey: Localized<string> = {
  zh: '复制密钥', en: 'Copy key', ja: 'キーをコピー', ko: '키 복사', de: 'Key kopieren', fr: 'Copier la clé', es: 'Copiar clave', pt: 'Copiar chave',
};

export const copied: Localized<string> = {
  zh: '已复制', en: 'Copied', ja: 'コピーしました', ko: '복사됨', de: 'Kopiert', fr: 'Copié', es: 'Copiado', pt: 'Copiado',
};
