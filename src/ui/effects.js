import { $, $$, FINE_POINTER, REDUCED_MOTION } from './dom.js';

/** 3D tilt + cursor glare on panels. Writes CSS variables so the glare is pure CSS. */
export function tilt() {
  if (!FINE_POINTER || REDUCED_MOTION) return;
  for (const el of $$('.tilt')) {
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      el.style.transform = `perspective(1100px) rotateX(${(0.5 - y) * 4}deg) rotateY(${(x - 0.5) * 5}deg) translateY(-3px)`;
      el.style.setProperty('--mx', `${x * 100}%`);
      el.style.setProperty('--my', `${y * 100}%`);
    });
    el.addEventListener('pointerleave', () => (el.style.transform = ''));
  }
}

/** Reveal blocks as they scroll in. Blocks already on screen at load stay visible: no blank first frame. */
export function reveal() {
  if (REDUCED_MOTION || !('IntersectionObserver' in window)) return;
  const io = new IntersectionObserver(
    entries =>
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.remove('pre');
          io.unobserve(e.target);
        }
      }),
    { rootMargin: '0px 0px -8% 0px' },
  );
  for (const el of $$('.rv')) {
    if (el.getBoundingClientRect().top > innerHeight) {
      el.classList.add('pre');
      io.observe(el);
    }
  }
}

/** Rain-gauge scroll meter + scroll-spy for the pillar rail. */
export function scrollMeter(getActualMm, format) {
  const fill = $('#gaugeFill');
  const label = $('#gaugeLab');
  const update = () => {
    const max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    const k = Math.min(1, scrollY / max);
    fill.style.height = `${k * 100}%`;
    label.textContent = `${format(k * getActualMm())} mm`;
  };
  addEventListener('scroll', update, { passive: true });
  update();
  const links = $$('.rail a[data-p]');
  const io = new IntersectionObserver(
    entries =>
      entries.forEach(e => {
        if (e.isIntersecting) links.forEach(a => a.classList.toggle('on', a.dataset.p === e.target.id));
      }),
    { rootMargin: '-40% 0px -55% 0px' },
  );
  $$('.pillar').forEach(p => io.observe(p));
  return update;
}
