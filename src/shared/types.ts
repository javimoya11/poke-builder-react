export interface Variety {
  name: string;
  id?: string;
  isDefault: boolean;
}

export interface SpeciesData {
  name: string;
  varieties: Variety[];
  /** Chance of being female, in eighths; or -1 for genderless (PokeAPI gender_rate). */
  genderRate: number;
}

export type TypeIconMap = Record<string, string | null>;
export type MoveTypeMap = Record<string, string | null>;

export interface TypeSpriteSet {
  name_icon?: string | null;
}

export interface CachedImageOptions {
  format?: string;
  quality?: number;
  blur?: number;
}
