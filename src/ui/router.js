/**
 * Shareable deep links: ?state=GJ opens Gujarat. The URL updates in place as you explore,
 * without adding history entries. Falls back gracefully where the URL can't be changed.
 */
export function initialCode(valid, fallback) {
  try {
    const q = new URLSearchParams(location.search).get('state')?.toUpperCase();
    if (q && valid(q)) return q;
  } catch {
    /* ignore */
  }
  try {
    const saved = localStorage.getItem('mbk-state');
    if (saved && valid(saved)) return saved;
  } catch {
    /* storage blocked */
  }
  return fallback;
}

export function remember(code) {
  try {
    localStorage.setItem('mbk-state', code);
  } catch {
    /* storage blocked */
  }
  try {
    const url = new URL(location.href);
    url.searchParams.set('state', code);
    history.replaceState(history.state, '', url);
  } catch {
    /* sandboxed */
  }
}

export function shareLink(code) {
  const url = new URL(location.href);
  url.searchParams.set('state', code);
  url.hash = '';
  return url.toString();
}
