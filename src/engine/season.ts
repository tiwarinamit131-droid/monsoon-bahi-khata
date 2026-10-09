import { REGION_SHIFT, SEASON_SHAPE, STATES, WEEKLY_SHARE, type RegionKey, type StateSeed } from './data.ts';
import { gaussian, hash, mulberry32 } from './random.ts';
import { sum } from './stats.ts';

export interface StateSeason extends StateSeed {
  /** Season rainfall, mm. */
  actual: number;
  /** Normal rainfall per week, mm. */
  normalWeekly: number[];
  /** Synthesised actual rainfall per week, mm. Sums exactly to `actual`. */
  actualWeekly: number[];
  /** Weekly departure from normal, %. */
  departureWeekly: number[];
  /** Main-crop yield change against a normal year, %. */
  yieldChange: number;
}

/** Noise added to each week's anomaly, in percentage points. */
const WEEKLY_NOISE = 12;
/** Weight of the all-India shape in each state's weekly anomaly. */
const SHAPE_WEIGHT = 0.7;

/**
 * Expand one state's season total into a plausible 17-week series.
 *
 * Weekly values follow the all-India anomaly shape, shifted by region, plus seeded noise,
 * then get rescaled so they add up exactly to the season total.
 */
export function buildState(seed: StateSeed): StateSeason {
  const rng = mulberry32(hash(seed.code));
  const normalWeekly = WEEKLY_SHARE.map(s => seed.normal * s);
  const shift = REGION_SHIFT[seed.region];
  const raw = normalWeekly.map((n, i) => {
    const anomaly =
      (SEASON_SHAPE[i] as number) * SHAPE_WEIGHT + (shift[i] as number) + gaussian(rng) * WEEKLY_NOISE;
    return n * Math.max(0.05, 1 + anomaly / 100);
  });
  const actual = seed.normal * (1 + seed.departure / 100);
  const scale = actual / sum(raw);
  const actualWeekly = raw.map(v => v * scale);
  const departureWeekly = actualWeekly.map((v, i) => (v / (normalWeekly[i] as number) - 1) * 100);

  // Ground truth for the yield model: rainfed crops track rain, irrigated ones barely notice,
  // and very wet seasons hurt through waterlogging and pests.
  const rainfed = 1 - seed.irrigated / 100;
  let yieldChange = 0.32 * seed.departure * rainfed + gaussian(rng) * 2.5 - 0.5;
  if (seed.departure > 25) yieldChange -= 0.15 * (seed.departure - 25);

  return { ...seed, actual, normalWeekly, actualWeekly, departureWeekly, yieldChange };
}

export function buildSeason(seeds: readonly StateSeed[] = STATES): StateSeason[] {
  return seeds.map(buildState);
}

/** All-India departure, weighting each state by its kharif area. */
export function nationalDeparture(states: readonly StateSeason[]): number {
  const area = sum(states.map(s => s.area));
  return sum(states.map(s => s.departure * s.area)) / area;
}

/** Pooled weekly departure for a region: total actual over total normal. */
export function regionWeekly(states: readonly StateSeason[], region: RegionKey): number[] {
  const members = states.filter(s => s.region === region);
  return WEEKLY_SHARE.map((_, i) => {
    const a = sum(members.map(s => s.actualWeekly[i] as number));
    const n = sum(members.map(s => s.normalWeekly[i] as number));
    return (a / n - 1) * 100;
  });
}
