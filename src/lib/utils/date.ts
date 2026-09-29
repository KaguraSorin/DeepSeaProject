/** 日期工具：统一使用 ISO yyyy-MM-dd 字符串（本地时区，避免 UTC 偏移） */

export function toISODate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function todayISO(): string {
  return toISODate(new Date());
}

export function parseISODate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function addDays(iso: string, days: number): string {
  const d = parseISODate(iso);
  d.setDate(d.getDate() + days);
  return toISODate(d);
}

/** 含头不含尾的天数差：deadline - start */
export function daysBetween(startISO: string, endISO: string): number {
  const a = parseISODate(startISO).getTime();
  const b = parseISODate(endISO).getTime();
  return Math.round((b - a) / 86400000);
}

export function diffFromToday(iso: string): number {
  return daysBetween(todayISO(), iso);
}

export function isPast(iso: string): boolean {
  return diffFromToday(iso) < 0;
}

/** 判断 iso 是否为「昨天」 */
export function isYesterday(iso: string, ref = todayISO()): boolean {
  return daysBetween(iso, ref) === 1;
}

export function isSameDay(a: string, b: string): boolean {
  return a === b;
}

/** 周几（0=周日） */
export function weekdayIndex(iso: string): number {
  return parseISODate(iso).getDay();
}

export function formatCN(iso: string): string {
  const d = parseISODate(iso);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

export function formatCNFull(iso: string): string {
  const d = parseISODate(iso);
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
}

/** 把两个日期之间的每一天列出（含头含尾） */
export function eachDay(startISO: string, endISO: string): string[] {
  const out: string[] = [];
  const total = daysBetween(startISO, endISO);
  for (let i = 0; i <= total; i++) out.push(addDays(startISO, i));
  return out;
}