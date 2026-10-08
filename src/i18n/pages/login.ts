import type { Localized } from '../ui';

export const title: Localized<string> = {
  zh: '登录', en: 'Sign in', ja: 'ログイン', ko: '로그인', de: 'Anmelden', fr: 'Connexion', es: 'Iniciar sesión', pt: 'Entrar',
};

export const lead: Localized<string> = {
  zh: '注册就送 $5 额度，用完为止。邮箱加密码即可，不用验证邮箱。',
  en: 'Sign up and get $5 in credit. Just email and password — no email verification.',
  ja: '登録で $5 分のクレジットが付きます。メールとパスワードだけで、認証は不要です。',
  ko: '가입 시 $5 크레딧을 드립니다. 이메일과 비밀번호만 있으면 됩니다.',
  de: 'Bei der Anmeldung gibt es $5 Guthaben. Nur E-Mail und Passwort – keine Bestätigung.',
  fr: "L'inscription inclut 5 $ de crédit. E-mail et mot de passe, sans vérification.",
  es: 'El registro incluye $5 de crédito. Solo correo y contraseña, sin verificación.',
  pt: 'O cadastro inclui $5 de crédito. Apenas e-mail e senha, sem verificação.',
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
  zh: '请填好邮箱和密码。', en: 'Enter your email and password.', ja: 'メールとパスワードを入力してください。', ko: '이메일과 비밀번호를 입력하세요.', de: 'Gib E-Mail und Passwort ein.', fr: 'Saisissez votre e-mail et votre mot de passe.', es: 'Introduce tu correo y contraseña.', pt: 'Informe e-mail e senha.',
};

export const failed: Localized<string> = {
  zh: '邮箱或密码不对，再试一次。', en: 'Email or password is wrong. Try again.', ja: 'メールかパスワードが違います。もう一度お試しください。', ko: '이메일이나 비밀번호가 틀렸습니다. 다시 시도하세요.', de: 'E-Mail oder Passwort ist falsch. Nochmal versuchen.', fr: 'E-mail ou mot de passe incorrect. Réessayez.', es: 'El correo o la contraseña no son correctos. Inténtalo de nuevo.', pt: 'E-mail ou senha incorretos. Tente novamente.',
};

export const weakPw: Localized<string> = {
  zh: '密码至少 8 位。', en: 'Use at least 8 characters.', ja: 'パスワードは 8 文字以上にしてください。', ko: '비밀번호는 최소 8자입니다.', de: 'Mindestens 8 Zeichen.', fr: 'Au moins 8 caractères.', es: 'Usa al menos 8 caracteres.', pt: 'Use pelo menos 8 caracteres.',
};

export const dupEmail: Localized<string> = {
  zh: '这个邮箱已经注册过了。', en: 'That email is already registered.', ja: 'そのメールはすでに登録されています。', ko: '이미 등록된 이메일입니다.', de: 'Diese E-Mail ist bereits registriert.', fr: 'Cet e-mail est déjà enregistré.', es: 'Ese correo ya está registrado.', pt: 'Esse e-mail já está registrado.',
};

export const signUpOk: Localized<string> = {
  zh: '注册成功，正在打开你的账户页…', en: 'Signed up. Opening your account…', ja: '登録が完了しました。アカウントページへ移動します…', ko: '가입 완료. 계정 페이지로 이동합니다…', de: 'Registriert. Konto wird geöffnet…', fr: 'Inscription réussie. Ouverture de votre compte…', es: 'Registro correcto. Abriendo tu cuenta…', pt: 'Cadastro concluído. Abrindo sua conta…',
};

export const goAccount: Localized<string> = {
  zh: '去我的账户', en: 'Go to account', ja: 'マイアカウントへ', ko: '내 계정으로', de: 'Zum Konto', fr: 'Aller au compte', es: 'Ir a mi cuenta', pt: 'Ir para minha conta',
};

export const pwRuleLen: Localized<string> = {
  zh: '至少 8 个字符', en: 'At least 8 characters', ja: '8 文字以上', ko: '최소 8자', de: 'Mindestens 8 Zeichen', fr: 'Au moins 8 caractères', es: 'Al menos 8 caracteres', pt: 'Pelo menos 8 caracteres',
};

export const pwRuleCommon: Localized<string> = {
  zh: '别用太好猜的密码', en: 'Avoid common passwords', ja: '推測されやすいパスワードは避ける', ko: '쉽게 맞히는 비밀번호는 피하기', de: 'Keine leicht zu erratenden Passwörter', fr: 'Évitez les mots de passe trop évidents', es: 'Evita contraseñas muy comunes', pt: 'Evite senhas muito comuns',
};

export const pwRuleEmail: Localized<string> = {
  zh: '别和邮箱一样', en: "Don't reuse your email", ja: 'メールと同じにしない', ko: '이메일과 같게 하지 않기', de: 'Nicht wie die E-Mail', fr: 'Pas identique à votre e-mail', es: 'No igual a tu correo', pt: 'Não igual ao seu e-mail',
};

export const pwWeak: Localized<string> = {
  zh: '弱', en: 'Weak', ja: '弱い', ko: '약함', de: 'Schwach', fr: 'Faible', es: 'Débil', pt: 'Fraca',
};

export const pwMedium: Localized<string> = {
  zh: '中', en: 'Fair', ja: '普通', ko: '보통', de: 'Mittel', fr: 'Moyen', es: 'Media', pt: 'Média',
};

export const pwStrong: Localized<string> = {
  zh: '强', en: 'Strong', ja: '強い', ko: '강함', de: 'Stark', fr: 'Fort', es: 'Fuerte', pt: 'Fuerte',
};

export const captchaLabel: Localized<string> = {
  zh: '安全验证', en: 'Quick check', ja: '確認テスト', ko: '간단 확인', de: 'Schnellprüfung', fr: 'Petite vérification', es: 'Comprobación', pt: 'Verificação',
};

export const captchaPlaceholder: Localized<string> = {
  zh: '填计算结果', en: 'Type the answer', ja: '計算結果を入力', ko: '계산 결과 입력', de: 'Ergebnis eingeben', fr: 'Tapez le résultat', es: 'Escribe el resultado', pt: 'Digite o resultado',
};

export const captchaRefresh: Localized<string> = {
  zh: '换一题', en: 'New question', ja: '別の問題', ko: '다른 문제', de: 'Neue Aufgabe', fr: 'Nouvelle question', es: 'Otra pregunta', pt: 'Outra pergunta',
};

export const captchaLoading: Localized<string> = {
  zh: '加载中…', en: 'Loading…', ja: '読み込み中…', ko: '불러오는 중…', de: 'Lädt…', fr: 'Chargement…', es: 'Cargando…', pt: 'Carregando…',
};

export const captchaNeed: Localized<string> = {
  zh: '先算一下上面的题。', en: 'Answer the question above first.', ja: 'まず上の問題に答えてください。', ko: '먼저 위의 문제에 답하세요.', de: 'Beantworte zuerst die Aufgabe oben.', fr: 'Répondez d\'abord à la question ci-dessus.', es: 'Responde primero la pregunta de arriba.', pt: 'Responda primeiro a pergunta acima.',
};

export const captchaWrong: Localized<string> = {
  zh: '结果不对或过期了，再试一次。', en: 'Wrong or expired. Try again.', ja: '結果が違うか期限切れです。もう一度どうぞ。', ko: '결과가 틀렸거나 만료되었습니다. 다시 시도하세요.', de: 'Falsch oder abgelaufen. Nochmal versuchen.', fr: 'Incorrect ou expiré. Réessayez.', es: 'Incorrecto o caducado. Inténtalo de nuevo.', pt: 'Incorreto ou expirado. Tente de novo.',
};

export const captchaFail: Localized<string> = {
  zh: '题目没加载出来，点「换一题」试试。', en: 'Could not load. Tap "New question" to retry.', ja: '読み込めませんでした。「別の問題」を押してください。', ko: '불러오지 못했습니다. "다른 문제"를 눌러 주세요.', de: 'Laden fehlgeschlagen. Tippe auf "Neue Aufgabe".', fr: 'Chargement impossible. Touchez « Nouvelle question ».', es: 'No se pudo cargar. Pulsa "Otra pregunta".', pt: 'Não foi possível carregar. Toque em "Outra pergunta".',
};
