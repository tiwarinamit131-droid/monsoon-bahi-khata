/** Register the service worker in production so the app works offline after the first visit. */
export function registerServiceWorker() {
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;
  const secure = location.protocol === 'https:' || location.hostname === 'localhost';
  if (!secure) return;
  addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {
      /* sandboxed frames refuse service workers; the app works fine without one */
    });
  });
}
