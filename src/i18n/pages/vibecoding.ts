import type { Localized } from '../ui';

/** Vibe Coding 目录页与详情页的 8 语文案。en 必填，其余语言由 pick() 回退英文。 */
export const title: Localized<string> = {
  en: 'AI Vibe Coding',
  zh: 'AI 氛围编程',
  ja: 'AI バイブコーディング',
  ko: 'AI 바이브 코딩',
  de: 'AI-Vibe-Coding',
  fr: 'Vibe Coding IA',
  es: 'Vibe Coding con IA',
  pt: 'Vibe Coding com IA',
};

export const description: Localized<string> = {
  en: 'Sixteen hands-on AI vibe coding tutorials in five tracks, with copyable prompts, project configs, and complete runnable source.',
  zh: '16 篇跨五大方向的 AI 氛围编程实战教程，附带可复制的提示词、项目配置与完整可运行源码。',
  ja: '5つのトラックにわたる16の実践的なAIバイブコーディングチュートリアル。コピーできるプロンプト、設定、ソースを収録。',
  ko: '5개 트랙에 걸친 16개의 실전 AI 바이브 코딩 튜토리얼. 복사 가능한 프롬프트, 프로젝트 설정, 완전한 소스를 제공합니다.',
  de: 'Sechzehn praxisnahe AI-Vibe-Coding-Tutorials in fünf Tracks, mit kopierbaren Prompts, Projektkonfigurationen und vollständigem Quelltext.',
  fr: 'Seize tutoriels pratiques de vibe coding IA répartis sur cinq pistes, avec prompts, configurations et sources copiables.',
  es: 'Dieciséis tutoriales prácticos de vibe coding con IA en cinco rutas, con prompts, configuraciones y código copiable.',
  pt: 'Dezesseis tutoriais práticos de vibe coding com IA em cinco trilhas, com prompts, configurações e código copiável.',
};

export const eyebrow: Localized<string> = {
  en: 'Guides',
  zh: '指南',
  ja: 'ガイド',
  ko: '가이드',
  de: 'Leitfäden',
  fr: 'Guides',
  es: 'Guías',
  pt: 'Guias',
};

export const lead: Localized<string> = {
  en: 'Pick a track or search all 16 tutorials. Every one ships a copyable prompt, a project config, and a complete runnable program.',
  zh: '按方向筛选，或在 16 篇教程中搜索。每一篇都附带可复制的提示词、项目配置与完整可运行程序。',
  ja: 'トラックを選ぶか、16のチュートリアルを検索してください。どれにもコピーできるプロンプト、設定、完全なプログラムが付いています。',
  ko: '트랙을 고르거나 16개 튜토리얼을 검색하세요. 각각 복사 가능한 프롬프트, 프로젝트 설정, 완전한 실행 프로그램이 포함됩니다.',
  de: 'Wähle einen Track oder durchsuche alle 16 Tutorials. Jedes liefert einen kopierbaren Prompt, eine Projektkonfiguration und ein vollständiges Programm.',
  fr: 'Choisissez une piste ou recherchez parmi les 16 tutoriels. Chacun contient un prompt copiable, une configuration et un programme complet.',
  es: 'Elige una ruta o busca entre los 16 tutoriales. Cada uno incluye un prompt copiable, una configuración y un programa completo.',
  pt: 'Escolha uma trilha ou pesquise entre os 16 tutoriais. Cada um traz um prompt copiável, uma configuração e um programa completo.',
};

export const filterAll: Localized<string> = {
  en: 'All', zh: '全部', ja: 'すべて', ko: '전체', de: 'Alle', fr: 'Tout', es: 'Todo', pt: 'Tudo',
};

export const trackFoundations: Localized<string> = {
  en: 'Foundations',
  zh: '基础',
  ja: '基礎',
  ko: '기초',
  de: 'Grundlagen',
  fr: 'Fondations',
  es: 'Fundamentos',
  pt: 'Fundamentos',
};

export const trackWorkflows: Localized<string> = {
  en: 'Workflows',
  zh: '工作流',
  ja: 'ワークフロー',
  ko: '워크플로',
  de: 'Workflows',
  fr: 'Workflows',
  es: 'Flujos de trabajo',
  pt: 'Fluxos de trabalho',
};

export const trackBlueprints: Localized<string> = {
  en: 'Blueprints',
  zh: '实战蓝图',
  ja: '設計図',
  ko: '블루프린트',
  de: 'Blueprints',
  fr: 'Blueprints',
  es: 'Planos',
  pt: 'Blueprints',
};

export const trackOperations: Localized<string> = {
  en: 'Operations',
  zh: '运维',
  ja: '運用',
  ko: '운영',
  de: 'Betrieb',
  fr: 'Opérations',
  es: 'Operaciones',
  pt: 'Operações',
};

export const trackRoadmap: Localized<string> = {
  en: 'Roadmap',
  zh: '未来路线',
  ja: 'ロードマップ',
  ko: '로드맵',
  de: 'Roadmap',
  fr: 'Feuille de route',
  es: 'Hoja de ruta',
  pt: 'Roteiro',
};

export const searchPlaceholder: Localized<string> = {
  en: 'Search 16 tutorials by title, tagline, or track…',
  zh: '搜索 16 篇教程的标题、简介或方向…',
  ja: '16のチュートリアルをタイトル、紹介文、トラックで検索…',
  ko: '16개 튜토리얼을 제목, 소개, 트랙으로 검색…',
  de: '16 Tutorials nach Titel, Kurzbeschreibung oder Track suchen…',
  fr: 'Rechercher parmi 16 tutoriels par titre, accroche ou piste…',
  es: 'Buscar entre 16 tutoriales por título, descripción o ruta…',
  pt: 'Pesquisar 16 tutoriais por título, resumo ou trilha…',
};

export const levelBeginner: Localized<string> = {
  en: 'Beginner', zh: '入门', ja: '初級', ko: '입문', de: 'Einsteiger', fr: 'Débutant', es: 'Principiante', pt: 'Iniciante',
};

export const levelIntermediate: Localized<string> = {
  en: 'Intermediate', zh: '进阶', ja: '中級', ko: '중급', de: 'Fortgeschritten', fr: 'Intermédiaire', es: 'Intermedio', pt: 'Intermediário',
};

export const levelAdvanced: Localized<string> = {
  en: 'Advanced', zh: '高级', ja: '上級', ko: '고급', de: 'Experte', fr: 'Avancé', es: 'Avanzado', pt: 'Avançado',
};

export const completionLabel: Localized<string> = {
  en: 'Completion readiness',
  zh: '完成度',
  ja: '完了準備度',
  ko: '완료 준비도',
  de: 'Abschlussbereitschaft',
  fr: 'Prêt à finaliser',
  es: 'Preparación de finalización',
  pt: 'Prontidão de conclusão',
};

export const timeLabel: Localized<string> = {
  en: 'Reading time',
  zh: '阅读时间',
  ja: '読了時間',
  ko: '읽기 시간',
  de: 'Lesezeit',
  fr: 'Temps de lecture',
  es: 'Tiempo de lectura',
  pt: 'Tempo de leitura',
};

export const minutesSuffix: Localized<string> = {
  en: 'min', zh: '分钟', ja: '分', ko: '분', de: 'Min.', fr: 'min', es: 'min', pt: 'min',
};

export const overviewHeading: Localized<string> = {
  en: 'Overview', zh: '概述', ja: '概要', ko: '개요', de: 'Überblick', fr: 'Aperçu', es: 'Resumen', pt: 'Visão geral',
};

export const readinessHeading: Localized<string> = {
  en: 'Readiness note',
  zh: '可行性说明',
  ja: '準備状況メモ',
  ko: '준비 상태 메모',
  de: 'Bereitschaftshinweis',
  fr: 'Note de préparation',
  es: 'Nota de preparación',
  pt: 'Nota de prontidão',
};

export const stepsHeading: Localized<string> = {
  en: 'Playbook',
  zh: '实战步骤',
  ja: 'プレイブック',
  ko: '플레이북',
  de: 'Leitfaden',
  fr: 'Playbook',
  es: 'Guía de pasos',
  pt: 'Playbook',
};

export const promptHeading: Localized<string> = {
  en: 'Vibe coding prompt',
  zh: '氛围编程提示词',
  ja: 'バイブコーディング・プロンプト',
  ko: '바이브 코딩 프롬프트',
  de: 'Vibe-Coding-Prompt',
  fr: 'Prompt de vibe coding',
  es: 'Prompt de vibe coding',
  pt: 'Prompt de vibe coding',
};

export const configHeading: Localized<string> = {
  en: 'Project configuration file',
  zh: '项目配置文件',
  ja: 'プロジェクト設定ファイル',
  ko: '프로젝트 설정 파일',
  de: 'Projektkonfigurationsdatei',
  fr: 'Fichier de configuration du projet',
  es: 'Archivo de configuración del proyecto',
  pt: 'Arquivo de configuração do projeto',
};

export const programHeading: Localized<string> = {
  en: 'Complete runnable program',
  zh: '完整可运行程序',
  ja: '完全に実行可能なプログラム',
  ko: '완전한 실행 프로그램',
  de: 'Vollständiges lauffähiges Programm',
  fr: 'Programme complet exécutable',
  es: 'Programa completo ejecutable',
  pt: 'Programa completo executável',
};

export const relatedConfigHeading: Localized<string> = {
  en: 'Related scenario config',
  zh: '关联场景配置',
  ja: '関連シナリオ設定',
  ko: '관련 시나리오 설정',
  de: 'Zugehörige Szenario-Konfiguration',
  fr: 'Configuration de scénario associée',
  es: 'Configuración de escenario relacionada',
  pt: 'Configuração de cenário relacionada',
};

export const copyBtn: Localized<string> = {
  en: 'Copy', zh: '复制', ja: 'コピー', ko: '복사', de: 'Kopieren', fr: 'Copier', es: 'Copiar', pt: 'Copiar',
};

export const copiedBtn: Localized<string> = {
  en: 'Copied', zh: '已复制', ja: 'コピーしました', ko: '복사됨', de: 'Kopiert', fr: 'Copié', es: 'Copiado', pt: 'Copiado',
};

export const backToHub: Localized<string> = {
  en: 'All tutorials',
  zh: '全部教程',
  ja: 'すべてのチュートリアル',
  ko: '모든 튜토리얼',
  de: 'Alle Tutorials',
  fr: 'Tous les tutoriels',
  es: 'Todos los tutoriales',
  pt: 'Todos os tutoriais',
};

export const startTutorial: Localized<string> = {
  en: 'Start tutorial',
  zh: '开始教程',
  ja: 'チュートリアルを始める',
  ko: '튜토리얼 시작',
  de: 'Tutorial starten',
  fr: 'Commencer le tutoriel',
  es: 'Empezar el tutorial',
  pt: 'Começar o tutorial',
};

export const ctaTitle: Localized<string> = {
  en: 'Put these prompts to work on real traffic',
  zh: '把这套提示词用到真实流量上',
  ja: 'このプロンプトを実際のトラフィックで動かす',
  ko: '이 프롬프트를 실제 트래픽에 적용하세요',
  de: 'Diese Prompts mit echtem Traffic einsetzen',
  fr: 'Mettez ces prompts au travail sur du trafic réel',
  es: 'Pon estos prompts a trabajar con tráfico real',
  pt: 'Coloque estes prompts para trabalhar com tráfego real',
};

/** {credit} 由 server/plans.mjs 的 centsToUsd() 填入纯数字（5.00）；整句只有一个 $。 */
export const ctaLead: Localized<string> = {
  en: 'Try the playground for free, or register for ${credit} in API credit to call from your own code.',
  zh: '可免费体验试跑页，或注册领取 ${credit} API 额度，从自己的程序里调用。',
  ja: 'プレイグラウンドは無料で試せます。登録すると ${credit} の API クレジットが付与され、自分のコードから呼び出せます。',
  ko: '플레이그라운드는 무료로 시험할 수 있습니다. 가입하면 ${credit} API 크레딧을 받아 내 코드에서 호출할 수 있습니다.',
  de: 'Den Playground kostenlos ausprobieren oder registrieren und ${credit} API-Guthaben für den eigenen Code erhalten.',
  fr: 'Essayez le bac à sable gratuitement, ou inscrivez-vous pour ${credit} de crédit API et appelez depuis votre code.',
  es: 'Prueba el playground gratis o regístrate para obtener ${credit} de crédito API y llamar desde tu código.',
  pt: 'Experimente o playground gratuitamente ou cadastre-se e receba ${credit} de crédito API para chamar do seu código.',
};

export const ctaTry: Localized<string> = {
  en: 'Open playground',
  zh: '打开试跑',
  ja: 'プレイグラウンドを開く',
  ko: '플레이그라운드 열기',
  de: 'Playground öffnen',
  fr: 'Ouvrir le bac à sable',
  es: 'Abrir el playground',
  pt: 'Abrir o playground',
};

export const ctaRegister: Localized<string> = {
  en: 'Create account',
  zh: '注册账户',
  ja: 'アカウントを作成',
  ko: '계정 만들기',
  de: 'Konto erstellen',
  fr: 'Créer un compte',
  es: 'Crear cuenta',
  pt: 'Criar conta',
};

export const vibecodingCopy = {
  title,
  description,
  eyebrow,
  lead,
  filterAll,
  trackFoundations,
  trackWorkflows,
  trackBlueprints,
  trackOperations,
  trackRoadmap,
  searchPlaceholder,
  levelBeginner,
  levelIntermediate,
  levelAdvanced,
  completionLabel,
  timeLabel,
  minutesSuffix,
  overviewHeading,
  readinessHeading,
  stepsHeading,
  promptHeading,
  configHeading,
  programHeading,
  relatedConfigHeading,
  copyBtn,
  copiedBtn,
  backToHub,
  startTutorial,
  ctaTitle,
  ctaLead,
  ctaTry,
  ctaRegister,
};
