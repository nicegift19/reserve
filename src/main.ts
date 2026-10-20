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
