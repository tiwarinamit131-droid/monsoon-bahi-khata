/** Small, dependency-free statistics toolkit. */

export const sum = (xs: ArrayLike<number>): number => {
  let s = 0;
  for (let i = 0; i < xs.length; i++) s += xs[i] as number;
  return s;
};

export const mean = (xs: ArrayLike<number>): number => (xs.length ? sum(xs) / xs.length : NaN);

/** Pearson correlation coefficient. Returns NaN when either series has zero variance. */
export function pearson(a: readonly number[], b: readonly number[]): number {
  if (a.length !== b.length) throw new RangeError('pearson: series must have equal length');
  const ma = mean(a);
  const mb = mean(b);
  let num = 0;
  let da = 0;
  let db = 0;
  for (let i = 0; i < a.length; i++) {
    const x = (a[i] as number) - ma;
    const y = (b[i] as number) - mb;
    num += x * y;
    da += x * x;
    db += y * y;
  }
  return num / Math.sqrt(da * db);
}

export interface OlsFit {
  /** Intercept. */
  a: number;
  /** Slope. */
  b: number;
  /** Coefficient of determination. */
  r2: number;
  /** Residual standard error, n − 2 degrees of freedom. */
  sigma: number;
  residuals: number[];
  predict: (x: number) => number;
}

/** Ordinary least squares for y = a + b·x, solved in closed form. */
export function ols(x: readonly number[], y: readonly number[]): OlsFit {
  if (x.length !== y.length) throw new RangeError('ols: x and y must have equal length');
  if (x.length < 3) throw new RangeError('ols: need at least 3 points');
  const mx = mean(x);
  const my = mean(y);
  let sxy = 0;
  let sxx = 0;
  for (let i = 0; i < x.length; i++) {
    const dx = (x[i] as number) - mx;
    sxy += dx * ((y[i] as number) - my);
    sxx += dx * dx;
  }
  if (sxx === 0) throw new RangeError('ols: x has zero variance');
  const b = sxy / sxx;
  const a = my - b * mx;
  const residuals = y.map((yi, i) => yi - (a + b * (x[i] as number)));
  const sse = sum(residuals.map(e => e * e));
  const sst = sum(y.map(yi => (yi - my) ** 2));
  return {
    a,
    b,
    r2: sst === 0 ? 1 : 1 - sse / sst,
    sigma: Math.sqrt(sse / (x.length - 2)),
    residuals,
    predict: v => a + b * v,
  };
}

/** Quantile of an ascending-sorted array using the nearest-rank method. */
export function quantile(sorted: ArrayLike<number>, p: number): number {
  if (!sorted.length) return NaN;
  const i = Math.min(sorted.length - 1, Math.max(0, Math.floor(p * sorted.length)));
  return sorted[i] as number;
}

/** Length of the longest run of consecutive items that satisfy `pred`. */
export function longestRun<T>(xs: readonly T[], pred: (x: T) => boolean): number {
  let best = 0;
  let run = 0;
  for (const x of xs) {
    run = pred(x) ? run + 1 : 0;
    if (run > best) best = run;
  }
  return best;
}
