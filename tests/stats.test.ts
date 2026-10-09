import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { longestRun, mean, ols, pearson, quantile, sum } from '../src/engine/stats.ts';

const close = (a: number, b: number, eps = 1e-9) => assert.ok(Math.abs(a - b) <= eps, `${a} ≉ ${b}`);

describe('stats', () => {
  it('sum and mean', () => {
    assert.equal(sum([1, 2, 3.5]), 6.5);
    assert.equal(sum(new Float64Array([1, 1])), 2);
    assert.equal(mean([2, 4]), 3);
    assert.ok(Number.isNaN(mean([])));
  });

  it('pearson: perfect, inverse and length guard', () => {
    close(pearson([1, 2, 3], [2, 4, 6]), 1);
    close(pearson([1, 2, 3], [3, 2, 1]), -1);
    assert.throws(() => pearson([1], [1, 2]), RangeError);
  });

  it('ols recovers a known line exactly', () => {
    const x = [0, 1, 2, 3, 4];
    const fit = ols(
      x,
      x.map(v => 3 - 2 * v),
    );
    close(fit.a, 3);
    close(fit.b, -2);
    close(fit.r2, 1);
    close(fit.sigma, 0);
    close(fit.predict(10), -17);
  });

  it('ols residuals sum to zero and r2 is in [0, 1]', () => {
    const x = [1, 2, 3, 4, 5, 6];
    const y = [2.1, 3.9, 6.2, 7.8, 10.1, 12.2];
    const fit = ols(x, y);
    close(sum(fit.residuals), 0, 1e-9);
    assert.ok(fit.r2 > 0.99 && fit.r2 <= 1);
  });

  it('ols rejects degenerate input', () => {
    assert.throws(() => ols([1, 2], [1, 2]), RangeError);
    assert.throws(() => ols([1, 1, 1], [1, 2, 3]), RangeError);
  });

  it('quantile (nearest rank) and longestRun', () => {
    const s = Float64Array.from({ length: 100 }, (_, i) => i);
    assert.equal(quantile(s, 0.5), 50);
    assert.equal(quantile(s, 0), 0);
    assert.equal(quantile(s, 1), 99);
    assert.ok(Number.isNaN(quantile([], 0.5)));
    assert.equal(
      longestRun([-1, -2, 3, -4, -5, -6, 1], x => x < 0),
      3,
    );
    assert.equal(
      longestRun([], () => true),
      0,
    );
  });
});
