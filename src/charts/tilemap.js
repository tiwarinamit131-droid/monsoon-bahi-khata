import { select, easeBackOut } from './d3.js';
import { REDUCED_MOTION } from '../ui/dom.js';
import { T, bandColor, bandInk } from '../ui/theme.js';
import { signed, f0 } from '../ui/format.js';

const Z = 64;
const GAP = 5;

/** Tile-grid cartogram of India: every state the same size, placed roughly where it sits on the map. */
export function createTilemap(host, season, onSelect) {
  const W = 8 * Z;
  const H = 7 * Z;
  const svg = select(host)
    .append('svg')
    .attr('viewBox', `0 0 ${W} ${H}`)
    .attr('width', '100%')
    .attr('role', 'img')
    .attr('aria-label', 'Tile map of India coloured by rainfall departure');
  svg
    .append('defs')
    .html(
      '<filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>',
    );
  svg
    .append('text')
    .attr('x', W - 6)
    .attr('y', H - 10)
    .attr('text-anchor', 'end')
    .attr('font-size', 11)
    .attr('fill', T.muted)
    .text('Bay of Bengal →');
  svg
    .append('text')
    .attr('x', 6)
    .attr('y', H - 10)
    .attr('font-size', 11)
    .attr('fill', T.muted)
    .text('← Arabian Sea');

  const tiles = svg
    .selectAll('g.tile')
    .data(season)
    .join('g')
    .attr('class', 'tile')
    .attr('tabindex', 0)
    .attr('role', 'button')
    .attr('aria-label', s => `${s.name}, ${signed(s.departure)} percent`)
    .attr('transform', s => `translate(${s.col * Z},${s.row * Z})`)
    .on('click', (_, s) => onSelect(s.code))
    .on('keydown', (e, s) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onSelect(s.code);
      }
    });
  tiles
    .append('rect')
    .attr('rx', 10)
    .attr('fill', s => bandColor(s.departure))
    .attr('x', Z / 2)
    .attr('y', Z / 2)
    .attr('width', 0)
    .attr('height', 0)
    .transition()
    .delay(s => (REDUCED_MOTION ? 0 : s.row * 90 + s.col * 50))
    .duration(REDUCED_MOTION ? 0 : 600)
    .ease(easeBackOut)
    .attr('x', GAP / 2)
    .attr('y', GAP / 2)
    .attr('width', Z - GAP)
    .attr('height', Z - GAP);
  tiles
    .append('text')
    .attr('x', Z / 2)
    .attr('y', Z / 2 - 3)
    .attr('text-anchor', 'middle')
    .attr('font-size', 15)
    .attr('font-weight', 500)
    .attr('fill', s => bandInk(s.departure))
    .attr('pointer-events', 'none')
    .text(s => s.code);
  tiles
    .append('text')
    .attr('x', Z / 2)
    .attr('y', Z / 2 + 15)
    .attr('text-anchor', 'middle')
    .attr('font-size', 11)
    .attr('fill', s => bandInk(s.departure))
    .attr('pointer-events', 'none')
    .text(s => `${signed(s.departure, 0)}%`);
  tiles.append('title').text(s => `${s.name}: ${f0.format(s.actual)} mm, ${signed(s.departure)}%`);

  return {
    highlight(code) {
      tiles
        .select('rect')
        .attr('stroke', s => (s.code === code ? '#fff' : 'none'))
        .attr('stroke-width', 3)
        .attr('filter', s => (s.code === code ? 'url(#glow)' : null));
      tiles.filter(s => s.code === code).raise();
    },
  };
}
