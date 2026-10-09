/**
 * Runs the Monte Carlo off the main thread in a module Web Worker.
 * If workers are unavailable or blocked (some sandboxed iframes), it falls back to the
 * main thread after a short timeout, so the forecast always renders.
 */
import { simulate } from '../engine/index.ts';

export const metrics = { lastMs: 0, thread: '—', runs: 0 };

let worker = null;
try {
  worker = new Worker(new URL('../workers/montecarlo.worker.ts', import.meta.url), { type: 'module' });
} catch {
  worker = null;
}

let nextId = 0;
const WORKER_TIMEOUT_MS = 1500;

function onMain(params, t0) {
  const out = simulate(params);
  return { out, ms: performance.now() - t0, thread: 'main thread' };
}

export function runSimulation(params) {
  const id = ++nextId;
  const t0 = performance.now();
  const done = r => {
    Object.assign(metrics, { lastMs: r.ms, thread: r.thread, runs: params.runs });
    return { ...r, id, stale: id !== nextId };
  };
  if (!worker) return Promise.resolve(done(onMain(params, t0)));

  return new Promise(resolve => {
    let settled = false;
    const finish = r => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      worker?.removeEventListener('message', onMessage);
      resolve(done(r));
    };
    const fallback = () => {
      worker?.terminate();
      worker = null;
      finish(onMain(params, performance.now()));
    };
    const onMessage = e => {
      if (e.data.id === id) finish({ out: e.data.out, ms: e.data.ms, thread: 'Web Worker' });
    };
    const timer = setTimeout(fallback, WORKER_TIMEOUT_MS);
    worker.addEventListener('message', onMessage);
    worker.addEventListener('error', fallback, { once: true });
    try {
      worker.postMessage({ id, params });
    } catch {
      fallback();
    }
  });
}
