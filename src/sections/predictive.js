import { CROPS, PEST, scenario, summarize } from '../engine/index.ts';
import { $, $$, rafThrottle } from '../ui/dom.js';
import { f0, f1, signed } from '../ui/format.js';
import { countUp } from '../ui/motion.js';
import { T } from '../ui/theme.js';
import { runSimulation } from '../ui/mc-client.js';
import { farmer } from '../cartoons/index.js';
import { byCode, model } from '../context.js';
import { drawHistogram } from '../charts/histogram.js';

export function mountPredictive(store) {
  const oct = $('#oct');
  oct.addEventListener('input', () => store.set({ october: +oct.value }));
  $$('input[name=pest]').forEach(r => r.addEventListener('change', () => store.set({ pest: r.value })));

  const fc = $('#fc');
  fc.innerHTML = Array.from(
    { length: 6 },
    () => '<div><div class="l"></div><div class="v"></div></div>',
  ).join('');

  const run = rafThrottle(async ({ code, october, pest }) => {
    const s = byCode.get(code);
    const crop = CROPS[s.crop];
    $('#octOut').textContent = `${signed(october, 0)}%`;
    $('#fcUnit').textContent = `${s.crop} · ${crop.unit}`;
    const params = scenario({ ...s, october, pest, model });
    const { out, ms, thread, stale } = await runSimulation(params);
    if (stale) return;
    const sum = summarize(out, params.baseline);
    const { p10, p50, p90, medianChange: chg, lossProbability: pLoss } = sum;

    $('#mcTime').textContent =
      `${f0.format(params.runs)} runs in ${f1.format(Math.max(0.1, ms))} ms · ${thread}`;
    $('#ledeF').textContent =
      `With October rain at ${signed(october, 0)}% of normal and ${pest} pest pressure, ${s.name}'s ${s.crop.toLowerCase()} output centres on ${f1.format(p50)} ${crop.unit}, ${signed(chg)}% against a normal year. Eight times in ten it lands between ${f1.format(p10)} and ${f1.format(p90)}. The chance of a loss deeper than 10% is ${f0.format(pLoss)}%.`;

    const mood = chg >= -3 ? 'happy' : chg > -10 ? 'ok' : 'sad';
    $('#toonF').innerHTML = farmer(mood);
    $('#bubF').innerHTML =
      mood === 'happy'
        ? `Fasal achhi hogi! About <b>${f1.format(p50)} ${crop.unit}</b> of ${s.crop.toLowerCase()}.`
        : mood === 'ok'
          ? `Thoda kam. <b>${signed(chg)}%</b> below a normal year, but we'll manage.`
          : `Mushkil hai. <b>${f0.format(pLoss)}%</b> chance we lose over a tenth of the crop.`;

    const short = crop.unit.replace('lakh ', 'L ');
    const cells = [
      ['Median output', p50, v => `${f1.format(v)} ${short}`],
      ['Normal year', params.baseline, v => `${f1.format(v)} ${short}`],
      ['vs normal', chg, v => `${signed(v)}%`],
      ['P(loss > 10%)', pLoss, v => `${f0.format(v)}%`],
      ['80% band', null, () => `${f1.format(p10)} – ${f1.format(p90)}`],
      ['Farm value at median', (p50 * crop.price) / 100, v => `₹${f0.format(v)} cr`],
    ];
    [...fc.children].forEach((el, i) => {
      const [label, value, fmt] = cells[i];
      el.querySelector('.l').textContent = label;
      const v = el.querySelector('.v');
      v.style.color = i === 2 ? (chg < 0 ? T.sindoor : T.rain) : '';
      if (value == null) v.textContent = fmt();
      else countUp(v, value, fmt, 700);
    });
    $('#model').innerHTML =
      `yield Δ% = ${f1.format(model.a)} + ${model.b.toFixed(3)} × rain dep% × rainfed share<br>R² ${model.r2.toFixed(2)} · residual σ ${f1.format(model.sigma)} pts · fitted on ${model.n} states<br>Oct weight ${params.octoberWeight} · pest N(${PEST[pest].mean}, ${PEST[pest].sd}) · main crop on 55% of kharif area`;
    drawHistogram($('#hist'), out, params.baseline, sum, crop.unit);
  });

  store.watch(['code', 'october', 'pest'], s => {
    oct.value = String(s.october);
    $(`input[name=pest][value=${s.pest}]`).checked = true;
    run(s);
  });
}
