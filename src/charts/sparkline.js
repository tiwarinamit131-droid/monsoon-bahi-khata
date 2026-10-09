import { scaleLinear, line, curveMonotoneX } from './d3.js';
import { sum } from '../engine/index.ts';
import { T } from '../ui/theme.js';

/** Inline SVG sparkline string: zero line, curve, emphasised last point. */
export function sparkline(series, w = 136, h = 28) {
  const x = scaleLinear()
    .domain([0, series.length - 1])
    .range([2, w - 2]);
  const y = scaleLinear()
    .domain([-70, 70])
    .range([h - 2, 2])
    .clamp(true);
  const d = line()
    .x((_, i) => x(i))
    .y(v => y(v))
    .curve(curveMonotoneX)(series);
  const last = series[series.length - 1];
  const col = sum(series) < 0 ? T.sindoor : T.rain;
  return `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" aria-hidden="true"><line x1="0" x2="${w}" y1="${y(0)}" y2="${y(0)}" stroke="${T.line}" stroke-dasharray="2 2"/><path d="${d}" fill="none" stroke="${col}" stroke-width="1.7"/><circle cx="${x(series.length - 1)}" cy="${y(last)}" r="3" fill="${last < 0 ? T.sindoor : T.rain}"/></svg>`;
}
