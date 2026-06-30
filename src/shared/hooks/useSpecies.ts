import type {
  QueryFunctionContext,
  UseQueryOptions
} from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import type { SpeciesData, Variety } from 'types';
import { idFromUrl } from 'utils/idFromUrl';
import { getPokedex } from './getPokedex';

/**
 * Builds the React Query key for a Pokémon species.
 * @param id - The species ID (name or numeric id as a string).
 * @returns A stable, readonly query key tuple.
 */
export const speciesQueryKey = (id?: string) => ['species', { id }] as const;

type SpeciesQueryKey = ReturnType<typeof speciesQueryKey>;

/**
 * Query function that fetches a Pokémon species and maps its varieties into a
 * simplified shape, sorted with the default variety first.
 * @param context - React Query context carrying the query key.
 * @returns The species name and its mapped, sorted varieties.
 * @throws If the ID is missing or the species cannot be found.
 */
export async function fetchSpecies({
  queryKey
}: QueryFunctionContext<SpeciesQueryKey>): Promise<SpeciesData> {
  const [, { id }] = queryKey;

  if (!id) {
    throw new Error(`species search not okay`);
  }

  const pokedex = getPokedex();
  const species = await pokedex.getPokemonSpeciesByName(id);

  if (!species?.varieties) {
    throw new Error(`species search not okay`);
  }

  const varieties: Variety[] = species.varieties.map((v) => ({
    name: v.pokemon.name,
    id: idFromUrl(v.pokemon.url),
    isDefault: v.is_default
  }));

  varieties.sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));

  return { name: species.name, varieties };
}

type SpeciesQueryOptions = Omit<
  UseQueryOptions<SpeciesData, Error, SpeciesData, SpeciesQueryKey>,
  'queryKey' | 'queryFn'
>;

/**
 * React Query hook for a Pokémon species. Cached indefinitely (staleTime: Infinity).
 * @param id - The species ID (name or numeric id as a string).
 * @param options - Additional React Query options (excluding queryKey/queryFn).
 * @returns The React Query result for the species.
 */
export const useSpecies = (id?: string, options: SpeciesQueryOptions = {}) =>
  useQuery({
    queryKey: speciesQueryKey(id),
    queryFn: fetchSpecies,
    staleTime: Infinity,
    ...options
  });
