import { REDUCED_MOTION } from './dom.js';

/** Animate a number in an element from its last value to `to`, with ease-out cubic. */
export function countUp(el, to, fmt, duration = 900) {
  if (!el) return;
  const from = el._value ?? 0;
  el._value = to;
  if (REDUCED_MOTION) {
    el.textContent = fmt(to);
    return;
  }
  const t0 = performance.now();
  const step = now => {
    const k = Math.min(1, (now - t0) / duration);
    const e = 1 - (1 - k) ** 3;
    el.textContent = fmt(from + (to - from) * e);
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

export const moodOf = departure => (departure <= -20 ? 'sad' : departure >= 20 ? 'ok' : 'happy');
