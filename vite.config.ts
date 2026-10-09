import { defineConfig, type Plugin } from 'vite';
import { execSync } from 'node:child_process';

function commit(): string {
  try {
    return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch {
    return 'local';
  }
}

/**
 * Preload the fonts the first screen needs, using their content-hashed build names.
 * Without this the browser only discovers them after parsing the CSS, and the swap shifts the hero.
 */
function preloadCriticalFonts(patterns: RegExp[]): Plugin {
  return {
    name: 'preload-critical-fonts',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(_html, ctx) {
        const files = Object.keys(ctx.bundle ?? {}).filter(
          f => f.endsWith('.woff2') && patterns.some(p => p.test(f)),
        );
        return files.map(f => ({
          tag: 'link',
          attrs: { rel: 'preload', as: 'font', type: 'font/woff2', href: `./${f}`, crossorigin: '' },
          injectTo: 'head' as const,
        }));
      },
    },
  };
}

export default defineConfig({
  plugins: [
    // Only what the first screen needs: the display face for the headline and the body face for the tagline.
    // Preloading more (e.g. Devanagari body text) competes with the CSS on slow mobile networks.
    preloadCriticalFonts([/rozha-one-(latin|devanagari)-400-normal/, /mukta-latin-400-normal/]),
  ],
  // Relative base so the same build works on GitHub Pages (/<repo>/), a file server, or a sub-folder.
  base: './',
  define: {
    __COMMIT__: JSON.stringify(process.env.GITHUB_SHA?.slice(0, 7) ?? commit()),
    __BUILT_AT__: JSON.stringify(new Date().toISOString()),
  },
  worker: { format: 'es' },
  build: {
    target: 'es2022',
    sourcemap: true,
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        manualChunks: { d3: ['d3'], chartjs: ['chart.js'] },
      },
    },
  },
});
