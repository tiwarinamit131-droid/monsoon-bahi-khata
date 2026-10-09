import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { fuzzy, rank } from '../src/engine/fuzzy.ts';

describe('fuzzy', () => {
  it('matches subsequences and rejects missing characters', () => {
    assert.ok(fuzzy('mhr', 'Maharashtra'));
    assert.equal(fuzzy('xyz', 'Maharashtra'), null);
    assert.equal(fuzzy('toolongquery', 'Goa'), null);
  });

  it('returns highlight indices that spell the query', () => {
    const t = 'Madhya Pradesh';
    const m = fuzzy('mp', t)!;
    assert.equal(m.indices.map(i => t[i]!.toLowerCase()).join(''), 'mp');
    assert.deepEqual(m.indices, [0, 7], 'should prefer the word starts M… P…');
  });

  it('ranks word-start and prefix matches first', () => {
    const items = ['Tamil Nadu', 'Uttarakhand', 'Telangana', 'Kerala'].map(name => ({ name }));
    assert.equal(rank('tn', items, i => i.name)[0]!.name, 'Tamil Nadu');
    assert.equal(rank('ker', items, i => i.name)[0]!.name, 'Kerala');
  });

  it('empty query keeps everything in order', () => {
    const items = ['a', 'b', 'c'].map(name => ({ name }));
    assert.deepEqual(
      rank('', items, i => i.name).map(i => i.name),
      ['a', 'b', 'c'],
    );
  });
});
