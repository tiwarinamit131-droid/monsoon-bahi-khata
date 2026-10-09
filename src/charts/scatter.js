import {
  select,
  scaleLinear,
  scaleSqrt,
  interpolateRgb,
  axisBottom,
  axisLeft,
  extent,
  max,
  easeElasticOut,
} from './d3.js';
import { REDUCED_MOTION } from '../ui/dom.js';
import { T, axisStyle } from '../ui/theme.js';
import { signed } from '../ui/format.js';

/** Rain departure vs yield change, bubbles sized by area and coloured by irrigation, with model guide lines. */
export function drawScatter(host, season, model, active, onSelect) {
  const W = 820;
  const H = 390;
  const m = { t: 20, r: 20, b: 46, l: 52 };
  const x = scaleLinear()
    .domain(extent(season, d => d.departure))
    .nice()
    .range([m.l, W - m.r]);
  const y = scaleLinear()
    .domain(extent(season, d => d.yieldChange))
    .nice()
    .range([H - m.b, m.t]);
  const r = scaleSqrt()
    .domain([0, max(season, d => d.area)])
    .range([4, 28]);
  const irr = scaleLinear().domain([0, 100]).range([T.d, T.le]).interpolate(interpolateRgb);
  const svg = select(host)
    .html('')
    .append('svg')
    .attr('viewBox', `0 0 ${W} ${H}`)
    .attr('style', 'width:100%;min-width:560px')
    .attr('role', 'img')
    .attr('aria-label', 'Scatter of rainfall departure against yield change');
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
    .attr('transform', `translate(0,${H - m.b})`)
    .call(
      axisBottom(x)
        .ticks(8)
        .tickFormat(d => `${d}%`),
    )
    .call(axisStyle);
  svg
    .append('g')
    .attr('transform', `translate(${m.l},0)`)
    .call(
      axisLeft(y)
        .ticks(6)
        .tickFormat(d => `${d}%`),
    )
    .call(axisStyle);
  svg
    .append('text')
    .attr('x', W - m.r)
    .attr('y', H - 8)
    .attr('text-anchor', 'end')
    .attr('font-size', 11)
    .attr('fill', T.muted)
    .text('rain departure →');
  svg
    .append('text')
    .attr('x', m.l + 6)
    .attr('y', m.t + 4)
    .attr('font-size', 11)
    .attr('fill', T.muted)
    .text('↑ yield change vs normal year');

  const [x0, x1] = x.domain();
  const guide = (irrigated, label, color) => {
    const f = v => model.a + model.b * v * (1 - irrigated);
    svg
      .append('line')
      .attr('x1', x(x0))
      .attr('x2', x(x1))
      .attr('y1', y(f(x0)))
      .attr('y2', y(f(x1)))
      .attr('stroke', color)
      .attr('stroke-width', 1.6)
      .attr('stroke-dasharray', '6 4');
    svg
      .append('text')
      .attr('x', x(x1) - 4)
      .attr('y', y(f(x1)) - 8)
      .attr('text-anchor', 'end')
      .attr('font-size', 11)
      .attr('fill', color)
      .text(label);
  };
  guide(0, 'fully rainfed', T.d);
  guide(1, 'fully irrigated', T.le);

  const dots = [...season].sort((a, b) => b.area - a.area);
  svg
    .append('g')
    .selectAll('circle')
    .data(dots)
    .join('circle')
    .attr('cx', d => x(d.departure))
    .attr('cy', d => y(d.yieldChange))
    .attr('fill', d => irr(d.irrigated))
    .attr('fill-opacity', 0.5)
    .attr('stroke', d => (d.code === active ? '#fff' : irr(d.irrigated)))
    .attr('stroke-width', d => (d.code === active ? 3 : 1.2))
    .style('cursor', 'pointer')
    .on('click', (_, d) => onSelect(d.code))
    .call(c =>
      c
        .append('title')
        .text(
          d =>
            `${d.name}: rain ${signed(d.departure)}%, yield ${signed(d.yieldChange)}%, ${d.irrigated}% irrigated`,
        ),
    )
    .attr('r', 0)
    .transition()
    .delay((_, i) => (REDUCED_MOTION ? 0 : i * 25))
    .duration(REDUCED_MOTION ? 0 : 700)
    .ease(easeElasticOut.amplitude(1).period(0.5))
    .attr('r', d => r(d.area));
  svg
    .append('g')
    .selectAll('text')
    .data(dots)
    .join('text')
    .attr('x', d => x(d.departure))
    .attr('y', d => y(d.yieldChange) + 4)
    .attr('text-anchor', 'middle')
    .attr('font-size', d => (d.code === active ? 12.5 : 10))
    .attr('font-weight', d => (d.code === active ? 500 : 400))
    .attr('fill', T.fg)
    .attr('pointer-events', 'none')
    .text(d => d.code);
}
