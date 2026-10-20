export const $ = <T extends HTMLElement = HTMLElement>(id: string): T => {
  const el = document.getElementById(id);
  if (!el) throw new Error(`#${id} 없음`);
  return el as T;
};

export const cite = (n: number): string => `<a class="cite" href="#src-${n}">[${n}]</a>`;
export const cites = (ns: number[]): string => [...new Set(ns)].sort((a, b) => a - b).map(cite).join('');

/** 유형 인덱스(30·60·90·180) 순서의 막대 색 */
export const TYPE_COLORS = ['var(--s4)', 'var(--s3)', 'var(--s2)', 'var(--s1)'];
/** 표·카드는 장기형부터 */
export const LONG_FIRST = [3, 2, 1, 0];
