# Changelog

All notable changes to this project are documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses [Semantic Versioning](https://semver.org/).

## [1.0.0] - 2026-10-09

### Added

- Four-pillar dashboard: descriptive, diagnostic, predictive and prescriptive analytics for the 2026 south-west monsoon across 26 states.
- Pure TypeScript engine (`src/engine`) with seeded randomness, OLS yield model, Monte Carlo simulation, an exact KKT budget optimiser with a hurdle rate, and a DP fuzzy matcher.
- Monte Carlo in a module Web Worker with transferable buffers and a main-thread fallback.
- Command palette (<kbd>Ctrl</kbd> <kbd>K</kbd>), keyboard shortcuts, developer HUD (<kbd>D</kbd>), shareable `?state=` deep links and a Konami-code cloudburst.
- Canvas night sky with parallax rain and procedural lightning, raindrop cursor trail, rain sound synthesised with the Web Audio API, and four hand-drawn SVG characters who react to the data.
- PWA: web app manifest and service worker for offline use.
- 55 unit tests with 99.9 % line coverage on the engine, run on Node's built-in test runner with no test dependencies.
- CI on Node 22 and 24, automatic GitHub Pages deploys, Dependabot.

### Performance

- Pillars are code-split and mount when they approach the viewport.
- Critical fonts are preloaded by a small Vite plugin; layout shift fell from 0.16 to 0.005.
