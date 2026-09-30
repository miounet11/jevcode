/** 消消乐谜题：开局没有三连，一步相邻交换能凑出三连。 */

export const COLORS = ['R', 'G', 'B', 'Y', 'P'];

export const MATCH_QUESTION =
  'Which single adjacent swap creates a line of 3 or more identical tiles? If none of the listed swaps does, choose "no swap".';

export function mulberry32(seed) {
  let state = seed >>> 0;
  return function rng() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function at(w, r, c) {
  return r * w + c;
}

export function hasMatch(board, w, h) {
  for (let r = 0; r < h; r++) {
    let run = 1;
    for (let c = 1; c < w; c++) {
      if (board[at(w, r, c)] === board[at(w, r, c - 1)]) {
        run += 1;
        if (run >= 3) return true;
      } else {
        run = 1;
      }
    }
  }
  for (let c = 0; c < w; c++) {
    let run = 1;
    for (let r = 1; r < h; r++) {
      if (board[at(w, r, c)] === board[at(w, r - 1, c)]) {
        run += 1;
        if (run >= 3) return true;
      } else {
        run = 1;
      }
    }
  }
  return false;
}

export function swap(board, a, b) {
  const next = board.slice();
  const held = next[a];
  next[a] = next[b];
  next[b] = held;
  return next;
}

export function neighbors(w, h) {
  const moves = [];
  for (let r = 0; r < h; r++) {
    for (let c = 0; c < w; c++) {
      const i = at(w, r, c);
      if (c + 1 < w) moves.push({ a: i, b: i + 1, label: `swap (${r},${c})-(${r},${c + 1})` });
      if (r + 1 < h) moves.push({ a: i, b: i + w, label: `swap (${r},${c})-(${r + 1},${c})` });
    }
  }
  return moves;
}

export function clearingMoves(board, w, h) {
  return neighbors(w, h).filter((move) => hasMatch(swap(board, move.a, move.b), w, h));
}

export function renderBoard(board, w) {
  const rows = [];
  for (let i = 0; i < board.length; i += w) rows.push(board.slice(i, i + w).join(' '));
  return rows.join('\n');
}

function shuffle(list, rng) {
  const next = list.slice();
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    const held = next[i];
    next[i] = next[j];
    next[j] = held;
  }
  return next;
}

/**
 * 生成一道只有 1～3 个正确交换的题。choices 里一定包含这些正确步、若干无效步和 "no swap"。
 * 返回 null 表示这个种子没碰到合适的盘面。
 */
export function makePuzzle(seed, w = 6, h = 5) {
  const rng = mulberry32(seed);
  for (let attempt = 0; attempt < 400; attempt++) {
    const board = Array.from({ length: w * h }, () => COLORS[Math.floor(rng() * COLORS.length)]);
    if (hasMatch(board, w, h)) continue;
    const good = clearingMoves(board, w, h);
    if (good.length < 1 || good.length > 3) continue;
    const bad = neighbors(w, h).filter((move) => !good.some((item) => item.label === move.label));
    const distractors = shuffle(bad, rng).slice(0, Math.max(0, 7 - good.length));
    const labels = shuffle(
      [...good.map((move) => move.label), ...distractors.map((move) => move.label), 'no swap'],
      rng,
    );
    return {
      board,
      w,
      h,
      context:
        `Match-3 board, ${w} columns, top row first. Tiles are R G B Y P. ` +
        `The board currently has no line of 3.\n${renderBoard(board, w)}`,
      question: MATCH_QUESTION,
      choices: labels,
      accept: good.map((move) => move.label),
    };
  }
  return null;
}
