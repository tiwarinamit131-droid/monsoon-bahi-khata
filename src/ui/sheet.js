import { $ } from './dom.js';

/** The "?" keyboard-shortcuts sheet. */
export function createSheet() {
  const overlay = $('#sheet');
  let lastFocus = null;
  const close = () => {
    if (overlay.hidden) return;
    overlay.hidden = true;
    lastFocus?.focus?.();
  };
  const open = () => {
    lastFocus = document.activeElement;
    overlay.hidden = false;
    $('#sheetClose').focus();
  };
  $('#sheetClose').addEventListener('click', close);
  overlay.addEventListener('pointerdown', e => e.target === overlay && close());
  overlay.addEventListener('keydown', e => e.key === 'Escape' && close());
  return { open, close, toggle: () => (overlay.hidden ? open() : close()), isOpen: () => !overlay.hidden };
}
