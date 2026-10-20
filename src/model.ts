/**
 * 상비예비군 대체 분석 모델 — docs/METHODOLOGY.md 단계 1~8 구현.
 * 순수 함수만 둔다(DOM 의존 없음). 단위: 만원·일·명.
 */
import params from '../data/parameters.json';

export interface Rank { key: string; label: string; monthlyPay: number; weight: number }
export interface ReserveType {
  key: string; label: string; days: number; dailyPay: number;
  P: number; C: number; fixed: number; cap: number; pattern?: string;
}
export interface ActiveCostConfig { allowanceRate: number; pensionRate: number; indirect: number; accession: number }
export interface ModelConfig {
  activeWorkDays: number;
  battalionActiveTotal: number;
  mealPerDay: number;
  active: ActiveCostConfig;
  ranks: Rank[];
  blendRoundTo: number;
  types: ReserveType[]; // 순서: 30, 60, 90, 180
}

export const DEFAULT_CONFIG: ModelConfig = {
  activeWorkDays: params.activeWorkDays.value,
  battalionActiveTotal: params.battalionActiveTotal.value,
  mealPerDay: params.reserve.mealPerDay.value,
  active: {
    allowanceRate: params.active.allowanceRate.value,
    pensionRate: params.active.pensionRate.value,
    indirect: params.active.indirect.value,
    accession: params.active.accession.value,
  },
  ranks: params.active.ranks.map(r => ({ key: r.key, label: r.label, monthlyPay: r.monthlyPay, weight: r.weight })),
  blendRoundTo: params.active.blendRoundTo,
  types: params.reserve.types.map(t => ({ ...t })),
};

/** 단계 1 */
export function activeAnnualCost(monthlyPay: number, a: ActiveCostConfig): number {
  const withAllow = monthlyPay * 12 * (1 + a.allowanceRate);
  return Math.round(withAllow * (1 + a.pensionRate) + a.indirect + a.accession);
}

/** 단계 2 */
export function activeBlendedCost(cfg: ModelConfig): number {
  const sumW = cfg.ranks.reduce((s, r) => s + r.weight, 0);
  const sum = cfg.ranks.reduce((s, r) => s + activeAnnualCost(r.monthlyPay, cfg.active) * r.weight, 0);
  return Math.round(sum / sumW / cfg.blendRoundTo) * cfg.blendRoundTo;
}

/** 단계 4 */
export function reserveAnnualCost(t: ReserveType, mealPerDay: number): number {
  return t.days * (t.dailyPay + mealPerDay) + t.fixed;
}

/** 단계 5 */
export const efficiency = (t: ReserveType): number => t.P * t.C;

/** 단계 6 */
export const effectiveDays = (t: ReserveType): number => t.days * efficiency(t);
export const requiredPerActive = (t: ReserveType, activeWorkDays: number): number => activeWorkDays / effectiveDays(t);

/** 단계 7 */
export function costPerActiveEquivalent(t: ReserveType, cfg: ModelConfig): number {
  return requiredPerActive(t, cfg.activeWorkDays) * reserveAnnualCost(t, cfg.mealPerDay);
}

export interface OptimizeInput { replace: number; wartimeTarget: number; mgmtRatio: number; activeCost: number }
export interface OptimizeResult {
  mix: number[] | null;        // [n30, n60, n90, n180]
  cost: number;
  people: number;
  effectiveDays: number;
  requiredDays: number;
  maxPeople: number;
  overMgmt: boolean;
  activeCostTotal: number;
  savingRate: number;
  avgDailyPresence: number;
}

/** 단계 8 — 완전 탐색 */
export function optimize(input: OptimizeInput, cfg: ModelConfig = DEFAULT_CONFIG): OptimizeResult {
  const T = cfg.types;
  if (T.length !== 4) throw new Error('types는 30·60·90·180 순서의 4개여야 합니다');
  const need = cfg.activeWorkDays * input.replace;
  const maxPeople = Math.floor(Math.max(0, cfg.battalionActiveTotal - input.replace) * input.mgmtRatio);
  const ed = T.map(effectiveDays);
  const pc = T.map(t => reserveAnnualCost(t, cfg.mealPerDay));
  let best: { key: number; n: number[]; cost: number } | null = null;

  for (let d = 0; d <= T[3].cap; d++)
    for (let c = 0; c <= T[2].cap; c++)
      for (let b = 0; b <= T[1].cap; b++) {
        const rem = Math.max(0, need - (d * ed[3] + c * ed[2] + b * ed[1]));
        let a = ed[0] > 0 ? Math.ceil(rem / ed[0] - 1e-9) : (rem > 0 ? Infinity : 0);
        a = Math.max(a, input.wartimeTarget - (b + c + d), 0);
        if (a > T[0].cap) continue;
        const n = [a, b, c, d];
        const ppl = a + b + c + d;
        const cost = n.reduce((s, k, i) => s + k * pc[i], 0);
        const key = (ppl > maxPeople ? 1e12 : 0) + cost;
        if (!best || key < best.key) best = { key, n, cost };
      }

  const activeCostTotal = input.activeCost * input.replace;
  if (!best) {
    return { mix: null, cost: 0, people: 0, effectiveDays: 0, requiredDays: need, maxPeople, overMgmt: false,
      activeCostTotal, savingRate: 0, avgDailyPresence: 0 };
  }
  const people = best.n.reduce((s, k) => s + k, 0);
  return {
    mix: best.n,
    cost: best.cost,
    people,
    effectiveDays: best.n.reduce((s, k, i) => s + k * ed[i], 0),
    requiredDays: need,
    maxPeople,
    overMgmt: people > maxPeople,
    activeCostTotal,
    savingRate: 1 - best.cost / activeCostTotal,
    avgDailyPresence: best.n.reduce((s, k, i) => s + k * T[i].days, 0) / cfg.activeWorkDays,
  };
}

/** 부록 C — 180일형 효율 손익분기 */
export function breakEvenEfficiency(t: ReserveType, cfg: ModelConfig, activeCost: number): number {
  return (cfg.activeWorkDays * reserveAnnualCost(t, cfg.mealPerDay)) / (t.days * activeCost);
}

/** 부록 C — 일보상비 손익분기 */
export function breakEvenDailyPay(t: ReserveType, cfg: ModelConfig, activeCost: number): number {
  return (activeCost * effectiveDays(t) / cfg.activeWorkDays - t.fixed) / t.days - cfg.mealPerDay;
}
