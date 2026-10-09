import { $, REDUCED_MOTION } from './dom.js';

/**
 * The hero's night sky on Canvas 2D: twinkling stars, drifting cloud glows, parallax rain
 * whose density follows the selected state's season, and procedurally generated lightning.
 */
export const sky = { target: 0.6, density: 0.6, storm: false, drops: 0 };

export function startSky() {
  const canvas = $('#sky');
  const ctx = canvas.getContext('2d');
  let w = 0;
  let h = 0;
  const resize = () => {
    const r = canvas.getBoundingClientRect();
    const dpr = Math.min(2, devicePixelRatio || 1);
    canvas.width = r.width * dpr;
    canvas.height = r.height * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    w = r.width;
    h = r.height;
  };
  resize();
  addEventListener('resize', resize);

  const rand = Math.random;
  const drops = Array.from({ length: 520 }, () => ({
    x: rand(),
    y: rand(),
    len: 10 + rand() * 18,
    v: 0.006 + rand() * 0.008,
    z: 0.3 + rand() * 0.7,
  }));
  const clouds = Array.from({ length: 7 }, () => ({
    x: rand(),
    y: 0.04 + rand() * 0.3,
    r: 120 + rand() * 180,
    v: 0.00006 + rand() * 0.00012,
  }));
  const stars = Array.from({ length: 90 }, () => ({
    x: rand(),
    y: rand() * 0.6,
    r: rand() * 1.3,
    p: rand() * 6,
  }));
  let flash = 0;
  let bolt = null;
  let nextBolt = 4000;
  let last = performance.now();
  let visible = true;
  new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(canvas);

  // Midpoint-displacement lightning: a jagged trunk with occasional forks.
  const makeBolt = () => {
    const paths = [];
    const branch = (x, y, depth) => {
      const pts = [[x, y]];
      const end = h * (0.45 + rand() * 0.25) * (depth ? 0.6 : 1);
      while (y < end) {
        x += (rand() - 0.5) * 60;
        y += 16 + rand() * 24;
        pts.push([x, y]);
        if (depth < 2 && rand() < 0.12) branch(x, y, depth + 1);
      }
      paths.push({ pts, width: depth ? 1.2 : 2.6 });
    };
    branch(w * (0.15 + rand() * 0.7), 0, 0);
    return paths;
  };

  function frame(now) {
    const dt = Math.min(50, now - last);
    last = now;
    if (!visible && !REDUCED_MOTION) return requestAnimationFrame(frame);
    ctx.clearRect(0, 0, w, h);
    sky.density += (sky.target - sky.density) * 0.03;
    const d = sky.density;

    for (const s of stars) {
      ctx.globalAlpha = Math.max(0, (0.25 + 0.35 * Math.sin(now / 900 + s.p)) * (1 - Math.min(1, d) * 0.6));
      ctx.fillStyle = '#dfe8ff';
      ctx.beginPath();
      ctx.arc(s.x * w, s.y * h, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    for (const c of clouds) {
      if (!REDUCED_MOTION) c.x += c.v * dt * (sky.storm ? 4 : 1);
      if (c.x > 1.3) c.x = -0.3;
      const g = ctx.createRadialGradient(c.x * w, c.y * h, 0, c.x * w, c.y * h, c.r);
      g.addColorStop(0, `rgba(120,140,200,${0.1 + Math.min(1, d) * 0.12})`);
      g.addColorStop(1, 'rgba(120,140,200,0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(c.x * w, c.y * h, c.r, 0, Math.PI * 2);
      ctx.fill();
    }

    const n = Math.min(drops.length, Math.round(drops.length * 0.8 * d));
    sky.drops = n;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#8fe8f2';
    const wind = sky.storm ? 0.9 : 0.22;
    for (let i = 0; i < n; i++) {
      const p = drops[i];
      if (!REDUCED_MOTION) {
        const v = (p.v * dt) / 16;
        p.y += v * (0.7 + d) * p.z * 1.4;
        p.x -= v * wind;
        if (p.y > 1.05) {
          p.y = -0.05;
          p.x = rand() * 1.3;
        }
      }
      ctx.globalAlpha = 0.18 + p.z * 0.35;
      ctx.lineWidth = p.z * 1.4;
      ctx.beginPath();
      ctx.moveTo(p.x * w, p.y * h);
      ctx.lineTo(p.x * w - p.len * wind, p.y * h + p.len * p.z);
      ctx.stroke();
    }

    if (!REDUCED_MOTION) {
      nextBolt -= dt;
      if (nextBolt <= 0) {
        flash = 1;
        bolt = makeBolt();
        nextBolt = sky.storm ? 500 + rand() * 900 : 5000 + (rand() * 8000) / (0.4 + d);
      }
      if (flash > 0) {
        ctx.globalAlpha = flash * 0.25;
        ctx.fillStyle = '#cfe0ff';
        ctx.fillRect(0, 0, w, h);
        if (bolt && flash > 0.35) {
          ctx.globalAlpha = flash;
          ctx.strokeStyle = '#f4f8ff';
          ctx.shadowColor = '#9fd8ff';
          ctx.shadowBlur = 24;
          for (const b of bolt) {
            ctx.lineWidth = b.width;
            ctx.beginPath();
            b.pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)));
            ctx.stroke();
          }
          ctx.shadowBlur = 0;
        }
        flash -= dt / 380;
      }
    }
    ctx.globalAlpha = 1;
    if (!REDUCED_MOTION) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
