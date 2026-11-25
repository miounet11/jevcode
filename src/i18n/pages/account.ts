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
  zh: '剩余额度', en: 'credit left', ja: '残りクレジット', ko: '남은 크레딧', de: 'Restguthaben', fr: 'crédit restant', es: 'crédito restante', pt: 'crédito restante',
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
  zh: '确认停用', en: 'Confirm disable', ja: '停止を確認', ko: '끄기 확인', de: 'Deaktivieren bestätigen', fr: 'Confirmer la désactivation', es: 'Confirmar desactivación', pt: 'Confirmar desativação',
};

/** 密钥表格下方的轻提示：说明停用后果，代替弹窗里的小字 */
export const revokeNote: Localized<string> = {
  zh: '停用后用这把密钥的程序会立刻断开。',
  en: 'Disabling stops any program using the key right away.',
  ja: '停止すると、このキーを使うプログラムはすぐに動かなくなります。',
  ko: '끄면 이 키를 쓰는 프로그램이 바로 멈춥니다.',
  de: 'Beim Deaktivieren stoppen Programme, die den Key nutzen, sofort.',
  fr: 'Désactiver arrête aussitôt les programmes qui utilisent la clé.',
  es: 'Al desactivar, los programas que usan la clave se detienen al instante.',
  pt: 'Ao desativar, programas que usam a chave param imediatamente.',
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

export const lastUsed: Localized<string> = {
  zh: '最近使用', en: 'Last used', ja: '最終利用', ko: '최근 사용', de: 'Zuletzt genutzt', fr: 'Dernière utilisation', es: 'Último uso', pt: 'Último uso',
};

export const keyLabelPlaceholder: Localized<string> = {
  zh: '备注（如 prod / local）',
  en: 'Label (e.g. prod / local)',
  ja: 'メモ（例: prod / local）',
  ko: '메모 (예: prod / local)',
  de: 'Notiz (z. B. prod / local)',
  fr: 'Note (ex. prod / local)',
  es: 'Nota (ej. prod / local)',
  pt: 'Nota (ex. prod / local)',
};

export const quickstartTitle: Localized<string> = {
  zh: '立刻试调这把密钥',
  en: 'Run your first call with this key',
  ja: 'このキーで最初の呼び出しを試す',
  ko: '이 키로 첫 호출 실행하기',
  de: 'Ersten Aufruf mit diesem Key testen',
  fr: 'Faire votre premier appel avec cette clé',
  es: 'Haz tu primera llamada con esta clave',
  pt: 'Faça sua primeira chamada com esta chave',
};

export const copySnippet: Localized<string> = {
  zh: '复制代码', en: 'Copy snippet', ja: 'コードをコピー', ko: '코드 복사', de: 'Code kopieren', fr: 'Copier le code', es: 'Copiar código', pt: 'Copiar código',
};

export const testCall: Localized<string> = {
  zh: '用这把密钥试跑一次',
  en: 'Run a live test call',
  ja: 'このキーでテスト実行',
  ko: '이 키로 테스트 호출',
  de: 'Live-Testaufruf starten',
  fr: 'Lancer un appel test',
  es: 'Probar llamada en vivo',
  pt: 'Fazer chamada de teste',
};

export const testing: Localized<string> = {
  zh: '请求中…', en: 'Calling…', ja: '実行中…', ko: '호출 중…', de: 'Wird aufgerufen…', fr: 'Appel en cours…', es: 'Llamando…', pt: 'Chamando…',
};

export const testOk: Localized<string> = {
  zh: '调用成功', en: 'Call succeeded', ja: '呼び出し成功', ko: '호출 성공', de: 'Aufruf erfolgreich', fr: 'Appel réussi', es: 'Llamada exitosa', pt: 'Chamada bem-sucedida',
};

export const testFail: Localized<string> = {
  zh: '调用失败', en: 'Call failed', ja: '呼び出し失敗', ko: '호출 실패', de: 'Aufruf fehlgeschlagen', fr: 'Échec de l\'appel', es: 'Llamada fallida', pt: 'Falha na chamada',
};

export const pwSection: Localized<string> = {
  zh: '修改密码', en: 'Change password', ja: 'パスワード変更', ko: '비밀번호 변경', de: 'Passwort ändern', fr: 'Changer le mot de passe', es: 'Cambiar contraseña', pt: 'Alterar senha',
};

export const pwOld: Localized<string> = {
  zh: '当前密码', en: 'Current password', ja: '現在のパスワード', ko: '현재 비밀번호', de: 'Aktuelles Passwort', fr: 'Mot de passe actuel', es: 'Contraseña actual', pt: 'Senha atual',
};

export const pwNew: Localized<string> = {
  zh: '新密码（至少 8 位）', en: 'New password (min 8 chars)', ja: '新しいパスワード（8文字以上）', ko: '새 비밀번호 (8자 이상)', de: 'Neues Passwort (mind. 8 Zeichen)', fr: 'Nouveau mot de passe (8 caractères min.)', es: 'Nueva contraseña (mín. 8 caracteres)', pt: 'Nova senha (mín. 8 caracteres)',
};

export const pwSubmit: Localized<string> = {
  zh: '更新密码', en: 'Update password', ja: 'パスワードを更新', ko: '비밀번호 업데이트', de: 'Passwort aktualisieren', fr: 'Mettre à jour', es: 'Actualizar contraseña', pt: 'Atualizar senha',
};

export const pwSaving: Localized<string> = {
  zh: '保存中…', en: 'Saving…', ja: '保存中…', ko: '저장 중…', de: 'Speichert…', fr: 'Enregistrement…', es: 'Guardando…', pt: 'Salvando…',
};

export const pwOk: Localized<string> = {
  zh: '密码已更新，其他设备会话已自动退出。',
  en: 'Password updated. Other device sessions have been signed out.',
  ja: 'パスワードを更新しました。他端末のセッションは終了しました。',
  ko: '비밀번호가 변경되었습니다. 다른 기기 세션이 로그아웃되었습니다.',
  de: 'Passwort aktualisiert. Andere Gerätesitzungen wurden abgemeldet.',
  fr: 'Mot de passe mis à jour. Les autres sessions ont été déconnectées.',
  es: 'Contraseña actualizada. Se cerraron las demás sesiones.',
  pt: 'Senha atualizada. As sessões em outros dispositivos foram encerradas.',
};

export const pwFail: Localized<string> = {
  zh: '修改失败，请检查当前密码是否正确且新密码不少于 8 位。',
  en: 'Update failed. Check your current password and use at least 8 characters.',
  ja: '更新に失敗しました。現在のパスワードと 8 文字以上の新パスワードを確認してください。',
  ko: '변경에 실패했습니다. 현재 비밀번호와 새 비밀번호(8자 이상)를 확인하세요.',
  de: 'Aktualisierung fehlgeschlagen. Prüfe das aktuelle Passwort und mindestens 8 Zeichen.',
  fr: 'Échec de la mise à jour. Vérifiez votre mot de passe actuel (8 caractères min.).',
  es: 'Error al actualizar. Verifica tu contraseña actual y usa al menos 8 caracteres.',
  pt: 'Falha ao atualizar. Verifique sua senha atual e use ao menos 8 caracteres.',
};

export const redeemSection: Localized<string> = {
  zh: '兑换充值码',
  en: 'Redeem a credit code',
  ja: 'チャージコードを使う',
  ko: '충전 코드 사용',
  de: 'Guthaben-Code einlösen',
  fr: 'Utiliser un code de crédit',
  es: 'Canjear un código de crédito',
  pt: 'Resgatar um código de crédito',
};

export const redeemLead: Localized<string> = {
  zh: '输入预付充值码，额度立即入账并写入下方消费明细。',
  en: 'Enter a prepaid credit code to top up your balance immediately.',
  ja: 'プリペイドのチャージコードを入力すると、残高にすぐ反映され、下の利用履歴にも記録されます。',
  ko: '선불 충전 코드를 입력하면 잔액에 바로 반영되고, 아래 사용 내역에도 기록됩니다.',
  de: 'Gib einen Prepaid-Code ein. Das Guthaben wird sofort gutgeschrieben und unten in den Ausgaben vermerkt.',
  fr: 'Saisissez un code prépayé : le crédit est ajouté tout de suite et apparaît dans les dépenses ci-dessous.',
  es: 'Introduce un código prepago. El crédito se abona al instante y queda en el detalle de gastos de abajo.',
  pt: 'Informe um código pré-pago. O crédito entra na hora e aparece no extrato de gastos abaixo.',
};

export const redeemPlaceholder: Localized<string> = {
  zh: '例如 jev_v_...',
  en: 'e.g. jev_v_...',
  ja: '例: jev_v_...',
  ko: '예: jev_v_...',
  de: 'z. B. jev_v_...',
  fr: 'ex. jev_v_...',
  es: 'p. ej. jev_v_...',
  pt: 'ex. jev_v_...',
};

export const redeemSubmit: Localized<string> = {
  zh: '兑换额度',
  en: 'Redeem credit',
  ja: 'クレジットを反映',
  ko: '크레딧 충전',
  de: 'Guthaben einlösen',
  fr: 'Ajouter le crédit',
  es: 'Canjear crédito',
  pt: 'Resgatar crédito',
};

export const redeemWorking: Localized<string> = {
  zh: '兑换中…',
  en: 'Redeeming…',
  ja: '反映中…',
  ko: '충전 중…',
  de: 'Wird eingelöst…',
  fr: 'Activation…',
  es: 'Canjeando…',
  pt: 'Resgatando…',
};

export const redeemEmpty: Localized<string> = {
  zh: '请先输入充值码。',
  en: 'Enter a credit code first.',
  ja: '先にチャージコードを入力してください。',
  ko: '먼저 충전 코드를 입력하세요.',
  de: 'Gib zuerst einen Code ein.',
  fr: 'Saisissez d\'abord un code.',
  es: 'Introduce primero un código.',
  pt: 'Informe primeiro um código.',
};

/** 占位是 {usd}，货币符号写在占位前面。客户端只替换 {usd}。 */
export const redeemOkTpl: Localized<string> = {
  zh: '兑换成功，已入账 ${usd}。',
  en: 'Redeemed! Added ${usd} to your balance.',
  ja: '反映しました。残高に ${usd} を追加しました。',
  ko: '충전되었습니다. 잔액에 ${usd}를 추가했습니다.',
  de: 'Eingelöst. ${usd} wurden gutgeschrieben.',
  fr: 'Code accepté. ${usd} ont été ajoutés à votre solde.',
  es: 'Canjeado. Se añadieron ${usd} a tu saldo.',
  pt: 'Resgatado. ${usd} foram adicionados ao seu saldo.',
};

export const redeemUsed: Localized<string> = {
  zh: '该充值码已被使用。',
  en: 'This code has already been redeemed.',
  ja: 'このコードはすでに使用されています。',
  ko: '이미 사용된 코드입니다.',
  de: 'Dieser Code wurde bereits eingelöst.',
  fr: 'Ce code a déjà été utilisé.',
  es: 'Este código ya fue canjeado.',
  pt: 'Este código já foi resgatado.',
};

export const redeemExpired: Localized<string> = {
  zh: '该充值码已过期。',
  en: 'This code has expired.',
  ja: 'このコードは期限切れです。',
  ko: '이 코드는 만료되었습니다.',
  de: 'Dieser Code ist abgelaufen.',
  fr: 'Ce code a expiré.',
  es: 'Este código ha caducado.',
  pt: 'Este código expirou.',
};

export const redeemFail: Localized<string> = {
  zh: '充值码无效或已停用，请核对后重试。',
  en: 'Invalid or revoked code. Check it and try again.',
  ja: 'コードが無効か停止されています。確認してもう一度お試しください。',
  ko: '코드가 유효하지 않거나 중지되었습니다. 확인 후 다시 시도하세요.',
  de: 'Code ungültig oder gesperrt. Prüfe ihn und versuche es erneut.',
  fr: 'Code invalide ou révoqué. Vérifiez-le et réessayez.',
  es: 'Código no válido o revocado. Revísalo e inténtalo de nuevo.',
  pt: 'Código inválido ou revogado. Confira e tente de novo.',
};
