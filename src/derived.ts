/**
 * 본문 문장·예시 계산에 들어가는 숫자 — 모두 src/model.ts 결과에서 만든다 (PRD F2.4, §8-4).
 * index.html의 data-v="키" 요소가 이 값으로 채워지고, derived.test.ts가 HTML 기본 문구와 일치하는지 검증한다.
 */
import params from '../data/parameters.json';
import {
  DEFAULT_CONFIG, ModelConfig, activeAnnualCost, activeBlendedCost, reserveAnnualCost, efficiency,
  effectiveDays, requiredPerActive, costPerActiveEquivalent, optimize, breakEvenEfficiency, breakEvenDailyPay,
} from './model';
import { fmt, dec, pct } from './format';

export function textValues(cfg: ModelConfig = DEFAULT_CONFIG): Record<string, string> {
  const [d30, d60, d90, d180] = cfg.types;
  const capsLongFirst = [d180, d90, d60, d30];
  const a = cfg.active;
  const actBlend = activeBlendedCost(cfg);
  const need = (t = d180) => requiredPerActive(t, cfg.activeWorkDays);
  const ratio = (t = d180) => costPerActiveEquivalent(t, cfg) / actBlend;
  const D = cfg.activeWorkDays;

  // 단계 1 예시: 가장 마지막 계급(중사 10호봉)
  const ex = cfg.ranks[cfg.ranks.length - 1];
  const y = ex.monthlyPay * 12, yA = y * (1 + a.allowanceRate), yP = yA * (1 + a.pensionRate);

  // 단계 2 예시
  const rankCosts = cfg.ranks.map(r => activeAnnualCost(r.monthlyPay, a));
  const sumW = cfg.ranks.reduce((s, r) => s + r.weight, 0);
  const rawBlend = cfg.ranks.reduce((s, r, i) => s + rankCosts[i] * r.weight, 0) / sumW;

  const rc = (t = d180) => reserveAnnualCost(t, cfg.mealPerDay);
  const ex4 = (t = d180) => `${t.label}: ${t.days} × (${t.dailyPay} + ${cfg.mealPerDay}) + ${t.fixed} = ${fmt(rc(t))}만원`;
  const ex6 = (t = d180) =>
    `${t.label}: ${t.days} × ${dec(efficiency(t), 3)} = ${dec(effectiveDays(t), 2)}일 → ${D} ÷ ${dec(effectiveDays(t), 2)} = ${need(t).toFixed(2)}명`;
  const ex7 = (t = d180) => {
    const c = costPerActiveEquivalent(t, cfg);
    return `${t.label}: ${need(t).toFixed(3)} × ${fmt(rc(t))} = ${fmt(c)}만원 → ${fmt(c)} ÷ ${fmt(actBlend)} = ${pct(c / actBlend)}`;
  };

  // 결론 4: 시나리오에서 처음으로 관리 한도를 넘는 결원 규모
  const od = params.optimizerDefaults;
  const overR = params.scenarioReplaceList.find(R =>
    optimize({ replace: R, wartimeTarget: od.wartimeTarget, mgmtRatio: od.mgmtRatio, activeCost: actBlend }, cfg).overMgmt);
  const total = cfg.battalionActiveTotal;
  const overText = overR === undefined ? '' :
    overR * 3 === total ? `3분의 1(${overR}명)` : `${pct(overR / total)}(${overR}명)`;

  return {
    workDays: String(D),
    activeBlend: fmt(actBlend),
    heroNeeds: capsLongFirst.map(t => `${t.label} ${need(t).toFixed(1)}명`).join(', '),
    ratio180OfActive: pct(rc(d180) / actBlend),

    rankPays: cfg.ranks.map(r => `${r.label} ${r.monthlyPay}만`).join(', '),
    allowanceRate: pct(a.allowanceRate),
    pensionRate: pct(a.pensionRate),
    indirect: fmt(a.indirect),
    accession: fmt(a.accession),
    rankWeights: `위관 ${cfg.ranks[0].weight} : 상사급 ${cfg.ranks[1].weight} : 중사급 ${cfg.ranks[2].weight}`,
    meal: String(cfg.mealPerDay),
    fixed: String(d180.fixed),
    d30Pay: String(d30.dailyPay),
    longP: d180.P.toFixed(2),
    d30P: d30.P.toFixed(2),
    capList: capsLongFirst.map(t => `${t.label} ${t.cap}`).join('·') + '명',
    capListComma: capsLongFirst.map(t => `${t.label} ${t.cap}`).join(', '),
    mgmtRatio: `${od.mgmtRatio}명`,

    ex1: `예) ${ex.label}: ${ex.monthlyPay} × 12 = ${dec(y, 2)}\n    × ${1 + a.allowanceRate} = ${dec(yA, 2)}  × ${1 + a.pensionRate} = ${dec(yP, 2)}  + ${fmt(a.indirect)} + ${fmt(a.accession)} = ${fmt(activeAnnualCost(ex.monthlyPay, a))}만원`,
    ex2: `(${cfg.ranks.map((r, i) => `${fmt(rankCosts[i])} × ${r.weight}`).join(' + ')}) ÷ ${dec(sumW, 2)} = ${dec(rawBlend, 1)} → ${fmt(actBlend)}만원`,
    ex4: `예) ${ex4(d180)}\n    ${ex4(d30)}`,
    ex6: `예) ${ex6(d180)}\n    ${ex6(d30)}`,
    ex7: `예) ${ex7(d180)}\n    ${ex7(d30)}`,

    breakEvenE: breakEvenEfficiency(d180, cfg, actBlend).toFixed(2),
    breakEvenFormula: `${D} × ${fmt(rc(d180))} ÷ (${d180.days} × ${fmt(actBlend)}) = ${breakEvenEfficiency(d180, cfg, actBlend).toFixed(2)}`,
    breakEvenPay: breakEvenDailyPay(d180, cfg, actBlend).toFixed(1),

    longRatioRange: `${Math.round(ratio(d180) * 100)}~${pct(ratio(d90))}`,
    longNeedRange: `${need(d180).toFixed(1)}~${need(d90).toFixed(1)}명`,
    d30NeedFloor: String(Math.floor(need(d30))),
    d30Ratio: pct(ratio(d30)),
    overText,
  };
}
