import { useMemo } from 'react';
import type { Pokemon } from 'pokeapi-js-wrapper';

export interface AvailableMove {
  name: string;
}

export const useAvailableMoves = (pokemon?: Pokemon): AvailableMove[] =>
  useMemo(() => {
    if (!pokemon?.moves) return [];
    return pokemon.moves.map((m) => ({ name: m.move.name }));
  }, [pokemon]);
