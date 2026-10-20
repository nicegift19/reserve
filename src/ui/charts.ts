import { ModelConfig, reserveAnnualCost, efficiency, requiredPerActive, costPerActiveEquivalent, breakEvenEfficiency } from '../model';
import { fmt } from '../format';
import { $, TYPE_COLORS, LONG_FIRST } from './dom';
import { ACT_BLEND } from './tables';

/** 현역 1명분 업무량을 채우는 비용 막대 (PRD F4) */
export function renderCostChart(cfg: ModelConfig): void {
  const rows = [{ l: '현역 간부(가중평균)', v: ACT_BLEND, c: 'var(--act)', sub: '1.0명' }].concat(LONG_FIRST.map(i => {
    const t = cfg.types[i];
    return { l: t.label, v: costPerActiveEquivalent(t, cfg), c: TYPE_COLORS[i], sub: requiredPerActive(t, cfg.activeWorkDays).toFixed(1) + '명' };
  }));
  const W = 760, LW = 150, RW = 120, BH = 26, G = 14, top = 10, H = top + rows.length * (BH + G) + 26;
  const max = Math.ceil(Math.max(...rows.map(r => r.v)) / 2000) * 2000;
  const x = (v: number) => LW + (W - LW - RW) * v / max;
  let s = `<svg viewBox="0 0 ${W} ${H}" role="img"><title>현역 1명분 업무량을 채우는 연간 비용(만원)</title>`;
  for (let t = 0; t <= max; t += 2000) {
    s += `<line x1="${x(t)}" x2="${x(t)}" y1="${top - 4}" y2="${H - 22}" stroke="var(--line)" stroke-width="1"/><text class="axis" x="${x(t)}" y="${H - 6}" text-anchor="middle">${fmt(t)}</text>`;
  }
  rows.forEach((r, k) => {
    const y = top + k * (BH + G);
    s += `<text x="${LW - 10}" y="${y + BH / 2 + 5}" text-anchor="end">${r.l}</text><rect x="${LW}" y="${y}" width="${x(r.v) - LW}" height="${BH}" fill="${r.c}"/>`
      + `<text class="val" x="${x(r.v) + 8}" y="${y + BH / 2 + 5}">${fmt(r.v)} · ${r.sub}</text>`;
  });
  $('costChart').innerHTML = `<p class="note cap">현역 1명분 업무량(유효 ${cfg.activeWorkDays}일)을 채우는 연간 비용, 만원 · 오른쪽 숫자는 필요 인원</p>${s}</svg>`;
}

/** 180일형 효율 0.4–1.0에 따른 현역 대비 비율 (PRD F4 권장) */
export function renderSensitivityChart(cfg: ModelConfig): void {
  const t = cfg.types[3];
  const ratioAt = (e: number) => cfg.activeWorkDays * reserveAnnualCost(t, cfg.mealPerDay) / (t.days * e) / ACT_BLEND * 100;
  const E0 = 0.4, E1 = 1.0;
  const W = 760, H = 300, L = 56, R = 24, T = 16, B = 40;
  const yMax = Math.max(120, Math.ceil(ratioAt(E0) / 20) * 20);
  const x = (e: number) => L + (W - L - R) * (e - E0) / (E1 - E0);
  const y = (p: number) => T + (H - T - B) * (1 - Math.min(p, yMax) / yMax);

  let s = `<svg viewBox="0 0 ${W} ${H}" role="img"><title>${t.label} 효율에 따른 현역 대비 비용 비율(%)</title>`;
  for (let p = 0; p <= yMax; p += 20) {
    s += `<line x1="${L}" x2="${W - R}" y1="${y(p)}" y2="${y(p)}" stroke="var(--line)" stroke-width="1"/><text class="axis" x="${L - 8}" y="${y(p) + 4}" text-anchor="end">${p}%</text>`;
  }
  for (let k = 0; k <= 6; k++) {
    const e = E0 + k * 0.1;
    s += `<text class="axis" x="${x(e)}" y="${H - B + 18}" text-anchor="middle">${e.toFixed(1)}</text>`;
  }
  s += `<text class="axis" x="${(L + W - R) / 2}" y="${H - 4}" text-anchor="middle">${t.label} 효율 e = P × C</text>`;
  // 현역 100% 기준선
  s += `<line x1="${L}" x2="${W - R}" y1="${y(100)}" y2="${y(100)}" stroke="var(--act)" stroke-width="1.5" stroke-dasharray="5 4"/>`
    + `<text class="val" x="${W - R}" y="${y(100) - 6}" text-anchor="end" fill="var(--act)">현역 1인 비용 = 100%</text>`;
  // 곡선
  const pts: string[] = [];
  for (let e = E0; e <= E1 + 1e-9; e += 0.01) pts.push(`${x(e).toFixed(1)},${y(ratioAt(e)).toFixed(1)}`);
  s += `<polyline points="${pts.join(' ')}" fill="none" stroke="var(--s1)" stroke-width="2.5"/>`;
  // 손익분기
  const be = breakEvenEfficiency(t, cfg, ACT_BLEND);
  if (be >= E0 && be <= E1) {
    s += `<circle cx="${x(be)}" cy="${y(100)}" r="4.5" fill="var(--act)"/>`
      + `<text class="val" x="${x(be) - 8}" y="${y(100) + 20}" text-anchor="end">손익분기 e = ${be.toFixed(2)}</text>`;
  }
  // 현재 설정값
  const e = efficiency(t);
  if (e >= E0 && e <= E1) {
    const p = ratioAt(e);
    s += `<line x1="${x(e)}" x2="${x(e)}" y1="${y(p)}" y2="${H - B}" stroke="var(--s1)" stroke-width="1" stroke-dasharray="2 3"/>`
      + `<circle cx="${x(e)}" cy="${y(p)}" r="5" fill="var(--s1)"/>`
      + `<text class="val" x="${x(e)}" y="${y(p) - 12}" text-anchor="middle">현재 ${e.toFixed(3)} → ${Math.round(p)}%</text>`;
  }
  $('sensChart').innerHTML = `<p class="note cap">${t.label} 효율이 바뀔 때 현역 1명분 업무량을 채우는 비용 ÷ 현역 1인 비용 · 계산기의 P·C 입력과 연동</p>${s}</svg>`;
}
