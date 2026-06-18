// Words moved to front (optionally renamed)
const PREFIXES: Record<string, string> = {
  mega: 'mega',
  ultra: 'ultra',
  primal: 'primal',
  alola: 'alolan',
  galar: 'galarian',
  hisui: 'hisuian',
  paldea: 'paldean'
};
// Words replaced in-place
const REPLACEMENTS: Record<string, string> = {
  gmax: 'g-Max',
  two: '2',
  three: '3',
  m: '♂',
  f: '♀'
};
// Words removed entirely
const REMOVALS = new Set<string>([
  'striped',
  'strike',
  'mask',
  'plumage',
  'standard',
  'average',
  'breed',
  'combat',
  'ordinary',
  'male',
  'disguised',
  'amped'
]);

/**
 * Formats a raw Pokémon name into a display name: replaces hyphens with spaces,
 * moves form prefixes to the front (optionally renamed, e.g. "alola" -> "alolan"),
 * applies in-place replacements (e.g. "gmax" -> "g-Max") and drops filler words.
 * @param name - The raw Pokémon name (typically hyphenated, as returned by PokeAPI).
 * @returns The formatted, space-separated display name.
 */
export const prettify = (name: string): string => {
  const parts = name.replace(/-/g, ' ').split(' ');

  for (let i = 0; i < parts.length; i++) {
    const word = parts[i];
    if (PREFIXES[word] !== undefined) {
      parts.splice(i, 1);
      parts.unshift(PREFIXES[word]);
    } else if (REPLACEMENTS[word] !== undefined) {
      parts[i] = REPLACEMENTS[word];
    } else if (REMOVALS.has(word)) {
      parts.splice(i--, 1);
    }
  }

  return parts.join(' ');
};
