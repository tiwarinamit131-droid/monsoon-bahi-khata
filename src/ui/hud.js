import { $ } from './dom.js';
import { metrics } from './mc-client.js';
import { cursorStats } from './cursor.js';
import { sky } from './sky.js';
import { f0, f1 } from './format.js';

/**
 * Developer HUD (press D): live FPS graph, frame time, Monte Carlo timing and thread,
 * particle counts, DOM size, JS heap where the browser exposes it, and the build's commit.
 */
export function createHud() {
  const el = $('#hud');
  const canvas = el.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const out = el.querySelector('.rows');
  const samples = new Array(90).fill(60);
  let raf = 0;
  let last = performance.now();
  let acc = 0;
  let frames = 0;
  let fps = 60;
  let worst = 0;

  function draw() {
    const W = (canvas.width = canvas.clientWidth * 2);
    const H = (canvas.height = 72);
    ctx.clearRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(61,220,151,.25)';
    ctx.beginPath();
    ctx.moveTo(0, H - (60 / 75) * H);
    ctx.lineTo(W, H - (60 / 75) * H);
    ctx.stroke();
    ctx.strokeStyle = '#3ddc97';
    ctx.lineWidth = 2;
    ctx.beginPath();
    samples.forEach((v, i) => {
      const x = (i / (samples.length - 1)) * W;
      const y = H - (Math.min(75, v) / 75) * H;
      if (i) ctx.lineTo(x, y);
      else ctx.moveTo(x, y);
    });
    ctx.stroke();
  }

  function tick(now) {
    const dt = now - last;
    last = now;
    acc += dt;
    frames++;
    worst = Math.max(worst, dt);
    samples.push(1000 / Math.max(1, dt));
    samples.shift();
    if (acc >= 250) {
      fps = (frames * 1000) / acc;
      const mem = performance.memory ? `${f1.format(performance.memory.usedJSHeapSize / 1048576)} MB` : 'n/a';
      const rows = [
        ['fps', f0.format(fps)],
        ['worst frame', `${f1.format(worst)} ms`],
        ['monte carlo', `${f0.format(metrics.runs)} runs · ${f1.format(metrics.lastMs)} ms`],
        ['thread', metrics.thread],
        ['rain drops', f0.format(sky.drops)],
        ['cursor drops', f0.format(cursorStats.particles)],
        ['dom nodes', f0.format(document.getElementsByTagName('*').length)],
        ['js heap', mem],
        ['viewport', `${innerWidth}×${innerHeight} @${devicePixelRatio}x`],
      ];
      out.innerHTML = rows.map(([k, v]) => `<div class="row"><span>${k}</span><b>${v}</b></div>`).join('');
      acc = 0;
      frames = 0;
      worst = 0;
    }
    draw();
    raf = requestAnimationFrame(tick);
  }

  el.querySelector('.hud-build').textContent = `${__COMMIT__} · ${__BUILT_AT__.slice(0, 10)}`;

  return {
    set(on) {
      el.hidden = !on;
      cancelAnimationFrame(raf);
      if (on) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    },
  };
}
