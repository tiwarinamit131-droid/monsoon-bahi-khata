/** ↑ ↑ ↓ ↓ ← → ← → B A */
const CODE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a',
];

export function onKonami(fn) {
  let i = 0;
  addEventListener('keydown', e => {
    const k = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    i = k === CODE[i] ? i + 1 : k === CODE[0] ? 1 : 0;
    if (i === CODE.length) {
      i = 0;
      fn();
    }
  });
}
