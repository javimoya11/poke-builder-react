import { useMemo } from 'react';
import type { Pokemon } from 'pokeapi-js-wrapper';
import { useMoveTypeMap } from './useTypeIconMap';

export interface AvailableMove {
  name: string;
  type: string | null;
}

/**
 * Hook that lists a Pokémon's available moves along with each move's type,
 * so callers can show a type icon next to the selected move. The move->type
 * lookup reuses the shared type-details query (18 requests total, made once
 * for the whole app) instead of fetching each move individually.
 * @param pokemon - The Pokémon whose moves should be listed.
 * @returns The list of available moves with their type (null while loading).
 */
export const useAvailableMoves = (pokemon?: Pokemon): AvailableMove[] => {
  const moveNames = useMemo(
    () => pokemon?.moves.map((m) => m.move.name) ?? [],
    [pokemon]
  );

  const { data: typeByMove = {} } = useMoveTypeMap();

  return useMemo(
    () => moveNames.map((name) => ({ name, type: typeByMove[name] ?? null })),
    [moveNames, typeByMove]
  );
};
