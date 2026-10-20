import { describe, it, expect } from 'vitest';
import {
  DEFAULT_CONFIG as cfg, activeAnnualCost, activeBlendedCost, reserveAnnualCost,
  effectiveDays, requiredPerActive, costPerActiveEquivalent, optimize,
  breakEvenEfficiency, breakEvenDailyPay,
} from './model';
import sources from '../data/sources.json';

const [d30, d60, d90, d180] = cfg.types;

describe('METHODOLOGY 부록 A — 단가', () => {
  it('현역 총비용 (단계 1·2)', () => {
    const [cpt, msg, ssg] = cfg.ranks.map(r => activeAnnualCost(r.monthlyPay, cfg.active));
    expect([cpt, msg, ssg]).toEqual([8831, 8202, 7103]);
    expect(activeBlendedCost(cfg)).toBe(8000);
  });
  it('상비 1인 총비용 (단계 4)', () => {
    expect(cfg.types.map(t => reserveAnnualCost(t, cfg.mealPerDay))).toEqual([552, 1104, 1581, 3012]);
  });
  it('유효 근무일·필요 인원 (단계 5·6)', () => {
    expect(effectiveDays(d180)).toBeCloseTo(153.9, 6);
    expect(effectiveDays(d30)).toBeCloseTo(18.36, 6);
    expect(cfg.types.map(t => +requiredPerActive(t, 225).toFixed(2))).toEqual([12.25, 5.08, 3.16, 1.46]);
  });
  it('현역 1명분 비용·비율 (단계 7)', () => {
    expect(cfg.types.map(t => Math.round(costPerActiveEquivalent(t, cfg)))).toEqual([6765, 5610, 4991, 4404]);
    expect(cfg.types.map(t => Math.round(costPerActiveEquivalent(t, cfg) / 8000 * 100))).toEqual([85, 70, 62, 55]);
  });
});

describe('METHODOLOGY 부록 B — 시나리오 (W=10, K=1.5)', () => {
  const cases: [number, number[], number, number, boolean][] = [
    // R, [n30,n60,n90,n180], cost, maxPeople, over
    [3,  [5, 0, 2, 3],   14958, 40, false],
    [5,  [0, 0, 5, 5],   22965, 37, false],
    [8,  [3, 6, 10, 5],  39150, 33, false],
    [10, [1, 17, 10, 5], 50190, 30, true],
    [12, [11, 23, 10, 5], 62334, 27, true],
  ];
  it.each(cases)('R=%i', (R, mix, cost, maxPeople, over) => {
    const r = optimize({ replace: R, wartimeTarget: 10, mgmtRatio: 1.5, activeCost: 8000 });
    expect(r.mix).toEqual(mix);
    expect(Math.round(r.cost)).toBe(cost);
    expect(r.maxPeople).toBe(maxPeople);
    expect(r.overMgmt).toBe(over);
    expect(r.effectiveDays).toBeGreaterThanOrEqual(r.requiredDays);
  });
  it('공급 부족 시 조합 없음', () => {
    const tiny = { ...cfg, types: cfg.types.map(t => ({ ...t, cap: 1 })) };
    expect(optimize({ replace: 10, wartimeTarget: 0, mgmtRatio: 1.5, activeCost: 8000 }, tiny).mix).toBeNull();
  });
});

describe('METHODOLOGY 부록 C — 손익분기', () => {
  it('180일형', () => {
    expect(breakEvenEfficiency(d180, cfg, 8000)).toBeCloseTo(0.4706, 3);
    expect(breakEvenDailyPay(d180, cfg, 8000)).toBeCloseTo(28.7, 1);
  });
});

describe('출처 데이터 무결성', () => {
  it('id는 1부터 연속, URL은 https', () => {
    const ids = sources.sources.map(s => s.id);
    expect(ids).toEqual(ids.map((_, i) => i + 1));
    sources.sources.forEach(s => expect(s.url.startsWith('https://')).toBe(true));
  });
  // 각주 href="#src-n" ↔ sources id 검사는 src/site.test.ts
});

// 미사용 경고 방지
void d60; void d90;
