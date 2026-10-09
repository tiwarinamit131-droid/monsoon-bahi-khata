import { CROPS, type CropKey } from './data.ts';
import { gaussian, hash, mulberry32 } from './random.ts';
import { quantile } from './stats.ts';

export type PestPressure = 'low' | 'normal' | 'high';

/** Pest effect on yield: mean and standard deviation, in percentage points. */
export const PEST: Record<PestPressure, { mean: number; sd: number }> = {
  low: { mean: 0.5, sd: 1 },
  normal: { mean: -2, sd: 2 },
  high: { mean: -7, sd: 4 },
};

/** Share of a state's kharif area under its main crop. */
export const MAIN_CROP_SHARE = 0.55;

export interface SimulationParams {
  seed: number;
  runs: number;
  /** Normal-year output of the main crop, lakh t or lakh bales. */
  baseline: number;
  /** Yield model intercept and slope. */
  a: number;
  b: number;
  /** Yield model residual standard error. */
  sigma: number;
  /** Season departure, %. */
  departure: number;
  irrigated: number;
  /** October rain against normal, %. */
  october: number;
  /** How much October rain moves the effective season departure. */
  octoberWeight: number;
  pestMean: number;
  pestSd: number;
}

export interface ScenarioInput {
  code: string;
  region: string;
  area: number;
  crop: CropKey;
  departure: number;
  irrigated: number;
  october: number;
  pest: PestPressure;
  model: { a: number; b: number; sigma: number };
  runs?: number;
}

/** Tamil Nadu gets most of its rain from the north-east monsoon, so October matters far more there. */
export function octoberWeight(code: string, region: string): number {
  if (code === 'TN') return 0.6;
  if (region === 'S') return 0.35;
  return 0.08;
}

export function baselineOutput(area: number, crop: CropKey): number {
  return area * MAIN_CROP_SHARE * CROPS[crop].yield;
}

/** Build simulation parameters from a scenario. Same scenario, same seed, same answer. */
export function scenario(input: ScenarioInput): SimulationParams {
  return {
    seed: hash(`${input.code}|${input.october}|${input.pest}`),
    runs: input.runs ?? 10_000,
    baseline: baselineOutput(input.area, input.crop),
    a: input.model.a,
    b: input.model.b,
    sigma: input.model.sigma,
    departure: input.departure,
    irrigated: input.irrigated,
    october: input.october,
    octoberWeight: octoberWeight(input.code, input.region),
    pestMean: PEST[input.pest].mean,
    pestSd: PEST[input.pest].sd,
  };
}

/** Run the Monte Carlo. Returns simulated outputs sorted ascending. */
export function simulate(p: SimulationParams): Float64Array {
  const rng = mulberry32(p.seed);
  const out = new Float64Array(p.runs);
  const rainfed = 1 - p.irrigated / 100;
  for (let i = 0; i < p.runs; i++) {
    const dep = p.departure + p.october * p.octoberWeight + gaussian(rng) * 3;
    let change = p.a + p.b * dep * rainfed + gaussian(rng) * p.sigma + p.pestMean + gaussian(rng) * p.pestSd;
    if (p.departure > 25) change -= 0.15 * (dep - 25);
    out[i] = p.baseline * (1 + change / 100);
  }
  return out.sort();
}

export interface Summary {
  p10: number;
  p50: number;
  p90: number;
  /** Median change against a normal year, %. */
  medianChange: number;
  /** Probability that output falls more than 10 % below normal, %. */
  lossProbability: number;
}

export function summarize(sorted: Float64Array, baseline: number): Summary {
  let losses = 0;
  const threshold = baseline * 0.9;
  for (let i = 0; i < sorted.length; i++) if ((sorted[i] as number) < threshold) losses++;
  const p50 = quantile(sorted, 0.5);
  return {
    p10: quantile(sorted, 0.1),
    p50,
    p90: quantile(sorted, 0.9),
    medianChange: (p50 / baseline - 1) * 100,
    lossProbability: (losses / sorted.length) * 100,
  };
}
