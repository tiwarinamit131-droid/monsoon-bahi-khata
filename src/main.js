/**
 * Monsoon Bahi-Khata — boot.
 * Wires the engine-backed sections to one store, then layers on the effects and developer tooling.
 */
import '@fontsource/rozha-one/400.css';
import '@fontsource/mukta/400.css';
import '@fontsource/mukta/500.css';
import '@fontsource/mukta/700.css';
import '@fontsource/spline-sans-mono/400.css';
import '@fontsource/spline-sans-mono/500.css';
import '@fontsource/baloo-2/500.css';
import '@fontsource/baloo-2/700.css';
import './styles/index.css';

import { band } from './engine/index.ts';
import { createStore } from './store.js';
import { byCode, ordered } from './context.js';
import { $, isTyping } from './ui/dom.js';
import { f0, signed } from './ui/format.js';
import { T } from './ui/theme.js';
import { intro } from './ui/intro.js';
import { sky, startSky } from './ui/sky.js';
import { startCursor } from './ui/cursor.js';
import { reveal, scrollMeter, tilt } from './ui/effects.js';
import { setRain } from './ui/audio.js';
import { toast } from './ui/toast.js';
import { createPalette } from './ui/palette.js';
import { createSheet } from './ui/sheet.js';
import { createHud } from './ui/hud.js';
import { onKonami } from './ui/konami.js';
import { initialCode, remember, shareLink } from './ui/router.js';
import { registerServiceWorker } from './ui/pwa.js';
import { mountHero } from './sections/hero.js';

const DEFAULTS = { october: 0, pest: 'normal', budget: 500 };

const store = createStore({
  code: initialCode(c => byCode.has(c), 'BR'),
  ...DEFAULTS,
  sound: false,
  hud: false,
  cloudburst: false,
});

/* ---------- state picker ---------- */
const picker = $('#state');
picker.innerHTML = ordered.map(s => `<option value="${s.code}">${s.code} — ${s.name}</option>`).join('');
picker.addEventListener('change', () => store.set({ code: picker.value }));

/* ---------- sections ----------
 * The hero renders now. Each pillar is code-split and mounts when it comes within 800px of the
 * viewport, so D3 and Chart.js aren't parsed until they're needed. Keeps the first load light on phones.
 */
mountHero(store);
const SECTIONS = {
  descriptive: () => import('./sections/descriptive.js').then(m => m.mountDescriptive),
  diagnostic: () => import('./sections/diagnostic.js').then(m => m.mountDiagnostic),
  predictive: () => import('./sections/predictive.js').then(m => m.mountPredictive),
  prescriptive: () => import('./sections/prescriptive.js').then(m => m.mountPrescriptive),
};
const mounted = new Set();
const mountSection = id => {
  if (mounted.has(id)) return;
  mounted.add(id);
  SECTIONS[id]().then(mount => mount(store));
};
const lazy = new IntersectionObserver(
  entries => entries.forEach(e => e.isIntersecting && (lazy.unobserve(e.target), mountSection(e.target.id))),
  { rootMargin: '800px 0px' },
);
Object.keys(SECTIONS).forEach(id => lazy.observe(document.getElementById(id)));

const refreshGauge = scrollMeter(
  () => byCode.get(store.get().code).actual,
  v => f0.format(v),
);
store.watch(['code'], ({ code }, prev) => {
  picker.value = code;
  remember(code);
  refreshGauge();
  if (prev) $('#live').textContent = `Now reviewing ${byCode.get(code).name}`;
});

$('#buildId').textContent = `${__COMMIT__} · ${__BUILT_AT__.slice(0, 10)}`;

/* ---------- effects ---------- */
intro();
startSky();
startCursor();
tilt();
reveal();
registerServiceWorker();

/* ---------- sound ---------- */
const soundBtn = $('#sound');
soundBtn.addEventListener('click', () => store.set({ sound: !store.get().sound }));
store.watch(['sound', 'code', 'cloudburst'], ({ sound }, prev) => {
  soundBtn.setAttribute('aria-pressed', String(sound));
  $('#soundLab').textContent = sound ? 'Rain sound on' : 'Play rain sound';
  if (sound || prev?.sound)
    setRain(sound, sky.target).catch(() => ($('#soundLab').textContent = 'Sound unavailable'));
});

/* ---------- developer HUD ---------- */
const hud = createHud();
store.watch(['hud'], ({ hud: on }) => hud.set(on));

/* ---------- cloudburst easter egg ---------- */
store.watch(['cloudburst'], ({ cloudburst }, prev) => {
  document.documentElement.classList.toggle('cloudburst', cloudburst);
  if (prev) toast(cloudburst ? 'Cloudburst unlocked. Badal phat gaya!' : 'The sky calms down.');
});
onKonami(() => store.set({ cloudburst: !store.get().cloudburst }));

/* ---------- navigation helpers ---------- */
const PILLARS = ['descriptive', 'diagnostic', 'predictive', 'prescriptive'];
const goPillar = i => document.getElementById(PILLARS[i])?.scrollIntoView({ behavior: 'smooth' });
const step = delta => {
  const i = ordered.findIndex(s => s.code === store.get().code);
  store.set({ code: ordered[(i + delta + ordered.length) % ordered.length].code });
};
async function copyLink() {
  const link = shareLink(store.get().code);
  try {
    await navigator.clipboard.writeText(link);
    toast('Link copied');
  } catch {
    toast(link);
  }
}

/* ---------- command palette ---------- */
const sheet = createSheet();
const palette = createPalette(() => {
  const { sound, hud: hudOn, cloudburst } = store.get();
  return [
    ...ordered.map(s => {
      const b = band(s.departure);
      return {
        group: 'States',
        title: s.name,
        keywords: `${s.code} ${b.name}`,
        icon: s.code,
        iconStyle: `background:${T[b.key]};color:#071028`,
        meta: `${signed(s.departure, 0)}% · ${b.name}`,
        run: () => store.set({ code: s.code }),
      };
    }),
    ...['I Descriptive', 'II Diagnostic', 'III Predictive', 'IV Prescriptive'].map((t, i) => ({
      group: 'Jump to',
      title: t.split(' ')[1],
      keywords: 'pillar section go',
      icon: t.split(' ')[0],
      meta: `<kbd>${i + 1}</kbd>`,
      run: () => goPillar(i),
    })),
    {
      group: 'Actions',
      title: 'Next state',
      keywords: 'forward',
      icon: '→',
      meta: '<kbd>J</kbd>',
      run: () => step(1),
    },
    {
      group: 'Actions',
      title: 'Previous state',
      keywords: 'back',
      icon: '←',
      meta: '<kbd>K</kbd>',
      run: () => step(-1),
    },
    {
      group: 'Actions',
      title: sound ? 'Stop rain sound' : 'Play rain sound',
      keywords: 'audio music mute',
      icon: '♪',
      meta: '<kbd>M</kbd>',
      run: () => store.set({ sound: !sound }),
    },
    {
      group: 'Actions',
      title: hudOn ? 'Hide developer HUD' : 'Show developer HUD',
      keywords: 'fps debug performance stats',
      icon: '⌁',
      meta: '<kbd>D</kbd>',
      run: () => store.set({ hud: !hudOn }),
    },
    {
      group: 'Actions',
      title: 'Copy link to this state',
      keywords: 'share url deep link',
      icon: '⧉',
      meta: '<kbd>C</kbd>',
      run: copyLink,
    },
    {
      group: 'Actions',
      title: 'Reset scenario controls',
      keywords: 'october pest budget default',
      icon: '↺',
      meta: '<kbd>R</kbd>',
      run: () => resetScenario(),
    },
    {
      group: 'Actions',
      title: 'Keyboard shortcuts',
      keywords: 'help keys',
      icon: '?',
      meta: '<kbd>?</kbd>',
      run: () => sheet.open(),
    },
    {
      group: 'Actions',
      title: cloudburst ? 'Calm the sky' : 'Summon a cloudburst',
      keywords: 'easter egg storm konami secret',
      icon: 'ϟ',
      meta: '↑↑↓↓←→←→BA',
      run: () => store.set({ cloudburst: !cloudburst }),
    },
    {
      group: 'Actions',
      title: 'Back to top',
      keywords: 'home scroll',
      icon: '↑',
      meta: '<kbd>T</kbd>',
      run: () => scrollTo({ top: 0, behavior: 'smooth' }),
    },
  ];
});
$('#openPalette').addEventListener('click', () => palette.open());

/* ---------- keyboard ---------- */
const resetScenario = () => {
  store.set(DEFAULTS);
  toast('Scenario reset');
};
const KEYMAP = {
  '/': () => palette.open(),
  '?': () => sheet.toggle(),
  j: () => step(1),
  k: () => step(-1),
  ArrowRight: () => step(1),
  ArrowLeft: () => step(-1),
  m: () => store.set({ sound: !store.get().sound }),
  d: () => store.set({ hud: !store.get().hud }),
  c: () => copyLink(),
  r: resetScenario,
  t: () => scrollTo({ top: 0, behavior: 'smooth' }),
};
addEventListener('keydown', e => {
  const mod = e.metaKey || e.ctrlKey;
  if (mod && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    if (palette.isOpen()) palette.close();
    else palette.open();
    return;
  }
  if (palette.isOpen() || sheet.isOpen() || mod || e.altKey || isTyping(e)) return;
  const action = KEYMAP[e.key] ?? (/^[1-4]$/.test(e.key) ? () => goPillar(+e.key - 1) : null);
  if (action) {
    e.preventDefault();
    action();
  }
});

/* ---------- a greeting for whoever opens DevTools ---------- */
console.log(
  '%cमानसून बही-खाता%c\nMonsoon Bahi-Khata · build %s\nPress D for the developer HUD, Ctrl+K for the command palette.\nThe engine is pure TypeScript: src/engine/',
  'font:28px serif;color:#ffc53d',
  'font:12px monospace;color:#a3acd9',
  __COMMIT__,
);
