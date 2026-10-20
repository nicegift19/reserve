/** 숫자 표기 — DOM 의존 없음. */
export const fmt = (n: number): string => Math.round(n).toLocaleString('ko-KR');

/** 소수 최대 d자리, 천 단위 구분 */
export const dec = (n: number, d: number): string =>
  n.toLocaleString('ko-KR', { maximumFractionDigits: d });

export const pct = (r: number): string => `${Math.round(r * 100)}%`;
