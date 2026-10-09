import { rank } from '../engine/index.ts';
import { $, esc } from './dom.js';

/**
 * ⌘K / Ctrl+K command palette.
 * Commands are plain objects; the engine's fuzzy matcher ranks them and returns highlight indices.
 * Fully keyboard-driven, implemented as an ARIA combobox + listbox.
 */
export function createPalette(getCommands) {
  const overlay = $('#palette');
  const input = $('#paletteInput');
  const list = $('#paletteList');
  let items = [];
  let active = 0;
  let lastFocus = null;

  const highlight = (text, indices) => {
    if (!indices?.length) return esc(text);
    const set = new Set(indices);
    return [...text].map((c, i) => (set.has(i) ? `<mark>${esc(c)}</mark>` : esc(c))).join('');
  };

  function render() {
    const q = input.value;
    const commands = getCommands();
    items = q.trim() ? rank(q, commands, c => `${c.title} ${c.keywords ?? ''}`).slice(0, 14) : commands;
    active = Math.min(active, Math.max(0, items.length - 1));
    if (!items.length) {
      list.innerHTML = `<li class="empty" role="presentation">No match for “${esc(q)}”. Try a state, a pillar or “sound”.</li>`;
      input.removeAttribute('aria-activedescendant');
      return;
    }
    let html = '';
    let group = null;
    items.forEach((c, i) => {
      if (!q.trim() && c.group !== group) {
        group = c.group;
        html += `<li class="grp" role="presentation">${esc(group)}</li>`;
      }
      const titleIdx = c.match?.indices.filter(ix => ix < c.title.length);
      html += `<li id="pc-${i}" role="option" aria-selected="${i === active}" data-i="${i}">
        <span class="ic" ${c.iconStyle ? `style="${c.iconStyle}"` : ''}>${esc(c.icon)}</span>
        <span class="t">${highlight(c.title, titleIdx)}</span>
        <span class="meta">${c.meta ?? ''}</span></li>`;
    });
    list.innerHTML = html;
    input.setAttribute('aria-activedescendant', `pc-${active}`);
    list.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest' });
  }

  function move(delta) {
    if (!items.length) return;
    active = (active + delta + items.length) % items.length;
    render();
  }

  function run(i) {
    const cmd = items[i];
    if (!cmd) return;
    close();
    cmd.run();
  }

  function open() {
    if (!overlay.hidden) return;
    lastFocus = document.activeElement;
    overlay.hidden = false;
    input.value = '';
    active = 0;
    render();
    input.focus();
  }

  function close() {
    if (overlay.hidden) return;
    overlay.hidden = true;
    lastFocus?.focus?.();
  }

  input.addEventListener('input', () => {
    active = 0;
    render();
  });
  input.addEventListener('keydown', e => {
    const actions = {
      ArrowDown: () => move(1),
      ArrowUp: () => move(-1),
      Enter: () => run(active),
      Escape: close,
      Tab: () => {},
    };
    const action = actions[e.key];
    if (action) {
      e.preventDefault();
      action();
    }
  });
  list.addEventListener('pointermove', e => {
    const li = e.target.closest('[data-i]');
    if (li && +li.dataset.i !== active) {
      active = +li.dataset.i;
      list
        .querySelectorAll('[role="option"]')
        .forEach(o => o.setAttribute('aria-selected', String(+o.dataset.i === active)));
    }
  });
  list.addEventListener('click', e => {
    const li = e.target.closest('[data-i]');
    if (li) run(+li.dataset.i);
  });
  overlay.addEventListener('pointerdown', e => {
    if (e.target === overlay) close();
  });

  return { open, close, isOpen: () => !overlay.hidden };
}
