import type { Rank } from '../../src/types/index';

const CN_DIGIT: Record<string, number> = {
  零: 0,
  一: 1,
  二: 2,
  三: 3,
  四: 4,
  五: 5,
  六: 6,
  七: 7,
  八: 8,
  九: 9,
};

/** 中文数字转阿拉伯数字，支持「十」「二十六」等 */
export function cnToNumber(text: string): number {
  const s = text.trim();
  if (!s) return 0;
  if (/^\d+$/.test(s)) return Number(s);
  if (s === '十') return 10;
  const match = s.match(/^(十)?([一二三四五六七八九])?$/);
  if (match && (match[1] || match[2])) {
    const tens = match[1] ? 10 : 0;
    const ones = match[2] ? CN_DIGIT[match[2]] : 0;
    return tens + ones;
  }
  const tensIdx = s.indexOf('十');
  if (tensIdx > 0) {
    const tens = CN_DIGIT[s[tensIdx - 1]] ?? 1;
    const rest = s.slice(tensIdx + 1);
    return tens * 10 + (rest ? CN_DIGIT[rest] ?? 0 : 0);
  }
  return 0;
}

const SPECIAL_RANK: Record<string, { sort: number; label: string }> = {
  超品: { sort: 0, label: '超品' },
  未入流: { sort: 100, label: '未入流' },
  无品级: { sort: 101, label: '无品级' },
};

/**
 * 解析品级文案：正一品 / 从一品 / 未入流 / 超品 / 无品级
 * sort 越小越尊：正一品(10) → 从一品(15) → 正二品(20) ...
 */
export function parseRank(raw: string): Rank {
  const label = raw.replace(/\s+/g, '').trim();
  if (!label) return { key: 'unknown', label: '未详', level: 0, secondary: false, sort: 999 };

  const special = SPECIAL_RANK[label];
  if (special) {
    return { key: label, label: special.label, level: 0, secondary: false, sort: special.sort };
  }

  const m = label.match(/^([正从])([一二三四五六七八九])品$/);
  if (!m) return { key: label, label, level: 0, secondary: false, sort: 999 };

  const level = cnToNumber(m[2]);
  const secondary = m[1] === '从';
  return {
    key: `${secondary ? 'cong' : 'zheng'}-${level}`,
    label,
    level,
    secondary,
    sort: level * 10 + (secondary ? 5 : 0),
  };
}

/** 去除人名中的空格，如「朱  棣」→「朱棣」 */
export function tidyName(text: string): string {
  return text.replace(/\s+/g, '').trim();
}

/** 按分隔符切分并清理 */
export function splitChain(text: string, sep = '→'): string[] {
  return text
    .split(sep)
    .map((s) => s.trim())
    .filter(Boolean);
}
