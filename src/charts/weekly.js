import { Chart, BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend } from 'chart.js';
import { WEEK_LABELS } from '../engine/index.ts';
import { REDUCED_MOTION } from '../ui/dom.js';
import { T } from '../ui/theme.js';
import { f1, signed } from '../ui/format.js';

// Register only what we draw: tree-shakes the rest of Chart.js out of the bundle.
Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip, Legend);
Chart.defaults.font.family = '"Spline Sans Mono", ui-monospace, monospace';
Chart.defaults.color = T.muted;

const gradient = (ctx, from, to) => {
  const area = ctx.chart.chartArea;
  if (!area) return to;
  const g = ctx.chart.ctx.createLinearGradient(0, area.bottom, 0, area.top);
  g.addColorStop(0, from);
  g.addColorStop(1, to);
  return g;
};

/** Weekly actual vs normal rainfall, gradient bars coloured by the sign of each week's departure. */
export function createWeekly(canvas) {
  let state = null;
  const chart = new Chart(canvas, {
    type: 'bar',
    data: { labels: [...WEEK_LABELS], datasets: [] },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: REDUCED_MOTION ? 0 : 900, easing: 'easeOutQuart' },
      plugins: {
        legend: { labels: { boxWidth: 12, color: T.muted } },
        tooltip: {
          backgroundColor: 'rgba(6,10,28,.95)',
          borderColor: T.haldi,
          borderWidth: 1,
          padding: 10,
          callbacks: {
            label: c => `${c.dataset.label}: ${f1.format(c.parsed.y)} mm`,
            afterBody: items => `Departure ${signed(state.departureWeekly[items[0].dataIndex])}%`,
          },
        },
      },
      scales: {
        x: { grid: { display: false }, ticks: { maxRotation: 0, autoSkip: true, maxTicksLimit: 9 } },
        y: { grid: { color: T.grid }, title: { display: true, text: 'mm' } },
      },
    },
  });

  return {
    update(s) {
      state = s;
      chart.data.datasets = [
        {
          label: 'Normal',
          data: s.normalWeekly,
          backgroundColor: 'rgba(163,172,217,.22)',
          borderColor: 'rgba(163,172,217,.5)',
          borderWidth: 1,
          borderRadius: 6,
          barPercentage: 0.9,
          categoryPercentage: 0.8,
        },
        {
          label: 'Actual',
          data: s.actualWeekly,
          backgroundColor: ctx =>
            s.departureWeekly[ctx.dataIndex] < 0
              ? gradient(ctx, 'rgba(255,90,60,.35)', T.sindoor)
              : gradient(ctx, 'rgba(70,212,224,.35)', T.rain),
          borderWidth: 0,
          borderRadius: 6,
          barPercentage: 0.9,
          categoryPercentage: 0.8,
        },
      ];
      chart.update();
    },
  };
}
