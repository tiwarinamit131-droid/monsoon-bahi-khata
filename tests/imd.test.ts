import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { band, isShort, isSurplus } from '../src/engine/imd.ts';

describe('IMD bands', () => {
  const cases: Array<[number, string]> = [
    [120, 'le'],
    [60, 'le'],
    [59, 'e'],
    [20, 'e'],
    [19, 'n'],
    [0, 'n'],
    [-19, 'n'],
    [-20, 'd'],
    [-59, 'd'],
    [-60, 'ld'],
    [-99, 'ld'],
    [-100, 'nr'],
  ];
  for (const [d, k] of cases) it(`${d}% → ${k}`, () => assert.equal(band(d).key, k));

  it('rounds like IMD reports: −19.4 is Normal, −19.6 is Deficient', () => {
    assert.equal(band(-19.4).key, 'n');
    assert.equal(band(-19.6).key, 'd');
    assert.equal(band(19.6).key, 'e');
  });

  it('every integer from −100 to +200 lands in exactly one band, in order', () => {
    const order = ['nr', 'ld', 'd', 'n', 'e', 'le'];
    let last = 0;
    for (let d = -100; d <= 200; d++) {
      const i = order.indexOf(band(d).key);
      assert.ok(i >= last, `band went backwards at ${d}`);
      last = i;
    }
  });

  it('helpers agree with the bands', () => {
    assert.ok(isShort(-20) && !isShort(-19));
    assert.ok(isSurplus(20) && !isSurplus(19));
  });
});
