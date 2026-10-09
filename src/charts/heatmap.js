import { select, scaleDiverging, interpolateRgbBasis } from './d3.js';
import { REGIONS, REGION_ORDER, WEEK_LABELS, regionWeekly } from '../engine/index.ts';
import { REDUCED_MOTION } from '../ui/dom.js';
import { T } from '../ui/theme.js';
import { signed } from '../ui/format.js';

/** Region × week departure heatmap on a diverging dry–wet scale. */
export function drawHeatmap(host, season, activeRegion) {
  const rows = REGION_ORDER.map(r => ({ r, vals: regionWeekly(season, r) }));
  const L = 128;
  const C = 40;
  const R = 42;
  const W = L + C * WEEK_LABELS.length + 4;
  const H = R * rows.length + 34;
  const color = scaleDiverging(interpolateRgbBasis([T.sindoor, T.cell, T.rain]))
    .domain([-50, 0, 50])
    .clamp(true);
  const svg = select(host)
    .html('')
    .append('svg')
    .attr('viewBox', `0 0 ${W} ${H}`)
    .attr('style', 'width:100%;min-width:640px')
    .attr('role', 'img')
    .attr('aria-label', 'Heatmap of regional weekly departure');
  rows.forEach((row, ri) => {
    const g = svg.append('g').attr('transform', `translate(0,${ri * R})`);
    const on = row.r === activeRegion;
    g.append('text')
      .attr('x', 0)
      .attr('y', R / 2 + 4)
      .attr('font-size', 11.5)
      .attr('font-weight', on ? 500 : 400)
      .attr('fill', on ? T.haldi : T.muted)
      .text(REGIONS[row.r]);
    row.vals.forEach((v, i) => {
      g.append('rect')
        .attr('x', L + i * C)
        .attr('y', 2)
        .attr('width', C - 3)
        .attr('height', R - 5)
        .attr('rx', 5)
        .attr('fill', color(v))
        .attr('stroke', on ? T.haldi : 'none')
        .attr('stroke-width', on ? 1.5 : 0)
        .attr('opacity', REDUCED_MOTION ? 1 : 0)
        .call(r => r.append('title').text(`${REGIONS[row.r]}, week of ${WEEK_LABELS[i]}: ${signed(v)}%`))
        .transition()
        .delay(REDUCED_MOTION ? 0 : i * 30 + ri * 60)
        .duration(REDUCED_MOTION ? 0 : 400)
        .attr('opacity', 1);
      g.append('text')
        .attr('x', L + i * C + (C - 3) / 2)
        .attr('y', R / 2 + 4)
        .attr('text-anchor', 'middle')
        .attr('font-size', 10)
        .attr('pointer-events', 'none')
        .attr('fill', Math.abs(v) > 25 ? '#071028' : T.fg)
        .text(Math.round(v));
    });
  });
  WEEK_LABELS.forEach((w, i) => {
    if (i % 2 === 0)
      svg
        .append('text')
        .attr('x', L + i * C + (C - 3) / 2)
        .attr('y', R * rows.length + 18)
        .attr('text-anchor', 'middle')
        .attr('font-size', 10)
        .attr('fill', T.muted)
        .text(w);
  });
}
