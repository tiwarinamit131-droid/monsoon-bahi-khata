import type { StateSeason } from './season.ts';
import { ols, pearson, type OlsFit } from './stats.ts';

export interface YieldModel extends OlsFit {
  /** Correlation of raw rain departure with yield, before weighting by rainfed share. */
  rainOnlyR: number;
  /** Number of states the model was fitted on. */
  n: number;
}

/** The regressor: rain departure scaled by the share of the crop that depends on rain. */
export const exposure = (departure: number, irrigatedPct: number): number =>
  departure * (1 - irrigatedPct / 100);

/**
 * Fit  yieldChange = a + b · departure · (1 − irrigated)  across all states.
 * Weighting by the rainfed share is what turns a weak correlation into a strong one.
 */
export function fitYieldModel(states: readonly StateSeason[]): YieldModel {
  const x = states.map(s => exposure(s.departure, s.irrigated));
  const y = states.map(s => s.yieldChange);
  return {
    ...ols(x, y),
    rainOnlyR: pearson(
      states.map(s => s.departure),
      y,
    ),
    n: states.length,
  };
}
