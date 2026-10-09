import { STATES } from '../engine/index.ts';
import { $ } from '../ui/dom.js';
import { f0, signed } from '../ui/format.js';
import { countUp, moodOf } from '../ui/motion.js';
import { sky } from '../ui/sky.js';
import { megh, peacock, boat } from '../cartoons/index.js';
import { byCode, india, season } from '../context.js';

export function mountHero(store) {
  const short = season.filter(s => Math.round(s.departure) <= -20).length;
  countUp($('#hsLpa'), 100 + india, v => `${f0.format(v)}%`, 1800);
  countUp($('#hsShort'), short, v => `${f0.format(v)} / ${STATES.length}`, 1800);
  countUp(
    $('#hsArea'),
    season.reduce((a, s) => a + s.area, 0),
    v => f0.format(v),
    1800,
  );

  const items = [...season]
    .sort((a, b) => a.departure - b.departure)
    .map(
      s =>
        `<span><b>${s.code}</b>${f0.format(s.actual)} mm <em class="${s.departure < 0 ? 'neg' : 'pos'}">${s.departure < 0 ? '▼' : '▲'} ${signed(s.departure)}%</em></span>`,
    )
    .join('');
  $('#ticker').innerHTML = items + items;

  $('#heroMor').innerHTML = peacock();
  $('#boats').innerHTML = [0, 7.5, 15]
    .map(
      (d, i) =>
        `<div class="boat" style="animation-delay:-${d}s,-${i * 0.7}s">${boat(i === 1 ? '#ffe9a8' : '#f4f8ff')}</div>`,
    )
    .join('');

  store.watch(['code', 'cloudburst'], ({ code, cloudburst }) => {
    const s = byCode.get(code);
    const mood = cloudburst ? 'ok' : moodOf(s.departure);
    sky.storm = cloudburst;
    sky.target = cloudburst ? 1.6 : Math.max(0.12, Math.min(1, 0.55 * (1 + s.departure / 100)));
    $('#heroMegh').innerHTML = megh(mood);
    $('#heroMor .peacock').classList.toggle('dance', cloudburst || s.departure > -20);
    const all = f0.format(100 + india);
    $('#heroBubble').innerHTML = cloudburst
      ? `<b>Badal phat gaya!</b> Cloudburst mode is on. Run it again from the palette to calm me down.`
      : mood === 'sad'
        ? `Namaste! I'm <b>Megh</b>. I gave India ${all}% of my usual rain, but I was stingy with <b>${s.name}</b>: ${signed(s.departure, 0)}%. Mor won't dance there.`
        : mood === 'ok'
          ? `Namaste! I'm <b>Megh</b>. I overdid it in <b>${s.name}</b>: ${signed(s.departure, 0)}%. Mor is dancing, the farmers are bailing water.`
          : `Namaste! I'm <b>Megh</b>. <b>${s.name}</b> got its fair share, ${signed(s.departure, 0)}%. Watch Mor dance! Press <kbd>Ctrl</kbd> <kbd>K</kbd> to jump anywhere.`;
  });
}
