/**
 * 페이지 무결성 — PRD F1.4(각주-출처 id 일치), F2.4·§8-4(본문 숫자 = 모델 결과), 외부 링크 규칙.
 * 정적 HTML(index.html)과 각주를 생성하는 UI 코드(src/ui/*.ts), parameters.json의 출처 id를 함께 검사한다.
 */
import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import sources from '../data/sources.json';
import params from '../data/parameters.json';
import { textValues } from './derived';

const root = join(__dirname, '..');
const html = readFileSync(join(root, 'index.html'), 'utf8');
const uiDir = join(root, 'src', 'ui');
const uiCode = readdirSync(uiDir).filter(f => f.endsWith('.ts')).map(f => readFileSync(join(uiDir, f), 'utf8')).join('\n');
const ids = new Set(sources.sources.map(s => s.id));

/** parameters.json 안의 모든 sources / paySources / efficiencySources 배열 수집 */
function paramSourceIds(o: unknown, out: number[] = []): number[] {
  if (Array.isArray(o)) o.forEach(v => paramSourceIds(v, out));
  else if (o && typeof o === 'object') {
    for (const [k, v] of Object.entries(o)) {
      if (/sources$/i.test(k) && Array.isArray(v)) out.push(...(v as number[]));
      else paramSourceIds(v, out);
    }
  }
  return out;
}

const decode = (s: string) => s.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const norm = (s: string) => decode(s).replace(/\s+/g, ' ').trim();

describe('각주 무결성 (PRD F1.4)', () => {
  it('index.html의 모든 href="#src-n"이 sources.json id에 있다', () => {
    const refs = [...html.matchAll(/href="#src-(\d+)"/g)].map(m => +m[1]);
    expect(refs.length).toBeGreaterThan(20);
    expect(refs.filter(n => !ids.has(n))).toEqual([]);
  });
  it('빌드 결과(dist/index.html)가 있으면 그것도 검사한다', () => {
    const p = join(root, 'dist', 'index.html');
    if (!existsSync(p)) return;
    const refs = [...readFileSync(p, 'utf8').matchAll(/href="#src-(\d+)"/g)].map(m => +m[1]);
    expect(refs.filter(n => !ids.has(n))).toEqual([]);
  });
  it('UI 코드의 cite(n) 호출과 parameters.json 출처 id가 sources.json에 있다', () => {
    const fromCode = [...uiCode.matchAll(/\bcite\((\d+)\)/g)].map(m => +m[1]);
    expect([...fromCode, ...paramSourceIds(params)].filter(n => !ids.has(n))).toEqual([]);
  });
  it('각주 표기 [n]과 링크 대상 #src-n이 같다', () => {
    const bad = [...html.matchAll(/<a class="cite[^"]*" href="#src-(\d+)">\[(\d+|n)\]<\/a>/g)].filter(m => m[2] !== 'n' && m[1] !== m[2]);
    expect(bad.map(m => m[0])).toEqual([]);
  });
});

describe('외부 링크', () => {
  it('index.html의 외부 링크(a href)는 새 탭 + rel="noopener"', () => {
    const anchors = [...html.matchAll(/<a\b[^>]*href="https?:[^"]*"[^>]*>/g)].map(m => m[0]);
    anchors.forEach(a => {
      expect(a).toMatch(/target="_blank"/);
      expect(a).toMatch(/rel="[^"]*noopener/);
    });
  });
  it('출처 목록 렌더러가 target·rel을 붙인다', () => {
    expect(uiCode).toMatch(/class="ext" href="\$\{s\.url\}" target="_blank" rel="noopener"/);
  });
});

describe('본문 숫자 = 모델 결과 (PRD F2.4, §8-4)', () => {
  const v = textValues();
  const spans = [...html.matchAll(/<(\w+)[^>]*\sdata-v="([^"]+)"[^>]*>([\s\S]*?)<\/\1>/g)];

  it('data-v 키는 모두 모델 값이 있다', () => {
    expect(spans.length).toBeGreaterThan(20);
    expect(spans.map(m => m[2]).filter(k => !(k in v))).toEqual([]);
  });
  it.each(spans.map(m => [m[2], m[3]]))('%s 기본 문구가 모델 결과와 같다', (key, text) => {
    expect(norm(text)).toBe(norm(v[key]));
  });
  it('결론 숫자 (METHODOLOGY 부록 A·C)', () => {
    expect(v.heroNeeds).toBe('180일형 1.5명, 90일형 3.2명, 60일형 5.1명, 30일형 12.3명');
    expect(v.longRatioRange).toBe('55~62%');
    expect(v.longNeedRange).toBe('1.5~3.2명');
    expect(v.d30Ratio).toBe('85%');
    expect(v.overText).toBe('3분의 1(10명)');
    expect(v.breakEvenE).toBe('0.47');
    expect(v.breakEvenPay).toBe('28.7');
    expect(v.ratio180OfActive).toBe('38%');
  });
});
