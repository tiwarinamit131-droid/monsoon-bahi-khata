import { $ } from './dom.js';

export function toast(message) {
  const host = $('#toasts');
  const el = document.createElement('div');
  el.className = 'toast';
  el.setAttribute('role', 'status');
  el.textContent = message;
  host.append(el);
  setTimeout(() => el.remove(), 3300);
}
