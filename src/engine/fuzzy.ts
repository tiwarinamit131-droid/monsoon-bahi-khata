/**
 * Subsequence fuzzy matcher for the command palette, in the spirit of fzf / VS Code's quick open.
 *
 * Every query character must appear in order. Scoring rewards matches at word starts,
 * consecutive runs and an early first match, and penalises gaps.
 */

export interface FuzzyMatch {
  score: number;
  /** Indices of matched characters in the target, for highlighting. */
  indices: number[];
}

const isBoundary = (text: string, i: number): boolean => {
  if (i === 0) return true;
  const prev = text[i - 1] as string;
  const cur = text[i] as string;
  return /[\s\-_/&·(]/.test(prev) || (prev === prev.toLowerCase() && cur !== cur.toLowerCase());
};

export function fuzzy(query: string, target: string): FuzzyMatch | null {
  const q = query.trim().toLowerCase();
  if (!q) return { score: 0, indices: [] };
  const t = target.toLowerCase();

  // Dynamic programming over (query index, target index) so we find the best alignment,
  // not just the first one a greedy scan would stumble into.
  const n = q.length;
  const m = t.length;
  if (n > m) return null;
  const NEG = -Infinity;
  const score: number[][] = Array.from({ length: n }, () => new Array<number>(m).fill(NEG));
  const from: number[][] = Array.from({ length: n }, () => new Array<number>(m).fill(-1));

  for (let i = 0; i < n; i++) {
    const qc = q[i];
    for (let j = i; j < m; j++) {
      if (t[j] !== qc) continue;
      const bonus = (isBoundary(target, j) ? 8 : 0) + (j === 0 ? 4 : 0);
      if (i === 0) {
        score[0]![j] = 10 + bonus - Math.min(j, 12) * 0.5;
        continue;
      }
      let best = NEG;
      let arg = -1;
      for (let k = i - 1; k < j; k++) {
        const prev = score[i - 1]![k]!;
        if (prev === NEG) continue;
        const gap = j - k - 1;
        const s = prev + 10 + bonus + (gap === 0 ? 6 : -Math.min(gap, 10));
        if (s > best) {
          best = s;
          arg = k;
        }
      }
      score[i]![j] = best;
      from[i]![j] = arg;
    }
  }

  let end = -1;
  let top = NEG;
  for (let j = 0; j < m; j++) {
    if (score[n - 1]![j]! > top) {
      top = score[n - 1]![j]!;
      end = j;
    }
  }
  if (end < 0 || top === NEG) return null;
  const indices: number[] = [];
  for (let i = n - 1, j = end; i >= 0; j = from[i]![j]!, i--) indices.unshift(j);
  return { score: top - (m - n) * 0.05, indices };
}

/** Rank items by fuzzy score; ties keep their original order. */
export function rank<T>(
  query: string,
  items: readonly T[],
  key: (item: T) => string,
): Array<T & { match: FuzzyMatch }> {
  return items
    .map((item, order) => ({ item, order, match: fuzzy(query, key(item)) }))
    .filter((r): r is { item: T; order: number; match: FuzzyMatch } => r.match !== null)
    .sort((a, b) => b.match.score - a.match.score || a.order - b.order)
    .map(r => ({ ...r.item, match: r.match }));
}
