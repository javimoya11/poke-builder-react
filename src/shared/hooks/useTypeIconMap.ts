import type { UseQueryOptions } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import type { Type } from 'pokeapi-js-wrapper';
import type { MoveTypeMap, TypeIconMap, TypeSpriteSet } from 'types';
import { getPokedex } from './getPokedex';

export const TYPE_DETAILS_KEY = ['type-details'] as const;

type TypeDetailsKey = typeof TYPE_DETAILS_KEY;

/**
 * Extracts the name-icon sprite from a Type's generation-viii sprites,
 * preferring the BDSP icon and falling back to any available set.
 * The .d.ts does not model Type sprites (only an index signature),
 * so the shape we use is narrowed locally.
 * @param detail - The Type resource returned by PokeAPI.
 * @returns The name-icon URL, or null if none is available.
 */
const iconFromSprites = (detail: Type): string | null => {
  const genViii: Record<string, TypeSpriteSet> =
    detail.sprites?.['generation-viii'] ?? {};
  return (
    genViii['brilliant-diamond-shining-pearl']?.name_icon ??
    Object.values(genViii).find((set) => set?.name_icon)?.name_icon ??
    null
  );
};

/**
 * Query function that fetches all 18 types with their full detail in one
 * batch. Shared by the icon map and the move-type map so the type list and
 * its details are only ever fetched once, no matter how many consumers ask
 * for either derived map.
 * @returns The 18 Type resources, each paired with its resource URL.
 * @throws If the type list cannot be fetched.
 */
export async function fetchTypeDetails(): Promise<
  { url: string; detail: Type }[]
> {
  const pokedex = getPokedex();

  const list = await pokedex.getTypesList({ offset: 0, limit: 18 });
  if (!list?.results) {
    throw new Error(`type list not okay`);
  }

  const urls = list.results.map((type) => type.url);
  const details = (await pokedex.resource(urls)) as Type[];

  return list.results.map((type, i) => ({ url: type.url, detail: details[i] }));
}

/**
 * Builds a map of type resource URL/name to its name-icon sprite from the
 * shared type details.
 * @returns A map keyed by type URL and name, with the icon URL (or null) as value.
 */
export function buildTypeIconMap(
  entries: { url: string; detail: Type }[]
): TypeIconMap {
  const map: TypeIconMap = {};
  entries.forEach(({ url, detail }) => {
    const icon = iconFromSprites(detail);
    map[url] = icon;
    map[detail.name] = icon;
  });
  return map;
}

/**
 * Builds a map of move name to its elemental type name from the shared type
 * details: each Type resource already lists every move of that type, so the
 * whole game's moves can be mapped without a single extra request.
 * @returns A map keyed by move name, with the type name (or null) as value.
 */
function buildMoveTypeMap(entries: { url: string; detail: Type }[]): MoveTypeMap {
  const map: MoveTypeMap = {};
  entries.forEach(({ detail }) => {
    detail.moves.forEach((move) => {
      map[move.name] = detail.name;
    });
  });
  return map;
}

type TypeIconMapQueryOptions = Omit<
  UseQueryOptions<
    { url: string; detail: Type }[],
    Error,
    TypeIconMap,
    TypeDetailsKey
  >,
  'queryKey' | 'queryFn' | 'select'
>;

/**
 * React Query hook for the type-icon map. Cached indefinitely (staleTime: Infinity).
 * Shares its underlying fetch with `useMoveTypeMap` (same query key).
 * @param options - Additional React Query options (excluding queryKey/queryFn/select).
 * @returns The React Query result for the type-icon map.
 */
export const useTypeIconMap = (options: TypeIconMapQueryOptions = {}) =>
  useQuery({
    queryKey: TYPE_DETAILS_KEY,
    queryFn: fetchTypeDetails,
    staleTime: Infinity,
    select: buildTypeIconMap,
    ...options
  });

type MoveTypeMapQueryOptions = Omit<
  UseQueryOptions<
    { url: string; detail: Type }[],
    Error,
    MoveTypeMap,
    TypeDetailsKey
  >,
  'queryKey' | 'queryFn' | 'select'
>;

/**
 * React Query hook for the move-type map (move name -> type name), derived
 * from the same 18 type details used by `useTypeIconMap`. No per-move
 * requests are made.
 * @param options - Additional React Query options (excluding queryKey/queryFn/select).
 * @returns The React Query result for the move-type map.
 */
export const useMoveTypeMap = (options: MoveTypeMapQueryOptions = {}) =>
  useQuery({
    queryKey: TYPE_DETAILS_KEY,
    queryFn: fetchTypeDetails,
    staleTime: Infinity,
    select: buildMoveTypeMap,
    ...options
  });
