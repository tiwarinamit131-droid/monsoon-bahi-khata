import { select, scaleLinear, axisBottom, axisLeft, bin, max, easeCubicOut } from './d3.js';
import { REDUCED_MOTION } from '../ui/dom.js';
import { T, axisStyle } from '../ui/theme.js';
import { f0, f1 } from '../ui/format.js';

const DEFS =
  '<linearGradient id="hW" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#7ef0f7"/><stop offset="1" stop-color="#1d93a8"/></linearGradient>' +
  '<linearGradient id="hD" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff7a5c"/><stop offset="1" stop-color="#b52a18"/></linearGradient>';

/** Distribution of simulated harvests: loss tail in red, the 80 % band in teal, markers for p10/p50/p90/normal. */
export function drawHistogram(host, sorted, baseline, summary, unit) {
  const { p10, p50, p90 } = summary;
  const W = 600;
  const H = 330;
  const m = { t: 40, r: 16, b: 42, l: 44 };
  const x = scaleLinear()
    .domain([Math.min(sorted[0], baseline * 0.8), Math.max(sorted[sorted.length - 1], baseline * 1.1)])
    .nice()
    .range([m.l, W - m.r]);
  const bins = bin().domain(x.domain()).thresholds(x.ticks(40))(Array.from(sorted));
  const y = scaleLinear()
    .domain([0, max(bins, b => b.length)])
    .nice()
    .range([H - m.b, m.t]);
  const svg = select(host)
    .html('')
    .append('svg')
    .attr('viewBox', `0 0 ${W} ${H}`)
    .attr('width', '100%')
    .attr('role', 'img')
    .attr('aria-label', 'Histogram of simulated output');
  svg.append('defs').html(DEFS);
  svg
    .append('g')
    .selectAll('line')
    .data(y.ticks(5))
    .join('line')
    .attr('x1', m.l)
    .attr('x2', W - m.r)
    .attr('y1', d => y(d))
    .attr('y2', d => y(d))
    .attr('stroke', T.grid);
  svg
    .append('g')
    .selectAll('rect')
    .data(bins)
    .join('rect')
    .attr('x', b => x(b.x0) + 0.5)
    .attr('width', b => Math.max(0, x(b.x1) - x(b.x0) - 1))
    .attr('rx', 2)
    .attr('fill', b =>
      b.x1 <= baseline * 0.9 ? 'url(#hD)' : b.x0 >= p10 && b.x1 <= p90 ? 'url(#hW)' : 'rgba(163,172,217,.3)',
    )
    .attr('y', y(0))
    .attr('height', 0)
    .transition()
    .delay((_, i) => (REDUCED_MOTION ? 0 : i * 12))
    .duration(REDUCED_MOTION ? 0 : 500)
    .ease(easeCubicOut)
    .attr('y', b => y(b.length))
    .attr('height', b => y(0) - y(b.length));
  svg
    .append('g')
    .attr('transform', `translate(0,${H - m.b})`)
    .call(
      axisBottom(x)
        .ticks(7)
        .tickFormat(d => f0.format(d)),
    )
    .call(axisStyle);
  svg.append('g').attr('transform', `translate(${m.l},0)`).call(axisLeft(y).ticks(5)).call(axisStyle);
  const mark = (v, label, color, dy, anchor = 'start') => {
    svg
      .append('line')
      .attr('x1', x(v))
      .attr('x2', x(v))
      .attr('y1', m.t - 6)
      .attr('y2', H - m.b)
      .attr('stroke', color)
      .attr('stroke-width', 1.6)
      .attr('stroke-dasharray', label === 'normal' ? '5 4' : null);
    svg
      .append('text')
      .attr('x', x(v) + (anchor === 'end' ? -4 : 4))
      .attr('y', m.t - 10 + dy)
      .attr('text-anchor', anchor)
      .attr('font-size', 11)
      .attr('fill', color)
      .text(`${label} ${f1.format(v)}`);
  };
  mark(p10, 'p10', T.muted, 14, 'end');
  mark(p50, 'p50', T.fg, 0);
  mark(p90, 'p90', T.muted, 14);
  mark(baseline, 'normal', T.haldi, 28);
  svg
    .append('text')
    .attr('x', W - m.r)
    .attr('y', H - 6)
    .attr('text-anchor', 'end')
    .attr('font-size', 11)
    .attr('fill', T.muted)
    .text(`${unit} →`);
}
