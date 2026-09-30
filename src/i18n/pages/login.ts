import type { Localized } from '../ui';

export const title: Localized<string> = {
  zh: '登录', en: 'Sign in', ja: 'ログイン', ko: '로그인', de: 'Anmelden', fr: 'Connexion', es: 'Iniciar sesión', pt: 'Entrar',
};

export const lead: Localized<string> = {
  zh: '注册即送 $5 额度，按 jev-1.13.0 的输入 token 单价扣费。可签发 API Key、查看用量。账号+密码即可，不需邮箱验证。',
  en: 'Signup comes with $5 in credit, drawn at the jev-1.13.0 input-token rate. Issue API keys and track usage. Email and password only — no email verification.',
  ja: '登録で $5 分のクレジットが付き、jev-1.13.0 の入力トークン単価で差し引かれます。API Key の発行と利用状況の確認ができます。メールとパスワードのみで、メール認証は不要です。',
  ko: '가입 시 $5 크레딧이 지급되며 jev-1.13.0의 입력 토큰 단가로 차감됩니다. API Key를 발급하고 사용량을 확인할 수 있습니다. 이메일과 비밀번호만 필요하며 이메일 인증은 없습니다.',
  de: 'Bei der Anmeldung gibt es $5 Guthaben, verrechnet zum Eingabe-Token-Satz von jev-1.13.0. API Keys ausstellen und Nutzung verfolgen. Nur E-Mail und Passwort – keine E-Mail-Bestätigung.',
  fr: "L'inscription inclut 5 $ de crédit, décompté au tarif des tokens d'entrée de jev-1.13.0. Émettez des clés API et suivez l'usage. E-mail et mot de passe uniquement, sans vérification par e-mail.",
  es: 'El registro incluye $5 de crédito, descontado al precio de tokens de entrada de jev-1.13.0. Emite claves de API y sigue el uso. Solo correo y contraseña, sin verificación por correo.',
  pt: 'O cadastro inclui $5 de crédito, debitado na tarifa de tokens de entrada do jev-1.13.0. Emita chaves de API e acompanhe o uso. Apenas e-mail e senha, sem verificação por e-mail.',
};

export const email: Localized<string> = {
  zh: '邮箱', en: 'Email', ja: 'メール', ko: '이메일', de: 'E-Mail', fr: 'E-mail', es: 'Correo', pt: 'E-mail',
};

export const password: Localized<string> = {
  zh: '密码', en: 'Password', ja: 'パスワード', ko: '비밀번호', de: 'Passwort', fr: 'Mot de passe', es: 'Contraseña', pt: 'Senha',
};

export const signIn: Localized<string> = {
  zh: '登录', en: 'Sign in', ja: 'ログイン', ko: '로그인', de: 'Anmelden', fr: 'Se connecter', es: 'Iniciar sesión', pt: 'Entrar',
};

export const signUp: Localized<string> = {
  zh: '注册', en: 'Sign up', ja: '登録', ko: '가입', de: 'Registrieren', fr: "S'inscrire", es: 'Registrarse', pt: 'Cadastrar',
};

export const toSignUp: Localized<string> = {
  zh: '还没有账号？注册', en: 'No account? Sign up', ja: 'アカウントがない？登録', ko: '계정이 없나요? 가입', de: 'Kein Konto? Registrieren', fr: 'Pas de compte ? S\'inscrire', es: '¿Sin cuenta? Regístrate', pt: 'Sem conta? Cadastre-se',
};

export const toSignIn: Localized<string> = {
  zh: '已有账号？登录', en: 'Have an account? Sign in', ja: 'アカウントがある？ログイン', ko: '계정이 있나요? 로그인', de: 'Konto vorhanden? Anmelden', fr: 'Déjà un compte ? Se connecter', es: '¿Ya tienes cuenta? Inicia sesión', pt: 'Já tem conta? Entrar',
};

export const working: Localized<string> = {
  zh: '处理中…', en: 'Working…', ja: '処理中…', ko: '처리 중…', de: 'Wird verarbeitet…', fr: 'Traitement…', es: 'Procesando…', pt: 'Processando…',
};

export const needFields: Localized<string> = {
  zh: '请填写邮箱和密码。', en: 'Enter your email and password.', ja: 'メールとパスワードを入力してください。', ko: '이메일과 비밀번호를 입력하세요.', de: 'Gib E-Mail und Passwort ein.', fr: 'Saisissez votre e-mail et votre mot de passe.', es: 'Introduce tu correo y contraseña.', pt: 'Informe e-mail e senha.',
};

export const failed: Localized<string> = {
  zh: '登录失败，请检查邮箱与密码。', en: 'Sign-in failed. Check your email and password.', ja: 'ログインに失敗しました。メールとパスワードを確認してください。', ko: '로그인에 실패했습니다. 이메일과 비밀번호를 확인하세요.', de: 'Anmeldung fehlgeschlagen. Prüfe E-Mail und Passwort.', fr: 'Échec de la connexion. Vérifiez votre e-mail et votre mot de passe.', es: 'Falló el inicio de sesión. Revisa tu correo y contraseña.', pt: 'Falha ao entrar. Verifique e-mail e senha.',
};

export const weakPw: Localized<string> = {
  zh: '密码至少 8 位。', en: 'Use at least 8 characters.', ja: 'パスワードは 8 文字以上にしてください。', ko: '비밀번호는 최소 8자입니다.', de: 'Mindestens 8 Zeichen.', fr: 'Au moins 8 caractères.', es: 'Usa al menos 8 caracteres.', pt: 'Use pelo menos 8 caracteres.',
};

export const dupEmail: Localized<string> = {
  zh: '该邮箱已注册。', en: 'That email is already registered.', ja: 'そのメールはすでに登録されています。', ko: '이미 등록된 이메일입니다.', de: 'Diese E-Mail ist bereits registriert.', fr: 'Cet e-mail est déjà enregistré.', es: 'Ese correo ya está registrado.', pt: 'Esse e-mail já está registrado.',
};

export const signUpOk: Localized<string> = {
  zh: '注册成功，正在进入账户页…', en: 'Signed up. Opening your account…', ja: '登録が完了しました。アカウントページへ移動します…', ko: '가입 완료. 계정 페이지로 이동합니다…', de: 'Registriert. Konto wird geöffnet…', fr: 'Inscription réussie. Ouverture de votre compte…', es: 'Registro correcto. Abriendo tu cuenta…', pt: 'Cadastro concluído. Abrindo sua conta…',
};

export const goAccount: Localized<string> = {
  zh: '去账户页', en: 'Go to account', ja: 'アカウントへ', ko: '계정으로 이동', de: 'Zum Konto', fr: 'Aller au compte', es: 'Ir a la cuenta', pt: 'Ir para a conta',
};

export const pwRuleLen: Localized<string> = {
  zh: '至少 8 个字符', en: 'At least 8 characters', ja: '8 文字以上', ko: '최소 8자', de: 'Mindestens 8 Zeichen', fr: 'Au moins 8 caractères', es: 'Al menos 8 caracteres', pt: 'Pelo menos 8 caracteres',
};

export const pwRuleCommon: Localized<string> = {
  zh: '不是常见弱密码', en: 'Not a common weak password', ja: 'よくある弱いパスワードでない', ko: '흔한 취약 비밀번호가 아님', de: 'Kein gängiges schwaches Passwort', fr: 'Pas un mot de passe faible courant', es: 'No es una contraseña débil común', pt: 'Não é uma senha fraca comum',
};

export const pwRuleEmail: Localized<string> = {
  zh: '不要与邮箱相同', en: 'Not the same as your email', ja: 'メールと同じでない', ko: '이메일과 같지 않음', de: 'Nicht identisch mit der E-Mail', fr: "Différent de votre e-mail", es: 'Distinta de tu correo', pt: 'Diferente do seu e-mail',
};

export const pwWeak: Localized<string> = {
  zh: '弱', en: 'Weak', ja: '弱い', ko: '약함', de: 'Schwach', fr: 'Faible', es: 'Débil', pt: 'Fraca',
};

export const pwMedium: Localized<string> = {
  zh: '中', en: 'Fair', ja: '普通', ko: '보통', de: 'Mittel', fr: 'Moyen', es: 'Media', pt: 'Média',
};

export const pwStrong: Localized<string> = {
  zh: '强', en: 'Strong', ja: '強い', ko: '강함', de: 'Stark', fr: 'Fort', es: 'Fuerte', pt: 'Forte',
};

export const captchaLabel: Localized<string> = {
  zh: '验证码', en: 'Captcha', ja: '確認コード', ko: '인증 코드', de: 'Captcha', fr: 'Captcha', es: 'Captcha', pt: 'Captcha',
};

export const captchaPlaceholder: Localized<string> = {
  zh: '填写计算结果', en: 'Enter the answer', ja: '計算結果を入力', ko: '계산 결과 입력', de: 'Ergebnis eingeben', fr: 'Saisissez le résultat', es: 'Introduce el resultado', pt: 'Informe o resultado',
};

export const captchaRefresh: Localized<string> = {
  zh: '换一题', en: 'New challenge', ja: '別の問題', ko: '다른 문제', de: 'Neue Aufgabe', fr: 'Nouveau défi', es: 'Otro reto', pt: 'Novo desafio',
};

export const captchaLoading: Localized<string> = {
  zh: '加载中…', en: 'Loading…', ja: '読み込み中…', ko: '불러오는 중…', de: 'Lädt…', fr: 'Chargement…', es: 'Cargando…', pt: 'Carregando…',
};

export const captchaNeed: Localized<string> = {
  zh: '请先完成验证码。', en: 'Complete the captcha first.', ja: '先に確認コードを完了してください。', ko: '먼저 인증 코드를 완료하세요.', de: 'Schließe zuerst das Captcha ab.', fr: "Terminez d'abord le captcha.", es: 'Completa primero el captcha.', pt: 'Conclua o captcha primeiro.',
};

export const captchaWrong: Localized<string> = {
  zh: '验证码不正确或已过期，请重试。', en: 'The captcha is wrong or expired. Try again.', ja: '確認コードが正しくないか期限切れです。もう一度お試しください。', ko: '인증 코드가 틀렸거나 만료되었습니다. 다시 시도하세요.', de: 'Das Captcha ist falsch oder abgelaufen. Versuche es erneut.', fr: 'Le captcha est incorrect ou expiré. Réessayez.', es: 'El captcha es incorrecto o ha caducado. Inténtalo de nuevo.', pt: 'O captcha está incorreto ou expirou. Tente de novo.',
};

export const captchaFail: Localized<string> = {
  zh: '验证码加载失败，请点「换一题」重试。', en: 'The captcha failed to load. Tap "New challenge" to retry.', ja: '確認コードの読み込みに失敗しました。「別の問題」を押して再試行してください。', ko: '인증 코드를 불러오지 못했습니다. "다른 문제"를 눌러 다시 시도하세요.', de: 'Das Captcha konnte nicht geladen werden. Tippe auf "Neue Aufgabe", um es erneut zu versuchen.', fr: 'Échec du chargement du captcha. Touchez « Nouveau défi » pour réessayer.', es: 'No se pudo cargar el captcha. Pulsa "Otro reto" para reintentar.', pt: 'Falha ao carregar o captcha. Toque em "Novo desafio" para tentar de novo.',
};
