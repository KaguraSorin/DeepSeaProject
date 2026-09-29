import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** 条件类名合并，避免 Tailwind 样式冲突 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}