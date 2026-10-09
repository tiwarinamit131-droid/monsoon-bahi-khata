#!/usr/bin/env node
/**
 * Point every link in the repo at your GitHub account.
 *   npm run set-repo -- <your-github-username>
 */
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const user = process.argv[2];
if (!user || !/^[a-z\d](?:[a-z\d-]{0,38})$/i.test(user)) {
  console.error('Usage: npm run set-repo -- <your-github-username>');
  process.exit(1);
}

const PLACEHOLDER = 'YOUR_GITHUB_USERNAME';
const SKIP = new Set(['node_modules', 'dist', '.git', 'coverage']);
const TEXT = new Set(['.md', '.html', '.json', '.js', '.ts', '.yml', '.webmanifest', '.svg']);
let changed = 0;

function walk(dir) {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path);
    else if (TEXT.has(extname(name)) && !path.endsWith('set-repo.mjs')) {
      const src = readFileSync(path, 'utf8');
      if (src.includes(PLACEHOLDER)) {
        writeFileSync(path, src.replaceAll(PLACEHOLDER, user));
        console.log(`  updated ${path}`);
        changed++;
      }
    }
  }
}

walk(process.cwd());
const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
pkg.homepage = `https://${user}.github.io/monsoon-bahi-khata/`;
pkg.repository = { type: 'git', url: `git+https://github.com/${user}/monsoon-bahi-khata.git` };
pkg.bugs = { url: `https://github.com/${user}/monsoon-bahi-khata/issues` };
writeFileSync('package.json', `${JSON.stringify(pkg, null, 2)}\n`);
console.log(`\nDone: ${changed} files point at github.com/${user}. Next:\n`);
console.log('  git add -A && git commit -m "chore: point links at my account"');
console.log('  git push\n');
