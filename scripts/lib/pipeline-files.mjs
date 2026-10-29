/**
 * 管线的文件白名单。
 *
 * 单独成模块是为了让测试能直接断言「哪些文件会被发布」，而不是在
 * pipeline.mjs 源码里正则搜字符串——后者在注释或无关代码里命中同样会通过。
 */

/** 抓取会写回这些【已跟踪】文件；非发布路径必须全部还原，否则脏工作区
 *  会让 cron 的脏区保护在下一轮永久跳过（自锁死循环，实测复现）。
 *  动态卡片的两个产物同样由抓取阶段写入，必须一起还原。 */
export const FETCHED_FILES = [
  'src/data/ecosystem.ts',
  'src/data/community.ts',
  'data/builds/cards.json',
  'public/data/jev-cards.json',
  'src/data/lab-supplement.json',
  'src/data/lab-records.json',
  'src/data/daily-briefs.json',
  // 案例译文与术语表由抓取阶段的翻译步骤写回，和 daily-briefs.json 同批生灭。
  // 漏掉还原会在门 1 HOLD 退出时留下脏文件，cron 的脏区保护下一轮就永久拦下。
  'src/data/briefs-i18n.json',
  'src/data/brief-terms.json',
  'src/data/brief-terms.ts',
  // /jev 覆盖语料：候选池与生成的登记表。两者都由抓取阶段写入，
  // 未发布时必须一起还原，否则脏区保护会在下一轮永久拦下。
  'data/jev/shortlist.json',
  'src/lib/content/registry-claims.ts',
];

/** 允许进入自动提交的路径。其余工作区改动留在原地，不进这次发布。 */
export const STAGE_FILES = [
  'src/data/ecosystem.ts',
  'src/data/community.ts',
  'data/builds/cards.json',
  'public/data/jev-cards.json',
  'src/data/lab-supplement.json',
  'src/data/lab-records.json',
  'src/data/daily-briefs.json',
  // 案例的多语言正文与术语表跟随案例一起发布，否则语言站点拿不到增量。
  'src/data/briefs-i18n.json',
  'src/data/brief-terms.json',
  'src/data/brief-terms.ts',
  // /jev 覆盖语料的增量。没有新候选时这两个文件不变，不影响提交范围。
  'data/jev/shortlist.json',
  'src/lib/content/registry-claims.ts',
];

/** 有改动就说明本轮有内容可发（用于判断「这一轮不是空跑」）。 */
export const SIDE_FILES = [
  'src/data/community.ts',
  'src/data/lab-supplement.json',
  'src/data/lab-records.json',
  'src/data/daily-briefs.json',
  'src/data/briefs-i18n.json',
  'src/data/brief-terms.json',
  'src/data/brief-terms.ts',
  // /jev 新增条目本身就是一份可发布增量：生成器已逐条回源核对，
  // 不再过门 1。没有它，只有新收录仓库的那天会被判成「没内容」而空跑。
  'src/lib/content/registry-claims.ts',
];
