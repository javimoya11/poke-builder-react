/**
 * Abilities that change how much damage their holder takes from a given
 * attacking type, as a multiplier applied on top of the type chart.
 *
 * Only type-effectiveness modifiers belong here. Abilities that reduce damage
 * without regard to type (Multiscale, Filter), that only apply to a move
 * category (Bulletproof, Soundproof, keyed on moves rather than types), or
 * that need battle state (Wonder Guard) are deliberately left out — the
 * analysis reasons about types alone.
 *
 * A 0 multiplier means an immunity (absorbed, redirected or simply ignored);
 * the reason it happens does not change the defensive outcome.
 */
export const DEFENSIVE_ABILITIES: Record<string, Record<string, number>> = {
  // Immunities
  levitate: { ground: 0 },
  'flash-fire': { fire: 0 },
  'water-absorb': { water: 0 },
  'volt-absorb': { electric: 0 },
  'lightning-rod': { electric: 0 },
  'storm-drain': { water: 0 },
  'motor-drive': { electric: 0 },
  'sap-sipper': { grass: 0 },
  'earth-eater': { ground: 0 },
  'well-baked-body': { fire: 0 },
  'dry-skin': { water: 0, fire: 1.25 },

  // Damage reductions
  'thick-fat': { fire: 0.5, ice: 0.5 },
  heatproof: { fire: 0.5 },
  'water-bubble': { fire: 0.5 },
  'purifying-salt': { ghost: 0.5 },

  // Damage increases
  fluffy: { fire: 2 }
};

/**
 * The multiplier `ability` applies against `attackingType`, or 1 when the
 * ability is irrelevant to it.
 */
export const abilityMultiplier = (
  ability: string | null | undefined,
  attackingType: string
): number => (ability ? (DEFENSIVE_ABILITIES[ability]?.[attackingType] ?? 1) : 1);

/** Whether an ability affects type effectiveness at all. */
export const isDefensiveAbility = (ability: string | null | undefined): boolean =>
  !!ability && ability in DEFENSIVE_ABILITIES;

/** The types an ability changes the effectiveness of, for tooltips. */
export const abilityAffectedTypes = (
  ability: string | null | undefined
): string[] => (ability ? Object.keys(DEFENSIVE_ABILITIES[ability] ?? {}) : []);
