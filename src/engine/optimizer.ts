/**
 * Budget allocation across options with diminishing returns.
 *
 * Each option protects  b(x) = cap · (1 − e^(−roi·x / cap))  for spend x:
 * the first rupee returns `roi`, and returns fall off as spending approaches the option's `cap`.
 * b is concave, so the optimum equalises marginal returns across funded options (the KKT condition).
 * We solve that exactly by bisecting on the Lagrange multiplier λ.
 */

export interface Option {
  id: string;
  /** Maximum value this option can ever protect. */
  cap: number;
  /** Marginal return of the first rupee. */
  roi: number;
}

export interface Allocation<T extends Option = Option> {
  option: T;
  spend: number;
  benefit: number;
}

export const benefit = (o: Option, spend: number): number =>
  o.cap > 0 && o.roi > 0 ? o.cap * (1 - Math.exp((-o.roi * spend) / o.cap)) : 0;

export const marginal = (o: Option, spend: number): number =>
  o.cap > 0 && o.roi > 0 ? o.roi * Math.exp((-o.roi * spend) / o.cap) : 0;

/** Spend on option `o` at which its marginal return falls to λ. */
const spendAt = (o: Option, lambda: number): number =>
  o.cap > 0 && o.roi > lambda ? (o.cap / o.roi) * Math.log(o.roi / lambda) : 0;

export interface AllocateOptions {
  /**
   * Hurdle rate: stop spending once the next rupee would protect less than this.
   * 1 means "never spend ₹1 to save less than ₹1"; 0 means spend the whole budget no matter what.
   */
  minReturn?: number;
}

/**
 * Exact optimal allocation of `budget`. Runs in O(n · log(1/ε)).
 * With a hurdle rate, part of the budget may be left unspent: that money does more good elsewhere.
 */
export function allocate<T extends Option>(
  options: readonly T[],
  budget: number,
  { minReturn = 0 }: AllocateOptions = {},
): Allocation<T>[] {
  const live = options.filter(o => o.cap > 0 && o.roi > minReturn);
  if (budget <= 0 || live.length === 0) return options.map(option => ({ option, spend: 0, benefit: 0 }));

  const total = (lambda: number) => live.reduce((s, o) => s + spendAt(o, lambda), 0);
  if (minReturn > 0 && total(minReturn) <= budget) {
    // The hurdle binds before the budget does: fund every option up to the hurdle and stop.
    return options.map(option => {
      const spend = spendAt(option, minReturn);
      return { option, spend, benefit: benefit(option, spend) };
    });
  }
  let lo = Math.max(1e-12, minReturn);
  let hi = Math.max(...live.map(o => o.roi));
  for (let i = 0; i < 200 && hi - lo > 1e-12 * hi; i++) {
    const mid = Math.sqrt(lo * hi); // geometric bisection: λ spans many orders of magnitude
    if (total(mid) > budget) lo = mid;
    else hi = mid;
  }
  const lambda = hi;
  const spends = options.map(o => spendAt(o, lambda));
  // Hand the last fraction of a rupee lost to bisection tolerance to the best remaining option.
  const gap = budget - spends.reduce((a, b) => a + b, 0);
  if (gap > 0) {
    let best = -1;
    let bestM = -1;
    options.forEach((o, i) => {
      const m = marginal(o, spends[i] as number);
      if (m > bestM) {
        bestM = m;
        best = i;
      }
    });
    if (best >= 0) spends[best] = (spends[best] as number) + gap;
  }
  return options.map((option, i) => {
    const spend = spends[i] as number;
    return { option, spend, benefit: benefit(option, spend) };
  });
}

/** Reference implementation: hand out the budget in small steps to the best marginal option. */
export function allocateGreedy<T extends Option>(
  options: readonly T[],
  budget: number,
  steps = 1000,
): Allocation<T>[] {
  const spends = options.map(() => 0);
  const step = budget / steps;
  for (let s = 0; s < steps; s++) {
    let best = 0;
    let bestGain = -Infinity;
    options.forEach((o, i) => {
      const gain = benefit(o, (spends[i] as number) + step) - benefit(o, spends[i] as number);
      if (gain > bestGain) {
        bestGain = gain;
        best = i;
      }
    });
    spends[best] = (spends[best] as number) + step;
  }
  return options.map((option, i) => ({
    option,
    spend: spends[i] as number,
    benefit: benefit(option, spends[i] as number),
  }));
}
