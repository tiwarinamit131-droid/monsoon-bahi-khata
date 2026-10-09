/** Everything derived once at boot from the engine. */
import { buildSeason, fitYieldModel, nationalDeparture } from './engine/index.ts';

export const season = buildSeason();
export const byCode = new Map(season.map(s => [s.code, s]));
export const model = fitYieldModel(season);
export const india = nationalDeparture(season);
/** Alphabetical order, used by the picker and next / previous navigation. */
export const ordered = [...season].sort((a, b) => a.name.localeCompare(b.name));
