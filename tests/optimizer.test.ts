import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { allocate, allocateGreedy, benefit, marginal, type Option } from '../src/engine/optimizer.ts';
import { reliefPlan, playbook } from '../src/engine/relief.ts';
import { buildSeason } from '../src/engine/season.ts';
import { fitYieldModel } from '../src/engine/yield-model.ts';
import { mulberry32 } from '../src/engine/random.ts';

const total = (xs: { benefit: number }[]) => xs.reduce((s, x) => s + x.benefit, 0);

describe('optimizer', () => {
  const opts: Option[] = [
    { id: 'a', cap: 100, roi: 6 },
    { id: 'b', cap: 300, roi: 3 },
    { id: 'c', cap: 50, roi: 1.5 },
    { id: 'dead', cap: 0, roi: 9 },
  ];

  it('spends exactly the budget and nothing on dead options', () => {
    for (const budget of [1, 10, 100, 1000]) {
      const r = allocate(opts, budget);
      const spent = r.reduce((s, x) => s + x.spend, 0);
      assert.ok(Math.abs(spent - budget) < 1e-6 * budget, `spent ${spent} of ${budget}`);
      assert.equal(r.find(x => x.option.id === 'dead')!.spend, 0);
    }
  });

  it('equalises marginal returns across funded options (KKT)', () => {
    const r = allocate(opts, 120).filter(x => x.spend > 1e-6);
    const ms = r.map(x => marginal(x.option, x.spend));
    for (const m of ms) assert.ok(Math.abs(m - ms[0]!) < 1e-6, ms.join(', '));
  });

  it('is never beaten by a fine-grained greedy reference', () => {
    const rng = mulberry32(11);
    for (let t = 0; t < 25; t++) {
      const random: Option[] = Array.from({ length: 6 }, (_, i) => ({
        id: String(i),
        cap: rng() * 500,
        roi: 0.5 + rng() * 6,
      }));
      const budget = 10 + rng() * 800;
      const exact = total(allocate(random, budget));
      const greedy = total(allocateGreedy(random, budget, 4000));
      assert.ok(exact >= greedy - 1e-6, `exact ${exact} < greedy ${greedy}`);
      assert.ok(exact - greedy < 0.01 * exact + 1e-6, 'greedy should converge to the exact answer');
    }
  });

  it('with a hurdle rate, stops where the next rupee returns less than the hurdle', () => {
    const r = allocate(opts, 10_000, { minReturn: 1 });
    const spent = r.reduce((s, x) => s + x.spend, 0);
    assert.ok(spent < 10_000, 'should leave money on the table rather than waste it');
    for (const x of r.filter(x => x.spend > 0)) assert.ok(Math.abs(marginal(x.option, x.spend) - 1) < 1e-9);
    assert.equal(r.find(x => x.option.id === 'c')!.spend > 0, true);
  });

  it('a hurdle never lowers the return per rupee', () => {
    const plain = allocate(opts, 2000);
    const hurdle = allocate(opts, 2000, { minReturn: 1 });
    const ratio = (xs: typeof plain) => total(xs) / xs.reduce((s, x) => s + x.spend, 0);
    assert.ok(ratio(hurdle) > ratio(plain));
  });

  it('a hurdle that does not bind changes nothing', () => {
    const a = allocate(opts, 20);
    const b = allocate(opts, 20, { minReturn: 1 });
    a.forEach((x, i) => assert.ok(Math.abs(x.spend - b[i]!.spend) < 1e-6));
  });

  it('more budget never protects less, and never more than total capacity', () => {
    let last = 0;
    for (let b = 0; b <= 2000; b += 50) {
      const v = total(allocate(opts, b));
      assert.ok(v >= last - 1e-9);
      last = v;
    }
    assert.ok(last <= 450);
  });

  it('benefit is concave with the right first-rupee slope', () => {
    const o = opts[0]!;
    assert.equal(benefit(o, 0), 0);
    assert.ok(Math.abs(marginal(o, 0) - o.roi) < 1e-12);
    assert.ok(benefit(o, 20) - benefit(o, 10) < benefit(o, 10) - benefit(o, 0));
  });
});

describe('relief plan', () => {
  const season = buildSeason();
  const model = fitYieldModel(season);

  it('accounts for every rupee and never protects more than is at risk', () => {
    for (const state of season) {
      const plan = reliefPlan({ state, model, october: 0, pest: 'normal', budget: 500 });
      const spent = plan.orders.reduce((s, o) => s + o.spend, 0);
      assert.ok(Math.abs(spent + plan.unspent - 500) < 1e-3, `${state.code} spent ${spent}`);
      for (const o of plan.orders.filter(o => o.spend > 1e-6))
        assert.ok(o.benefit / o.spend >= 1 - 1e-9, `${state.code}: ${o.option.id} returns under 1×`);
      assert.ok(plan.protectedValue <= plan.atRisk + 1e-9, state.code);
      assert.ok(Math.abs(plan.atRisk - plan.protectedValue - plan.exposed) < 1e-9 || plan.exposed === 0);
    }
  });

  it('dry states lead with seed kits; wet states with drainage or pest control', () => {
    const lead = (code: string) =>
      reliefPlan({
        state: season.find(s => s.code === code)!,
        model,
        october: 0,
        pest: 'normal',
        budget: 200,
      }).orders[0]!.option.id;
    assert.equal(lead('JH'), 'seed');
    assert.ok(['drainage', 'pest'].includes(lead('GJ')));
  });

  it('playbook follows the IMD band', () => {
    assert.match(playbook(-34)[0]!.title, /drought/i);
    assert.match(playbook(0)[0]!.title, /crop-cutting/i);
    assert.match(playbook(38)[0]!.title, /drain/i);
  });
});
