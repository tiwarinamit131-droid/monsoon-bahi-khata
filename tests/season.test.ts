import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { STATES, WEEKLY_SHARE, REGION_ORDER } from '../src/engine/data.ts';
import { buildSeason, nationalDeparture, regionWeekly } from '../src/engine/season.ts';
import { closestTwin, decompose } from '../src/engine/diagnose.ts';
import { fitYieldModel } from '../src/engine/yield-model.ts';
import { sum } from '../src/engine/stats.ts';

const season = buildSeason();

describe('season', () => {
  it('weekly shares form a full season', () => {
    assert.ok(Math.abs(sum(WEEKLY_SHARE) - 1) < 1e-9);
    assert.equal(WEEKLY_SHARE.length, 17);
  });

  it('has unique codes and unique tile positions', () => {
    assert.equal(new Set(STATES.map(s => s.code)).size, STATES.length);
    assert.equal(new Set(STATES.map(s => `${s.col},${s.row}`)).size, STATES.length);
  });

  it('weekly rain adds up exactly to the season total, for every state', () => {
    for (const s of season) {
      assert.ok(Math.abs(sum(s.actualWeekly) - s.actual) < 1e-6, s.code);
      assert.ok(Math.abs(s.actual - s.normal * (1 + s.departure / 100)) < 1e-9, s.code);
      assert.ok(
        s.actualWeekly.every(v => v > 0),
        `${s.code} has a non-positive week`,
      );
    }
  });

  it('is deterministic across builds', () => {
    assert.deepEqual(buildSeason(), season);
  });

  it('national departure is an area-weighted mean inside the state range', () => {
    const d = nationalDeparture(season);
    const ds = season.map(s => s.departure);
    assert.ok(d > Math.min(...ds) && d < Math.max(...ds));
  });

  it('regional weekly series exist for all four regions', () => {
    for (const r of REGION_ORDER) assert.equal(regionWeekly(season, r).length, 17);
  });
});

describe('diagnose', () => {
  it('contributions always sum to the departure', () => {
    for (const s of season) {
      const parts = decompose(s);
      assert.ok(Math.abs(sum(parts.map(p => p.value)) - s.departure) < 1e-9, s.code);
      assert.equal(parts.at(-1)?.kind, 'local');
    }
  });

  it('closest twin is another state with ρ in [−1, 1]', () => {
    const s = season[0]!;
    const twin = closestTwin(s, season);
    assert.notEqual(twin.state.code, s.code);
    assert.ok(twin.rho >= -1 && twin.rho <= 1);
  });
});

describe('yield model', () => {
  const m = fitYieldModel(season);
  it('weighting by rainfed share beats raw rainfall', () => {
    assert.ok(m.r2 > m.rainOnlyR ** 2, `R² ${m.r2} vs r² ${m.rainOnlyR ** 2}`);
    assert.ok(m.b > 0, 'more rain on rainfed land should raise yields');
    assert.equal(m.n, STATES.length);
  });
});
