import params from '../../data/parameters.json';
import {
  ModelConfig, DEFAULT_CONFIG, activeAnnualCost, activeBlendedCost, reserveAnnualCost,
  efficiency, effectiveDays, requiredPerActive, costPerActiveEquivalent,
} from '../model';
import { fmt } from '../format';
import { $, cites, LONG_FIRST } from './dom';

/** 현역 기준 비용 — 계급 봉급·가중치는 계산기에서 바꾸지 않으므로 기본 설정값 */
export const ACT_BLEND = activeBlendedCost(DEFAULT_CONFIG);

/** 단계 5 표의 소집 간격 문구 (유형 순서 30·60·90·180) */
const STEP5_INTERVAL = ['월 2~3일, 공백 김', '월 5일 내외', '월 7~8일', '주 3~4일, 공백 짧음'];

export function renderHero(cfg: ModelConfig): void {
  $('heroRatio').innerHTML = LONG_FIRST.map(i => {
    const t = cfg.types[i], c = costPerActiveEquivalent(t, cfg);
    return `<div${i === 3 ? ' class="best"' : ''}><span class="k">${t.label} 상비예비군</span>`
      + `<span class="v">${requiredPerActive(t, cfg.activeWorkDays).toFixed(1)}<small> 명</small></span>`
      + `<span class="n">현역 1명분 비용 ${fmt(c)}만원 · 현역 대비 ${Math.round(c / ACT_BLEND * 100)}%</span></div>`;
  }).join('');
}

export function renderCapability(cfg: ModelConfig): void {
  const D = cfg.activeWorkDays;
  $('capTbody').innerHTML = `<tr class="act"><td>현역 간부</td><td>${D}</td><td class="l">상시 근무</td><td>1.00</td><td>1.00</td><td>1.00</td><td>${D}</td><td>1.0명</td></tr>`
    + cfg.types.map(t => `<tr><td>${t.label}</td><td>${t.days}</td><td class="l">${t.pattern ?? ''}</td><td>${t.P.toFixed(2)}</td><td>${t.C.toFixed(2)}</td>`
      + `<td>${efficiency(t).toFixed(3)}</td><td>${effectiveDays(t).toFixed(1)}</td><td><b>${requiredPerActive(t, D).toFixed(1)}명</b></td></tr>`).join('');
}

export function renderCost(cfg: ModelConfig): void {
  const D = cfg.activeWorkDays;
  const mealSrc = params.reserve.mealPerDay.sources;
  let html = params.active.ranks.map(r => {
    const c = activeAnnualCost(r.monthlyPay, cfg.active);
    return `<tr class="act"><td>현역 ${r.label}</td><td class="l">월봉 ${r.monthlyPay.toLocaleString('ko-KR')}만</td><td>${fmt(c)}</td><td>${D}</td>`
      + `<td>${(c / D).toFixed(1)}</td><td>${fmt(c)}</td><td>-</td><td class="l">${cites(r.sources)} <a class="badge asm" href="#m-step1">수당·간접비 가정</a></td></tr>`;
  }).join('');
  html += `<tr class="act"><td><b>현역 가중평균</b></td><td class="l">계산 기준값 (단계 2)</td><td><b>${fmt(ACT_BLEND)}</b></td><td>${D}</td>`
    + `<td>${(ACT_BLEND / D).toFixed(1)}</td><td><b>${fmt(ACT_BLEND)}</b></td><td>100%</td><td class="l"><a href="#m-step2">단계 2</a></td></tr>`;
  html += LONG_FIRST.map(i => {
    const t = cfg.types[i], c = reserveAnnualCost(t, cfg.mealPerDay), ed = effectiveDays(t), eq = costPerActiveEquivalent(t, cfg);
    const src = [...params.reserve.types[i].paySources, ...mealSrc];
    return `<tr><td>${t.label} 상비예비군</td><td class="l">${t.days}일 × (${t.dailyPay}+${cfg.mealPerDay}) + ${t.fixed}</td><td>${fmt(c)}</td>`
      + `<td>${ed.toFixed(1)}</td><td>${(c / ed).toFixed(1)}</td><td><b>${fmt(eq)}</b></td><td>${Math.round(eq / ACT_BLEND * 100)}%</td>`
      + `<td class="l">${cites(src)} <a class="badge asm" href="#m-step5">고정비·효율 가정</a></td></tr>`;
  }).join('');
  $('costTbody').innerHTML = html;
}

/** 단계 5 표 — 문서 기준값(기본 설정) */
export function renderStep5(): void {
  $('step5Tbody').innerHTML = LONG_FIRST.map(i => {
    const t = DEFAULT_CONFIG.types[i];
    return `<tr><td>${t.label}</td><td class="l">${STEP5_INTERVAL[i]}</td><td>${t.P.toFixed(2)}</td><td>${t.C.toFixed(2)}</td><td>${efficiency(t).toFixed(3)}</td></tr>`;
  }).join('');
}
