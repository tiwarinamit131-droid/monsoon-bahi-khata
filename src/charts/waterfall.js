import { select, scaleLinear, scaleBand, min, max, easeCubicOut } from './d3.js';
import { REDUCED_MOTION } from '../ui/dom.js';
import { T } from '../ui/theme.js';
import { signed } from '../ui/format.js';

const DEFS =
  '<linearGradient id="wfDry" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff7a5c"/><stop offset="1" stop-color="#c8321f"/></linearGradient>' +
  '<linearGradient id="wfWet" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7ef0f7"/><stop offset="1" stop-color="#1d93a8"/></linearGradient>' +
  '<linearGradient id="wfTot" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd76b"/><stop offset="1" stop-color="#e09a10"/></linearGradient>';

/** Waterfall: each driver steps the running total; the last bar is the season departure. */
export function drawWaterfall(host, contributions, departure) {
  let run = 0;
  const bars = contributions.map(c => {
    const y0 = run;
    run += c.value;
    return { ...c, y0, y1: run };
  });
  bars.push({ label: 'Season total', value: departure, y0: 0, y1: departure, total: true });

  const W = 560;
  const H = 330;
  const m = { t: 26, r: 10, b: 52, l: 46 };
  const vals = bars.flatMap(b => [b.y0, b.y1]).concat(0);
  const y = scaleLinear()
    .domain([min(vals) - 4, max(vals) + 4])
    .nice()
    .range([H - m.b, m.t]);
  const x = scaleBand()
    .domain(bars.map(b => b.label))
    .range([m.l, W - m.r])
    .padding(0.3);
  const svg = select(host)
    .html('')
    .append('svg')
    .attr('viewBox', `0 0 ${W} ${H}`)
    .attr('width', '100%')
    .attr('role', 'img')
    .attr('aria-label', 'Waterfall of rainfall departure drivers');
  svg.append('defs').html(DEFS);
  svg
    .append('g')
    .selectAll('line')
    .data(y.ticks(6))
    .join('line')
    .attr('x1', m.l)
    .attr('x2', W - m.r)
    .attr('y1', d => y(d))
    .attr('y2', d => y(d))
    .attr('stroke', T.grid);
  svg
    .append('g')
    .selectAll('text')
    .data(y.ticks(6))
    .join('text')
    .attr('x', m.l - 8)
    .attr('y', d => y(d) + 4)
    .attr('text-anchor', 'end')
    .attr('font-size', 11)
    .attr('fill', T.muted)
    .text(d => d);
  svg
    .append('line')
    .attr('x1', m.l)
    .attr('x2', W - m.r)
    .attr('y1', y(0))
    .attr('y2', y(0))
    .attr('stroke', T.fg);
  bars.forEach((b, i) => {
    if (i < bars.length - 2)
      svg
        .append('line')
        .attr('x1', x(b.label) + x.bandwidth())
        .attr('x2', x(bars[i + 1].label))
        .attr('y1', y(b.y1))
        .attr('y2', y(b.y1))
        .attr('stroke', T.muted)
        .attr('stroke-dasharray', '3 3');
  });
  svg
    .append('g')
    .selectAll('rect')
    .data(bars)
    .join('rect')
    .attr('x', b => x(b.label))
    .attr('width', x.bandwidth())
    .attr('rx', 4)
    .attr('fill', b => (b.total ? 'url(#wfTot)' : b.value < 0 ? 'url(#wfDry)' : 'url(#wfWet)'))
    .attr('y', b => y(b.y0))
    .attr('height', 0)
    .transition()
    .delay((_, i) => (REDUCED_MOTION ? 0 : i * 140))
    .duration(REDUCED_MOTION ? 0 : 600)
    .ease(easeCubicOut)
    .attr('y', b => y(Math.max(b.y0, b.y1)))
    .attr('height', b => Math.max(2, Math.abs(y(b.y0) - y(b.y1))));
  svg
    .append('g')
    .selectAll('text')
    .data(bars)
    .join('text')
    .attr('x', b => x(b.label) + x.bandwidth() / 2)
    .attr('y', b => (b.value < 0 ? y(Math.min(b.y0, b.y1)) + 15 : y(Math.max(b.y0, b.y1)) - 6))
    .attr('text-anchor', 'middle')
    .attr('font-size', 12)
    .attr('font-weight', 500)
    .attr('fill', T.fg)
    .text(b => signed(b.value));
  svg
    .append('g')
    .selectAll('text')
    .data(bars)
    .join('text')
    .attr('y', H - m.b + 20)
    .attr('text-anchor', 'middle')
    .attr('font-size', 11)
    .attr('fill', T.muted)
    .each(function (b) {
      const [first, ...rest] = b.label.split(' ');
      const cx = x(b.label) + x.bandwidth() / 2;
      const t = select(this);
      t.append('tspan').attr('x', cx).text(first);
      if (rest.length) t.append('tspan').attr('x', cx).attr('dy', 14).text(rest.join(' '));
    });
}
