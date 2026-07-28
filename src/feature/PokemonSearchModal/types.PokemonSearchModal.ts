import type { Pokemon } from 'pokeapi-js-wrapper';

export interface IPokemonSearchModal {
  open: boolean;
  onClose: () => void;
  /** Called once the chosen Pokémon has been resolved from the API. */
  onAccept: (pokemon: Pokemon) => void;
}

export const MAX_SUGGESTIONS = 5;
