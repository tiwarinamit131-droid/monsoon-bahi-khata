/** Tiny DOM helpers. No framework: the page is small enough that direct DOM is faster and clearer. */
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = s => String(s).replace(/[&<>"']/g, c => ESC[c]);

export const REDUCED_MOTION = matchMedia('(prefers-reduced-motion: reduce)').matches;
export const FINE_POINTER = matchMedia('(pointer: fine)').matches;

/** True when the keyboard event comes from a text field, so global shortcuts should stand down. */
export const isTyping = e =>
  e.target instanceof HTMLElement &&
  (e.target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName));

/** Coalesce bursts of calls (e.g. slider drags) into one call per animation frame. */
export function rafThrottle(fn) {
  let queued = false;
  let lastArgs;
  return (...args) => {
    lastArgs = args;
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      fn(...lastArgs);
    });
  };
}
