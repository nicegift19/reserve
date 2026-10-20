// 폰트 셀프 호스팅 — 외부 CDN 없이 dist/assets에 번들 (내부망·CSP 'self' 대응). unicode-range로 필요한 조각만 내려받음
import '@fontsource/ibm-plex-sans-kr/400.css';
import '@fontsource/ibm-plex-sans-kr/500.css';
import '@fontsource/ibm-plex-sans-kr/700.css';
import '@fontsource/ibm-plex-mono/latin-400.css';
import '@fontsource/ibm-plex-mono/latin-600.css';
import '@fontsource/nanum-myeongjo/700.css';
import '@fontsource/nanum-myeongjo/800.css';
import './styles.css';
import { renderSources, enhanceCites } from './ui/sources';
import { fillTextValues } from './ui/text';
import { renderHero, renderCapability, renderCost, renderStep5 } from './ui/tables';
import { renderCostChart, renderSensitivityChart } from './ui/charts';
import { initOptimizer } from './ui/optimizer';

renderSources();
fillTextValues();
renderStep5();
initOptimizer(cfg => {
  renderHero(cfg);
  renderCapability(cfg);
  renderCost(cfg);
  renderCostChart(cfg);
  renderSensitivityChart(cfg);
  enhanceCites(document.getElementById('cost')!);
});
enhanceCites();
