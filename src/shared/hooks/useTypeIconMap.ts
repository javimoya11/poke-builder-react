import type { UseQueryOptions } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import type { Type } from 'pokeapi-js-wrapper';
import type { TypeIconMap, TypeSpriteSet } from 'types';
import getPokedex from './getPokedex';

export const TYPE_ICON_MAP_KEY = ['type-icon-map'] as const;

type TypeIconMapKey = typeof TYPE_ICON_MAP_KEY;

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
 * Query function that builds a map of type resource URL to its name-icon sprite,
 * fetching all 18 types and their details in batch.
 * @returns A map keyed by type URL, with the icon URL (or null) as value.
 * @throws If the type list cannot be fetched.
 */
export async function fetchTypeIconMap(): Promise<TypeIconMap> {
  const pokedex = getPokedex();

  const list = await pokedex.getTypesList({ offset: 0, limit: 18 });
  if (!list?.results) {
    throw new Error(`type list not okay`);
  }

  const urls = list.results.map((type) => type.url);
  const details = (await pokedex.resource(urls)) as Type[];

  const map: TypeIconMap = {};
  urls.forEach((url, i) => {
    map[url] = iconFromSprites(details[i]);
  });
  return map;
}

type TypeIconMapQueryOptions = Omit<
  UseQueryOptions<TypeIconMap, Error, TypeIconMap, TypeIconMapKey>,
  'queryKey' | 'queryFn'
>;

/**
 * React Query hook for the type-icon map. Cached indefinitely (staleTime: Infinity).
 * @param options - Additional React Query options (excluding queryKey/queryFn).
 * @returns The React Query result for the type-icon map.
 */
export const useTypeIconMap = (options: TypeIconMapQueryOptions = {}) =>
  useQuery({
    queryKey: TYPE_ICON_MAP_KEY,
    queryFn: fetchTypeIconMap,
    staleTime: Infinity,
    ...options
  });
