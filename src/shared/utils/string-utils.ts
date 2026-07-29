const PREFIXES: Record<string, string> = {
  mega: 'mega',
  ultra: 'ultra',
  primal: 'primal',
  alola: 'alolan',
  galar: 'galarian',
  hisui: 'hisuian',
  paldea: 'paldean'
};
const REPLACEMENTS: Record<string, string> = {
  gmax: 'g-Max',
  two: '2',
  three: '3',
  m: '♂',
  f: '♀'
};
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

  return parts
    .join(' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

export const prettifyItem = (name: string): string =>
  name
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());

const DAMAGE_CLASS_ABBR: Record<string, string> = {
  physical: 'Phy',
  special: 'Spe',
  status: 'Sta'
};

/**
 * Formats a move's type/power/damage-class as a "(Type/Power/Cat)" suffix
 * for display next to the move name, e.g. "(Fire/90/Spe)" or "(Normal/-/Sta)"
 * for status moves, which have no power.
 * @param type - The move's elemental type name, or null if unknown.
 * @param power - The move's base power, or null (status moves have none).
 * @param damageClass - The move's damage class ('physical' | 'special' | 'status'), or null if unknown.
 * @returns The formatted suffix, or an empty string if any detail is missing.
 */
export const formatMoveSuffix = (
  type: string | null,
  power: number | null,
  damageClass: string | null
): string => {
  if (!type || !damageClass) return '';
  const abbr = DAMAGE_CLASS_ABBR[damageClass] ?? damageClass;
  return ` (${prettifyItem(type)}/${power ?? '-'}/${abbr})`;
};
