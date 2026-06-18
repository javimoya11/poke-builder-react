// --- useSpecies ---
export interface Variety {
  name: string;
  id?: string;
  isDefault: boolean;
}

export interface SpeciesData {
  name: string;
  varieties: Variety[];
}

// --- useTypeIconMap ---
export type TypeIconMap = Record<string, string | null>;

export interface TypeSpriteSet {
  name_icon?: string | null;
}

// --- cachedImage (utils) ---
export interface CachedImageOptions {
  format?: string;
  quality?: number;
  blur?: number;
}
