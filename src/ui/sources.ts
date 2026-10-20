import data from '../../data/sources.json';
import { $ } from './dom';

const LV = data.levels as Record<string, string>;
const titleById = new Map(data.sources.map(s => [s.id, s.title]));

/** 출처 목록 (PRD F1.2) */
export function renderSources(): void {
  const [y, m, d] = data.retrievedAt.split('-').map(Number);
  $('retrievedAt').textContent = `${y}년 ${m}월 ${d}일`;
  $('srcList').innerHTML = data.sources.map(s => `<li id="src-${s.id}"><span class="id">[${s.id}]</span><div class="body">`
    + `<span class="t">${s.title}</span>`
    + `<span class="meta"><span>${s.publisher}</span><span class="badge ${s.level}">${LV[s.level]} · ${s.type}</span></span>`
    + `<span class="claims">인용 내용: ${s.claims.join(', ')}</span>`
    + `<a class="ext" href="${s.url}" target="_blank" rel="noopener">${s.url}</a></div></li>`).join('');
}

/** 각주 접근성 라벨·툴팁 (PRD F1.5, §6). 동적으로 다시 그린 영역에도 호출한다. */
export function enhanceCites(root: ParentNode = document): void {
  root.querySelectorAll<HTMLAnchorElement>('a.cite[href^="#src-"]').forEach(a => {
    const id = Number(a.getAttribute('href')!.slice(5));
    a.setAttribute('aria-label', `출처 ${id}`);
    const t = titleById.get(id);
    if (t) a.dataset.tip = t;
  });
}
