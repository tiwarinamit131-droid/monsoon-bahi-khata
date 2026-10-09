/** Indian number formatting: 1,23,45,678 grouping via Intl's en-IN locale. */
export const f0 = new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 });
export const f1 = new Intl.NumberFormat('en-IN', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

/** Signed number with a true minus sign: +3.1, −14.0, ±0.0 */
export const signed = (v, digits = 1) =>
  (v > 0.049 ? '+' : v < -0.049 ? '−' : '±') + (digits ? f1 : f0).format(Math.abs(v));

/** ₹ crore with sensible precision. */
export const crore = v => (v >= 100 ? f0.format(v) : f1.format(v));
