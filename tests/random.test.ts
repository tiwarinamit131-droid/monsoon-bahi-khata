import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { gaussian, hash, mulberry32 } from '../src/engine/random.ts';
import { mean } from '../src/engine/stats.ts';

describe('random', () => {
  it('hash is stable and spreads nearby strings', () => {
    assert.equal(hash('BR'), hash('BR'));
    assert.notEqual(hash('BR'), hash('RB'));
    assert.ok(hash('') >= 0 && hash('x') < 2 ** 32);
  });

  it('mulberry32 is deterministic per seed and stays in [0, 1)', () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    const c = mulberry32(43);
    const xs = Array.from({ length: 1000 }, () => a());
    assert.deepEqual(
      xs,
      Array.from({ length: 1000 }, () => b()),
    );
    assert.notEqual(xs[0], c());
    assert.ok(xs.every(x => x >= 0 && x < 1));
  });

  it('mulberry32 is roughly uniform', () => {
    const r = mulberry32(7);
    const bins = new Array(10).fill(0);
    for (let i = 0; i < 100_000; i++) bins[Math.floor(r() * 10)]++;
    for (const n of bins) assert.ok(Math.abs(n - 10_000) < 400, `bin count ${n}`);
  });

  it('gaussian has mean ≈ 0 and variance ≈ 1', () => {
    const r = mulberry32(2026);
    const xs = Array.from({ length: 200_000 }, () => gaussian(r));
    const m = mean(xs);
    const v = mean(xs.map(x => (x - m) ** 2));
    assert.ok(Math.abs(m) < 0.01, `mean ${m}`);
    assert.ok(Math.abs(v - 1) < 0.01, `variance ${v}`);
  });
});
