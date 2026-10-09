/// <reference lib="webworker" />
import { simulate, type SimulationParams } from '../engine/montecarlo.ts';

interface Job {
  id: number;
  params: SimulationParams;
}

self.onmessage = (event: MessageEvent<Job>) => {
  const { id, params } = event.data;
  const t0 = performance.now();
  const out = simulate(params);
  const ms = performance.now() - t0;
  // Transfer the buffer instead of copying 80 KB per run.
  (self as unknown as Worker).postMessage({ id, out, ms }, [out.buffer]);
};
