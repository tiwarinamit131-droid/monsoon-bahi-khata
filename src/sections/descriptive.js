import { REGIONS, WEEK_LABELS, band, longestRun } from '../engine/index.ts';
import { $, $$ } from '../ui/dom.js';
import { f0, f1, signed } from '../ui/format.js';
import { countUp, moodOf } from '../ui/motion.js';
import { T, bandColor, chip } from '../ui/theme.js';
import { megh } from '../cartoons/index.js';
import { byCode, india, season } from '../context.js';
import { createTilemap } from '../charts/tilemap.js';
import { createWeekly } from '../charts/weekly.js';
import { sparkline } from '../charts/sparkline.js';

const LEGEND = [
  ['le', 'Large excess ≥60'],
  ['e', 'Excess 20–59'],
  ['n', 'Normal ±19'],
  ['d', 'Deficient −20 to −59'],
  ['ld', 'Large deficient ≤−60'],
];

export function mountDescriptive(store) {
  const select = code => store.set({ code });
  const map = createTilemap($('#tilemap'), season, select);
  const weekly = createWeekly($('#weekly'));
  $('#legend').innerHTML = LEGEND.map(([k, t]) => `<span><i style="background:${T[k]}"></i>${t}</span>`).join(
    '',
  );

  let sortKey = 'departure';
  let sortDir = 1;
  const keyOf = { name: 'name', reg: 'region', normal: 'normal', actual: 'actual', dep: 'departure' };

  function renderLedger(code) {
    const rows = [...season].sort((a, b) => {
      const x = a[sortKey];
      const y = b[sortKey];
      return (typeof x === 'string' ? x.localeCompare(y) : x - y) * sortDir;
    });
    $('#ledger tbody').innerHTML = rows
      .map(
        s => `<tr data-c="${s.code}" class="${s.code === code ? 'sel' : ''}" tabindex="0">
        <td class="st"><b>${s.code}</b><em>${s.name}</em></td><td>${REGIONS[s.region]}</td>
        <td class="n r">${f0.format(s.normal)}</td><td class="n r">${f0.format(s.actual)}</td>
        <td class="n r" style="color:${bandColor(s.departure)}">${signed(s.departure)}%</td>
        <td>${chip(s.departure)}</td><td>${sparkline(s.departureWeekly)}</td></tr>`,
      )
      .join('');
    $$('#ledger th button').forEach(b => {
      const on = keyOf[b.dataset.k] === sortKey;
      b.closest('th').setAttribute('aria-sort', on ? (sortDir > 0 ? 'ascending' : 'descending') : 'none');
    });
  }

  $$('#ledger th button').forEach(btn =>
    btn.addEventListener('click', () => {
      const k = keyOf[btn.dataset.k];
      sortDir = sortKey === k ? -sortDir : 1;
      sortKey = k;
      renderLedger(store.get().code);
    }),
  );
  const pick = e => {
    const tr = e.target.closest('tr[data-c]');
    if (tr) select(tr.dataset.c);
  };
  $('#ledger tbody').addEventListener('click', pick);
  $('#ledger tbody').addEventListener('keydown', e => (e.key === 'Enter' ? pick(e) : null));

  const kpiBox = $('#kpis');
  kpiBox.innerHTML = Array.from(
    { length: 6 },
    () => '<div class="kpi"><div class="l"></div><div class="v"></div><div class="s"></div></div>',
  ).join('');

  store.watch(['code'], ({ code }) => {
    const s = byCode.get(code);
    const b = band(s.departure);
    const rank = [...season].sort((a, c) => a.departure - c.departure).findIndex(x => x.code === code) + 1;
    const wettest = s.actualWeekly.indexOf(Math.max(...s.actualWeekly));
    const below = s.departureWeekly.filter(d => d < 0).length;
    $('#ledeD').textContent =
      `${s.name} closed the season at ${f0.format(s.actual)} mm against a normal of ${f0.format(s.normal)} mm, ${signed(s.departure)}%, which IMD files as ${b.name.toLowerCase()}. ${below} of 17 weeks came in under normal. All-India rain ended at ${f0.format(100 + india)}% of the long-period average; ${s.code} ranks ${rank} of ${season.length} from the driest.`;

    const mood = moodOf(s.departure);
    $('#toonD').innerHTML = megh(mood);
    $('#bubD').innerHTML =
      mood === 'sad'
        ? `Maaf karna, kisan bhai. Only <b>${f0.format(s.actual)} mm</b> where ${f0.format(s.normal)} was due.`
        : mood === 'ok'
          ? `Arre, too much! <b>${signed(s.departure, 0)}%</b> over normal. Fields are waterlogged.`
          : `Right on time. <b>${signed(s.departure, 0)}%</b> is inside the normal band.`;

    const kpis = [
      ['Season rain', s.actual, v => `${f0.format(v)} mm`, `normal ${f0.format(s.normal)} mm`, T.rain],
      ['Departure', s.departure, v => `${signed(v)}%`, chip(s.departure), bandColor(s.departure)],
      [
        'Wettest week',
        s.actualWeekly[wettest],
        v => `${f0.format(v)} mm`,
        `week of ${WEEK_LABELS[wettest]}`,
        T.neel,
      ],
      [
        'Weeks short',
        below,
        v => `${f0.format(v)} / 17`,
        `longest dry run ${longestRun(s.departureWeekly, d => d < 0)} wks`,
        T.sindoor,
      ],
      ['Kharif area', s.area, v => f1.format(v), `lakh ha · ${s.crop} leads`, T.mor],
      ['Irrigated', s.irrigated, v => `${f0.format(v)}%`, `rainfed ${100 - s.irrigated}%`, T.haldi],
    ];
    [...kpiBox.children].forEach((el, i) => {
      const [label, value, fmt, sub, color] = kpis[i];
      el.style.setProperty('--kc', color);
      el.querySelector('.l').textContent = label;
      el.querySelector('.s').innerHTML = sub;
      const v = el.querySelector('.v');
      v.style.color = i === 1 ? color : '';
      countUp(v, value, fmt);
    });

    map.highlight(code);
    weekly.update(s);
    renderLedger(code);
  });
}
