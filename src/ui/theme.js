import { band } from '../engine/index.ts';

/** JS mirror of the CSS tokens, for canvas and SVG drawing. Keep in sync with styles/tokens.css. */
export const T = {
  bg: '#060a1c',
  fg: '#f3efe2',
  muted: '#a3acd9',
  line: 'rgba(140,170,255,.22)',
  grid: 'rgba(163,172,217,.12)',
  cell: '#16204c',
  haldi: '#ffc53d',
  rain: '#46d4e0',
  sindoor: '#ff5a3c',
  mor: '#19c39b',
  neel: '#4f8cff',
  le: '#4f8cff',
  e: '#46d4e0',
  n: '#3ddc97',
  d: '#ffa53d',
  ld: '#ff4b3a',
  nr: '#b3122a',
};

const LIGHT_TEXT = new Set(['le', 'ld', 'nr']);

export const bandColor = d => T[band(d).key];
export const bandInk = d => (LIGHT_TEXT.has(band(d).key) ? '#fff' : '#071028');
export const chip = d => {
  const b = band(d);
  return `<span class="chip${LIGHT_TEXT.has(b.key) ? ' light' : ''}" style="background:${T[b.key]}">${b.name}</span>`;
};
export const axisStyle = g => {
  g.selectAll('text').attr('fill', T.muted);
  g.selectAll('line,path').attr('stroke', T.line);
};
