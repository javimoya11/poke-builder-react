import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Move, Pokemon } from 'pokeapi-js-wrapper';
import { getPokedex } from './getPokedex';

export interface AvailableMove {
  name: string;
  type: string | null;
}

type MoveTypeMap = Record<string, string | null>;

/**
 * Query function that fetches a batch of moves and maps each move name to
 * its elemental type name (or null if unavailable).
 * @param urls - The move resource URLs to fetch.
 * @returns A map of move name to type name.
 */
async function fetchMoveTypes(urls: string[]): Promise<MoveTypeMap> {
  if (urls.length === 0) return {};

  const pokedex = getPokedex();
  const details = (await pokedex.resource(urls)) as Move[];

  const map: MoveTypeMap = {};
  details.forEach((move) => {
    map[move.name] = move.type?.name ?? null;
  });
  return map;
}

/**
 * Hook that lists a Pokémon's available moves along with each move's type,
 * so callers can show a type icon next to the selected move.
 * @param pokemon - The Pokémon whose moves should be listed.
 * @returns The list of available moves with their type (null while loading).
 */
export const useAvailableMoves = (pokemon?: Pokemon): AvailableMove[] => {
  const moveNames = useMemo(
    () => pokemon?.moves.map((m) => m.move.name) ?? [],
    [pokemon]
  );
  const moveUrls = useMemo(
    () => pokemon?.moves.map((m) => m.move.url) ?? [],
    [pokemon]
  );

  const { data: typeByMove = {} } = useQuery({
    queryKey: ['move-types', pokemon?.id],
    queryFn: () => fetchMoveTypes(moveUrls),
    enabled: moveUrls.length > 0,
    staleTime: Infinity
  });

  return useMemo(
    () => moveNames.map((name) => ({ name, type: typeByMove[name] ?? null })),
    [moveNames, typeByMove]
  );
};
