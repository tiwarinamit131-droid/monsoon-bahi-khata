/**
 * India Meteorological Department rainfall categories.
 * A season's departure from its long-period average (LPA) is filed into one of these bands.
 */

export type BandKey = 'le' | 'e' | 'n' | 'd' | 'ld' | 'nr';

export interface Band {
  key: BandKey;
  name: string;
  /** Inclusive lower bound of the departure range, in percent. */
  min: number;
}

/** Ordered from wettest to driest. */
export const BANDS: readonly Band[] = [
  { key: 'le', name: 'Large excess', min: 60 },
  { key: 'e', name: 'Excess', min: 20 },
  { key: 'n', name: 'Normal', min: -19 },
  { key: 'd', name: 'Deficient', min: -59 },
  { key: 'ld', name: 'Large deficient', min: -99 },
  { key: 'nr', name: 'No rain', min: -100 },
];

/**
 * Classify a percentage departure from normal.
 * IMD reports departures rounded to whole percent, so we round first: −19.4 % is Normal, −19.6 % is Deficient.
 */
export function band(departure: number): Band {
  const d = Math.round(departure);
  for (const b of BANDS) if (d >= b.min) return b;
  return BANDS[BANDS.length - 1] as Band;
}

export const isShort = (departure: number): boolean => Math.round(departure) <= -20;
export const isSurplus = (departure: number): boolean => Math.round(departure) >= 20;
