/**
 * Seed data for the synthetic 2026 season.
 *
 * Season totals, areas and irrigation shares are illustrative, not observed values.
 * The IMD bands and the all-India long-period average are real.
 */

export type RegionKey = 'NW' | 'C' | 'S' | 'E';
export type CropKey = 'Rice' | 'Maize' | 'Bajra' | 'Soybean' | 'Cotton';

export interface StateSeed {
  code: string;
  name: string;
  /** Tile-grid position for the cartogram. */
  col: number;
  row: number;
  region: RegionKey;
  /** Normal June–September rainfall, mm. */
  normal: number;
  /** Season departure from normal, %. */
  departure: number;
  /** Kharif area, lakh hectares. */
  area: number;
  /** Share of kharif area under irrigation, %. */
  irrigated: number;
  crop: CropKey;
}

/** All-India long-period average for June–September, 1971–2020 base, mm. */
export const LPA_MM = 868.6;

export const REGIONS: Record<RegionKey, string> = {
  NW: 'North-West',
  C: 'Central',
  S: 'South Peninsula',
  E: 'East & North-East',
};
export const REGION_ORDER: readonly RegionKey[] = ['NW', 'C', 'E', 'S'];

const seed = (
  code: string,
  name: string,
  col: number,
  row: number,
  region: RegionKey,
  normal: number,
  departure: number,
  area: number,
  irrigated: number,
  crop: CropKey,
): StateSeed => ({ code, name, col, row, region, normal, departure, area, irrigated, crop });

export const STATES: readonly StateSeed[] = [
  seed('JK', 'Jammu & Kashmir', 3, 0, 'NW', 480, 12, 3.5, 42, 'Maize'),
  seed('PB', 'Punjab', 2, 1, 'NW', 490, -14, 31, 99, 'Rice'),
  seed('HP', 'Himachal Pradesh', 3, 1, 'NW', 730, 24, 4, 20, 'Maize'),
  seed('UK', 'Uttarakhand', 4, 1, 'NW', 1170, 9, 4.5, 45, 'Rice'),
  seed('AR', 'Arunachal Pradesh', 7, 1, 'E', 1830, -12, 2.5, 5, 'Rice'),
  seed('RJ', 'Rajasthan', 1, 2, 'NW', 415, 31, 165, 30, 'Bajra'),
  seed('HR', 'Haryana', 2, 2, 'NW', 430, -8, 26, 92, 'Rice'),
  seed('UP', 'Uttar Pradesh', 3, 2, 'NW', 750, -22, 115, 80, 'Rice'),
  seed('BR', 'Bihar', 4, 2, 'E', 990, -34, 37, 62, 'Rice'),
  seed('SK', 'Sikkim', 5, 2, 'E', 1660, -15, 0.7, 10, 'Rice'),
  seed('AS', 'Assam', 6, 2, 'E', 1720, -27, 25, 8, 'Rice'),
  seed('NE', 'NE hill states', 7, 2, 'E', 1500, -21, 9, 10, 'Rice'),
  seed('GJ', 'Gujarat', 0, 3, 'C', 720, 38, 85, 48, 'Cotton'),
  seed('MP', 'Madhya Pradesh', 1, 3, 'C', 950, 6, 150, 44, 'Soybean'),
  seed('CG', 'Chhattisgarh', 2, 3, 'C', 1150, -11, 48, 34, 'Rice'),
  seed('JH', 'Jharkhand', 3, 3, 'E', 1020, -41, 18, 14, 'Rice'),
  seed('WB', 'West Bengal', 4, 3, 'E', 1150, -29, 42, 50, 'Rice'),
  seed('ML', 'Meghalaya', 6, 3, 'E', 2620, -18, 2.8, 6, 'Rice'),
  seed('MH', 'Maharashtra', 1, 4, 'C', 990, 3, 150, 19, 'Soybean'),
  seed('TG', 'Telangana', 2, 4, 'S', 720, 18, 64, 58, 'Cotton'),
  seed('OD', 'Odisha', 3, 4, 'C', 1150, -16, 62, 30, 'Rice'),
  seed('GA', 'Goa', 0, 5, 'C', 2750, 4, 1, 10, 'Rice'),
  seed('KA', 'Karnataka', 1, 5, 'S', 840, -9, 76, 33, 'Maize'),
  seed('AP', 'Andhra Pradesh', 2, 5, 'S', 520, -3, 40, 55, 'Rice'),
  seed('KL', 'Kerala', 1, 6, 'S', 2040, -19, 2, 20, 'Rice'),
  seed('TN', 'Tamil Nadu', 2, 6, 'S', 330, 14, 30, 57, 'Rice'),
];

export interface Crop {
  /** Normal yield: tonnes per hectare (bales per hectare for cotton). */
  yield: number;
  /** Illustrative farm-gate price: ₹ per tonne (₹ per bale for cotton). */
  price: number;
  unit: 'lakh t' | 'lakh bales';
}

export const CROPS: Record<CropKey, Crop> = {
  Rice: { yield: 2.8, price: 23690, unit: 'lakh t' },
  Maize: { yield: 3.0, price: 24000, unit: 'lakh t' },
  Bajra: { yield: 1.4, price: 27750, unit: 'lakh t' },
  Soybean: { yield: 1.1, price: 53280, unit: 'lakh t' },
  Cotton: { yield: 2.65, price: 26000, unit: 'lakh bales' },
};

/** Share of season rainfall that normally falls in each of the 17 weeks from 1 June. */
export const WEEKLY_SHARE: readonly number[] = [
  0.03, 0.04, 0.052, 0.06, 0.066, 0.072, 0.075, 0.075, 0.072, 0.068, 0.066, 0.064, 0.06, 0.056, 0.05, 0.044,
  0.05,
];

/** All-India weekly anomaly shape: late onset, July surge, August break, September revival. */
export const SEASON_SHAPE: readonly number[] = [
  -45, -30, -18, -5, 8, 12, 10, 4, -2, -25, -38, -30, -12, 6, 10, 4, -2,
];

/** How each region deviates from the all-India shape, week by week. */
export const REGION_SHIFT: Record<RegionKey, readonly number[]> = {
  NW: [-20, -10, 0, 5, 5, 0, 5, 10, 10, 5, 0, 5, 10, 5, 0, -5, -10],
  C: [0, 5, 5, 5, 0, 5, 5, 0, 0, 5, 5, 5, 0, 0, 5, 5, 5],
  S: [25, 15, 0, -5, -5, -5, -5, -5, 0, 5, 10, 5, 0, -5, -5, 0, 10],
  E: [10, 5, -5, -10, -15, -15, -15, -10, -10, -5, -5, -10, -10, -5, -5, -5, -5],
};

export type DriverKey = 'onset' | 'enso' | 'iod' | 'break';

export interface Driver {
  key: DriverKey;
  label: string;
  /** All-India effect in percentage points. */
  effect: number;
}

export const DRIVERS: readonly Driver[] = [
  { key: 'onset', label: 'Onset delay', effect: -1.2 },
  { key: 'enso', label: 'El Niño', effect: -4.1 },
  { key: 'iod', label: 'Positive IOD', effect: 2.3 },
  { key: 'break', label: 'August break', effect: -3.8 },
];

/** Regional sensitivity to each global driver (1 = all-India average). */
export const SENSITIVITY: Record<RegionKey, Record<DriverKey, number>> = {
  NW: { onset: 0.5, enso: 1.2, iod: 0.6, break: 0.8 },
  C: { onset: 0.8, enso: 1.0, iod: 1.0, break: 1.1 },
  S: { onset: 1.5, enso: 0.8, iod: 1.4, break: 0.6 },
  E: { onset: 1.0, enso: 0.6, iod: 0.3, break: 1.4 },
};

/** "1 Jun", "8 Jun", … — week-start labels for the 2026 season. */
export const WEEK_LABELS: readonly string[] = WEEKLY_SHARE.map((_, i) => {
  const d = new Date(Date.UTC(2026, 5, 1 + i * 7));
  return `${d.getUTCDate()} ${d.toLocaleString('en-IN', { month: 'short', timeZone: 'UTC' })}`;
});
