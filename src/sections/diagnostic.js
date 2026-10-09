import { closestTwin, decompose } from '../engine/index.ts';
import { $ } from '../ui/dom.js';
import { f1, signed } from '../ui/format.js';
import { moodOf } from '../ui/motion.js';
import { megh } from '../cartoons/index.js';
import { byCode, model, season } from '../context.js';
import { drawWaterfall } from '../charts/waterfall.js';
import { drawHeatmap } from '../charts/heatmap.js';
import { drawScatter } from '../charts/scatter.js';

export function mountDiagnostic(store) {
  const select = code => store.set({ code });
  store.watch(['code'], ({ code }) => {
    const s = byCode.get(code);
    const parts = decompose(s);
    const global = parts.filter(p => p.kind === 'global');
    const local = parts.find(p => p.kind === 'local');
    const globalSum = global.reduce((a, p) => a + p.value, 0);
    const lead = [...global].sort((a, b) => Math.abs(b.value) - Math.abs(a.value))[0];
    const twin = closestTwin(s, season);
    $('#ledeG').textContent =
      `Over the season ${s.name} ran ${signed(s.departure)}%. Global drivers account for ${signed(globalSum)} points, led by ${lead.label} at ${signed(lead.value)}; local weather supplied the other ${signed(local.value)} points. Week by week it moved most closely with ${twin.state.name} (ρ ${twin.rho.toFixed(2)}), so the cause is regional, not a quirk of one district.`;
    $('#toonG').innerHTML = megh(moodOf(s.departure), 'magnifier');
    $('#bubG').innerHTML =
      `Clue no. 1: <b>${lead.label}</b>, ${signed(lead.value)} pts. The rest, ${signed(local.value)} pts, is local weather.`;
    drawWaterfall($('#waterfall'), parts, s.departure);
    drawHeatmap($('#heatmap'), season, s.region);
    drawScatter($('#scatter'), season, model, code, select);
    $('#scatterNote').textContent =
      `Across states, rain alone correlates with yield at r = ${model.rainOnlyR.toFixed(2)}. Weight it by the rainfed share and the fit rises to R² = ${model.r2.toFixed(2)}: each point of rain departure moves a fully rainfed crop about ${f1.format(model.b)}%, while an irrigated one barely notices. Colour runs from rainfed (amber) to irrigated (blue). ${s.name} is ${s.irrigated}% irrigated.`;
  });
}
