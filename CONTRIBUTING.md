# Contributing

Thanks for taking a look. Issues and pull requests are welcome.

## Setup

```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/monsoon-bahi-khata.git
cd monsoon-bahi-khata
npm ci
npm run dev        # http://localhost:5173
```

You need Node 22.18 or newer. The tests run TypeScript directly through Node's type stripping, with no test framework installed.

## Before you open a pull request

```bash
npm run check      # lint → typecheck → tests → build
npm run format     # if Prettier complains
```

CI runs the same steps on Node 22 and 24.

## Where things go

- **Maths or data** belongs in `src/engine/`, as pure TypeScript with no DOM, globals or `Math.random`. Add a test in `tests/`. Use `mulberry32(hash(...))` if you need randomness.
- **Drawing** belongs in `src/charts/` or `src/sections/`. Read colours from `src/ui/theme.js` so charts stay consistent.
- **Interaction** goes through the store: call `store.set()`, and subscribe with `store.watch(keys, fn)`.

## Style

- Respect `prefers-reduced-motion`. Every animation checks `REDUCED_MOTION` or is covered by the CSS media query.
- Everything must be usable from the keyboard.
- Use Indian number formatting (`f0`, `f1` in `src/ui/format.js`) and a real minus sign (`signed()`).
- Commit messages follow [Conventional Commits](https://www.conventionalcommits.org): `feat:`, `fix:`, `perf:`, `docs:`, `test:`, `chore:`.
