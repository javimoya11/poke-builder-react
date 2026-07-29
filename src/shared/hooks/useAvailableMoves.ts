import type { QueryFunctionContext, UseQueryOptions } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import type { Pokemon } from 'pokeapi-js-wrapper';
import { getPokedex } from './getPokedex';

export interface AvailableMove {
  name: string;
  type: string | null;
  power: number | null;
  damageClass: string | null;
}

export const availableMovesQueryKey = (moveUrls: string[]) =>
  ['available-moves', { moveUrls }] as const;

type AvailableMovesQueryKey = ReturnType<typeof availableMovesQueryKey>;

/**
 * Query function that fetches each move's full detail (type, power, damage
 * class) in one batch, keeping the original move order.
 * @param context - React Query context carrying the query key.
 * @returns The list of available moves with their type, power and damage class.
 */
async function fetchAvailableMoves({
  queryKey
}: QueryFunctionContext<AvailableMovesQueryKey>): Promise<AvailableMove[]> {
  const [, { moveUrls }] = queryKey;
  if (!moveUrls.length) return [];

  const pokedex = getPokedex();
  const details = await pokedex.resource(moveUrls);
  const moveList = (Array.isArray(details) ? details : [details]) as {
    name: string;
    type: { name: string } | null;
    power: number | null;
    damage_class: { name: string } | null;
  }[];

  return moveList.map((move) => ({
    name: move.name,
    type: move.type?.name ?? null,
    power: move.power ?? null,
    damageClass: move.damage_class?.name ?? null
  }));
}

type AvailableMovesQueryOptions = Omit<
  UseQueryOptions<
    AvailableMove[],
    Error,
    AvailableMove[],
    AvailableMovesQueryKey
  >,
  'queryKey' | 'queryFn' | 'enabled'
>;

/**
 * Hook that lists a Pokémon's available moves along with each move's type,
 * power and damage class (physical/special/status), so callers can show
 * that detail next to each move option. Cached per move URL set, and each
 * underlying move detail is cached indefinitely by the shared Pokedex
 * client, so moves shared across Pokémon are only ever fetched once.
 * @param pokemon - The Pokémon whose moves should be listed.
 * @param options - Additional React Query options (excluding queryKey/queryFn/enabled).
 * @returns The list of available moves (empty while loading or without a Pokémon).
 */
export const useAvailableMoves = (
  pokemon?: Pokemon,
  options: AvailableMovesQueryOptions = {}
): AvailableMove[] => {
  const moveUrls = pokemon?.moves.map((m) => m.move.url) ?? [];

  const { data = [] } = useQuery({
    queryKey: availableMovesQueryKey(moveUrls),
    queryFn: fetchAvailableMoves,
    enabled: moveUrls.length > 0,
    staleTime: Infinity,
    ...options
  });

  return data;
};
