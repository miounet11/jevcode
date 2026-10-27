import type { Localized } from '../ui';

export const title: Localized<string> = {
  zh: '每日案例',
  en: 'Daily cases',
  ja: '毎日の事例',
  ko: '매일의 사례',
  de: 'Tägliche Fälle',
  fr: 'Cas du jour',
  es: 'Casos diarios',
  pt: 'Casos diários',
};

export const lead: Localized<string> = {
  zh: '每天从覆盖语料发布至少 50 条还没发过的案例。正文是语料原句。接受选项是语料标注，不是模型分数。',
  en: 'At least 50 unpublished cases from the coverage bank go out each day. The body is the bank’s own wording. Accepted options are the bank’s labels, not a model score.',
  ja: 'カバーコーパスから未公開の事例を毎日 50 件以上出します。本文はコーパスの原文です。受け入れ選択肢はコーパスのラベルであり、モデルの点数ではありません。',
  ko: '커버리지 말뭉치에서 아직 내지 않은 사례를 매일 50편 이상 발행합니다. 본문은 말뭉치의 원문입니다. 수용 선택지는 말뭉치 라벨이며 모델 점수가 아닙니다.',
  de: 'Jeden Tag gehen mindestens 50 noch nicht veröffentlichte Fälle aus dem Abdeckungskorpus hinaus. Der Text ist der Wortlaut des Korpus. Akzeptierte Optionen sind Korpus-Labels, keine Modellpunktzahl.',
  fr: 'Au moins 50 cas encore inédits du corpus de couverture sortent chaque jour. Le texte est celui du corpus. Les options acceptées sont les étiquettes du corpus, pas un score de modèle.',
  es: 'Cada día salen al menos 50 casos aún no publicados del banco de cobertura. El texto es el del banco. Las opciones aceptadas son etiquetas del banco, no una puntuación del modelo.',
  pt: 'Todos os dias saem pelo menos 50 casos ainda não publicados do banco de cobertura. O texto é o do banco. As opções aceitas são rótulos do banco, não uma nota do modelo.',
};

export const back: Localized<string> = {
  zh: '返回每日案例', en: 'Back to daily cases', ja: '毎日の事例に戻る', ko: '매일의 사례로', de: 'Zurück zu den täglichen Fällen', fr: 'Retour aux cas du jour', es: 'Volver a los casos diarios', pt: 'Voltar aos casos diários',
};

export const published: Localized<string> = {
  zh: '发布日', en: 'Published', ja: '公開日', ko: '발행일', de: 'Veröffentlicht', fr: 'Publié', es: 'Publicado', pt: 'Publicado',
};

export const contextLabel: Localized<string> = {
  zh: '状态', en: 'State', ja: '状態', ko: '상태', de: 'Zustand', fr: 'État', es: 'Estado', pt: 'Estado',
};

export const questionLabel: Localized<string> = {
  zh: '问题', en: 'Question', ja: '質問', ko: '질문', de: 'Frage', fr: 'Question', es: 'Pregunta', pt: 'Pergunta',
};

export const choicesLabel: Localized<string> = {
  zh: '选项', en: 'Options', ja: '選択肢', ko: '선택지', de: 'Optionen', fr: 'Options', es: 'Opciones', pt: 'Opções',
};

export const acceptLabel: Localized<string> = {
  zh: '语料接受的选项', en: 'Accepted in the case bank', ja: 'コーパスが受け入れる選択肢', ko: '말뭉치가 수용하는 선택지', de: 'Im Korpus akzeptiert', fr: 'Accepté dans le corpus', es: 'Aceptado en el banco', pt: 'Aceito no banco',
};

export const judgmentLabel: Localized<string> = {
  zh: '这次调用返回的选项', en: 'Choice returned by this call', ja: 'この呼び出しが返した選択肢', ko: '이번 호출이 반환한 선택지', de: 'Von diesem Aufruf zurückgegebene Option', fr: 'Option renvoyée par cet appel', es: 'Opción devuelta por esta llamada', pt: 'Opção devolvida por esta chamada',
};

export const probabilitiesLabel: Localized<string> = {
  zh: '各选项概率', en: 'Probability per option', ja: '選択肢ごとの確率', ko: '선택지별 확률', de: 'Wahrscheinlichkeit je Option', fr: 'Probabilité par option', es: 'Probabilidad por opción', pt: 'Probabilidade por opção',
};

export const noJudgment: Localized<string> = {
  zh: '这一篇没有记下成功的调用。', en: 'This case has no successful call on record.', ja: 'この事例には成功した呼び出しの記録がありません。', ko: '이 사례에는 성공한 호출 기록이 없습니다.', de: 'Für diesen Fall ist kein erfolgreicher Aufruf verzeichnet.', fr: 'Cet exemple n’a pas d’appel réussi en registre.', es: 'Este caso no tiene una llamada correcta registrada.', pt: 'Este caso não tem uma chamada bem-sucedida registrada.',
};

export const paginationLabel: Localized<string> = {
  zh: '分页', en: 'Pagination', ja: 'ページ送り', ko: '페이지 탐색', de: 'Seitennavigation', fr: 'Pagination', es: 'Paginación', pt: 'Paginação',
};

export const totalLabel: Localized<string> = {
  zh: '已发布', en: 'Published', ja: '公開済み', ko: '발행됨', de: 'Veröffentlicht', fr: 'Publiés', es: 'Publicados', pt: 'Publicados',
};

export const latestLabel: Localized<string> = {
  zh: '按发布日倒序分页显示，每页 100 篇。', en: 'Newest first, 100 per page.', ja: '公開日の新しい順に 1 ページ 100 件ずつ表示します。', ko: '발행일 최신순으로 페이지당 100편씩 표시합니다.', de: 'Neueste zuerst, 100 pro Seite.', fr: 'Les plus récents d’abord, 100 par page.', es: 'Los más recientes primero, 100 por página.', pt: 'Os mais recentes primeiro, 100 por página.',
};
