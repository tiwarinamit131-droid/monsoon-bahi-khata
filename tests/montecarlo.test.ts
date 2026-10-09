import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { buildSeason } from '../src/engine/season.ts';
import { fitYieldModel } from '../src/engine/yield-model.ts';
import { scenario, simulate, summarize, octoberWeight, baselineOutput } from '../src/engine/montecarlo.ts';

const season = buildSeason();
const model = fitYieldModel(season);
const bihar = season.find(s => s.code === 'BR')!;
const run = (october = 0, pest: 'low' | 'normal' | 'high' = 'normal', runs = 20_000) =>
  scenario({ ...bihar, october, pest, model, runs });

describe('monte carlo', () => {
  it('is reproducible for the same scenario', () => {
    assert.deepEqual(simulate(run()), simulate(run()));
  });

  it('returns sorted output of the requested size', () => {
    const out = simulate(run(0, 'normal', 5000));
    assert.equal(out.length, 5000);
    for (let i = 1; i < out.length; i++) assert.ok(out[i]! >= out[i - 1]!);
  });

  it('quantiles are ordered and loss probability is a percentage', () => {
    const p = run();
    const s = summarize(simulate(p), p.baseline);
    assert.ok(s.p10 < s.p50 && s.p50 < s.p90);
    assert.ok(s.lossProbability >= 0 && s.lossProbability <= 100);
  });

  it('median matches the analytic expectation within 0.5 %', () => {
    const p = run(0, 'normal', 50_000);
    const s = summarize(simulate(p), p.baseline);
    const expected = p.a + p.b * p.departure * (1 - p.irrigated / 100) + p.pestMean;
    assert.ok(Math.abs(s.medianChange - expected) < 0.5, `${s.medianChange} vs ${expected}`);
  });

  it('a wetter October and fewer pests raise the median for a dry state', () => {
    const base = summarize(simulate(run(0, 'normal')), run().baseline).p50;
    assert.ok(summarize(simulate(run(40, 'normal')), run().baseline).p50 > base);
    assert.ok(summarize(simulate(run(0, 'low')), run().baseline).p50 > base);
    assert.ok(summarize(simulate(run(0, 'high')), run().baseline).p50 < base);
  });

  it('October matters most in Tamil Nadu', () => {
    assert.ok(octoberWeight('TN', 'S') > octoberWeight('KA', 'S'));
    assert.ok(octoberWeight('KA', 'S') > octoberWeight('BR', 'E'));
    assert.ok(baselineOutput(10, 'Rice') > 0);
  });
});
