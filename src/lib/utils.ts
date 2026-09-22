import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** 「31年(1368-1398)」→「1368 — 1398」 */
export function formatReign(raw: string): string {
  return raw.replace(/\s+/g, ' ').trim();
}

/** 数字转中文年份区间展示 */
export function formatSpan(start?: number, end?: number): string {
  if (!start) return '—';
  if (!end || end === start) return `${start} 年`;
  return `${start} — ${end}`;
}
