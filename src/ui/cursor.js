import { $, FINE_POINTER, REDUCED_MOTION } from './dom.js';

export const cursorStats = { particles: 0 };

/**
 * Custom pointer: a glowing dot, a lagging ring that swells over anything clickable,
 * a raindrop trail whose density follows mouse speed, and a splash + ripple on click.
 * Only on devices with a precise pointer; touch screens keep their native behaviour.
 */
export function startCursor() {
  if (!FINE_POINTER || REDUCED_MOTION) return;
  document.documentElement.classList.add('has-cursor');
  const dot = $('#curDot');
  const ring = $('#curRing');
  const canvas = $('#fx');
  const ctx = canvas.getContext('2d');
  const resize = () => {
    const dpr = Math.min(2, devicePixelRatio || 1);
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  addEventListener('resize', resize);

  let mx = innerWidth / 2;
  let my = innerHeight / 2;
  let rx = mx;
  let ry = my;
  let lx = mx;
  let ly = my;
  const parts = [];
  const ripples = [];
  const HOT =
    'a,button,select,input,label,[role="button"],[role="option"],.tile,#ledger tbody tr,circle,.boat';

  addEventListener(
    'pointermove',
    e => {
      mx = e.clientX;
      my = e.clientY;
      dot.style.transform = `translate(${mx}px,${my}px)`;
      const speed = Math.hypot(mx - lx, my - ly);
      lx = mx;
      ly = my;
      const n = Math.min(4, 1 + speed / 12);
      for (let i = 0; i < n; i++) {
        parts.push({
          x: mx + (Math.random() - 0.5) * 8,
          y: my + (Math.random() - 0.5) * 8,
          vx: (Math.random() - 0.5) * 0.6,
          vy: Math.random() * 0.5,
          life: 1,
          r: 1.5 + Math.random() * 2.5,
          rgb: Math.random() < 0.25 ? '255,197,61' : '95,224,232',
          g: 0.05,
        });
      }
      ring.classList.toggle('hot', !!e.target.closest?.(HOT));
    },
    { passive: true },
  );
  addEventListener('pointerdown', () => {
    ring.classList.add('down');
    ripples.push({ x: mx, y: my, r: 4, a: 1 });
    for (let i = 0; i < 18; i++) {
      const a = Math.random() * Math.PI * 2;
      const v = 1 + Math.random() * 3;
      parts.push({
        x: mx,
        y: my,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v - 1.5,
        life: 1,
        r: 2 + Math.random() * 2,
        rgb: '95,224,232',
        g: 0.12,
      });
    }
  });
  addEventListener('pointerup', () => ring.classList.remove('down'));
  document.addEventListener('mouseleave', () => (dot.style.opacity = ring.style.opacity = '0'));
  document.addEventListener('mouseenter', () => (dot.style.opacity = ring.style.opacity = ''));

  (function loop() {
    rx += (mx - rx) * 0.16;
    ry += (my - ry) * 0.16;
    ring.style.transform = `translate(${rx}px,${ry}px)`;
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.g;
      p.life -= 0.025;
      if (p.life <= 0) {
        parts.splice(i, 1);
        continue;
      }
      // A raindrop: pointed top, round bottom.
      ctx.fillStyle = `rgba(${p.rgb},${p.life * 0.85})`;
      ctx.beginPath();
      ctx.moveTo(p.x, p.y - p.r * 1.8);
      ctx.quadraticCurveTo(p.x + p.r, p.y, p.x, p.y + p.r);
      ctx.quadraticCurveTo(p.x - p.r, p.y, p.x, p.y - p.r * 1.8);
      ctx.fill();
    }
    for (let i = ripples.length - 1; i >= 0; i--) {
      const r = ripples[i];
      r.r += 2.4;
      r.a -= 0.025;
      if (r.a <= 0) {
        ripples.splice(i, 1);
        continue;
      }
      ctx.strokeStyle = `rgba(255,197,61,${r.a})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(r.x, r.y, r.r, r.r * 0.55, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    if (parts.length > 400) parts.splice(0, parts.length - 400);
    cursorStats.particles = parts.length;
    requestAnimationFrame(loop);
  })();
}
