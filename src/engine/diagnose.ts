import { DRIVERS, SENSITIVITY } from './data.ts';
import type { StateSeason } from './season.ts';
import { pearson, sum } from './stats.ts';

export interface Contribution {
  label: string;
  /** Percentage points of the season departure. */
  value: number;
  kind: 'global' | 'local';
}

/** Scales the regional sensitivities up to state-level effects. */
const STATE_AMPLIFICATION = 1.5;

/**
 * Split a season departure into global drivers and a local residual.
 * The contributions always add up exactly to the state's departure.
 */
export function decompose(state: StateSeason): Contribution[] {
  const sens = SENSITIVITY[state.region];
  const global: Contribution[] = DRIVERS.map(d => ({
    label: d.label,
    value: d.effect * sens[d.key] * STATE_AMPLIFICATION,
    kind: 'global',
  }));
  const local = state.departure - sum(global.map(c => c.value));
  return [...global, { label: 'Local weather', value: local, kind: 'local' }];
}

export interface Neighbour {
  state: StateSeason;
  rho: number;
}

/** The other state whose week-by-week departures track this one most closely. */
export function closestTwin(state: StateSeason, all: readonly StateSeason[]): Neighbour {
  let best: Neighbour | null = null;
  for (const other of all) {
    if (other.code === state.code) continue;
    const rho = pearson(state.departureWeekly, other.departureWeekly);
    if (!best || rho > best.rho) best = { state: other, rho };
  }
  if (!best) throw new RangeError('closestTwin: need at least two states');
  return best;
}
