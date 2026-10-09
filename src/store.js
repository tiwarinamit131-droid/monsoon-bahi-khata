/**
 * A 20-line observable store. One source of truth, unidirectional flow:
 * controls call set(), sections subscribe to the keys they care about and re-render.
 */
export function createStore(initial) {
  let state = Object.freeze({ ...initial });
  const subs = new Set();
  return {
    get: () => state,
    set(patch) {
      const prev = state;
      const next = Object.freeze({ ...state, ...patch });
      if (Object.keys(patch).every(k => Object.is(prev[k], next[k]))) return;
      state = next;
      for (const fn of subs) fn(state, prev);
    },
    /** Call `fn(state)` whenever any of `keys` changes; fires once immediately. */
    watch(keys, fn) {
      const wrapped = (s, prev) => {
        if (!prev || keys.some(k => !Object.is(s[k], prev[k]))) fn(s, prev);
      };
      subs.add(wrapped);
      wrapped(state, null);
      return () => subs.delete(wrapped);
    },
  };
}
