import { CROPS } from './data.ts';
import { isShort, isSurplus, band } from './imd.ts';
import { PEST, baselineOutput, octoberWeight, type PestPressure } from './montecarlo.ts';
import { allocate, type Allocation, type Option } from './optimizer.ts';
import type { StateSeason } from './season.ts';
import type { YieldModel } from './yield-model.ts';

export interface Intervention extends Option {
  name: string;
  deadline: string;
}

export interface ReliefPlan {
  /** Value of a normal main-crop harvest, ₹ crore. */
  cropValue: number;
  /** Expected loss as a share of crop value, %. */
  lossPct: number;
  /** Farm income at risk, ₹ crore. */
  atRisk: number;
  protectedValue: number;
  exposed: number;
  budget: number;
  /** Budget left unspent because the next rupee would protect less than a rupee here. */
  unspent: number;
  /** Allocations sorted by spend, largest first. */
  orders: Allocation<Intervention>[];
}

export interface ReliefInput {
  state: StateSeason;
  model: Pick<YieldModel, 'a' | 'b'>;
  october: number;
  pest: PestPressure;
  /** ₹ crore. */
  budget: number;
  /** Hurdle rate passed to the optimiser. Defaults to 1: never spend ₹1 to protect less than ₹1. */
  minReturn?: number;
}

/** Translate a state's season into a menu of relief options, each with a capacity and a first-rupee return. */
export function interventions(state: StateSeason, atRisk: number, pest: PestPressure): Intervention[] {
  const dry = isShort(state.departure);
  const wet = isSurplus(state.departure);
  const rainfed = 1 - state.irrigated / 100;
  const irrigated = state.irrigated / 100;
  const pestExtra = pest === 'high' ? 0.08 : pest === 'normal' ? 0.03 : 0;
  const deficit = state.departure < 0;
  const mk = (id: string, name: string, deadline: string, share: number, roi: number): Intervention => ({
    id,
    name,
    deadline,
    cap: atRisk * share,
    roi,
  });
  return [
    mk('seed', 'Short-duration seed & resowing kits', '20 Oct', 0.3 * rainfed * (dry ? 1 : 0.35), 6),
    mk('irrigation', 'Protective irrigation support', '22 Oct', 0.4 * irrigated * (deficit ? 1 : 0.2), 4),
    mk('pest', 'Pest surveillance & bio-control', '15 Nov', 0.06 + (wet ? 0.12 : 0) + pestExtra, 5),
    mk('drainage', 'Field drainage, rabi on residual moisture', '31 Oct', wet ? 0.25 : 0.03, 4.5),
    mk('fodder', 'Fodder banks & cattle camps', '1 Nov', 0.07 * (dry ? 1.4 : 0.3), 3),
    mk('tanks', 'Tank & farm-pond desilting (MGNREGA)', '28 Feb', 0.12 * (deficit ? 1 : 0.4), 2.2),
    mk('insurance', 'PMFBY claim fast-track', '7 Nov', 0.15, 1.2),
  ];
}

export function reliefPlan({ state, model, october, pest, budget, minReturn = 1 }: ReliefInput): ReliefPlan {
  const crop = CROPS[state.crop];
  const cropValue = (baselineOutput(state.area, state.crop) * crop.price) / 100; // lakh units × ₹/unit → ₹ crore
  const effectiveDeparture = state.departure + october * octoberWeight(state.code, state.region);
  const wetPenalty = state.departure > 25 ? 0.15 * (state.departure - 25) : 0;
  const expected =
    model.a + model.b * effectiveDeparture * (1 - state.irrigated / 100) + PEST[pest].mean - wetPenalty;
  const lossPct = Math.max(1.5, -expected) + (state.departure > 19 ? (state.departure - 19) * 0.1 : 0);
  const atRisk = (cropValue * lossPct) / 100;
  const orders = allocate(interventions(state, atRisk, pest), budget, { minReturn }).sort(
    (x, y) => y.spend - x.spend,
  );
  const protectedValue = orders.reduce((s, o) => s + o.benefit, 0);
  const spent = orders.reduce((s, o) => s + o.spend, 0);
  return {
    cropValue,
    lossPct,
    atRisk,
    protectedValue,
    exposed: Math.max(0, atRisk - protectedValue),
    budget,
    unspent: Math.max(0, budget - spent),
    orders,
  };
}

export interface CalendarItem {
  date: string;
  title: string;
  detail: string;
}

/** A dated playbook keyed to the state's IMD band. */
export function playbook(departure: number): CalendarItem[] {
  const k = band(departure).key;
  if (k === 'd' || k === 'ld' || k === 'nr') {
    return [
      {
        date: '9 Oct',
        title: 'Trigger drought assessment',
        detail:
          'Combine rainfall departure, vegetation index and sown-area shortfall as the drought manual sets out.',
      },
      {
        date: '12 Oct',
        title: 'Notify district contingency crop plans',
        detail: 'Switch unsown and failed plots to pulses, oilseeds and short-duration varieties.',
      },
      {
        date: '20 Oct',
        title: 'Reserve reservoir water for drinking first',
        detail: 'Revise release schedules before rabi indents are cleared.',
      },
      {
        date: '1 Nov',
        title: 'Open fodder banks',
        detail: 'Move dry fodder from surplus districts ahead of winter.',
      },
      {
        date: '15 Nov',
        title: 'Rabi seed with moisture-stress tolerance',
        detail: 'Advance chickpea, mustard and barley indents.',
      },
    ];
  }
  if (k === 'n') {
    return [
      {
        date: '15 Oct',
        title: 'Close kharif crop-cutting experiments',
        detail: 'Feeds PMFBY yield estimates.',
      },
      {
        date: '25 Oct',
        title: 'Post-monsoon reservoir release plan',
        detail: 'Normal storage supports a full rabi programme.',
      },
      { date: '5 Nov', title: 'Rabi seed and fertiliser indents', detail: 'Plan on normal acreage.' },
    ];
  }
  return [
    {
      date: '10 Oct',
      title: 'Drain waterlogged fields',
      detail: 'Prioritise low-lying paddy and cotton blocks.',
    },
    {
      date: '15 Oct',
      title: 'Step up pest surveillance',
      detail: 'Wet seasons favour pink bollworm in cotton and girdle beetle in soybean.',
    },
    {
      date: '25 Oct',
      title: 'Advance rabi sowing on residual moisture',
      detail: 'Wheat and chickpea can go in early.',
    },
    {
      date: '5 Nov',
      title: 'Settle crop-damage claims',
      detail: 'Localised inundation is an insured peril under PMFBY.',
    },
  ];
}
