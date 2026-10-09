import { $, REDUCED_MOTION } from './dom.js';

/** Lightning flash + self-drawing "मानसून". Plays on every load; click, Esc or Skip ends it. */
export function intro() {
  const el = $('#intro');
  if (!el) return;
  if (REDUCED_MOTION) {
    el.remove();
    return;
  }
  let gone = false;
  const close = () => {
    if (gone) return;
    gone = true;
    el.classList.add('gone');
    removeEventListener('keydown', onKey);
    setTimeout(() => el.remove(), 900);
  };
  const onKey = e => {
    if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') close();
  };
  el.addEventListener('click', close);
  addEventListener('keydown', onKey);
  setTimeout(close, 3300);
}
