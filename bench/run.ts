/**
 * Micro-benchmarks for the engine's hot paths.  Run with:  npm run bench
 * Reports the median of several timed batches after a warm-up, so one GC pause can't skew a row.
 */
import { buildSeason } from '../src/engine/season.ts';
import { fitYieldModel } from '../src/engine/yield-model.ts';
import { scenario, simulate } from '../src/engine/montecarlo.ts';
import { allocate, allocateGreedy } from '../src/engine/optimizer.ts';
import { interventions } from '../src/engine/relief.ts';
import { rank } from '../src/engine/fuzzy.ts';
import { STATES } from '../src/engine/data.ts';

function bench(
  name: string,
  fn: () => unknown,
  batch = 20,
  rounds = 9,
): { name: string; ms: number; ops: number } {
  for (let i = 0; i < batch; i++) fn(); // warm-up, let the JIT settle
  const times: number[] = [];
  for (let r = 0; r < rounds; r++) {
    const t0 = performance.now();
    for (let i = 0; i < batch; i++) fn();
    times.push((performance.now() - t0) / batch);
  }
  times.sort((a, b) => a - b);
  const ms = times[Math.floor(rounds / 2)]!;
  return { name, ms, ops: 1000 / ms };
}

const season = buildSeason();
const model = fitYieldModel(season);
const bihar = season.find(s => s.code === 'BR')!;
const params = scenario({ ...bihar, october: 0, pest: 'normal', model });
const options = interventions(bihar, 800, 'normal');
const names = STATES.map(s => ({ name: s.name }));

const rows = [
  bench('buildSeason (26 states × 17 weeks)', () => buildSeason()),
  bench('fitYieldModel (OLS, n = 26)', () => fitYieldModel(season), 2000),
  bench('simulate (10,000 Monte Carlo runs)', () => simulate(params), 10),
  bench('allocate (exact KKT, 7 options)', () => allocate(options, 500), 2000),
  bench('allocateGreedy (1,000 steps)', () => allocateGreedy(options, 500, 1000), 50),
  bench('fuzzy rank (26 states)', () => rank('mhr', names, n => n.name), 2000),
];

const w = Math.max(...rows.map(r => r.name.length));
console.log(`\nNode ${process.version} · ${process.platform}/${process.arch}\n`);
console.log(`${'benchmark'.padEnd(w)}   ${'median'.padStart(10)}   ${'ops/s'.padStart(10)}`);
console.log('-'.repeat(w + 26));
for (const r of rows) {
  const t = r.ms >= 1 ? `${r.ms.toFixed(2)} ms` : `${(r.ms * 1000).toFixed(1)} µs`;
  console.log(
    `${r.name.padEnd(w)}   ${t.padStart(10)}   ${Math.round(r.ops).toLocaleString('en-IN').padStart(10)}`,
  );
}
console.log();
