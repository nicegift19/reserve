import { textValues } from '../derived';

/** data-v="키" 요소를 모델 결과로 채운다 (PRD F2.4). HTML 기본 문구는 derived.test.ts가 검증. */
export function fillTextValues(): void {
  const v = textValues();
  document.querySelectorAll<HTMLElement>('[data-v]').forEach(el => {
    const key = el.dataset.v!;
    if (key in v) el.textContent = v[key];
    else console.warn(`data-v="${key}" 값 없음`);
  });
}
