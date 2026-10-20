import params from '../../data/parameters.json';
import { DEFAULT_CONFIG, ModelConfig, ReserveType, effectiveDays, optimize } from '../model';
import { fmt } from '../format';
import { $, TYPE_COLORS, LONG_FIRST } from './dom';
import { ACT_BLEND } from './tables';

type Field = 'dailyPay' | 'P' | 'C' | 'fixed' | 'cap';
/** [라벨, 필드, URL 키, step] */
const FIELDS: [string, Field, string, number][] = [
  ['보상비(만/일)', 'dailyPay', 'pay', 0.5],
  ['숙련 P', 'P', 'P', 0.01],
  ['연속성 C', 'C', 'C', 0.01],
  ['고정비(만/인)', 'fixed', 'fixed', 10],
  ['확보 가능(명)', 'cap', 'cap', 1],
];
const SLIDERS = ['R', 'W', 'K', 'AC'] as const;
type Slider = typeof SLIDERS[number];
const CAP_MAX = 60;

const cloneCfg = (): ModelConfig => ({ ...DEFAULT_CONFIG, types: DEFAULT_CONFIG.types.map(t => ({ ...t })) });
const sliderDefaults = (): Record<Slider, number> => {
  const d = params.optimizerDefaults;
  return { R: d.replace, W: d.wartimeTarget, K: d.mgmtRatio, AC: ACT_BLEND };
};

let cfg = cloneCfg();
const slider = (id: Slider) => $<HTMLInputElement>(id);

function clampToInput(el: HTMLInputElement, v: number): number {
  const min = el.min === '' ? -Infinity : +el.min, max = el.max === '' ? Infinity : +el.max;
  return Math.min(max, Math.max(min, v));
}

function setTypeValue(t: ReserveType, f: Field, v: number) {
  t[f] = f === 'cap' ? Math.min(CAP_MAX, Math.round(v)) : v;
}

// ---- URL 공유 (PRD F3 권장) ----
function readQuery(): void {
  const q = new URLSearchParams(location.search);
  SLIDERS.forEach(id => {
    const v = parseFloat(q.get(id) ?? '');
    if (!isNaN(v)) slider(id).value = String(clampToInput(slider(id), v));
  });
  FIELDS.forEach(([, f, key]) => {
    const raw = q.get(key);
    if (!raw) return;
    raw.split(',').slice(0, 4).forEach((s, i) => {
      const v = parseFloat(s);
      if (!isNaN(v) && v >= 0) setTypeValue(cfg.types[i], f, v);
    });
  });
}

function buildQuery(): string {
  const q = new URLSearchParams(), d = sliderDefaults();
  SLIDERS.forEach(id => { if (+slider(id).value !== d[id]) q.set(id, slider(id).value); });
  FIELDS.forEach(([, f, key]) => {
    const vals = cfg.types.map(t => t[f]);
    if (vals.some((v, i) => v !== DEFAULT_CONFIG.types[i][f])) q.set(key, vals.join(','));
  });
  const s = q.toString();
  return location.pathname + (s ? `?${s}` : '') + location.hash;
}

// ---- 렌더 ----
function buildGrid(onChange: () => void): void {
  const g = $('typeGrid');
  FIELDS.forEach(([lab, f, key, step]) => {
    const l = document.createElement('span'); l.textContent = lab; g.appendChild(l);
    cfg.types.forEach((t, i) => {
      const inp = document.createElement('input');
      inp.type = 'number'; inp.step = String(step); inp.min = '0'; inp.id = `${key}${i}`;
      inp.value = String(t[f]); inp.setAttribute('aria-label', `${t.label} ${lab}`);
      inp.addEventListener('input', () => {
        const v = parseFloat(inp.value);
        if (!isNaN(v) && v >= 0) { setTypeValue(cfg.types[i], f, v); onChange(); }
      });
      g.appendChild(inp);
    });
  });
}

function syncGrid(): void {
  FIELDS.forEach(([, f, key]) => cfg.types.forEach((t, i) => { $<HTMLInputElement>(`${key}${i}`).value = String(t[f]); }));
}

const pill = (cls: string, text: string) => `<span class="pill ${cls}">${text}</span>`;

function renderResult(R: number, W: number, K: number, AC: number): void {
  const r = optimize({ replace: R, wartimeTarget: W, mgmtRatio: K, activeCost: AC }, cfg);
  const mix = $('mix'), st = $('status'), kv = $('kv'), bar = $('effBar');
  if (!r.mix) {
    mix.innerHTML = ''; kv.innerHTML = ''; bar.replaceChildren();
    st.innerHTML = pill('bad', '조합 없음');
    $('explain').textContent = '확보 가능 인원 안에서는 대체할 업무량을 채울 수 없습니다. 장기형(90·180일) 확보 인원을 늘리거나 대체할 현역 수를 줄여 보십시오.';
    return;
  }
  const n = r.mix, T = cfg.types;
  mix.innerHTML = LONG_FIRST.map(i => `<div><span class="t">${T[i].label}</span><span class="c">${n[i]}<small> 명</small></span></div>`).join('');

  const pills = [r.overMgmt ? pill('bad', `관리 한도 초과 ${r.people}/${r.maxPeople}명`) : pill('ok', `관리 가능 ${r.people}/${r.maxPeople}명`)];
  const sv = r.savingRate;
  pills.push(sv > 0.3 ? pill('ok', `절감 ${Math.round(sv * 100)}%`) : sv > 0 ? pill('warn', `절감 ${Math.round(sv * 100)}%`) : pill('bad', `비용 증가 ${Math.round(-sv * 100)}%`));
  const capHit = n[3] >= T[3].cap && T[3].cap > 0;
  if (capHit) pills.push(pill('warn', '180일형 확보 한도 도달'));
  st.innerHTML = pills.join('');

  // 막대 폭은 CSSOM으로 지정 (CSP style-src 'self' 호환)
  bar.replaceChildren(...LONG_FIRST.flatMap(i => {
    const w = n[i] * effectiveDays(T[i]) / Math.max(r.effectiveDays, 1) * 100;
    if (w <= 0) return [];
    const s = document.createElement('span');
    s.style.width = `${w}%`; s.style.background = TYPE_COLORS[i]; s.title = `${T[i].label} ${w.toFixed(0)}%`;
    return [s];
  }));

  kv.innerHTML = ([
    ['연간 총비용', fmt(r.cost) + '만'], ['현역 유지 시', fmt(r.activeCostTotal) + '만'], ['연간 절감액', fmt(r.activeCostTotal - r.cost) + '만'],
    ['총 인원', r.people + '명'], ['유효 근무일', fmt(r.effectiveDays) + ' / ' + fmt(r.requiredDays)], ['평일 평균 출근', r.avgDailyPresence.toFixed(1) + '명'],
  ] as const).map(([k, v]) => `<div><span class="k">${k}</span><span class="v">${v}</span></div>`).join('');

  const lim: string[] = [];
  if (capHit) lim.push('180일형을 확보 가능 인원까지 모두 쓴 뒤 나머지를 짧은 유형으로 채웠습니다');
  if (W > 0) lim.push(`전시 직책 숙달 목표 ${W}명을 충족합니다`);
  if (r.overMgmt) lim.push(`관리 한도(잔여 현역 ${cfg.battalionActiveTotal - R}명 × ${K}명) 안에서는 조합이 없어, 한도를 넘는 최저비용 조합을 표시했습니다`);
  $('explain').textContent = `현역 ${R}명의 업무량(유효 ${fmt(r.requiredDays)}일)을 채우는 최저비용 조합입니다. ` + lim.join('. ') + (lim.length ? '.' : '');
}

function renderScenarios(W: number, K: number, AC: number): void {
  $('scTbody').innerHTML = params.scenarioReplaceList.map(R => {
    const r = optimize({ replace: R, wartimeTarget: W, mgmtRatio: K, activeCost: AC }, cfg);
    if (!r.mix) return `<tr><td>${R}명</td><td colspan="8" class="l">확보 가능 인원으로 충족 불가</td><td>${pill('bad', '불가')}</td></tr>`;
    const n = r.mix;
    const tag = r.overMgmt ? pill('bad', '관리 초과') : n[3] >= cfg.types[3].cap ? pill('warn', '장기형 부족') : pill('ok', '적정');
    return `<tr><td>${R}명</td><td>${n[3]}</td><td>${n[2]}</td><td>${n[1]}</td><td>${n[0]}</td><td><b>${r.people}</b></td>`
      + `<td>${fmt(r.cost)}만</td><td>${fmt(r.activeCostTotal)}만</td><td>${Math.round(r.savingRate * 100)}%</td><td>${tag}</td></tr>`;
  }).join('');
}

/**
 * 계산기 초기화. onConfigChange는 유형별 조건이 바뀔 때 히어로·표·차트를 다시 그리는 콜백.
 */
export function initOptimizer(onConfigChange: (cfg: ModelConfig) => void): void {
  const d = sliderDefaults();
  SLIDERS.forEach(id => { slider(id).value = String(d[id]); });
  readQuery();

  const update = () => {
    const R = +slider('R').value, W = +slider('W').value, K = +slider('K').value, AC = +slider('AC').value;
    $('Ro').textContent = R + '명'; $('Wo').textContent = W + '명'; $('Ko').textContent = K + '명'; $('ACo').textContent = fmt(AC);
    onConfigChange(cfg);
    renderResult(R, W, K, AC);
    renderScenarios(W, K, AC);
    history.replaceState(null, '', buildQuery());
  };

  buildGrid(update);
  SLIDERS.forEach(id => slider(id).addEventListener('input', update));
  $('resetBtn').addEventListener('click', () => {
    cfg = cloneCfg();
    syncGrid();
    SLIDERS.forEach(id => { slider(id).value = String(d[id]); });
    update();
  });
  $('shareBtn').addEventListener('click', async () => {
    const msg = $('shareMsg');
    try {
      await navigator.clipboard.writeText(location.href);
      msg.textContent = '링크를 복사했습니다';
    } catch {
      msg.textContent = '주소창의 URL을 복사하십시오';
    }
    setTimeout(() => { msg.textContent = ''; }, 2500);
  });
  update();
}
